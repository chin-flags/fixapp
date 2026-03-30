import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth/config";
import Link from "next/link";
import RcaTicketLinkManager from "./RcaTicketLinkManager";
import RcaCollaborationClient from "./RcaCollaborationClient";
import { AppShell } from "@/components/app-shell";
import {
  buildBackendProxyUrl,
  buildExternalBackendUrl,
} from "@/lib/backend-endpoints";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function RcaDetailsPage({ params }: PageProps) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const { id } = await params;

  const [rcaRes, metadataRes] = await Promise.all([
    fetch(buildBackendProxyUrl(`/rcas/${id}`), {
      headers: {
        Authorization: `Bearer ${session.user.accessToken}`,
      },
      cache: "no-store",
    }),
    fetch(buildBackendProxyUrl("/rcas/metadata"), {
      headers: {
        Authorization: `Bearer ${session.user.accessToken}`,
      },
      cache: "no-store",
    }),
  ]);

  if (!rcaRes.ok) {
    notFound();
  }

  const rca = await rcaRes.json();
  const metadata = metadataRes.ok ? await metadataRes.json() : { tickets: [] };
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
            className="inline-flex items-center rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
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
        tickets={metadata.tickets ?? []}
        attachmentBaseUrl={attachmentBaseUrl}
        ticketLinkManager={
          session.user.role === "admin" ? (
            <RcaTicketLinkManager
              rcaId={rca.id}
              currentTicketId={rca.maintenanceTicket?.id ?? null}
              tickets={metadata.tickets ?? []}
            />
          ) : null
        }
      />
    </AppShell>
  );
}
