import { auth } from "@/lib/auth/config";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  type TeamMemberRecord,
  type TenantInviteRecord,
  type TenantRoleRecord,
} from "@/lib/backend-api";
import {
  listTeamMembers,
  listTenantInvites,
  listTenantRoles,
} from "@/lib/server/frontend-account";
import SettingsClient from "./SettingsClient";

export default async function SettingsPage() {
  const session = await auth();

  if (!session?.user) {
    return (
      <main className="min-h-screen bg-background px-6 py-12 text-foreground">
        <div className="mx-auto max-w-3xl">
          <div className="rounded-2xl border border-border bg-card p-8 shadow-sm">
            <h1 className="text-2xl font-semibold">Sign in required</h1>
            <p className="mt-3 text-sm text-muted-foreground">
              Settings needs an authenticated session before it can load tenant role and invite data.
            </p>
            <Link
              href="/login?callbackUrl=/settings"
              className="mt-5 inline-flex rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            >
              Go to login
            </Link>
          </div>
        </div>
      </main>
    );
  }

  if (!session.user.tenantId) {
    return (
      <main className="min-h-screen bg-background px-6 py-12 text-foreground">
        <div className="mx-auto max-w-3xl">
          <div className="rounded-2xl border border-destructive/30 bg-card p-8 shadow-sm">
            <h1 className="text-2xl font-semibold">Session is missing tenant context</h1>
            <p className="mt-3 text-sm text-muted-foreground">
              You are signed in, but this browser session does not currently include a tenant ID, so settings cannot load tenant data.
            </p>
            <div className="mt-4 rounded-lg border border-border bg-muted/50 p-4 text-sm text-foreground">
              <p><span className="font-medium">Email:</span> {session.user.email || "Unknown"}</p>
              <p><span className="font-medium">Role:</span> {session.user.role || "Unknown"}</p>
              <p><span className="font-medium">Tenant ID:</span> missing</p>
            </div>
            <p className="mt-4 text-sm text-muted-foreground">
              Sign out and sign back in with the tenant subdomain so the session can be rebuilt with tenant membership.
            </p>
            <Link
              href="/login?callbackUrl=/settings"
              className="mt-5 inline-flex rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            >
              Re-login
            </Link>
          </div>
        </div>
      </main>
    );
  }

  if (session.user.role !== "admin") {
    return (
      <main className="min-h-screen bg-background px-6 py-12 text-foreground">
        <div className="mx-auto max-w-3xl">
          <div className="rounded-2xl border border-border bg-card p-8 shadow-sm">
            <h1 className="text-2xl font-semibold">Settings access is limited</h1>
            <p className="mt-3 text-sm text-muted-foreground">
              Only tenant admins can manage team roles, invite links, and team membership settings.
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              Sign in with an admin account or return to the dashboard.
            </p>
          </div>
        </div>
      </main>
    );
  }

  const [roles, invites, teamMembers] = await Promise.all([
    listTenantRoles(session.user.tenantId).catch(() => [] as TenantRoleRecord[]),
    listTenantInvites(session.user.tenantId).catch(() => [] as TenantInviteRecord[]),
    listTeamMembers(session.user.tenantId).catch(() => [] as TeamMemberRecord[]),
  ]);

  return (
    <SettingsClient
      userEmail={session.user.email || ""}
      roles={roles}
      invites={invites}
      teamMembers={teamMembers}
    />
  );
}
