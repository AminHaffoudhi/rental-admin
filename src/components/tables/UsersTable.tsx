import type { ColumnDef } from "@tanstack/react-table";
import { useMemo, type ReactElement } from "react";
import { Link } from "react-router-dom";
import { MoreHorizontal } from "lucide-react";
import { DataTable } from "@/components/shared/DataTable";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatDate } from "@/utils/dates";
import type { User } from "@/types/user";

export function UsersTable(props: {
  users: User[];
  isLoading: boolean;
  onApproveKyc: (id: string) => void;
  onRejectKyc: (id: string) => void;
  onChangeRoleClick: (user: User) => void;
}): ReactElement {
  const columns = useMemo<ColumnDef<User>[]>(
    () => [
      {
        accessorKey: "name",
        header: "User",
        cell: ({ row }) => {
          const u = row.original;
          const initials = u.name
            .split(" ")
            .map((s) => s[0])
            .join("")
            .slice(0, 2)
            .toUpperCase();
          return (
            <div className="flex items-center gap-2">
              <Avatar className="h-8 w-8">
                {u.image ? <AvatarImage src={u.image} alt="" /> : null}
                <AvatarFallback>{initials}</AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">{u.name}</p>
                <p className="truncate text-xs text-muted-foreground">{u.email}</p>
              </div>
            </div>
          );
        },
      },
      {
        accessorKey: "role",
        header: "Role",
        cell: ({ row }) => <Badge variant="secondary">{row.original.role}</Badge>,
      },
      {
        accessorKey: "kycStatus",
        header: "KYC",
        cell: ({ row }) => <StatusBadge status={row.original.kycStatus} />,
      },
      {
        accessorKey: "createdAt",
        header: "Joined",
        cell: ({ row }) => (
          <span className="text-xs tabular-nums">{formatDate(row.original.createdAt)}</span>
        ),
      },
      {
        id: "actions",
        header: "",
        cell: ({ row }) => {
          const u = row.original;
          return (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                  <Link to={`/users/${u.id}`}>View</Link>
                </DropdownMenuItem>
                {u.kycStatus === "SUBMITTED" ? (
                  <>
                    <DropdownMenuItem onClick={() => props.onApproveKyc(u.id)}>
                      Approve KYC
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => props.onRejectKyc(u.id)}>
                      Reject KYC
                    </DropdownMenuItem>
                  </>
                ) : null}
                <DropdownMenuItem onClick={() => props.onChangeRoleClick(u)}>Change role</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          );
        },
      },
    ],
    [props.onApproveKyc, props.onChangeRoleClick, props.onRejectKyc]
  );

  return (
    <DataTable columns={columns} data={props.users} isLoading={props.isLoading} filterKey="email" />
  );
}
