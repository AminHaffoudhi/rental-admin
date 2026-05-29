import type { ColumnDef } from "@tanstack/react-table";
import { useMemo, type ReactElement } from "react";
import { Check, Eye, MoreHorizontal, X } from "lucide-react";
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
import { formatDate } from "@/utils/dates";
import type { Review, ReviewStatus } from "@/types/review";

function statusBadge(status: ReviewStatus) {
  switch (status) {
    case "PENDING":
      return <Badge className="bg-amber-100 text-amber-900 hover:bg-amber-100">Pending</Badge>;
    case "APPROVED":
      return <Badge className="bg-green-100 text-green-900 hover:bg-green-100">Approved</Badge>;
    case "REJECTED":
      return <Badge variant="destructive">Rejected</Badge>;
  }
}

export function ReviewsTable(props: {
  reviews: Review[];
  isLoading: boolean;
  highlightedId?: string | null;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  onDelete: (id: string) => void;
  onView: (review: Review) => void;
}): ReactElement {
  const columns = useMemo<ColumnDef<Review>[]>(
    () => [
      {
        id: "type",
        header: "Type",
        cell: ({ row }) => (
          <Badge variant="outline">
            {row.original.type === "EQUIPMENT" ? "Listing" : "Owner"}
          </Badge>
        ),
      },
      {
        id: "reviewer",
        header: "From",
        cell: ({ row }) => (
          <span className="max-w-[120px] truncate text-xs font-medium">
            {row.original.reviewer.name}
          </span>
        ),
      },
      {
        id: "target",
        header: "About",
        cell: ({ row }) => {
          const r = row.original;
          const label =
            r.type === "EQUIPMENT"
              ? r.equipment?.title ?? "Listing"
              : r.reviewee.name;
          return <span className="max-w-[160px] truncate text-xs">{label}</span>;
        },
      },
      {
        accessorKey: "rating",
        header: "Rating",
        cell: ({ row }) => (
          <span className="text-xs font-semibold tabular-nums">{row.original.rating}/5</span>
        ),
      },
      {
        id: "status",
        header: "Status",
        cell: ({ row }) => statusBadge(row.original.status),
      },
      {
        accessorKey: "createdAt",
        header: "Date",
        cell: ({ row }) => (
          <span className="text-xs tabular-nums">{formatDate(row.original.createdAt)}</span>
        ),
      },
      {
        id: "actions",
        header: "",
        cell: ({ row }) => {
          const item = row.original;
          const pending = item.status === "PENDING";
          return (
            <div className="flex items-center justify-end gap-1">
              <Button
                type="button"
                size="sm"
                variant="outline"
                className="h-8 gap-1"
                onClick={() => props.onView(item)}
              >
                <Eye className="h-3.5 w-3.5" />
                View
              </Button>
              {pending ? (
                <>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="h-8 border-green-200 text-green-700"
                    onClick={() => props.onApprove(item.id)}
                  >
                    <Check className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="h-8 border-red-200 text-red-700"
                    onClick={() => props.onReject(item.id)}
                  >
                    <X className="h-3.5 w-3.5" />
                  </Button>
                </>
              ) : null}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {item.status !== "APPROVED" ? (
                    <DropdownMenuItem onClick={() => props.onApprove(item.id)}>
                      Approve
                    </DropdownMenuItem>
                  ) : null}
                  {item.status !== "REJECTED" ? (
                    <DropdownMenuItem onClick={() => props.onReject(item.id)}>
                      Reject
                    </DropdownMenuItem>
                  ) : null}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="text-destructive"
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
    [props]
  );

  return (
    <DataTable
      columns={columns}
      data={props.reviews}
      isLoading={props.isLoading}
      highlightedRowId={props.highlightedId}
      getRowId={(row) => row.id}
      hideSearch
    />
  );
}
