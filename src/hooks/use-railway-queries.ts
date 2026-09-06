"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getRailwaySections,
  getRailwaySectionById,
  getAssets,
  getAssetById,
  createAsset,
  updateAsset,
  deleteAsset,
  getMaintenanceTasks,
  getMaintenanceTaskById,
  createMaintenanceTask,
  updateMaintenanceTask,
  deleteMaintenanceTask,
  getTrains,
  getTrainById,
  getTrackedTrainOperations,
  getTrainSchedules,
  getPaginatedTrainSchedules,
  getTrainScheduleById,
  getTrainMovements,
  getBlockWindows,
  createBlockWindow,
  patchMaintenanceTask,
  getBlockWindowById,
  checkBlockConflict,
  getFeasibleWindows,
  getBlockRecommendation,
  updateBlockWindowFull,
  applyBlockRecommendation,
} from "@/actions";
import {
  CreateAssetInput,
  UpdateAssetInput,
  CreateMaintenanceTaskInput,
  UpdateMaintenanceTaskInput,
  CreateTrainScheduleInput,
  UpdateTrainScheduleInput,
  GetTrainSchedulesParams,
  CreateTrainMovementInput,
  ConflictCheckInput,
  CreateBlockWindowInput,
  FeasibleWindowsRequest,
  BlockWindowPutPayload,
  GetTrainOperationsParams,
} from "@/types";

// ==========================================
// 30 Minutes Caching Configuration (TanStack Query)
// ==========================================
// 30 minutes in milliseconds = 30 * 60 * 1000 = 1,800,000 ms
export const TIMETABLE_STALE_TIME = 30 * 60 * 1000;
// 60 minutes garbage collection time retention
export const TIMETABLE_GC_TIME = 60 * 60 * 1000;

// ==========================================
// Sections Queries
// ==========================================

export function useRailwaySections() {
  return useQuery({
    queryKey: ["sections"],
    queryFn: async () => {
      const res = await getRailwaySections();
      if (!res.success) throw new Error(res.error || "Failed to fetch railway sections");
      return res.data ?? [];
    },
    staleTime: TIMETABLE_STALE_TIME,
    gcTime: TIMETABLE_GC_TIME,
    refetchOnWindowFocus: false,
  });
}

export function useRailwaySection(id?: number | string | null) {
  return useQuery({
    queryKey: ["sections", id],
    queryFn: async () => {
      if (!id) return null;
      const res = await getRailwaySectionById(id);
      if (!res.success) throw new Error(res.error || `Failed to fetch section #${id}`);
      return res.data ?? null;
    },
    enabled: !!id,
    staleTime: TIMETABLE_STALE_TIME,
    gcTime: TIMETABLE_GC_TIME,
    refetchOnWindowFocus: false,
  });
}

// ==========================================
// Assets Queries
// ==========================================

export function useAssets() {
  return useQuery({
    queryKey: ["assets"],
    queryFn: async () => {
      const res = await getAssets();
      if (!res.success) throw new Error(res.error || "Failed to fetch assets");
      return res.data ?? [];
    },
  });
}

export function useAsset(id?: number | string | null) {
  return useQuery({
    queryKey: ["assets", id],
    queryFn: async () => {
      if (!id) return null;
      const res = await getAssetById(id);
      if (!res.success) throw new Error(res.error || `Failed to fetch asset #${id}`);
      return res.data ?? null;
    },
    enabled: !!id,
  });
}

export function useCreateAsset() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreateAssetInput) => {
      const res = await createAsset(data);
      if (!res.success) throw new Error(res.error || "Failed to create asset");
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["assets"] });
    },
  });
}

export function useUpdateAsset() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: number | string; data: CreateAssetInput }) => {
      const res = await updateAsset(id, data);
      if (!res.success) throw new Error(res.error || `Failed to update asset #${id}`);
      return res.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["assets"] });
      queryClient.invalidateQueries({ queryKey: ["assets", variables.id] });
    },
  });
}

export function useDeleteAsset() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number | string) => {
      const res = await deleteAsset(id);
      if (!res.success) throw new Error(res.error || `Failed to delete asset #${id}`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["assets"] });
    },
  });
}

// ==========================================
// Maintenance Tasks Queries
// ==========================================

export function useMaintenanceTasks() {
  return useQuery({
    queryKey: ["maintenance-tasks"],
    queryFn: async () => {
      const res = await getMaintenanceTasks();
      if (!res.success) throw new Error(res.error || "Failed to fetch maintenance tasks");
      return res.data ?? [];
    },
  });
}

