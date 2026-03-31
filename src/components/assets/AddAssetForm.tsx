"use client";

import * as React from "react";
import type { AssetNodeType } from "@/lib/db/queries/assets";

interface AddAssetFormProps {
  onAdd: (formData: FormData) => Promise<{ success: boolean; message: string }>;
  trigger: React.ReactNode;
  parentId?: string;
  parentName?: string;
}

const TYPE_OPTIONS: AssetNodeType[] = ["country", "plant", "area", "equipment"];

const LABELS: Record<AssetNodeType, string> = {
  country: "Country",
  plant: "Plant",
  area: "Area",
  equipment: "Equipment",
};

export function AddAssetForm({ onAdd, trigger, parentId, parentName }: AddAssetFormProps) {
  const [open, setOpen] = React.useState(false);
  const [name, setName] = React.useState("");
  const [type, setType] = React.useState<AssetNodeType>("equipment");
  const [location, setLocation] = React.useState("");
  const [companyId, setCompanyId] = React.useState("");
  const [photoUrl, setPhotoUrl] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const reset = () => {
    setName("");
    setType(parentId ? "equipment" : "country");
    setLocation("");
    setCompanyId("");
    setPhotoUrl("");
    setError(null);
  };

  React.useEffect(() => {
    setType(parentId ? "equipment" : "country");
  }, [parentId]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError("Name is required.");
      return;
    }

    const formData = new FormData();
    formData.set("name", name.trim());
    formData.set("type", type);
    formData.set("location", location.trim());
    formData.set("companyId", companyId.trim());
    formData.set("photoUrl", photoUrl.trim());
    if (parentId) {
      formData.set("parentId", parentId);
    }

    setIsSubmitting(true);
    const result = await onAdd(formData);
    setIsSubmitting(false);

    if (!result.success) {
      setError(result.message || "Unable to add asset.");
      return;
    }

    reset();
    setOpen(false);
  };

  const triggerNode = React.isValidElement<{ onClick?: React.MouseEventHandler }>(trigger)
    ? React.cloneElement(trigger, {
        onClick: (event) => {
          event.preventDefault();
          trigger.props.onClick?.(event);
          setOpen((prev) => !prev);
        },
      })
    : trigger;

  return (
    <div className="space-y-3">
      {triggerNode}
      {open ? (
        <form className="space-y-3 rounded-lg border border-border bg-card p-3" onSubmit={handleSubmit}>
          <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            {parentId ? `Add Child Node${parentName ? ` to ${parentName}` : ""}` : "Add Root Node"}
          </div>
          {error ? (
            <div className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {error}
            </div>
          ) : null}

          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-foreground" htmlFor={`asset-name-${parentId ?? "root"}`}>
                Name
              </label>
              <input
                id={`asset-name-${parentId ?? "root"}`}
                type="text"
                className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-ring"
                value={name}
                onChange={(event) => setName(event.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground" htmlFor={`asset-type-${parentId ?? "root"}`}>
                Node Type
              </label>
              <select
                id={`asset-type-${parentId ?? "root"}`}
                className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-ring"
                value={type}
                onChange={(event) => setType(event.target.value as AssetNodeType)}
              >
                {TYPE_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {LABELS[option]}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-foreground" htmlFor={`asset-company-${parentId ?? "root"}`}>
                Company ID
              </label>
              <input
                id={`asset-company-${parentId ?? "root"}`}
                type="text"
                className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-ring"
                value={companyId}
                onChange={(event) => setCompanyId(event.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground" htmlFor={`asset-location-${parentId ?? "root"}`}>
                Location
              </label>
              <input
                id={`asset-location-${parentId ?? "root"}`}
                type="text"
                className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-ring"
                value={location}
                onChange={(event) => setLocation(event.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground" htmlFor={`asset-photo-${parentId ?? "root"}`}>
              Photo URL
            </label>
            <input
              id={`asset-photo-${parentId ?? "root"}`}
              type="text"
              className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-ring"
              value={photoUrl}
              onChange={(event) => setPhotoUrl(event.target.value)}
            />
          </div>

          <div className="flex items-center gap-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex flex-1 items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isSubmitting ? "Saving..." : `Add ${LABELS[type]}`}
            </button>
            <button
              type="button"
              onClick={() => {
                reset();
                setOpen(false);
              }}
              className="inline-flex items-center justify-center rounded-md border border-border px-4 py-2 text-sm text-foreground hover:bg-muted"
            >
              Cancel
            </button>
          </div>
        </form>
      ) : null}
    </div>
  );
}
