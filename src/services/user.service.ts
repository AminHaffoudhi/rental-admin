import type { AdminUserDetail } from "@/types/admin";
import type { Role } from "@/types/user";
import type { User } from "@/types/user";
import { api, unwrap } from "@/services/api";

export async function getAllUsers(filters?: {
  role?: string;
  kycStatus?: string;
  search?: string;
}): Promise<User[]> {
  const res = await api.get("/users", { params: filters });
  return unwrap(res);
}

export async function getUserById(id: string): Promise<AdminUserDetail> {
  const res = await api.get(`/users/${id}`);
  return unwrap(res);
}

export async function approveKyc(userId: string): Promise<User> {
  const res = await api.post(`/users/${userId}/kyc/approve`);
  return unwrap(res);
}

export async function rejectKyc(userId: string, note: string): Promise<User> {
  const res = await api.post(`/users/${userId}/kyc/reject`, {
    action: "REJECTED",
    note,
  });
  return unwrap(res);
}

export async function updateRole(userId: string, role: Role): Promise<User> {
  const res = await api.put(`/users/${userId}/role`, { role });
  return unwrap(res);
}

export async function blockUser(userId: string, reason?: string): Promise<User> {
  const res = await api.post(`/users/${userId}/block`, { reason });
  return unwrap(res);
}

export async function unblockUser(userId: string): Promise<User> {
  const res = await api.post(`/users/${userId}/unblock`);
  return unwrap(res);
}
