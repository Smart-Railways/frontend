/**
 * train-operations-normalizer.ts
 *
 * The /trains/operations/?date=&source=&destination= endpoint returns movement
 * timestamps as UTC ISO-8601 strings (e.g. "2026-09-04T23:40:00Z"), while the
 * scheduled entry/exit times are plain IST time-of-day strings (e.g. "05:10:00").
 *
 * The backend computes `delay_minutes` by naively diffing these two without
 * accounting for the UTC→IST (+05:30) offset, producing phantom delays like
 * 1440 minutes (24 h) for trains that are actually on time.
 *
 * This module provides `normalizeTrainOperationsResponse` which:
 *  1. Converts UTC movement timestamps to IST HH:MM.
 *  2. Re-computes `delay_minutes` from the IST-corrected actuals vs the
 *     scheduled timetable times.
 *  3. Returns a new response object — the original is never mutated.
 */

import {
  TrainOperationsResponse,
  TrackedTrainOperation,
} from "@/types";
import { formatTrainTimeIST } from "@/lib/time-utils";

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

/**
 * Parse a timetable or movement time string into total minutes since midnight
 * (IST). Handles:
 *  - UTC ISO timestamps  "2026-09-04T23:40:00Z"  → IST 05:10 → 310 min
 *  - IST time-of-day     "05:10:00" | "05:10"     → 310 min
 *  - null / undefined / invalid                   → null
 */
function toISTMinutes(timeInput: string | null | undefined): number | null {
  if (!timeInput) return null;

  const istHHMM = formatTrainTimeIST(timeInput);
  if (!istHHMM || istHHMM === "--:--") return null;

  const [hh, mm] = istHHMM.split(":").map(Number);
  if (isNaN(hh) || isNaN(mm)) return null;

  return hh * 60 + mm;
}

/**
 * Compute delay in minutes between scheduled entry (IST time string) and
 * actual entry (UTC ISO or IST time string).
 *
 * Handles cross-midnight runs: if the computed delta is ≥ 1440 (a full day),
 * it is reduced by 1440, because movement timestamps can fall on the next
 * calendar day in UTC while still being the same IST service day.
 *
 * Returns null when either input is unavailable.
 */
function computeDelayMinutes(
  scheduledEntry: string | null | undefined,
  actualEntry: string | null | undefined
): number | null {
  const scheduledMins = toISTMinutes(scheduledEntry);
  const actualMins = toISTMinutes(actualEntry);

  if (scheduledMins === null || actualMins === null) return null;

  let delta = actualMins - scheduledMins;

  // If the delta spans a full day (≥ 1440) it means the UTC→IST conversion
  // moved the timestamp to the next calendar day; subtract 24 h to normalise.
  if (delta >= 1440) delta -= 1440;
  // Similarly, very large negative deltas (e.g. train ran very early next day)
  if (delta <= -1440) delta += 1440;

  return delta;
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Normalise a single `TrackedTrainOperation` record.
 *
 * - Re-computes `delay_minutes` from IST-converted timestamps.
 * - Does NOT mutate the original object.
 */
export function normalizeTrackedTrain(
  train: TrackedTrainOperation
): TrackedTrainOperation {
  const scheduledEntry = train.schedule?.entry_time ?? null;
  const actualEntry = train.movement?.actual_entry_time ?? null;

  const correctedDelay = computeDelayMinutes(scheduledEntry, actualEntry);

  // Only override if we successfully computed a value; keep the original
  // (possibly wrong) backend value as a last resort so the UI never goes blank.
  const delay_minutes =
    correctedDelay !== null ? correctedDelay : train.delay_minutes;

  return {
    ...train,
    delay_minutes,
  };
}

/**
 * Normalise the full response from GET /trains/operations/.
 *
 * Iterates over every train in the `trains` array, corrects `delay_minutes`,
 * and returns a new `TrainOperationsResponse` with the fixed data.
 *
 * Usage (in the server action or hook):
 * ```ts
 * import { normalizeTrainOperationsResponse } from "@/lib/train-operations-normalizer";
 *
 * const raw = await api.get<TrainOperationsResponse>("trains/operations", { params });
 * return normalizeTrainOperationsResponse(raw.data);
 * ```
 */
export function normalizeTrainOperationsResponse(
  response: TrainOperationsResponse
): TrainOperationsResponse {
  return {
    ...response,
    trains: response.trains.map(normalizeTrackedTrain),
  };
}
