/**
 * Aksaventra CBT Date & Time Utilities
 * Pure domain functions for timer formatting, Unix conversions, and localized dates.
 */

/**
 * Formats remaining seconds into a padded clock string.
 * If >= 3600s: returns "HH:MM:SS" (e.g. "01:15:30")
 * If < 3600s: returns "MM:SS" (e.g. "45:10")
 */
export function formatRemainingTime(seconds: number): string {
  if (typeof seconds !== "number" || Number.isNaN(seconds) || seconds <= 0) {
    return "00:00";
  }

  const totalSec = Math.floor(seconds);
  const hours = Math.floor(totalSec / 3600);
  const minutes = Math.floor((totalSec % 3600) / 60);
  const secs = totalSec % 60;

  const pad = (num: number): string => num.toString().padStart(2, "0");

  if (hours > 0) {
    return `${pad(hours)}:${pad(minutes)}:${pad(secs)}`;
  }

  return `${pad(minutes)}:${pad(secs)}`;
}

/**
 * Converts a Date, ISO string, or timestamp (in seconds or ms) to Unix timestamp in seconds.
 */
export function toUnixSeconds(date?: Date | number | string): number {
  if (date === undefined || date === null) {
    return Math.floor(Date.now() / 1000);
  }

  if (typeof date === "number") {
    // If timestamp is already in seconds (e.g. < 100,000,000,000)
    return date > 100_000_000_000 ? Math.floor(date / 1000) : Math.floor(date);
  }

  if (typeof date === "string") {
    const parsed = new Date(date);
    return Number.isNaN(parsed.getTime())
      ? Math.floor(Date.now() / 1000)
      : Math.floor(parsed.getTime() / 1000);
  }

  if (date instanceof Date) {
    return Math.floor(date.getTime() / 1000);
  }

  return Math.floor(Date.now() / 1000);
}

/**
 * Converts a Unix timestamp in seconds to a JavaScript Date object.
 */
export function fromUnixSeconds(seconds: number): Date {
  return new Date(seconds * 1000);
}

/**
 * Formats a Date or timestamp to localized readable string (e.g. "2026-11-05 19:30:00").
 */
export function formatDateTime(
  date: Date | number | string,
  locale = "id-ID",
): string {
  let targetDate: Date;

  if (typeof date === "number") {
    targetDate =
      date > 100_000_000_000 ? new Date(date) : new Date(date * 1000);
  } else if (typeof date === "string") {
    targetDate = new Date(date);
  } else {
    targetDate = date;
  }

  if (Number.isNaN(targetDate.getTime())) {
    return "-";
  }

  return new Intl.DateTimeFormat(locale, {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).format(targetDate);
}
