import { auth } from "@/lib/auth/config";
import { redirect } from "next/navigation";
import { getRcaDashboardSummaryForUser } from "@/lib/server/rca-dashboard";
import DashboardClient from "./DashboardClient";

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  if (!session.user.tenantId) {
    return (
      <main className="min-h-screen bg-slate-50 px-6 py-12">
        <div className="mx-auto max-w-4xl space-y-6">
          <div className="rounded-xl border border-red-200 bg-red-50 p-8 shadow-sm">
            <h2 className="text-lg font-semibold text-red-900">Tenant not found</h2>
            <p className="mt-2 text-sm text-red-700">
              Your account is not associated with a tenant. Please contact your administrator.
            </p>
          </div>
        </div>
      </main>
    );
  }

  const summary = await getRcaDashboardSummaryForUser({
    id: session.user.id,
    tenantId: session.user.tenantId,
    role: session.user.role,
  });

  if (!summary) {
    return (
      <main className="min-h-screen bg-slate-50 px-6 py-12">
        <div className="mx-auto max-w-4xl space-y-6">
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-8 shadow-sm">
            <h2 className="text-lg font-semibold text-amber-900">Unable to load dashboard data</h2>
            <p className="mt-2 text-sm text-amber-700">
              We couldn&apos;t load the Phase 4 RCA dashboard right now. Please try again or sign in again.
            </p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <DashboardClient
      summary={summary}
      userEmail={session.user.email}
      userRole={session.user.role}
    />
  );
}
