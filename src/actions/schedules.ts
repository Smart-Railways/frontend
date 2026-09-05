"use server";

import { unstable_cache } from "next/cache";
import { api, safeApiCall } from "@/lib/axios";
import {
  TrainSchedule,
  GetTrainSchedulesParams,
  PaginatedTrainSchedulesResponse,
  ApiResponse,
} from "@/types";

import { DEFAULT_TRAIN_SCHEDULES } from "@/constants/railway-defaults";

/** 4 hours in seconds — timetable data changes infrequently */
const TIMETABLE_CACHE_TTL = 4 * 60 * 60; // 14400 s

/**
 * Filter default static train schedules based on query parameters as offline/fallback handling.
 */
function filterDefaultSchedules(
  schedules: TrainSchedule[],
  params?: GetTrainSchedulesParams
): TrainSchedule[] {
  if (!params) return schedules;

  let filtered = [...schedules];

  if (params.date) {
    try {
      const parsedDate = new Date(params.date);
      if (!isNaN(parsedDate.getTime())) {
        // Convert JS getDay() (0=Sun..6=Sat) to Python weekday (0=Mon..6=Sun)
        const dayIndex = (parsedDate.getDay() + 6) % 7;
        filtered = filtered.filter((s) => {
          const pattern = s.running_days || "1111111";
          return pattern[dayIndex] === "1";
        });
      }
    } catch {
      // ignore date parse errors in fallback
    }
  }

  if (params.source) {
    const src = params.source.toLowerCase().trim();
    filtered = filtered.filter((s) => {
      const sName = (s.section_name || "").toLowerCase();
      return sName.includes(src);
    });
  }

  if (params.destination) {
    const dst = params.destination.toLowerCase().trim();
    filtered = filtered.filter((s) => {
      const sName = (s.section_name || "").toLowerCase();
      return sName.includes(dst);
    });
  }

  return filtered;
}

// ---------------------------------------------------------------------------
// Cached inner fetchers — only the raw HTTP call is cached server-side.
// Cache key includes every query dimension so each unique request is stored
// independently and revalidated after 4 hours.
// ---------------------------------------------------------------------------

const fetchSchedulesFromAPI = unstable_cache(
  async (queryParams: Record<string, string | number>) => {
    return safeApiCall<TrainSchedule[] | PaginatedTrainSchedulesResponse>(async () => {
      const response = await api.get<TrainSchedule[] | PaginatedTrainSchedulesResponse>(
        "train-schedules",
        {
          params: Object.keys(queryParams).length > 0 ? queryParams : undefined,
        }
      );
      return response.data;
    });
  },
  ["train-schedules-flat"],
  { revalidate: TIMETABLE_CACHE_TTL, tags: ["train-schedules"] }
);

const fetchPaginatedSchedulesFromAPI = unstable_cache(
  async (queryParams: Record<string, string | number>) => {
    return safeApiCall<PaginatedTrainSchedulesResponse>(async () => {
      const response = await api.get<TrainSchedule[] | PaginatedTrainSchedulesResponse>(
        "train-schedules",
        {
          params: Object.keys(queryParams).length > 0 ? queryParams : undefined,
        }
      );

      const raw = response.data;
      if (raw && typeof raw === "object" && "results" in raw && Array.isArray(raw.results)) {
        return raw as PaginatedTrainSchedulesResponse;
      }
      if (Array.isArray(raw)) {
        return {
          count: raw.length,
          next: null,
          previous: null,
          results: raw,
        };
      }
      return {
        count: 0,
        next: null,
        previous: null,
        results: [],
      };
    });
  },
  ["train-schedules-paginated"],
  { revalidate: TIMETABLE_CACHE_TTL, tags: ["train-schedules"] }
);

// ---------------------------------------------------------------------------
// Public server actions
// ---------------------------------------------------------------------------

/**
 * Fetch all train schedules (non-paginated / flat array response).
 * Used by `useTrainSchedules` hook and the /api/train-schedules route.
 * Results are cached server-side for 4 hours per unique param combination.
 */
export async function getTrainSchedules(
  params?: GetTrainSchedulesParams
): Promise<ApiResponse<TrainSchedule[]>> {
  const queryParams: Record<string, string | number> = {};
  if (params?.date) queryParams.date = params.date;
  if (params?.source) queryParams.source = params.source;
  if (params?.destination) queryParams.destination = params.destination;

  const res = await fetchSchedulesFromAPI(queryParams);

  if (res.success && res.data) {
    const raw = res.data;
    if (Array.isArray(raw)) {
      return { success: true, data: raw };
    }
    if (raw && typeof raw === "object" && "results" in raw) {
      return { success: true, data: (raw as PaginatedTrainSchedulesResponse).results };
    }
  }

  // Fallback to static defaults on API failure
  const fallbackList = filterDefaultSchedules(DEFAULT_TRAIN_SCHEDULES, params);
  return { success: true, data: fallbackList };
}


/**
 * Fetch paginated train schedules including total count, next, and previous URLs.
 * Results are cached server-side for 4 hours per unique param combination
 * (source × destination × date × page × page_size).
 */
export async function getPaginatedTrainSchedules(
  params?: GetTrainSchedulesParams
): Promise<ApiResponse<PaginatedTrainSchedulesResponse>> {
  const queryParams: Record<string, string | number> = {};
  if (params?.date) queryParams.date = params.date;
  if (params?.source) queryParams.source = params.source;
  if (params?.destination) queryParams.destination = params.destination;
  if (params?.page) queryParams.page = params.page;
  if (params?.page_size) queryParams.page_size = params.page_size;

  const res = await fetchPaginatedSchedulesFromAPI(queryParams);

  if (res.success && res.data && res.data.results.length > 0) {
    return res;
  }

  // Fallback to static defaults on API failure / empty response
  const fallbackList = filterDefaultSchedules(DEFAULT_TRAIN_SCHEDULES, params);
  const pageSize = params?.page_size || 20;
  const page = params?.page || 1;
  const start = (page - 1) * pageSize;
  const pagedResults = fallbackList.slice(start, start + pageSize);

  return {
    success: true,
    data: {
      count: fallbackList.length,
      next: start + pageSize < fallbackList.length ? `?page=${page + 1}` : null,
      previous: page > 1 ? `?page=${page - 1}` : null,
      results: pagedResults,
    },
  };
}

export async function getTrainScheduleById(
  id: number | string
): Promise<ApiResponse<TrainSchedule>> {
  const primary = await safeApiCall<TrainSchedule>(() =>
    api.get<TrainSchedule>(`train-schedules/${id}`)
  );
  if (primary.success && primary.data) return primary;

  const secondary = await safeApiCall<TrainSchedule>(() =>
    api.get<TrainSchedule>(`schedules/${id}`)
  );
  if (secondary.success && secondary.data) return secondary;

  const fallback = DEFAULT_TRAIN_SCHEDULES.find((s) => String(s.id) === String(id));
  if (fallback) {
    return { success: true, data: fallback };
  }

  return { success: false, error: "Schedule not found" };
}