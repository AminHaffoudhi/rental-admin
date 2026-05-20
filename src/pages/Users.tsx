import type { ReactElement } from "react";
import { useCallback, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { useSearchParams } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Check, CheckCircle, Clock, Users as UsersIcon, X } from "lucide-react";
import { StatCard } from "@/components/cards/StatCard";
import { KycReviewCard } from "@/components/kyc/KycReviewCard";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { UsersTable } from "@/components/tables/UsersTable";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useUsers } from "@/hooks/useUsers";
import type { Role } from "@/types/user";
import type { User } from "@/types/user";

export function Users(): ReactElement {
  const [searchParams] = useSearchParams();
  const [search, setSearch] = useState("");
  const [role, setRole] = useState<string | undefined>(undefined);
  const [kycStatus, setKycStatus] = useState<string | undefined>(undefined);
  const [tab, setTab] = useState<"all" | "pending">("all");

  useEffect(() => {
    const t = searchParams.get("tab");
    if (t === "pending" || t === "kyc") {
      setTab("pending");
    }
  }, [searchParams]);

  const {
    users: allUsers,
    isLoading: allLoading,
    refetch: refetchAll,
  } = useUsers({});

  const filters = useMemo(
    () => ({
      search: search.trim() || undefined,
      role,
      kycStatus: tab === "pending" ? "SUBMITTED" : kycStatus,
    }),
    [search, role, kycStatus, tab]
  );

  const afterMutation = useCallback(() => void refetchAll(), [refetchAll]);

  const { users, isLoading, approveKyc, rejectKyc, updateRole } = useUsers(filters, {
    afterMutation,
  });

  const stats = useMemo(() => {
    const totalUsers = allUsers.length;
    const pendingKyc = allUsers.filter((u) => u.kycStatus === "SUBMITTED").length;
    const verifiedUsers = allUsers.filter((u) => u.kycStatus === "APPROVED").length;
    const rejectedUsers = allUsers.filter((u) => u.kycStatus === "REJECTED").length;
    return { totalUsers, pendingKyc, verifiedUsers, rejectedUsers };
  }, [allUsers]);

  const pendingKyc = useMemo(
    () => users.filter((u) => u.kycStatus === "SUBMITTED" && u.kycDocument),
    [users]
  );

  const [approveId, setApproveId] = useState<string | null>(null);
  const [rejectUser, setRejectUser] = useState<User | null>(null);
  const [rejectNote, setRejectNote] = useState("");
  const [roleUser, setRoleUser] = useState<User | null>(null);
  const [roleValue, setRoleValue] = useState<Role>("RENTER");

  async function handleApprove(): Promise<void> {
    if (!approveId) {
      return;
    }
    try {
      await approveKyc(approveId);
    } catch {
      /* toast in hook */
    } finally {
      setApproveId(null);
    }
  }

  async function handleReject(): Promise<void> {
    if (!rejectUser) {
      return;
    }
    const reason = rejectNote.trim();
    if (!reason) {
      toast.error("Please enter a reason for rejection");
      return;
    }
    try {
      await rejectKyc(rejectUser.id, reason);
      setRejectNote("");
      setRejectUser(null);
    } catch {
      /* toast in hook */
    }
  }

  async function handleRoleSave(): Promise<void> {
    if (!roleUser) {
      return;
    }
    try {
      await updateRole(roleUser.id, roleValue);
      toast.success("Role updated");
      setRoleUser(null);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed");
    }
  }

  const listLoading = tab === "pending" ? isLoading : isLoading || allLoading;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Total Users" value={stats.totalUsers} icon={UsersIcon} />
        <StatCard label="Pending KYC" value={stats.pendingKyc} icon={Clock} />
        <StatCard label="Verified" value={stats.verifiedUsers} icon={Check} />
        <StatCard label="Rejected" value={stats.rejectedUsers} icon={X} />
      </div>

      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          variant={tab === "all" ? "default" : "outline"}
          size="sm"
          onClick={() => setTab("all")}
        >
          All users
        </Button>
        <Button
          type="button"
          variant={tab === "pending" ? "default" : "outline"}
          size="sm"
          onClick={() => setTab("pending")}
        >
          Pending KYC
        </Button>
      </div>

      {tab === "pending" ? (
        <div className="space-y-4">
          {pendingKyc.length === 0 && !listLoading ? (
            <div className="py-16 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-green-50">
                <CheckCircle size={28} className="text-green-500" />
              </div>
              <h3 className="font-display text-lg text-stone-900">All caught up!</h3>
              <p className="mt-1 text-sm text-stone-500">No pending KYC submissions to review</p>
            </div>
          ) : (
            <AnimatePresence mode="popLayout">
              {pendingKyc.map((u) => (
                <motion.div
                  key={u.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -20, scale: 0.98 }}
                  transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                >
                  <KycReviewCard
                    user={u}
                    onApprove={() => approveKyc(u.id)}
                    onReject={(note) => rejectKyc(u.id, note)}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          )}
        </div>
      ) : null}

      <div className="flex flex-wrap items-end gap-3">
        <div className="space-y-1">
          <Label className="text-xs">Search</Label>
          <Input
            placeholder="Name or email"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-[220px]"
          />
        </div>
        <div className="space-y-1">
          <Label className="text-xs">Role</Label>
          <Select value={role ?? "all"} onValueChange={(v) => setRole(v === "all" ? undefined : v)}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="All" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="RENTER">Renter</SelectItem>
              <SelectItem value="OWNER">Owner</SelectItem>
              <SelectItem value="BOTH">Both</SelectItem>
              <SelectItem value="ADMIN">Admin</SelectItem>
            </SelectContent>
          </Select>
        </div>
        {tab === "all" ? (
          <div className="space-y-1">
            <Label className="text-xs">KYC</Label>
            <Select value={kycStatus ?? "all"} onValueChange={(v) => setKycStatus(v === "all" ? undefined : v)}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="All" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="PENDING">Pending</SelectItem>
                <SelectItem value="SUBMITTED">Submitted</SelectItem>
                <SelectItem value="APPROVED">Approved</SelectItem>
                <SelectItem value="REJECTED">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>
        ) : null}
      </div>

      <UsersTable
        users={users}
        isLoading={listLoading}
        onApproveKyc={(id) => setApproveId(id)}
        onRejectKyc={(id) => {
          const found = users.find((x) => x.id === id);
          if (found) {
            setRejectUser(found);
          }
        }}
        onChangeRoleClick={(u) => {
          setRoleUser(u);
          setRoleValue(u.role);
        }}
      />

      <ConfirmDialog
        open={approveId !== null}
        onClose={() => setApproveId(null)}
        onConfirm={() => void handleApprove()}
        title="Approve KYC?"
        description="The owner will be able to list equipment and will receive a confirmation email."
        confirmLabel="Approve"
      />

      <Dialog open={rejectUser !== null} onOpenChange={(o) => !o && setRejectUser(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject KYC</DialogTitle>
          </DialogHeader>
          <div className="space-y-2">
            <Label>Reason for rejection (required)</Label>
            <Textarea
              value={rejectNote}
              onChange={(e) => setRejectNote(e.target.value)}
              rows={4}
              placeholder="e.g. Document unclear, Name doesn't match, Expired document"
              required
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectUser(null)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={() => void handleReject()}>
              Confirm Rejection
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={roleUser !== null} onOpenChange={(o) => !o && setRoleUser(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change role</DialogTitle>
          </DialogHeader>
          <Select value={roleValue} onValueChange={(v) => setRoleValue(v as Role)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="RENTER">RENTER</SelectItem>
              <SelectItem value="OWNER">OWNER</SelectItem>
              <SelectItem value="BOTH">BOTH</SelectItem>
              <SelectItem value="ADMIN">ADMIN</SelectItem>
            </SelectContent>
          </Select>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRoleUser(null)}>
              Cancel
            </Button>
            <Button onClick={() => void handleRoleSave()}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
