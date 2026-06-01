"use client";

import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import type { MaintenanceTicket, CreateTicketInput, TicketImpactConfig } from "@/lib/backend-api";
import { createTicket, fetchAssetHierarchy, fetchTicketImpactConfig } from "@/lib/backend-api";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { SectionCards } from "@/components/section-cards";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AssetExplorerPicker, findExplorerNodeById, type ExplorerNode } from "@/components/assets/AssetExplorerPicker";
import type { AssetHierarchyNode } from "@/lib/db/queries/assets";
import type { TicketListFilters } from "@/lib/server/operations-records";
import TicketFilters from "./TicketFilters";

type Props = {
  tickets: MaintenanceTicket[];
  filters: TicketListFilters;
  activeFilterCount: number;
  initialModalOpen?: boolean;
};

const PRIORITY_OPTIONS = ["low", "medium", "high", "critical"];
const IMPACT_OPTIONS = ["low", "medium", "high", "critical"];
const fieldClassName =
  "mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground shadow-sm outline-none transition-colors focus-visible:ring-1 focus-visible:ring-ring";
const BADGE_STYLES = {
  flagged: "border-amber-300 bg-amber-50 text-amber-800",
  clear: "border-emerald-300 bg-emerald-50 text-emerald-800",
} as const;

