export type Severity = "low" | "medium" | "high" | "critical";

export type SignalStatus = "active" | "maintenance" | "conflict" | "optimal" | "idle";

export interface MetricCardData {
  id: string;
  title: string;
  value: string | number;
  subtitle: string;
  trend?: {
    direction: "up" | "down" | "neutral";
    value: string;
  };
  iconName: "train" | "alert" | "brain" | "clock" | "shield";
  accentColor: "signal-green" | "critical-red" | "railway-blue" | "maintenance-amber";
  sparklineData: number[];
}

export interface NetworkStation {
  id: string;
  name: string;
  code: string;
  x: number; // Percentage coordinate for SVG/Canvas
  y: number;
  status: "normal" | "congested" | "maintenance" | "critical";
  activeTrains?: number;
}

export interface NetworkCorridor {
  id: string;
  source: string;
  target: string;
  status: "active" | "maintenance" | "high-activity" | "low-activity" | "critical";
  trafficDensity: number; // 0 - 100
  activeBlocks?: number;
}

export interface AIRecommendation {
  id: string;
  title: string;
  description: string;
  badgeText: string;
  badgeVariant: "high-impact" | "optimized" | "recommended";
  iconType: "star" | "combine" | "clock";
  slotTime?: string;
  savingsMinutes?: number;
}

export interface CriticalAlert {
  id: string;
  title: string;
  description: string;
  timestamp: string;
  severity: "critical" | "high" | "medium";
  category: "conflict" | "congestion" | "resource";
}

export interface MaintenanceBlock {
  id: string;
  corridorName: string;
  startHour: number; // 0 - 24
  durationHours: number;
  type: "scheduled" | "emergency" | "inspection" | "welding";
  status: "active" | "pending" | "critical-conflict";
}

export interface DisruptionSummary {
  totalTrains: number;
  lowImpactCount: number;
  lowImpactPercentage: number;
  mediumImpactCount: number;
  mediumImpactPercentage: number;
  highImpactCount: number;
  highImpactPercentage: number;
}

export interface OptimizationImpactStat {
  label: string;
  value: string;
  unit?: string;
  trend: "up" | "down";
  color: "signal-green" | "maintenance-amber" | "railway-blue";
  bars: number[]; // mini bar chart values (height percentage 0-100)
}

export interface AIEngineStatus {
  isActive: boolean;
  lastRunTime: string;
  corridorsAnalyzed: number;
  constraintsChecked: number;
  combinationsTested: number;
}
