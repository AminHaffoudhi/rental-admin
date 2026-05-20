import type { Payment } from "@/types/payment";
import { api, unwrap } from "@/services/api";

export async function getAllPayments(filters?: { status?: string }): Promise<Payment[]> {
  const res = await api.get("/payments", { params: filters });
  return unwrap(res);
}

/** Matches rental-admin-api: `POST /payments/:id/payout` where `:id` is the payment row id. */
export async function sendPayout(paymentId: string): Promise<Payment> {
  const res = await api.post(`/payments/${paymentId}/payout`, {});
  return unwrap(res);
}
