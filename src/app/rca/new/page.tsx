import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth/config";
import RcaForm from "./RcaForm";
import {
  listRcaOwnerOptions,
  listTicketsForTenant,
} from "@/lib/server/operations-records";

type Props = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function NewRcaPage({ searchParams }: Props) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const resolvedSearchParams = searchParams ? await searchParams : {};
  const ticketIdParam = resolvedSearchParams.ticketId;
  const initialTicketId = Array.isArray(ticketIdParam) ? ticketIdParam[0] : ticketIdParam;

  const [ticketRows, owners] = await Promise.all([
    listTicketsForTenant(session.user.tenantId),
    listRcaOwnerOptions(session.user.tenantId),
  ]);

  const tickets = ticketRows.map((t) => ({
    id: t.id,
    ticketNumber: t.ticketNumber,
    equipmentName: t.equipmentName,
    location: t.location,
    issueDescription: t.issueDescription,
    requiresRca: t.requiresRca,
  }));

  return (
    <main className="min-h-screen bg-background px-4 py-8">
      <div className="mx-auto max-w-3xl rounded-xl border border-border bg-card p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-card-foreground">Create RCA</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Capture the issue details and assign ownership.
            </p>
          </div>
          <Link
            href="/rca"
            className="rounded-full border border-border px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
          >
            Close
          </Link>
        </div>
        <RcaForm tickets={tickets} owners={owners} initialTicketId={initialTicketId} />
      </div>
    </main>
  );
}
