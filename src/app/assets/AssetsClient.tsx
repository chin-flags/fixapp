"use client";

import { useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";

import { AppShell } from "@/components/app-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AssetTree } from "@/components/assets/AssetTree";
import { createAssetNode, deleteAssetNode, fetchAssetHierarchy, updateAssetNode } from "@/lib/backend-api";
import type { AssetHierarchyNode, AssetNodeType } from "@/lib/db/queries/assets";

export default function AssetsClient() {
  const { data: session } = useSession();
  const [hierarchy, setHierarchy] = useState<AssetHierarchyNode[]>([]);
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
    const counts: Record<AssetNodeType, number> = {
      country: 0,
      plant: 0,
      area: 0,
      equipment: 0,
    };

    const walk = (nodes: AssetHierarchyNode[]) => {
      for (const node of nodes) {
        counts[node.type] += 1;
        walk(node.children);
      }
    };

    walk(hierarchy);
    return counts;
  }, [hierarchy]);

  const addAsset = async (formData: FormData) => {
    const name = String(formData.get("name") || "").trim();
    const type = String(formData.get("type") || "").trim() as AssetNodeType;
    const location = String(formData.get("location") || "").trim();
    const parentId = String(formData.get("parentId") || "").trim();
    const companyId = String(formData.get("companyId") || "").trim();
    const photoUrl = String(formData.get("photoUrl") || "").trim();
    if (!name || !["country", "plant", "area", "equipment"].includes(type)) {
      return { success: false, message: "Name is required." };
    }

    if (!session?.user?.accessToken) {
      return { success: false, message: "You must be signed in." };
    }

    const result = await createAssetNode(session.user.accessToken, {
      name,
      type,
      parentId: parentId || undefined,
      location: location || undefined,
      companyId: companyId || undefined,
      photoUrl: photoUrl || undefined,
    });

    if (result.success) {
      await refreshHierarchy();
    }

    return result;
  };

  const deleteAsset = async (id: string) => {
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
          Countries {stats.country} • Plants {stats.plant} • Areas {stats.area} • Equipment {stats.equipment}
        </div>
      }
    >
      <Card className="border-border/80 bg-card/90 backdrop-blur">
        <CardHeader>
          <CardTitle>Asset Hierarchy</CardTitle>
          <p className="text-sm text-muted-foreground">
            Build a flexible hierarchy. Each node can be any supported type and children choose their own type when created.
          </p>
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
              onAdd={addAsset}
              onDelete={deleteAsset}
              onUpdate={updateAsset}
            />
          )}
        </CardContent>
      </Card>
    </AppShell>
  );
}
