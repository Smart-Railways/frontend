"use server";

import { api, safeApiCall } from "@/lib/axios";
import {
  TrainMovement,
  GetTrainMovementsParams,
  PaginatedTrainMovementsResponse,
  ApiResponse,
} from "@/types";

export async function getTrainMovements(
  params?: GetTrainMovementsParams
): Promise<ApiResponse<PaginatedTrainMovementsResponse>> {
  const queryParams: Record<string, string | number> = {};
  if (params?.date) queryParams.date = params.date;
  if (params?.from) queryParams.from = params.from;
  if (params?.to) queryParams.to = params.to;
  if (params?.page) queryParams.page = params.page;
  if (params?.page_size) queryParams.page_size = params.page_size;

  return safeApiCall(() =>
    api.get<PaginatedTrainMovementsResponse>("train-movements", {
      params: queryParams,
    })
  );
}

export async function getTrainMovementById(
  id: number | string
): Promise<ApiResponse<TrainMovement>> {
  return safeApiCall(() => api.get<TrainMovement>(`train-movements/${id}`));
}
