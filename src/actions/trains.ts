"use server";

import { api, safeApiCall } from "@/lib/axios";
import {
  Train,
  CreateTrainInput,
  UpdateTrainInput,
  ApiResponse,
  TrainOperationsResponse,
  GetTrainOperationsParams,
} from "@/types";

export async function getTrains(): Promise<ApiResponse<Train[]>> {
  return safeApiCall(() => api.get<Train[]>("trains"));
}

export async function getTrackedTrainOperations(
  params: GetTrainOperationsParams
): Promise<ApiResponse<TrainOperationsResponse>> {
  return safeApiCall(() =>
    api.get<TrainOperationsResponse>("trains/operations", {
      params: {
        date: params.date,
        source: params.source,
        destination: params.destination,
      },
    })
  );
}

export async function getTrainById(
  id: number | string
): Promise<ApiResponse<Train>> {
  return safeApiCall(() => api.get<Train>(`trains/${id}`));
}
