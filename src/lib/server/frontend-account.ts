import { compare, hash } from "bcryptjs";
import { randomBytes } from "crypto";
import { and, asc, desc, eq, gt } from "drizzle-orm";
import { auth } from "@/lib/auth/config";
import { db } from "@/lib/db";
import { tenantInvites, tenantRoles, tenants, users } from "@/lib/db/schema";

class RouteError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

function getDb() {
  return db as any;
}

function toIsoString(value: Date | string | null | undefined): string | null {
  if (!value) {
    return null;
  }

  return value instanceof Date ? value.toISOString() : new Date(value).toISOString();
}

function getAppBaseUrl(): string {
  if (process.env.NEXTAUTH_URL) {
    return process.env.NEXTAUTH_URL;
  }

  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL;
  }

  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }

  return "http://localhost:3000";
}

function createInviteLink(inviteToken: string): string {
  return `${getAppBaseUrl()}/join/${inviteToken}`;
}

function createPasswordResetLink(email: string, token: string): string {
  const url = new URL("/reset-password", getAppBaseUrl());
  url.searchParams.set("email", email);
  url.searchParams.set("token", token);
  return url.toString();
}

function slugifyRoleName(name: string): string {
  const slug = name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return slug || "role";
}

async function createUniqueRoleSlug(tenantId: string, name: string): Promise<string> {
  const baseSlug = slugifyRoleName(name);
  const dbAny = getDb();
  const existingRoles = await dbAny.query.tenantRoles.findMany({
    where: eq(tenantRoles.tenantId, tenantId),
    columns: {
      slug: true,
    },
  });
  const existingSlugs = new Set(existingRoles.map((role: { slug: string }) => role.slug));

  if (!existingSlugs.has(baseSlug)) {
    return baseSlug;
  }

  let suffix = 2;
  while (existingSlugs.has(`${baseSlug}-${suffix}`)) {
    suffix += 1;
  }

  return `${baseSlug}-${suffix}`;
}

export async function requireTenantSession(options?: { admin?: boolean }) {
  const session = await auth();

  if (!session?.user?.id || !session.user.tenantId) {
    throw new RouteError(401, "Authentication required");
  }

  if (options?.admin && session.user.role !== "admin") {
    throw new RouteError(403, "Admin access required");
  }

  return session.user;
}

export function handleRouteError(error: unknown) {
  if (error instanceof RouteError) {
    return {
      status: error.status,
      message: error.message,
    };
  }

  console.error(error);
  return {
    status: 500,
    message: "Internal server error",
  };
}

export async function signupTenant(data: {
  email: string;
  password: string;
  name: string;
  tenantName: string;
  subdomain: string;
}) {
  const dbAny = getDb();
  const email = data.email.trim().toLowerCase();
  const subdomain = data.subdomain.trim().toLowerCase();
  const passwordHash = await hash(data.password, 10);

  const existingTenant = await dbAny.query.tenants.findFirst({
    where: eq(tenants.subdomain, subdomain),
  });

  if (existingTenant) {
    throw new RouteError(400, "Subdomain is already taken");
  }

  await db.transaction(async (tx) => {
    const [tenant] = await tx
      .insert(tenants)
      .values({
        name: data.tenantName.trim(),
        subdomain,
        isActive: true,
      })
      .returning();

    await tx.insert(users).values({
      tenantId: tenant.id,
      email,
      passwordHash,
      name: data.name.trim(),
      role: "admin",
      isActive: true,
    });
  });

  return { message: "Account created successfully" };
}

export async function issuePasswordReset(emailInput: string) {
  const email = emailInput.trim().toLowerCase();
  const dbAny = getDb();
  const user = await dbAny.query.users.findFirst({
    where: eq(users.email, email),
  });

  if (!user || !user.isActive) {
    return {
      message:
        "If an account exists with this email, you will receive a password reset link.",
    };
  }

  const token = randomBytes(24).toString("hex");
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

  await db
    .update(users)
    .set({
      passwordResetToken: token,
      passwordResetExpires: expiresAt,
      updatedAt: new Date(),
    })
    .where(eq(users.id, user.id));

  return {
    message:
      "If an account exists with this email, you will receive a password reset link.",
    resetUrl: createPasswordResetLink(email, token),
  };
}

