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

export async function createTrainSchedule(
  data: CreateTrainScheduleInput
): Promise<ApiResponse<TrainSchedule>> {
  const primary = await safeApiCall(() => api.post<TrainSchedule>("train-schedules", data));
  if (primary.success) return primary;
  return safeApiCall(() => api.post<TrainSchedule>("schedules", data));
}

export async function updateTrainSchedule(
  id: number | string,
  data: CreateTrainScheduleInput
): Promise<ApiResponse<TrainSchedule>> {
  const primary = await safeApiCall(() => api.put<TrainSchedule>(`train-schedules/${id}`, data));
  if (primary.success) return primary;
  return safeApiCall(() => api.put<TrainSchedule>(`schedules/${id}`, data));
}

export async function patchTrainSchedule(
  id: number | string,
  data: UpdateTrainScheduleInput
): Promise<ApiResponse<TrainSchedule>> {
  const primary = await safeApiCall(() => api.patch<TrainSchedule>(`train-schedules/${id}`, data));
  if (primary.success) return primary;
  return safeApiCall(() => api.patch<TrainSchedule>(`schedules/${id}`, data));
}

export async function deleteTrainSchedule(
  id: number | string
): Promise<ApiResponse<{ deleted: boolean }>> {
  return safeApiCall(async () => {
    try {
      await api.delete(`train-schedules/${id}`);
    } catch {
      await api.delete(`schedules/${id}`);
    }
    return { deleted: true };
  });
}
