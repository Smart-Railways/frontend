"use server";

import { api, safeApiCall } from "@/lib/axios";
import {
  MaintenanceTask,
  CreateMaintenanceTaskInput,
  UpdateMaintenanceTaskInput,
  ApiResponse,
} from "@/types";

export async function getMaintenanceTasks(): Promise<ApiResponse<MaintenanceTask[]>> {
  return safeApiCall(() => api.get<MaintenanceTask[]>("maintenances"));
}

export async function getMaintenanceTaskById(
  id: number | string
): Promise<ApiResponse<MaintenanceTask>> {
  return safeApiCall(() => api.get<MaintenanceTask>(`maintenances/${id}`));
}

export async function createMaintenanceTask(
  data: CreateMaintenanceTaskInput
): Promise<ApiResponse<MaintenanceTask>> {
  return safeApiCall(() => api.post<MaintenanceTask>("maintenances", data));
}

export async function updateMaintenanceTask(
  id: number | string,
  data: CreateMaintenanceTaskInput
): Promise<ApiResponse<MaintenanceTask>> {
  return safeApiCall(() => api.put<MaintenanceTask>(`maintenances/${id}`, data));
}

export async function patchMaintenanceTask(
  id: number | string,
  data: UpdateMaintenanceTaskInput
): Promise<ApiResponse<MaintenanceTask>> {
  return safeApiCall(() => api.patch<MaintenanceTask>(`maintenances/${id}`, data));
}

export async function deleteMaintenanceTask(
  id: number | string
): Promise<ApiResponse<{ deleted: boolean }>> {
  return safeApiCall(async () => {
    await api.delete(`maintenances/${id}`);
    return { deleted: true };
  });
}
