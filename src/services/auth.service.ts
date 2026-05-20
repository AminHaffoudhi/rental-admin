import type { User } from "@/types/user";
import { api, unwrap } from "@/services/api";

export async function login(email: string, password: string): Promise<{ user: User; token: string }> {
  const res = await api.post("/auth/login", { email, password });
  return unwrap(res);
}
