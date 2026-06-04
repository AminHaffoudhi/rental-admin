import type { ReactElement, ReactNode } from "react";
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { ArrowLeft, Mail, Phone } from "lucide-react";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import {
  canReviewKyc,
  displayKycStatus,
  showEquipmentSection,
  showKycSection,
  showOwnerBookings,
  showRenterBookings,
} from "@/lib/userDisplay";
import { cn } from "@/lib/utils";
import type { AdminUserDetail } from "@/types/admin";
import type { Booking } from "@/types/booking";
import type { Equipment } from "@/types/equipment";
import type { Role } from "@/types/user";
import { formatCurrency } from "@/utils/currency";
import { formatDate, formatDateRange } from "@/utils/dates";

const tableWrapClass =
  "overflow-x-auto rounded-lg border border-stone-100 dark:border-stone-800";
const tableHeadClass =
  "text-[10px] font-semibold uppercase tracking-wider text-stone-500 dark:text-stone-400";
const tableRowClass =
  "border-stone-100 bg-white hover:bg-stone-50/80 dark:border-stone-800 dark:bg-stone-950 dark:hover:bg-stone-900/60";
const tableCellClass = "text-xs text-stone-700 dark:text-stone-300";

function DetailTable(props: { children: ReactNode }): ReactElement {
  return (
    <div className={tableWrapClass}>
      <Table>{props.children}</Table>
    </div>
  );
}

function BookingsTable(props: { bookings: Booking[]; emptyLabel: string }): ReactElement {
  return (
    <DetailTable>
      <TableHeader>
        <TableRow className="border-stone-100 bg-stone-50 hover:bg-stone-50 dark:border-stone-800 dark:bg-stone-900/80">
          <TableHead className={tableHeadClass}>Booking</TableHead>
          <TableHead className={tableHeadClass}>Equipment</TableHead>
          <TableHead className={cn(tableHeadClass, "hidden sm:table-cell")}>Dates</TableHead>
          <TableHead className={tableHeadClass}>Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {props.bookings.map((b) => (
          <TableRow key={b.id} className={tableRowClass}>
            <TableCell className={cn(tableCellClass, "font-mono")}>
              <Link className="text-primary hover:underline" to={`/bookings/${b.id}`}>
                {b.id.slice(0, 8)}…
              </Link>
            </TableCell>
            <TableCell className={cn(tableCellClass, "max-w-[120px] truncate sm:max-w-[200px]")}>
              {b.equipment.title}
            </TableCell>
            <TableCell
              className={cn(
                tableCellClass,
                "hidden whitespace-nowrap tabular-nums sm:table-cell"
              )}
            >
              {formatDateRange(b.startDate, b.endDate)}
            </TableCell>
            <TableCell>
              <StatusBadge status={b.status} />
            </TableCell>
          </TableRow>
        ))}
        {props.bookings.length === 0 ? (
          <TableRow className={tableRowClass}>
            <TableCell colSpan={4} className="py-10 text-center text-sm text-muted-foreground">
              {props.emptyLabel}
            </TableCell>
          </TableRow>
        ) : null}
      </TableBody>
    </DetailTable>
  );
}

function EquipmentTable(props: { items: Equipment[] }): ReactElement {
  return (
    <DetailTable>
      <TableHeader>
        <TableRow className="border-stone-100 bg-stone-50 hover:bg-stone-50 dark:border-stone-800 dark:bg-stone-900/80">
          <TableHead className={tableHeadClass}>Title</TableHead>
          <TableHead className={tableHeadClass}>Rate</TableHead>
          <TableHead className={tableHeadClass}>Available</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {props.items.map((eq) => (
          <TableRow key={eq.id} className={tableRowClass}>
            <TableCell className={cn(tableCellClass, "max-w-[200px] truncate font-medium")}>
              {eq.title}
            </TableCell>
            <TableCell className={cn(tableCellClass, "tabular-nums")}>
              {formatCurrency(eq.dailyRate)}
            </TableCell>
            <TableCell className={tableCellClass}>{eq.isAvailable ? "Yes" : "No"}</TableCell>
          </TableRow>
        ))}
        {props.items.length === 0 ? (
          <TableRow className={tableRowClass}>
            <TableCell colSpan={3} className="py-10 text-center text-sm text-muted-foreground">
              No listings yet
            </TableCell>
          </TableRow>
        ) : null}
      </TableBody>
    </DetailTable>
  );
}