export async function resetPassword(data: {
  email: string;
  token: string;
  password: string;
}) {
  const dbAny = getDb();
  const email = data.email.trim().toLowerCase();
  const user = await dbAny.query.users.findFirst({
    where: and(
      eq(users.email, email),
      eq(users.passwordResetToken, data.token),
      gt(users.passwordResetExpires, new Date()),
    ),
  });

  if (!user) {
    throw new RouteError(400, "Invalid or expired reset link");
  }

  await db
    .update(users)
    .set({
      passwordHash: await hash(data.password, 10),
      passwordResetToken: null,
      passwordResetExpires: null,
      updatedAt: new Date(),
    })
    .where(eq(users.id, user.id));

  return { message: "Password reset successful" };
}

export async function listTenantRoles(tenantId: string) {
  const dbAny = getDb();
  const roles = await dbAny.query.tenantRoles.findMany({
    where: eq(tenantRoles.tenantId, tenantId),
    orderBy: [asc(tenantRoles.name)],
  });

  return roles.map((role: any) => ({
    ...role,
    createdAt: toIsoString(role.createdAt),
    updatedAt: toIsoString(role.updatedAt),
  }));
}

export async function createTenantRoleRecord(data: {
  tenantId: string;
  userId: string;
  name: string;
  description?: string;
  responsibilityTemplate?: Record<string, unknown>;
  policyContext?: Record<string, unknown>;
}) {
  const slug = await createUniqueRoleSlug(data.tenantId, data.name);

  const [role] = await db
    .insert(tenantRoles)
    .values({
      tenantId: data.tenantId,
      name: data.name.trim(),
      slug,
      description: data.description?.trim() || null,
      responsibilityTemplate: data.responsibilityTemplate ?? null,
      policyContext: data.policyContext ?? null,
      createdById: data.userId,
      isActive: true,
      updatedAt: new Date(),
    })
    .returning();

  return {
    ...role,
    createdAt: toIsoString(role.createdAt),
    updatedAt: toIsoString(role.updatedAt),
  };
}

export async function listTenantInvites(tenantId: string) {
  const dbAny = getDb();
  const invites = await dbAny.query.tenantInvites.findMany({
    where: eq(tenantInvites.tenantId, tenantId),
    orderBy: [desc(tenantInvites.createdAt)],
  });

  return invites.map((invite: any) => ({
    ...invite,
    createdAt: toIsoString(invite.createdAt),
    updatedAt: toIsoString(invite.updatedAt),
    expiresAt: toIsoString(invite.expiresAt),
    acceptedAt: toIsoString(invite.acceptedAt),
    revokedAt: toIsoString(invite.revokedAt),
    inviteLink: createInviteLink(invite.inviteToken),
  }));
}

