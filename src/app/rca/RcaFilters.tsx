"use client";

import { useEffect, useState, useTransition } from "react";
import { ChevronDown, SlidersHorizontal } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type OwnerOption = {
  id: string;
  name: string;
  email: string;
};

type Props = {
  filters: {
    q?: string;
    status?: string;
    assignee?: string;
    equipment?: string;
    location?: string;
    createdFrom?: string;
    createdTo?: string;
  };
  owners: OwnerOption[];
  activeFilterCount: number;
};

const selectClassName =
  "flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring";

export default function RcaFilters({ filters, owners, activeFilterCount }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [isOpen, setIsOpen] = useState(activeFilterCount > 0);
  const [form, setForm] = useState({
    q: filters.q ?? "",
    status: filters.status ?? "",
    assignee: filters.assignee ?? "",
    equipment: filters.equipment ?? "",
    location: filters.location ?? "",
    createdFrom: filters.createdFrom ?? "",
    createdTo: filters.createdTo ?? "",
  });

  useEffect(() => {
    setForm({
      q: filters.q ?? "",
      status: filters.status ?? "",
      assignee: filters.assignee ?? "",
      equipment: filters.equipment ?? "",
      location: filters.location ?? "",
      createdFrom: filters.createdFrom ?? "",
      createdTo: filters.createdTo ?? "",
    });
  }, [filters]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const params = new URLSearchParams();

      Object.entries(form).forEach(([key, value]) => {
        const trimmed = value.trim();
        if (trimmed) {
          params.set(key, trimmed);
        }
      });

      startTransition(() => {
        const query = params.toString();
        if (query === searchParams.toString()) {
          return;
        }

        router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
      });
    }, 250);

    return () => window.clearTimeout(timer);
  }, [form, pathname, router, searchParams]);

  return (
    <div className="rounded-lg border border-border/70 bg-card">
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
        <button
          type="button"
          onClick={() => setIsOpen((value) => !value)}
          className="inline-flex items-center gap-2 text-sm font-medium text-foreground"
        >
          <SlidersHorizontal className="h-4 w-4" />
          Filters
          {activeFilterCount > 0 ? <Badge variant="secondary">{activeFilterCount}</Badge> : null}
          <ChevronDown className={cn("h-4 w-4 transition-transform", isOpen && "rotate-180")} />
        </button>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          {isPending ? <span>Updating…</span> : null}
          {activeFilterCount > 0 ? (
            <button
              type="button"
              onClick={() => {
                setForm({
                  q: "",
                  status: "",
                  assignee: "",
                  equipment: "",
                  location: "",
                  createdFrom: "",
                  createdTo: "",
                });
              }}
              className="font-medium text-foreground hover:underline"
            >
              Clear
            </button>
          ) : (
            <span>Showing all RCAs</span>
          )}
        </div>
      </div>

      {isOpen ? (
        <div className="grid gap-3 border-t border-border/70 px-4 py-4 md:grid-cols-2 xl:grid-cols-4">
          <Input
            value={form.q}
            onChange={(event) => setForm((current) => ({ ...current, q: event.target.value }))}
            placeholder="Search RCAs"
          />
          <select
            value={form.status}
            onChange={(event) => setForm((current) => ({ ...current, status: event.target.value }))}
            className={selectClassName}
          >
            <option value="">All statuses</option>
            <option value="open">Open</option>
            <option value="in_progress">In Progress</option>
            <option value="closed">Closed</option>
          </select>
          <select
            value={form.assignee}
            onChange={(event) => setForm((current) => ({ ...current, assignee: event.target.value }))}
            className={selectClassName}
          >
            <option value="">All assignees</option>
            <option value="unassigned">Unassigned</option>
            {owners.map((owner) => (
              <option key={owner.id} value={owner.id}>
                {owner.name} ({owner.email})
              </option>
            ))}
          </select>
          <Input
            value={form.equipment}
            onChange={(event) => setForm((current) => ({ ...current, equipment: event.target.value }))}
            placeholder="Equipment"
          />
          <Input
            value={form.location}
            onChange={(event) => setForm((current) => ({ ...current, location: event.target.value }))}
            placeholder="Location"
          />
          <Input
            type="date"
            value={form.createdFrom}
            onChange={(event) => setForm((current) => ({ ...current, createdFrom: event.target.value }))}
          />
          <Input
            type="date"
            value={form.createdTo}
            onChange={(event) => setForm((current) => ({ ...current, createdTo: event.target.value }))}
          />
        </div>
      ) : null}
    </div>
  );
}
