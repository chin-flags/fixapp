"use client";

import Link from "next/link";
import {
  ArrowRightIcon,
  CheckCheckIcon,
  Clock3Icon,
  MapPinIcon,
  SparklesIcon,
  User2Icon,
} from "lucide-react";
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

function getStatusTone(status: string | null) {
  switch (status) {
  case "closed":
    return "bg-emerald-500/15 text-emerald-400";
  case "pending_approval":
    return "bg-amber-500/15 text-amber-400";
  case "investigating":
    return "bg-secondary/15 text-secondary";
  default:
    return "bg-muted text-muted-foreground";
  }
}

export default function DashboardClient({ summary, userEmail, userRole }: Props) {
  const healthScore = Math.max(
    0,
    Math.min(
      100,
      100 - summary.totals.overdueSolutions * 8 - summary.totals.pendingApprovals * 4
    )
  );

  return (
    <AppShell
      title=""
      user={{ name: userEmail.split("@")[0], email: userEmail, role: userRole }}
    >
      <div className="space-y-4">
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

        <div className="grid gap-4 lg:grid-cols-[1.5fr_0.9fr]">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg text-card-foreground">Recent RCAs</CardTitle>
              <CardDescription className="text-xs leading-5 text-muted-foreground">
                Latest activity in your dashboard scope, including collaboration and action counts.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {summary.recentRcas.length === 0 ? (
                <div className="py-4 text-sm text-muted-foreground">No RCAs are visible in this scope yet.</div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2">
                  {summary.recentRcas.map((rca) => (
                    <Link
                      key={rca.id}
                      href={`/rca/${rca.id}`}
                      className="group rounded-2xl border border-border bg-card p-5 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-primary/40 hover:shadow-lg"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="text-sm font-medium text-muted-foreground">
                            {rca.rcaNumber}
                          </div>
                          <h3 className="mt-2 text-xl font-semibold leading-snug text-card-foreground">{rca.title}</h3>
                        </div>
                        <Badge className={getStatusTone(rca.status)}>{formatStatus(rca.status || "unknown")}</Badge>
                      </div>

                      <div className="mt-4 flex flex-wrap gap-2 text-sm text-muted-foreground">
                        <span className="inline-flex items-center gap-1 rounded-full bg-muted px-3 py-1.5">
                          <MapPinIcon className="size-3.5" />
                          {rca.location || "Unknown location"}
                        </span>
                        <span className="inline-flex items-center gap-1 rounded-full bg-muted px-3 py-1.5">
                          <Clock3Icon className="size-3.5" />
                          {rca.ageDays}d old
                        </span>
                        <span className="inline-flex items-center gap-1 rounded-full bg-muted px-3 py-1.5">
                          <User2Icon className="size-3.5" />
                          {rca.owner?.name || "Unassigned"}
                        </span>
                      </div>

                      <div className="mt-5 grid grid-cols-2 gap-3 text-sm">
                        <div className="rounded-xl bg-secondary/10 px-3 py-3">
                          <div className="text-sm font-medium text-secondary">Action queue</div>
                          <div className="mt-1 text-sm font-semibold text-card-foreground">
                            {rca.pendingSolutionCount}/{rca.solutionCount} pending
                          </div>
                        </div>
                        <div className="rounded-xl bg-emerald-500/10 px-3 py-3">
                          <div className="text-sm font-medium text-emerald-400">Team buzz</div>
                          <div className="mt-1 text-sm font-semibold text-card-foreground">
                            {rca.teamMemberCount} teammates, {rca.commentCount} comments
                          </div>
                        </div>
                      </div>

                      <div className="mt-5 flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">
                          Updated {formatDate(rca.updatedAt || rca.createdAt)}
                        </span>
                        <span className="inline-flex items-center gap-1 font-medium text-primary transition-transform group-hover:translate-x-1">
                          Open RCA
                          <ArrowRightIcon className="size-4" />
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <div className="grid gap-4">
            <Card className="border border-amber-500/20 bg-[linear-gradient(180deg,hsla(260,60%,50%,0.15),transparent)] shadow-sm">
              <CardHeader>
              <CardTitle className="text-lg text-card-foreground">Watch list</CardTitle>
              <CardDescription className="text-xs leading-5 text-muted-foreground">Small signals worth nudging today.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="rounded-2xl border border-amber-500/20 bg-card p-4">
                  <div className="text-sm font-medium text-amber-400">Pending approvals</div>
                  <div className="mt-2 text-3xl font-semibold text-card-foreground">{summary.totals.pendingApprovals}</div>
                  <div className="mt-1 text-sm leading-6 text-muted-foreground">
                    Solutions waiting on the final thumbs-up.
                  </div>
                </div>
                <div className="rounded-2xl border border-destructive/20 bg-card p-4">
                  <div className="text-sm font-medium text-destructive">Overdue actions</div>
                  <div className="mt-2 text-3xl font-semibold text-card-foreground">{summary.totals.overdueSolutions}</div>
                  <div className="mt-1 text-sm leading-6 text-muted-foreground">
                    Corrective actions already past their target date.
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border">
              <CardHeader>
              <CardTitle className="text-lg text-card-foreground">Momentum snapshot</CardTitle>
              <CardDescription className="text-xs leading-5 text-muted-foreground">How the current workload feels at a glance.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="rounded-2xl border border-border p-4">
                  <div className="flex items-center gap-2 text-base font-medium text-card-foreground">
                    <CheckCheckIcon className="size-4 text-emerald-400" />
                    Resolution pace
                  </div>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    Average resolution time is{" "}
                    <span className="font-semibold text-foreground">
                      {summary.totals.avgResolutionDays ?? "n/a"} days
                    </span>
                    .
                  </p>
                </div>
                <div className="rounded-2xl border border-border p-4">
                  <div className="flex items-center gap-2 text-base font-medium text-card-foreground">
                    <SparklesIcon className="size-4 text-secondary" />
                    Open case age
                  </div>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    Active RCAs are averaging{" "}
                    <span className="font-semibold text-foreground">
                      {summary.totals.avgOpenAgeDays ?? "n/a"} days
                    </span>{" "}
                    in flight.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
