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
