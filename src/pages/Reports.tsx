import type { ReactElement } from "react";
import { useMemo, useState } from "react";
import { Inbox } from "lucide-react";
import { ReportsTable } from "@/components/tables/ReportsTable";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useReports } from "@/hooks/useReports";
import type { SupportReportStatus, SupportReportType } from "@/types/report";
import { cn } from "@/lib/utils";

export function Reports(): ReactElement {
  const [statusTab, setStatusTab] = useState<"all" | SupportReportStatus>("all");
  const [typeFilter, setTypeFilter] = useState<"all" | SupportReportType>("all");

  const filters = useMemo(
    () => ({
      status: statusTab === "all" ? undefined : statusTab,
      type: typeFilter === "all" ? undefined : typeFilter,
      limit: 50,
    }),
    [statusTab, typeFilter]
  );

  const { reports, data, isLoading } = useReports(filters);
  const newCount = data?.newCount ?? 0;

  return (
    <div className="space-y-5">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">New</p>
          <p className="mt-1 font-display text-2xl font-semibold text-foreground">{newCount}</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Total</p>
          <p className="mt-1 font-display text-2xl font-semibold text-foreground">
            {data?.total ?? "—"}
          </p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4 shadow-sm sm:col-span-2 lg:col-span-1">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Showing
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            {reports.length} of {data?.total ?? 0} messages
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
        <Tabs value={statusTab} onValueChange={(v) => setStatusTab(v as typeof statusTab)}>
          <TabsList className="flex h-auto flex-wrap gap-1 bg-muted/60 p-1">
            <TabsTrigger value="all" className="text-xs sm:text-sm">
              All
            </TabsTrigger>
            <TabsTrigger value="NEW" className="gap-1.5 text-xs sm:text-sm">
              New
              {newCount > 0 ? (
                <span className="rounded-full bg-brand-500 px-1.5 py-0.5 text-[10px] font-bold text-white">
                  {newCount}
                </span>
              ) : null}
            </TabsTrigger>
            <TabsTrigger value="READ" className="text-xs sm:text-sm">
              Read
            </TabsTrigger>
            <TabsTrigger value="ARCHIVED" className="text-xs sm:text-sm">
              Archived
            </TabsTrigger>
          </TabsList>
        </Tabs>

        <Select
          value={typeFilter}
          onValueChange={(v) => setTypeFilter(v as typeof typeFilter)}
        >
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="All types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All types</SelectItem>
            <SelectItem value="CONTACT">Contact</SelectItem>
            <SelectItem value="REPORT">Issue reports</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {!isLoading && reports.length === 0 ? (
        <div
          className={cn(
            "flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card px-6 py-16 text-center"
          )}
        >
          <Inbox className="mb-3 h-10 w-10 text-muted-foreground/50" aria-hidden />
          <p className="font-display text-lg font-semibold text-foreground">No messages</p>
          <p className="mt-1 max-w-sm text-sm text-muted-foreground">
            Contact and issue reports from the public site will appear here.
          </p>
        </div>
      ) : (
        <ReportsTable reports={reports} isLoading={isLoading} />
      )}
    </div>
  );
}
