"use server";

import { api, safeApiCall } from "@/lib/axios";
import {
  TrainSchedule,
  CreateTrainScheduleInput,
  UpdateTrainScheduleInput,
  ApiResponse,
} from "@/types";

export async function getTrainSchedules(): Promise<ApiResponse<TrainSchedule[]>> {
  const primary = await safeApiCall(() => api.get<TrainSchedule[]>("train-schedules"));
  if (primary.success) return primary;
  return safeApiCall(() => api.get<TrainSchedule[]>("schedules"));
}

export async function getTrainScheduleById(
  id: number | string
): Promise<ApiResponse<TrainSchedule>> {
  const primary = await safeApiCall(() => api.get<TrainSchedule>(`train-schedules/${id}`));
  if (primary.success) return primary;
  return safeApiCall(() => api.get<TrainSchedule>(`schedules/${id}`));
}