"use client";

import * as React from "react";
import { Building2, ChevronDown, ChevronRight, Cog, Globe, MapPin, Pencil, Plus, Trash2 } from "lucide-react";
import { AddAssetForm } from "./AddAssetForm";
import type { AssetHierarchyNode, AssetNodeType } from "@/lib/db/queries/assets";

type AssetTreeNodeProps = {
  node: AssetHierarchyNode;
  onDelete: (id: string) => Promise<{ success: boolean; message: string }>;
  onUpdate: (
    id: string,
    payload: { name: string; location?: string; companyId?: string; photoUrl?: string },
  ) => Promise<{ success: boolean; message: string }>;
  onAdd: (formData: FormData) => Promise<{ success: boolean; message: string }>;
  depth: number;
};

const ICONS: Record<AssetNodeType, React.ReactNode> = {
  country: <Globe className="h-4 w-4" />,
  plant: <Building2 className="h-4 w-4" />,
  area: <MapPin className="h-4 w-4" />,
  equipment: <Cog className="h-4 w-4" />,
};

export function AssetTreeNode({ node, onDelete, onUpdate, onAdd, depth }: AssetTreeNodeProps) {
  const [open, setOpen] = React.useState(true);
  const [isEditing, setIsEditing] = React.useState(false);
  const [name, setName] = React.useState(node.name);
  const [location, setLocation] = React.useState(node.location ?? "");
  const [companyId, setCompanyId] = React.useState(node.companyId ?? "");
  const [photoUrl, setPhotoUrl] = React.useState(node.photoUrl ?? "");
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    setName(node.name);
    setLocation(node.location ?? "");
    setCompanyId(node.companyId ?? "");
    setPhotoUrl(node.photoUrl ?? "");
  }, [node]);

  const handleUpdate = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    if (!name.trim()) {
      setError("Name is required.");
      return;
    }

    const result = await onUpdate(node.id, {
      name: name.trim(),
      location: location.trim() || undefined,
      companyId: companyId.trim() || undefined,
      photoUrl: photoUrl.trim() || undefined,
    });

    if (!result.success) {
      setError(result.message || "Unable to update.");
      return;
    }

    setIsEditing(false);
  };

  const hasChildren = node.children.length > 0;

  return (
    <div className="space-y-1">
      <div
        className="group flex items-start gap-3 rounded-xl border border-border bg-card px-4 py-3 text-foreground"
        style={{ marginLeft: `${depth * 20}px` }}
      >
        <button
          type="button"
          onClick={() => setOpen((prev) => !prev)}
          className="mt-0.5 text-muted-foreground hover:text-foreground"
          aria-label={open ? "Collapse" : "Expand"}
        >
          {hasChildren ? (open ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />) : (
            <span className="inline-block h-4 w-4" />
          )}
        </button>
        {node.photoUrl ? (
          <img src={node.photoUrl} alt={`${node.name} photo`} className="h-8 w-8 rounded-lg object-cover" />
        ) : (
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted text-muted-foreground">
            {ICONS[node.type]}
          </div>
        )}
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-foreground">{node.name}</span>
            <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] uppercase text-muted-foreground">
              {node.type}
            </span>
          </div>
          <div className="mt-1 text-xs text-muted-foreground">
            {node.companyId ? `ID ${node.companyId} • ` : ""}
            {node.location || "No location"}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <AddAssetForm
            parentId={node.id}
            parentName={node.name}
            onAdd={onAdd}
            trigger={
              <button
                className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-muted text-muted-foreground hover:text-foreground"
                title="Add child node"
              >
                <Plus className="h-4 w-4" />
              </button>
            }
          />
          <button
            type="button"
            onClick={() => setIsEditing((prev) => !prev)}
            className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-muted text-muted-foreground hover:text-foreground"
            title="Edit"
          >
            <Pencil className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => void onDelete(node.id)}
            className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-muted text-muted-foreground hover:text-foreground"
            title="Remove"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
      {isEditing ? (
        <form className="ml-10 space-y-3 rounded-lg border border-border bg-card p-3" onSubmit={handleUpdate}>
          {error ? (
            <div className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {error}
            </div>
          ) : null}
          <div>
            <label className="block text-sm font-medium text-foreground" htmlFor={`edit-name-${node.id}`}>
              Name
            </label>
            <input
              id={`edit-name-${node.id}`}
              type="text"
              className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-ring"
              value={name}
              onChange={(event) => setName(event.target.value)}
            />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-foreground" htmlFor={`edit-company-${node.id}`}>
                Company ID
              </label>
              <input
                id={`edit-company-${node.id}`}
                type="text"
                className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-ring"
                value={companyId}
                onChange={(event) => setCompanyId(event.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground" htmlFor={`edit-location-${node.id}`}>
                Location
              </label>
              <input
                id={`edit-location-${node.id}`}
                type="text"
                className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-ring"
                value={location}
                onChange={(event) => setLocation(event.target.value)}
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground" htmlFor={`edit-photo-${node.id}`}>
              Photo URL
            </label>
            <input
              id={`edit-photo-${node.id}`}
              type="text"
              className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-ring"
              value={photoUrl}
              onChange={(event) => setPhotoUrl(event.target.value)}
            />
          </div>
          <div className="flex items-center gap-2">
            <button
              type="submit"
              className="inline-flex flex-1 items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
            >
              Save
            </button>
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="inline-flex items-center justify-center rounded-md border border-border px-4 py-2 text-sm text-foreground hover:bg-muted"
            >
              Cancel
            </button>
          </div>
        </form>
      ) : null}
      {hasChildren && open ? (
        <div className="space-y-1">
          {node.children.map((child) => (
            <AssetTreeNode
              key={child.id}
              node={child}
              onDelete={onDelete}
              onUpdate={onUpdate}
              onAdd={onAdd}
              depth={depth + 1}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}
