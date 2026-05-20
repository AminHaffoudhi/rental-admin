import { useCallback, useEffect, useState } from "react";
import * as statsService from "@/services/stats.service";
import type { Stats } from "@/types/stats";

export function useStats(): {
  stats: Stats | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
} {
  const [stats, setStats] = useState<Stats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const refetch = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await statsService.getStats();
      setStats(data);
    } catch (e) {
      setError(e instanceof Error ? e : new Error("Failed to load stats"));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void refetch();
  }, [refetch]);

  return { stats, isLoading, error, refetch };
}
