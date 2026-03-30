import { NextRequest, NextResponse } from "next/server";
import {
  createAssetRecord,
  handleRouteError,
  requireTenantSession,
} from "@/lib/server/frontend-assets";

export async function POST(request: NextRequest) {
  try {
    const user = await requireTenantSession();
    const body = await request.json();
    const name = String(body.name ?? "").trim();
    const type = String(body.type ?? "").trim() as "country" | "plant" | "area" | "equipment";

    if (!name || !["country", "plant", "area", "equipment"].includes(type)) {
      return NextResponse.json({ error: "Valid asset name and type are required" }, { status: 400 });
    }

    const created = await createAssetRecord({
      tenantId: user.tenantId,
      name,
      type,
      parentId: typeof body.parentId === "string" ? body.parentId : undefined,
      location: typeof body.location === "string" ? body.location : undefined,
      companyId: typeof body.companyId === "string" ? body.companyId : undefined,
      photoUrl: typeof body.photoUrl === "string" ? body.photoUrl : undefined,
    });

    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    const handled = handleRouteError(error);
    return NextResponse.json({ error: handled.message }, { status: handled.status });
  }
}
