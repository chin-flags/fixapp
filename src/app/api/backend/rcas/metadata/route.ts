import { NextResponse } from "next/server";
import { handleRouteError, requireTenantSession } from "@/lib/server/frontend-account";
import {
  listRcaOwnerOptions,
  listTicketsForTenant,
} from "@/lib/server/operations-records";

export async function GET() {
  try {
    const user = await requireTenantSession();
    const [owners, tickets] = await Promise.all([
      listRcaOwnerOptions(user.tenantId),
      listTicketsForTenant(user.tenantId),
    ]);

    return NextResponse.json({
      tickets: tickets.map((t) => ({
        id: t.id,
        ticketNumber: t.ticketNumber,
        equipmentName: t.equipmentName,
        location: t.location,
        issueDescription: t.issueDescription,
        requiresRca: t.requiresRca,
      })),
      owners,
    });
  } catch (error) {
    const handled = handleRouteError(error);
    return NextResponse.json({ error: handled.message }, { status: handled.status });
  }
}
