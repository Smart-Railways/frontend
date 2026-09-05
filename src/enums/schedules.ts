/**
 * Schedule Running Days Enums & Choices Reference
 * Model: apps.trains.models.TrainSchedule
 * Field: running_days (7-character binary string representing Monday to Sunday)
 */

export enum RunningDaysPattern {
  DAILY = "1111111",
  WEEKDAY = "1111100",
  WEEKEND = "0000011",
  MON_ONLY = "1000000",
  FRI_ONLY = "0000100",
}

export const RUNNING_DAYS_LABELS: Record<RunningDaysPattern, string> = {
  [RunningDaysPattern.DAILY]: "Daily service (Runs every day)",
  [RunningDaysPattern.WEEKDAY]: "Weekday service (Mon-Fri)",
  [RunningDaysPattern.WEEKEND]: "Weekend service (Sat-Sun)",
  [RunningDaysPattern.MON_ONLY]: "Weekly service (Mondays only)",
  [RunningDaysPattern.FRI_ONLY]: "Weekly service (Fridays only)",
};

export const RUNNING_DAYS_ACTIVE_DAYS: Record<RunningDaysPattern, string> = {
  [RunningDaysPattern.DAILY]: "Mon, Tue, Wed, Thu, Fri, Sat, Sun",
  [RunningDaysPattern.WEEKDAY]: "Mon, Tue, Wed, Thu, Fri",
  [RunningDaysPattern.WEEKEND]: "Sat, Sun",
  [RunningDaysPattern.MON_ONLY]: "Mon",
  [RunningDaysPattern.FRI_ONLY]: "Fri",
};

export const RUNNING_DAYS_OPTIONS = [
  {
    value: RunningDaysPattern.DAILY,
    label: "Daily (All 7 Days)",
    pattern: RunningDaysPattern.DAILY,
    days: RUNNING_DAYS_ACTIVE_DAYS[RunningDaysPattern.DAILY],
  },
  {
    value: RunningDaysPattern.WEEKDAY,
    label: "Weekdays (Mon - Fri)",
    pattern: RunningDaysPattern.WEEKDAY,
    days: RUNNING_DAYS_ACTIVE_DAYS[RunningDaysPattern.WEEKDAY],
  },
  {
    value: RunningDaysPattern.WEEKEND,
    label: "Weekends (Sat - Sun)",
    pattern: RunningDaysPattern.WEEKEND,
    days: RUNNING_DAYS_ACTIVE_DAYS[RunningDaysPattern.WEEKEND],
  },
  {
    value: RunningDaysPattern.MON_ONLY,
    label: "Mondays Only",
    pattern: RunningDaysPattern.MON_ONLY,
    days: RUNNING_DAYS_ACTIVE_DAYS[RunningDaysPattern.MON_ONLY],
  },
  {
    value: RunningDaysPattern.FRI_ONLY,
    label: "Fridays Only",
    pattern: RunningDaysPattern.FRI_ONLY,
    days: RUNNING_DAYS_ACTIVE_DAYS[RunningDaysPattern.FRI_ONLY],
  },
];
