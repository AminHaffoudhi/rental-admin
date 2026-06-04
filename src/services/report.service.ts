import type { ReportListResponse, SupportReport, SupportReportStatus, SupportReportType } from "@/types/report";
import { api, unwrap } from "@/services/api";

export type ReportFilters = {
  status?: SupportReportStatus;
  type?: SupportReportType;
  search?: string;
  page?: number;
  limit?: number;
};

export async function listReports(filters?: ReportFilters): Promise<ReportListResponse> {
  const res = await api.get("/reports", { params: filters });
  return unwrap(res);
}

export async function getReportById(id: string): Promise<SupportReport> {
  const res = await api.get(`/reports/${id}`);
  return unwrap(res);
}

export async function updateReportStatus(
  id: string,
  status: SupportReportStatus
): Promise<SupportReport> {
  const res = await api.patch(`/reports/${id}/status`, { status });
  return unwrap(res);
}

export async function updateReportNote(
  id: string,
  adminNote: string | null
): Promise<SupportReport> {
  const res = await api.patch(`/reports/${id}/note`, { adminNote });
  return unwrap(res);
}
