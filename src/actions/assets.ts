"use server";

import { api, safeApiCall } from "@/lib/axios";
import {
  Asset,
  CreateAssetInput,
  UpdateAssetInput,
  ApiResponse,
} from "@/types";

export async function getAssets(): Promise<ApiResponse<Asset[]>> {
  return safeApiCall(() => api.get<Asset[]>("assets"));
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
