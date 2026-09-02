export interface TrainMovement {
  id: number;
  train: number;
  train_number?: string;
  train_name?: string;
  section: number;
  section_name?: string;
  entry_time: string;
  exit_time: string;
}

export interface CreateTrainMovementInput {
  train: number;
  section: number;
  entry_time: string;
  exit_time: string;
}

export interface UpdateTrainMovementInput {
  train?: number;
  section?: number;
  entry_time?: string;
  exit_time?: string;
}
