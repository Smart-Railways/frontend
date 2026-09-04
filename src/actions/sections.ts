"use server";

import { api, safeApiCall } from "@/lib/axios";
import {
  RailwaySection,
  CreateRailwaySectionInput,
  UpdateRailwaySectionInput,
  ApiResponse,
} from "@/types";

import { DEFAULT_RAILWAY_SECTIONS } from "@/constants/railway-defaults";

export async function getRailwaySections(): Promise<ApiResponse<RailwaySection[]>> {
  const res = await safeApiCall<RailwaySection[]>(async () => {
    const response = await api.get<RailwaySection[] | { results: RailwaySection[] }>("sections");
    const raw = response.data;
    if (Array.isArray(raw)) {
      return raw;
    }
    if (raw && typeof raw === "object" && "results" in raw && Array.isArray(raw.results)) {
      return raw.results;
    }
    return DEFAULT_RAILWAY_SECTIONS;
  });

  if (!res.success || !res.data || res.data.length === 0) {
    return {
      success: true,
      data: DEFAULT_RAILWAY_SECTIONS,
    };
  }

  return res;
}

export async function getRailwaySectionById(
  id: number | string
): Promise<ApiResponse<RailwaySection>> {
  const res = await safeApiCall<RailwaySection>(() => api.get<RailwaySection>(`sections/${id}`));
  if (!res.success) {
    const fallback = DEFAULT_RAILWAY_SECTIONS.find((s) => String(s.id) === String(id));
    if (fallback) {
      return { success: true, data: fallback };
    }
  }
  return res;
}
