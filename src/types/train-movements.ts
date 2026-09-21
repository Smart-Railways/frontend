import { PaginatedResponse } from "./common";

export interface TrainMovement {
  id: number;
  schedule?: number;
  service_date?: string;
  actual_entry_time?: string | null;
  actual_exit_time?: string | null;
  train?: number | string;
  train_number?: string;
  train_name?: string;
  section?: number | string;
  section_name?: string;
  scheduled_entry_time?: string;
  scheduled_exit_time?: string;
  estimated_entry_time?: string;
  estimated_exit_time?: string;
  delay_minutes?: number | null;
  status_label?: string | null;
  last_live_update?: string | null;
  entry_time?: string;
  exit_time?: string;
}

export interface GetTrainMovementsParams {
  date?: string;
  from?: string;
  to?: string;
  page?: number;
  page_size?: number;
}

export type PaginatedTrainMovementsResponse = PaginatedResponse<TrainMovement>;

export interface CreateTrainMovementInput {
  schedule?: number;
  service_date?: string;
  actual_entry_time?: string | null;
  actual_exit_time?: string | null;
  train?: number;
  section?: number;
  entry_time?: string;
  exit_time?: string;
}

export interface UpdateTrainMovementInput {
  schedule?: number;
  service_date?: string;
  actual_entry_time?: string | null;
  actual_exit_time?: string | null;
  train?: number;
  section?: number;
  entry_time?: string;
  exit_time?: string;
}
