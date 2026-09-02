export interface NavItem {
  id: string;
  label: string;
  href: string;
  iconName: string;
  badge?: string | number;
}

export const MAIN_NAV_ITEMS: NavItem[] = [
  { id: "dashboard", label: "Dashboard", href: "/", iconName: "LayoutDashboard" },
  { id: "ai-optimization", label: "AI Optimization", href: "/optimization", iconName: "Sparkles" },
  { id: "network-map", label: "Network Map", href: "/network", iconName: "Network" },
  { id: "block-planning", label: "Block Planning", href: "/block-planning", iconName: "Calendar" },
  { id: "maintenance-tasks", label: "Maintenance Tasks", href: "/maintenance", iconName: "Wrench" },
  { id: "train-impact", label: "Train Impact Analysis", href: "/impact", iconName: "TrainTrack" },
  { id: "alerts-conflicts", label: "Alerts & Conflicts", href: "/alerts", iconName: "TriangleAlert", badge: "3" },
  { id: "reports-analytics", label: "Reports & Analytics", href: "/reports", iconName: "BarChart3" },
  { id: "historical-data", label: "Historical Data", href: "/historical", iconName: "History" },
];

export const BOTTOM_NAV_ITEMS: NavItem[] = [
  { id: "settings", label: "Settings", href: "/settings", iconName: "Settings" },
  { id: "support", label: "Support", href: "/support", iconName: "HelpCircle" },
];
