import { NextResponse } from "next/server";
import { handleRouteError, requireTenantSession } from "@/lib/server/frontend-account";

export async function GET() {
  try {
    await requireTenantSession();
    return NextResponse.json({
      priorityWeights: { low: 1, medium: 2, high: 3, critical: 5 },
      impactWeights: { low: 1, medium: 2, high: 3, critical: 5 },
      rcaThreshold: 5,
      autoFlagCritical: true,
    });
  } catch (error) {
    const handled = handleRouteError(error);
    return NextResponse.json({ error: handled.message }, { status: handled.status });
  }
}
