import type { ColumnDef } from "@tanstack/react-table";
import { useMemo, type ReactElement } from "react";
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
import { formatDate } from "@/utils/dates";
import type { Payment } from "@/types/payment";

export function PaymentsTable(props: {
  payments: Payment[];
  isLoading: boolean;
  onSendPayout: (paymentId: string) => void;
}): ReactElement {
  const columns = useMemo<ColumnDef<Payment>[]>(
    () => [
      {
        id: "booking",
        header: "Booking",
        cell: ({ row }) => (
          <span className="font-mono text-xs">{row.original.booking?.id.slice(0, 8) ?? row.original.bookingId.slice(0, 8)}…</span>
        ),
      },
      {
        id: "renter",
        header: "Renter",
        cell: ({ row }) => (
          <span className="max-w-[140px] truncate text-xs">
            {row.original.booking?.renter.email ?? "—"}
          </span>
        ),
      },
      {
        id: "owner",
        header: "Owner",
        cell: ({ row }) => (
          <span className="max-w-[140px] truncate text-xs">
            {row.original.booking?.owner.email ?? "—"}
          </span>
        ),
      },
      {
        accessorKey: "amount",
        header: "Amount",
        cell: ({ row }) => (
          <span className="text-xs tabular-nums">{formatCurrency(row.original.amount)}</span>
        ),
      },
      {
        accessorKey: "depositAmount",
        header: "Deposit",
        cell: ({ row }) => (
          <span className="text-xs tabular-nums">{formatCurrency(row.original.depositAmount)}</span>
        ),
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => <StatusBadge status={row.original.status} />,
      },
      {
        accessorKey: "confirmedAt",
        header: "Confirmed",
        cell: ({ row }) => (
          <span className="text-xs tabular-nums">
            {row.original.confirmedAt ? formatDate(row.original.confirmedAt) : "—"}
          </span>
        ),
      },
      {
        id: "actions",
        header: "",
        cell: ({ row }) => {
          const p = row.original;
          return (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {p.status === "PAYOUT_PENDING" ? (
                  <DropdownMenuItem onClick={() => props.onSendPayout(p.id)}>Send payout</DropdownMenuItem>
                ) : (
                  <DropdownMenuItem disabled>No action</DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          );
        },
      },
    ],
    [props]
  );

  return <DataTable columns={columns} data={props.payments} isLoading={props.isLoading} />;
}
