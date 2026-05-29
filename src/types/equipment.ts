import type { EquipmentCategory } from "@/types/category";
import type { User } from "@/types/user";

export type EquipmentApprovalStatus = "PENDING" | "APPROVED" | "REJECTED";

export interface Equipment {
  id: string;
  title: string;
  description: string;
  categoryId: string;
  category: EquipmentCategory;
  images: string[];
  dailyRate: number;
  weeklyRate?: number;
  depositAmount: number;
  deliveryFee: number;
  ownerId: string;
  isAvailable: boolean;
  approvalStatus: EquipmentApprovalStatus;
  approvedAt?: string | null;
  rejectionNote?: string | null;
  location: string;
  createdAt: string;
  updatedAt: string;
  owner: Pick<User, "id" | "name" | "email">;
}
