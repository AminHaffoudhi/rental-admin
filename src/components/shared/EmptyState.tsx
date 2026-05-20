import type { ReactElement } from "react";
import type { LucideIcon } from "lucide-react";

export function EmptyState(props: {
  icon: LucideIcon;
  title: string;
  description?: string;
}): ReactElement {
  const Icon = props.icon;
  return (
    <div className="flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed py-16 text-center">
      <Icon className="h-10 w-10 text-muted-foreground" />
      <p className="text-sm font-medium">{props.title}</p>
      {props.description ? (
        <p className="max-w-sm text-xs text-muted-foreground">{props.description}</p>
      ) : null}
    </div>
  );
}
