import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { auth } from "@/lib/auth/config";
import { db } from "@/lib/db";
import { rcaTeamMembers, rcas } from "@/lib/db/schema";
import { getRcaDetailForTenantUser } from "@/lib/server/operations-records";

type RouteContext = {
  params: Promise<{ id: string; memberId: string }>;
};

function canManageRcaTeam(role: string, ownerId: string | null, userId: string) {
  return role === "admin" || role === "country_leader" || (role === "rca_owner" && ownerId === userId);
}

function isSchemaGap(error: unknown) {
  return (
    !!error &&
    typeof error === "object" &&
    "code" in error &&
    ["42P01", "42703"].includes((error as { code?: string }).code ?? "")
  );
}

export async function POST(_: Request, context: RouteContext) {
  const session = await auth();

  if (!session?.user?.tenantId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id, memberId } = await context.params;

  try {
    const rca = await db.query.rcas.findFirst({
      where: and(eq(rcas.id, id), eq(rcas.tenantId, session.user.tenantId)),
      columns: {
        id: true,
        ownerId: true,
      },
    });

    if (!rca) {
      return NextResponse.json({ error: "RCA not found." }, { status: 404 });
    }

    if (!canManageRcaTeam(session.user.role, rca.ownerId ?? null, session.user.id)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await db
      .delete(rcaTeamMembers)
      .where(and(eq(rcaTeamMembers.rcaId, id), eq(rcaTeamMembers.userId, memberId)));

    const detail = await getRcaDetailForTenantUser(
      {
        id: session.user.id,
        tenantId: session.user.tenantId,
        role: session.user.role,
      },
      id,
    );

    if (!detail) {
      return NextResponse.json({ error: "RCA not found after update." }, { status: 404 });
    }

    return NextResponse.json(detail);
  } catch (error) {
    if (isSchemaGap(error)) {
      return NextResponse.json(
        { error: "RCA collaboration tables are not available in this database yet." },
        { status: 501 },
      );
    }

    throw error;
  }
}
