import type { User } from "@/types/user";

export type EquipmentCategory =
  | "CONSTRUCTION"
  | "SPORTS"
  | "EVENTS"
  | "TOOLS"
  | "OTHER";

export interface Equipment {
  id: string;
  title: string;
  description: string;
  category: EquipmentCategory;
  images: string[];
  dailyRate: number;
  weeklyRate?: number;
  depositAmount: number;
  deliveryFee: number;
  ownerId: string;
  isAvailable: boolean;
  location: string;
  createdAt: string;
  updatedAt: string;
  owner: Pick<User, "id" | "name" | "email">;
}
