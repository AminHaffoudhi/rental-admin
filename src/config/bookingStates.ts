import type { BookingStatus } from "@/types/booking";

export const BOOKING_STATE_META: Record<
  BookingStatus,
  { label: string; color: string }
> = {
  PENDING: { label: "Pending", color: "bg-amber-500/15 text-amber-800 dark:text-amber-200" },
  CONFIRMED: { label: "Confirmed", color: "bg-emerald-500/15 text-emerald-800 dark:text-emerald-200" },
  REJECTED: { label: "Rejected", color: "bg-red-500/15 text-red-800 dark:text-red-200" },
  CANCELLED: { label: "Cancelled", color: "bg-zinc-500/15 text-zinc-800 dark:text-zinc-200" },
  PAYMENT_PENDING: {
    label: "Payment pending",
    color: "bg-orange-500/15 text-orange-800 dark:text-orange-200",
  },
  PAID: { label: "Paid", color: "bg-green-500/15 text-green-800 dark:text-green-200" },
  PICKUP_SCHEDULED: {
    label: "Pickup scheduled",
    color: "bg-cyan-500/15 text-cyan-800 dark:text-cyan-200",
  },
  IN_TRANSIT: { label: "In transit", color: "bg-blue-500/15 text-blue-800 dark:text-blue-200" },
  ACTIVE: { label: "Active", color: "bg-sky-500/15 text-sky-800 dark:text-sky-200" },
  RETURN_SCHEDULED: {
    label: "Return scheduled",
    color: "bg-indigo-500/15 text-indigo-800 dark:text-indigo-200",
  },
  RETURNING: { label: "Returning", color: "bg-violet-500/15 text-violet-800 dark:text-violet-200" },
  INSPECTING: { label: "Inspecting", color: "bg-slate-500/15 text-slate-800 dark:text-slate-200" },
  COMPLETED: { label: "Completed", color: "bg-emerald-600/15 text-emerald-900 dark:text-emerald-100" },
  DISPUTED: { label: "Disputed", color: "bg-orange-600/15 text-orange-900 dark:text-orange-100" },
  REFUNDED: { label: "Refunded", color: "bg-rose-500/15 text-rose-800 dark:text-rose-200" },
};
