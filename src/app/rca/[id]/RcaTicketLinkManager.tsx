"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { buildBackendProxyUrl } from "@/lib/backend-endpoints";

type TicketOption = {
  id: string;
  ticketNumber: string;
  equipmentName: string;
  location: string;
  issueDescription: string;
  requiresRca: boolean;
};

type Props = {
  rcaId: string;
  currentTicketId: string | null;
  tickets: TicketOption[];
};

export default function RcaTicketLinkManager({ rcaId, currentTicketId, tickets }: Props) {
  const router = useRouter();
  const { data: session } = useSession();
  const [selectedTicketId, setSelectedTicketId] = useState(currentTicketId ?? "");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const onSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);

    if (!session?.user?.accessToken) {
      setError("You must be signed in to update linked tickets.");
      return;
    }

    startTransition(async () => {
      try {
        const response = await fetch(buildBackendProxyUrl(`/rcas/${rcaId}/ticket-link`), {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.user.accessToken}`,
          },
          body: JSON.stringify({
            maintenanceTicketId: selectedTicketId || null,
          }),
        });

        if (!response.ok) {
          const payload = await response.json().catch(() => ({}));
          throw new Error(payload.message || payload.error || "Failed to update ticket link.");
        }

        router.refresh();
      } catch (submitError) {
        setError(submitError instanceof Error ? submitError.message : "Failed to update ticket link.");
      }
    });
  };

  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-4">
      <div>
        <p className="font-medium text-slate-900">Manage Linked Ticket</p>
        <p className="mt-1 text-sm text-slate-600">
          Admins can link or unlink this RCA from a maintenance ticket.
        </p>
      </div>

      <form className="mt-4 space-y-3" onSubmit={onSubmit}>
        {error ? (
          <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </div>
        ) : null}

        <div>
          <label className="block text-sm font-medium text-slate-700" htmlFor="maintenanceTicketId">
            Maintenance Ticket
          </label>
          <select
            id="maintenanceTicketId"
            value={selectedTicketId}
            onChange={(event) => setSelectedTicketId(event.target.value)}
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500"
          >
            <option value="">No linked ticket</option>
            {tickets.map((ticket) => (
              <option key={ticket.id} value={ticket.id}>
                {ticket.ticketNumber} - {ticket.equipmentName} ({ticket.location})
              </option>
            ))}
          </select>
        </div>

        <button
          type="submit"
          disabled={isPending}
          className="inline-flex items-center justify-center rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isPending ? "Saving..." : "Save Ticket Link"}
        </button>
      </form>
    </div>
  );
}
