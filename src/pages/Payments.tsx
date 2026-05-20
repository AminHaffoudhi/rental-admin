import type { ReactElement } from "react";
import { useMemo, useState } from "react";
import toast from "react-hot-toast";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { PaymentsTable } from "@/components/tables/PaymentsTable";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { usePayments } from "@/hooks/usePayments";
import type { PaymentStatus } from "@/types/payment";

type TabKey = "all" | PaymentStatus;

export function Payments(): ReactElement {
  const [tab, setTab] = useState<TabKey>("all");

  const filters = useMemo(() => {
    if (tab === "all") return undefined;
    return { status: tab };
  }, [tab]);

  const { payments, isLoading, sendPayout } = usePayments(filters);

  const [payoutId, setPayoutId] = useState<string | null>(null);

  async function doPayout() {
    if (!payoutId) return;
    try {
      await sendPayout(payoutId);
      toast.success("Payout marked sent");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed");
    } finally {
      setPayoutId(null);
    }
  }

  return (
    <div className="space-y-4">
      <Tabs value={tab} onValueChange={(v) => setTab(v as TabKey)}>
        <TabsList className="flex-wrap">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="PENDING">Pending</TabsTrigger>
          <TabsTrigger value="CONFIRMED">Confirmed</TabsTrigger>
          <TabsTrigger value="PAYOUT_PENDING">Payout pending</TabsTrigger>
          <TabsTrigger value="PAYOUT_SENT">Payout sent</TabsTrigger>
        </TabsList>
      </Tabs>

      <PaymentsTable payments={payments} isLoading={isLoading} onSendPayout={(id) => setPayoutId(id)} />

      <ConfirmDialog
        open={payoutId !== null}
        onClose={() => setPayoutId(null)}
        onConfirm={doPayout}
        title="Send payout?"
        description="Marks payout as sent for this payment record."
        confirmLabel="Send payout"
      />
    </div>
  );
}
