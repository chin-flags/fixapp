import { NextResponse } from "next/server";
import {
  handleRouteError,
  requireTenantSession,
  revokeTenantInviteRecord,
} from "@/lib/server/frontend-account";

type Props = {
  params: Promise<{
    inviteId: string;
  }>;
};

export async function POST(_request: Request, { params }: Props) {
  try {
    const user = await requireTenantSession({ admin: true });
    const { inviteId } = await params;
    const invite = await revokeTenantInviteRecord({
      tenantId: user.tenantId,
      inviteId,
    });
    return NextResponse.json(invite);
  } catch (error) {
    const handled = handleRouteError(error);
    return NextResponse.json({ error: handled.message }, { status: handled.status });
  }
}
