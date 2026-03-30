export type AssetHierarchyEquipment = {
  id: string;
  name: string;
  location?: string | null;
  companyId?: string | null;
  photoUrl?: string | null;
};

export type AssetHierarchyArea = {
  id: string;
  name: string;
  location?: string | null;
  companyId?: string | null;
  photoUrl?: string | null;
  equipment?: AssetHierarchyEquipment[] | null;
};

export type AssetHierarchyPlant = {
  id: string;
  name: string;
  location?: string | null;
  companyId?: string | null;
  photoUrl?: string | null;
  areas?: AssetHierarchyArea[] | null;
};

export type AssetHierarchyCountry = {
  id: string;
  name: string;
  location?: string | null;
  companyId?: string | null;
  photoUrl?: string | null;
  plants?: AssetHierarchyPlant[] | null;
};
