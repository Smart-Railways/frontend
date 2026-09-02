"use server";

import { api, safeApiCall } from "@/lib/axios";
import {
  TrainMovement,
  CreateTrainMovementInput,
  UpdateTrainMovementInput,
  ApiResponse,
} from "@/types";

export async function getTrainMovements(): Promise<ApiResponse<TrainMovement[]>> {
  return safeApiCall(() => api.get<TrainMovement[]>("train-movements"));
}

export async function getTrainMovementById(
  id: number | string
): Promise<ApiResponse<TrainMovement>> {
  return safeApiCall(() => api.get<TrainMovement>(`train-movements/${id}`));
}

export async function createTrainMovement(
  data: CreateTrainMovementInput
): Promise<ApiResponse<TrainMovement>> {
  return safeApiCall(() => api.post<TrainMovement>("train-movements", data));
}

export async function updateTrainMovement(
  id: number | string,
  data: CreateTrainMovementInput
): Promise<ApiResponse<TrainMovement>> {
  return safeApiCall(() => api.put<TrainMovement>(`train-movements/${id}`, data));
}

export async function patchTrainMovement(
  id: number | string,
  data: UpdateTrainMovementInput
): Promise<ApiResponse<TrainMovement>> {
  return safeApiCall(() => api.patch<TrainMovement>(`train-movements/${id}`, data));
}

export async function deleteTrainMovement(
  id: number | string
): Promise<ApiResponse<{ deleted: boolean }>> {
  return safeApiCall(async () => {
    await api.delete(`train-movements/${id}`);
    return { deleted: true };
  });
}
