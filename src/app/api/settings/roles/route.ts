import { NextRequest, NextResponse } from "next/server";
import {
  createTenantRoleRecord,
  handleRouteError,
  listTenantRoles,
  requireTenantSession,
} from "@/lib/server/frontend-account";

export async function GET() {
  try {
    const user = await requireTenantSession({ admin: true });
    const roles = await listTenantRoles(user.tenantId);
    return NextResponse.json(roles);
  } catch (error) {
    const handled = handleRouteError(error);
    return NextResponse.json({ error: handled.message }, { status: handled.status });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireTenantSession({ admin: true });
    const body = await request.json();
    const name = String(body.name ?? "").trim();

    if (!name) {
      return NextResponse.json({ error: "Role name is required" }, { status: 400 });
    }

    const role = await createTenantRoleRecord({
      tenantId: user.tenantId,
      userId: user.id,
      name,
      description:
        typeof body.description === "string" ? body.description : undefined,
      responsibilityTemplate:
        body.responsibilityTemplate &&
        typeof body.responsibilityTemplate === "object"
          ? body.responsibilityTemplate
          : undefined,
      policyContext:
        body.policyContext && typeof body.policyContext === "object"
          ? body.policyContext
          : undefined,
    });

    return NextResponse.json(role, { status: 201 });
  } catch (error) {
    const handled = handleRouteError(error);
    return NextResponse.json({ error: handled.message }, { status: handled.status });
  }
}
