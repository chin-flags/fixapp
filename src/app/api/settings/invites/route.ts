import { NextRequest, NextResponse } from "next/server";
import {
  createTenantInviteRecord,
  handleRouteError,
  listTenantInvites,
  requireTenantSession,
} from "@/lib/server/frontend-account";

export async function GET() {
  try {
    const user = await requireTenantSession({ admin: true });
    const invites = await listTenantInvites(user.tenantId);
    return NextResponse.json(invites);
  } catch (error) {
    const handled = handleRouteError(error);
    return NextResponse.json({ error: handled.message }, { status: handled.status });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireTenantSession({ admin: true });
    const body = await request.json();
    const email = String(body.email ?? "").trim();

    if (!email) {
      return NextResponse.json({ error: "Invite email is required" }, { status: 400 });
    }

    const invite = await createTenantInviteRecord({
      tenantId: user.tenantId,
      createdById: user.id,
      email,
      inviteeName:
        typeof body.inviteeName === "string" ? body.inviteeName : undefined,
      tenantRoleId:
        typeof body.tenantRoleId === "string" ? body.tenantRoleId : undefined,
      responsibilityProfile:
        body.responsibilityProfile && typeof body.responsibilityProfile === "object"
          ? body.responsibilityProfile
          : null,
      deliveryMethod: body.deliveryMethod === "email" ? "email" : "link",
      expiresInDays:
        typeof body.expiresInDays === "string" ? body.expiresInDays : undefined,
    });

    return NextResponse.json(invite, { status: 201 });
  } catch (error) {
    const handled = handleRouteError(error);
    return NextResponse.json({ error: handled.message }, { status: handled.status });
  }
}