export default function TicketsClient({
  tickets,
  filters,
  activeFilterCount,
  initialModalOpen = false,
}: Props) {
  const { data: session } = useSession();
  const [isModalOpen, setIsModalOpen] = useState(initialModalOpen);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [assetHierarchy, setAssetHierarchy] = useState<AssetHierarchyNode[]>([]);
  const [assetsLoading, setAssetsLoading] = useState(false);
  const [assetsError, setAssetsError] = useState<string | null>(null);
  const [selectedAssetId, setSelectedAssetId] = useState<string | null>(null);
  const [impactConfig, setImpactConfig] = useState<TicketImpactConfig | null>(null);

  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isModalOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isModalOpen]);

  const [form, setForm] = useState<CreateTicketInput>({
    equipmentName: "",
    location: "",
    issueDescription: "",
    priority: "medium",
    impact: "medium",
  });

  const selectedAsset = useMemo(
    () => findExplorerNodeById(
      assetHierarchy.map(
        (node): ExplorerNode => ({
          ...node,
          nodeType: node.type,
          children: node.children as ExplorerNode[],
        }),
      ),
      selectedAssetId,
    ),
    [assetHierarchy, selectedAssetId]
  );

  useEffect(() => {
    if (!session?.user?.accessToken) return;
    let active = true;

    const loadAssets = async () => {
      setAssetsLoading(true);
      setAssetsError(null);

      try {
        const assets = await fetchAssetHierarchy(session.user.accessToken);

        if (active) {
          setAssetHierarchy(assets);
        }
      } catch (loadError) {
        if (active) {
          setAssetsError(loadError instanceof Error ? loadError.message : "Unable to load assets.");
        }
      } finally {
        if (active) {
          setAssetsLoading(false);
        }
      }
    };

    const loadImpactConfig = async () => {
      try {
        const config = await fetchTicketImpactConfig(session.user.accessToken);
        if (active) {
          setImpactConfig(config);
        }
      } catch (loadError) {
        console.error("Unable to load impact config for ticket modal:", loadError);
        if (active) {
          setImpactConfig(null);
        }
      }
    };

    void loadAssets();
    void loadImpactConfig();

    return () => {
      active = false;
    };
  }, [session?.user?.accessToken]);

  const handleAssetSelect = (asset: NonNullable<typeof selectedAsset>) => {
    setSelectedAssetId(asset.id);
    setForm((prev) => ({
      ...prev,
      equipmentName: asset.name,
      location: asset.location ? asset.location : prev.location,
    }));
  };

  const clearAssetSelection = () => {
    setSelectedAssetId(null);
    setForm((prev) => ({ ...prev, equipmentName: "" }));
  };

  const stats = useMemo(() => {
    const open = tickets.filter((ticket) => ticket.status === "open").length;
    const critical = tickets.filter((ticket) => ticket.priority === "critical").length;
    const flagged = tickets.filter((ticket) => ticket.requiresRca).length;
    return { total: tickets.length, open, critical, flagged };
  }, [tickets]);

  const impactPreview = useMemo(() => {
    if (!impactConfig) {
      return null;
    }

    const score =
      (impactConfig.priorityWeights[form.priority] ?? 0) +
      (impactConfig.impactWeights[form.impact] ?? 0);
    const requiresRca =
      (impactConfig.autoFlagCritical && (form.priority === "critical" || form.impact === "critical")) ||
      score >= impactConfig.rcaThreshold;

    const reason = requiresRca
      ? form.priority === "critical" || form.impact === "critical"
        ? "Critical priority or impact automatically triggers RCA."
        : `Score ${score} meets the RCA threshold of ${impactConfig.rcaThreshold}.`
      : `Score ${score} is below the RCA threshold of ${impactConfig.rcaThreshold}.`;

    return { score, requiresRca, reason };
  }, [form.impact, form.priority, impactConfig]);

  const formatDate = (value?: string) => {
    if (!value) return "";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "";
    return date.toISOString().slice(0, 10);
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!session?.user?.accessToken) {
      setError("You must be signed in.");
      return;
    }

    if (!form.equipmentName.trim() || !form.location.trim() || !form.issueDescription.trim()) {
      setError("Asset, location, and issue description are required.");
      return;
    }

    startTransition(async () => {
      const created = await createTicket(session.user.accessToken, {
        ...form,
        equipmentName: form.equipmentName.trim(),
        location: form.location.trim(),
        issueDescription: form.issueDescription.trim(),
      });

      if (!created) {
        setError("Failed to create ticket. Please try again.");
        return;
      }

      window.location.reload();
    });
  };

  return (
    <>
      <AppShell
        title="CMMS Tickets"
        user={{
          name: session?.user?.email?.split("@")[0] || "Operator",
          email: session?.user?.email || "",
          role: session?.user?.role,
        }}
        actions={
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-xs font-medium text-primary-foreground hover:bg-primary/90"
            >
              New Ticket
            </button>
            <Link
              href="/"
              className="inline-flex items-center justify-center rounded-md border border-border px-4 py-2 text-xs font-medium text-foreground hover:bg-accent"
            >
              Dashboard
            </Link>
          </div>
        }
      >
        <SectionCards
          items={[
            { label: "Total Tickets", value: String(stats.total), description: "All corrective tickets logged." },
            { label: "Open Tickets", value: String(stats.open), description: "Currently in progress." },
            { label: "Critical Priority", value: String(stats.critical), description: "Needs immediate attention." },
            { label: "RCA Flagged", value: String(stats.flagged), description: "Tickets that require formal RCA." },
          ]}
        />

        <TicketFilters filters={filters} activeFilterCount={activeFilterCount} />

        <Card>
          <CardHeader>
            <CardTitle>Recent Tickets</CardTitle>
          </CardHeader>
          <CardContent className="px-0">
            {tickets.length === 0 ? (
              <div className="px-6 pb-6 text-sm text-muted-foreground">
                {activeFilterCount > 0
                  ? "No tickets matched the selected filters."
                  : "No maintenance tickets yet. Create the first ticket to get started."}
              </div>
            ) : (
              <div className="overflow-x-auto px-6 pb-6">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-left text-xs uppercase tracking-wide text-muted-foreground">
                      <th className="py-2 pr-4">Ticket #</th>
                      <th className="py-2 pr-4">Equipment</th>
                      <th className="py-2 pr-4">Location</th>
                      <th className="py-2 pr-4">Priority</th>
                      <th className="py-2 pr-4">Impact Score</th>
                      <th className="py-2 pr-4">RCA</th>
                      <th className="py-2 pr-4">Linked RCAs</th>
                      <th className="py-2 pr-4">Status</th>
                      <th className="py-2">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tickets.map((ticket) => (
                      <tr key={ticket.id} className="border-b last:border-b-0">
                        <td className="py-3 pr-4 font-medium text-foreground">
                          <Link className="hover:underline" href={`/tickets/${ticket.id}`}>
                            {ticket.ticketNumber}
                          </Link>
                        </td>
                        <td className="py-3 pr-4 text-muted-foreground">{ticket.equipmentName}</td>
                        <td className="py-3 pr-4 text-muted-foreground">{ticket.location}</td>
                        <td className="py-3 pr-4 text-muted-foreground capitalize">{ticket.priority}</td>
                        <td className="py-3 pr-4 text-muted-foreground">{ticket.impactScore}</td>
                        <td className="py-3 pr-4">
                          <span
                            className={`inline-flex rounded-full border px-2 py-1 text-xs font-medium ${
                              ticket.requiresRca ? BADGE_STYLES.flagged : BADGE_STYLES.clear
                            }`}
                            title={ticket.rcaRequiredReason ?? undefined}
                          >
                            {ticket.requiresRca ? "Required" : "Not required"}
                          </span>
                        </td>
                        <td className="py-3 pr-4 text-muted-foreground">
                          {ticket.rcas?.length ? (
                            <div className="space-y-1">
                              {ticket.rcas.slice(0, 2).map((rca) => (
                                <div key={rca.id}>
                                  <Link className="hover:underline" href={`/rca/${rca.id}`}>
                                    {rca.rcaNumber}
                                  </Link>
                                </div>
                              ))}
                              {ticket.rcas.length > 2 ? (
                                <div className="text-xs text-muted-foreground">
                                  +{ticket.rcas.length - 2} more
                                </div>
                              ) : null}
                            </div>
                          ) : (
                            <span className="text-xs text-muted-foreground">None linked</span>
                          )}
                        </td>
                        <td className="py-3 text-muted-foreground capitalize">{ticket.status.replace("_", " ")}</td>
                        <td className="py-3">
                          {ticket.requiresRca ? (
                            <Link
                              href={`/rca/new?ticketId=${ticket.id}`}
                              className="inline-flex items-center rounded-md border border-amber-300 bg-amber-50 px-3 py-1 text-xs font-medium text-amber-900 transition-colors hover:bg-amber-100"
                            >
                              {ticket.rcas?.length ? "Link another RCA" : "Create RCA"}
                            </Link>
                          ) : (
                            <span className="text-xs text-muted-foreground">Not needed</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </AppShell>

      {isModalOpen && (
        <div ref={modalRef} className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-slate-900/40 px-4 py-8">
          <button
            type="button"
            className="fixed inset-0 h-full w-full cursor-default"
            aria-label="Close modal overlay"
            onClick={() => setIsModalOpen(false)}
          />
          <div className="relative w-full max-w-2xl rounded-2xl border border-border bg-card text-card-foreground shadow-xl my-auto">
            <div className="flex items-center justify-between border-b border-border px-6 py-4">
              <div>
                <h3 className="text-lg font-semibold">New Maintenance Ticket</h3>
                <p className="text-sm text-muted-foreground">
                  Capture the equipment issue and impact.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="rounded-full border border-border px-3 py-1 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
              >
                Close
              </button>
            </div>
            <form className="space-y-4 px-6 pb-6" onSubmit={onSubmit}>
              {error && (
                <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                  {error}
                </div>
              )}

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="block text-sm font-medium text-foreground">Asset</span>
                  {selectedAssetId ? (
                    <button
                      type="button"
                      onClick={clearAssetSelection}
                      className="text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
                    >
                      Clear
                    </button>
                  ) : null}
                </div>
                <div className="rounded-md border border-border bg-muted/40 px-3 py-2 text-sm">
                  <div className="font-medium text-foreground">
                    {selectedAsset ? `${selectedAsset.name} (${selectedAsset.id})` : "No equipment selected"}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Browse the tree like a file explorer. Select an equipment node to attach this ticket.
                  </div>
                </div>
                <div className="max-h-72 overflow-y-auto rounded-md border border-border bg-background p-2">
                  {assetsLoading ? (
                    <p className="px-2 py-3 text-sm text-muted-foreground">Loading assets...</p>
                  ) : assetsError ? (
                    <p className="px-2 py-3 text-sm text-red-600">{assetsError}</p>
                  ) : (
                    <AssetExplorerPicker
                      hierarchy={assetHierarchy}
                      selectedId={selectedAssetId}
                      onSelect={handleAssetSelect}
                    />
                  )}
                </div>
              </div>

              <div>
                <Label htmlFor="location">
                  Location
                </Label>
                <Input
                  id="location"
                  type="text"
                  className={fieldClassName}
                  value={form.location}
                  onChange={(e) => setForm((prev) => ({ ...prev, location: e.target.value }))}
                />
              </div>

              <div>
                <Label htmlFor="issueDescription">
                  Issue Description
                </Label>
                <textarea
                  id="issueDescription"
                  rows={4}
                  className={fieldClassName}
                  value={form.issueDescription}
                  onChange={(e) => setForm((prev) => ({ ...prev, issueDescription: e.target.value }))}
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor="priority">
                    Priority
                  </Label>
                  <select
                    id="priority"
                    className={fieldClassName}
                    value={form.priority}
                    onChange={(e) => setForm((prev) => ({ ...prev, priority: e.target.value }))}
                  >
                    {PRIORITY_OPTIONS.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <Label htmlFor="impact">
                    Impact
                  </Label>
                  <select
                    id="impact"
                    className={fieldClassName}
                    value={form.impact}
                    onChange={(e) => setForm((prev) => ({ ...prev, impact: e.target.value }))}
                  >
                    {IMPACT_OPTIONS.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {impactPreview ? (
                <div className="rounded-xl border border-border bg-muted/40 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-medium text-foreground">Impact scoring preview</p>
                      <p className="text-xs text-muted-foreground">{impactPreview.reason}</p>
                    </div>
                    <span
                      className={`inline-flex rounded-full border px-3 py-1 text-xs font-medium ${
                        impactPreview.requiresRca ? BADGE_STYLES.flagged : BADGE_STYLES.clear
                      }`}
                    >
                      Score {impactPreview.score}
                    </span>
                  </div>
                </div>
              ) : null}

              <button
                type="submit"
                disabled={isPending}
                className="w-full rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isPending ? "Creating..." : "Create Ticket"}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
