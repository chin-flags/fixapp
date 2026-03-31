"use client";

import { FolderOpen, Network } from "lucide-react";
import { AssetTreeNode } from "./AssetTreeNode";
import { AddAssetForm } from "./AddAssetForm";
import type { AssetHierarchyNode } from "@/lib/db/queries/assets";

interface AssetTreeProps {
  hierarchy: AssetHierarchyNode[];
  onDelete: (id: string) => Promise<{ success: boolean; message: string }>;
  onUpdate: (
    id: string,
    payload: { name: string; location?: string; companyId?: string; photoUrl?: string },
  ) => Promise<{ success: boolean; message: string }>;
  onAdd: (formData: FormData) => Promise<{ success: boolean; message: string }>;
}

export function AssetTree({ hierarchy, onDelete, onAdd, onUpdate }: AssetTreeProps) {
  if (hierarchy.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center px-4 py-16">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
          <FolderOpen className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="mb-2 text-lg font-medium text-foreground">No asset nodes yet</h3>
        <p className="mb-6 max-w-sm text-center text-sm text-muted-foreground">
          Start with any root node and build the hierarchy you need. Each node can be assigned its own type.
        </p>
        <AddAssetForm
          onAdd={onAdd}
          trigger={
            <button className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90">
              <Network className="h-4 w-4" />
              Add Root Node
            </button>
          }
        />
      </div>
    );
  }

  return (
    <div className="space-y-1">
      <div className="mb-4 flex items-center justify-between border-b border-border pb-3">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Network className="h-4 w-4" />
          <span className="text-sm font-medium">Flexible Asset Hierarchy</span>
        </div>
        <AddAssetForm
          onAdd={onAdd}
          trigger={
            <button className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">
              <Network className="h-3.5 w-3.5" />
              Add Root Node
            </button>
          }
        />
      </div>

      {hierarchy.map((node) => (
        <AssetTreeNode
          key={node.id}
          node={node}
          onDelete={onDelete}
          onUpdate={onUpdate}
          onAdd={onAdd}
          depth={0}
        />
      ))}
    </div>
  );
}
