import { NextRequest, NextResponse } from "next/server";
import { handleRouteError, requireTenantSession } from "@/lib/server/frontend-account";
import { createRcaRecord } from "@/lib/server/operations-records";

export async function POST(request: NextRequest) {
  try {
    const user = await requireTenantSession();
    const formData = await request.formData();

    const title = String(formData.get("title") ?? "");
    const description = String(formData.get("description") ?? "");
    const equipmentName = String(formData.get("equipmentName") ?? "");
    const location = String(formData.get("location") ?? "");
    const maintenanceTicketIdRaw = formData.get("maintenanceTicketId");
    const ownerIdRaw = formData.get("ownerId");

    const maintenanceTicketId =
      typeof maintenanceTicketIdRaw === "string" && maintenanceTicketIdRaw
        ? maintenanceTicketIdRaw
        : null;
    const ownerId =
      typeof ownerIdRaw === "string" && ownerIdRaw ? ownerIdRaw : null;

    if (!description.trim() || !equipmentName.trim() || !location.trim()) {
      return NextResponse.json(
        { error: "Issue description, equipment, and location are required." },
        { status: 400 },
      );
    }

    const fallbackTitle = `${equipmentName.trim()} - ${location.trim()} - ${description
      .trim()
      .replace(/\s+/g, " ")
      .slice(0, 80)}`;

    const rca = await createRcaRecord({
      tenantId: user.tenantId,
      userId: user.id,
      title: title.trim() || fallbackTitle,
      description: description.trim(),
      equipmentName: equipmentName.trim(),
      location: location.trim(),
      ownerId: ownerId || null,
      maintenanceTicketId: maintenanceTicketId || null,
    });

    return NextResponse.json(rca, { status: 201 });
  } catch (error) {
    const handled = handleRouteError(error);
    return NextResponse.json({ error: handled.message }, { status: handled.status });
  }
}
