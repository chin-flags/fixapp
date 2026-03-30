"use client";

import { Globe, FolderOpen } from "lucide-react";

import { AssetTreeNode, AssetNodeType } from "./AssetTreeNode";
import { AddAssetForm } from "./AddAssetForm";
import type { AssetHierarchyCountry } from "@/lib/db/queries/assets";

interface AssetTreeProps {
  hierarchy: AssetHierarchyCountry[];
  onDelete: {
    country: (id: string) => Promise<{ success: boolean; message: string }>;
    plant: (id: string) => Promise<{ success: boolean; message: string }>;
    area: (id: string) => Promise<{ success: boolean; message: string }>;
    equipment: (id: string) => Promise<{ success: boolean; message: string }>;
  };
  onUpdate: (id: string, payload: { name: string; location?: string; companyId?: string; photoUrl?: string }) => Promise<{ success: boolean; message: string }>;
  onAdd: {
    country: (formData: FormData) => Promise<{ success: boolean; message: string }>;
    plant: (formData: FormData) => Promise<{ success: boolean; message: string }>;
    area: (formData: FormData) => Promise<{ success: boolean; message: string }>;
    equipment: (formData: FormData) => Promise<{ success: boolean; message: string }>;
  };
}

export function AssetTree({ hierarchy, onDelete, onAdd, onUpdate }: AssetTreeProps) {
  const handleDelete = async (id: string, type: AssetNodeType) => {
    return onDelete[type](id);
  };

  if (hierarchy.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-800/50">
          <FolderOpen className="h-8 w-8 text-slate-500" />
        </div>
        <h3 className="mb-2 text-lg font-medium text-slate-200">No assets yet</h3>
        <p className="mb-6 max-w-sm text-center text-sm text-slate-400">
          Start building your asset hierarchy by adding your first country. You can then add plants, areas, and equipment.
        </p>
        <AddAssetForm
          level="country"
          onAdd={onAdd.country}
          trigger={
            <button className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700">
              <Globe className="h-4 w-4" />
              Add Country
            </button>
          }
        />
      </div>
    );
  }

  return (
    <div className="space-y-1">
      <div className="mb-4 flex items-center justify-between border-b border-slate-800/50 pb-3">
        <div className="flex items-center gap-2 text-slate-400">
          <Globe className="h-4 w-4" />
          <span className="text-sm font-medium">Asset Hierarchy</span>
        </div>
        <AddAssetForm
          level="country"
          onAdd={onAdd.country}
          trigger={
            <button className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm text-slate-400 transition-colors hover:bg-slate-800/50 hover:text-slate-200">
              <Globe className="h-3.5 w-3.5" />
              Add Country
            </button>
          }
        />
      </div>

      {hierarchy.map((country) => (
        <AssetTreeNode
          key={country.id}
          node={country}
          type="country"
          onDelete={handleDelete}
          onUpdate={onUpdate}
          onAdd={{
            plant: onAdd.plant,
            area: onAdd.area,
            equipment: onAdd.equipment,
          }}
          depth={0}
        >
          {country.plants?.map((plant) => (
            <AssetTreeNode
              key={plant.id}
              node={plant}
              type="plant"
              onDelete={handleDelete}
              onUpdate={onUpdate}
              onAdd={{
                area: onAdd.area,
                equipment: onAdd.equipment,
              }}
              depth={1}
            >
              {plant.areas?.map((area) => (
                <AssetTreeNode
                  key={area.id}
                  node={area}
                  type="area"
                  onDelete={handleDelete}
                  onUpdate={onUpdate}
                  onAdd={{
                    equipment: onAdd.equipment,
                  }}
                  depth={2}
                >
                  {area.equipment?.map((equipment) => (
                    <AssetTreeNode
                      key={equipment.id}
                      node={equipment}
                      type="equipment"
                      onDelete={handleDelete}
                      onUpdate={onUpdate}
                      onAdd={{}}
                      depth={3}
                    />
                  ))}
                </AssetTreeNode>
              ))}
            </AssetTreeNode>
          ))}
        </AssetTreeNode>
      ))}
    </div>
  );
}
