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
import { canReviewKyc, displayKycStatus } from "@/lib/userDisplay";
import { formatDate } from "@/utils/dates";
import type { User } from "@/types/user";

export function UsersTable(props: {
  users: User[];
  isLoading: boolean;
  onApproveKyc: (id: string) => void;
  onRejectKyc: (id: string) => void;
  onChangeRoleClick: (user: User) => void;
  onBlock: (id: string) => void;
  onUnblock: (id: string) => void;
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
            <div className="flex min-w-[160px] items-center gap-2">
              <Avatar className="h-8 w-8 shrink-0">
                {u.image ? <AvatarImage src={u.image} alt="" /> : null}
                <AvatarFallback>{initials}</AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-stone-900 dark:text-stone-100">
                  {u.name}
                </p>
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
        id: "account",
        header: "Account",
        cell: ({ row }) => (
          <StatusBadge status={row.original.blockedAt ? "BLOCKED" : "ACTIVE"} />
        ),
      },
      {
        id: "kyc",
        header: "KYC",
        cell: ({ row }) => <StatusBadge status={displayKycStatus(row.original)} />,
      },
      {
        accessorKey: "createdAt",
        header: "Joined",
        cell: ({ row }) => (
          <span className="whitespace-nowrap text-xs tabular-nums text-stone-600 dark:text-stone-400">
            {formatDate(row.original.createdAt)}
          </span>
        ),
      },
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => {
          const u = row.original;
          const isAdmin = u.role === "ADMIN";
          return (
            <div className="flex min-w-[140px] flex-wrap items-center gap-1.5">
              {isAdmin ? (
                <span className="text-xs text-muted-foreground">—</span>
              ) : u.blockedAt ? (
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  className="h-8 text-xs"
                  onClick={() => props.onUnblock(u.id)}
                >
                  Unblock
                </Button>
              ) : (
                <Button
                  type="button"
                  size="sm"
                  variant="destructive"
                  className="h-8 text-xs"
                  onClick={() => props.onBlock(u.id)}
                >
                  Block
                </Button>
              )}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
                    <MoreHorizontal className="h-4 w-4" />
                    <span className="sr-only">More actions</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem asChild>
                    <Link to={`/users/${u.id}`}>View</Link>
                  </DropdownMenuItem>
                  {canReviewKyc(u) ? (
                    <>
                      <DropdownMenuItem onClick={() => props.onApproveKyc(u.id)}>
                        Approve KYC
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => props.onRejectKyc(u.id)}>
                        Reject KYC
                      </DropdownMenuItem>
                    </>
                  ) : null}
                  {!isAdmin ? (
                    <DropdownMenuItem onClick={() => props.onChangeRoleClick(u)}>
                      Change role
                    </DropdownMenuItem>
                  ) : null}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          );
        },
      },
    ],
    [props.onApproveKyc, props.onBlock, props.onChangeRoleClick, props.onRejectKyc, props.onUnblock]
  );

  return (
    <DataTable
      columns={columns}
      data={props.users}
      isLoading={props.isLoading}
      filterKey="email"
      searchPlaceholder="Search by name or email…"
    />
  );
}
