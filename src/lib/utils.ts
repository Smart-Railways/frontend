import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export {
  formatTrainTimeIST,
  formatTimeString,
  formatDateToISO,
  formatDisplayDate,
  formatDelayMetric,
  calculateTimeDuration,
  type DelayMetric,
} from "./time-utils";
export { getTrainTypeTheme, type TrainTypeTheme } from "./train-theme";


