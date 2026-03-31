"use client";

import * as React from "react";
import { Building2, ChevronDown, ChevronRight, Cog, Globe, MapPin } from "lucide-react";
import type { AssetHierarchyNode, AssetNodeType } from "@/lib/db/queries/assets";
import { cn } from "@/lib/utils";

export type ExplorerNode = AssetHierarchyNode & { nodeType: AssetNodeType };

type Props = {
  hierarchy: AssetHierarchyNode[];
  selectedId: string | null;
  onSelect: (node: ExplorerNode) => void;
};

const ICONS = {
  country: Globe,
  plant: Building2,
  area: MapPin,
  equipment: Cog,
} as const;

function toExplorerNodes(hierarchy: AssetHierarchyNode[]): ExplorerNode[] {
  return hierarchy.map((node): ExplorerNode => ({
    ...node,
    nodeType: node.type,
    children: toExplorerNodes(node.children),
  }));
}

export function findExplorerNodeById(nodes: ExplorerNode[], id: string | null): ExplorerNode | null {
  if (!id) return null;
  for (const node of nodes) {
    if (node.id === id) return node;
    const match = findExplorerNodeById(node.children as ExplorerNode[], id);
    if (match) return match;
  }
  return null;
}

function TreeRow({
  node,
  depth,
  expanded,
  toggle,
  selectedId,
  onSelect,
}: {
  node: ExplorerNode;
  depth: number;
  expanded: Set<string>;
  toggle: (id: string) => void;
  selectedId: string | null;
  onSelect: (node: ExplorerNode) => void;
}) {
  const hasChildren = node.children.length > 0;
  const isExpanded = expanded.has(node.id);
  const isSelected = selectedId === node.id;
  const Icon = ICONS[node.nodeType];

  return (
    <div>
      <button
        type="button"
        onClick={() => {
          onSelect(node);
          if (hasChildren) {
            toggle(node.id);
          }
        }}
        className={cn(
          "flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm transition-colors",
          isSelected
            ? "bg-primary/10 text-primary"
            : "text-foreground hover:bg-accent hover:text-accent-foreground",
        )}
        style={{ paddingLeft: `${depth * 16 + 8}px` }}
      >
        <span className="flex h-4 w-4 items-center justify-center text-muted-foreground">
          {hasChildren ? (
            isExpanded ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )
          ) : (
            <span className="h-4 w-4" />
          )}
        </span>
        <Icon className="h-4 w-4 text-muted-foreground" />
        <span className="min-w-0 flex-1 truncate">{node.name}</span>
        <span className="rounded-full border border-border px-2 py-0.5 text-[10px] uppercase tracking-wide text-muted-foreground">
          {node.nodeType}
        </span>
      </button>
      {hasChildren && isExpanded
        ? (node.children as ExplorerNode[]).map((child) => (
            <TreeRow
              key={child.id}
              node={child}
              depth={depth + 1}
              expanded={expanded}
              toggle={toggle}
              selectedId={selectedId}
              onSelect={onSelect}
            />
          ))
        : null}
    </div>
  );
}

export function AssetExplorerPicker({ hierarchy, selectedId, onSelect }: Props) {
  const nodes = React.useMemo(() => toExplorerNodes(hierarchy), [hierarchy]);
  const [expanded, setExpanded] = React.useState<Set<string>>(new Set());

  React.useEffect(() => {
    const initial = new Set<string>();
    const walk = (items: ExplorerNode[], depth: number) => {
      for (const item of items) {
        if (depth < 2 && item.children.length > 0) {
          initial.add(item.id);
        }
        walk(item.children as ExplorerNode[], depth + 1);
      }
    };
    walk(nodes, 0);
    setExpanded(initial);
  }, [nodes]);

  const toggle = (id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  if (nodes.length === 0) {
    return <p className="px-2 py-3 text-sm text-muted-foreground">No assets yet. Add assets in Asset Management first.</p>;
  }

  return (
    <div className="space-y-1">
      {nodes.map((node) => (
        <TreeRow
          key={node.id}
          node={node}
          depth={0}
          expanded={expanded}
          toggle={toggle}
          selectedId={selectedId}
          onSelect={onSelect}
        />
      ))}
    </div>
  );
}
