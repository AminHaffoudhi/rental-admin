import type { ReactElement } from "react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

const COLORS = {
  blue: { bg: "bg-blue-50", icon: "text-blue-500", border: "border-blue-100" },
  purple: { bg: "bg-purple-50", icon: "text-purple-500", border: "border-purple-100" },
  brand: { bg: "bg-brand-50", icon: "text-brand-500", border: "border-brand-100" },
  green: { bg: "bg-green-50", icon: "text-green-500", border: "border-green-100" },
} as const;

export function StatCard(props: {
  icon: LucideIcon;
  label: string;
  value: string | number;
  /** Small caption top-right (e.g. "+12 this week") */
  delta?: string;
  color?: keyof typeof COLORS;
}): ReactElement {
  const Icon = props.icon;
  const color = props.color ?? "brand";
  const c = COLORS[color];
  return (
    <div className="card p-5 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
      <div className="mb-3 flex items-start justify-between">
        <div className={cn("flex h-9 w-9 items-center justify-center rounded-xl border", c.bg, c.border)}>
          <Icon size={17} className={c.icon} />
        </div>
        {props.delta ? (
          <span className="text-[10px] font-medium text-stone-400">{props.delta}</span>
        ) : null}
      </div>
      <p className="font-display mb-0.5 text-2xl font-semibold tabular-nums text-stone-900">{props.value}</p>
      <p className="text-xs text-stone-500">{props.label}</p>
    </div>
  );
}
