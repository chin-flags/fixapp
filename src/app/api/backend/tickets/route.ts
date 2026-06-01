import { NextRequest, NextResponse } from "next/server";
import { handleRouteError, requireTenantSession } from "@/lib/server/frontend-account";
import {
  createTicketForTenant,
  listTicketsForTenant,
} from "@/lib/server/operations-records";

export async function GET(request: NextRequest) {
  try {
    const user = await requireTenantSession();
    const { searchParams } = new URL(request.url);
    const filters = {
      q: searchParams.get("q") ?? undefined,
      status: searchParams.get("status") ?? undefined,
      priority: searchParams.get("priority") ?? undefined,
      requiresRca: searchParams.get("requiresRca") ?? undefined,
    };
    const tickets = await listTicketsForTenant(user.tenantId, filters);
    return NextResponse.json(tickets);
  } catch (error) {
    const handled = handleRouteError(error);
    return NextResponse.json({ error: handled.message }, { status: handled.status });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireTenantSession();
    const body = await request.json();
    const created = await createTicketForTenant(user.tenantId, user.id, body);
    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    const handled = handleRouteError(error);
    return NextResponse.json({ error: handled.message }, { status: handled.status });
  }
}
