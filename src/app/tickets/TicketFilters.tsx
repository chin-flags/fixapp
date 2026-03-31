"use client";

import { useEffect, useState, useTransition } from "react";
import { ChevronDown, SlidersHorizontal } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type Props = {
  filters: {
    q?: string;
    status?: string;
    priority?: string;
    requiresRca?: string;
  };
  activeFilterCount: number;
};

const selectClassName =
  "flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring";

export default function TicketFilters({ filters, activeFilterCount }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [isOpen, setIsOpen] = useState(activeFilterCount > 0);
  const [form, setForm] = useState({
    q: filters.q ?? "",
    status: filters.status ?? "",
    priority: filters.priority ?? "",
    requiresRca: filters.requiresRca ?? "",
  });

  useEffect(() => {
    setForm({
      q: filters.q ?? "",
      status: filters.status ?? "",
      priority: filters.priority ?? "",
      requiresRca: filters.requiresRca ?? "",
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
              onClick={() => setForm({ q: "", status: "", priority: "", requiresRca: "" })}
              className="font-medium text-foreground hover:underline"
            >
              Clear
            </button>
          ) : (
            <span>Showing all tickets</span>
          )}
        </div>
      </div>

      {isOpen ? (
        <div className="grid gap-3 border-t border-border/70 px-4 py-4 md:grid-cols-2 xl:grid-cols-4">
          <Input
            value={form.q}
            onChange={(event) => setForm((current) => ({ ...current, q: event.target.value }))}
            placeholder="Search tickets"
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
            value={form.priority}
            onChange={(event) => setForm((current) => ({ ...current, priority: event.target.value }))}
            className={selectClassName}
          >
            <option value="">All priorities</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="critical">Critical</option>
          </select>
          <select
            value={form.requiresRca}
            onChange={(event) => setForm((current) => ({ ...current, requiresRca: event.target.value }))}
            className={selectClassName}
          >
            <option value="">All RCA states</option>
            <option value="required">RCA required</option>
            <option value="not_required">No RCA required</option>
          </select>
        </div>
      ) : null}
    </div>
  );
}
