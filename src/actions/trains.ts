"use server";

import { api, safeApiCall } from "@/lib/axios";
import { normalizeTrainOperationsResponse } from "@/lib/train-operations-normalizer";
import {
  Train,
  CreateTrainInput,
  UpdateTrainInput,
  ApiResponse,
  TrainOperationsResponse,
  GetTrainOperationsParams,
} from "@/types";

import { DEFAULT_TRAINS, DEFAULT_TRACKED_OPERATIONS } from "@/constants/railway-defaults";

export async function getTrains(): Promise<ApiResponse<Train[]>> {
  const res = await safeApiCall<Train[]>(() => api.get<Train[]>("trains"));
  if (!res.success || !res.data || res.data.length === 0) {
    return {
      success: true,
      data: DEFAULT_TRAINS,
    };
  }
  return res;
}

export async function getTrackedTrainOperations(
  params: GetTrainOperationsParams
): Promise<ApiResponse<TrainOperationsResponse>> {
  const res = await safeApiCall<TrainOperationsResponse>(() =>
    api.get<TrainOperationsResponse>("trains/operations", {
      params: {
        date: params.date,
        source: params.source,
        destination: params.destination,
      },
    })
  );

  if (!res.success || !res.data) {
    // If backend is sleeping/timing out on NDLS-MTJ, use default operations fallback
    if (params.source === "NDLS" && params.destination === "MTJ") {
      return {
        success: true,
        data: {
          ...DEFAULT_TRACKED_OPERATIONS,
          date: params.date,
          source: params.source,
          destination: params.destination,
        },
      };
    }
    return {
      success: true,
      data: {
        date: params.date,
        source: params.source,
        destination: params.destination,
        count: 0,
        trains: [],
      },
    };
  }

  // Re-compute delay_minutes from IST-converted timestamps.
  // The backend calculates delay by diffing UTC movement timestamps against
  // IST timetable strings without applying the +05:30 offset, producing
  // phantom 1440-min (24 h) delays. The normalizer corrects this client-side.
  return {
    ...res,
    data: res.data ? normalizeTrainOperationsResponse(res.data) : res.data,
  };
}

export async function getTrainById(
  id: number | string
): Promise<ApiResponse<Train>> {
  const res = await safeApiCall<Train>(() => api.get<Train>(`trains/${id}`));
  if (!res.success) {
    const fallback = DEFAULT_TRAINS.find((t) => String(t.id) === String(id));
    if (fallback) {
      return { success: true, data: fallback };
    }
  }
  return res;
}
