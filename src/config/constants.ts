function normalizeApiBaseUrl(raw: string): string {
  const trimmed = raw.trim().replace(/\/+$/, "");
  return trimmed.endsWith("/api") ? trimmed : `${trimmed}/api`;
}

export const ADMIN_API_URL = normalizeApiBaseUrl(import.meta.env.VITE_ADMIN_API_URL as string);
