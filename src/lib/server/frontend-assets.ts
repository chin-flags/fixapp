import { and, asc, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { assets } from "@/lib/db/schema";
import type { AssetHierarchyNode, AssetNodeType } from "@/lib/db/queries/assets";
import { handleRouteError, requireTenantSession } from "@/lib/server/frontend-account";

type AssetRow = {
  id: string;
  parentId: string | null;
  type: AssetNodeType;
  name: string;
  location: string | null;
  companyId: string | null;
  photoUrl: string | null;
};

function getDb() {
  return db as any;
}

function buildAssetHierarchy(rows: AssetRow[]): AssetHierarchyNode[] {
  const byParent = new Map<string | null, AssetRow[]>();

  for (const row of rows) {
    const current = byParent.get(row.parentId) ?? [];
    current.push(row);
    byParent.set(row.parentId, current);
  }

  const buildNode = (row: AssetRow): AssetHierarchyNode => ({
    id: row.id,
    parentId: row.parentId,
    type: row.type,
    name: row.name,
    location: row.location,
    companyId: row.companyId,
    photoUrl: row.photoUrl,
    children: (byParent.get(row.id) ?? []).map(buildNode),
  });

  return (byParent.get(null) ?? []).map(buildNode);
}

export async function listAssetHierarchy(tenantId: string) {
  const rows = await getDb().query.assets.findMany({
    where: eq(assets.tenantId, tenantId),
    columns: {
      id: true,
      parentId: true,
      type: true,
      name: true,
      location: true,
      companyId: true,
      photoUrl: true,
    },
    orderBy: [asc(assets.type), asc(assets.name)],
  });

  return buildAssetHierarchy(rows as AssetRow[]);
}

export async function createAssetRecord(input: {
  tenantId: string;
  name: string;
  type: AssetNodeType;
  parentId?: string;
  location?: string;
  companyId?: string;
  photoUrl?: string;
}) {
  const [created] = await db
    .insert(assets)
    .values({
      tenantId: input.tenantId,
      name: input.name.trim(),
      type: input.type,
      parentId: input.parentId || null,
      location: input.location?.trim() || null,
      companyId: input.companyId?.trim() || null,
      photoUrl: input.photoUrl?.trim() || null,
    })
    .returning();

  return created;
}

export async function updateAssetRecord(input: {
  tenantId: string;
  id: string;
  name: string;
  location?: string;
  companyId?: string;
  photoUrl?: string;
}) {
  const [updated] = await db
    .update(assets)
    .set({
      name: input.name.trim(),
      location: input.location?.trim() || null,
      companyId: input.companyId?.trim() || null,
      photoUrl: input.photoUrl?.trim() || null,
      updatedAt: new Date(),
    })
    .where(and(eq(assets.id, input.id), eq(assets.tenantId, input.tenantId)))
    .returning();

  return updated ?? null;
}

export async function deleteAssetRecord(input: { tenantId: string; id: string }) {
  const existingChild = await getDb().query.assets.findFirst({
    where: eq(assets.parentId, input.id),
    columns: { id: true },
  });

  if (existingChild) {
    throw new Error("Remove child assets before deleting this node.");
  }

  const [deleted] = await db
    .delete(assets)
    .where(and(eq(assets.id, input.id), eq(assets.tenantId, input.tenantId)))
    .returning();

  return deleted ?? null;
}

export { handleRouteError, requireTenantSession };
