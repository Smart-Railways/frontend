"use server";

import { unstable_cache } from "next/cache";
import { api, safeApiCall } from "@/lib/axios";
import {
  TrainSchedule,
  GetTrainSchedulesParams,
  PaginatedTrainSchedulesResponse,
  ApiResponse,
} from "@/types";

/** 4 hours in seconds — timetable data changes infrequently */
const TIMETABLE_CACHE_TTL = 4 * 60 * 60; // 14400 s

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

  return { success: res.success, data: [], error: res.error };
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

  return fetchPaginatedSchedulesFromAPI(queryParams);
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

  return { success: false, error: "Schedule not found" };
}