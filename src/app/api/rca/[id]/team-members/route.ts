import { NextRequest, NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { auth } from "@/lib/auth/config";
import { db } from "@/lib/db";
import { rcaTeamMembers, rcas, users } from "@/lib/db/schema";
import { getRcaDetailForTenantUser } from "@/lib/server/operations-records";

type RouteContext = {
  params: Promise<{ id: string }>;
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

export async function POST(request: NextRequest, context: RouteContext) {
  const session = await auth();

  if (!session?.user?.tenantId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;
  const body = await request.json().catch(() => ({}));
  const userId = typeof body.userId === "string" ? body.userId : "";

  if (!userId) {
    return NextResponse.json({ error: "userId is required." }, { status: 400 });
  }

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

    const member = await db.query.users.findFirst({
      where: and(
        eq(users.id, userId),
        eq(users.tenantId, session.user.tenantId),
        eq(users.isActive, true),
      ),
      columns: {
        id: true,
      },
    });

    if (!member) {
      return NextResponse.json({ error: "Team member not found." }, { status: 404 });
    }

    await db
      .insert(rcaTeamMembers)
      .values({
        rcaId: id,
        userId,
      })
      .onConflictDoNothing();

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
