import { auth } from "@/lib/auth/config";
import { redirect } from "next/navigation";
import { listTicketsForTenant, type TicketListFilters } from "@/lib/server/operations-records";
import TicketsClient from "./TicketsClient";

type SearchParamValue = string | string[] | undefined;

type PageProps = {
  searchParams?: Promise<Record<string, SearchParamValue>>;
};

function getSingleValue(value: SearchParamValue) {
  return Array.isArray(value) ? value[0] : value;
}

function buildFilters(searchParams: Record<string, SearchParamValue>): TicketListFilters {
  return {
    q: getSingleValue(searchParams.q) || undefined,
    status: getSingleValue(searchParams.status) || undefined,
    priority: getSingleValue(searchParams.priority) || undefined,
    requiresRca: getSingleValue(searchParams.requiresRca) || undefined,
  };
}

export default async function TicketsPage({ searchParams }: PageProps) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const resolvedSearchParams = searchParams ? await searchParams : {};
  const filters = buildFilters(resolvedSearchParams);
  const tickets = await listTicketsForTenant(session.user.tenantId, filters);
  const activeFilterCount = Object.values(filters).filter(Boolean).length;

  return (
    <TicketsClient tickets={tickets} filters={filters} activeFilterCount={activeFilterCount} />
  );
}
