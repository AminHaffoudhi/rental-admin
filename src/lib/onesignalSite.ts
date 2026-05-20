/** OneSignal dashboard Site URL must match the page origin (or set VITE_ONESIGNAL_SITE_URL). */
export function shouldSkipOneSignalInit(): boolean {
  if (typeof window === "undefined") {
    return false;
  }
  const configured = import.meta.env.VITE_ONESIGNAL_SITE_URL?.trim();
  if (!configured) {
    return false;
  }
  const expected = configured.replace(/\/+$/, "");
  return window.location.origin !== expected;
}

export function oneSignalSkipReason(): string {
  const origin = typeof window !== "undefined" ? window.location.origin : "";
  return `[OneSignal] Skipped on ${origin}. Add this URL in OneSignal → Web → Site URL, or set VITE_ONESIGNAL_SITE_URL=${origin}`;
}

export function isOneSignalDomainMismatch(err: unknown): boolean {
  return err instanceof Error && /can only be used on/i.test(err.message);
}
