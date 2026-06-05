import type { ReactElement } from "react";
import { useMemo } from "react";
import { format } from "date-fns";
import { Link, NavLink } from "react-router-dom";
import type { LucideIcon } from "lucide-react";
import {
  AlertTriangle,
  CalendarCheck,
  Clock,
  CreditCard,
  Package,
  TrendingUp,
  Users,
} from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useBookings } from "@/hooks/useBookings";
import { useStats } from "@/hooks/useStats";
import { useUsers } from "@/hooks/useUsers";
import { formatCurrency } from "@/utils/currency";
import { formatDateRange } from "@/utils/dates";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { StatCard } from "@/components/cards/StatCard";

const REVENUE_MOCK = [
  { day: "Mon", revenue: 120 },
  { day: "Tue", revenue: 85 },
  { day: "Wed", revenue: 210 },
  { day: "Thu", revenue: 165 },
  { day: "Fri", revenue: 290 },
  { day: "Sat", revenue: 340 },
  { day: "Sun", revenue: 180 },
];

const PIE_COLORS = ["#f97316", "#3b82f6", "#22c55e", "#a855f7", "#eab308", "#78716c"];

function StatCardSkeleton(): ReactElement {
  return (
    <div className="card p-5">
      <div className="mb-3 flex justify-between">
        <div className="skeleton h-9 w-9 rounded-xl" />
        <div className="skeleton h-3 w-16 rounded" />
      </div>
      <div className="skeleton mb-2 h-8 w-24 rounded" />
      <div className="skeleton h-3 w-20 rounded" />
    </div>
  );
}

function AlertCard(props: {
  icon: LucideIcon;
  label: string;
  value: number;
  color: "yellow" | "brand" | "red";
  action: string;
  to: string;
}): ReactElement {
  const { icon: Icon, label, value, color, action, to } = props;
  const colors = {
    yellow: {
      bg: "bg-yellow-50",
      border: "border-yellow-100",
      icon: "text-yellow-600",
      badge: "badge-yellow",
      btn: "bg-yellow-500 text-white hover:bg-yellow-600",
    },
    brand: {
      bg: "bg-brand-50",
      border: "border-brand-100",
      icon: "text-brand-600",
      badge: "badge-orange",
      btn: "bg-brand-500 text-white hover:bg-brand-600",
    },
    red: {
      bg: "bg-red-50",
      border: "border-red-100",
      icon: "text-red-600",
      badge: "badge-red",
      btn: "bg-red-500 text-white hover:bg-red-600",
    },
  }[color];

  return (
    <div className={`flex items-center justify-between gap-4 rounded-xl border p-4 ${colors.bg} ${colors.border}`}>
      <div className="flex items-center gap-3">
        <Icon size={18} className={colors.icon} />
        <div>
          <p className={`badge ${colors.badge}`}>{value} pending</p>
          <p className="mt-1 text-xs font-semibold text-stone-700">{label}</p>
        </div>
      </div>
      <NavLink to={to} className={`btn btn-sm flex-shrink-0 rounded-lg px-3 py-2 ${colors.btn}`}>
        {action} →
      </NavLink>
    </div>
  );
}