export function useMaintenanceTask(id?: number | string | null) {
  return useQuery({
    queryKey: ["maintenance-tasks", id],
    queryFn: async () => {
      if (!id) return null;
      const res = await getMaintenanceTaskById(id);
      if (!res.success) throw new Error(res.error || `Failed to fetch task #${id}`);
      return res.data ?? null;
    },
    enabled: !!id,
  });
}

export function useCreateMaintenanceTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreateMaintenanceTaskInput) => {
      const res = await createMaintenanceTask(data);
      if (!res.success) throw new Error(res.error || "Failed to create maintenance task");
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["maintenance-tasks"] });
    },
  });
}

export function useUpdateMaintenanceTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: number | string; data: CreateMaintenanceTaskInput }) => {
      const res = await updateMaintenanceTask(id, data);
      if (!res.success) throw new Error(res.error || `Failed to update maintenance task #${id}`);
      return res.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["maintenance-tasks"] });
      queryClient.invalidateQueries({ queryKey: ["maintenance-tasks", variables.id] });
    },
  });
}

export function useDeleteMaintenanceTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number | string) => {
      const res = await deleteMaintenanceTask(id);
      if (!res.success) throw new Error(res.error || `Failed to delete maintenance task #${id}`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["maintenance-tasks"] });
    },
  });
}

// ==========================================
// Trains Queries
// ==========================================

export function useTrains() {
  return useQuery({
    queryKey: ["trains"],
    queryFn: async () => {
      const res = await getTrains();
      if (!res.success) throw new Error(res.error || "Failed to fetch trains");
      return res.data ?? [];
    },
    staleTime: TIMETABLE_STALE_TIME,
    gcTime: TIMETABLE_GC_TIME,
    refetchOnWindowFocus: false,
  });
}

export function useTrain(id?: number | string | null) {
  return useQuery({
    queryKey: ["trains", id],
    queryFn: async () => {
      if (!id) return null;
      const res = await getTrainById(id);
      if (!res.success) throw new Error(res.error || `Failed to fetch train #${id}`);
      return res.data ?? null;
    },
    enabled: !!id,
    staleTime: TIMETABLE_STALE_TIME,
    gcTime: TIMETABLE_GC_TIME,
    refetchOnWindowFocus: false,
  });
}

export function useTrackedTrainOperations(params: GetTrainOperationsParams) {
  return useQuery({
    queryKey: ["train-operations", params.date, params.source, params.destination],
    queryFn: async () => {
      const res = await getTrackedTrainOperations(params);
      if (!res.success) throw new Error(res.error || "Failed to fetch tracked train operations");
      return res.data ?? null;
    },
    enabled: Boolean(params.date && params.source && params.destination),
    staleTime: TIMETABLE_STALE_TIME,
    gcTime: TIMETABLE_GC_TIME,
    refetchOnWindowFocus: false,
  });
}

// ==========================================
// Train Schedules (Master Time Table TT) Queries & Mutations
// ==========================================

export function useTrainSchedules(params?: GetTrainSchedulesParams) {
  return useQuery({
    queryKey: ["train-schedules", params],
    queryFn: async () => {
      const res = await getTrainSchedules(params);
      if (!res.success) throw new Error(res.error || "Failed to fetch train schedules");
      return res.data ?? [];
    },
    staleTime: TIMETABLE_STALE_TIME,
    gcTime: TIMETABLE_GC_TIME,
    refetchOnWindowFocus: false,
  });
}

export function usePaginatedTrainSchedules(params?: GetTrainSchedulesParams) {
  return useQuery({
    queryKey: ["train-schedules-paginated", params],
    queryFn: async () => {
      const res = await getPaginatedTrainSchedules(params);
      if (!res.success) throw new Error(res.error || "Failed to fetch paginated train schedules");
      return res.data;
    },
    staleTime: TIMETABLE_STALE_TIME,
    gcTime: TIMETABLE_GC_TIME,
    refetchOnWindowFocus: false,
  });
}

export function useTrainSchedule(id?: number | string | null) {
  return useQuery({
    queryKey: ["train-schedules", id],
    queryFn: async () => {
      if (!id) return null;
      const res = await getTrainScheduleById(id);
      if (!res.success) throw new Error(res.error || `Failed to fetch train schedule #${id}`);
      return res.data ?? null;
    },
    enabled: !!id,
    staleTime: TIMETABLE_STALE_TIME,
    gcTime: TIMETABLE_GC_TIME,
    refetchOnWindowFocus: false,
  });
}


// ==========================================
// Train Movements Queries & Mutations
// ==========================================

