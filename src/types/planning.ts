import { MaintenancePlanStatus } from "@/enums/planning";
export { MaintenancePlanStatus };

export interface MaintenancePlan {
  id?: number;
  plan_id: string;
  title: string;
  section: number;
  section_name?: string;
  task: number;
  task_code?: string;
  block_window: number;
  planned_start_time: string;
  planned_end_time: string;
  status: MaintenancePlanStatus | string;
  created_at?: string;
  updated_at?: string;
}

export interface CreateMaintenancePlanInput {
  plan_id?: string;
  title: string;
  section: number;
  task: number;
  block_window: number;
  planned_start_time: string;
  planned_end_time: string;
  status?: MaintenancePlanStatus | string;
}

export interface UpdateMaintenancePlanInput {
  title?: string;
  section?: number;
  task?: number;
  block_window?: number;
  planned_start_time?: string;
  planned_end_time?: string;
  status?: MaintenancePlanStatus | string;
}
