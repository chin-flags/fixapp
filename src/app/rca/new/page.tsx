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
    <main className="min-h-screen bg-slate-50 px-6 py-12">
      <div className="mx-auto max-w-3xl rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-semibold text-slate-900">Create RCA</h1>
        <p className="mt-2 text-sm text-slate-600">
          Capture the issue details and assign ownership.
        </p>
        <RcaForm tickets={tickets} owners={owners} initialTicketId={initialTicketId} />
      </div>
    </main>
  );
}
