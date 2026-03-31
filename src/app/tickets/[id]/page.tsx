import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth/config";
import { getTicketDetailForTenant } from "@/lib/server/operations-records";

type PageProps = {
  params: Promise<{ id: string }>;
};

function formatDate(value?: string | null) {
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

export default async function TicketDetailsPage({ params }: PageProps) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const { id } = await params;

  if (!session.user.tenantId) {
    redirect("/login?callbackUrl=/tickets");
  }

  const ticket = await getTicketDetailForTenant(session.user.tenantId, id);

  if (!ticket) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-background px-6 py-12">
      <div className="mx-auto max-w-3xl rounded-xl border border-border bg-card p-8 shadow-sm">
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between gap-4">
            <div>
              <span className="text-xs uppercase tracking-wide text-muted-foreground">{ticket.ticketNumber}</span>
              <h1 className="text-2xl font-semibold text-foreground">{ticket.equipmentName}</h1>
            </div>
            <Link href="/tickets" className="text-sm font-medium text-muted-foreground hover:text-foreground">
              Back to tickets
            </Link>
          </div>
          <p className="text-sm text-muted-foreground">Status: {formatStatus(ticket.status)}</p>
        </div>

        <div className="mt-6 space-y-4 text-sm text-muted-foreground">
          <div>
            <p className="font-medium text-foreground">Issue Description</p>
            <p className="mt-1 whitespace-pre-wrap">{ticket.issueDescription}</p>
          </div>
          <div>
            <p className="font-medium text-foreground">Location</p>
            <p className="mt-1">{ticket.location}</p>
          </div>
          <div>
            <p className="font-medium text-foreground">Priority / Impact</p>
            <p className="mt-1 capitalize">
              {ticket.priority} priority, {ticket.impact} impact
            </p>
          </div>
          <div>
            <p className="font-medium text-foreground">RCA Requirement</p>
            <p className="mt-1">
              {ticket.requiresRca ? "RCA required" : "RCA not required"}
            </p>
            {ticket.rcaRequiredReason ? (
              <p className="mt-1 text-muted-foreground">{ticket.rcaRequiredReason}</p>
            ) : null}
          </div>
          <div>
            <p className="font-medium text-foreground">Linked RCAs</p>
            {ticket.rcas?.length ? (
              <div className="mt-2 space-y-2">
                {ticket.rcas.map((rca: {
                  id: string;
                  rcaNumber: string;
                  title: string;
                  status: string;
                  createdAt: string;
                }) => (
                  <Link
                    key={rca.id}
                    href={`/rca/${rca.id}`}
                    className="block rounded-lg border border-border px-3 py-2 transition-colors hover:bg-muted"
                  >
                    <p className="font-medium text-foreground">
                      {rca.rcaNumber} - {rca.title}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {formatStatus(rca.status)} · Created {formatDate(rca.createdAt)}
                    </p>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="mt-1 text-muted-foreground">No RCAs are linked to this ticket yet.</p>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
