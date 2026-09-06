"use server";

import { api, safeApiCall } from "@/lib/axios";
import { normalizeTrainOperationsResponse } from "@/lib/train-operations-normalizer";
import {
  Train,
  ApiResponse,
  TrainOperationsResponse,
  GetTrainOperationsParams,
} from "@/types";

export async function getTrains(): Promise<ApiResponse<Train[]>> {
  return safeApiCall<Train[]>(() => api.get<Train[]>("trains"));
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
    return res;
  }

  return {
    ...res,
    data: normalizeTrainOperationsResponse(res.data),
  };
}

export async function getTrainById(
  id: number | string
): Promise<ApiResponse<Train>> {
  return safeApiCall<Train>(() => api.get<Train>(`trains/${id}`));
}

