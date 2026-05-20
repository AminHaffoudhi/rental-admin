import type { ReactElement } from "react";
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import * as bookingService from "@/services/booking.service";
import * as deliveryService from "@/services/delivery.service";
import { BOOKING_STATE_META } from "@/config/bookingStates";
import type { Booking, BookingStatus } from "@/types/booking";
import type { DeliveryStatus } from "@/types/delivery";
import { formatCurrency } from "@/utils/currency";
import { formatDateRange } from "@/utils/dates";

const ORDER: BookingStatus[] = [
  "PENDING",
  "CONFIRMED",
  "PAYMENT_PENDING",
  "PAID",
  "PICKUP_SCHEDULED",
  "IN_TRANSIT",
  "ACTIVE",
  "RETURN_SCHEDULED",
  "RETURNING",
  "INSPECTING",
  "COMPLETED",
];

export function BookingDetail(): ReactElement {
  const { id } = useParams<{ id: string }>();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);

  const [agentName, setAgentName] = useState("");
  const [agentPhone, setAgentPhone] = useState("");
  const [deliverySlot, setDeliverySlot] = useState("");
  const [nextDeliveryStatus, setNextDeliveryStatus] = useState<DeliveryStatus>("PICKED_UP");

  const [confirmPayOpen, setConfirmPayOpen] = useState(false);
  const [completeOpen, setCompleteOpen] = useState(false);
  const [cancelOpen, setCancelOpen] = useState(false);

  async function load() {
    if (!id) return;
    setLoading(true);
    try {
      const b = await bookingService.getBookingById(id);
      setBooking(b);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to load booking");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, [id]);

  async function confirmPayment() {
    if (!id) return;
    await bookingService.confirmPayment(id);
    toast.success("Payment confirmed");
    await load();
  }

  async function forceComplete() {
    if (!id) return;
    await bookingService.forceComplete(id);
    toast.success("Completed");
    await load();
  }

  async function forceCancel() {
    if (!id) return;
    await bookingService.forceCancel(id);
    toast.success("Cancelled");
    await load();
  }

  async function assignAgent() {
    if (!booking?.delivery?.id) return;
    try {
      await deliveryService.assignAgent(booking.delivery.id, {
        agentName,
        agentPhone,
        deliverySlot: new Date(deliverySlot).toISOString(),
      });
      toast.success("Agent assigned");
      await load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed");
    }
  }

  async function updateDelivery() {
    if (!booking?.delivery?.id) return;
    try {
      await deliveryService.updateStatus(booking.delivery.id, nextDeliveryStatus);
      toast.success("Delivery updated");
      await load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed");
    }
  }

  if (loading || !booking) {
    return <p className="text-sm text-muted-foreground">Loading…</p>;
  }

  const idx = ORDER.indexOf(booking.status);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2">
        <Button variant="outline" size="sm" asChild>
          <Link to="/bookings">← Back</Link>
        </Button>
        {booking.status === "PAYMENT_PENDING" ? (
          <Button size="sm" onClick={() => setConfirmPayOpen(true)}>
            Confirm payment
          </Button>
        ) : null}
        <Button size="sm" variant="secondary" onClick={() => setCompleteOpen(true)}>
          Force complete
        </Button>
        <Button size="sm" variant="destructive" onClick={() => setCancelOpen(true)}>
          Force cancel
        </Button>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Booking</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between gap-4">
              <span className="text-muted-foreground">Status</span>
              <StatusBadge status={booking.status} />
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-muted-foreground">Equipment</span>
              <span className="text-right font-medium">{booking.equipment.title}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-muted-foreground">Dates</span>
              <span className="tabular-nums">{formatDateRange(booking.startDate, booking.endDate)}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-muted-foreground">Total</span>
              <span className="tabular-nums">{formatCurrency(booking.totalPrice)}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-muted-foreground">Platform fee</span>
              <span className="tabular-nums">{formatCurrency(booking.platformFee)}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-muted-foreground">Renter</span>
              <span className="text-right">{booking.renter.email}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-muted-foreground">Owner</span>
              <span className="text-right">{booking.owner.email}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Payment</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            {booking.payment ? (
              <>
                <div className="flex justify-between gap-4">
                  <span className="text-muted-foreground">Status</span>
                  <StatusBadge status={booking.payment.status} />
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-muted-foreground">Amount</span>
                  <span className="tabular-nums">{formatCurrency(booking.payment.amount)}</span>
                </div>
              </>
            ) : (
              <p className="text-muted-foreground">No payment record</p>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Delivery</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {booking.delivery ? (
            <>
              <div className="flex flex-wrap gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Status </span>
                  <StatusBadge status={booking.delivery.status} />
                </div>
                <div>
                  <span className="text-muted-foreground">Agent </span>
                  {booking.delivery.agentName ?? "—"}
                </div>
              </div>

              {booking.delivery.status === "SCHEDULED" ? (
                <div className="grid gap-3 rounded-md border p-4 sm:grid-cols-2">
                  <div className="space-y-1">
                    <Label className="text-xs">Agent name</Label>
                    <Input value={agentName} onChange={(e) => setAgentName(e.target.value)} />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Agent phone</Label>
                    <Input value={agentPhone} onChange={(e) => setAgentPhone(e.target.value)} />
                  </div>
                  <div className="space-y-1 sm:col-span-2">
                    <Label className="text-xs">Pickup slot (local)</Label>
                    <Input
                      type="datetime-local"
                      value={deliverySlot}
                      onChange={(e) => setDeliverySlot(e.target.value)}
                    />
                  </div>
                  <Button size="sm" onClick={() => void assignAgent()}>
                    Assign agent
                  </Button>
                </div>
              ) : null}

              <div className="flex flex-wrap items-end gap-3 rounded-md border p-4">
                <div className="space-y-1">
                  <Label className="text-xs">Next delivery status</Label>
                  <Select
                    value={nextDeliveryStatus}
                    onValueChange={(v) => setNextDeliveryStatus(v as DeliveryStatus)}
                  >
                    <SelectTrigger className="w-[200px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="SCHEDULED">SCHEDULED</SelectItem>
                      <SelectItem value="PICKED_UP">PICKED_UP</SelectItem>
                      <SelectItem value="DELIVERED">DELIVERED</SelectItem>
                      <SelectItem value="RETURN_SCHEDULED">RETURN_SCHEDULED</SelectItem>
                      <SelectItem value="RETURN_PICKED_UP">RETURN_PICKED_UP</SelectItem>
                      <SelectItem value="RETURNED">RETURNED</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button size="sm" variant="secondary" onClick={() => void updateDelivery()}>
                  Update delivery status
                </Button>
              </div>
            </>
          ) : (
            <p className="text-sm text-muted-foreground">No delivery record</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Status timeline</CardTitle>
        </CardHeader>
        <CardContent>
          <ol className="relative space-y-2 border-l border-border pl-4 text-sm">
            {ORDER.map((st, i) => (
              <li key={st} className={i <= idx ? "font-medium text-foreground" : "text-muted-foreground"}>
                <span className="tabular-nums">{BOOKING_STATE_META[st].label}</span>
                {booking.status === st ? <span className="ml-2 text-xs text-primary">(current)</span> : null}
              </li>
            ))}
          </ol>
        </CardContent>
      </Card>

      <ConfirmDialog
        open={confirmPayOpen}
        onClose={() => setConfirmPayOpen(false)}
        onConfirm={confirmPayment}
        title="Confirm payment on this booking?"
      />
      <ConfirmDialog
        open={completeOpen}
        onClose={() => setCompleteOpen(false)}
        onConfirm={forceComplete}
        title="Force complete?"
        variant="destructive"
      />
      <ConfirmDialog
        open={cancelOpen}
        onClose={() => setCancelOpen(false)}
        onConfirm={forceCancel}
        title="Force cancel?"
        variant="destructive"
      />
    </div>
  );
}
