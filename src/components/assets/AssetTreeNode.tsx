"use client";

import * as React from "react";
import { Building2, ChevronDown, ChevronRight, Cog, Globe, MapPin, Pencil, Plus, Trash2 } from "lucide-react";

import { AddAssetForm, AssetFormLevel } from "./AddAssetForm";
import type { AssetHierarchyArea, AssetHierarchyCountry, AssetHierarchyEquipment, AssetHierarchyPlant } from "@/lib/db/queries/assets";

export type AssetNodeType = "country" | "plant" | "area" | "equipment";

type AssetNode = AssetHierarchyCountry | AssetHierarchyPlant | AssetHierarchyArea | AssetHierarchyEquipment;

type AddHandlers = Partial<Record<AssetFormLevel, (formData: FormData) => Promise<{ success: boolean; message: string }>>>;

type AssetTreeNodeProps = {
  node: AssetNode;
  type: AssetNodeType;
  onDelete: (id: string, type: AssetNodeType) => Promise<{ success: boolean; message: string }>;
  onUpdate: (id: string, payload: { name: string; location?: string; companyId?: string; photoUrl?: string }) => Promise<{ success: boolean; message: string }>;
  onAdd: AddHandlers;
  depth: number;
  children?: React.ReactNode;
};

const ICONS: Record<AssetNodeType, React.ReactNode> = {
  country: <Globe className="h-4 w-4" />,
  plant: <Building2 className="h-4 w-4" />,
  area: <MapPin className="h-4 w-4" />,
  equipment: <Cog className="h-4 w-4" />,
};

const CHILD_LEVEL: Record<AssetNodeType, AssetFormLevel | null> = {
  country: "plant",
  plant: "area",
  area: "equipment",
  equipment: null,
};

export function AssetTreeNode({ node, type, onDelete, onUpdate, onAdd, depth, children }: AssetTreeNodeProps) {
  const [open, setOpen] = React.useState(true);
  const [isEditing, setIsEditing] = React.useState(false);
  const [name, setName] = React.useState(node.name);
  const [location, setLocation] = React.useState("location" in node && node.location ? node.location : "");
  const [companyId, setCompanyId] = React.useState("companyId" in node && node.companyId ? node.companyId : "");
  const [photoUrl, setPhotoUrl] = React.useState("photoUrl" in node && node.photoUrl ? node.photoUrl : "");
  const [error, setError] = React.useState<string | null>(null);
  const childLevel = CHILD_LEVEL[type];

  const handleDelete = async () => {
    await onDelete(node.id, type);
  };

  React.useEffect(() => {
    setName(node.name);
    setLocation("location" in node && node.location ? node.location : "");
    setCompanyId("companyId" in node && node.companyId ? node.companyId : "");
    setPhotoUrl("photoUrl" in node && node.photoUrl ? node.photoUrl : "");
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

  return (
    <div className="space-y-1">
      <div
        className="group flex items-start gap-3 rounded-xl border border-slate-800/70 bg-slate-900/40 px-4 py-3 text-slate-100"
        style={{ marginLeft: `${depth * 20}px` }}
      >
        <button
          type="button"
          onClick={() => setOpen((prev) => !prev)}
          className="mt-0.5 text-slate-400 hover:text-slate-200"
          aria-label={open ? "Collapse" : "Expand"}
        >
          {children ? (open ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />) : (
            <span className="inline-block h-4 w-4" />
          )}
        </button>
        {("photoUrl" in node && node.photoUrl) ? (
          <img
            src={node.photoUrl}
            alt={`${node.name} photo`}
            className="h-8 w-8 rounded-lg object-cover"
          />
        ) : (
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-800/70 text-slate-300">
            {ICONS[type]}
          </div>
        )}
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-slate-100">{node.name}</span>
            <span className="rounded-full bg-slate-800 px-2 py-0.5 text-[10px] uppercase text-slate-400">
              {type}
            </span>
          </div>
          <div className="mt-1 text-xs text-slate-400">
            {"companyId" in node && node.companyId ? `ID ${node.companyId} • ` : ""}
            {"location" in node && node.location ? node.location : "No location"}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {childLevel && onAdd[childLevel] ? (
            <AddAssetForm
              level={childLevel}
              parentId={node.id}
              onAdd={onAdd[childLevel] as (formData: FormData) => Promise<{ success: boolean; message: string }>}
              trigger={
                <button
                  className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-slate-800/70 text-slate-300 hover:text-white"
                  title="Add child"
                >
                  <Plus className="h-4 w-4" />
                </button>
              }
            />
          ) : null}
          <button
            type="button"
            onClick={() => setIsEditing((prev) => !prev)}
            className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-slate-800/70 text-slate-300 hover:text-white"
            title="Edit"
          >
            <Pencil className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={handleDelete}
            className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-slate-800/70 text-slate-300 hover:text-white"
            title="Remove"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
      {isEditing ? (
        <form
          className="ml-10 space-y-3 rounded-lg border border-slate-800/70 bg-slate-900/40 p-3"
          onSubmit={handleUpdate}
        >
          {error ? (
            <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </div>
          ) : null}
          <div>
            <label className="block text-sm font-medium text-slate-200" htmlFor={`edit-name-${node.id}`}>
              Name
            </label>
            <input
              id={`edit-name-${node.id}`}
              type="text"
              className="mt-1 w-full rounded-md border border-slate-700 bg-slate-900/70 px-3 py-2 text-sm text-slate-100 outline-none focus:border-slate-400"
              value={name}
              onChange={(event) => setName(event.target.value)}
            />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-slate-200" htmlFor={`edit-company-${node.id}`}>
                Company ID
              </label>
              <input
                id={`edit-company-${node.id}`}
                type="text"
                className="mt-1 w-full rounded-md border border-slate-700 bg-slate-900/70 px-3 py-2 text-sm text-slate-100 outline-none focus:border-slate-400"
                value={companyId}
                onChange={(event) => setCompanyId(event.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-200" htmlFor={`edit-location-${node.id}`}>
                Location
              </label>
              <input
                id={`edit-location-${node.id}`}
                type="text"
                className="mt-1 w-full rounded-md border border-slate-700 bg-slate-900/70 px-3 py-2 text-sm text-slate-100 outline-none focus:border-slate-400"
                value={location}
                onChange={(event) => setLocation(event.target.value)}
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-200" htmlFor={`edit-photo-${node.id}`}>
              Photo URL
            </label>
            <input
              id={`edit-photo-${node.id}`}
              type="text"
              className="mt-1 w-full rounded-md border border-slate-700 bg-slate-900/70 px-3 py-2 text-sm text-slate-100 outline-none focus:border-slate-400"
              value={photoUrl}
              onChange={(event) => setPhotoUrl(event.target.value)}
            />
          </div>
          <div className="flex items-center gap-2">
            <button
              type="submit"
              className="inline-flex flex-1 items-center justify-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
            >
              Save
            </button>
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="inline-flex items-center justify-center rounded-md border border-slate-700 px-4 py-2 text-sm text-slate-300 hover:text-white"
            >
              Cancel
            </button>
          </div>
        </form>
      ) : null}
      {children && open ? <div className="space-y-1">{children}</div> : null}
    </div>
  );
}
