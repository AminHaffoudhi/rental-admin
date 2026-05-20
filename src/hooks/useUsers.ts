import { useCallback, useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import * as userService from "@/services/user.service";
import type { Role } from "@/types/user";
import type { User } from "@/types/user";

export function useUsers(
  filters?: { role?: string; kycStatus?: string; search?: string },
  options?: { afterMutation?: () => void | Promise<void> }
): {
  users: User[];
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
  approveKyc: (userId: string) => Promise<void>;
  rejectKyc: (userId: string, note: string) => Promise<void>;
  updateRole: (userId: string, role: Role) => Promise<void>;
} {
  const afterMutationRef = useRef(options?.afterMutation);
  useEffect(() => {
    afterMutationRef.current = options?.afterMutation;
  }, [options?.afterMutation]);

  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await userService.getAllUsers(filters);
      setUsers(data);
    } catch (e) {
      setError(e instanceof Error ? e : new Error("Failed to load users"));
    } finally {
      setLoading(false);
    }
  }, [filters?.role, filters?.kycStatus, filters?.search]);

  useEffect(() => {
    void fetchUsers();
  }, [fetchUsers]);

  const approveKyc = useCallback(
    async (userId: string) => {
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, kycStatus: "APPROVED", canList: true } : u))
      );
      try {
        await userService.approveKyc(userId);
        toast.success("KYC approved — owner can now list equipment");
        void fetchUsers();
        await afterMutationRef.current?.();
      } catch (err) {
        toast.error("Failed to approve KYC");
        await fetchUsers();
        throw err;
      }
    },
    [fetchUsers]
  );

  const rejectKyc = useCallback(
    async (userId: string, note: string) => {
      setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, kycStatus: "REJECTED" } : u)));
      try {
        await userService.rejectKyc(userId, note);
        toast.success("KYC rejected — owner notified by email");
        void fetchUsers();
        await afterMutationRef.current?.();
      } catch (err) {
        toast.error("Failed to reject KYC");
        await fetchUsers();
        throw err;
      }
    },
    [fetchUsers]
  );

  const updateRole = useCallback(
    async (userId: string, role: Role) => {
      await userService.updateRole(userId, role);
      await fetchUsers();
      await afterMutationRef.current?.();
    },
    [fetchUsers]
  );

  return { users, isLoading, error, refetch: fetchUsers, approveKyc, rejectKyc, updateRole };
}
