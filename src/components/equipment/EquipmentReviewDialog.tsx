import type { ReactElement } from "react";
import { useEffect, useState } from "react";
import { Check, ChevronLeft, ChevronRight, MapPin, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { Equipment } from "@/types/equipment";
import { formatCurrency } from "@/utils/currency";
import { cn } from "@/lib/utils";

export function EquipmentReviewDialog(props: {
  equipment: Equipment | null;
  open: boolean;
  onClose: () => void;
  onApprove: (id: string) => Promise<void>;
  onReject: (id: string, note: string) => Promise<void>;
}): ReactElement {
  const { equipment, open, onClose, onApprove, onReject } = props;
  const [activeIndex, setActiveIndex] = useState(0);
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [rejectNote, setRejectNote] = useState("");
  const [busy, setBusy] = useState(false);

  const images = equipment?.images?.filter(Boolean) ?? [];
  const canModerate = equipment?.approvalStatus === "PENDING";
  const rejectValid = rejectNote.trim().length >= 3;

  useEffect(() => {
    if (!open) {
      setActiveIndex(0);
      setShowRejectForm(false);
      setRejectNote("");
      setBusy(false);
    }
  }, [open, equipment?.id]);

  useEffect(() => {
    setActiveIndex(0);
    setShowRejectForm(false);
    setRejectNote("");
  }, [equipment?.id]);

  async function handleApprove() {
    if (!equipment) return;
    setBusy(true);
    try {
      await onApprove(equipment.id);
      onClose();
    } finally {
      setBusy(false);
    }
  }

  async function handleReject() {
    if (!equipment || !rejectValid) return;
    setBusy(true);
    try {
      await onReject(equipment.id, rejectNote.trim());
      onClose();
    } finally {
      setBusy(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && !busy && onClose()}>
      <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto">
        {equipment ? (
          <>
            <DialogHeader>
              <DialogTitle className="pr-8">{equipment.title}</DialogTitle>
              <DialogDescription>
                {canModerate
                  ? "Review photos and details before approving or rejecting."
                  : "Listing details and photos."}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              {images.length > 0 ? (
                <div className="space-y-3">
                  <div className="relative aspect-[16/10] overflow-hidden rounded-xl border bg-stone-100">
                    <img
                      src={images[activeIndex]}
                      alt={`${equipment.title} — photo ${activeIndex + 1}`}
                      className="h-full w-full object-contain"
                    />
                    {images.length > 1 ? (
                      <>
                        <button
                          type="button"
                          className="absolute left-2 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-black/50 text-white hover:bg-black/65"
                          onClick={() =>
                            setActiveIndex((i) => (i <= 0 ? images.length - 1 : i - 1))
                          }
                          aria-label="Previous photo"
                        >
                          <ChevronLeft className="h-5 w-5" />
                        </button>
                        <button
                          type="button"
                          className="absolute right-2 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-black/50 text-white hover:bg-black/65"
                          onClick={() =>
                            setActiveIndex((i) => (i >= images.length - 1 ? 0 : i + 1))
                          }
                          aria-label="Next photo"
                        >
                          <ChevronRight className="h-5 w-5" />
                        </button>
                        <span className="absolute bottom-2 right-2 rounded-full bg-black/55 px-2 py-0.5 text-xs text-white">
                          {activeIndex + 1} / {images.length}
                        </span>
                      </>
                    ) : null}
                  </div>
                  {images.length > 1 ? (
                    <div className="flex gap-2 overflow-x-auto pb-1">
                      {images.map((src, i) => (
                        <button
                          key={src + i}
                          type="button"
                          onClick={() => setActiveIndex(i)}
                          className={cn(
                            "h-16 w-20 shrink-0 overflow-hidden rounded-lg border-2 transition-colors",
                            i === activeIndex
                              ? "border-brand-500 ring-2 ring-brand-200"
                              : "border-stone-200 opacity-80 hover:opacity-100"
                          )}
                        >
                          <img src={src} alt="" className="h-full w-full object-cover" />
                        </button>
                      ))}
                    </div>
                  ) : null}
                </div>
              ) : (
                <div className="flex aspect-[16/10] items-center justify-center rounded-xl border border-dashed bg-stone-50 text-sm text-stone-500">
                  No photos uploaded
                </div>
              )}

              <div className="flex flex-wrap gap-2">
                <Badge variant="outline">{equipment.category?.name ?? "—"}</Badge>
                <Badge
                  className={
                    equipment.approvalStatus === "PENDING"
                      ? "bg-amber-100 text-amber-900"
                      : equipment.approvalStatus === "APPROVED"
                        ? "bg-green-100 text-green-900"
                        : ""
                  }
                  variant={equipment.approvalStatus === "REJECTED" ? "destructive" : "outline"}
                >
                  {equipment.approvalStatus}
                </Badge>
              </div>

              <p className="text-sm leading-relaxed text-stone-600">{equipment.description}</p>

              <div className="grid gap-3 rounded-xl border bg-stone-50 p-4 text-sm sm:grid-cols-2">
                <div>
                  <p className="text-xs font-medium uppercase text-stone-400">Owner</p>
                  <p className="font-medium text-stone-800">{equipment.owner.name}</p>
                  <p className="text-xs text-stone-500">{equipment.owner.email}</p>
                </div>
                <div>
                  <p className="text-xs font-medium uppercase text-stone-400">Location</p>
                  <p className="flex items-center gap-1 text-stone-700">
                    <MapPin className="h-3.5 w-3.5 shrink-0" />
                    {equipment.location}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-medium uppercase text-stone-400">Daily rate</p>
                  <p className="font-medium text-stone-800">{formatCurrency(equipment.dailyRate)}</p>
                </div>
                {equipment.weeklyRate != null ? (
                  <div>
                    <p className="text-xs font-medium uppercase text-stone-400">Weekly rate</p>
                    <p className="font-medium text-stone-800">
                      {formatCurrency(equipment.weeklyRate)}
                    </p>
                  </div>
                ) : null}
                <div>
                  <p className="text-xs font-medium uppercase text-stone-400">Deposit</p>
                  <p className="text-stone-700">{formatCurrency(equipment.depositAmount)}</p>
                </div>
                <div>
                  <p className="text-xs font-medium uppercase text-stone-400">Delivery fee</p>
                  <p className="text-stone-700">{formatCurrency(equipment.deliveryFee)}</p>
                </div>
              </div>

              {equipment.approvalStatus === "REJECTED" && equipment.rejectionNote ? (
                <div className="rounded-lg border border-red-100 bg-red-50 px-3 py-2 text-sm text-red-900">
                  <span className="font-semibold">Rejection reason: </span>
                  {equipment.rejectionNote}
                </div>
              ) : null}

              {showRejectForm && canModerate ? (
                <div className="space-y-2 rounded-xl border border-red-100 bg-red-50/50 p-4">
                  <Label htmlFor="review-reject-note" className="text-sm font-semibold text-red-900">
                    Rejection reason <span className="text-red-600">*</span>
                  </Label>
                  <Textarea
                    id="review-reject-note"
                    value={rejectNote}
                    onChange={(e) => setRejectNote(e.target.value)}
                    placeholder="Explain what the owner must fix before resubmitting…"
                    rows={4}
                    maxLength={500}
                    disabled={busy}
                  />
                  <p className="text-xs text-stone-500">
                    Required — sent to the owner in their notification (min. 3 characters).
                  </p>
                </div>
              ) : null}
            </div>

            <DialogFooter className="flex-col gap-2 sm:flex-row sm:justify-between">
              <Button type="button" variant="outline" disabled={busy} onClick={onClose}>
                Close
              </Button>
              {canModerate ? (
                <div className="flex flex-wrap justify-end gap-2">
                  {!showRejectForm ? (
                    <Button
                      type="button"
                      variant="outline"
                      className="border-red-200 text-red-700 hover:bg-red-50"
                      disabled={busy}
                      onClick={() => setShowRejectForm(true)}
                    >
                      <X className="mr-1 h-4 w-4" />
                      Reject
                    </Button>
                  ) : (
                    <>
                      <Button
                        type="button"
                        variant="ghost"
                        disabled={busy}
                        onClick={() => {
                          setShowRejectForm(false);
                          setRejectNote("");
                        }}
                      >
                        Cancel reject
                      </Button>
                      <Button
                        type="button"
                        variant="destructive"
                        disabled={busy || !rejectValid}
                        onClick={() => void handleReject()}
                      >
                        Confirm reject
                      </Button>
                    </>
                  )}
                  {!showRejectForm ? (
                    <Button
                      type="button"
                      className="bg-green-600 hover:bg-green-700"
                      disabled={busy}
                      onClick={() => void handleApprove()}
                    >
                      <Check className="mr-1 h-4 w-4" />
                      Approve listing
                    </Button>
                  ) : null}
                </div>
              ) : null}
            </DialogFooter>
          </>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
