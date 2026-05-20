import type { Dispute } from "@/types/dispute";
import { api, unwrap } from "@/services/api";

export async function getAllDisputes(filters?: { status?: string }): Promise<Dispute[]> {
  const res = await api.get("/disputes", { params: filters });
  return unwrap(res);
}

export async function getDisputeById(id: string): Promise<Dispute> {
  const res = await api.get(`/disputes/${id}`);
  return unwrap(res);
}

export async function resolveDispute(
  id: string,
  data: { resolution: string; outcome: "RESOLVED_OWNER" | "RESOLVED_RENTER" }
): Promise<Dispute> {
  const res = await api.post(`/disputes/${id}/resolve`, data);
  return unwrap(res);
}
