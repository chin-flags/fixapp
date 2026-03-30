import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth/config";
import { fetchRCAs, type RCARow, type RcaListFilters } from "@/lib/backend-api";
import { AppShell } from "@/components/app-shell";
import { SectionCards } from "@/components/section-cards";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { buildBackendProxyUrl } from "@/lib/backend-endpoints";

type SearchParamValue = string | string[] | undefined;
type PageProps = {
  searchParams?: Promise<Record<string, SearchParamValue>>;
};

type OwnerOption = {
  id: string;
  name: string;
  email: string;
};

function getSingleValue(value: SearchParamValue) {
  return Array.isArray(value) ? value[0] : value;
}

function formatDate(value?: string | Date | null) {
  if (!value) {
    return "—";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return date.toISOString().slice(0, 10);
}

function formatStatus(value?: string | null) {
  if (!value) {
    return "Unknown";
  }

  return value
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function buildFilters(searchParams: Record<string, SearchParamValue>): RcaListFilters {
  return {
    q: getSingleValue(searchParams.q) || undefined,
    status: getSingleValue(searchParams.status) || undefined,
    location: getSingleValue(searchParams.location) || undefined,
    equipment: getSingleValue(searchParams.equipment) || undefined,
    assignee: getSingleValue(searchParams.assignee) || undefined,
    createdFrom: getSingleValue(searchParams.createdFrom) || undefined,
    createdTo: getSingleValue(searchParams.createdTo) || undefined,
    limit: 100,
  };
}

export default async function RcaIndexPage({ searchParams }: PageProps) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  if (!session.user.accessToken || !session.user.tenantId) {
    redirect("/login?callbackUrl=/rca");
  }

  const resolvedSearchParams = searchParams ? await searchParams : {};
  const filters = buildFilters(resolvedSearchParams);
  const [rcaRows, metadataRes] = await Promise.all([
    fetchRCAs(session.user.accessToken, session.user.tenantId, filters),
    fetch(buildBackendProxyUrl("/rcas/metadata"), {
      headers: {
        Authorization: `Bearer ${session.user.accessToken}`,
      },
      cache: "no-store",
    }),
  ]);

  if (metadataRes.status === 401 || metadataRes.status === 403) {
    redirect("/login?callbackUrl=/rca");
  }

  let owners: OwnerOption[] = [];
  if (metadataRes.ok) {
    const metadata = await metadataRes.json();
    owners = metadata.owners ?? [];
  }

  const total = rcaRows.length;
  const open = rcaRows.filter((rca) => (rca.status || "").toLowerCase() === "open").length;
  const unassigned = rcaRows.filter((rca) => !rca.owner).length;
  const activeFilterCount = Object.entries(filters).filter(([key, value]) => key !== "limit" && value).length;

  return (
    <AppShell
      title="RCAs"
      user={{
        name: session.user.email?.split("@")[0] || "User",
        email: session.user.email || "",
        role: session.user.role,
      }}
      actions={
        <div className="flex items-center gap-2">
          <Link
            href="/rca/new"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-xs font-medium text-primary-foreground hover:bg-primary/90"
          >
            New RCA
          </Link>
        </div>
      }
    >
      <SectionCards
        items={[
          {
            label: "Visible RCAs",
            value: String(total),
            description: "Filtered to your current role access.",
          },
          {
            label: "Open",
            value: String(open),
            description: "Still under investigation.",
          },
          {
            label: "Unassigned",
            value: String(unassigned),
            description: "Needs an RCA owner.",
          },
          {
            label: "Active Filters",
            value: String(activeFilterCount),
            description: activeFilterCount > 0 ? "Current search constraints." : "Showing the default view.",
          },
        ]}
      />

      <Card>
        <CardHeader>
          <CardTitle>Search and Filters</CardTitle>
          <CardDescription>
            Narrow RCA records by text, status, equipment, location, created date, and assigned owner.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="grid gap-4 md:grid-cols-2 xl:grid-cols-4" method="GET">
            <div className="space-y-2 xl:col-span-2">
              <label className="text-sm font-medium text-foreground" htmlFor="q">
                Search
              </label>
              <input
                id="q"
                name="q"
                defaultValue={filters.q ?? ""}
                placeholder="RCA #, title, description, equipment, or location"
                className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground" htmlFor="status">
                Status
              </label>
              <select
                id="status"
                name="status"
                defaultValue={filters.status ?? ""}
                className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                <option value="">All statuses</option>
                <option value="open">Open</option>
                <option value="in_progress">In Progress</option>
                <option value="closed">Closed</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground" htmlFor="assignee">
                Assignee
              </label>
              <select
                id="assignee"
                name="assignee"
                defaultValue={filters.assignee ?? ""}
                className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                <option value="">All assignees</option>
                <option value="unassigned">Unassigned</option>
                {owners.map((owner) => (
                  <option key={owner.id} value={owner.id}>
                    {owner.name} ({owner.email})
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground" htmlFor="equipment">
                Equipment
              </label>
              <input
                id="equipment"
                name="equipment"
                defaultValue={filters.equipment ?? ""}
                placeholder="Pump, conveyor, compressor..."
                className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground" htmlFor="location">
                Location
              </label>
              <input
                id="location"
                name="location"
                defaultValue={filters.location ?? ""}
                placeholder="Plant, line, or area"
                className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground" htmlFor="createdFrom">
                Created from
              </label>
              <input
                id="createdFrom"
                name="createdFrom"
                type="date"
                defaultValue={filters.createdFrom ?? ""}
                className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground" htmlFor="createdTo">
                Created to
              </label>
              <input
                id="createdTo"
                name="createdTo"
                type="date"
                defaultValue={filters.createdTo ?? ""}
                className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              />
            </div>

            <div className="flex items-end gap-2 xl:col-span-4">
              <button
                type="submit"
                className="inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90"
              >
                Apply filters
              </button>
              <Link
                href="/rca"
                className="inline-flex h-9 items-center justify-center rounded-md border border-input px-4 text-sm font-medium text-foreground hover:bg-accent"
              >
                Reset
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>RCA Results</CardTitle>
          <CardDescription>
            {activeFilterCount > 0
              ? `${total} RCA${total === 1 ? "" : "s"} matched the current filters.`
              : "Latest RCA records visible to your role."}
          </CardDescription>
        </CardHeader>
        <CardContent className="px-0">
          {rcaRows.length === 0 ? (
            <div className="px-6 pb-6 text-sm text-muted-foreground">
              No RCAs matched the selected filters.
            </div>
          ) : (
            <div className="overflow-x-auto px-6 pb-6">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-xs uppercase tracking-wide text-muted-foreground">
                    <th className="py-2 pr-4">RCA #</th>
                    <th className="py-2 pr-4">Title</th>
                    <th className="py-2 pr-4">Equipment</th>
                    <th className="py-2 pr-4">Location</th>
                    <th className="py-2 pr-4">Assignee</th>
                    <th className="py-2 pr-4">Status</th>
                    <th className="py-2">Created</th>
                  </tr>
                </thead>
                <tbody>
                  {rcaRows.map((rca: RCARow) => (
                    <tr key={rca.id} className="border-b last:border-b-0">
                      <td className="py-3 pr-4 font-medium text-foreground">
                        <Link className="hover:underline" href={`/rca/${rca.id}`}>
                          {rca.rcaNumber}
                        </Link>
                      </td>
                      <td className="py-3 pr-4 text-muted-foreground">{rca.title}</td>
                      <td className="py-3 pr-4 text-muted-foreground">{rca.equipmentName || "—"}</td>
                      <td className="py-3 pr-4 text-muted-foreground">{rca.location || "—"}</td>
                      <td className="py-3 pr-4 text-muted-foreground">
                        {rca.owner ? `${rca.owner.name} (${rca.owner.email})` : "Unassigned"}
                      </td>
                      <td className="py-3 pr-4 text-muted-foreground">{formatStatus(rca.status)}</td>
                      <td className="py-3 text-muted-foreground">{formatDate(rca.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </AppShell>
  );
}
