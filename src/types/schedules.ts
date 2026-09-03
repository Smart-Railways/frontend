export interface TrainSchedule {
  id: number;
  train: number;
  train_name?: string;
  train_number?: string;
  section: number;
  section_name?: string;
  scheduled_entry_time: string;
  scheduled_exit_time: string;
  running_days?: string;
  is_active?: boolean;
}

export interface CreateTrainScheduleInput {
  train: number;
  section: number;
  scheduled_entry_time: string;
  scheduled_exit_time: string;
  running_days?: string;
  is_active?: boolean;
}

export interface UpdateTrainScheduleInput {
  train?: number;
  section?: number;
  scheduled_entry_time?: string;
  scheduled_exit_time?: string;
  running_days?: string;
  is_active?: boolean;
}
