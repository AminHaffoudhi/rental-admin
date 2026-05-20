import type { ReactElement } from "react";
import { useMemo, useState } from "react";
import toast from "react-hot-toast";
import { DeliveriesTable } from "@/components/tables/DeliveriesTable";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import * as deliveryService from "@/services/delivery.service";
import { useDeliveries } from "@/hooks/useDeliveries";
import type { DeliveryStatus } from "@/types/delivery";

export function Deliveries(): ReactElement {
  const [tab, setTab] = useState<"all" | "SCHEDULED" | "progress" | "RETURNED">("all");

  const filters = useMemo(() => {
    if (tab === "SCHEDULED") return { status: "SCHEDULED" };
    if (tab === "RETURNED") return { status: "RETURNED" };
    return undefined;
  }, [tab]);

  const { deliveries: raw, isLoading, refetch } = useDeliveries(filters);

  const deliveries = useMemo(() => {
    if (tab !== "progress") return raw;
    const set = new Set<DeliveryStatus>([
      "PICKED_UP",
      "DELIVERED",
      "RETURN_PICKED_UP",
      "RETURN_SCHEDULED",
    ]);
    return raw.filter((d) => set.has(d.status));
  }, [raw, tab]);

  const [assignId, setAssignId] = useState<string | null>(null);
  const [agentName, setAgentName] = useState("");
  const [agentPhone, setAgentPhone] = useState("");
  const [deliverySlot, setDeliverySlot] = useState("");

  const [statusId, setStatusId] = useState<string | null>(null);
  const [nextStatus, setNextStatus] = useState<DeliveryStatus>("PICKED_UP");

  async function assign() {
    if (!assignId) return;
    try {
      await deliveryService.assignAgent(assignId, {
        agentName,
        agentPhone,
        deliverySlot: new Date(deliverySlot).toISOString(),
      });
      toast.success("Assigned");
      setAssignId(null);
      await refetch();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed");
    }
  }

  async function updateStatus() {
    if (!statusId) return;
    try {
      await deliveryService.updateStatus(statusId, nextStatus);
      toast.success("Updated");
      setStatusId(null);
      await refetch();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed");
    }
  }

  return (
    <div className="space-y-4">
      <Tabs value={tab} onValueChange={(v) => setTab(v as typeof tab)}>
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="SCHEDULED">Scheduled</TabsTrigger>
          <TabsTrigger value="progress">In progress</TabsTrigger>
          <TabsTrigger value="RETURNED">Returned</TabsTrigger>
        </TabsList>
      </Tabs>

      <DeliveriesTable
        deliveries={deliveries}
        isLoading={isLoading}
        onAssignAgent={(id) => {
          setAssignId(id);
          setDeliverySlot("");
        }}
        onUpdateStatus={(id) => {
          setStatusId(id);
        }}
      />

      <Dialog open={assignId !== null} onOpenChange={(o) => !o && setAssignId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign agent</DialogTitle>
          </DialogHeader>
          <div className="grid gap-3">
            <div className="space-y-1">
              <Label>Name</Label>
              <Input value={agentName} onChange={(e) => setAgentName(e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label>Phone</Label>
              <Input value={agentPhone} onChange={(e) => setAgentPhone(e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label>Pickup slot</Label>
              <Input
                type="datetime-local"
                value={deliverySlot}
                onChange={(e) => setDeliverySlot(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAssignId(null)}>
              Cancel
            </Button>
            <Button onClick={() => void assign()}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={statusId !== null} onOpenChange={(o) => !o && setStatusId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update delivery status</DialogTitle>
          </DialogHeader>
          <Select value={nextStatus} onValueChange={(v) => setNextStatus(v as DeliveryStatus)}>
            <SelectTrigger>
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
          <DialogFooter>
            <Button variant="outline" onClick={() => setStatusId(null)}>
              Cancel
            </Button>
            <Button onClick={() => void updateStatus()}>Update</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
