export type AssetNodeType = "country" | "plant" | "area" | "equipment";

export type AssetHierarchyNode = {
  id: string;
  parentId?: string | null;
  type: AssetNodeType;
  name: string;
  location?: string | null;
  companyId?: string | null;
  photoUrl?: string | null;
  children: AssetHierarchyNode[];
};
