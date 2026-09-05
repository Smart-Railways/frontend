/**
 * Converts any train timing representation into a consistent 24-hour HH:MM IST format.
 *
 * Supported formats:
 * - ISO 8601 UTC timestamp: "2026-09-04T23:40:00Z" -> converts UTC to IST (+05:30) -> "05:10"
 * - ISO 8601 with offset: "2026-09-04T05:10:00+05:30" -> converts to IST -> "05:10"
 * - Standard time-only string: "05:10:00" | "05:10" | "5:10" -> "05:10"
 * - Date-time string without offset: "2026-09-04 05:10:00" -> "05:10"
 * - JavaScript Date instance -> converts to IST -> "HH:MM"
 * - Null, undefined, empty, or invalid input -> graceful fallback (default "--:--")
 *
 * @param timeInput - String, Date, null, or undefined representing a timing
 * @param fallback - Optional fallback string when timing is missing or invalid (default: "--:--")
 * @returns Formatted "HH:MM" in Indian Standard Time (IST)
 */
export function formatTrainTimeIST(
  timeInput?: string | Date | null,
  fallback = "--:--"
): string {
  if (timeInput === null || timeInput === undefined) return fallback;

  // 1. If already a Date object
  if (timeInput instanceof Date) {
    if (isNaN(timeInput.getTime())) return fallback;
    const istDate = new Date(timeInput.getTime() + 19800000); // UTC + 5:30 = 19,800,000 ms
    const hh = String(istDate.getUTCHours()).padStart(2, "0");
    const mm = String(istDate.getUTCMinutes()).padStart(2, "0");
    return `${hh}:${mm}`;
  }

  const str = String(timeInput).trim();
  if (
    !str ||
    str === "--" ||
    str === "--:--" ||
    str === "null" ||
    str === "undefined" ||
    str === "Invalid Date"
  ) {
    return fallback;
  }

  // 2. Pure time-only string (e.g., "05:10:00", "05:10", "5:10", "17:40:00.000")
  // Indian Railway scheduled timetable strings are already local IST time-of-day.
  const timeOnlyRegex = /^([0-1]?[0-9]|2[0-3]):([0-5]?[0-9])(?::([0-5]?[0-9])(?:\.[0-9]+)?)?$/;
  const timeOnlyMatch = str.match(timeOnlyRegex);
  if (timeOnlyMatch) {
    const hh = timeOnlyMatch[1].padStart(2, "0");
    const mm = timeOnlyMatch[2].padStart(2, "0");
    return `${hh}:${mm}`;
  }

  // 3. Absolute ISO strings with explicit UTC indicator 'Z' or timezone offset
  // (e.g. "2026-09-04T23:40:00Z", "2026-09-04T23:40:00+00:00", "2026-09-04T05:10:00+05:30")
  const hasTimezone =
    str.endsWith("Z") ||
    str.includes("Z") ||
    /[+-]\d{2}(?::?\d{2})?$/.test(str);

  if (hasTimezone) {
    const parsed = new Date(str);
    if (!isNaN(parsed.getTime())) {
      // Add IST offset: +5 hours 30 minutes = +19,800,000 milliseconds
      const istDate = new Date(parsed.getTime() + 19800000);
      const hh = String(istDate.getUTCHours()).padStart(2, "0");
      const mm = String(istDate.getUTCMinutes()).padStart(2, "0");
      return `${hh}:${mm}`;
    }
  }

  // 4. Date-time string without explicit timezone (e.g. "2026-09-04 05:10:00" or "2026-09-04T05:10:00")
  if (str.includes("T") || str.includes(" ")) {
    const parts = str.split(/[T ]/);
    if (parts.length >= 2) {
      const timePart = parts[1].replace(/Z.*$/, "");
      const m = timePart.match(/^([0-1]?[0-9]|2[0-3]):([0-5]?[0-9])/);
      if (m) {
        return `${m[1].padStart(2, "0")}:${m[2].padStart(2, "0")}`;
      }
    }
  }

  // 5. General fallback: try Date parsing
  const parsed = new Date(str);
  if (!isNaN(parsed.getTime())) {
    const istDate = new Date(parsed.getTime() + 19800000);
    const hh = String(istDate.getUTCHours()).padStart(2, "0");
    const mm = String(istDate.getUTCMinutes()).padStart(2, "0");
    return `${hh}:${mm}`;
  }

  return fallback;
}

