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
import type { Delivery } from "@/types/delivery";

export function DeliveriesTable(props: {
  deliveries: Delivery[];
  isLoading: boolean;
  onAssignAgent: (deliveryId: string) => void;
  onUpdateStatus: (deliveryId: string) => void;
}): ReactElement {
  const columns = useMemo<ColumnDef<Delivery>[]>(
    () => [
      {
        id: "booking",
        header: "Booking",
        cell: ({ row }) => (
          <span className="font-mono text-xs">
            {(row.original.booking?.id ?? row.original.bookingId).slice(0, 8)}…
          </span>
        ),
      },
      {
        accessorKey: "agentName",
        header: "Agent",
        cell: ({ row }) => (
          <span className="max-w-[120px] truncate text-xs">
            {row.original.agentName ?? "—"}
          </span>
        ),
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => <StatusBadge status={row.original.status} />,
      },
      {
        accessorKey: "deliverySlot",
        header: "Pickup slot",
        cell: ({ row }) => (
          <span className="text-xs tabular-nums">
            {row.original.deliverySlot ? new Date(row.original.deliverySlot).toLocaleString() : "—"}
          </span>
        ),
      },
      {
        accessorKey: "returnSlot",
        header: "Return slot",
        cell: ({ row }) => (
          <span className="text-xs tabular-nums">
            {row.original.returnSlot ? new Date(row.original.returnSlot).toLocaleString() : "—"}
          </span>
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
                {d.status === "SCHEDULED" ? (
                  <DropdownMenuItem onClick={() => props.onAssignAgent(d.id)}>Assign agent</DropdownMenuItem>
                ) : null}
                <DropdownMenuItem onClick={() => props.onUpdateStatus(d.id)}>Update status</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          );
        },
      },
    ],
    [props]
  );

  return <DataTable columns={columns} data={props.deliveries} isLoading={props.isLoading} />;
}
