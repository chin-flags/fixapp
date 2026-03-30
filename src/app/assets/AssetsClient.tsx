"use client";

import { useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";

import { AppShell } from "@/components/app-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AssetTree } from "@/components/assets/AssetTree";
import { createAssetNode, deleteAssetNode, fetchAssetHierarchy, updateAssetNode } from "@/lib/backend-api";
import type { AssetHierarchyCountry } from "@/lib/db/queries/assets";

export default function AssetsClient() {
  const { data: session } = useSession();
  const [hierarchy, setHierarchy] = useState<AssetHierarchyCountry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  const refreshHierarchy = async () => {
    if (!session?.user?.accessToken) return;
    setIsLoading(true);
    setLoadError(null);
    try {
      const data = await fetchAssetHierarchy(session.user.accessToken);
      setHierarchy(data);
    } catch (error) {
      setLoadError(error instanceof Error ? error.message : "Unable to load assets.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!session?.user?.accessToken) return;
    refreshHierarchy();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.user?.accessToken]);

  const stats = useMemo(() => {
    const countries = hierarchy.length;
    const plants = hierarchy.reduce((sum, country) => sum + (country.plants?.length || 0), 0);
    const areas = hierarchy.reduce(
      (sum, country) =>
        sum +
        (country.plants?.reduce((inner, plant) => inner + (plant.areas?.length || 0), 0) || 0),
      0
    );
    const equipment = hierarchy.reduce(
      (sum, country) =>
        sum +
        (country.plants?.reduce(
          (inner, plant) =>
            inner + (plant.areas?.reduce((inner2, area) => inner2 + (area.equipment?.length || 0), 0) || 0),
          0
        ) ||
          0),
      0
    );
    return { countries, plants, areas, equipment };
  }, [hierarchy]);

  const addCountry = async (formData: FormData) => {
    const name = String(formData.get("name") || "").trim();
    const location = String(formData.get("location") || "").trim();
    const companyId = String(formData.get("companyId") || "").trim();
    const photoUrl = String(formData.get("photoUrl") || "").trim();
    if (!name) {
      return { success: false, message: "Name is required." };
    }

    if (!session?.user?.accessToken) {
      return { success: false, message: "You must be signed in." };
    }

    const result = await createAssetNode(session.user.accessToken, {
      name,
      type: "country",
      location: location || undefined,
      companyId: companyId || undefined,
      photoUrl: photoUrl || undefined,
    });

    if (result.success) {
      await refreshHierarchy();
    }

    return result;
  };

  const addPlant = async (formData: FormData) => {
    const name = String(formData.get("name") || "").trim();
    const location = String(formData.get("location") || "").trim();
    const parentId = String(formData.get("parentId") || "").trim();
    const companyId = String(formData.get("companyId") || "").trim();
    const photoUrl = String(formData.get("photoUrl") || "").trim();
    if (!name || !parentId) {
      return { success: false, message: "Name and parent are required." };
    }

    if (!session?.user?.accessToken) {
      return { success: false, message: "You must be signed in." };
    }

    const result = await createAssetNode(session.user.accessToken, {
      name,
      type: "plant",
      parentId,
      location: location || undefined,
      companyId: companyId || undefined,
      photoUrl: photoUrl || undefined,
    });

    if (result.success) {
      await refreshHierarchy();
    }

    return result;
  };

  const addArea = async (formData: FormData) => {
    const name = String(formData.get("name") || "").trim();
    const location = String(formData.get("location") || "").trim();
    const parentId = String(formData.get("parentId") || "").trim();
    const companyId = String(formData.get("companyId") || "").trim();
    const photoUrl = String(formData.get("photoUrl") || "").trim();
    if (!name || !parentId) {
      return { success: false, message: "Name and parent are required." };
    }

    if (!session?.user?.accessToken) {
      return { success: false, message: "You must be signed in." };
    }

    const result = await createAssetNode(session.user.accessToken, {
      name,
      type: "area",
      parentId,
      location: location || undefined,
      companyId: companyId || undefined,
      photoUrl: photoUrl || undefined,
    });

    if (result.success) {
      await refreshHierarchy();
    }

    return result;
  };

  const addEquipment = async (formData: FormData) => {
    const name = String(formData.get("name") || "").trim();
    const location = String(formData.get("location") || "").trim();
    const parentId = String(formData.get("parentId") || "").trim();
    const companyId = String(formData.get("companyId") || "").trim();
    const photoUrl = String(formData.get("photoUrl") || "").trim();
    if (!name || !parentId) {
      return { success: false, message: "Name and parent are required." };
    }

    if (!session?.user?.accessToken) {
      return { success: false, message: "You must be signed in." };
    }

    const result = await createAssetNode(session.user.accessToken, {
      name,
      type: "equipment",
      parentId,
      location: location || undefined,
      companyId: companyId || undefined,
      photoUrl: photoUrl || undefined,
    });

    if (result.success) {
      await refreshHierarchy();
    }

    return result;
  };

  const deleteCountry = async (id: string) => {
    if (!session?.user?.accessToken) {
      return { success: false, message: "You must be signed in." };
    }
    const result = await deleteAssetNode(session.user.accessToken, id);
    if (result.success) {
      await refreshHierarchy();
    }
    return result;
  };

  const deletePlant = async (id: string) => {
    if (!session?.user?.accessToken) {
      return { success: false, message: "You must be signed in." };
    }
    const result = await deleteAssetNode(session.user.accessToken, id);
    if (result.success) {
      await refreshHierarchy();
    }
    return result;
  };

  const deleteArea = async (id: string) => {
    if (!session?.user?.accessToken) {
      return { success: false, message: "You must be signed in." };
    }
    const result = await deleteAssetNode(session.user.accessToken, id);
    if (result.success) {
      await refreshHierarchy();
    }
    return result;
  };

  const deleteEquipment = async (id: string) => {
    if (!session?.user?.accessToken) {
      return { success: false, message: "You must be signed in." };
    }
    const result = await deleteAssetNode(session.user.accessToken, id);
    if (result.success) {
      await refreshHierarchy();
    }
    return result;
  };

  const updateAsset = async (id: string, payload: { name: string; location?: string; companyId?: string; photoUrl?: string }) => {
    if (!session?.user?.accessToken) {
      return { success: false, message: "You must be signed in." };
    }
    const result = await updateAssetNode(session.user.accessToken, id, payload);
    if (result.success) {
      await refreshHierarchy();
    }
    return result;
  };

  return (
    <AppShell
      title="Asset Management"
      user={{
        name: session?.user?.email?.split("@")[0] || "Admin",
        email: session?.user?.email || "",
        role: session?.user?.role,
      }}
      actions={
        <div className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-3 py-1 text-xs text-muted-foreground">
          Countries {stats.countries} • Plants {stats.plants} • Areas {stats.areas} • Equipment {stats.equipment}
        </div>
      }
    >
      <Card className="border-border/80 bg-card/90 backdrop-blur">
        <CardHeader>
          <CardTitle>Asset Hierarchy</CardTitle>
        </CardHeader>
        <CardContent>
          {loadError ? (
            <div className="rounded-md border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
              {loadError}
            </div>
          ) : null}
          {isLoading ? (
            <div className="py-6 text-sm text-muted-foreground">Loading asset hierarchy...</div>
          ) : (
            <AssetTree
              hierarchy={hierarchy}
              onAdd={{
                country: addCountry,
                plant: addPlant,
                area: addArea,
                equipment: addEquipment,
              }}
              onDelete={{
                country: deleteCountry,
                plant: deletePlant,
                area: deleteArea,
                equipment: deleteEquipment,
              }}
              onUpdate={updateAsset}
            />
          )}
        </CardContent>
      </Card>
    </AppShell>
  );
}
