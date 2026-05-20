import type { Booking } from "@/types/booking";
import type { Equipment } from "@/types/equipment";
import type { User } from "@/types/user";

export interface AdminUserDetail extends User {
  equipment: Equipment[];
  bookingsAsRenter: Booking[];
  bookingsAsOwner: Booking[];
  reviewsGiven: { id: string }[];
  reviewsReceived: { id: string }[];
}
