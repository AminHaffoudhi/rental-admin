import type { ReactElement } from "react";
import { useMemo, useState } from "react";
import { DisputesTable } from "@/components/tables/DisputesTable";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useDisputes } from "@/hooks/useDisputes";

export function Disputes(): ReactElement {
  const [tab, setTab] = useState<"all" | "open" | "resolved">("all");

  const filters = useMemo(() => {
    if (tab === "open") return { status: "OPEN" };
    return undefined;
  }, [tab]);

  const { disputes: raw, isLoading } = useDisputes(filters);

  const disputes = useMemo(() => {
    if (tab !== "resolved") return raw;
    return raw.filter((d) => d.status !== "OPEN");
  }, [raw, tab]);

  return (
    <div className="space-y-4">
      <Tabs value={tab} onValueChange={(v) => setTab(v as typeof tab)}>
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="open">Open</TabsTrigger>
          <TabsTrigger value="resolved">Resolved</TabsTrigger>
        </TabsList>
      </Tabs>

      <DisputesTable disputes={disputes} isLoading={isLoading} />
    </div>
  );
}
