import type { KycStatus, Role, User } from "@/types/user";

export function isOwnerRole(role: Role): boolean {
  return role === "OWNER" || role === "BOTH";
}

export function isRenterOnly(role: Role): boolean {
  return role === "RENTER";
}

/** Owners list equipment; pure renters do not. */
export function showEquipmentSection(role: Role): boolean {
  return isOwnerRole(role);
}

/** KYC applies to owners who list equipment, not renters. */
export function showKycSection(role: Role): boolean {
  return isOwnerRole(role);
}

export function showOwnerBookings(role: Role): boolean {
  return isOwnerRole(role);
}

export function showRenterBookings(role: Role): boolean {
  return role === "RENTER" || role === "BOTH";
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
