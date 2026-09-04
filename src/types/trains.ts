export type TrainType =
  | "PASSENGER"
  | "EXPRESS"
  | "RAJDHANI"
  | "VB"
  | "SHATABDI"
  | "FREIGHT";

export interface Train {
  id: number;
  train_number: string;
  name: string;
  train_type: TrainType | string;
  priority: number;
}

export interface CreateTrainInput {
  train_number: string;
  name: string;
  train_type: TrainType | string;
  priority?: number;
}

export interface UpdateTrainInput {
  train_number?: string;
  name?: string;
  train_type?: TrainType | string;
  priority?: number;
}

export interface TrackedTrainSection {
  name: string;
  source: string;
  source_code: string;
  destination: string;
  destination_code: string;
}

export interface TrackedTrainSchedule {
  entry_time: string;
  exit_time: string;
}

export interface TrackedTrainMovement {
  actual_entry_time: string | null;
  actual_exit_time: string | null;
}

export interface TrackedTrainOperation {
  train_number: string;
  train_name: string;
  train_type: string;
  priority: number;
  section: TrackedTrainSection;
  schedule: TrackedTrainSchedule;
  movement: TrackedTrainMovement | null;
  delay_minutes: number | null;
}

export interface TrainOperationsResponse {
  date: string;
  source: string;
  destination: string;
  count: number;
  trains: TrackedTrainOperation[];
}

export interface GetTrainOperationsParams {
  date: string;
  source: string;
  destination: string;
}
