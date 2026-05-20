import type { Stats } from "@/types/stats";
import { api, unwrap } from "@/services/api";

export async function getStats(): Promise<Stats> {
  const res = await api.get("/stats");
  return unwrap(res);
}
