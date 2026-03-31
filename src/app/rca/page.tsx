import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth/config";
import { type RCARow, type RcaListFilters } from "@/lib/backend-api";
import { AppShell } from "@/components/app-shell";
import { SectionCards } from "@/components/section-cards";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { listRcaOwnerOptions, listRcasForTenantUser } from "@/lib/server/operations-records";
import RcaFilters from "./RcaFilters";

type SearchParamValue = string | string[] | undefined;
type PageProps = {
  searchParams?: Promise<Record<string, SearchParamValue>>;
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
  const [rcaRows, owners] = await Promise.all([
    listRcasForTenantUser(
      {
        id: session.user.id,
        tenantId: session.user.tenantId,
        role: session.user.role,
      },
      filters,
    ),
    listRcaOwnerOptions(session.user.tenantId),
  ]);

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

      <RcaFilters filters={filters} owners={owners} activeFilterCount={activeFilterCount} />

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
              {activeFilterCount > 0 ? "No RCAs matched the selected filters." : "No RCA records are available yet."}
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
