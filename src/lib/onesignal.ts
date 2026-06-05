import OneSignal, { type NotificationForegroundWillDisplayEvent } from "react-onesignal";
import {
  isOneSignalDomainMismatch,
  oneSignalSkipReason,
  shouldSkipOneSignalInit,
} from "@/lib/onesignalSite";

let initialized = false;
let initPromise: Promise<void> | null = null;

export async function getSubscriptionId(): Promise<string | null> {
  if (!initialized) {
    return null;
  }
  try {
    const id = OneSignal.User.PushSubscription.id;
    return id ?? null;
  } catch {
    return null;
  }
}

/** Best-effort debug hook; OneSignal web SDK does not expose a reliable in-tab history API. */
export async function getNotificationHistory(): Promise<unknown[]> {
  const appId = import.meta.env.VITE_ONESIGNAL_APP_ID;
  if (!appId || !initialized) {
    return [];
  }
  try {
    const permission = OneSignal.Notifications.permission;
    if (!permission) {
      return [];
    }
    const subId = OneSignal.User.PushSubscription.id;
    console.log("[OneSignal] Subscription ID:", subId);
    return [];
  } catch {
    return [];
  }
}

export async function initOneSignal(): Promise<void> {
  const appId = import.meta.env.VITE_ONESIGNAL_APP_ID;
  if (!appId) {
    console.warn("[OneSignal] VITE_ONESIGNAL_APP_ID not set — skipping");
    return;
  }
  if (initialized) {
    return;
  }
  if (initPromise) {
    return initPromise;
  }

  if (shouldSkipOneSignalInit()) {
    console.warn(oneSignalSkipReason());
    return;
  }

  initPromise = OneSignal.init({
    appId,
    allowLocalhostAsSecureOrigin: true,
    serviceWorkerParam: { scope: "/" },
    serviceWorkerPath: "OneSignalSDKWorker.js",
  })
    .then(async () => {
      initialized = true;
      console.log("[OneSignal] Admin dashboard initialized ✅");
      const subId = await getSubscriptionId();
      console.log("[OneSignal] Subscription ID:", subId || "NOT SUBSCRIBED YET");
    })
    .catch((err) => {
      if (isOneSignalDomainMismatch(err)) {
        console.warn(oneSignalSkipReason(), err);
        return;
      }
      console.error("[OneSignal] Init failed:", err);
    });

  return initPromise;
}

export async function requestPermissionAndSubscribe(): Promise<boolean> {
  await initOneSignal();
  if (!initialized) {
    return false;
  }
  try {
    await OneSignal.Notifications.requestPermission();
    const granted = OneSignal.Notifications.permission;
    const subId = await getSubscriptionId();
    console.log("[OneSignal] Subscription ID:", subId || "NOT SUBSCRIBED YET");
    return granted;
  } catch {
    return false;
  }
}

export async function identifyAdmin(adminId: string): Promise<void> {
  await initOneSignal();
  if (!initialized) {
    return;
  }
  try {
    await OneSignal.login(adminId);
    await OneSignal.User.addTags({ role: "ADMIN", platform: "admin-web" });
    console.log("[OneSignal] Admin identified:", adminId);
  } catch (err) {
    console.warn("[OneSignal] Identify failed:", err);
  }
}

export async function logoutOneSignal(): Promise<void> {
  if (!initialized) {
    return;
  }
  try {
    await OneSignal.logout();
  } catch {
    /* ignore */
  }
}

export function onNotificationReceived(
  callback: (title: string, body: string, data: Record<string, unknown>) => void
): () => void {
  let cleanedUp = false;
  let removeListener: (() => void) | undefined;

  void initOneSignal().then(() => {
    if (cleanedUp || !initialized) {
      return;
    }
    const handler = (event: NotificationForegroundWillDisplayEvent) => {
      const n = event.notification;
      const additional = (n.additionalData as Record<string, unknown> | undefined) ?? {};
      const data: Record<string, unknown> = { ...additional };
      if (n.launchURL) {
        data.url = n.launchURL;
      }
      callback(n.title ?? "", n.body ?? "", data);
      event.preventDefault();
    };
    OneSignal.Notifications.addEventListener("foregroundWillDisplay", handler);
    removeListener = () =>
      OneSignal.Notifications.removeEventListener("foregroundWillDisplay", handler);
  });

  return () => {
    cleanedUp = true;
    removeListener?.();
  };
}

export function getPermissionState(): boolean {
  if (!initialized) {
    return false;
  }
  return OneSignal.Notifications.permission;
}
