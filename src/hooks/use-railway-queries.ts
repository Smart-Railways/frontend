"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getRailwaySections,
  getRailwaySectionById,
  getAssets,
  getPaginatedAssets,
  getAssetById,
  createAsset,
  updateAsset,
  deleteAsset,
  getMaintenanceTasks,
  getPaginatedMaintenanceTasks,
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
  getBlockWindowByTaskId,
  updateBlockWindowByTaskId,
  startMaintenanceTask,
  completeMaintenanceTask,
  cancelMaintenanceTask,
  getMaintenanceLogs,
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
  MaintenanceChecklistItem,
  GetTrainOperationsParams,
  GetTrainMovementsParams,
  PaginationParams,
} from "@/types";

// ==========================================
// 30 Minutes Caching Configuration (TanStack Query)
// ==========================================
// 30 minutes in milliseconds = 30 * 60 * 1000 = 1,800,000 ms
export const TIMETABLE_STALE_TIME = 30 * 60 * 1000;
// 60 minutes garbage collection time retention
export const TIMETABLE_GC_TIME = 60 * 60 * 1000;
export const LIVE_MOVEMENTS_STALE_TIME = 60 * 60 * 1000;
// Lifecycle mutations invalidate these keys, so five minutes keeps the audit UI
// responsive without serving stale data after a real maintenance action.
export const MAINTENANCE_AUDIT_STALE_TIME = 5 * 60 * 1000;
export const MAINTENANCE_AUDIT_GC_TIME = 30 * 60 * 1000;

function logAiRecommendationApi(
  endpoint: string,
  request: unknown,
  response: unknown
) {
  if (process.env.NODE_ENV !== "development") return;
  console.info(`[AI recommendation] ${endpoint}`, { request, response });
}

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

export function usePaginatedAssets(params: PaginationParams) {
  return useQuery({
    queryKey: ["assets", "paginated", params],
    queryFn: async () => {
      const res = await getPaginatedAssets(params);
      if (!res.success) throw new Error(res.error || "Failed to fetch assets");
      return res.data ?? { count: 0, next: null, previous: null, results: [] };
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
    // Mutations explicitly invalidate this query. The explicit Refresh action
    // handles manual updates, preventing calls on mount, focus, and reconnect.
    staleTime: MAINTENANCE_AUDIT_STALE_TIME,
    gcTime: MAINTENANCE_AUDIT_GC_TIME,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });
}

export function usePaginatedMaintenanceTasks(params: PaginationParams) {
  return useQuery({
    queryKey: ["maintenance-tasks", "paginated", params],
    queryFn: async () => {
      const res = await getPaginatedMaintenanceTasks(params);
      if (!res.success) throw new Error(res.error || "Failed to fetch maintenance tasks");
      return res.data ?? { count: 0, next: null, previous: null, results: [] };
    },
    refetchOnWindowFocus: false,
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
      queryClient.invalidateQueries({ queryKey: ["blocks"] });
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

export function useTrainMovements(params?: GetTrainMovementsParams) {
  return useQuery({
    queryKey: ["train-movements", params],
    queryFn: async () => {
      const res = await getTrainMovements(params);
      if (!res.success) throw new Error(res.error || "Failed to fetch train movements");
      return res.data ?? { count: 0, next: null, previous: null, results: [] };
    },
    staleTime: LIVE_MOVEMENTS_STALE_TIME,
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
    refetchOnWindowFocus: false,
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
      queryClient.invalidateQueries({ queryKey: ["maintenance-tasks"] });
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

function invalidateMaintenanceTask(queryClient: ReturnType<typeof useQueryClient>, id: number | string) {
  queryClient.invalidateQueries({ queryKey: ["maintenance-tasks"] });
  queryClient.invalidateQueries({ queryKey: ["maintenance-tasks", id] });
  queryClient.invalidateQueries({ queryKey: ["maintenance-logs", id] });
}

export function useMaintenanceLogs(taskId?: number | string | null) {
  return useQuery({
    queryKey: ["maintenance-logs", taskId],
    queryFn: async () => {
      if (!taskId) return [];
      const res = await getMaintenanceLogs(taskId);
      if (!res.success) throw new Error(res.error || "Failed to fetch maintenance audit logs");
      return res.data ?? [];
    },
    enabled: Boolean(taskId),
    staleTime: MAINTENANCE_AUDIT_STALE_TIME,
    gcTime: MAINTENANCE_AUDIT_GC_TIME,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });
}

export function useStartMaintenanceTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, checklist }: { id: number | string; checklist: MaintenanceChecklistItem[] }) => {
      const res = await startMaintenanceTask(id, checklist);
      if (!res.success) throw new Error(res.error || "Failed to start maintenance");
      return res.data;
    },
    onSuccess: (_, { id }) => invalidateMaintenanceTask(queryClient, id),
  });
}

export function useCompleteMaintenanceTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, remark }: { id: number | string; remark: string }) => {
      const res = await completeMaintenanceTask(id, remark);
      if (!res.success) throw new Error(res.error || "Failed to complete maintenance");
      return res.data;
    },
    onSuccess: (_, { id }) => invalidateMaintenanceTask(queryClient, id),
  });
}

