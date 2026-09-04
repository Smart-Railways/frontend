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