export function UserDetail(): ReactElement {
  const { id } = useParams<{ id: string }>();
  const [user, setUser] = useState<AdminUserDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState<Role>("RENTER");
  const [approveOpen, setApproveOpen] = useState(false);
  const [blockOpen, setBlockOpen] = useState(false);
  const [unblockOpen, setUnblockOpen] = useState(false);
  const [blockReason, setBlockReason] = useState("");

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

  async function blockAccount() {
    if (!id) return;
    try {
      await userService.blockUser(id, blockReason.trim() || undefined);
      toast.success("User blocked");
      setBlockReason("");
      setBlockOpen(false);
      await load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed");
    }
  }

  async function unblockAccount() {
    if (!id) return;
    try {
      await userService.unblockUser(id);
      toast.success("User unblocked");
      setUnblockOpen(false);
      await load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed");
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-5 w-32 animate-pulse rounded bg-stone-200 dark:bg-stone-800" />
        <div className="h-48 animate-pulse rounded-xl bg-stone-200 dark:bg-stone-800" />
        <div className="h-40 animate-pulse rounded-xl bg-stone-200 dark:bg-stone-800" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="rounded-xl border border-dashed border-stone-200 p-10 text-center dark:border-stone-700">
        <p className="text-sm text-muted-foreground">User not found</p>
        <Button variant="link" asChild className="mt-2">
          <Link to="/users">Back to users</Link>
        </Button>
      </div>
    );
  }

  const initials = user.name
    .split(" ")
    .map((s) => s[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const ownerFeatures = showEquipmentSection(user.role);
  const kycApplies = showKycSection(user.role);

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <Link
        to="/users"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-stone-500 transition-colors hover:text-stone-800 dark:text-stone-400 dark:hover:text-stone-200"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to users
      </Link>

      <Card className="border-stone-200 shadow-sm dark:border-stone-800">
        <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-start">
          <Avatar className="h-16 w-16 shrink-0 border-2 border-stone-100 dark:border-stone-700">
            {user.image ? <AvatarImage src={user.image} alt="" /> : null}
            <AvatarFallback className="text-lg">{initials}</AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1 space-y-3">
            <div>
              <CardTitle className="text-xl text-stone-900 dark:text-stone-100">
                {user.name}
              </CardTitle>
              <CardDescription className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1">
                <span className="inline-flex items-center gap-1">
                  <Mail className="h-3.5 w-3.5" />
                  {user.email}
                </span>
                {user.phone ? (
                  <span className="inline-flex items-center gap-1">
                    <Phone className="h-3.5 w-3.5" />
                    {user.phone}
                  </span>
                ) : null}
              </CardDescription>
            </div>
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary">{user.role}</Badge>
              <StatusBadge status={user.blockedAt ? "BLOCKED" : "ACTIVE"} />
              {kycApplies ? (
                <StatusBadge status={displayKycStatus(user)} />
              ) : (
                <span className="inline-flex items-center rounded-full border border-stone-200 bg-stone-50 px-2.5 py-0.5 text-xs font-medium text-stone-600 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-400">
                  KYC not required
                </span>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              Joined {formatDate(user.createdAt)}
              {!kycApplies ? " · Renters are not required to complete identity verification." : null}
            </p>
          </div>
        </CardHeader>

        <CardContent className="space-y-4 border-t border-stone-100 pt-6 dark:border-stone-800">
          {kycApplies && user.kycDocument?.documentUrl ? (
            <div className="rounded-lg border border-stone-100 bg-stone-50/80 p-4 dark:border-stone-800 dark:bg-stone-900/50">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-stone-500 dark:text-stone-400">
                KYC document
              </p>
              <a
                href={user.kycDocument.documentUrl}
                target="_blank"
                rel="noreferrer"
                className="text-sm font-medium text-primary underline-offset-2 hover:underline"
              >
                Open submitted document
              </a>
            </div>
          ) : null}

          <div className="flex flex-wrap gap-2">
            {canReviewKyc(user) ? (
              <Button size="sm" onClick={() => setApproveOpen(true)}>
                Approve KYC
              </Button>
            ) : null}
            {user.blockedAt ? (
              <Button size="sm" variant="outline" onClick={() => setUnblockOpen(true)}>
                Unblock user
              </Button>
            ) : (
              <Button size="sm" variant="destructive" onClick={() => setBlockOpen(true)}>
                Block user
              </Button>
            )}
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end">
            <div className="w-full space-y-1 sm:w-auto sm:min-w-[200px]">
              <Label className="text-xs text-muted-foreground">Role</Label>
              <Select value={role} onValueChange={(v) => setRole(v as Role)}>
                <SelectTrigger className="w-full sm:w-[200px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="RENTER">Renter</SelectItem>
                  <SelectItem value="OWNER">Owner</SelectItem>
                  <SelectItem value="BOTH">Both</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button size="sm" className="w-full sm:w-auto" onClick={() => void saveRole()}>
              Save role
            </Button>
          </div>

          {user.blockedAt && user.blockedReason ? (
            <p className="text-sm text-red-600 dark:text-red-400">
              Block reason: {user.blockedReason}
            </p>
          ) : null}
        </CardContent>
      </Card>

      {ownerFeatures ? (
        <Card className="border-stone-200 dark:border-stone-800">
          <CardHeader>
            <CardTitle className="text-base text-stone-900 dark:text-stone-100">
              Equipment listings
            </CardTitle>
            <CardDescription>Items this user offers for rent as an owner.</CardDescription>
          </CardHeader>
          <CardContent>
            <EquipmentTable items={user.equipment} />
          </CardContent>
        </Card>
      ) : null}

      {showRenterBookings(user.role) ? (
        <Card className="border-stone-200 dark:border-stone-800">
          <CardHeader>
            <CardTitle className="text-base text-stone-900 dark:text-stone-100">
              Bookings as renter
            </CardTitle>
            <CardDescription>Equipment this user has rented from others.</CardDescription>
          </CardHeader>
          <CardContent>
            <BookingsTable bookings={user.bookingsAsRenter} emptyLabel="No renter bookings yet" />
          </CardContent>
        </Card>
      ) : null}

      {showOwnerBookings(user.role) ? (
        <Card className="border-stone-200 dark:border-stone-800">
          <CardHeader>
            <CardTitle className="text-base text-stone-900 dark:text-stone-100">
              Bookings as owner
            </CardTitle>
            <CardDescription>Requests on this user&apos;s equipment.</CardDescription>
          </CardHeader>
          <CardContent>
            <BookingsTable bookings={user.bookingsAsOwner} emptyLabel="No owner bookings yet" />
          </CardContent>
        </Card>
      ) : null}

      <ConfirmDialog
        open={approveOpen}
        onClose={() => setApproveOpen(false)}
        onConfirm={approve}
        title="Approve KYC?"
        confirmLabel="Approve"
      />

      <ConfirmDialog
        open={unblockOpen}
        onClose={() => setUnblockOpen(false)}
        onConfirm={() => void unblockAccount()}
        title="Unblock user?"
        description="They will be able to sign in again."
        confirmLabel="Unblock"
      />

      <Dialog open={blockOpen} onOpenChange={(o) => !o && setBlockOpen(false)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Block user</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            They will be signed out and cannot log in until unblocked.
          </p>
          <div className="space-y-2">
            <Label htmlFor="detail-block-reason">Reason (optional)</Label>
            <Textarea
              id="detail-block-reason"
              value={blockReason}
              onChange={(e) => setBlockReason(e.target.value)}
              rows={3}
              maxLength={500}
            />
          </div>
          <DialogFooter className="flex-col gap-2 sm:flex-row">
            <Button variant="outline" className="w-full sm:w-auto" onClick={() => setBlockOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              className="w-full sm:w-auto"
              onClick={() => void blockAccount()}
            >
              Block user
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
