"use server";

import { api, safeApiCall } from "@/lib/axios";
import {
  BlockWindow,
  CreateBlockWindowInput,
  UpdateBlockWindowInput,
  ConflictCheckInput,
  ConflictCheckResponse,
  FeasibleWindowsInput,
  FeasibleWindowsResponse,
  ApiResponse,
} from "@/types";

export async function getBlockWindows(): Promise<ApiResponse<BlockWindow[]>> {
  return safeApiCall(() => api.get<BlockWindow[]>("blocks"));
}

export async function getBlockWindowById(
  id: number | string
): Promise<ApiResponse<BlockWindow>> {
  return safeApiCall(() => api.get<BlockWindow>(`blocks/${id}`));
}

export async function createBlockWindow(
  data: CreateBlockWindowInput
): Promise<ApiResponse<BlockWindow>> {
  return safeApiCall(() => api.post<BlockWindow>("blocks", data));
}

export async function updateBlockWindow(
  id: number | string,
  data: CreateBlockWindowInput
): Promise<ApiResponse<BlockWindow>> {
  return safeApiCall(() => api.put<BlockWindow>(`blocks/${id}`, data));
}

export async function patchBlockWindow(
  id: number | string,
  data: UpdateBlockWindowInput
): Promise<ApiResponse<BlockWindow>> {
  return safeApiCall(() => api.patch<BlockWindow>(`blocks/${id}`, data));
}

export async function deleteBlockWindow(
  id: number | string
): Promise<ApiResponse<{ deleted: boolean }>> {
  return safeApiCall(async () => {
    await api.delete(`blocks/${id}`);
    return { deleted: true };
  });
}

/**
 * Checks for train movement conflicts against a proposed maintenance window.
 */
export async function checkBlockConflict(
  data: ConflictCheckInput
): Promise<ApiResponse<ConflictCheckResponse>> {
  return safeApiCall(() =>
    api.post<ConflictCheckResponse>("blocks/check-conflict", data)
  );
}

/**
 * Finds all feasible maintenance gaps inside a block window.
 */
export async function getFeasibleWindows(
  data: FeasibleWindowsInput
): Promise<ApiResponse<FeasibleWindowsResponse>> {
  return safeApiCall(() =>
    api.post<FeasibleWindowsResponse>("blocks/feasible-windows", data)
  );
}
