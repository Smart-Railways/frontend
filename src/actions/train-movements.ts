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
