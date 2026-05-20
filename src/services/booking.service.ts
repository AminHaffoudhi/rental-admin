import type { Booking } from "@/types/booking";
import { api, unwrap } from "@/services/api";

export async function getAllBookings(filters?: { status?: string }): Promise<Booking[]> {
  const res = await api.get("/bookings", { params: filters });
  return unwrap(res);
}

export async function getBookingById(id: string): Promise<Booking> {
  const res = await api.get(`/bookings/${id}`);
  return unwrap(res);
}

export async function confirmPayment(bookingId: string): Promise<Booking> {
  const res = await api.post(`/bookings/${bookingId}/confirm-payment`, {});
  return unwrap(res);
}

export async function forceComplete(bookingId: string): Promise<Booking> {
  const res = await api.post(`/bookings/${bookingId}/force-complete`);
  return unwrap(res);
}

export async function forceCancel(bookingId: string): Promise<Booking> {
  const res = await api.post(`/bookings/${bookingId}/force-cancel`);
  return unwrap(res);
}
