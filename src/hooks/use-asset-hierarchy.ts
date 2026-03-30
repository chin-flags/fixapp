"use client";

import * as React from "react";

import { AssetNode, defaultAssetHierarchy } from "@/lib/asset-hierarchy";

const STORAGE_KEY = "fixapp.assetHierarchy.v1";

const safeParse = (value: string | null) => {
  if (!value) return null;
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? (parsed as AssetNode[]) : null;
  } catch (error) {
    console.warn("Failed to parse stored asset hierarchy", error);
    return null;
  }
};

export function useAssetHierarchy() {
  const [nodes, setNodes] = React.useState<AssetNode[]>(defaultAssetHierarchy);
  const [isReady, setIsReady] = React.useState(false);

  React.useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = safeParse(window.localStorage.getItem(STORAGE_KEY));
    if (stored && stored.length > 0) {
      setNodes(stored);
    }
    setIsReady(true);
  }, []);

  React.useEffect(() => {
    if (!isReady || typeof window === "undefined") return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(nodes));
  }, [nodes, isReady]);

  return { nodes, setNodes, isReady };
}
