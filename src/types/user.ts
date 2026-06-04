export type Role = "RENTER" | "OWNER" | "BOTH" | "ADMIN";

export type KycStatus = "PENDING" | "SUBMITTED" | "APPROVED" | "REJECTED";

export interface KycDocumentBrief {
  id: string;
  documentUrl: string;
  documentType: string | null;
  status: string;
  adminNote: string | null;
  reviewedAt: string | null;
  submittedAt: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  image?: string;
  role: Role;
  kycStatus: KycStatus;
  kycDocument?: KycDocumentBrief | null;
  phone?: string;
  canList?: boolean;
  blockedAt?: string | null;
  blockedReason?: string | null;
  createdAt: string;
}
