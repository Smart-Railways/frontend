/**
 * Asset Department Enums & Choices Reference
 * Model: apps.assets.models.Asset
 * Field: department / division
 */

export enum AssetDepartment {
  ENGINEERING = "ENGINEERING",
  SNT = "SNT",
  TRACTION = "TRACTION",
}

export const ASSET_DEPARTMENT_LABELS: Record<AssetDepartment, string> = {
  [AssetDepartment.ENGINEERING]: "Engineering",
  [AssetDepartment.SNT]: "Signal & Telecom",
  [AssetDepartment.TRACTION]: "Traction",
};

export const ASSET_DEPARTMENT_DESCRIPTIONS: Record<AssetDepartment, string> = {
  [AssetDepartment.ENGINEERING]: "Track, rails, sleepers, ballast, civil structures, bridges",
  [AssetDepartment.SNT]: "Signaling equipment, interlocking, points, telecommunications",
  [AssetDepartment.TRACTION]: "Overhead Electrification (OHE), power supply, sub-stations, mast poles",
};

export const ASSET_DEPARTMENT_OPTIONS = [
  {
    value: AssetDepartment.SNT,
    label: "S&T (Signals & Telecom)",
    displayLabel: ASSET_DEPARTMENT_LABELS[AssetDepartment.SNT],
    desc: ASSET_DEPARTMENT_DESCRIPTIONS[AssetDepartment.SNT],
  },
  {
    value: AssetDepartment.ENGINEERING,
    label: "Engineering (Civil / Track)",
    displayLabel: ASSET_DEPARTMENT_LABELS[AssetDepartment.ENGINEERING],
    desc: ASSET_DEPARTMENT_DESCRIPTIONS[AssetDepartment.ENGINEERING],
  },
  {
    value: AssetDepartment.TRACTION,
    label: "Traction (Electrical / OHE)",
    displayLabel: ASSET_DEPARTMENT_LABELS[AssetDepartment.TRACTION],
    desc: ASSET_DEPARTMENT_DESCRIPTIONS[AssetDepartment.TRACTION],
  },
];

/**
 * Asset Category Enums & Choices Reference
 * Field: category
 */

export enum AssetCategory {
  TRACK_CIRCUIT = "TRACK_CIRCUIT",
  SIGNAL = "SIGNAL",
  POINT_MACHINE = "POINT_MACHINE",
  OVERHEAD_EQUIPMENT = "OVERHEAD_EQUIPMENT",
  AXLE_COUNTER = "AXLE_COUNTER",
  TRACK_SEGMENT = "TRACK_SEGMENT",
  INTERLOCKING = "INTERLOCKING",
  TRANSFORMER = "TRANSFORMER",
  OTHER = "OTHER",
}

export const ASSET_CATEGORY_LABELS: Record<AssetCategory, string> = {
  [AssetCategory.TRACK_CIRCUIT]: "Track Circuit",
  [AssetCategory.SIGNAL]: "Signal & Interlocking",
  [AssetCategory.POINT_MACHINE]: "Point Machine / Switch",
  [AssetCategory.OVERHEAD_EQUIPMENT]: "OHE / Traction Catenary",
  [AssetCategory.AXLE_COUNTER]: "Axle Counter",
  [AssetCategory.TRACK_SEGMENT]: "Track Segment / Rail",
  [AssetCategory.INTERLOCKING]: "Electronic Interlocking",
  [AssetCategory.TRANSFORMER]: "Traction Substation Transformer",
  [AssetCategory.OTHER]: "Other Asset",
};