export async function createTenantInviteRecord(data: {
  tenantId: string;
  createdById: string;
  email: string;
  inviteeName?: string;
  tenantRoleId?: string;
  responsibilityProfile?: Record<string, unknown> | null;
  deliveryMethod?: "link" | "email";
  expiresInDays?: string;
}) {
  const dbAny = getDb();
  const email = data.email.trim().toLowerCase();
  const expiresInDays = Number.parseInt(data.expiresInDays || "7", 10);
  const safeDays = Number.isFinite(expiresInDays) && expiresInDays > 0 ? expiresInDays : 7;

  if (data.tenantRoleId) {
    const tenantRole = await dbAny.query.tenantRoles.findFirst({
      where: and(
        eq(tenantRoles.id, data.tenantRoleId),
        eq(tenantRoles.tenantId, data.tenantId),
      ),
    });

    if (!tenantRole) {
      throw new RouteError(400, "Selected custom role was not found");
    }
  }

  const [invite] = await db
    .insert(tenantInvites)
    .values({
      tenantId: data.tenantId,
      email,
      inviteeName: data.inviteeName?.trim() || null,
      inviteToken: randomBytes(24).toString("hex"),
      tenantRoleId: data.tenantRoleId || null,
      responsibilityProfile: data.responsibilityProfile ?? null,
      status: "pending",
      deliveryMethod: data.deliveryMethod || "link",
      expiresAt: new Date(Date.now() + safeDays * 24 * 60 * 60 * 1000),
      createdById: data.createdById,
      updatedAt: new Date(),
    })
    .returning();

  return {
    ...invite,
    createdAt: toIsoString(invite.createdAt),
    updatedAt: toIsoString(invite.updatedAt),
    expiresAt: toIsoString(invite.expiresAt),
    acceptedAt: toIsoString(invite.acceptedAt),
    revokedAt: toIsoString(invite.revokedAt),
    inviteLink: createInviteLink(invite.inviteToken),
  };
}

export async function revokeTenantInviteRecord(data: {
  tenantId: string;
  inviteId: string;
}) {
  const [invite] = await db
    .update(tenantInvites)
    .set({
      status: "revoked",
      revokedAt: new Date(),
      updatedAt: new Date(),
    })
    .where(
      and(
        eq(tenantInvites.id, data.inviteId),
        eq(tenantInvites.tenantId, data.tenantId),
      ),
    )
    .returning();

  if (!invite) {
    throw new RouteError(404, "Invite not found");
  }

  return {
    ...invite,
    createdAt: toIsoString(invite.createdAt),
    updatedAt: toIsoString(invite.updatedAt),
    expiresAt: toIsoString(invite.expiresAt),
    acceptedAt: toIsoString(invite.acceptedAt),
    revokedAt: toIsoString(invite.revokedAt),
    inviteLink: createInviteLink(invite.inviteToken),
  };
}

export async function listTeamMembers(tenantId: string) {
  const dbAny = getDb();
  const members = await dbAny.query.users.findMany({
    where: eq(users.tenantId, tenantId),
    with: {
      tenantRole: true,
    },
    orderBy: [asc(users.name)],
  });

  return members.map((member: any) => ({
    id: member.id,
    tenantId: member.tenantId,
    email: member.email,
    name: member.name,
    role: member.role,
    tenantRoleId: member.tenantRoleId,
    tenantRoleName: member.tenantRole?.name || null,
    responsibilityProfile: member.responsibilityProfile ?? null,
    isActive: member.isActive,
    createdAt: toIsoString(member.createdAt),
    updatedAt: toIsoString(member.updatedAt),
  }));
}

export async function updateTeamMemberRecord(data: {
  tenantId: string;
  memberId: string;
  role?: string;
  tenantRoleId?: string | null;
  responsibilityProfile?: Record<string, unknown> | null;
  isActive?: boolean;
}) {
  const dbAny = getDb();

  if (data.tenantRoleId) {
    const tenantRole = await dbAny.query.tenantRoles.findFirst({
      where: and(
        eq(tenantRoles.id, data.tenantRoleId),
        eq(tenantRoles.tenantId, data.tenantId),
      ),
    });

    if (!tenantRole) {
      throw new RouteError(400, "Selected custom role was not found");
    }
  }

  const [member] = await db
    .update(users)
    .set({
      ...(data.role !== undefined ? { role: data.role } : {}),
      ...(data.tenantRoleId !== undefined ? { tenantRoleId: data.tenantRoleId } : {}),
      ...(data.responsibilityProfile !== undefined
        ? { responsibilityProfile: data.responsibilityProfile }
        : {}),
      ...(data.isActive !== undefined ? { isActive: data.isActive } : {}),
      updatedAt: new Date(),
    })
    .where(and(eq(users.id, data.memberId), eq(users.tenantId, data.tenantId)))
    .returning();

  if (!member) {
    throw new RouteError(404, "Team member not found");
  }

  const tenantRole = member.tenantRoleId
    ? await dbAny.query.tenantRoles.findFirst({
        where: and(
          eq(tenantRoles.id, member.tenantRoleId),
          eq(tenantRoles.tenantId, data.tenantId),
        ),
      })
    : null;

  return {
    id: member.id,
    tenantId: member.tenantId,
    email: member.email,
    name: member.name,
    role: member.role,
    tenantRoleId: member.tenantRoleId,
    tenantRoleName: tenantRole?.name || null,
    responsibilityProfile: member.responsibilityProfile ?? null,
    isActive: member.isActive,
    createdAt: toIsoString(member.createdAt),
    updatedAt: toIsoString(member.updatedAt),
  };
}

