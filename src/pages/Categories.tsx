import type { ReactElement } from "react";
import { useMemo, useRef, useState } from "react";
import toast from "react-hot-toast";
import { ImagePlus, Layers, Pencil, Plus, Trash2 } from "lucide-react";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { EmptyState } from "@/components/shared/EmptyState";
import { LoadingSkeleton } from "@/components/shared/LoadingSkeleton";
import { Badge } from "@/components/ui/badge";
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
import { Textarea } from "@/components/ui/textarea";
import { useCategories } from "@/hooks/useCategories";
import { uploadCategoryIcon } from "@/services/upload.service";
import type { CategoryInput, EquipmentCategory } from "@/types/category";
import { cn } from "@/lib/utils";

const COLOR_PRESETS = [
  { label: "Orange", value: "bg-orange-50 text-orange-700" },
  { label: "Green", value: "bg-green-50 text-green-700" },
  { label: "Purple", value: "bg-purple-50 text-purple-700" },
  { label: "Blue", value: "bg-blue-50 text-blue-700" },
  { label: "Stone", value: "bg-stone-50 text-stone-600" },
  { label: "Brand", value: "bg-brand-50 text-brand-700" },
] as const;

const emptyForm: CategoryInput = {
  name: "",
  slug: "",
  description: "",
  iconUrl: "",
  iconKey: "",
  color: COLOR_PRESETS[0].value,
  sortOrder: 0,
  isActive: true,
};