export function useCancelMaintenanceTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, remark }: { id: number | string; remark: string }) => {
      const res = await cancelMaintenanceTask(id, remark);
      if (!res.success) throw new Error(res.error || "Failed to cancel maintenance");
      return res.data;
    },
    onSuccess: (_, { id }) => invalidateMaintenanceTask(queryClient, id),
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
      logAiRecommendationApi("POST /block-windows/recommendation/", data, res.data);
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
      logAiRecommendationApi(
        "GET /block-windows/recommendation/",
        { block_window_id: blockWindowId, task_id: taskId },
        res.data
      );
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
      logAiRecommendationApi(`PUT /block-windows/${id}/`, data, res.data);
      return res.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["blocks"] });
      queryClient.invalidateQueries({ queryKey: ["blocks", variables.id] });
      queryClient.invalidateQueries({ queryKey: ["maintenance-tasks"] });
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
      logAiRecommendationApi(
        `POST /block-windows/${blockWindowId}/recommendation/`,
        { task_id: taskId, apply: true },
        res.data
      );
      return res.data?.block_window;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["blocks"] });
      queryClient.invalidateQueries({ queryKey: ["blocks", variables.blockWindowId] });
      queryClient.invalidateQueries({ queryKey: ["maintenance-tasks"] });
      queryClient.invalidateQueries({ queryKey: ["block-recommendation", variables.blockWindowId] });
    },
  });
}

/**
 * Retrieve block window directly for a maintenance task by task_id (e.g. "TMS-190")
 */
export function useBlockWindowByTaskId(taskId?: string | null) {
  return useQuery({
    queryKey: ["blocks", "by-task", taskId],
    queryFn: async () => {
      if (!taskId) return null;
      const res = await getBlockWindowByTaskId(taskId);
      if (!res.success) return null;
      return res.data ?? null;
    },
    enabled: !!taskId,
  });
}

/**
 * Update (or create) block window directly using the maintenance task_id
 */
export function useUpdateBlockWindowByTaskId() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      taskId,
      data,
    }: {
      taskId: string;
      data: Partial<CreateBlockWindowInput> | BlockWindowPutPayload;
    }) => {
      const res = await updateBlockWindowByTaskId(taskId, data);
      if (!res.success) throw new Error(res.error || `Failed to update block window for task ${taskId}`);
      return res.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["blocks"] });
      queryClient.invalidateQueries({ queryKey: ["blocks", "by-task", variables.taskId] });
      queryClient.invalidateQueries({ queryKey: ["maintenance-tasks"] });
    },
  });
}
