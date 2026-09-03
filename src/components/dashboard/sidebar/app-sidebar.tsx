"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Sparkles,
  GitBranch,
  Calendar,
  Wrench,
  TrainFront,
  TriangleAlert,
  BarChart3,
  History,
  Settings,
  HelpCircle,
} from "lucide-react";

interface NavItem {
  id: string;
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  badgeColor?: string;
}

const NAV_ITEMS: NavItem[] = [
  { id: "dashboard", label: "Dashboard", href: "/", icon: LayoutDashboard },
  { id: "ai-optimization", label: "AI Optimization", href: "/optimization", icon: Sparkles },
  { id: "network-map", label: "Network Map", href: "/network", icon: GitBranch },
  { id: "block-planning", label: "Block Planning", href: "/block-planning", icon: Calendar },
  { id: "maintenance-tasks", label: "Maintenance Tasks", href: "/maintenance", icon: Wrench },
  { id: "train-impact", label: "Train Impact Analysis", href: "/impact", icon: TrainFront },
  {
    id: "alerts-conflicts",
    label: "Alerts & Conflicts",
    href: "/alerts",
    icon: TriangleAlert,
    badge: "3",
    badgeColor: "bg-red-500/20 text-red-400 border border-red-500/30",
  },
  { id: "reports-analytics", label: "Reports & Analytics", href: "/reports", icon: BarChart3 },
  { id: "historical-data", label: "Historical Data", href: "/historical", icon: History },
];

// const SECONDARY_ITEMS: NavItem[] = [
//   { id: "settings", label: "Settings", href: "/settings", icon: Settings },
//   { id: "support", label: "Support", href: "/support", icon: HelpCircle },
// ];

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 flex-shrink-0 bg-[#070b13] border-r border-[#172642] flex flex-col justify-between h-[calc(100vh-4rem)] sticky top-16 overflow-y-auto">
      {/* Primary Navigation */}
      <div className="py-4 px-3 space-y-1">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.id}
              href={item.href}
              className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all group ${
                isActive
                  ? "bg-gradient-to-r from-blue-600/30 to-blue-500/10 text-white border border-blue-500/40 shadow-sm shadow-blue-900/20"
                  : "text-slate-400 hover:text-slate-200 hover:bg-[#0d1527]/80"
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon
                  className={`w-4 h-4 transition-colors ${
                    isActive
                      ? "text-blue-400"
                      : "text-slate-500 group-hover:text-slate-300"
                  }`}
                />
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span
                  className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                    item.badgeColor || "bg-blue-500/20 text-blue-300"
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}

        <div className="pt-3 pb-1">
          <div className="h-[1px] bg-[#172642]/60 mx-1"></div>
        </div>

        {/* Secondary Navigation */}
      
      </div>

 
    </aside>
  );
}
