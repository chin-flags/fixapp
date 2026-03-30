"use client";

import { useEffect, useState, useTransition } from "react";
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

type OwnerOption = {
  id: string;
  name: string;
  email: string;
};

type Props = {
  tickets: TicketOption[];
  owners: OwnerOption[];
  initialTicketId?: string;
};

function buildPrefillValues(ticket: TicketOption) {
  return {
    title: `${ticket.equipmentName}: ${ticket.issueDescription}`,
    description: [
      `Maintenance ticket ${ticket.ticketNumber}`,
      `Location: ${ticket.location}`,
      "",
      "Reported issue:",
      ticket.issueDescription,
    ].join("\n"),
  };
}

export default function RcaForm({ tickets, owners, initialTicketId }: Props) {
  const router = useRouter();
  const { data: session } = useSession();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const initialTicket = initialTicketId ? tickets.find((ticket) => ticket.id === initialTicketId) : undefined;
  const initialPrefill = initialTicket ? buildPrefillValues(initialTicket) : null;

  const [title, setTitle] = useState(initialPrefill?.title ?? "");
  const [description, setDescription] = useState(initialPrefill?.description ?? "");
  const [equipmentName, setEquipmentName] = useState(initialTicket?.equipmentName ?? "");
  const [location, setLocation] = useState(initialTicket?.location ?? "");
  const [maintenanceTicketId, setMaintenanceTicketId] = useState<string | "">(initialTicket?.id ?? "");
  const [ownerId, setOwnerId] = useState<string | "">("");
  const [selectedTicket, setSelectedTicket] = useState<TicketOption | null>(initialTicket ?? null);
  const [attachments, setAttachments] = useState<File[]>([]);

  useEffect(() => {
    if (!initialTicketId) {
      return;
    }

    const ticket = tickets.find((candidate) => candidate.id === initialTicketId);
    if (!ticket) {
      return;
    }

    const prefill = buildPrefillValues(ticket);
    setMaintenanceTicketId(ticket.id);
    setSelectedTicket(ticket);
    setEquipmentName(ticket.equipmentName);
    setLocation(ticket.location);
    setTitle((current) => current || prefill.title);
    setDescription((current) => current || prefill.description);
  }, [initialTicketId, tickets]);

  const onTicketChange = (value: string) => {
    setMaintenanceTicketId(value);
    const selected = tickets.find((t) => t.id === value);
    setSelectedTicket(selected ?? null);

    if (selected) {
      const prefill = buildPrefillValues(selected);
      setEquipmentName(selected.equipmentName);
      setLocation(selected.location);
      setTitle(prefill.title);
      setDescription(prefill.description);
      return;
    }

    setEquipmentName("");
    setLocation("");
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!description.trim() || !equipmentName.trim() || !location.trim()) {
      setError("Issue description, equipment, and location are required.");
      return;
    }

    const fallbackTitle = `${equipmentName.trim()} - ${location.trim()} - ${description
      .trim()
      .replace(/\s+/g, " ")
      .slice(0, 80)}`;

    startTransition(async () => {
      try {
        const formData = new FormData();
        formData.append("title", title.trim() || fallbackTitle);
        formData.append("description", description.trim());
        formData.append("equipmentName", equipmentName.trim());
        formData.append("location", location.trim());
        if (maintenanceTicketId) {
          formData.append("maintenanceTicketId", maintenanceTicketId);
        }
        if (ownerId) {
          formData.append("ownerId", ownerId);
        }
        attachments.forEach((file) => {
          formData.append("attachments", file);
        });

        const res = await fetch(buildBackendProxyUrl("/rcas"), {
          method: "POST",
          headers: {
            Authorization: `Bearer ${session?.user?.accessToken}`,
          },
          body: formData,
        });

        if (!res.ok) {
          const payload = await res.json().catch(() => ({}));
          throw new Error(payload.error || "Failed to create RCA.");
        }

        const payload = await res.json();
        router.push(`/rca/${payload.id}`);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to create RCA.");
      }
    });
  };

  return (
    <form className="mt-6 space-y-4" onSubmit={onSubmit}>
      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-slate-700" htmlFor="title">
          Title
        </label>
        <input
          id="title"
          type="text"
          className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500"
          placeholder="Optional. We'll generate one from the issue details if left blank."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700" htmlFor="description">
          Issue Description *
        </label>
        <textarea
          id="description"
          rows={4}
          className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700" htmlFor="equipmentName">
          Equipment *
        </label>
        <input
          id="equipmentName"
          type="text"
          className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500"
          value={equipmentName}
          onChange={(e) => setEquipmentName(e.target.value)}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700" htmlFor="location">
          Location *
        </label>
        <input
          id="location"
          type="text"
          className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700" htmlFor="ticket">
          Linked Maintenance Ticket (optional)
        </label>
        <select
          id="ticket"
          className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500"
          value={maintenanceTicketId}
          onChange={(e) => onTicketChange(e.target.value)}
        >
          <option value="">No ticket</option>
          {tickets.map((ticket) => (
            <option key={ticket.id} value={ticket.id}>
              {ticket.ticketNumber} — {ticket.equipmentName}
            </option>
          ))}
        </select>
      </div>

      {selectedTicket ? (
        <div className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
          <p className="font-medium">
            Prefilled from {selectedTicket.ticketNumber}
          </p>
          <p className="mt-1 text-amber-800">
            Location: {selectedTicket.location}
          </p>
          {selectedTicket.requiresRca ? (
            <p className="mt-1 text-amber-800">
              This ticket was flagged as requiring RCA.
            </p>
          ) : null}
        </div>
      ) : null}

      <div>
        <label className="block text-sm font-medium text-slate-700" htmlFor="owner">
          RCA Owner (optional)
        </label>
        <select
          id="owner"
          className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500"
          value={ownerId}
          onChange={(e) => setOwnerId(e.target.value)}
        >
          <option value="">Unassigned</option>
          {owners.map((owner) => (
            <option key={owner.id} value={owner.id}>
              {owner.name} ({owner.email})
            </option>
          ))}
        </select>
        <p className="mt-1 text-xs text-slate-500">
          Leave unassigned to use automatic routing based on location and equipment.
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700" htmlFor="attachments">
          Attachments
        </label>
        <input
          id="attachments"
          type="file"
          multiple
          className="mt-1 block w-full text-sm text-slate-700 file:mr-4 file:rounded-md file:border-0 file:bg-slate-100 file:px-3 file:py-2 file:text-sm file:font-medium file:text-slate-700"
          onChange={(e) => setAttachments(Array.from(e.target.files ?? []))}
        />
        <p className="mt-1 text-xs text-slate-500">
          Upload up to 5 files, 10 MB each.
        </p>
        {attachments.length > 0 ? (
          <ul className="mt-2 space-y-1 text-sm text-slate-600">
            {attachments.map((file) => (
              <li key={`${file.name}-${file.size}`}>
                {file.name} ({Math.max(1, Math.round(file.size / 1024))} KB)
              </li>
            ))}
          </ul>
        ) : null}
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="w-full rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-70"
      >
        {isPending ? "Creating..." : "Create RCA"}
      </button>
    </form>
  );
}
