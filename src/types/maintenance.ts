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
  logged_at?: string;
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
