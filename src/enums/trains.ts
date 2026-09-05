/**
 * Train Enums & Choices Reference
 * Model: apps.trains.models.Train
 * Field: train_type
 */

export enum TrainType {
  VB = "VB",
  SHATABDI = "SHATABDI",
  RAJDHANI = "RAJDHANI",
  EXPRESS = "EXPRESS",
  PASSENGER = "PASSENGER",
  FREIGHT = "FREIGHT",
}

export const TRAIN_TYPE_LABELS: Record<TrainType, string> = {
  [TrainType.VB]: "Vande Bharat",
  [TrainType.SHATABDI]: "Shatabdi",
  [TrainType.RAJDHANI]: "Rajdhani",
  [TrainType.EXPRESS]: "Express",
  [TrainType.PASSENGER]: "Passenger",
  [TrainType.FREIGHT]: "Freight",
};

export const TRAIN_TYPE_DEFAULT_PRIORITIES: Record<TrainType, number> = {
  [TrainType.VB]: 10,
  [TrainType.SHATABDI]: 10,
  [TrainType.RAJDHANI]: 10,
  [TrainType.EXPRESS]: 8,
  [TrainType.PASSENGER]: 5,
  [TrainType.FREIGHT]: 5,
};

export const TRAIN_TYPE_DESCRIPTIONS: Record<TrainType, string> = {
  [TrainType.VB]: "Semi-high speed premium Vande Bharat train sets",
  [TrainType.SHATABDI]: "Superfast day express (Shatabdi, Jan Shatabdi)",
  [TrainType.RAJDHANI]:
    "High-priority long-distance express connecting national capital",
  [TrainType.EXPRESS]:
    "Premium & standard express services (Duronto, Humsafar, Superfast, Mail)",
  [TrainType.PASSENGER]: "Ordinary passenger and local shuttle services",
  [TrainType.FREIGHT]: "Goods, container, and freight rake movements",
};

export const TRAIN_TYPE_OPTIONS = [
  { value: TrainType.VB, label: TRAIN_TYPE_LABELS[TrainType.VB], priority: 10 },
  { value: TrainType.SHATABDI, label: TRAIN_TYPE_LABELS[TrainType.SHATABDI], priority: 10 },
  { value: TrainType.RAJDHANI, label: TRAIN_TYPE_LABELS[TrainType.RAJDHANI], priority: 10 },
  { value: TrainType.EXPRESS, label: TRAIN_TYPE_LABELS[TrainType.EXPRESS], priority: 8 },
  { value: TrainType.PASSENGER, label: TRAIN_TYPE_LABELS[TrainType.PASSENGER], priority: 5 },
  { value: TrainType.FREIGHT, label: TRAIN_TYPE_LABELS[TrainType.FREIGHT], priority: 5 },
];
