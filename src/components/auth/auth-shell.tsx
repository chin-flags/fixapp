import type { ReactNode } from "react";
import Link from "next/link";
import { ShieldCheck, Building2, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

type AuthShellProps = {
  eyebrow: string;
  title: string;
  description: string;
  footer: ReactNode;
  children: ReactNode;
};

const highlights = [
  {
    icon: ShieldCheck,
    title: "Structured incident control",
    description: "Keep investigations, actions, and approvals in one place.",
  },
  {
    icon: Building2,
    title: "Tenant-aware workspace",
    description: "Every sign-in routes directly into the right FixApp environment.",
  },
  {
    icon: Sparkles,
    title: "Built for operations teams",
    description: "Clear workflows, role-based access, and practical RCA tracking.",
  },
];

export function AuthShell({
  eyebrow,
  title,
  description,
  footer,
  children,
}: AuthShellProps) {
  return (
    <main className="min-h-screen bg-background">
      <div className="grid min-h-screen lg:grid-cols-[1.05fr_0.95fr]">
        <section className="relative hidden overflow-hidden border-r border-border/70 bg-slate-950 text-slate-50 lg:flex">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(59,130,246,0.3),_transparent_36%),radial-gradient(circle_at_bottom_right,_rgba(14,165,233,0.18),_transparent_32%)]" />
          <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.04),transparent_45%,rgba(255,255,255,0.02))]" />
          <div className="relative flex w-full flex-col justify-between p-10 xl:p-14">
            <div className="space-y-6">
              <Badge variant="secondary" className="w-fit border-white/10 bg-white/10 text-slate-100 hover:bg-white/10">
                FixApp workspace
              </Badge>
              <div className="space-y-4">
                <h2 className="max-w-md text-4xl font-semibold tracking-tight text-balance">
                  Investigations, corrective actions, and team coordination in one system.
                </h2>
                <p className="max-w-xl text-sm leading-6 text-slate-300">
                  FixApp gives operations teams a cleaner way to manage RCAs, assets, and accountability without
                  juggling disconnected tools.
                </p>
              </div>
            </div>

            <div className="grid gap-4">
              {highlights.map(({ icon: Icon, title, description }) => (
                <div
                  key={title}
                  className="rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm"
                >
                  <div className="flex items-start gap-3">
                    <div className="rounded-lg bg-white/10 p-2 text-slate-100">
                      <Icon className="h-4 w-4" />
                    </div>
                    <div>
                      <div className="text-sm font-medium text-slate-50">{title}</div>
                      <div className="mt-1 text-sm leading-6 text-slate-300">{description}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="flex min-h-screen items-center justify-center px-4 py-10 sm:px-6 lg:px-10">
          <div className="w-full max-w-md space-y-6">
            <div className="space-y-3">
              <Link href="/" className="inline-flex items-center gap-2 text-sm font-medium text-foreground">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
                  F
                </span>
                FixApp
              </Link>
              <div className="space-y-1.5">
                <p className="text-sm font-medium text-primary">{eyebrow}</p>
                <h1 className="text-3xl font-semibold tracking-tight text-foreground">{title}</h1>
                <p className="text-sm leading-6 text-muted-foreground">{description}</p>
              </div>
            </div>

            <Card className="border-border/70 shadow-xl shadow-slate-950/5">
              <CardHeader className="pb-4">
                <CardTitle className="text-base font-semibold">Workspace access</CardTitle>
                <CardDescription>
                  Enter your details to continue.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {children}
                <div className="border-t border-border/70 pt-4 text-sm text-muted-foreground">{footer}</div>
              </CardContent>
            </Card>
          </div>
        </section>
      </div>
    </main>
  );
}
