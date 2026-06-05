import { useState, useEffect, useRef, useCallback, type ReactElement } from "react";
import {
  AlertCircle,
  BadgeCheck,
  Bell,
  BellRing,
  CalendarClock,
  CheckCheck,
  CircleDollarSign,
  ClipboardList,
  ClipboardPen,
  ExternalLink,
  MessageSquareText,
  MessageSquareWarning,
  Scale,
  ShieldX,
  UserPlus,
  Wallet,
  X,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { formatDistanceToNow } from "date-fns";
import { Link, useNavigate } from "react-router-dom";
import {
  initOneSignal,
  onNotificationReceived,
  requestPermissionAndSubscribe,
  getPermissionState,
  getNotificationHistory,
} from "@/lib/onesignal";
import { api } from "@/services/api";
import type { ApiResponse } from "@/types/api";
import { useAuthStore } from "@/store/authStore";
import { cn } from "@/utils/cn";
import {
  applyNotificationState,
  dismissAllNotifications,
  dismissNotification,
  markAllNotificationsRead,
  markNotificationRead,
} from "@/lib/notificationState";
import { cleanNotificationTitle } from "@/lib/notificationDisplay";
import {
  equipmentIdFromNotification,
  notificationTargetPath,
} from "@/lib/notificationNavigation";

interface AdminNotification {
  id: string;
  title: string;
  body: string;
  type: string;
  url?: string;
  timestamp: Date;
  read: boolean;
}

interface ApiNotificationRow {
  id: string;
  type: string;
  title: string;
  body: string;
  url: string;
  timestamp: string;
  read: boolean;
}

type NotificationVisual = {
  Icon: LucideIcon;
  bg: string;
  iconClass: string;
};

const TYPE_CONFIG: Record<string, NotificationVisual> = {
  new_user: { Icon: UserPlus, bg: "bg-blue-50", iconClass: "text-blue-600" },
  kyc_submitted: { Icon: ClipboardList, bg: "bg-amber-50", iconClass: "text-amber-600" },
  kyc_approved: { Icon: BadgeCheck, bg: "bg-emerald-50", iconClass: "text-emerald-600" },
  kyc_rejected: { Icon: ShieldX, bg: "bg-red-50", iconClass: "text-red-600" },
  booking_request: { Icon: CalendarClock, bg: "bg-brand-50", iconClass: "text-brand-600" },
  dispute_admin: { Icon: Scale, bg: "bg-orange-50", iconClass: "text-orange-600" },
  dispute_opened: { Icon: AlertCircle, bg: "bg-red-50", iconClass: "text-red-600" },
  payment_received: { Icon: Wallet, bg: "bg-teal-50", iconClass: "text-teal-600" },
  payout_sent: { Icon: CircleDollarSign, bg: "bg-emerald-50", iconClass: "text-emerald-600" },
  equipment_pending: { Icon: ClipboardPen, bg: "bg-amber-50", iconClass: "text-amber-700" },
  review_pending: { Icon: MessageSquareText, bg: "bg-yellow-50", iconClass: "text-yellow-700" },
  support_report: { Icon: MessageSquareWarning, bg: "bg-violet-50", iconClass: "text-violet-600" },
  general: { Icon: Bell, bg: "bg-stone-100", iconClass: "text-stone-500" },
};

function load(): AdminNotification[] {
  try {
    const raw = sessionStorage.getItem("admin_notifications");
    if (!raw) {
      return [];
    }
    return applyNotificationState(
      (JSON.parse(raw) as AdminNotification[]).map((n) => ({
        ...n,
        title: cleanNotificationTitle(n.title),
        timestamp: new Date(n.timestamp),
      }))
    );
  } catch {
    return [];
  }
}

function save(notifications: AdminNotification[]): void {
  try {
    sessionStorage.setItem("admin_notifications", JSON.stringify(notifications));
  } catch {
    /* ignore */
  }
}

export default function AdminNotificationBell(): ReactElement {
  const navigate = useNavigate();
  const appId = import.meta.env.VITE_ONESIGNAL_APP_ID;
  const token = useAuthStore((s) => s.token);
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<AdminNotification[]>(load);
  const [permission, setPermission] = useState(false);
  const [requesting, setRequesting] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const unread = items.filter((n) => !n.read).length;

  useEffect(() => {
    if (!appId) {
      return;
    }
    void initOneSignal().then(() => {
      setPermission(getPermissionState());
    });
  }, [appId]);

  const add = useCallback((n: AdminNotification) => {
    setItems((prev) => {
      const updated = applyNotificationState([n, ...prev].slice(0, 50));
      save(updated);
      return updated;
    });
  }, []);

  useEffect(() => {
    if (!appId) {
      return;
    }
    const unsub = onNotificationReceived((title, body, data) => {
      const type = (data.type as string) || "general";
      const equipmentId =
        typeof data.equipmentId === "string" ? data.equipmentId : null;
      const reportId = typeof data.reportId === "string" ? data.reportId : null;
      const rawUrl = typeof data.url === "string" ? data.url : undefined;
      const url = rawUrl ? notificationTargetPath(rawUrl, equipmentId) : undefined;
      add({
        id: reportId
          ? `report-${reportId}`
          : equipmentId
            ? `equipment-pending-${equipmentId}`
            : crypto.randomUUID(),
        title: cleanNotificationTitle(title),
        body,
        type,
        url,
        timestamp: new Date(),
        read: false,
      });
    });
    return unsub;
  }, [add, appId]);

  const fetchFromAPI = useCallback(async () => {
    const t = useAuthStore.getState().token;
    if (!t) {
      return;
    }
    try {
      const { data } = await api.get<ApiResponse<ApiNotificationRow[]>>("/notifications");
      if (!data.success) {
        return;
      }
      const incoming: AdminNotification[] = data.data.map((n) => ({
        id: n.id,
        type: n.type,
        title: cleanNotificationTitle(n.title),
        body: n.body,
        url: n.url,
        timestamp: new Date(n.timestamp),
        read: n.read,
      }));

      setItems((prev) => {
        const byId = new Map(prev.map((p) => [p.id, p]));
        for (const n of incoming) {
          const existing = byId.get(n.id);
          byId.set(n.id, existing ? { ...n, read: existing.read } : n);
        }
        const merged = applyNotificationState(
          [...byId.values()]
            .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
            .slice(0, 50)
        );
        save(merged);
        return merged;
      });
    } catch {
      /* polling best-effort */
    }
  }, []);

  useEffect(() => {
    if (!token) {
      return;
    }
    const tick = () => {
      void fetchFromAPI();
      void getNotificationHistory();
    };
    tick();
    const interval = setInterval(tick, 30_000);
    return () => clearInterval(interval);
  }, [fetchFromAPI, token]);

  useEffect(() => {
    if (!token) {
      return;
    }
    function onVisible() {
      if (document.visibilityState === "visible") {
        void fetchFromAPI();
        void getNotificationHistory();
      }
    }
    document.addEventListener("visibilitychange", onVisible);
    return () => document.removeEventListener("visibilitychange", onVisible);
  }, [fetchFromAPI, token]);

  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  function markRead(id: string): void {
    markNotificationRead(id);
    setItems((prev) => {
      const u = prev.map((n) => (n.id === id ? { ...n, read: true } : n));
      save(u);
      return u;
    });
  }

  function markAllRead(): void {
    setItems((prev) => {
      markAllNotificationsRead(prev.map((n) => n.id));
      const u = prev.map((n) => ({ ...n, read: true }));
      save(u);
      return u;
    });
  }

  function dismiss(id: string): void {
    dismissNotification(id);
    setItems((prev) => {
      const u = prev.filter((n) => n.id !== id);
      save(u);
      return u;
    });
  }

  function clearAll(): void {
    setItems((prev) => {
      dismissAllNotifications(prev.map((n) => n.id));
      save([]);
      return [];
    });
  }

  function openNotification(n: AdminNotification): void {
    if (!n.url) {
      return;
    }
    const equipmentId = equipmentIdFromNotification(n);
    navigate(notificationTargetPath(n.url, equipmentId));
  }

  async function enableNotifications(): Promise<void> {
    setRequesting(true);
    const granted = await requestPermissionAndSubscribe();
    setPermission(granted);
    setRequesting(false);
  }

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={cn(
          "relative flex h-8 w-8 items-center justify-center rounded-full transition-all",
          open ? "bg-brand-500/10 text-brand-500" : "text-stone-400 hover:bg-stone-100 hover:text-stone-600"
        )}
        aria-label="Notifications"
      >
        <AnimatePresence mode="wait">
          {unread > 0 ? (
            <motion.span key="ring" initial={{ scale: 0.8 }} animate={{ scale: 1 }} exit={{ scale: 0.8 }}>
              <BellRing size={16} />
            </motion.span>
          ) : (
            <motion.span key="bell" initial={{ scale: 0.8 }} animate={{ scale: 1 }} exit={{ scale: 0.8 }}>
              <Bell size={16} />
            </motion.span>
          )}
        </AnimatePresence>
        <AnimatePresence>
          {unread > 0 && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              className="absolute -right-0.5 -top-0.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-brand-500 px-0.5 text-[9px] font-bold text-white shadow-sm"
            >
              {unread > 9 ? "9+" : unread}
            </motion.span>
          )}
        </AnimatePresence>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -6 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -6 }}
            transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }}
            className="absolute right-0 top-10 z-50 w-[360px] overflow-hidden rounded-2xl border border-stone-100 bg-white shadow-xl"
          >
            <div className="flex items-center justify-between border-b border-stone-100 bg-stone-50 px-4 py-3">
              <div className="flex items-center gap-2">
                <Bell size={13} className="text-stone-400" />
                <span className="text-sm font-semibold text-stone-800">Notifications</span>
                {unread > 0 && <span className="badge badge-orange text-[10px]">{unread} new</span>}
              </div>
              {unread > 0 && (
                <button
                  type="button"
                  onClick={markAllRead}
                  className="flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] font-semibold text-brand-500 transition-all hover:bg-brand-50 hover:text-brand-600"
                >
                  <CheckCheck size={11} /> Read all
                </button>
              )}
            </div>

            {appId && !permission && (
              <div className="m-3 rounded-xl border border-brand-100 bg-brand-50 p-3">
                <p className="mb-0.5 text-xs font-semibold text-brand-900">Enable push notifications</p>
                <p className="mb-2 text-[11px] text-brand-700">
                  Get instant alerts for KYC submissions, disputes, and new users
                </p>
                <button
                  type="button"
                  onClick={() => void enableNotifications()}
                  disabled={requesting}
                  className="btn btn-primary btn-sm w-full"
                >
                  {requesting ? "Enabling..." : "Enable Admin Notifications →"}
                </button>
              </div>
            )}

            <div className="max-h-[400px] overflow-y-auto overscroll-contain">
              {items.length === 0 ? (
                <div className="px-6 py-12 text-center">
                  <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-stone-100">
                    <Bell size={20} className="text-stone-300" />
                  </div>
                  <p className="text-sm font-semibold text-stone-700">No notifications</p>
                  <p className="mt-1 text-xs text-stone-400">
                    New reports, users, KYC reviews, and disputes will appear here
                  </p>
                </div>
              ) : (
                <AnimatePresence initial={false}>
                  {items.map((n) => {
                    const cfg = TYPE_CONFIG[n.type] ?? TYPE_CONFIG.general;
                    const { Icon } = cfg;
                    return (
                      <motion.div
                        key={n.id}
                        layout
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.18 }}
                        role="button"
                        tabIndex={0}
                        onClick={() => {
                          markRead(n.id);
                          if (n.url) {
                            setOpen(false);
                            openNotification(n);
                          }
                        }}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            markRead(n.id);
                            if (n.url) {
                              setOpen(false);
                              openNotification(n);
                            }
                          }
                        }}
                        className={cn(
                          "group relative flex cursor-pointer gap-3 border-b border-stone-50 px-4 py-3 transition-colors last:border-0",
                          n.read ? "hover:bg-stone-50" : "bg-brand-50/20 hover:bg-brand-50/40"
                        )}
                      >
                        <div
                          className={cn(
                            "mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl",
                            cfg.bg
                          )}
                        >
                          <Icon size={15} strokeWidth={2} className={cfg.iconClass} aria-hidden />
                        </div>

                        <div className="min-w-0 flex-1 pr-5">
                          <p
                            className={cn(
                              "text-[13px] leading-snug",
                              n.read ? "text-stone-600" : "font-semibold text-stone-900"
                            )}
                          >
                            {cleanNotificationTitle(n.title)}
                          </p>
                          <p className="mt-0.5 line-clamp-2 text-[11px] leading-relaxed text-stone-500">{n.body}</p>
                          <div className="mt-1.5 flex items-center gap-3">
                            <span className="text-[10px] text-stone-400">
                              {formatDistanceToNow(n.timestamp, { addSuffix: true })}
                            </span>
                            {n.url ? (
                              <Link
                                to={
                                  n.url
                                    ? notificationTargetPath(
                                        n.url,
                                        equipmentIdFromNotification(n)
                                      )
                                    : "#"
                                }
                                onClick={(e) => {
                                  e.stopPropagation();
                                  markRead(n.id);
                                  setOpen(false);
                                }}
                                className="flex items-center gap-0.5 text-[10px] font-semibold text-brand-500 hover:underline"
                              >
                                View <ExternalLink size={9} />
                              </Link>
                            ) : null}
                          </div>
                        </div>

                        {!n.read && <div className="absolute right-7 top-4 h-1.5 w-1.5 rounded-full bg-brand-500" />}

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            dismiss(n.id);
                          }}
                          className="absolute right-2 top-2 flex h-5 w-5 items-center justify-center rounded-full bg-stone-100 opacity-0 transition-opacity hover:bg-stone-200 group-hover:opacity-100"
                          aria-label="Dismiss"
                        >
                          <X size={9} className="text-stone-500" />
                        </button>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              )}
            </div>

            {items.length > 0 && (
              <div className="flex items-center justify-between border-t border-stone-100 bg-stone-50 px-4 py-2.5">
                <span className="text-[11px] text-stone-400">
                  {items.length} notification{items.length !== 1 ? "s" : ""}
                </span>
                <button
                  type="button"
                  onClick={clearAll}
                  className="text-[11px] font-medium text-stone-400 transition-colors hover:text-red-500"
                >
                  Clear all
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
