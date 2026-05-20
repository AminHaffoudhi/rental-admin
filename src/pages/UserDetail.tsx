import type { ReactElement } from "react";
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import * as userService from "@/services/user.service";
import type { AdminUserDetail } from "@/types/admin";
import type { Role } from "@/types/user";
import { formatCurrency } from "@/utils/currency";
import { formatDateRange } from "@/utils/dates";

export function UserDetail(): ReactElement {
  const { id } = useParams<{ id: string }>();
  const [user, setUser] = useState<AdminUserDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState<Role>("RENTER");
  const [approveOpen, setApproveOpen] = useState(false);

  async function load() {
    if (!id) return;
    setLoading(true);
    try {
      const u = await userService.getUserById(id);
      setUser(u);
      setRole(u.role);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to load user");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, [id]);

  async function saveRole() {
    if (!id) return;
    try {
      await userService.updateRole(id, role);
      toast.success("Role updated");
      await load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed");
    }
  }

  async function approve() {
    if (!id) return;
    try {
      await userService.approveKyc(id);
      toast.success("KYC approved");
      await load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed");
    }
  }

  if (loading || !user) {
    return <p className="text-sm text-muted-foreground">Loading…</p>;
  }

  const initials = user.name
    .split(" ")
    .map((s) => s[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <Card className="min-w-[280px] flex-1">
          <CardHeader className="flex flex-row items-start gap-4">
            <Avatar className="h-14 w-14">
              {user.image ? <AvatarImage src={user.image} alt="" /> : null}
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
            <div className="space-y-1">
              <CardTitle className="text-lg">{user.name}</CardTitle>
              <p className="text-sm text-muted-foreground">{user.email}</p>
              <div className="flex flex-wrap gap-2 pt-2">
                <Badge variant="secondary">{user.role}</Badge>
                <StatusBadge status={user.kycStatus} />
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {user.kycDocument?.documentUrl ? (
              <div>
                <p className="mb-1 text-xs font-medium text-muted-foreground">KYC document</p>
                <a
                  href={user.kycDocument.documentUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-sm text-primary underline"
                >
                  Open document
                </a>
              </div>
            ) : null}
            <div className="flex flex-wrap gap-2">
              {user.kycStatus === "SUBMITTED" ? (
                <>
                  <Button size="sm" onClick={() => setApproveOpen(true)}>
                    Approve KYC
                  </Button>
                  <Button size="sm" variant="destructive" asChild>
                    <Link to={`/users`}>Use list to reject</Link>
                  </Button>
                </>
              ) : null}
            </div>
            <div className="flex flex-wrap items-end gap-2">
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Role</p>
                <Select value={role} onValueChange={(v) => setRole(v as Role)}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="RENTER">RENTER</SelectItem>
                    <SelectItem value="OWNER">OWNER</SelectItem>
                    <SelectItem value="BOTH">BOTH</SelectItem>
                    <SelectItem value="ADMIN">ADMIN</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button size="sm" onClick={() => void saveRole()}>
                Save role
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Equipment</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Rate</TableHead>
                <TableHead>Available</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {user.equipment.map((eq) => (
                <TableRow key={eq.id}>
                  <TableCell className="max-w-[200px] truncate">{eq.title}</TableCell>
                  <TableCell className="text-xs tabular-nums">{formatCurrency(eq.dailyRate)}</TableCell>
                  <TableCell>{eq.isAvailable ? "Yes" : "No"}</TableCell>
                </TableRow>
              ))}
              {user.equipment.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} className="text-center text-xs text-muted-foreground">
                    No listings
                  </TableCell>
                </TableRow>
              ) : null}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Bookings as renter</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Booking</TableHead>
                <TableHead>Equipment</TableHead>
                <TableHead>Dates</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {user.bookingsAsRenter.map((b) => (
                <TableRow key={b.id}>
                  <TableCell className="font-mono text-xs">
                    <Link className="text-primary hover:underline" to={`/bookings/${b.id}`}>
                      {b.id.slice(0, 8)}…
                    </Link>
                  </TableCell>
                  <TableCell className="max-w-[140px] truncate text-xs">{b.equipment.title}</TableCell>
                  <TableCell className="whitespace-nowrap text-xs tabular-nums">
                    {formatDateRange(b.startDate, b.endDate)}
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={b.status} />
                  </TableCell>
                </TableRow>
              ))}
              {user.bookingsAsRenter.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-xs text-muted-foreground">
                    None
                  </TableCell>
                </TableRow>
              ) : null}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Bookings as owner</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Booking</TableHead>
                <TableHead>Equipment</TableHead>
                <TableHead>Dates</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {user.bookingsAsOwner.map((b) => (
                <TableRow key={b.id}>
                  <TableCell className="font-mono text-xs">
                    <Link className="text-primary hover:underline" to={`/bookings/${b.id}`}>
                      {b.id.slice(0, 8)}…
                    </Link>
                  </TableCell>
                  <TableCell className="max-w-[140px] truncate text-xs">{b.equipment.title}</TableCell>
                  <TableCell className="whitespace-nowrap text-xs tabular-nums">
                    {formatDateRange(b.startDate, b.endDate)}
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={b.status} />
                  </TableCell>
                </TableRow>
              ))}
              {user.bookingsAsOwner.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-xs text-muted-foreground">
                    None
                  </TableCell>
                </TableRow>
              ) : null}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <ConfirmDialog
        open={approveOpen}
        onClose={() => setApproveOpen(false)}
        onConfirm={approve}
        title="Approve KYC?"
        confirmLabel="Approve"
      />
    </div>
  );
}
