/**
 * Maintenance Plan Enums & Choices Reference
 * Model: apps.planning.models.MaintenancePlan
 * Field: status
 */

export enum MaintenancePlanStatus {
  DRAFT = "DRAFT",
  PENDING_APPROVAL = "PENDING_APPROVAL",
  APPROVED = "APPROVED",
  REJECTED = "REJECTED",
  IN_PROGRESS = "IN_PROGRESS",
  COMPLETED = "COMPLETED",
  CANCELLED = "CANCELLED",
}

export const MAINTENANCE_PLAN_STATUS_LABELS: Record<MaintenancePlanStatus, string> = {
  [MaintenancePlanStatus.DRAFT]: "Draft",
  [MaintenancePlanStatus.PENDING_APPROVAL]: "Pending Approval",
  [MaintenancePlanStatus.APPROVED]: "Approved",
  [MaintenancePlanStatus.REJECTED]: "Rejected",
  [MaintenancePlanStatus.IN_PROGRESS]: "In Progress",
  [MaintenancePlanStatus.COMPLETED]: "Completed",
  [MaintenancePlanStatus.CANCELLED]: "Cancelled",
};

export const MAINTENANCE_PLAN_STATUS_DESCRIPTIONS: Record<MaintenancePlanStatus, string> = {
  [MaintenancePlanStatus.DRAFT]:
    "Initial proposed plan generated manually or by planning engine",
  [MaintenancePlanStatus.PENDING_APPROVAL]:
    "Submitted for section controller / engineer review",
  [MaintenancePlanStatus.APPROVED]:
    "Approved by section controller; marks linked task as SCHEDULED",
  [MaintenancePlanStatus.REJECTED]:
    "Proposal rejected due to timetable conflicts or operational reasons",
  [MaintenancePlanStatus.IN_PROGRESS]:
    "Maintenance activity is actively being executed on site",
  [MaintenancePlanStatus.COMPLETED]: "Maintenance activity completed successfully",
  [MaintenancePlanStatus.CANCELLED]: "Plan was retracted or aborted",
};
