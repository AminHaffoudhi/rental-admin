import type { Booking } from "@/types/booking";
import type { User } from "@/types/user";

export type DisputeStatus = "OPEN" | "RESOLVED_OWNER" | "RESOLVED_RENTER";

export interface Dispute {
  id: string;
  bookingId: string;
  reason: string;
  evidence: string[];
  status: DisputeStatus;
  resolution?: string;
  resolvedAt?: string;
  raisedBy: User;
  booking: Booking;
  createdAt: string;
}
