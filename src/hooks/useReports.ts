import { useCallback, useEffect, useState } from "react";
import * as reportService from "@/services/report.service";
import type { ReportFilters } from "@/services/report.service";
import type { ReportListResponse, SupportReport, SupportReportStatus } from "@/types/report";

export function useReports(filters?: ReportFilters): {
  data: ReportListResponse | null;
  reports: SupportReport[];
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
  updateStatus: (id: string, status: SupportReportStatus) => Promise<void>;
} {
  const [data, setData] = useState<ReportListResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const refetch = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await reportService.listReports(filters);
      setData(result);
    } catch (e) {
      setError(e instanceof Error ? e : new Error("Failed to load reports"));
    } finally {
      setIsLoading(false);
    }
  }, [
    filters?.status,
    filters?.type,
    filters?.search,
    filters?.page,
    filters?.limit,
  ]);

  useEffect(() => {
    void refetch();
  }, [refetch]);

  const updateStatus = useCallback(
    async (id: string, status: SupportReportStatus) => {
      await reportService.updateReportStatus(id, status);
      await refetch();
    },
    [refetch]
  );

  return {
    data,
    reports: data?.items ?? [],
    isLoading,
    error,
    refetch,
    updateStatus,
  };
}
