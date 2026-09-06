"use server";

import { api, safeApiCall } from "@/lib/axios";
import {
  BlockWindow,
  CreateBlockWindowInput,
  UpdateBlockWindowInput,
  ConflictCheckInput,
  ConflictCheckResponse,
  FeasibleWindowsRequest,
  FeasibleWindowsInput,
  FeasibleWindowsResponse,
  BlockRecommendationResponse,
  BlockWindowPutPayload,
  ApiResponse,
} from "@/types";

export async function getBlockWindows(): Promise<ApiResponse<BlockWindow[]>> {
  return safeApiCall(() => api.get<BlockWindow[]>("block-windows"));
}

export async function getBlockWindowById(
  id: number | string
): Promise<ApiResponse<BlockWindow>> {
  return safeApiCall(() => api.get<BlockWindow>(`block-windows/${id}`));
}

export async function createBlockWindow(
  data: CreateBlockWindowInput
): Promise<ApiResponse<BlockWindow>> {
  return safeApiCall(() => api.post<BlockWindow>("block-windows", data));
}

export async function updateBlockWindow(
  id: number | string,
  data: CreateBlockWindowInput
): Promise<ApiResponse<BlockWindow>> {
  return safeApiCall(() => api.put<BlockWindow>(`block-windows/${id}`, data));
}

/** Full PUT replacement for block window — used by AI recommendation accept flow */
export async function updateBlockWindowFull(
  id: number | string,
  data: BlockWindowPutPayload
): Promise<ApiResponse<BlockWindow>> {
  return safeApiCall(() => api.put<BlockWindow>(`block-windows/${id}`, data));
}

export async function patchBlockWindow(
  id: number | string,
  data: UpdateBlockWindowInput
): Promise<ApiResponse<BlockWindow>> {
  return safeApiCall(() => api.patch<BlockWindow>(`block-windows/${id}`, data));
}

export async function deleteBlockWindow(
  id: number | string
): Promise<ApiResponse<{ deleted: boolean }>> {
  return safeApiCall(async () => {
    await api.delete(`block-windows/${id}`);
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
    api.post<ConflictCheckResponse>("block-windows/check-conflict", data)
  );
}

/**
 * Phase 1: Finds feasible maintenance windows for a task on a target date.
 * New API: accepts { task_id, date } — no block_window_id required.
 */
export async function getFeasibleWindows(
  data: FeasibleWindowsRequest
): Promise<ApiResponse<FeasibleWindowsResponse>> {
  return safeApiCall(() =>
    api.post<FeasibleWindowsResponse>("block-windows/feasible-windows", {
      task_id: data.task_id,
      date: data.date,
    })
  );
}

/**
 * @deprecated Use getFeasibleWindows with FeasibleWindowsRequest instead.
 * Legacy shim for old block_window_id-based flow.
 */
export async function getFeasibleWindowsLegacy(
  data: FeasibleWindowsInput
): Promise<ApiResponse<FeasibleWindowsResponse>> {
  const payload = {
    task_id: data.task_id,
    block_window_id: data.block_window_id ?? data.block_id,
  };
  return safeApiCall(() =>
    api.post<FeasibleWindowsResponse>("block-windows/feasible-windows", payload)
  );
}

/**
 * Phase 3: Fetches the continuous AI recommendation for an existing block window.
 * GET /block-windows/{id}/recommendation/?task_id=...
 */
export async function getBlockRecommendation(
  blockWindowId: number | string,
  taskId?: string
): Promise<ApiResponse<BlockRecommendationResponse>> {
  const params = taskId ? { task_id: taskId } : {};
  return safeApiCall(() =>
    api.get<BlockRecommendationResponse>(
      `block-windows/${blockWindowId}/recommendation`,
      { params }
    )
  );
}

/**
 * Phase 3C: 1-Click Auto-Apply endpoint.
 * POST /block-windows/{id}/apply-recommendation/?task_id=...
 */
export async function applyBlockRecommendation(
  blockWindowId: number | string,
  taskId?: string
): Promise<ApiResponse<{ block_window: BlockWindow }>> {
  const params = taskId ? { task_id: taskId } : {};
  return safeApiCall(() =>
    api.post<{ block_window: BlockWindow }>(
      `block-windows/${blockWindowId}/apply-recommendation`,
      {},
      { params }
    )
  );
}

export const checkMaintenanceConflict = checkBlockConflict;
export const getFeasibleMaintenanceWindows = getFeasibleWindows;
