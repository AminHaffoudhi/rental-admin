import type { ReactElement } from "react";
import { matchPath, useLocation } from "react-router-dom";
import AdminNotificationBell from "@/components/shared/AdminNotificationBell";
import { useAdminAuth } from "@/hooks/useAdminAuth";

const ROUTES: { pattern: string; label: string }[] = [
  { pattern: "/", label: "Dashboard" },
  { pattern: "/users/:id", label: "User detail" },
  { pattern: "/users", label: "Users" },
  { pattern: "/equipment", label: "Equipment" },
  { pattern: "/reviews", label: "Reviews" },
  { pattern: "/bookings/:id", label: "Booking detail" },
  { pattern: "/bookings", label: "Bookings" },
  { pattern: "/deliveries", label: "Deliveries" },
  { pattern: "/payments", label: "Payments" },
  { pattern: "/disputes/:id", label: "Dispute detail" },
  { pattern: "/disputes", label: "Disputes" },
];

function titleForPath(pathname: string): string {
  const hit = ROUTES.find((r) => matchPath({ path: r.pattern, end: true }, pathname));
  return hit?.label ?? "Admin";
}

export function AdminTopbar(): ReactElement {
  const { pathname } = useLocation();
  const { admin } = useAdminAuth();
  const title = titleForPath(pathname);

  return (
    <header className="flex h-14 shrink-0 items-center justify-between border-b border-stone-100 bg-white px-6 shadow-sm">
      <div>
        <p className="text-[10px] font-medium uppercase tracking-wider text-stone-400">Admin</p>
        <h1 className="font-display text-base font-semibold leading-tight text-stone-900">{title}</h1>
      </div>
      <div className="flex items-center gap-2">
        <AdminNotificationBell />
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-500">
          <span className="text-xs font-bold text-white">{admin?.name?.charAt(0) || "A"}</span>
        </div>
      </div>
    </header>
  );
}
