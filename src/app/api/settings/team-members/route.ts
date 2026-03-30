import { NextResponse } from "next/server";
import {
  handleRouteError,
  listTeamMembers,
  requireTenantSession,
} from "@/lib/server/frontend-account";

export async function GET() {
  try {
    const user = await requireTenantSession({ admin: true });
    const members = await listTeamMembers(user.tenantId);
    return NextResponse.json(members);
  } catch (error) {
    const handled = handleRouteError(error);
    return NextResponse.json({ error: handled.message }, { status: handled.status });
  }
}
