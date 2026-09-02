import {
  MetricCardData,
  NetworkStation,
  NetworkCorridor,
  AIRecommendation,
  CriticalAlert,
  DisruptionSummary,
  OptimizationImpactStat,
  AIEngineStatus,
} from "@/types/dashboard";

export const METRICS_DATA: MetricCardData[] = [
  {
    id: "active-corridors",
    title: "Active Corridors",
    value: "12",
    subtitle: "of 68 Total",
    iconName: "train",
    accentColor: "signal-green",
    sparklineData: [4, 6, 8, 7, 9, 11, 10, 12],
  },
  {
    id: "critical-tasks",
    title: "Critical Tasks",
    value: "18",
    subtitle: "High Priority",
    iconName: "alert",
    accentColor: "critical-red",
    sparklineData: [12, 14, 15, 13, 16, 15, 17, 18],
  },
  {
    id: "optimization-score",
    title: "Optimization Score",
    value: "87%",
    subtitle: "AI Efficiency",
    iconName: "brain",
    accentColor: "railway-blue",
    sparklineData: [72, 75, 78, 80, 83, 85, 84, 87],
  },
  {
    id: "minutes-saved",
    title: "Minutes Saved",
    value: "4,320",
    subtitle: "vs Manual Planning",
    iconName: "clock",
    accentColor: "railway-blue",
    sparklineData: [2100, 2600, 3100, 3400, 3800, 4050, 4200, 4320],
  },
  {
    id: "success-rate",
    title: "Success Rate",
    value: "96.4%",
    subtitle: "This Month",
    iconName: "shield",
    accentColor: "signal-green",
    sparklineData: [92, 93, 94, 95.2, 94.8, 95.9, 96.1, 96.4],
  },
];

export const NETWORK_STATIONS: NetworkStation[] = [
  { id: "delhi", name: "DELHI", code: "NDLS", x: 45, y: 18, status: "congested" },
  { id: "ghaziabad", name: "GHAZIABAD", code: "GZB", x: 62, y: 22, status: "maintenance" },
  { id: "meerut", name: "MEERUT", code: "MTC", x: 74, y: 12, status: "critical" },
  { id: "aligarh", name: "ALIGARH", code: "ALJN", x: 72, y: 44, status: "normal" },
  { id: "mathura", name: "MATHURA", code: "MTJ", x: 58, y: 65, status: "maintenance" },
  { id: "bharatpur", name: "BHARATPUR", code: "BTE", x: 38, y: 76, status: "normal" },
  { id: "rewari", name: "REWARI", code: "RE", x: 28, y: 38, status: "normal" },
  { id: "jaipur", name: "JAIPUR", code: "JP", x: 18, y: 64, status: "congested" },
];

export const NETWORK_CORRIDORS: NetworkCorridor[] = [
  { id: "c1", source: "delhi", target: "ghaziabad", status: "critical", trafficDensity: 92 },
  { id: "c2", source: "ghaziabad", target: "meerut", status: "maintenance", trafficDensity: 65 },
  { id: "c3", source: "ghaziabad", target: "aligarh", status: "active", trafficDensity: 80 },
  { id: "c4", source: "aligarh", target: "mathura", status: "active", trafficDensity: 55 },
  { id: "c5", source: "delhi", target: "mathura", status: "maintenance", trafficDensity: 70 },
  { id: "c6", source: "mathura", target: "bharatpur", status: "active", trafficDensity: 40 },
  { id: "c7", source: "delhi", target: "rewari", status: "active", trafficDensity: 60 },
  { id: "c8", source: "rewari", target: "jaipur", status: "active", trafficDensity: 50 },
  { id: "c9", source: "jaipur", target: "bharatpur", status: "active", trafficDensity: 35 },
];

export const NETWORK_LEGEND = [
  { label: "Active Corridors", count: 12, color: "#10B981" },
  { label: "Maintenance Block", count: 8, color: "#F59E0B" },
  { label: "High Activity", count: 5, color: "#3B82F6" },
  { label: "Low Activity", count: 28, color: "#64748B" },
  { label: "Critical / Conflict", count: 3, color: "#EF4444" },
  { label: "Stations", count: 42, color: "#FFFFFF" },
];

