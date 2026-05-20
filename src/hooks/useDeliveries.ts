import { useCallback, useEffect, useState } from "react";
import * as deliveryService from "@/services/delivery.service";
import type { Delivery } from "@/types/delivery";

export function useDeliveries(filters?: { status?: string }): {
  deliveries: Delivery[];
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
} {
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const refetch = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await deliveryService.getAllDeliveries(filters ?? {});
      setDeliveries(data);
    } catch (e) {
      setError(e instanceof Error ? e : new Error("Failed to load deliveries"));
    } finally {
      setIsLoading(false);
    }
  }, [filters?.status]);

  useEffect(() => {
    void refetch();
  }, [refetch]);

  return { deliveries, isLoading, error, refetch };
}
