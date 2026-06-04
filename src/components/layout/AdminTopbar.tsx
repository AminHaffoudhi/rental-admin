import type { ReactElement } from "react";
import { Menu } from "lucide-react";
import { Link, matchPath, useLocation } from "react-router-dom";
import AdminNotificationBell from "@/components/shared/AdminNotificationBell";
import { ThemeToggle } from "@/components/shared/ThemeToggle";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { Button } from "@/components/ui/button";

const ROUTES: { pattern: string; label: string }[] = [
  { pattern: "/", label: "Dashboard" },
  { pattern: "/users/:id", label: "User detail" },
  { pattern: "/users", label: "Users" },
  { pattern: "/categories", label: "Categories" },
  { pattern: "/equipment", label: "Equipment" },
  { pattern: "/reviews", label: "Reviews" },
  { pattern: "/bookings/:id", label: "Booking detail" },
  { pattern: "/bookings", label: "Bookings" },
  { pattern: "/deliveries", label: "Deliveries" },
  { pattern: "/payments", label: "Payments" },
  { pattern: "/disputes/:id", label: "Dispute detail" },
  { pattern: "/disputes", label: "Disputes" },
  { pattern: "/reports/:id", label: "Report detail" },
  { pattern: "/reports", label: "Reports" },
  { pattern: "/settings", label: "Account settings" },
];

function titleForPath(pathname: string): string {
  const hit = ROUTES.find((r) => matchPath({ path: r.pattern, end: true }, pathname));
  return hit?.label ?? "Admin";
}

export function AdminTopbar(props: { onOpenMenu?: () => void }): ReactElement {
  const { pathname } = useLocation();
  const { admin } = useAdminAuth();
  const title = titleForPath(pathname);

  return (
    <header className="flex h-14 shrink-0 items-center justify-between border-b border-stone-200 bg-white px-4 shadow-sm dark:border-stone-800 dark:bg-stone-900 sm:px-6">
      <div className="flex min-w-0 items-center gap-3">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="shrink-0 lg:hidden"
          aria-label="Open menu"
          onClick={props.onOpenMenu}
        >
          <Menu className="h-5 w-5" />
        </Button>
        <div className="min-w-0">
          <p className="text-[10px] font-medium uppercase tracking-wider text-stone-400 dark:text-stone-500">
            Admin
          </p>
          <h1 className="truncate font-display text-base font-semibold leading-tight text-stone-900 dark:text-stone-100">
            {title}
          </h1>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <ThemeToggle />
        <AdminNotificationBell />
        <Link
          to="/settings"
          className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full bg-brand-500 ring-2 ring-transparent transition hover:ring-brand-300 dark:hover:ring-brand-600"
          aria-label="Profile settings"
        >
          {admin?.image ? (
            <img src={admin.image} alt="" className="h-full w-full object-cover" />
          ) : (
            <span className="text-xs font-bold text-white">{admin?.name?.charAt(0) || "A"}</span>
          )}
        </Link>
      </div>
    </header>
  );
}
