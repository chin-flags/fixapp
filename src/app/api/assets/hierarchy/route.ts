import { NextResponse } from "next/server";
import {
  handleRouteError,
  listAssetHierarchy,
  requireTenantSession,
} from "@/lib/server/frontend-assets";

export async function GET() {
  try {
    const user = await requireTenantSession();
    const hierarchy = await listAssetHierarchy(user.tenantId);
    return NextResponse.json(hierarchy);
  } catch (error) {
    const handled = handleRouteError(error);
    return NextResponse.json({ error: handled.message }, { status: handled.status });
  }
}
