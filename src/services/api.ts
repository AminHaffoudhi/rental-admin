import axios, { type AxiosResponse } from "axios";
import { ADMIN_API_URL } from "@/config/constants";
import type { ApiResponse } from "@/types/api";
import { useAuthStore } from "@/store/authStore";

export const api = axios.create({
  baseURL: ADMIN_API_URL,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      useAuthStore.getState().clearAuth();
      const path = window.location.pathname;
      if (path !== "/login") {
        window.location.assign("/login");
      }
    }
    return Promise.reject(error);
  }
);

export function unwrap<T>(res: AxiosResponse<ApiResponse<T>>): T {
  const body = res.data;
  if (!body.success) {
    throw new Error("message" in body ? body.message : "Request failed");
  }
  return body.data;
}