function RevenueChart(): ReactElement {
  return (
    <ResponsiveContainer width="100%" height={200}>
      <AreaChart data={REVENUE_MOCK} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
        <defs>
          <linearGradient id="brandGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#f97316" stopOpacity={0.2} />
            <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#f5f5f4" />
        <XAxis dataKey="day" tick={{ fontSize: 11, fill: "#a8a29e" }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fontSize: 11, fill: "#a8a29e" }} axisLine={false} tickLine={false} width={40} />
        <Tooltip
          contentStyle={{
            background: "#fff",
            border: "1px solid #e7e5e4",
            borderRadius: "10px",
            fontSize: "12px",
          }}
          formatter={(value) => [`${value ?? 0} TND`, "Revenue"]}
        />
        <Area
          type="monotone"
          dataKey="revenue"
          stroke="#f97316"
          strokeWidth={2}
          fill="url(#brandGrad)"
          dot={false}
          activeDot={{ r: 5, fill: "#f97316" }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

function BookingStatusChart({ bookings }: { bookings: { status: string }[] }): ReactElement {
  const data = useMemo(() => {
    const counts = new Map<string, number>();
    for (const b of bookings) {
      counts.set(b.status, (counts.get(b.status) ?? 0) + 1);
    }
    const rows = [...counts.entries()]
      .map(([name, value]) => ({ name: name.replace(/_/g, " "), value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 6);
    return rows.length ? rows : [{ name: "No data", value: 1 }];
  }, [bookings]);

  return (
    <ResponsiveContainer width="100%" height={200}>
      <PieChart>
        <Pie
          data={data}
          dataKey="value"
          nameKey="name"
          cx="50%"
          cy="50%"
          innerRadius={48}
          outerRadius={72}
          paddingAngle={2}
        >
          {data.map((_, i) => (
            <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
          ))}
        </Pie>
        <Tooltip />
      </PieChart>
    </ResponsiveContainer>
  );
}

export function Dashboard(): ReactElement {
  const { stats, isLoading } = useStats();
  const { bookings } = useBookings();
  const { users: kycQueue } = useUsers({ kycStatus: "SUBMITTED" });

  const recentBookings = useMemo(() => bookings.slice(0, 5), [bookings]);
  const recentKyc = useMemo(() => kycQueue.slice(0, 5), [kycQueue]);

  const v = (n: number | undefined) => (isLoading ? undefined : (n ?? 0).toLocaleString());

  return (
    <div className="animate-fadeIn space-y-6 p-0">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-xl text-stone-900">Platform Overview</h2>
          <p className="mt-0.5 text-xs text-stone-500">{format(new Date(), "EEEE, MMMM d yyyy")}</p>
        </div>
        <div className="flex items-center gap-2 rounded-full border border-green-100 bg-green-50 px-3 py-1.5 text-xs font-semibold text-green-700">
          <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-green-500" />
          All systems operational
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {isLoading ? (
          <>
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
          </>
        ) : (
          <>
            <StatCard
              icon={Users}
              label="Total Users"
              value={v(stats?.totalUsers) ?? "—"}
              delta="+12 this week"
              color="blue"
            />
            <StatCard
              icon={Package}
              label="Total Listings"
              value={v(stats?.totalEquipment) ?? "—"}
              delta="+5 today"
              color="purple"
            />
            <StatCard
              icon={CalendarCheck}
              label="Total Bookings"
              value={v(stats?.totalBookings) ?? "—"}
              delta="+3 today"
              color="brand"
            />
            <StatCard
              icon={TrendingUp}
              label="Platform Revenue"
              value={formatCurrency(stats?.totalRevenue ?? 0)}
              delta="All time"
              color="green"
            />
          </>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <AlertCard
          icon={Clock}
          label="Pending KYC"
          value={stats?.pendingKyc ?? 0}
          color="yellow"
          action="Review now"
          to="/users?tab=pending"
        />
        <AlertCard
          icon={CreditCard}
          label="Awaiting Payouts"
          value={stats?.pendingPayouts ?? 0}
          color="brand"
          action="Process payouts"
          to="/payments"
        />
        <AlertCard
          icon={AlertTriangle}
          label="Open Disputes"
          value={stats?.openDisputes ?? 0}
          color="red"
          action="Resolve disputes"
          to="/disputes"
        />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="card p-5 lg:col-span-2">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
            <div>
              <h3 className="font-display text-base text-stone-900">Revenue</h3>
              <p className="text-xs text-stone-400">Sample trend (connect API for live data)</p>
            </div>
            <select className="input w-auto py-1.5 text-xs">
              <option>Last 7 days</option>
              <option>Last 30 days</option>
              <option>Last 3 months</option>
            </select>
          </div>
          <RevenueChart />
        </div>

        <div className="card p-5">
          <h3 className="font-display mb-1 text-base text-stone-900">Booking status</h3>
          <p className="mb-4 text-xs text-stone-400">From loaded bookings</p>
          <BookingStatusChart bookings={bookings} />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="card overflow-hidden">
          <div className="border-b border-stone-100 px-4 py-3">
            <h3 className="font-display text-sm font-semibold text-stone-900">Recent bookings</h3>
          </div>
          <Table>
            <TableHeader>
              <TableRow className="bg-stone-50 hover:bg-stone-50">
                <TableHead className="text-[10px] font-semibold uppercase tracking-wider text-stone-500">
                  Booking
                </TableHead>
                <TableHead className="text-[10px] font-semibold uppercase tracking-wider text-stone-500">
                  Equipment
                </TableHead>
                <TableHead className="text-[10px] font-semibold uppercase tracking-wider text-stone-500">
                  Dates
                </TableHead>
                <TableHead className="text-[10px] font-semibold uppercase tracking-wider text-stone-500">
                  Status
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentBookings.map((b) => (
                <TableRow key={b.id} className="bg-white hover:bg-stone-50/80">
                  <TableCell className="font-mono text-xs">
                    <Link to={`/bookings/${b.id}`} className="text-brand-600 hover:underline">
                      {b.id.slice(0, 8)}…
                    </Link>
                  </TableCell>
                  <TableCell className="max-w-[120px] truncate text-xs">{b.equipment.title}</TableCell>
                  <TableCell className="whitespace-nowrap text-xs tabular-nums text-stone-600">
                    {formatDateRange(b.startDate, b.endDate)}
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={b.status} />
                  </TableCell>
                </TableRow>
              ))}
              {recentBookings.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="py-8 text-center text-xs text-stone-400">
                    No bookings
                  </TableCell>
                </TableRow>
              ) : null}
            </TableBody>
          </Table>
        </div>

        <div className="card overflow-hidden">
          <div className="border-b border-stone-100 px-4 py-3">
            <h3 className="font-display text-sm font-semibold text-stone-900">Pending KYC</h3>
          </div>
          <Table>
            <TableHeader>
              <TableRow className="bg-stone-50 hover:bg-stone-50">
                <TableHead className="text-[10px] font-semibold uppercase tracking-wider text-stone-500">
                  User
                </TableHead>
                <TableHead className="text-[10px] font-semibold uppercase tracking-wider text-stone-500">
                  Email
                </TableHead>
                <TableHead className="text-[10px] font-semibold uppercase tracking-wider text-stone-500">
                  Status
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentKyc.map((u) => (
                <TableRow key={u.id} className="bg-white hover:bg-stone-50/80">
                  <TableCell className="text-xs font-medium text-stone-800">
                    <Link to={`/users/${u.id}`} className="text-brand-600 hover:underline">
                      {u.name}
                    </Link>
                  </TableCell>
                  <TableCell className="max-w-[140px] truncate text-xs text-stone-600">{u.email}</TableCell>
                  <TableCell>
                    <StatusBadge status={u.kycStatus} />
                  </TableCell>
                </TableRow>
              ))}
              {recentKyc.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} className="py-8 text-center text-xs text-stone-400">
                    No pending KYC
                  </TableCell>
                </TableRow>
              ) : null}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
