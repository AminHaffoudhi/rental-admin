import type { ColumnDef } from "@tanstack/react-table";
import { useMemo, type ReactElement } from "react";
import { MoreHorizontal } from "lucide-react";
import { DataTable } from "@/components/shared/DataTable";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatCurrency } from "@/utils/currency";
import { formatDate } from "@/utils/dates";
import type { Equipment } from "@/types/equipment";

export function EquipmentTable(props: {
  equipment: Equipment[];
  isLoading: boolean;
  onDelete: (id: string) => void;
}): ReactElement {
  const columns = useMemo<ColumnDef<Equipment>[]>(
    () => [
      {
        id: "image",
        header: "",
        cell: ({ row }) => (
          <img
            src={row.original.images[0] ?? "/vite.svg"}
            alt=""
            className="h-10 w-10 rounded-md border object-cover"
          />
        ),
      },
      {
        accessorKey: "title",
        header: "Title",
        cell: ({ row }) => (
          <span className="max-w-[180px] truncate text-sm font-medium">{row.original.title}</span>
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
        cell: ({ row }) => <Badge variant="outline">{row.original.category}</Badge>,
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
        header: "Avail.",
        cell: ({ row }) => (row.original.isAvailable ? "Yes" : "No"),
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
        cell: ({ row }) => (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                className="text-destructive focus:text-destructive"
                onClick={() => props.onDelete(row.original.id)}
              >
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ),
      },
    ],
    [props.onDelete]
  );

  return <DataTable columns={columns} data={props.equipment} isLoading={props.isLoading} />;
}
