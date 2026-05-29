import type { User } from "@/types/user";

export type ReviewType = "OWNER" | "EQUIPMENT";
export type ReviewStatus = "PENDING" | "APPROVED" | "REJECTED";

export interface Review {
  id: string;
  type: ReviewType;
  status: ReviewStatus;
  bookingId?: string | null;
  reviewerId: string;
  revieweeId: string;
  equipmentId?: string | null;
  rating: number;
  comment?: string | null;
  adminNote?: string | null;
  createdAt: string;
  updatedAt: string;
  reviewer: Pick<User, "id" | "name" | "email" | "image">;
  reviewee: Pick<User, "id" | "name" | "email" | "image">;
  equipment?: { id: string; title: string } | null;
}
