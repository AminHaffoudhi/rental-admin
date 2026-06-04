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

function isAccountBlocked(error: unknown): boolean {
  if (!axios.isAxiosError(error) || !error.response?.data || typeof error.response.data !== "object") {
    return false;
  }
  return (error.response.data as { code?: unknown }).code === "ACCOUNT_BLOCKED";
}

api.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    if (!axios.isAxiosError(error)) {
      return Promise.reject(error);
    }
    const blocked = error.response?.status === 403 && isAccountBlocked(error);
    if (error.response?.status === 401 || blocked) {
      useAuthStore.getState().clearAuth();
      const path = window.location.pathname;
      if (path !== "/login") {
        window.location.assign(blocked ? "/login?blocked=1" : "/login");
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

export function getApiErrorDetail(error: unknown): {
  message: string;
  code?: string;
  fields?: Record<string, string>;
} {
  if (axios.isAxiosError(error) && error.response?.data && typeof error.response.data === "object") {
    const data = error.response.data as {
      message?: unknown;
      code?: unknown;
      fields?: unknown;
    };
    if (typeof data.message === "string") {
      return {
        message: data.message,
        code: typeof data.code === "string" ? data.code : undefined,
        fields:
          data.fields && typeof data.fields === "object" && !Array.isArray(data.fields)
            ? (data.fields as Record<string, string>)
            : undefined,
      };
    }
  }
  if (error instanceof Error) {
    return { message: error.message };
  }
  return { message: "Something went wrong" };
}
