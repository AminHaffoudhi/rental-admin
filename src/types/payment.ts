import type { User } from "@/types/user";

export type PaymentStatus = "PENDING" | "CONFIRMED" | "PAYOUT_PENDING" | "PAYOUT_SENT";

export interface Payment {
  id: string;
  bookingId: string;
  amount: number;
  depositAmount: number;
  status: PaymentStatus;
  confirmedAt?: string;
  payoutSentAt?: string;
  confirmedBy?: string;
  /** Present on list/detail responses from rental-admin-api */
  booking?: {
    id: string;
    equipment: { title: string };
    renter: Pick<User, "id" | "name" | "email">;
    owner: Pick<User, "id" | "name" | "email">;
  };
}
