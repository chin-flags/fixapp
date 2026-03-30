import { NextRequest, NextResponse } from "next/server";
import {
  handleRouteError,
  requireTenantSession,
  updateTeamMemberRecord,
} from "@/lib/server/frontend-account";

type Props = {
  params: Promise<{
    memberId: string;
  }>;
};

export async function PATCH(request: NextRequest, { params }: Props) {
  try {
    const user = await requireTenantSession({ admin: true });
    const { memberId } = await params;
    const body = await request.json();

    const member = await updateTeamMemberRecord({
      tenantId: user.tenantId,
      memberId,
      role: typeof body.role === "string" ? body.role : undefined,
      tenantRoleId:
        body.tenantRoleId === null || typeof body.tenantRoleId === "string"
          ? body.tenantRoleId
          : undefined,
      responsibilityProfile:
        body.responsibilityProfile === null ||
        typeof body.responsibilityProfile === "object"
          ? body.responsibilityProfile
          : undefined,
      isActive: typeof body.isActive === "boolean" ? body.isActive : undefined,
    });

    return NextResponse.json(member);
  } catch (error) {
    const handled = handleRouteError(error);
    return NextResponse.json({ error: handled.message }, { status: handled.status });
  }
}