/**
 * Drop-in backward-compatible alias for formatTrainTimeIST.
 */
export const formatTimeString = formatTrainTimeIST;

// Helper to format date as YYYY-MM-DD
export function formatDateToISO(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

// Helper to format date display (e.g. "Fri, 04 Sept, 2026")
export function formatDisplayDate(dateStr: string): string {
  try {
    const [y, m, d] = dateStr.split("-").map(Number);
    const date = new Date(y, m - 1, d);
    return date.toLocaleDateString("en-IN", {
      weekday: "short",
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return dateStr;
  }
}

export interface DelayMetric {
  text: string;
  subText: string;
  isLate: boolean;
  isHighLate: boolean;
  isOnTime: boolean;
  badgeClass: string;
  dotClass: string;
}

// Format minutes delay into hours and minutes
export function formatDelayMetric(delayMinutes: number | null): DelayMetric {
  if (delayMinutes === null || delayMinutes === undefined) {
    return {
      text: "Awaiting Log",
      subText: "Pending Entry",
      isLate: false,
      isHighLate: false,
      isOnTime: false,
      badgeClass: "bg-slate-500 text-white border-transparent shadow-2xs font-semibold",
      dotClass: "bg-slate-300",
    };
  }

  if (delayMinutes <= 0) {
    const earlyMins = Math.abs(delayMinutes);
    return {
      text: earlyMins > 0 ? `On Time (${earlyMins}m Early)` : "On Time",
      subText: "Strict Adherence",
      isLate: false,
      isHighLate: false,
      isOnTime: true,
      badgeClass: "bg-emerald-600 text-white border-transparent shadow-2xs font-semibold",
      dotClass: "bg-white",
    };
  }

  const hours = Math.floor(delayMinutes / 60);
  const mins = delayMinutes % 60;
  const isHighLate = delayMinutes >= 60;

  let formattedDelay = "";
  if (hours > 0) {
    formattedDelay = `+${hours}h ${mins > 0 ? `${mins}m ` : "0m "}Late`;
  } else {
    formattedDelay = `+${mins}m Late`;
  }

  return {
    text: formattedDelay,
    subText: `${delayMinutes} mins total delay`,
    isLate: true,
    isHighLate,
    isOnTime: false,
    badgeClass: isHighLate
      ? "bg-red-600 text-white border-transparent shadow-2xs font-semibold"
      : "bg-red-500 text-white border-transparent shadow-2xs font-semibold",
    dotClass: isHighLate ? "bg-white animate-pulse" : "bg-white",
  };
}

// Calculate duration between two time strings
export function calculateTimeDuration(
  entryTime?: string | null,
  exitTime?: string | null
): { durationMins: number; formatted: string } {
  if (!entryTime || !exitTime) return { durationMins: 0, formatted: "--" };

  const parseToMins = (t: string) => {
    const formatted = formatTrainTimeIST(t);
    if (!formatted || formatted === "--:--") return 0;
    const [hh, mm] = formatted.split(":").map(Number);
    return (hh || 0) * 60 + (mm || 0);
  };

  const startMins = parseToMins(entryTime);
  let endMins = parseToMins(exitTime);
  if (endMins < startMins) {
    endMins += 24 * 60; // Next day offset
  }

  const diff = endMins - startMins;
  const hours = Math.floor(diff / 60);
  const mins = diff % 60;
  const formatted = hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  return { durationMins: diff, formatted };
}

