import type { AxiosResponse } from "axios";
import type { Review, ReviewStatus, ReviewType } from "@/types/review";
import type { ApiResponse } from "@/types/api";
import { api, unwrap } from "@/services/api";

export async function getAllReviews(filters?: {
  status?: ReviewStatus;
  type?: ReviewType;
  search?: string;
}): Promise<Review[]> {
  const res = await api.get("/reviews", { params: filters });
  return unwrap(res);
}

export async function approveReview(id: string): Promise<Review> {
  const res: AxiosResponse<ApiResponse<Review>> = await api.post(`/reviews/${id}/approve`);
  return unwrap(res);
}

export async function rejectReview(id: string, note: string): Promise<Review> {
  const res: AxiosResponse<ApiResponse<Review>> = await api.post(`/reviews/${id}/reject`, { note });
  return unwrap(res);
}

export async function deleteReview(id: string): Promise<void> {
  const res: AxiosResponse<ApiResponse<null>> = await api.delete(`/reviews/${id}`);
  unwrap(res);
}
