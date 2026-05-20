import type { ColumnDef } from "@tanstack/react-table";
import { useMemo, type ReactElement } from "react";
import { Link } from "react-router-dom";
import { MoreHorizontal } from "lucide-react";
import { DataTable } from "@/components/shared/DataTable";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatDate } from "@/utils/dates";
import type { Dispute } from "@/types/dispute";

export function DisputesTable(props: {
  disputes: Dispute[];
  isLoading: boolean;
}): ReactElement {
  const columns = useMemo<ColumnDef<Dispute>[]>(
    () => [
      {
        id: "booking",
        header: "Booking",
        cell: ({ row }) => (
          <Link className="font-mono text-xs text-primary hover:underline" to={`/disputes/${row.original.id}`}>
            {row.original.bookingId.slice(0, 8)}…
          </Link>
        ),
      },
      {
        id: "raisedBy",
        header: "Raised by",
        cell: ({ row }) => (
          <span className="max-w-[140px] truncate text-xs">{row.original.raisedBy.email}</span>
        ),
      },
      {
        accessorKey: "reason",
        header: "Reason",
        cell: ({ row }) => (
          <span className="max-w-[200px] truncate text-xs">{row.original.reason}</span>
        ),
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => <StatusBadge status={row.original.status} />,
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
          const d = row.original;
          return (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                  <Link to={`/disputes/${d.id}`}>View & resolve</Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          );
        },
      },
    ],
    []
  );

  return <DataTable columns={columns} data={props.disputes} isLoading={props.isLoading} />;
}
