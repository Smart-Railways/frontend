import { BlockStatus } from "@/enums/blocks";
export { BlockStatus };

// ==========================================
// Shared
// ==========================================

export interface SectionSummary {
  id: number;
  name: string;
  source: string;
  source_code: string;
  destination: string;
  destination_code: string;
}

// ==========================================
// Block Windows
// ==========================================

export interface BlockWindow {
  id: number;
  section: number;
  section_name?: string;
  start_time: string;
  end_time: string;
  status: BlockStatus | string;
}

export interface CreateBlockWindowInput {
  section: number;
  start_time: string;
  end_time: string;
  status?: BlockStatus | string;
}

export interface UpdateBlockWindowInput {
  section?: number;
  start_time?: string;
  end_time?: string;
  status?: BlockStatus | string;
}

/** Full replacement payload for PUT /block-windows/{id}/ */
export interface BlockWindowPutPayload {
  section: number;
  start_time: string;
  end_time: string;
  status: string;
}

// ==========================================
// Conflict Check
// ==========================================

export interface ConflictCheckInput {
  section: number;
  maintenance_start: string;
  maintenance_end: string;
}

export interface ConflictTrainMovement {
  train_number: string;
  train_name: string;
  entry_time: string;
  exit_time: string;
}

export interface ConflictCheckResponse {
  has_conflict: boolean;
  conflict_count: number;
  conflicts: ConflictTrainMovement[];
}

// ==========================================
// Feasible Windows — Phase 1 (new date-based API)
// ==========================================

/** New request shape: task_id + date (no block_window_id needed) */
export interface FeasibleWindowsRequest {
  task_id: string;
  date: string; // YYYY-MM-DD
}

/**
 * @deprecated Use FeasibleWindowsRequest instead.
 * Kept for backward compatibility during migration.
 */
export interface FeasibleWindowsInput {
  task_id: string;
  block_window_id: number;
  block_id?: number;
}

export interface FeasibleWindowSlot {
  start: string;
  end: string;
  duration_minutes: number;
  /** Guaranteed non-null from the new API (0.0 – 1.0) */
  decision_score: number;
  algorithm: "CP-SAT Constraint Solver" | "Database Timestamp Gap" | string;
}

export interface FeasibleWindowsResponse {
  task_id: string;
  date: string;
  /** Full section object (new API). Use `.name` for display. */
  section: SectionSummary;
  required_duration_minutes: number;
  feasible: boolean;
  windows: FeasibleWindowSlot[];
}

// ==========================================
// AI Recommendation — Phase 3
// ==========================================

export interface CurrentSlotInfo {
  start_time: string;
  end_time: string;
  duration_minutes: number;
  status: string;
  has_conflict: boolean;
  conflict_count: number;
  conflicts: ConflictTrainMovement[];
}

export interface BlockRecommendationResponse {
  block_window_id: number;
  task_id: string | null;
  section: SectionSummary;
  current_slot: CurrentSlotInfo;
  has_better_slot: boolean;
  recommendation_reason: string;
  recommended_slot: FeasibleWindowSlot | null;
  suggested_put_payload: BlockWindowPutPayload | null;
  put_url: string;
}

// Aliases matching FRONTEND_AI_RECOMMENDATION_GUIDE naming conventions
export type FeasibleWindowItem = FeasibleWindowSlot;
export type CreateBlockWindowPayload = CreateBlockWindowInput;
export type ConflictTrain = ConflictTrainMovement;
