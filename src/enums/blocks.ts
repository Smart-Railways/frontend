/**
 * Block Window Enums & Choices Reference
 * Model: apps.blocks.models.BlockWindow
 * Field: status
 */

export enum BlockStatus {
  AVAILABLE = "AVAILABLE",
  RESERVED = "RESERVED",
  BLOCKED = "BLOCKED",
}

export const BLOCK_STATUS_LABELS: Record<BlockStatus, string> = {
  [BlockStatus.AVAILABLE]: "Available",
  [BlockStatus.RESERVED]: "Reserved",
  [BlockStatus.BLOCKED]: "Blocked",
};

export const BLOCK_STATUS_DESCRIPTIONS: Record<BlockStatus, string> = {
  [BlockStatus.AVAILABLE]: "The section window is open and available for maintenance scheduling",
  [BlockStatus.RESERVED]: "The block window has been provisionally reserved for planning/approval",
  [BlockStatus.BLOCKED]: "Corridor is blocked / occupied; maintenance execution in effect",
};