export const AI_RECOMMENDATIONS: AIRecommendation[] = [
  {
    id: "rec-1",
    title: "Reschedule block between Mathura – Agra",
    description: "AI suggests 35 min earlier slot for better utilization",
    badgeText: "High Impact",
    badgeVariant: "high-impact",
    iconType: "star",
    savingsMinutes: 35,
  },
  {
    id: "rec-2",
    title: "Combine 2 maintenance tasks in Jaipur Yard",
    description: "Can save 120 minutes and reduce disruption",
    badgeText: "Optimized",
    badgeVariant: "optimized",
    iconType: "combine",
    savingsMinutes: 120,
  },
  {
    id: "rec-3",
    title: "Shift track inspection to low-traffic window",
    description: "Recommended time: 02:30 AM – 04:30 AM",
    badgeText: "Recommended",
    badgeVariant: "recommended",
    iconType: "clock",
    slotTime: "02:30 AM – 04:30 AM",
  },
];

export const CRITICAL_ALERTS: CriticalAlert[] = [
  {
    id: "alert-1",
    title: "Conflict detected: Meerut – Ghaziabad",
    description: "Overlapping block with high priority maintenance",
    timestamp: "11:20 AM",
    severity: "critical",
    category: "conflict",
  },
  {
    id: "alert-2",
    title: "High congestion expected: Delhi Junction",
    description: "Peak traffic between 06:00 PM – 09:00 PM",
    timestamp: "11:15 AM",
    severity: "high",
    category: "congestion",
  },
  {
    id: "alert-3",
    title: "Resource constraint: Welding Team",
    description: "Limited availability on 05 Sep 2026",
    timestamp: "10:50 AM",
    severity: "medium",
    category: "resource",
  },
];

export const MAINTENANCE_TIMELINE_ROWS = [
  {
    id: "row-1",
    corridor: "Delhi – Ghaziabad",
    blocks: [
      { id: "b1", startPct: 52, widthPct: 15, status: "now", type: "active" },
    ],
  },
  {
    id: "row-2",
    corridor: "Meerut – Muzaffarnagar",
    blocks: [
      { id: "b2", startPct: 58, widthPct: 18, status: "scheduled", type: "maintenance" },
      { id: "b3", startPct: 79, widthPct: 16, status: "scheduled", type: "inspection" },
    ],
  },
  {
    id: "row-3",
    corridor: "Mathura – Agra",
    blocks: [
      { id: "b4", startPct: 32, widthPct: 22, status: "conflict", type: "warning" },
      { id: "b5", startPct: 65, widthPct: 16, status: "critical", type: "critical" },
    ],
  },
  {
    id: "row-4",
    corridor: "Jaipur – Ringas",
    blocks: [
      { id: "b6", startPct: 48, widthPct: 20, status: "scheduled", type: "warning" },
    ],
  },
  {
    id: "row-5",
    corridor: "Aligarh – Kanpur",
    blocks: [
      { id: "b7", startPct: 55, widthPct: 18, status: "scheduled", type: "maintenance" },
    ],
  },
];

export const DISRUPTION_SUMMARY: DisruptionSummary = {
  totalTrains: 48,
  lowImpactCount: 22,
  lowImpactPercentage: 45.8,
  mediumImpactCount: 17,
  mediumImpactPercentage: 35.4,
  highImpactCount: 9,
  highImpactPercentage: 18.8,
};

export const OPTIMIZATION_IMPACT_STATS: OptimizationImpactStat[] = [
  {
    label: "Minutes Saved",
    value: "4,320",
    trend: "up",
    color: "signal-green",
    bars: [30, 45, 60, 85, 100],
  },
  {
    label: "Train Delays Reduced",
    value: "1,256",
    trend: "up",
    color: "maintenance-amber",
    bars: [25, 40, 55, 75, 90],
  },
  {
    label: "Resource Utilization",
    value: "18%",
    trend: "up",
    color: "signal-green",
    bars: [20, 35, 50, 65, 80],
  },
  {
    label: "Planning Success Rate",
    value: "96.4%",
    trend: "up",
    color: "railway-blue",
    bars: [40, 60, 75, 90, 96],
  },
];

export const AI_ENGINE_STATUS: AIEngineStatus = {
  isActive: true,
  lastRunTime: "02 Sep 2026, 10:45 AM",
  corridorsAnalyzed: 68,
  constraintsChecked: 215,
  combinationsTested: 1842,
};
