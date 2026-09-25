"use server";

import { api, safeApiCall } from "@/lib/axios";
import {
  MaintenanceTask,
  CreateMaintenanceTaskInput,
  UpdateMaintenanceTaskInput,
  MaintenanceChecklistItem,
  MaintenanceLog,
  ApiResponse,
  PaginationParams,
  PaginatedResponse,
  MaintenanceBatch,
  CombinedBlockRecommendationInput,
  CombinedBlockRecommendationResponse,
} from "@/types";

const DEFAULT_PAGE = 1;
const DEFAULT_PAGE_SIZE = 10;

export async function getPaginatedMaintenanceTasks(
  params: PaginationParams = {}
): Promise<ApiResponse<PaginatedResponse<MaintenanceTask>>> {
  const page = params.page ?? DEFAULT_PAGE;
  const pageSize = params.page_size ?? DEFAULT_PAGE_SIZE;
  const response = await safeApiCall<MaintenanceTask[] | PaginatedResponse<MaintenanceTask>>(
    () =>
      api.get<MaintenanceTask[] | PaginatedResponse<MaintenanceTask>>("maintenance-tasks", {
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

export async function getMaintenanceTasks(): Promise<ApiResponse<MaintenanceTask[]>> {
  // Map and notification overlays need the full operational picture rather than
  // only the first table page.
  const response = await getPaginatedMaintenanceTasks({ page: 1, page_size: 100 });
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

export async function startMaintenanceTask(
  id: number | string,
  checklist: MaintenanceChecklistItem[]
): Promise<ApiResponse<MaintenanceTask>> {
  return safeApiCall(() => api.post<MaintenanceTask>(`maintenance-tasks/${id}/start`, { checklist }));
}

export async function completeMaintenanceTask(
  id: number | string,
  remark: string
): Promise<ApiResponse<MaintenanceTask>> {
  return safeApiCall(() => api.post<MaintenanceTask>(`maintenance-tasks/${id}/complete`, { remark }));
}

export async function cancelMaintenanceTask(
  id: number | string,
  remark: string
): Promise<ApiResponse<MaintenanceTask>> {
  return safeApiCall(() => api.post<MaintenanceTask>(`maintenance-tasks/${id}/cancel`, { remark }));
}

export async function getMaintenanceLogs(taskId: number | string): Promise<ApiResponse<MaintenanceLog[]>> {
  return safeApiCall(() => api.get<MaintenanceLog[]>("maintenance-logs", { params: { task_id: taskId } }));
}

export async function getMaintenanceTaskById(
  id: number | string
): Promise<ApiResponse<MaintenanceTask>> {
  return safeApiCall(() => api.get<MaintenanceTask>(`maintenance-tasks/${id}`));
}

/** Fetch the shared block window and all tasks linked to a maintenance batch. */
export async function getMaintenanceBatchById(
  id: number | string
): Promise<ApiResponse<MaintenanceBatch>> {
  return safeApiCall(() => api.get<MaintenanceBatch>(`maintenance-batches/${id}`));
}

/**
 * Preview or apply a combined block-window recommendation. Passing `apply: true`
 * creates the batch and schedules the eligible selected tasks.
 */
export async function getCombinedBlockRecommendation(
  data: CombinedBlockRecommendationInput
): Promise<ApiResponse<CombinedBlockRecommendationResponse>> {
  return safeApiCall(() =>
    api.post<CombinedBlockRecommendationResponse>("block-windows/combined-recommendation", data)
  );
}

export async function createMaintenanceTask(
  data: CreateMaintenanceTaskInput
): Promise<ApiResponse<MaintenanceTask>> {
  return safeApiCall(() => api.post<MaintenanceTask>("maintenance-tasks", data));
}

export async function updateMaintenanceTask(
  id: number | string,
  data: CreateMaintenanceTaskInput
): Promise<ApiResponse<MaintenanceTask>> {
  return safeApiCall(() => api.put<MaintenanceTask>(`maintenance-tasks/${id}`, data));
}

export async function patchMaintenanceTask(
  id: number | string,
  data: UpdateMaintenanceTaskInput
): Promise<ApiResponse<MaintenanceTask>> {
  return safeApiCall(() => api.patch<MaintenanceTask>(`maintenance-tasks/${id}`, data));
}

export async function deleteMaintenanceTask(
  id: number | string
): Promise<ApiResponse<{ deleted: boolean }>> {
  return safeApiCall(async () => {
    await api.delete(`maintenance-tasks/${id}`);
    return { deleted: true };
  });
}
