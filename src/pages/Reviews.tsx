import type { ReactElement } from "react";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";
import { ReviewDetailDialog } from "@/components/reviews/ReviewDetailDialog";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { ReviewsTable } from "@/components/tables/ReviewsTable";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useNotificationHighlight } from "@/hooks/useNotificationHighlight";
import { useReviews } from "@/hooks/useReviews";
import type { Review, ReviewStatus, ReviewType } from "@/types/review";
import { cn } from "@/lib/utils";

const STATUS_TABS: { value: ReviewStatus | "all"; label: string }[] = [
  { value: "all", label: "All" },
  { value: "PENDING", label: "Pending" },
  { value: "APPROVED", label: "Approved" },
  { value: "REJECTED", label: "Rejected" },
];

export function Reviews(): ReactElement {
  const [searchParams] = useSearchParams();
  const highlightFromUrl = searchParams.get("highlight");
  const [search, setSearch] = useState("");
  const [statusTab, setStatusTab] = useState<ReviewStatus | "all">("PENDING");
  const [typeFilter, setTypeFilter] = useState<ReviewType | "all">("all");
  const [viewReview, setViewReview] = useState<Review | null>(null);
  const [rejectId, setRejectId] = useState<string | null>(null);
  const [rejectNote, setRejectNote] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const filters = useMemo(
    () => ({
      search: search.trim() || undefined,
      status: highlightFromUrl ? undefined : statusTab === "all" ? undefined : statusTab,
      type: typeFilter === "all" ? undefined : typeFilter,
    }),
    [search, statusTab, typeFilter, highlightFromUrl]
  );

  const { reviews, isLoading, approveReview, rejectReview, deleteReview, refetch } =
    useReviews(filters);
  const highlightedId = useNotificationHighlight(refetch);

  useEffect(() => {
    if (!highlightedId) return;
    const match = reviews.find((r) => r.id === highlightedId);
    if (match) {
      setViewReview(match);
    }
  }, [highlightedId, reviews]);

  async function handleApprove(id: string) {
    try {
      await approveReview(id);
      toast.success("Review approved");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Approve failed");
      throw e;
    }
  }

  async function handleReject() {
    if (!rejectId) return;
    try {
      await rejectReview(rejectId, rejectNote.trim());
      toast.success("Review rejected");
      setRejectNote("");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Reject failed");
      throw e;
    } finally {
      setRejectId(null);
    }
  }

  async function handleDelete() {
    if (!deleteId) return;
    try {
      await deleteReview(deleteId);
      toast.success("Review deleted");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Delete failed");
    } finally {
      setDeleteId(null);
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="font-display text-2xl font-semibold text-stone-900">Reviews</h1>
        <p className="mt-1 text-sm text-stone-500">
          Moderate owner and listing reviews before they appear publicly.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab.value}
            type="button"
            onClick={() => setStatusTab(tab.value)}
            className={cn(
              "rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
              statusTab === tab.value
                ? "bg-brand-600 text-white"
                : "bg-stone-100 text-stone-600 hover:bg-stone-200"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap items-end gap-3">
        <div className="space-y-1">
          <Label className="text-xs">Search</Label>
          <Input
            placeholder="Comment, names, listing…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-[220px]"
          />
        </div>
        <div className="flex gap-2">
          {(["all", "OWNER", "EQUIPMENT"] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTypeFilter(t)}
              className={cn(
                "rounded-lg px-3 py-1.5 text-xs font-medium",
                typeFilter === t ? "bg-stone-800 text-white" : "bg-stone-100 text-stone-600"
              )}
            >
              {t === "all" ? "All types" : t === "OWNER" ? "Owner" : "Listing"}
            </button>
          ))}
        </div>
      </div>

      <ReviewsTable
        reviews={reviews}
        isLoading={isLoading}
        highlightedId={highlightedId}
        onApprove={(id) => void handleApprove(id)}
        onReject={(id) => {
          setRejectNote("");
          setRejectId(id);
        }}
        onDelete={(id) => setDeleteId(id)}
        onView={(r) => setViewReview(r)}
      />

      <ReviewDetailDialog
        review={viewReview}
        open={viewReview !== null}
        onClose={() => setViewReview(null)}
        onApprove={handleApprove}
        onReject={async (id, note) => {
          await rejectReview(id, note);
          toast.success("Review rejected");
        }}
      />

      <ConfirmDialog
        open={rejectId !== null}
        onClose={() => {
          setRejectId(null);
          setRejectNote("");
        }}
        onConfirm={handleReject}
        title="Reject review?"
        description="This review will not be published."
        confirmLabel="Reject"
        variant="destructive"
      >
        <div className="space-y-2">
          <Label htmlFor="admin-reject-review">Reason *</Label>
          <Textarea
            id="admin-reject-review"
            value={rejectNote}
            onChange={(e) => setRejectNote(e.target.value)}
            rows={3}
            maxLength={500}
          />
        </div>
      </ConfirmDialog>

      <ConfirmDialog
        open={deleteId !== null}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Delete review?"
        description="This cannot be undone."
        confirmLabel="Delete"
        variant="destructive"
      />
    </div>
  );
}
