"use client";

import Link from "next/link";
import { AlertTriangle, CheckCircle2, Clock3, Radar, ShieldAlert } from "lucide-react";
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

function formatDays(value: number | null, fallback: string) {
  return value === null ? fallback : `${value}d`;
}

export default function DashboardClient({ summary, userEmail, userRole }: Props) {
  const topBottleneck = summary.bottlenecks[0];

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
        <Card className="overflow-hidden border-border/70 bg-gradient-to-r from-card via-card to-primary/5">
          <CardHeader>
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="space-y-2">
                <Badge variant="outline">{summary.scopeLabel}</Badge>
                <CardTitle className="text-2xl">Phase 4 visibility for RCA execution</CardTitle>
                <CardDescription className="max-w-3xl text-sm">
                  This view tracks workload, aging, approvals, and repeat failures for the RCA records visible to your current role.
                </CardDescription>
              </div>
              <div className="grid min-w-[220px] gap-2 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Radar className="h-4 w-4" />
                  Scope: <span className="font-medium text-foreground">{summary.scope}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock3 className="h-4 w-4" />
                  Avg open age: <span className="font-medium text-foreground">{formatDays(summary.totals.avgOpenAgeDays, "No open RCAs")}</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4" />
                  Avg resolution: <span className="font-medium text-foreground">{formatDays(summary.totals.avgResolutionDays, "No closed RCAs")}</span>
                </div>
              </div>
            </div>
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

        <div className="grid gap-4 xl:grid-cols-[2fr_1fr]">
          <ChartAreaInteractive data={summary.throughput} />

          <Card>
            <CardHeader>
              <CardTitle>Bottleneck signals</CardTitle>
              <CardDescription>
                Highest-friction items surfaced from RCA and solution aging.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {summary.bottlenecks.map((item) => (
                <div key={item.label} className="rounded-lg border border-border/60 bg-muted/20 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="font-medium">{item.label}</div>
                      <div className="mt-1 text-sm text-muted-foreground">{item.description}</div>
                    </div>
                    <Badge variant={item.count > 0 ? "destructive" : "outline"}>{item.count}</Badge>
                  </div>
                </div>
              ))}

              {topBottleneck && topBottleneck.count > 0 ? (
                <div className="rounded-lg border border-amber-300/60 bg-amber-50/60 p-4 text-sm text-amber-950">
                  <div className="flex items-center gap-2 font-medium">
                    <ShieldAlert className="h-4 w-4" />
                    Priority focus
                  </div>
                  <p className="mt-1">
                    {topBottleneck.label} is the strongest blocker right now with {topBottleneck.count} affected item{topBottleneck.count === 1 ? "" : "s"}.
                  </p>
                </div>
              ) : (
                <div className="rounded-lg border border-emerald-300/60 bg-emerald-50/60 p-4 text-sm text-emerald-950">
                  No immediate bottlenecks are standing out in this scope.
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>Open age buckets</CardTitle>
              <CardDescription>How long active RCAs have been sitting open.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {summary.ageBuckets.map((bucket) => (
                <div key={bucket.label} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>{bucket.label}</span>
                    <span className="font-medium">{bucket.count}</span>
                  </div>
                  <div className="h-2 rounded-full bg-muted">
                    <div
                      className="h-2 rounded-full bg-primary"
                      style={{
                        width: `${summary.totals.openRcas === 0 ? 0 : (bucket.count / summary.totals.openRcas) * 100}%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Status mix</CardTitle>
              <CardDescription>Distribution of RCA lifecycle states in this view.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {summary.statusBreakdown.length === 0 ? (
                <div className="text-sm text-muted-foreground">No RCA status data available yet.</div>
              ) : (
                summary.statusBreakdown.map((item) => (
                  <div key={item.status} className="flex items-center justify-between rounded-lg border border-border/60 px-3 py-2 text-sm">
                    <span>{formatStatus(item.status)}</span>
                    <Badge variant="secondary">{item.count}</Badge>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Hotspots</CardTitle>
              <CardDescription>Locations carrying the heaviest active RCA load.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {summary.hotspots.length === 0 ? (
                <div className="text-sm text-muted-foreground">No open-location hotspots yet.</div>
              ) : (
                summary.hotspots.map((item) => (
                  <div key={item.location} className="rounded-lg border border-border/60 p-3">
                    <div className="flex items-center justify-between gap-3">
                      <div className="font-medium">{item.location}</div>
                      <Badge variant="outline">{item.openCount} open</Badge>
                    </div>
                    <div className="mt-1 text-sm text-muted-foreground">
                      Average age {formatDays(item.avgAgeDays, "n/a")}
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4 xl:grid-cols-[1.5fr_1fr]">
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

          <Card>
            <CardHeader>
              <CardTitle>Pattern detection</CardTitle>
              <CardDescription>
                Early repeated-issue clusters to support CMMS-23.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {summary.repeatedIssues.length === 0 ? (
                <div className="rounded-lg border border-border/60 bg-muted/20 p-4 text-sm text-muted-foreground">
                  No repeated issue clusters have formed in the current dataset yet.
                </div>
              ) : (
                summary.repeatedIssues.map((issue) => (
                  <div key={issue.fingerprint} className="rounded-lg border border-border/60 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="truncate font-medium">{issue.location || "Unspecified location"}</div>
                        <div className="mt-1 text-sm text-muted-foreground">{issue.fingerprint}</div>
                      </div>
                      <Badge>{issue.count} matches</Badge>
                    </div>
                    <div className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
                      <AlertTriangle className="h-4 w-4" />
                      Most recent case {issue.latestRcaNumber}
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}
