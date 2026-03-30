"use client";

import * as React from "react";

export type AssetFormLevel = "country" | "plant" | "area" | "equipment";

interface AddAssetFormProps {
  level: AssetFormLevel;
  onAdd: (formData: FormData) => Promise<{ success: boolean; message: string }>;
  trigger: React.ReactNode;
  parentId?: string;
}

const LABELS: Record<AssetFormLevel, string> = {
  country: "Country",
  plant: "Plant",
  area: "Area",
  equipment: "Equipment",
};

export function AddAssetForm({ level, onAdd, trigger, parentId }: AddAssetFormProps) {
  const [open, setOpen] = React.useState(false);
  const [name, setName] = React.useState("");
  const [location, setLocation] = React.useState("");
  const [companyId, setCompanyId] = React.useState("");
  const [photoUrl, setPhotoUrl] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const reset = () => {
    setName("");
    setLocation("");
    setCompanyId("");
    setPhotoUrl("");
    setError(null);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError("Name is required.");
      return;
    }

    const formData = new FormData();
    formData.set("name", name.trim());
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
        <form className="space-y-3 rounded-lg border border-slate-800/70 bg-slate-900/40 p-3" onSubmit={handleSubmit}>
          <div className="text-xs font-semibold uppercase tracking-wide text-slate-400">
            Add {LABELS[level]}
          </div>
          {error ? (
            <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </div>
          ) : null}

          <div>
            <label className="block text-sm font-medium text-slate-200" htmlFor={`asset-name-${level}`}>
              Name
            </label>
            <input
              id={`asset-name-${level}`}
              type="text"
              className="mt-1 w-full rounded-md border border-slate-700 bg-slate-900/70 px-3 py-2 text-sm text-slate-100 outline-none focus:border-slate-400"
              value={name}
              onChange={(event) => setName(event.target.value)}
            />
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-slate-200" htmlFor={`asset-company-${level}`}>
                Company ID
              </label>
              <input
                id={`asset-company-${level}`}
                type="text"
                className="mt-1 w-full rounded-md border border-slate-700 bg-slate-900/70 px-3 py-2 text-sm text-slate-100 outline-none focus:border-slate-400"
                value={companyId}
                onChange={(event) => setCompanyId(event.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-200" htmlFor={`asset-location-${level}`}>
                Location
              </label>
              <input
                id={`asset-location-${level}`}
                type="text"
                className="mt-1 w-full rounded-md border border-slate-700 bg-slate-900/70 px-3 py-2 text-sm text-slate-100 outline-none focus:border-slate-400"
                value={location}
                onChange={(event) => setLocation(event.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-200" htmlFor={`asset-photo-${level}`}>
              Photo URL
            </label>
            <input
              id={`asset-photo-${level}`}
              type="text"
              className="mt-1 w-full rounded-md border border-slate-700 bg-slate-900/70 px-3 py-2 text-sm text-slate-100 outline-none focus:border-slate-400"
              value={photoUrl}
              onChange={(event) => setPhotoUrl(event.target.value)}
            />
          </div>

          <div className="flex items-center gap-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex flex-1 items-center justify-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isSubmitting ? "Saving..." : `Add ${LABELS[level]}`}
            </button>
            <button
              type="button"
              onClick={() => {
                reset();
                setOpen(false);
              }}
              className="inline-flex items-center justify-center rounded-md border border-slate-700 px-4 py-2 text-sm text-slate-300 hover:text-white"
            >
              Cancel
            </button>
          </div>
        </form>
      ) : null}
    </div>
  );
}
