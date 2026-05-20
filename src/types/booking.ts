import type { Delivery } from "@/types/delivery";
import type { Payment } from "@/types/payment";
import type { User } from "@/types/user";

export type BookingStatus =
  | "PENDING"
  | "CONFIRMED"
  | "REJECTED"
  | "CANCELLED"
  | "PAYMENT_PENDING"
  | "PAID"
  | "PICKUP_SCHEDULED"
  | "IN_TRANSIT"
  | "ACTIVE"
  | "RETURN_SCHEDULED"
  | "RETURNING"
  | "INSPECTING"
  | "COMPLETED"
  | "DISPUTED"
  | "REFUNDED";

export interface Booking {
  id: string;
  status: BookingStatus;
  startDate: string;
  endDate: string;
  totalPrice: number;
  depositAmount: number;
  deliveryFee: number;
  platformFee: number;
  notes?: string;
  renter: User;
  owner: User;
  equipment: { id: string; title: string; images: string[] };
  delivery?: Delivery;
  payment?: Payment;
  createdAt: string;
}
