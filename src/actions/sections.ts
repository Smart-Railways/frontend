"use server";

import { api, safeApiCall } from "@/lib/axios";
import {
  RailwaySection,
  ApiResponse,
} from "@/types";

export async function getRailwaySections(): Promise<ApiResponse<RailwaySection[]>> {
  return safeApiCall<RailwaySection[]>(async () => {
    const response = await api.get<RailwaySection[] | { results: RailwaySection[] }>("sections");
    const raw = response.data;
    if (Array.isArray(raw)) {
      return raw;
    }
    if (raw && typeof raw === "object" && "results" in raw && Array.isArray(raw.results)) {
      return raw.results;
    }
    return [];
  });
}

export async function getRailwaySectionById(
  id: number | string
): Promise<ApiResponse<RailwaySection>> {
  return safeApiCall<RailwaySection>(() => api.get<RailwaySection>(`sections/${id}`));
}

