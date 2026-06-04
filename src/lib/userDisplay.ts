import type { KycStatus, Role, User } from "@/types/user";

export function isOwnerRole(role: Role): boolean {
  return role === "OWNER" || role === "BOTH";
}

export function displayKycStatus(user: Pick<User, "role" | "kycStatus">): string {
  if (user.role === "RENTER") {
    return "NOT_REQUIRED";
  }
  return user.kycStatus;
}

export function canReviewKyc(user: Pick<User, "role" | "kycStatus">): boolean {
  return isOwnerRole(user.role) && user.kycStatus === "SUBMITTED";
}
