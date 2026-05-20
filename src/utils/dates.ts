import { differenceInCalendarDays, format, parseISO } from "date-fns";

export function formatDate(date: string | Date): string {
  const d = typeof date === "string" ? parseISO(date) : date;
  return format(d, "yyyy-MM-dd");
}

export function formatDateRange(start: string | Date, end: string | Date): string {
  return `${formatDate(start)} → ${formatDate(end)}`;
}

export function getDaysBetween(start: string | Date, end: string | Date): number {
  const s = typeof start === "string" ? parseISO(start) : start;
  const e = typeof end === "string" ? parseISO(end) : end;
  return Math.max(1, differenceInCalendarDays(e, s) + 1);
}
