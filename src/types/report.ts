export type SupportReportType = "CONTACT" | "REPORT";
export type SupportReportStatus = "NEW" | "READ" | "ARCHIVED";

export type SupportReport = {
  id: string;
  type: SupportReportType;
  status: SupportReportStatus;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  subject: string | null;
  message: string;
  adminNote: string | null;
  readAt: string | null;
  readById: string | null;
  archivedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type ReportListResponse = {
  items: SupportReport[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  newCount: number;
};
