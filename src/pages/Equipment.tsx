import type { ReactElement } from "react";
import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";
import { EquipmentReviewDialog } from "@/components/equipment/EquipmentReviewDialog";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { EquipmentTable } from "@/components/tables/EquipmentTable";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCategories } from "@/hooks/useCategories";
import { useEquipment } from "@/hooks/useEquipment";
import type { Equipment as EquipmentRow, EquipmentApprovalStatus } from "@/types/equipment";
import { cn } from "@/lib/utils";
import { useNotificationHighlight } from "@/hooks/useNotificationHighlight";

const STATUS_TABS: { value: EquipmentApprovalStatus | "all"; label: string }[] = [
  { value: "all", label: "All" },
  { value: "PENDING", label: "Pending" },
  { value: "APPROVED", label: "Approved" },
  { value: "REJECTED", label: "Rejected" },
];

export function Equipment(): ReactElement {
  const [searchParams] = useSearchParams();
  const highlightFromUrl = searchParams.get("highlight");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<string | undefined>(undefined);
  const [statusTab, setStatusTab] = useState<EquipmentApprovalStatus | "all">("PENDING");
  const [reviewItem, setReviewItem] = useState<EquipmentRow | null>(null);
  const filters = useMemo(
    () => ({
      search: search.trim() || undefined,
      category,
      status: highlightFromUrl ? undefined : statusTab === "all" ? undefined : statusTab,
    }),
    [search, category, statusTab, highlightFromUrl]
  );

  const { categories } = useCategories();
  const { equipment, isLoading, deleteEquipment, approveEquipment, rejectEquipment, refetch } =
    useEquipment(filters);
  const highlightedId = useNotificationHighlight(refetch);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  async function handleDelete() {
    if (!deleteId) return;
    try {
      await deleteEquipment(deleteId);
      toast.success("Equipment deleted");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Delete failed");
    } finally {
      setDeleteId(null);
    }
  }

  async function handleApprove(id: string) {
    try {
      await approveEquipment(id);
      toast.success("Listing approved — owner notified");
      await refetch();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Approve failed");
      throw e;
    }
  }

  async function handleReject(id: string, note: string) {
    try {
      await rejectEquipment(id, note);
      toast.success("Listing rejected — owner notified");
      await refetch();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Reject failed");
      throw e;
    }
  }

  return (
    <div className="space-y-4">
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
            placeholder="Title, description, location"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-[240px]"
          />
        </div>
        <div className="space-y-1">
          <Label className="text-xs">Category</Label>
          <Select
            value={category ?? "all"}
            onValueChange={(v) => setCategory(v === "all" ? undefined : v)}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="All" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              {categories.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <EquipmentTable
        equipment={equipment}
        isLoading={isLoading}
        highlightedId={highlightedId}
        onReview={(item) => setReviewItem(item)}
        onDelete={(id) => setDeleteId(id)}
      />

      <EquipmentReviewDialog
        equipment={reviewItem}
        open={reviewItem !== null}
        onClose={() => setReviewItem(null)}
        onApprove={handleApprove}
        onReject={handleReject}
      />

      <ConfirmDialog
        open={deleteId !== null}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Delete equipment?"
        description="This cannot be undone if no bookings reference it."
        confirmLabel="Delete"
        variant="destructive"
      />
    </div>
  );
}
