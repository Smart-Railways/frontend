import { z } from "zod";
import { formatDateToISO } from "./time-utils";

// ---------------------------------------------------------------------------
// Date-range constraints per feature (as per business rules)
// ---------------------------------------------------------------------------
// | Feature            | Calendar range                   |
// |--------------------|----------------------------------|
// | Live Tracking      | Today − 7 days → Today           |
// | Master Timetable   | Today − 7 days → Today + 30 days |
// | Maintenance Plan   | Today → Today + 30 days           |
// | Block Windows      | Today → Today + 30 days           |
// ---------------------------------------------------------------------------

/**
 * Returns the start-of-day Date for today (local timezone).
 */
function getToday(): Date {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

/**
 * Adds (or subtracts) `days` to a Date.
 */
function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

// ---------------------------------------------------------------------------
// Shared helpers
// ---------------------------------------------------------------------------

/** Compute the min/max ISO date strings for a given feature. */
export function getDateBounds(feature: "live-tracking" | "master-timetable" | "maintenance" | "block-windows") {
  const today = getToday();

  switch (feature) {
    case "live-tracking":
      return {
        min: formatDateToISO(addDays(today, -7)),
        max: formatDateToISO(today),
      };
    case "master-timetable":
      return {
        min: formatDateToISO(addDays(today, -7)),
        max: formatDateToISO(addDays(today, 30)),
      };
    case "maintenance":
    case "block-windows":
      return {
        min: formatDateToISO(today),
        max: formatDateToISO(addDays(today, 30)),
      };
  }
}

// ---------------------------------------------------------------------------
// Zod schemas — each validates an ISO "YYYY-MM-DD" string against its range
// ---------------------------------------------------------------------------

function makeDateSchema(feature: "live-tracking" | "master-timetable" | "maintenance" | "block-windows") {
  return z.string().refine(
    (val) => {
      const bounds = getDateBounds(feature);
      return val >= bounds.min && val <= bounds.max;
    },
    {
      message: `Date must be within the allowed range for ${feature}`,
    }
  );
}

/** Live Tracking: Today − 7 days → Today (no future dates) */
export const liveTrackingDateSchema = makeDateSchema("live-tracking");

/** Master Timetable: Today − 7 days → Today + 30 days */
export const masterTimetableDateSchema = makeDateSchema("master-timetable");

/** Maintenance Planning: Today → Today + 30 days */
export const maintenanceDateSchema = makeDateSchema("maintenance");

/** Block Windows: Today → Today + 30 days */
export const blockWindowsDateSchema = makeDateSchema("block-windows");

// ---------------------------------------------------------------------------
// Imperative validation helper – returns error message or null
// ---------------------------------------------------------------------------

export function validateDate(
  value: string,
  feature: "live-tracking" | "master-timetable" | "maintenance" | "block-windows"
): string | null {
  const bounds = getDateBounds(feature);
  if (value < bounds.min || value > bounds.max) {
    return `Date must be between ${bounds.min} and ${bounds.max}`;
  }
  return null;
}

// ---------------------------------------------------------------------------
// Clamp helper – clamps a date string to the allowed range for a feature
// ---------------------------------------------------------------------------

export function clampDate(
  value: string,
  feature: "live-tracking" | "master-timetable" | "maintenance" | "block-windows"
): string {
  const bounds = getDateBounds(feature);
  if (value < bounds.min) return bounds.min;
  if (value > bounds.max) return bounds.max;
  return value;
}
