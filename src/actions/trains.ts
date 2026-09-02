"use server";

import { api, safeApiCall } from "@/lib/axios";
import {
  Train,
  CreateTrainInput,
  UpdateTrainInput,
  ApiResponse,
} from "@/types";

export async function getTrains(): Promise<ApiResponse<Train[]>> {
  return safeApiCall(() => api.get<Train[]>("trains"));
}

export async function getTrainById(
  id: number | string
): Promise<ApiResponse<Train>> {
  return safeApiCall(() => api.get<Train>(`trains/${id}`));
}

export async function createTrain(
  data: CreateTrainInput
): Promise<ApiResponse<Train>> {
  return safeApiCall(() => api.post<Train>("trains", data));
}

export async function updateTrain(
  id: number | string,
  data: CreateTrainInput
): Promise<ApiResponse<Train>> {
  return safeApiCall(() => api.put<Train>(`trains/${id}`, data));
}

export async function patchTrain(
  id: number | string,
  data: UpdateTrainInput
): Promise<ApiResponse<Train>> {
  return safeApiCall(() => api.patch<Train>(`trains/${id}`, data));
}

export async function deleteTrain(
  id: number | string
): Promise<ApiResponse<{ deleted: boolean }>> {
  return safeApiCall(async () => {
    await api.delete(`trains/${id}`);
    return { deleted: true };
  });
}
