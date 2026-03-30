import { and, asc, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { assets } from "@/lib/db/schema";
import type { AssetHierarchyCountry } from "@/lib/db/queries/assets";
import { handleRouteError, requireTenantSession } from "@/lib/server/frontend-account";

type AssetRow = {
  id: string;
  parentId: string | null;
  type: "country" | "plant" | "area" | "equipment";
  name: string;
  location: string | null;
  companyId: string | null;
  photoUrl: string | null;
};

function getDb() {
  return db as any;
}

function buildAssetHierarchy(rows: AssetRow[]): AssetHierarchyCountry[] {
  const countries = rows
    .filter((row) => row.type === "country")
    .map((country) => ({
      id: country.id,
      name: country.name,
      location: country.location,
      companyId: country.companyId,
      photoUrl: country.photoUrl,
      plants: rows
        .filter((row) => row.type === "plant" && row.parentId === country.id)
        .map((plant) => ({
          id: plant.id,
          name: plant.name,
          location: plant.location,
          companyId: plant.companyId,
          photoUrl: plant.photoUrl,
          areas: rows
            .filter((row) => row.type === "area" && row.parentId === plant.id)
            .map((area) => ({
              id: area.id,
              name: area.name,
              location: area.location,
              companyId: area.companyId,
              photoUrl: area.photoUrl,
              equipment: rows
                .filter((row) => row.type === "equipment" && row.parentId === area.id)
                .map((equipment) => ({
                  id: equipment.id,
                  name: equipment.name,
                  location: equipment.location,
                  companyId: equipment.companyId,
                  photoUrl: equipment.photoUrl,
                })),
            })),
        })),
    }));

  return countries;
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
  type: "country" | "plant" | "area" | "equipment";
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
