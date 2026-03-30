export type AssetType = "asset" | "machinery";

export type AssetNode = {
  id: string;
  name: string;
  type: AssetType;
  location?: string;
  children?: AssetNode[];
};

export type FlatAssetNode = {
  id: string;
  name: string;
  type: AssetType;
  location?: string;
  depth: number;
  label: string;
};

export const defaultAssetHierarchy: AssetNode[] = [
  {
    id: "ASSET-001",
    name: "Plant 01",
    type: "asset",
    location: "Colombo",
    children: [
      {
        id: "ASSET-001-01",
        name: "Packaging Line",
        type: "asset",
        location: "Bay A",
        children: [
          {
            id: "ASSET-001-01-01",
            name: "Conveyor A",
            type: "machinery",
            location: "Line 1",
          },
          {
            id: "ASSET-001-01-02",
            name: "Labeler",
            type: "machinery",
            location: "Line 1",
          },
        ],
      },
      {
        id: "ASSET-001-02",
        name: "Utilities",
        type: "asset",
        location: "West Wing",
        children: [
          {
            id: "ASSET-001-02-01",
            name: "Boiler",
            type: "machinery",
            location: "Boiler Room",
          },
        ],
      },
    ],
  },
  {
    id: "ASSET-002",
    name: "Plant 02",
    type: "asset",
    location: "Gampaha",
    children: [
      {
        id: "ASSET-002-01",
        name: "Mixing Line",
        type: "asset",
        location: "Bay C",
        children: [
          {
            id: "ASSET-002-01-01",
            name: "Mixer 01",
            type: "machinery",
            location: "Line 3",
          },
        ],
      },
    ],
  },
  {
    id: "MACH-001",
    name: "Mobile Generator",
    type: "machinery",
    location: "Yard",
  },
];

export function flattenAssetHierarchy(nodes: AssetNode[], depth = 0): FlatAssetNode[] {
  return nodes.flatMap((node) => {
    const indent = depth ? `${"  ".repeat(depth)}- ` : "";
    const label = `${indent}${node.name} (${node.id})`;
    const current: FlatAssetNode = {
      id: node.id,
      name: node.name,
      type: node.type,
      location: node.location,
      depth,
      label,
    };
    const children = node.children ? flattenAssetHierarchy(node.children, depth + 1) : [];
    return [current, ...children];
  });
}

export function findAssetById(nodes: AssetNode[], id: string | null): AssetNode | null {
  if (!id) return null;
  for (const node of nodes) {
    if (node.id === id) return node;
    if (node.children) {
      const match = findAssetById(node.children, id);
      if (match) return match;
    }
  }
  return null;
}

export function countAssetsByType(nodes: AssetNode[]): { assets: number; machinery: number } {
  return nodes.reduce(
    (acc, node) => {
      if (node.type === "asset") acc.assets += 1;
      if (node.type === "machinery") acc.machinery += 1;
      if (node.children) {
        const childCounts = countAssetsByType(node.children);
        acc.assets += childCounts.assets;
        acc.machinery += childCounts.machinery;
      }
      return acc;
    },
    { assets: 0, machinery: 0 }
  );
}
