export type BlockStatus = "AVAILABLE" | "RESERVED" | "BLOCKED";

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

export interface FeasibleWindowsInput {
  task_id: string;
  block_window_id: number;
  block_id?: number;
}

export interface FeasibleWindowSlot {
  start: string;
  end: string;
  duration_minutes: number;
}

export interface FeasibleWindowsResponse {
  task_id: string;
  block_window_id: number;
  block_id?: number;
  section: string;
  required_duration_minutes: number;
  feasible: boolean;
  windows: FeasibleWindowSlot[];
}
