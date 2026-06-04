import { BOOKING_STATE_META } from "@/config/bookingStates";
import type { BookingStatus } from "@/types/booking";
import { cn } from "@/lib/utils";

const STATUS_MAP: Record<string, { label: string; className: string; dot: string }> = {
  PENDING: { label: "Pending", className: "badge-yellow", dot: "bg-yellow-400" },
  CONFIRMED: { label: "Confirmed", className: "badge-blue", dot: "bg-blue-400" },
  PAYMENT_PENDING: { label: "Awaiting Payment", className: "badge-yellow", dot: "bg-yellow-400" },
  PAID: { label: "Paid", className: "badge-green", dot: "bg-green-400" },
  PICKUP_SCHEDULED: { label: "Pickup Scheduled", className: "badge-blue", dot: "bg-blue-400" },
  IN_TRANSIT: { label: "In Transit", className: "badge-blue", dot: "bg-blue-400" },
  ACTIVE: { label: "Active", className: "badge-green", dot: "bg-green-400" },
  RETURN_SCHEDULED: { label: "Return Scheduled", className: "badge-blue", dot: "bg-blue-400" },
  RETURNING: { label: "Returning", className: "badge-blue", dot: "bg-blue-400" },
  INSPECTING: { label: "Inspecting", className: "badge-yellow", dot: "bg-yellow-400" },
  COMPLETED: { label: "Completed", className: "badge-green", dot: "bg-green-500" },
  DISPUTED: { label: "Disputed", className: "badge-red", dot: "bg-red-400" },
  REJECTED: { label: "Rejected", className: "badge-red", dot: "bg-red-400" },
  CANCELLED: { label: "Cancelled", className: "badge-stone", dot: "bg-stone-400" },
  REFUNDED: { label: "Refunded", className: "badge-stone", dot: "bg-stone-400" },
  SUBMITTED: { label: "Pending Review", className: "badge-yellow", dot: "bg-yellow-400" },
  APPROVED: { label: "Approved", className: "badge-green", dot: "bg-green-500" },
  PAYOUT_PENDING: { label: "Payout Pending", className: "badge-orange", dot: "bg-brand-400" },
  PAYOUT_SENT: { label: "Payout Sent", className: "badge-green", dot: "bg-green-500" },
  OPEN: { label: "Open", className: "badge-red", dot: "bg-red-400" },
  RESOLVED_OWNER: { label: "Resolved (Owner)", className: "badge-green", dot: "bg-green-500" },
  RESOLVED_RENTER: { label: "Resolved (Renter)", className: "badge-blue", dot: "bg-blue-500" },
  OWNER: { label: "Owner", className: "badge-orange", dot: "bg-brand-400" },
  RENTER: { label: "Renter", className: "badge-blue", dot: "bg-blue-400" },
  BOTH: { label: "Both", className: "badge-purple", dot: "bg-purple-400" },
  ADMIN: { label: "Admin", className: "badge-red", dot: "bg-red-400" },
  NEW: { label: "New", className: "badge-orange", dot: "bg-brand-400" },
  READ: { label: "Read", className: "badge-blue", dot: "bg-blue-400" },
  ARCHIVED: { label: "Archived", className: "badge-stone", dot: "bg-stone-400" },
  CONTACT: { label: "Contact", className: "badge-blue", dot: "bg-blue-400" },
  REPORT: { label: "Issue", className: "badge-red", dot: "bg-red-400" },
};

export function StatusBadge({ status, showDot = true }: { status: string; showDot?: boolean }) {
  const bookingMeta = BOOKING_STATE_META[status as BookingStatus];
  const mapped = STATUS_MAP[status];
  const label = bookingMeta?.label ?? mapped?.label ?? status.replace(/_/g, " ");
  const config =
    mapped ??
    ({
      label,
      className: "badge-stone",
      dot: "bg-stone-400",
    } as const);

  return (
    <span className={cn("badge capitalize", config.className)}>
      {showDot ? <span className={cn("h-1.5 w-1.5 shrink-0 rounded-full", config.dot)} /> : null}
      {label}
    </span>
  );
}
