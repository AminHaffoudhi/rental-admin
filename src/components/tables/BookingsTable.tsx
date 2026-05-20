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
import { formatCurrency } from "@/utils/currency";
import { formatDateRange } from "@/utils/dates";
import type { Booking } from "@/types/booking";

export function BookingsTable(props: {
  bookings: Booking[];
  isLoading: boolean;
  onConfirmPayment: (id: string) => void;
  onForceComplete: (id: string) => void;
  onForceCancel: (id: string) => void;
}): ReactElement {
  const columns = useMemo<ColumnDef<Booking>[]>(
    () => [
      {
        accessorKey: "id",
        header: "Booking",
        cell: ({ row }) => (
          <Link className="font-mono text-xs text-primary hover:underline" to={`/bookings/${row.original.id}`}>
            {row.original.id.slice(0, 8)}…
          </Link>
        ),
      },
      {
        id: "equipment",
        header: "Equipment",
        cell: ({ row }) => (
          <span className="max-w-[140px] truncate text-sm">{row.original.equipment.title}</span>
        ),
      },
      {
        id: "renter",
        header: "Renter",
        cell: ({ row }) => (
          <span className="max-w-[120px] truncate text-xs">{row.original.renter.email}</span>
        ),
      },
      {
        id: "owner",
        header: "Owner",
        cell: ({ row }) => (
          <span className="max-w-[120px] truncate text-xs">{row.original.owner.email}</span>
        ),
      },
      {
        id: "dates",
        header: "Dates",
        cell: ({ row }) => (
          <span className="whitespace-nowrap text-xs tabular-nums">
            {formatDateRange(row.original.startDate, row.original.endDate)}
          </span>
        ),
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => <StatusBadge status={row.original.status} />,
      },
      {
        accessorKey: "totalPrice",
        header: "Total",
        cell: ({ row }) => (
          <span className="text-xs tabular-nums">{formatCurrency(row.original.totalPrice)}</span>
        ),
      },
      {
        id: "actions",
        header: "",
        cell: ({ row }) => {
          const b = row.original;
          return (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                  <Link to={`/bookings/${b.id}`}>View</Link>
                </DropdownMenuItem>
                {b.status === "PAYMENT_PENDING" ? (
                  <DropdownMenuItem onClick={() => props.onConfirmPayment(b.id)}>
                    Confirm payment
                  </DropdownMenuItem>
                ) : null}
                <DropdownMenuItem onClick={() => props.onForceComplete(b.id)}>Force complete</DropdownMenuItem>
                <DropdownMenuItem
                  className="text-destructive focus:text-destructive"
                  onClick={() => props.onForceCancel(b.id)}
                >
                  Force cancel
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          );
        },
      },
    ],
    [props]
  );

  return <DataTable columns={columns} data={props.bookings} isLoading={props.isLoading} />;
}
