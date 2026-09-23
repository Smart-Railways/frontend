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
  is_delayed?: boolean;
  checklist?: MaintenanceChecklistItem[];
  started_at?: string | null;
  completion_remark?: string | null;
  completed_at?: string | null;
  cancellation_remark?: string | null;
  cancelled_at?: string | null;
  logged_at?: string;
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
