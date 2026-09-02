"use server";

import { api, safeApiCall } from "@/lib/axios";
import {
  RailwaySection,
  CreateRailwaySectionInput,
  UpdateRailwaySectionInput,
  ApiResponse,
} from "@/types";

export async function getRailwaySections(): Promise<ApiResponse<RailwaySection[]>> {
  return safeApiCall(() => api.get<RailwaySection[]>("sections"));
}

export async function getRailwaySectionById(
  id: number | string
): Promise<ApiResponse<RailwaySection>> {
  return safeApiCall(() => api.get<RailwaySection>(`sections/${id}`));
}

export async function createRailwaySection(
  data: CreateRailwaySectionInput
): Promise<ApiResponse<RailwaySection>> {
  return safeApiCall(() => api.post<RailwaySection>("sections", data));
}

export async function updateRailwaySection(
  id: number | string,
  data: CreateRailwaySectionInput
): Promise<ApiResponse<RailwaySection>> {
  return safeApiCall(() => api.put<RailwaySection>(`sections/${id}`, data));
}

export async function patchRailwaySection(
  id: number | string,
  data: UpdateRailwaySectionInput
): Promise<ApiResponse<RailwaySection>> {
  return safeApiCall(() => api.patch<RailwaySection>(`sections/${id}`, data));
}

export async function deleteRailwaySection(
  id: number | string
): Promise<ApiResponse<{ deleted: boolean }>> {
  return safeApiCall(async () => {
    await api.delete(`sections/${id}`);
    return { deleted: true };
  });
}
