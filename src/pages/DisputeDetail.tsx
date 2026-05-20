import type { ReactElement } from "react";
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import * as disputeService from "@/services/dispute.service";
import type { Dispute } from "@/types/dispute";
import { formatDateRange } from "@/utils/dates";

export function DisputeDetail(): ReactElement {
  const { id } = useParams<{ id: string }>();
  const [dispute, setDispute] = useState<Dispute | null>(null);
  const [loading, setLoading] = useState(true);

  const [resolveOpen, setResolveOpen] = useState(false);
  const [resolution, setResolution] = useState("");
  const [outcome, setOutcome] = useState<"RESOLVED_OWNER" | "RESOLVED_RENTER">("RESOLVED_OWNER");

  async function load() {
    if (!id) return;
    setLoading(true);
    try {
      const d = await disputeService.getDisputeById(id);
      setDispute(d);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to load dispute");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, [id]);

  async function submitResolve() {
    if (!id) return;
    try {
      await disputeService.resolveDispute(id, { resolution, outcome });
      toast.success("Dispute resolved");
      setResolveOpen(false);
      await load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed");
    }
  }

  if (loading || !dispute) {
    return <p className="text-sm text-muted-foreground">Loading…</p>;
  }

  const b = dispute.booking;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2">
        <Button variant="outline" size="sm" asChild>
          <Link to="/disputes">← Back</Link>
        </Button>
        {dispute.status === "OPEN" ? (
          <Button size="sm" onClick={() => setResolveOpen(true)}>
            Resolve
          </Button>
        ) : null}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Dispute</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between gap-4">
              <span className="text-muted-foreground">Status</span>
              <StatusBadge status={dispute.status} />
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-muted-foreground">Raised by</span>
              <span>{dispute.raisedBy.email}</span>
            </div>
            <div>
              <p className="text-muted-foreground">Reason</p>
              <p className="mt-1 whitespace-pre-wrap">{dispute.reason}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Evidence</p>
              <ul className="mt-1 list-inside list-disc text-xs">
                {dispute.evidence.map((url) => (
                  <li key={url}>
                    <a href={url} target="_blank" rel="noreferrer" className="text-primary underline">
                      {url.slice(0, 48)}…
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Booking context</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between gap-4">
              <span className="text-muted-foreground">Booking</span>
              <Link className="font-mono text-xs text-primary hover:underline" to={`/bookings/${b.id}`}>
                {b.id.slice(0, 8)}…
              </Link>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-muted-foreground">Equipment</span>
              <span className="text-right">{b.equipment.title}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-muted-foreground">Dates</span>
              <span className="tabular-nums">{formatDateRange(b.startDate, b.endDate)}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-muted-foreground">Renter</span>
              <span>{b.renter.email}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-muted-foreground">Owner</span>
              <span>{b.owner.email}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Dialog open={resolveOpen} onOpenChange={setResolveOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Resolve dispute</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-2">
              <Label>Outcome</Label>
              <div className="flex flex-col gap-2 text-sm">
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="outcome"
                    checked={outcome === "RESOLVED_OWNER"}
                    onChange={() => setOutcome("RESOLVED_OWNER")}
                  />
                  Resolve in owner&apos;s favor
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="outcome"
                    checked={outcome === "RESOLVED_RENTER"}
                    onChange={() => setOutcome("RESOLVED_RENTER")}
                  />
                  Resolve in renter&apos;s favor
                </label>
              </div>
            </div>
            <div className="space-y-1">
              <Label>Resolution notes</Label>
              <Textarea rows={4} value={resolution} onChange={(e) => setResolution(e.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setResolveOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => void submitResolve()} disabled={!resolution.trim()}>
              Submit
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
