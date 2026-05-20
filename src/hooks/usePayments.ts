import { useCallback, useEffect, useState } from "react";
import * as paymentService from "@/services/payment.service";
import type { Payment } from "@/types/payment";

export function usePayments(filters?: { status?: string }): {
  payments: Payment[];
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
  sendPayout: (paymentId: string) => Promise<void>;
} {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const refetch = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await paymentService.getAllPayments(filters);
      setPayments(data);
    } catch (e) {
      setError(e instanceof Error ? e : new Error("Failed to load payments"));
    } finally {
      setIsLoading(false);
    }
  }, [filters?.status]);

  useEffect(() => {
    void refetch();
  }, [refetch]);

  const sendPayout = useCallback(
    async (paymentId: string) => {
      await paymentService.sendPayout(paymentId);
      await refetch();
    },
    [refetch]
  );

  return { payments, isLoading, error, refetch, sendPayout };
}
