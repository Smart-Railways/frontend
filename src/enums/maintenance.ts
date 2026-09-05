/**
 * Maintenance Enums & Choices Reference
 * Model: apps.maintenance.models.MaintenanceTask
 * Fields: priority (urgency), status (task_status)
 */

export enum MaintenancePriority {
  CRITICAL = "CRITICAL",
  HIGH = "HIGH",
  MEDIUM = "MEDIUM",
  LOW = "LOW",
}

export const MAINTENANCE_PRIORITY_LABELS: Record<MaintenancePriority, string> = {
  [MaintenancePriority.CRITICAL]: "Critical",
  [MaintenancePriority.HIGH]: "High",
  [MaintenancePriority.MEDIUM]: "Medium",
  [MaintenancePriority.LOW]: "Low",
};

export const MAINTENANCE_PRIORITY_WEIGHTS: Record<MaintenancePriority, number> = {
  [MaintenancePriority.CRITICAL]: 40.0,
  [MaintenancePriority.HIGH]: 30.0,
  [MaintenancePriority.MEDIUM]: 20.0,
  [MaintenancePriority.LOW]: 10.0,
};

export const MAINTENANCE_PRIORITY_DESCRIPTIONS: Record<MaintenancePriority, string> = {
  [MaintenancePriority.CRITICAL]:
    "Severe safety risk or immediate operational hazard; highest priority",
  [MaintenancePriority.HIGH]:
    "Significant wear or disruption risk; requires near-term maintenance",
  [MaintenancePriority.MEDIUM]:
    "Standard routine inspection, preventive repair, or periodic check",
  [MaintenancePriority.LOW]: "Minor maintenance or aesthetic/non-critical work",
};

export enum MaintenanceStatus {
  PENDING = "PENDING",
  SCHEDULED = "SCHEDULED",
  COMPLETED = "COMPLETED",
  CANCELLED = "CANCELLED",
}

export const MAINTENANCE_STATUS_LABELS: Record<MaintenanceStatus, string> = {
  [MaintenanceStatus.PENDING]: "Pending",
  [MaintenanceStatus.SCHEDULED]: "Scheduled",
  [MaintenanceStatus.COMPLETED]: "Completed",
  [MaintenanceStatus.CANCELLED]: "Cancelled",
};

export const MAINTENANCE_STATUS_DESCRIPTIONS: Record<MaintenanceStatus, string> = {
  [MaintenanceStatus.PENDING]: "Task is created, awaiting scheduling and block allocation",
  [MaintenanceStatus.SCHEDULED]: "Block window or maintenance plan has been allocated / approved",
  [MaintenanceStatus.COMPLETED]: "Maintenance work has finished successfully",
  [MaintenanceStatus.CANCELLED]: "Task has been dismissed or superseded",
};
