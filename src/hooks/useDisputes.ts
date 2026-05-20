import { useCallback, useEffect, useState } from "react";
import * as disputeService from "@/services/dispute.service";
import type { Dispute } from "@/types/dispute";

export function useDisputes(filters?: { status?: string }): {
  disputes: Dispute[];
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
  resolveDispute: (
    id: string,
    data: { resolution: string; outcome: "RESOLVED_OWNER" | "RESOLVED_RENTER" }
  ) => Promise<void>;
} {
  const [disputes, setDisputes] = useState<Dispute[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const refetch = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await disputeService.getAllDisputes(filters);
      setDisputes(data);
    } catch (e) {
      setError(e instanceof Error ? e : new Error("Failed to load disputes"));
    } finally {
      setIsLoading(false);
    }
  }, [filters?.status]);

  useEffect(() => {
    void refetch();
  }, [refetch]);

  const resolveDispute = useCallback(
    async (
      id: string,
      data: { resolution: string; outcome: "RESOLVED_OWNER" | "RESOLVED_RENTER" }
    ) => {
      await disputeService.resolveDispute(id, data);
      await refetch();
    },
    [refetch]
  );

  return { disputes, isLoading, error, refetch, resolveDispute };
}