export function useTrainMovements() {
  return useQuery({
    queryKey: ["train-movements"],
    queryFn: async () => {
      const res = await getTrainMovements();
      if (!res.success) throw new Error(res.error || "Failed to fetch train movements");
      return res.data ?? [];
    },
    staleTime: TIMETABLE_STALE_TIME,
    gcTime: TIMETABLE_GC_TIME,
    refetchOnWindowFocus: false,
  });
}

// ==========================================
// Block Windows Queries & Mutations
// ==========================================

export function useBlockWindows() {
  return useQuery({
    queryKey: ["blocks"],
    queryFn: async () => {
      const res = await getBlockWindows();
      if (!res.success) throw new Error(res.error || "Failed to fetch block windows");
      return res.data ?? [];
    },
  });
}

export function useBlockWindow(id?: number | string | null) {
  return useQuery({
    queryKey: ["blocks", id],
    queryFn: async () => {
      if (!id) return null;
      const res = await getBlockWindowById(id);
      if (!res.success) throw new Error(res.error || `Failed to fetch block #${id}`);
      return res.data ?? null;
    },
    enabled: !!id,
  });
}

export function useCreateBlockWindow() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreateBlockWindowInput) => {
      const res = await createBlockWindow(data);
      if (!res.success) throw new Error(res.error || "Failed to create block window");
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["blocks"] });
    },
  });
}

export function usePatchMaintenanceTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: number | string; data: UpdateMaintenanceTaskInput }) => {
      const res = await patchMaintenanceTask(id, data);
      if (!res.success) throw new Error(res.error || `Failed to update task #${id}`);
      return res.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["maintenance-tasks"] });
      queryClient.invalidateQueries({ queryKey: ["maintenance-tasks", variables.id] });
    },
  });
}

export function useCheckBlockConflict() {
  return useMutation({
    mutationFn: async (data: ConflictCheckInput) => {
      const res = await checkBlockConflict(data);
      if (!res.success) throw new Error(res.error || "Failed to check conflict");
      return res.data;
    },
  });
}

/** Phase 1: Search for feasible maintenance windows by task + date (new API) */
export function useFeasibleWindows() {
  return useMutation({
    mutationFn: async (data: FeasibleWindowsRequest) => {
      const res = await getFeasibleWindows(data);
      if (!res.success) throw new Error(res.error || "Failed to calculate feasible windows");
      return res.data;
    },
  });
}

// ==========================================
// Phase 3: AI Recommendation & Rescheduling
// ==========================================

/**
 * Continuously fetches AI recommendation for an existing block window.
 * Refetches every 60 seconds to detect new conflicts as timetable changes.
 */
export function useBlockRecommendation(
  blockWindowId: number | string | null | undefined,
  taskId?: string
) {
  return useQuery({
    queryKey: ["block-recommendation", blockWindowId, taskId],
    queryFn: async () => {
      if (!blockWindowId) return null;
      const res = await getBlockRecommendation(blockWindowId, taskId);
      if (!res.success) throw new Error(res.error || `Failed to fetch recommendation for block #${blockWindowId}`);
      return res.data ?? null;
    },
    enabled: !!blockWindowId,
    refetchInterval: 60 * 1000, // Re-check every 60 seconds
    refetchOnWindowFocus: true,
    staleTime: 30 * 1000,
  });
}

/** Applies the AI-recommended slot via PUT on the block window */
export function useUpdateBlockWindow() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: number | string;
      data: BlockWindowPutPayload;
    }) => {
      const res = await updateBlockWindowFull(id, data);
      if (!res.success) throw new Error(res.error || `Failed to update block window #${id}`);
      return res.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["blocks"] });
      queryClient.invalidateQueries({ queryKey: ["blocks", variables.id] });
      queryClient.invalidateQueries({ queryKey: ["block-recommendation", variables.id] });
    },
  });
}

/** Phase 3C: 1-Click Auto-Apply endpoint mutation */
export function useApplyBlockRecommendation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      blockWindowId,
      taskId,
    }: {
      blockWindowId: number | string;
      taskId?: string;
    }) => {
      const res = await applyBlockRecommendation(blockWindowId, taskId);
      if (!res.success) throw new Error(res.error || `Failed to apply recommendation for block #${blockWindowId}`);
      return res.data?.block_window;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["blocks"] });
      queryClient.invalidateQueries({ queryKey: ["blocks", variables.blockWindowId] });
      queryClient.invalidateQueries({ queryKey: ["block-recommendation", variables.blockWindowId] });
    },
  });
}