export async function getInvitePreviewRecord(token: string) {
  const dbAny = getDb();
  const invite = await dbAny.query.tenantInvites.findFirst({
    where: eq(tenantInvites.inviteToken, token),
    with: {
      tenant: true,
      tenantRole: true,
    },
  });

  if (!invite) {
    return null;
  }

  if (invite.status !== "pending" || invite.revokedAt || invite.expiresAt < new Date()) {
    return null;
  }

  return {
    tenantName: invite.tenant.name,
    tenantSubdomain: invite.tenant.subdomain,
    email: invite.email,
    inviteeName: invite.inviteeName,
    roleName: invite.tenantRole?.name || null,
    status: invite.status,
    expiresAt: invite.expiresAt.toISOString(),
  };
}

export async function acceptInviteRecord(data: {
  token: string;
  password: string;
  name?: string;
}) {
  const dbAny = getDb();
  const invite = await dbAny.query.tenantInvites.findFirst({
    where: eq(tenantInvites.inviteToken, data.token),
    with: {
      tenant: true,
    },
  });

  if (!invite || invite.status !== "pending" || invite.revokedAt || invite.expiresAt < new Date()) {
    throw new RouteError(400, "This invite is invalid, expired, or revoked");
  }

  const existingUser = await dbAny.query.users.findFirst({
    where: and(
      eq(users.tenantId, invite.tenantId),
      eq(users.email, invite.email.toLowerCase()),
    ),
  });

  let acceptedUser = existingUser;

  if (existingUser) {
    if (!existingUser.passwordHash) {
      throw new RouteError(400, "This account is missing a password. Contact an administrator.");
    }

    const isValidPassword = await compare(data.password, existingUser.passwordHash);
    if (!isValidPassword) {
      throw new RouteError(400, "Existing account password is incorrect");
    }

    const [updatedUser] = await db
      .update(users)
      .set({
        name: data.name?.trim() || existingUser.name,
        role: existingUser.role || "team_member",
        tenantRoleId: invite.tenantRoleId || existingUser.tenantRoleId,
        responsibilityProfile:
          invite.responsibilityProfile ?? existingUser.responsibilityProfile ?? null,
        isActive: true,
        updatedAt: new Date(),
      })
      .where(eq(users.id, existingUser.id))
      .returning();

    acceptedUser = updatedUser;
  } else {
    const [createdUser] = await db
      .insert(users)
      .values({
        tenantId: invite.tenantId,
        email: invite.email.toLowerCase(),
        passwordHash: await hash(data.password, 10),
        name: data.name?.trim() || invite.inviteeName || invite.email.split("@")[0],
        role: "team_member",
        tenantRoleId: invite.tenantRoleId || null,
        responsibilityProfile: invite.responsibilityProfile ?? null,
        isActive: true,
      })
      .returning();

    acceptedUser = createdUser;
  }

  await db
    .update(tenantInvites)
    .set({
      status: "accepted",
      acceptedAt: new Date(),
      acceptedByUserId: acceptedUser.id,
      updatedAt: new Date(),
    })
    .where(eq(tenantInvites.id, invite.id));

  return {
    message: "Invite accepted successfully",
    tenantSubdomain: invite.tenant.subdomain,
    email: invite.email,
    isNewAccount: !existingUser,
  };
}