function slugify(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function Categories(): ReactElement {
  const { categories, isLoading, create, update, remove } = useCategories();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<EquipmentCategory | null>(null);
  const [form, setForm] = useState<CategoryInput>(emptyForm);
  const [slugTouched, setSlugTouched] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const sorted = useMemo(
    () => [...categories].sort((a, b) => a.sortOrder - b.sortOrder || a.name.localeCompare(b.name)),
    [categories]
  );

  function openCreate() {
    setEditing(null);
    setForm(emptyForm);
    setSlugTouched(false);
    setDialogOpen(true);
  }

  function openEdit(row: EquipmentCategory) {
    setEditing(row);
    setForm({
      name: row.name,
      slug: row.slug,
      description: row.description,
      iconUrl: row.iconUrl,
      iconKey: row.iconKey,
      color: row.color,
      sortOrder: row.sortOrder,
      isActive: row.isActive,
    });
    setSlugTouched(true);
    setDialogOpen(true);
  }

  async function handleIconFile(file: File) {
    if (!file.type.startsWith("image/")) {
      toast.error("Please choose an image file (PNG, SVG, WebP, etc.)");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      toast.error("Icon must be under 2MB");
      return;
    }
    setUploading(true);
    try {
      const result = await uploadCategoryIcon(file);
      setForm((f) => ({ ...f, iconUrl: result.url, iconKey: result.fileKey }));
      toast.success("Icon uploaded");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  async function handleSave() {
    const name = form.name?.trim();
    if (!name || name.length < 2) {
      toast.error("Name is required (min 2 characters)");
      return;
    }
    const payload: CategoryInput = {
      name,
      slug: (form.slug?.trim() || slugify(name)) || undefined,
      description: form.description?.trim() ?? "",
      iconUrl: form.iconUrl ?? "",
      iconKey: form.iconKey ?? "",
      color: form.color ?? COLOR_PRESETS[0].value,
      sortOrder: form.sortOrder ?? 0,
      isActive: form.isActive ?? true,
    };

    setSaving(true);
    try {
      if (editing) {
        await update(editing.id, payload);
        toast.success("Category updated");
      } else {
        await create(payload);
        toast.success("Category created");
      }
      setDialogOpen(false);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!deleteId) return;
    try {
      await remove(deleteId);
      toast.success("Category deleted");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Delete failed");
    } finally {
      setDeleteId(null);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-semibold text-stone-900">Categories</h1>
          <p className="mt-1 text-sm text-stone-500">
            Manage equipment categories shown on the marketplace, filters, and listing form.
          </p>
        </div>
        <Button type="button" onClick={openCreate} className="gap-2">
          <Plus size={16} />
          Add category
        </Button>
      </div>

      {isLoading ? (
        <LoadingSkeleton rows={5} />
      ) : sorted.length === 0 ? (
        <div className="space-y-4">
          <EmptyState
            icon={Layers}
            title="No categories yet"
            description="Create your first category with a name, icon, description, and color."
          />
          <div className="flex justify-center">
            <Button type="button" onClick={openCreate}>
              Add category
            </Button>
          </div>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-stone-200 bg-white">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-stone-100 bg-stone-50/80 text-xs font-semibold uppercase tracking-wide text-stone-500">
              <tr>
                <th className="px-4 py-3">Icon</th>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Slug</th>
                <th className="px-4 py-3">Listings</th>
                <th className="px-4 py-3">Order</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {sorted.map((row) => (
                <tr key={row.id} className="hover:bg-stone-50/50">
                  <td className="px-4 py-3">
                    <span
                      className={cn(
                        "inline-flex h-10 w-10 items-center justify-center rounded-lg ring-1 ring-stone-100",
                        row.color
                      )}
                    >
                      {row.iconUrl ? (
                        <img src={row.iconUrl} alt="" className="h-6 w-6 object-contain" />
                      ) : (
                        <Layers className="h-5 w-5 opacity-40" />
                      )}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-medium text-stone-900">{row.name}</p>
                    <p className="mt-0.5 line-clamp-1 max-w-xs text-xs text-stone-500">
                      {row.description || "—"}
                    </p>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-stone-600">{row.slug}</td>
                  <td className="px-4 py-3 tabular-nums">{row._count?.equipment ?? 0}</td>
                  <td className="px-4 py-3 tabular-nums">{row.sortOrder}</td>
                  <td className="px-4 py-3">
                    <Badge variant={row.isActive ? "default" : "secondary"}>
                      {row.isActive ? "Active" : "Hidden"}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-1">
                      <Button type="button" variant="ghost" size="icon" onClick={() => openEdit(row)}>
                        <Pencil size={15} />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="text-red-600 hover:text-red-700"
                        onClick={() => setDeleteId(row.id)}
                        disabled={(row._count?.equipment ?? 0) > 0}
                        title={
                          (row._count?.equipment ?? 0) > 0
                            ? "Remove listings from this category first"
                            : "Delete"
                        }
                      >
                        <Trash2 size={15} />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit category" : "New category"}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Name *</Label>
              <Input
                value={form.name}
                onChange={(e) => {
                  const name = e.target.value;
                  setForm((f) => ({
                    ...f,
                    name,
                    ...(!slugTouched ? { slug: slugify(name) } : {}),
                  }));
                }}
                placeholder="Construction"
              />
            </div>

            <div className="space-y-2">
              <Label>Slug</Label>
              <Input
                value={form.slug ?? ""}
                onChange={(e) => {
                  setSlugTouched(true);
                  setForm((f) => ({ ...f, slug: e.target.value }));
                }}
                placeholder="construction"
                className="font-mono text-sm"
              />
            </div>

            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                value={form.description ?? ""}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                rows={3}
                placeholder="Short text shown on the home page and category cards."
              />
            </div>

            <div className="space-y-2">
              <Label>Icon image</Label>
              <div className="flex items-center gap-4">
                <span
                  className={cn(
                    "flex h-14 w-14 items-center justify-center rounded-xl ring-1 ring-stone-200",
                    form.color
                  )}
                >
                  {form.iconUrl ? (
                    <img src={form.iconUrl} alt="" className="h-8 w-8 object-contain" />
                  ) : (
                    <ImagePlus className="h-6 w-6 text-stone-400" />
                  )}
                </span>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) void handleIconFile(file);
                    e.target.value = "";
                  }}
                />
                <Button
                  type="button"
                  variant="outline"
                  disabled={uploading}
                  onClick={() => fileRef.current?.click()}
                >
                  {uploading ? "Uploading…" : "Upload to storage"}
                </Button>
              </div>
              <p className="text-xs text-stone-500">PNG or SVG recommended, max 2MB. Stored in Cloudinary.</p>
            </div>

            <div className="space-y-2">
              <Label>Color (Tailwind classes)</Label>
              <div className="flex flex-wrap gap-2">
                {COLOR_PRESETS.map((p) => (
                  <button
                    key={p.value}
                    type="button"
                    onClick={() => setForm((f) => ({ ...f, color: p.value }))}
                    className={cn(
                      "rounded-lg px-3 py-1.5 text-xs font-medium ring-2 transition-all",
                      p.value,
                      form.color === p.value ? "ring-brand-500" : "ring-transparent"
                    )}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Sort order</Label>
                <Input
                  type="number"
                  min={0}
                  value={form.sortOrder ?? 0}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, sortOrder: Number(e.target.value) || 0 }))
                  }
                />
              </div>
              <div className="flex items-end gap-2 pb-2">
                <input
                  id="cat-active"
                  type="checkbox"
                  className="h-4 w-4 rounded border-stone-300"
                  checked={form.isActive ?? true}
                  onChange={(e) => setForm((f) => ({ ...f, isActive: e.target.checked }))}
                />
                <Label htmlFor="cat-active">Active on marketplace</Label>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button type="button" onClick={() => void handleSave()} disabled={saving || uploading}>
              {saving ? "Saving…" : editing ? "Save changes" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={deleteId !== null}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Delete category?"
        description="This cannot be undone. Categories with equipment cannot be deleted."
        confirmLabel="Delete"
        variant="destructive"
      />
    </div>
  );
}
