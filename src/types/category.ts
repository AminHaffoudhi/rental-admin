export interface EquipmentCategory {
  id: string;
  slug: string;
  name: string;
  description: string;
  iconUrl: string;
  iconKey: string;
  color: string;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  _count?: { equipment: number };
}

export interface CategoryInput {
  name: string;
  slug?: string;
  description?: string;
  iconUrl?: string;
  iconKey?: string;
  color?: string;
  sortOrder?: number;
  isActive?: boolean;
}
