import type { User } from "@/types/user";
import { api, unwrap } from "@/services/api";

export async function getMe(): Promise<User> {
  const res = await api.get("/profile/me");
  return unwrap(res);
}

export async function updateProfile(data: {
  name?: string;
  image?: string;
}): Promise<User> {
  const res = await api.patch("/profile/me", data);
  return unwrap(res);
}

export async function changePassword(data: {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}): Promise<void> {
  const res = await api.patch("/profile/me/password", data);
  unwrap(res);
}
