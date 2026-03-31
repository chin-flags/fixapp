"use client";

import Link from "next/link";
import type { RcaDashboardSummary } from "@/lib/backend-api";
import { AppShell } from "@/components/app-shell";
import { SectionCards } from "@/components/section-cards";
import { ChartAreaInteractive } from "@/components/chart-area-interactive";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

type Props = {
  summary: RcaDashboardSummary;
  userEmail: string;
  userRole: string;
};

function formatDate(value?: string | Date | null) {
  if (!value) {
    return "—";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatStatus(value: string) {
  return value
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export default function DashboardClient({ summary, userEmail, userRole }: Props) {
  return (
    <AppShell
      title=""
      user={{ name: userEmail.split("@")[0], email: userEmail, role: userRole }}
      actions={
        <Link
          href="/rca/new"
          className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-xs font-medium text-primary-foreground hover:bg-primary/90"
        >
          New RCA
        </Link>
      }
    >
      <div className="space-y-6 px-4 lg:px-6">
        <Card className="border-border/70">
          <CardHeader>
            <Badge variant="outline" className="w-fit">{summary.scopeLabel}</Badge>
            <CardTitle className="text-2xl">RCA dashboard</CardTitle>
            <CardDescription className="max-w-3xl text-sm">
              Current RCA workload and recent activity for the records visible to your role.
            </CardDescription>
          </CardHeader>
        </Card>

        <SectionCards
          items={[
            {
              label: "Visible RCAs",
              value: String(summary.totals.visibleRcas),
              description: "Records included in this dashboard scope.",
            },
            {
              label: "Open RCAs",
              value: String(summary.totals.openRcas),
              description: "Still being investigated or worked.",
            },
            {
              label: "Pending Approvals",
              value: String(summary.totals.pendingApprovals),
              description: "Solutions waiting for approval.",
            },
            {
              label: "Overdue Actions",
              value: String(summary.totals.overdueSolutions),
              description: "Corrective actions that are already past due.",
            },
          ]}
        />

        <div className="grid gap-4">
          <ChartAreaInteractive data={summary.throughput} />
        </div>

        <div className="grid gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent RCAs</CardTitle>
              <CardDescription>
                Latest activity in your dashboard scope, including collaboration and action counts.
              </CardDescription>
            </CardHeader>
            <CardContent className="overflow-x-auto">
              {summary.recentRcas.length === 0 ? (
                <div className="py-4 text-sm text-muted-foreground">No RCAs are visible in this scope yet.</div>
              ) : (
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-left text-xs uppercase tracking-wide text-muted-foreground">
                      <th className="py-2 pr-4">RCA</th>
                      <th className="py-2 pr-4">Status</th>
                      <th className="py-2 pr-4">Owner</th>
                      <th className="py-2 pr-4">Signals</th>
                      <th className="py-2">Updated</th>
                    </tr>
                  </thead>
                  <tbody>
                    {summary.recentRcas.map((rca) => (
                      <tr key={rca.id} className="border-b last:border-b-0">
                        <td className="py-3 pr-4 align-top">
                          <Link className="font-medium hover:underline" href={`/rca/${rca.id}`}>
                            {rca.rcaNumber}
                          </Link>
                          <div className="mt-1 text-muted-foreground">{rca.title}</div>
                          <div className="mt-1 text-xs text-muted-foreground">
                            {rca.location || "Unknown location"} • {rca.ageDays}d old
                          </div>
                        </td>
                        <td className="py-3 pr-4 align-top">
                          <Badge variant="secondary">{formatStatus(rca.status || "unknown")}</Badge>
                        </td>
                        <td className="py-3 pr-4 align-top text-muted-foreground">
                          {rca.owner?.name || "Unassigned"}
                        </td>
                        <td className="py-3 pr-4 align-top text-muted-foreground">
                          <div>{rca.solutionCount} actions</div>
                          <div>{rca.pendingSolutionCount} pending</div>
                          <div>{rca.teamMemberCount} teammates</div>
                          <div>{rca.commentCount} comments</div>
                        </td>
                        <td className="py-3 align-top text-muted-foreground">
                          {formatDate(rca.updatedAt || rca.createdAt)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}
