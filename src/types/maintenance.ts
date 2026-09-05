import { MaintenancePriority, MaintenanceStatus } from "@/enums/maintenance";
export { MaintenancePriority, MaintenanceStatus };

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
