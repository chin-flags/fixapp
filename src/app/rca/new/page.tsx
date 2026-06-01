import { redirect } from "next/navigation";
import { auth } from "@/lib/auth/config";
import RcaForm from "./RcaForm";
import { buildBackendProxyUrl } from "@/lib/backend-endpoints";

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

  const metadataRes = await fetch(buildBackendProxyUrl("/rcas/metadata"), {
    headers: {
      Authorization: `Bearer ${session.user.accessToken}`,
    },
    cache: "no-store",
  });

  if (!metadataRes.ok) {
    redirect("/dashboard");
  }

  const { tickets, owners } = await metadataRes.json();

  return (
    <main className="min-h-screen bg-background px-4 py-8">
      <div className="mx-auto max-w-3xl rounded-xl border border-border bg-card p-6 shadow-sm">
        <h1 className="text-xl font-semibold text-card-foreground">Create RCA</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Capture the issue details and assign ownership.
        </p>
        <RcaForm tickets={tickets} owners={owners} initialTicketId={initialTicketId} />
      </div>
    </main>
  );
}
