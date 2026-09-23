"use server";

import { api, safeApiCall } from "@/lib/axios";
import {
  Asset,
  CreateAssetInput,
  UpdateAssetInput,
  ApiResponse,
  PaginationParams,
  PaginatedResponse,
} from "@/types";

const DEFAULT_PAGE = 1;
const DEFAULT_PAGE_SIZE = 10;

export async function getPaginatedAssets(
  params: PaginationParams = {}
): Promise<ApiResponse<PaginatedResponse<Asset>>> {
  const page = params.page ?? DEFAULT_PAGE;
  const pageSize = params.page_size ?? DEFAULT_PAGE_SIZE;
  const response = await safeApiCall<Asset[] | PaginatedResponse<Asset>>(() =>
    api.get<Asset[] | PaginatedResponse<Asset>>("assets", {
      params: { page, page_size: pageSize },
    })
  );

  if (!response.success) {
    return {
      success: false,
      error: response.error,
      status: response.status,
      message: response.message,
    };
  }

  const payload = response.data;
  return {
    success: true,
    data: Array.isArray(payload)
      ? { count: payload.length, next: null, previous: null, results: payload }
      : payload ?? { count: 0, next: null, previous: null, results: [] },
  };
}

export async function getAssets(): Promise<ApiResponse<Asset[]>> {
  const response = await getPaginatedAssets();
  if (!response.success) {
    return {
      success: false,
      error: response.error,
      status: response.status,
      message: response.message,
    };
  }
  return { success: true, data: response.data?.results ?? [] };
}

export async function getAssetById(
  id: number | string
): Promise<ApiResponse<Asset>> {
  return safeApiCall(() => api.get<Asset>(`assets/${id}`));
}

export async function createAsset(
  data: CreateAssetInput
): Promise<ApiResponse<Asset>> {
  return safeApiCall(() => api.post<Asset>("assets", data));
}

export async function updateAsset(
  id: number | string,
  data: CreateAssetInput
): Promise<ApiResponse<Asset>> {
  return safeApiCall(() => api.put<Asset>(`assets/${id}`, data));
}

export async function patchAsset(
  id: number | string,
  data: UpdateAssetInput
): Promise<ApiResponse<Asset>> {
  return safeApiCall(() => api.patch<Asset>(`assets/${id}`, data));
}

export async function deleteAsset(
  id: number | string
): Promise<ApiResponse<{ deleted: boolean }>> {
  return safeApiCall(async () => {
    await api.delete(`assets/${id}`);
    return { deleted: true };
  });
}
