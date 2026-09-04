"use server";

import { api, safeApiCall } from "@/lib/axios";
import {
  TrainSchedule,
  CreateTrainScheduleInput,
  UpdateTrainScheduleInput,
  ApiResponse,
} from "@/types";

import { DEFAULT_TRAIN_SCHEDULES } from "@/constants/railway-defaults";

export async function getTrainSchedules(): Promise<ApiResponse<TrainSchedule[]>> {
  const primary = await safeApiCall<TrainSchedule[]>(() => api.get<TrainSchedule[]>("train-schedules"));
  if (primary.success && primary.data && primary.data.length > 0) return primary;

  const secondary = await safeApiCall<TrainSchedule[]>(() => api.get<TrainSchedule[]>("schedules"));
  if (secondary.success && secondary.data && secondary.data.length > 0) return secondary;

  return {
    success: true,
    data: DEFAULT_TRAIN_SCHEDULES,
  };
}

export async function getTrainScheduleById(
  id: number | string
): Promise<ApiResponse<TrainSchedule>> {
  const primary = await safeApiCall<TrainSchedule>(() => api.get<TrainSchedule>(`train-schedules/${id}`));
  if (primary.success && primary.data) return primary;

  const secondary = await safeApiCall<TrainSchedule>(() => api.get<TrainSchedule>(`schedules/${id}`));
  if (secondary.success && secondary.data) return secondary;

  const fallback = DEFAULT_TRAIN_SCHEDULES.find((s) => String(s.id) === String(id));
  if (fallback) {
    return { success: true, data: fallback };
  }

  return { success: false, error: "Schedule not found" };
}