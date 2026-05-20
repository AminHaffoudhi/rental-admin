export type DeliveryStatus =
  | "SCHEDULED"
  | "PICKED_UP"
  | "DELIVERED"
  | "RETURN_SCHEDULED"
  | "RETURN_PICKED_UP"
  | "RETURNED";

import type { User } from "@/types/user";

export interface Delivery {
  id: string;
  bookingId: string;
  agentName?: string;
  agentPhone?: string;
  pickupPhotos: string[];
  returnPhotos: string[];
  status: DeliveryStatus;
  deliverySlot?: string;
  returnSlot?: string;
  /** Present on list responses */
  booking?: {
    id: string;
    equipment: { id: string; title: string; images: string[] };
    renter: Pick<User, "id" | "name" | "email">;
    owner: Pick<User, "id" | "name" | "email">;
  };
}
