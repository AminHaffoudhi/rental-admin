import type { ReactElement } from "react";
import { useMemo, useState } from "react";
import toast from "react-hot-toast";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { BookingsTable } from "@/components/tables/BookingsTable";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useBookings } from "@/hooks/useBookings";
import type { BookingStatus } from "@/types/booking";

type TabKey = "all" | BookingStatus | "ACTIVE_FLOW";

function tabToApiStatus(tab: TabKey): BookingStatus | undefined {
  if (tab === "all" || tab === "ACTIVE_FLOW") return undefined;
  return tab;
}

export function Bookings(): ReactElement {
  const [tab, setTab] = useState<TabKey>("all");
  const filterStatus = tabToApiStatus(tab);

  const { bookings: raw, isLoading, confirmPayment, forceComplete, forceCancel } =
    useBookings(filterStatus ? { status: filterStatus } : undefined);

  const bookings = useMemo(() => {
    if (tab !== "ACTIVE_FLOW") return raw;
    const active: BookingStatus[] = ["IN_TRANSIT", "ACTIVE", "PICKUP_SCHEDULED", "RETURNING"];
    return raw.filter((b) => active.includes(b.status));
  }, [raw, tab]);

  const [confirmPayId, setConfirmPayId] = useState<string | null>(null);
  const [completeId, setCompleteId] = useState<string | null>(null);
  const [cancelId, setCancelId] = useState<string | null>(null);

  async function doConfirmPay() {
    if (!confirmPayId) return;
    try {
      await confirmPayment(confirmPayId);
      toast.success("Payment confirmed");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed");
    } finally {
      setConfirmPayId(null);
    }
  }

  async function doComplete() {
    if (!completeId) return;
    try {
      await forceComplete(completeId);
      toast.success("Marked complete");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed");
    } finally {
      setCompleteId(null);
    }
  }

  async function doCancel() {
    if (!cancelId) return;
    try {
      await forceCancel(cancelId);
      toast.success("Booking cancelled");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed");
    } finally {
      setCancelId(null);
    }
  }

  return (
    <div className="space-y-4">
      <Tabs value={tab} onValueChange={(v) => setTab(v as TabKey)}>
        <TabsList className="flex-wrap">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="PENDING">Pending</TabsTrigger>
          <TabsTrigger value="PAYMENT_PENDING">Payment pending</TabsTrigger>
          <TabsTrigger value="ACTIVE_FLOW">Active</TabsTrigger>
          <TabsTrigger value="COMPLETED">Completed</TabsTrigger>
          <TabsTrigger value="DISPUTED">Disputed</TabsTrigger>
        </TabsList>
      </Tabs>

      <BookingsTable
        bookings={bookings}
        isLoading={isLoading}
        onConfirmPayment={(id) => setConfirmPayId(id)}
        onForceComplete={(id) => setCompleteId(id)}
        onForceCancel={(id) => setCancelId(id)}
      />

      <ConfirmDialog
        open={confirmPayId !== null}
        onClose={() => setConfirmPayId(null)}
        onConfirm={doConfirmPay}
        title="Confirm payment?"
        confirmLabel="Confirm"
      />
      <ConfirmDialog
        open={completeId !== null}
        onClose={() => setCompleteId(null)}
        onConfirm={doComplete}
        title="Force complete booking?"
        variant="destructive"
        confirmLabel="Complete"
      />
      <ConfirmDialog
        open={cancelId !== null}
        onClose={() => setCancelId(null)}
        onConfirm={doCancel}
        title="Force cancel booking?"
        variant="destructive"
        confirmLabel="Cancel booking"
      />
    </div>
  );
}
