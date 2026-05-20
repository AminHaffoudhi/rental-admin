import type { ReactElement } from "react";
import { useMemo, useState } from "react";
import toast from "react-hot-toast";
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
import { useEquipment } from "@/hooks/useEquipment";

export function Equipment(): ReactElement {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<string | undefined>(undefined);
  const filters = useMemo(
    () => ({
      search: search.trim() || undefined,
      category,
    }),
    [search, category]
  );

  const { equipment, isLoading, deleteEquipment } = useEquipment(filters);
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

  return (
    <div className="space-y-4">
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
          <Select value={category ?? "all"} onValueChange={(v) => setCategory(v === "all" ? undefined : v)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="All" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="CONSTRUCTION">Construction</SelectItem>
              <SelectItem value="SPORTS">Sports</SelectItem>
              <SelectItem value="EVENTS">Events</SelectItem>
              <SelectItem value="TOOLS">Tools</SelectItem>
              <SelectItem value="OTHER">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <EquipmentTable equipment={equipment} isLoading={isLoading} onDelete={(id) => setDeleteId(id)} />

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
