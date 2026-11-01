import { format, formatDistanceToNow, isAfter, isBefore, addMinutes, subMinutes } from "date-fns";
import { vi } from "date-fns/locale";

/**
 * Formats ISO date to friendly Vietnamese display string.
 * Example: "19:30, Thứ Bảy 01/11/2026"
 */
export function formatVietnameseDateTime(dateIso: string | Date): string {
  const date = typeof dateIso === "string" ? new Date(dateIso) : dateIso;
  return format(date, "HH:mm, EEEE dd/MM/yyyy", { locale: vi });
}

/**
 * Short date format: "19:30 - 01/11"
 */
export function formatShortDateTime(dateIso: string | Date): string {
  const date = typeof dateIso === "string" ? new Date(dateIso) : dateIso;
  return format(date, "HH:mm - dd/MM", { locale: vi });
}

/**
 * Formats relative time in Vietnamese (e.g. "5 phút trước", "trong 2 giờ")
 */
export function formatRelativeTime(dateIso: string | Date): string {
  const date = typeof dateIso === "string" ? new Date(dateIso) : dateIso;
  return formatDistanceToNow(date, { addSuffix: true, locale: vi });
}

/**
 * Check if the venue poll deadline has passed.
 */
export function isPollClosed(pollClosesAtIso: string): boolean {
  return isAfter(new Date(), new Date(pollClosesAtIso));
}

/**
 * Check if the cancellation deadline has passed.
 */
export function isCancellationDeadlinePassed(deadlineIso: string): boolean {
  return isAfter(new Date(), new Date(deadlineIso));
}

/**
 * Check if the current time is within the valid check-in window.
 * Default: From 30 minutes before event start until 2 hours after event start.
 */
export function isCheckinWindowOpen(
  startsAtIso: string,
  windowMinutesBefore: number = 30,
  windowMinutesAfter: number = 120
): { isOpen: boolean; reason?: string } {
  const now = new Date();
  const startsAt = new Date(startsAtIso);
  const earliestCheckin = subMinutes(startsAt, windowMinutesBefore);
  const latestCheckin = addMinutes(startsAt, windowMinutesAfter);

  if (isBefore(now, earliestCheckin)) {
    return {
      isOpen: false,
      reason: `Check-in chỉ mở từ ${windowMinutesBefore} phút trước giờ hẹn (${format(earliestCheckin, "HH:mm")}).`,
    };
  }

  if (isAfter(now, latestCheckin)) {
    return {
      isOpen: false,
      reason: "Đã quá hạn thời gian check-in của buổi cà phê này.",
    };
  }

  return { isOpen: true };
}
