import { NextRequest, NextResponse } from "next/server";
import {
  deleteAssetRecord,
  handleRouteError,
  requireTenantSession,
  updateAssetRecord,
} from "@/lib/server/frontend-assets";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await requireTenantSession();
    const { id } = await params;
    const body = await request.json();
    const name = String(body.name ?? "").trim();

    if (!name) {
      return NextResponse.json({ error: "Asset name is required" }, { status: 400 });
    }

    const updated = await updateAssetRecord({
      tenantId: user.tenantId,
      id,
      name,
      location: typeof body.location === "string" ? body.location : undefined,
      companyId: typeof body.companyId === "string" ? body.companyId : undefined,
      photoUrl: typeof body.photoUrl === "string" ? body.photoUrl : undefined,
    });

    if (!updated) {
      return NextResponse.json({ error: "Asset not found" }, { status: 404 });
    }

    return NextResponse.json(updated);
  } catch (error) {
    const handled = handleRouteError(error);
    return NextResponse.json({ error: handled.message }, { status: handled.status });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await requireTenantSession();
    const { id } = await params;
    const deleted = await deleteAssetRecord({ tenantId: user.tenantId, id });

    if (!deleted) {
      return NextResponse.json({ error: "Asset not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    const handled = handleRouteError(error);
    return NextResponse.json({ error: handled.message }, { status: handled.status });
  }
}
