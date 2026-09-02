"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getRailwaySections,
  getRailwaySectionById,
  getAssets,
  getAssetById,
  getMaintenanceTasks,
  getMaintenanceTaskById,
  getTrains,
  getTrainById,
  getTrainMovements,
  getTrainMovementById,
  createTrainMovement,
  getBlockWindows,
  getBlockWindowById,
  checkBlockConflict,
  getFeasibleWindows,
} from "@/actions";
import {
  CreateTrainMovementInput,
  ConflictCheckInput,
  FeasibleWindowsInput,
} from "@/types";

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
  });
}

export function useTrainMovement(id?: number | string | null) {
  return useQuery({
    queryKey: ["train-movements", id],
    queryFn: async () => {
      if (!id) return null;
      const res = await getTrainMovementById(id);
      if (!res.success) throw new Error(res.error || `Failed to fetch train movement #${id}`);
      return res.data ?? null;
    },
    enabled: !!id,
  });
}

export function useCreateTrainMovement() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreateTrainMovementInput) => {
      const res = await createTrainMovement(data);
      if (!res.success) throw new Error(res.error || "Failed to create train movement");
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["train-movements"] });
    },
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

export function useCheckBlockConflict() {
  return useMutation({
    mutationFn: async (data: ConflictCheckInput) => {
      const res = await checkBlockConflict(data);
      if (!res.success) throw new Error(res.error || "Failed to check conflict");
      return res.data;
    },
  });
}

export function useFeasibleWindows() {
  return useMutation({
    mutationFn: async (data: FeasibleWindowsInput) => {
      const res = await getFeasibleWindows(data);
      if (!res.success) throw new Error(res.error || "Failed to calculate feasible windows");
      return res.data;
    },
  });
}
