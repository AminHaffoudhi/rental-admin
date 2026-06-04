import type { ColumnDef } from "@tanstack/react-table";
import { useMemo, type ReactElement } from "react";
import { Link } from "react-router-dom";
import { Mail, MoreHorizontal } from "lucide-react";
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
import type { SupportReport } from "@/types/report";
import { cn } from "@/lib/utils";

function typeLabel(type: SupportReport["type"]): string {
  return type === "REPORT" ? "Issue" : "Contact";
}

export function ReportsTable(props: {
  reports: SupportReport[];
  isLoading: boolean;
  search?: string;
  onSearchChange?: (value: string) => void;
}): ReactElement {
  const columns = useMemo<ColumnDef<SupportReport>[]>(
    () => [
      {
        id: "from",
        header: "From",
        accessorFn: (row) => `${row.firstName} ${row.lastName} ${row.email}`,
        cell: ({ row }) => {
          const r = row.original;
          return (
            <div className="min-w-[140px]">
              <Link
                to={`/reports/${r.id}`}
                className={cn(
                  "block text-sm font-medium hover:text-primary hover:underline",
                  r.status === "NEW" ? "text-foreground" : "text-muted-foreground"
                )}
              >
                {r.firstName} {r.lastName}
              </Link>
              <p className="max-w-[180px] truncate text-xs text-muted-foreground">{r.email}</p>
            </div>
          );
        },
      },
      {
        accessorKey: "type",
        header: "Type",
        cell: ({ row }) => (
          <span
            className={cn(
              "badge text-[11px]",
              row.original.type === "REPORT" ? "badge-red" : "badge-blue"
            )}
          >
            {typeLabel(row.original.type)}
          </span>
        ),
      },
      {
        id: "subject",
        header: "Subject",
        cell: ({ row }) => (
          <span className="block max-w-[200px] truncate text-xs sm:max-w-[280px]">
            {row.original.subject || row.original.message.slice(0, 60)}
          </span>
        ),
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => <StatusBadge status={row.original.status} />,
      },
      {
        accessorKey: "createdAt",
        header: "Received",
        cell: ({ row }) => (
          <span className="whitespace-nowrap text-xs tabular-nums text-muted-foreground">
            {formatDate(row.original.createdAt)}
          </span>
        ),
      },
      {
        id: "actions",
        header: "",
        cell: ({ row }) => {
          const r = row.original;
          return (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                  <Link to={`/reports/${r.id}`}>
                    <Mail className="mr-2 h-3.5 w-3.5" />
                    View message
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          );
        },
      },
    ],
    []
  );

  return (
    <DataTable
      columns={columns}
      data={props.reports}
      isLoading={props.isLoading}
      searchKey="from"
      searchPlaceholder="Search name, email, message…"
      pageSize={15}
      getRowId={(row) => row.id}
    />
  );
}
