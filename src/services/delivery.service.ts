import type { Delivery } from "@/types/delivery";
import type { DeliveryStatus } from "@/types/delivery";
import { api, unwrap } from "@/services/api";

export async function getAllDeliveries(filters?: { status?: string }): Promise<Delivery[]> {
  const res = await api.get("/deliveries", { params: filters });
  return unwrap(res);
}

export async function assignAgent(
  id: string,
  data: { agentName: string; agentPhone: string; deliverySlot: string }
): Promise<Delivery> {
  const res = await api.post(`/deliveries/${id}/assign-agent`, data);
  return unwrap(res);
}

export async function updateStatus(id: string, status: DeliveryStatus): Promise<Delivery> {
  const res = await api.put(`/deliveries/${id}/status`, { status });
  return unwrap(res);
}
