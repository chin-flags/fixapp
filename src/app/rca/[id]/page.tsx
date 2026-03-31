import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth/config";
import Link from "next/link";
import RcaCollaborationClient from "./RcaCollaborationClient";
import { AppShell } from "@/components/app-shell";
import { buildExternalBackendUrl } from "@/lib/backend-endpoints";
import {
  getRcaDetailForTenantUser,
  listTicketsForTenant,
} from "@/lib/server/operations-records";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function RcaDetailsPage({ params }: PageProps) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const { id } = await params;

  if (!session.user.tenantId) {
    redirect("/login?callbackUrl=/rca");
  }

  const [rca, tickets] = await Promise.all([
    getRcaDetailForTenantUser(
      {
        id: session.user.id,
        tenantId: session.user.tenantId,
        role: session.user.role,
      },
      id,
    ),
    listTicketsForTenant(session.user.tenantId),
  ]);

  if (!rca) {
    notFound();
  }

  const attachmentBaseUrl = buildExternalBackendUrl("");
  const userName = session.user.name || session.user.email?.split("@")[0] || "User";

  return (
    <AppShell
      title="RCA Investigation"
      user={{
        name: userName,
        email: session.user.email || "",
        role: session.user.role,
      }}
      actions={
        rca.maintenanceTicket ? (
          <Link
            href={`/tickets/${rca.maintenanceTicket.id}`}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center rounded-md border border-border bg-background px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted"
          >
            Open Ticket
          </Link>
        ) : null
      }
    >
      <RcaCollaborationClient
        initialRca={rca}
        accessToken={session.user.accessToken}
        currentUserId={session.user.id}
        currentUserRole={session.user.role}
        tickets={tickets}
        attachmentBaseUrl={attachmentBaseUrl}
        canManageTicketLink={session.user.role === "admin"}
      />
    </AppShell>
  );
}
