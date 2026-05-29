import type { ReactElement } from "react";
import { useEffect, useState } from "react";
import { Check, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { Review } from "@/types/review";
import { formatDate } from "@/utils/dates";

export function ReviewDetailDialog(props: {
  review: Review | null;
  open: boolean;
  onClose: () => void;
  onApprove: (id: string) => Promise<void>;
  onReject: (id: string, note: string) => Promise<void>;
}): ReactElement {
  const { review, open, onClose, onApprove, onReject } = props;
  const [showReject, setShowReject] = useState(false);
  const [rejectNote, setRejectNote] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!open) {
      setShowReject(false);
      setRejectNote("");
    }
  }, [open, review?.id]);

  const canModerate = review?.status === "PENDING";
  const rejectValid = rejectNote.trim().length >= 3;

  async function handleApprove() {
    if (!review) return;
    setBusy(true);
    try {
      await onApprove(review.id);
      onClose();
    } finally {
      setBusy(false);
    }
  }

  async function handleReject() {
    if (!review || !rejectValid) return;
    setBusy(true);
    try {
      await onReject(review.id, rejectNote.trim());
      onClose();
    } finally {
      setBusy(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && !busy && onClose()}>
      <DialogContent className="max-w-lg">
        {review ? (
          <>
            <DialogHeader>
              <DialogTitle>Review details</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 text-sm">
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline">{review.type === "EQUIPMENT" ? "Listing" : "Owner"}</Badge>
                <Badge>{review.status}</Badge>
                <Badge variant="secondary">{review.rating}/5 stars</Badge>
              </div>
              <div className="grid gap-2 rounded-lg border bg-stone-50 p-4">
                <p>
                  <span className="font-medium text-stone-700">From: </span>
                  {review.reviewer.name} ({review.reviewer.email})
                </p>
                <p>
                  <span className="font-medium text-stone-700">About: </span>
                  {review.type === "EQUIPMENT"
                    ? review.equipment?.title ?? "Listing"
                    : review.reviewee.name}
                </p>
                <p>
                  <span className="font-medium text-stone-700">Owner: </span>
                  {review.reviewee.name}
                </p>
                <p>
                  <span className="font-medium text-stone-700">Submitted: </span>
                  {formatDate(review.createdAt)}
                </p>
              </div>
              {review.comment ? (
                <blockquote className="rounded-lg border-l-4 border-brand-300 bg-brand-50/50 px-4 py-3 italic text-stone-700">
                  {review.comment}
                </blockquote>
              ) : (
                <p className="text-stone-400">No comment provided.</p>
              )}
              {review.adminNote ? (
                <p className="text-xs text-red-700">
                  <span className="font-semibold">Admin note: </span>
                  {review.adminNote}
                </p>
              ) : null}
              {showReject && canModerate ? (
                <div className="space-y-2">
                  <Label htmlFor="reject-review-note">Rejection reason *</Label>
                  <Textarea
                    id="reject-review-note"
                    value={rejectNote}
                    onChange={(e) => setRejectNote(e.target.value)}
                    rows={3}
                    maxLength={500}
                  />
                </div>
              ) : null}
            </div>
            <DialogFooter className="gap-2 sm:justify-between">
              <Button type="button" variant="outline" disabled={busy} onClick={onClose}>
                Close
              </Button>
              {canModerate ? (
                <div className="flex gap-2">
                  {!showReject ? (
                    <Button
                      type="button"
                      variant="outline"
                      className="border-red-200 text-red-700"
                      disabled={busy}
                      onClick={() => setShowReject(true)}
                    >
                      <X className="mr-1 h-4 w-4" />
                      Reject
                    </Button>
                  ) : (
                    <Button
                      type="button"
                      variant="destructive"
                      disabled={busy || !rejectValid}
                      onClick={() => void handleReject()}
                    >
                      Confirm reject
                    </Button>
                  )}
                  {!showReject ? (
                    <Button
                      type="button"
                      className="bg-green-600 hover:bg-green-700"
                      disabled={busy}
                      onClick={() => void handleApprove()}
                    >
                      <Check className="mr-1 h-4 w-4" />
                      Approve
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
