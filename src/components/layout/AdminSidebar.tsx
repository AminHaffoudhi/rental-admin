import type { ReactElement } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import {
  AlertTriangle,
  CalendarCheck,
  CreditCard,
  Inbox,
  ChevronRight,
  LayoutDashboard,
  Layers,
  LogOut,
  Package,
  Settings,
  Star,
  Truck,
  Users,
} from "lucide-react";
import { PlatformLogo } from "@/components/brand/PlatformLogo";
import { cn } from "@/lib/utils";
import { useAdminAuth } from "@/hooks/useAdminAuth";

const NAV: {
  section: string;
  links: { to: string; label: string; icon: typeof LayoutDashboard; end?: boolean }[];
}[] = [
  {
    section: "MAIN",
    links: [
      { to: "/", label: "Dashboard", icon: LayoutDashboard, end: true },
      { to: "/users", label: "Users", icon: Users },
      { to: "/categories", label: "Categories", icon: Layers },
      { to: "/equipment", label: "Equipment", icon: Package },
      { to: "/reviews", label: "Reviews", icon: Star },
      { to: "/bookings", label: "Bookings", icon: CalendarCheck },
    ],
  },
  {
    section: "OPERATIONS",
    links: [
      { to: "/deliveries", label: "Deliveries", icon: Truck },
      { to: "/payments", label: "Payments", icon: CreditCard },
      { to: "/disputes", label: "Disputes", icon: AlertTriangle },
      { to: "/reports", label: "Reports", icon: Inbox },
    ],
  },
];

export function AdminSidebar(props: {
  mobileOpen?: boolean;
  onCloseMobile?: () => void;
}): ReactElement {
  const { admin, logout } = useAdminAuth();
  const navigate = useNavigate();

  return (
    <aside
      className={cn(
        "fixed inset-y-0 left-0 z-50 flex h-full w-56 shrink-0 flex-col bg-stone-900 transition-transform duration-200 lg:static lg:z-auto lg:translate-x-0",
        props.mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      )}
    >
      <div className="border-b border-stone-800 px-5 py-4">
        <div className="flex items-center gap-2.5">
          <PlatformLogo size="sm" linkTo="/" className="brightness-0 invert" />
          <p className="text-[10px] font-medium uppercase tracking-wider text-stone-500">Admin Panel</p>
        </div>
      </div>

      <nav className="flex-1 space-y-5 overflow-y-auto px-3 py-4">
        {NAV.map((section) => (
          <div key={section.section}>
            <p className="mb-1.5 px-2 text-[10px] font-bold uppercase tracking-widest text-stone-600">
              {section.section}
            </p>
            <ul className="space-y-0.5">
              {section.links.map((link) => (
                <li key={link.to}>
                  <NavLink
                    to={link.to}
                    end={link.end}
                    onClick={props.onCloseMobile}
                    className={({ isActive }) =>
                      cn(
                        "group flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-[13px] font-medium transition-all",
                        isActive
                          ? "border-l-2 border-brand-500 bg-brand-500/15 pl-[9px] text-brand-400"
                          : "border-l-2 border-transparent text-stone-400 hover:bg-stone-800/80 hover:text-stone-100"
                      )
                    }
                  >
                    {({ isActive }) => (
                      <>
                        <link.icon
                          size={15}
                          className={cn(
                            isActive ? "text-brand-400" : "text-stone-500 group-hover:text-stone-300"
                          )}
                        />
                        <span className="flex-1">{link.label}</span>
                        {isActive ? <ChevronRight size={12} className="text-brand-500/50" /> : null}
                      </>
                    )}
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>

      <div className="border-t border-stone-800 p-3">
        <Link
          to="/settings"
          onClick={props.onCloseMobile}
          className="mb-1 flex items-center gap-2.5 rounded-lg px-2 py-2 transition-colors hover:bg-stone-800/80"
        >
          <div className="flex h-7 w-7 shrink-0 items-center justify-center overflow-hidden rounded-full bg-brand-500">
            {admin?.image ? (
              <img src={admin.image} alt="" className="h-full w-full object-cover" />
            ) : (
              <span className="text-xs font-bold text-white">{admin?.name?.charAt(0) || "A"}</span>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-semibold text-stone-200">{admin?.name}</p>
            <p className="truncate text-[10px] text-stone-500">{admin?.email}</p>
          </div>
          <Settings size={14} className="shrink-0 text-stone-500" />
        </Link>
        <button
          type="button"
          onClick={() => {
            logout();
            navigate("/login");
          }}
          className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-xs text-stone-500 transition-all hover:bg-red-500/10 hover:text-red-400"
        >
          <LogOut size={13} />
          Sign out
        </button>
      </div>
    </aside>
  );
}
