import type { ColumnDef } from "@tanstack/react-table";
import { useMemo, type ReactElement } from "react";
import { Eye, MoreHorizontal } from "lucide-react";
import { DataTable } from "@/components/shared/DataTable";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatCurrency } from "@/utils/currency";
import { formatDate } from "@/utils/dates";
import type { Equipment, EquipmentApprovalStatus } from "@/types/equipment";

function statusBadge(status: EquipmentApprovalStatus) {
  switch (status) {
    case "PENDING":
      return (
        <Badge className="bg-amber-100 text-amber-900 hover:bg-amber-100">Pending</Badge>
      );
    case "APPROVED":
      return (
        <Badge className="bg-green-100 text-green-900 hover:bg-green-100">Approved</Badge>
      );
    case "REJECTED":
      return <Badge variant="destructive">Rejected</Badge>;
  }
}

export function EquipmentTable(props: {
  equipment: Equipment[];
  isLoading: boolean;
  highlightedId?: string | null;
  onReview: (item: Equipment) => void;
  onDelete: (id: string) => void;
}): ReactElement {
  const columns = useMemo<ColumnDef<Equipment>[]>(
    () => [
      {
        id: "image",
        header: "",
        cell: ({ row }) => (
          <button
            type="button"
            className="block overflow-hidden rounded-md border"
            onClick={() => props.onReview(row.original)}
            aria-label={`View photos for ${row.original.title}`}
          >
            <img
              src={row.original.images[0] ?? "/vite.svg"}
              alt=""
              className="h-10 w-10 object-cover transition-opacity hover:opacity-90"
            />
          </button>
        ),
      },
      {
        accessorKey: "title",
        header: "Title",
        cell: ({ row }) => (
          <button
            type="button"
            className="max-w-[180px] truncate text-left text-sm font-medium hover:text-brand-600"
            onClick={() => props.onReview(row.original)}
          >
            {row.original.title}
          </button>
        ),
      },
      {
        id: "owner",
        header: "Owner",
        cell: ({ row }) => (
          <span className="max-w-[140px] truncate text-xs">{row.original.owner.email}</span>
        ),
      },
      {
        accessorKey: "category",
        header: "Category",
        cell: ({ row }) => (
          <Badge variant="outline">{row.original.category?.name ?? "—"}</Badge>
        ),
      },
      {
        id: "status",
        header: "Status",
        cell: ({ row }) => statusBadge(row.original.approvalStatus),
      },
      {
        accessorKey: "dailyRate",
        header: "Daily",
        cell: ({ row }) => (
          <span className="text-xs tabular-nums">{formatCurrency(row.original.dailyRate)}</span>
        ),
      },
      {
        accessorKey: "isAvailable",
        header: "Live",
        cell: ({ row }) =>
          row.original.approvalStatus === "APPROVED" && row.original.isAvailable ? "Yes" : "—",
      },
      {
        accessorKey: "createdAt",
        header: "Created",
        cell: ({ row }) => (
          <span className="text-xs tabular-nums">{formatDate(row.original.createdAt)}</span>
        ),
      },
      {
        id: "actions",
        header: "",
        cell: ({ row }) => {
          const item = row.original;
          const pending = item.approvalStatus === "PENDING";
          return (
            <div className="flex items-center justify-end gap-1">
              <Button
                type="button"
                size="sm"
                variant={pending ? "default" : "outline"}
                className="h-8 gap-1"
                onClick={() => props.onReview(item)}
              >
                <Eye className="h-3.5 w-3.5" />
                {pending ? "Review" : "View"}
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => props.onReview(item)}>
                    View photos & details
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="text-destructive focus:text-destructive"
                    onClick={() => props.onDelete(item.id)}
                  >
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          );
        },
      },
    ],
    [props.onReview, props.onDelete]
  );

  return (
    <DataTable
      columns={columns}
      data={props.equipment}
      isLoading={props.isLoading}
      highlightedRowId={props.highlightedId}
      getRowId={(row) => row.id}
      hideSearch
    />
  );
}
