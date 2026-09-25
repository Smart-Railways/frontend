import { MaintenancePriority, MaintenanceStatus } from "@/enums/maintenance";
export { MaintenancePriority, MaintenanceStatus };

export interface LinkedBlockWindow {
  id: number;
  section?: number;
  section_name?: string | null;
  date?: string | null;
  start_time: string;
  end_time: string;
  duration_minutes?: number | null;
  status: string;
}

export interface MaintenanceTask {
  id: number;
  task_code: string;
  asset: number;
  asset_name?: string;
  section_name?: string;
  details: string;
  risk_rating: number;
  urgency: MaintenancePriority | string;
  deadline: string;
  estimated_duration: number;
  task_status?: MaintenanceStatus | string;
  block_window?: LinkedBlockWindow | null;
  block_window_date?: string | null;
  /** Shared block window ID when this task belongs to a combined maintenance batch. */
  shared_block_window_id?: number | null;
  is_delayed?: boolean;
  checklist?: MaintenanceChecklistItem[];
  started_at?: string | null;
  completion_remark?: string | null;
  completed_at?: string | null;
  cancellation_remark?: string | null;
  cancelled_at?: string | null;
  logged_at?: string;
}

/** A task returned as part of a shared maintenance batch. */
export interface MaintenanceBatchTask {
  id: number;
  task_id: string;
  asset_id: number;
  asset_name: string;
  description: string;
  due_date: string;
  duration_minutes: number;
  priority: MaintenancePriority | string;
  status: MaintenanceStatus | string;
}

export interface MaintenanceBatch {
  id: number;
  section: number;
  section_name: string;
  status: string;
  start_time: string;
  end_time: string;
  duration_minutes: number;
  block_window: LinkedBlockWindow;
  tasks: MaintenanceBatchTask[];
  created_at: string;
  updated_at: string;
}

export interface CombinedBlockRecommendationInput {
  task_id: string;
  nearby_days: number;
  apply: boolean;
}

export interface CombinedRecommendationTask {
  id: number;
  task_id: string;
  asset: string;
  due_date: string;
  duration_minutes: number;
}

export interface CombinedBlockRecommendationResponse {
  combined_eligible: boolean;
  reason_code?: "NO_NEARBY_COMPATIBLE_TASKS";
  message?: string;
  section: { id: number; name: string };
  minimum_task_count?: number;
  task_count: number;
  tasks: CombinedRecommendationTask[];
  applied: boolean;
  batch_id: number | null;
  block_window: LinkedBlockWindow | null;
  recommended_slot: {
    start: string;
    end: string;
    duration_minutes: number;
    decision_score: number | null;
  } | null;
}

export interface MaintenanceChecklistItem {
  item: string;
  completed: boolean;
}

export interface MaintenanceLog {
  id: number;
  task?: number;
  task_code?: string;
  logged_at: string;
  event: string;
  status: string;
  remark?: string | null;
  details?: { checklist?: MaintenanceChecklistItem[]; [key: string]: unknown };
}

export interface CreateMaintenanceTaskInput {
  task_code: string;
  asset: number;
  details: string;
  risk_rating: number;
  urgency: MaintenancePriority | string;
  deadline: string;
  estimated_duration: number;
  task_status?: MaintenanceStatus | string;
}

export interface UpdateMaintenanceTaskInput {
  task_code?: string;
  asset?: number;
  details?: string;
  risk_rating?: number;
  urgency?: MaintenancePriority | string;
  deadline?: string;
  estimated_duration?: number;
  task_status?: MaintenanceStatus | string;
}
