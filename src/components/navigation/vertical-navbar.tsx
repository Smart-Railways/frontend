"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  LayoutDashboard,
  Train,
  Building2,
  Wrench,
  ClipboardList,
  Bell,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
} from "lucide-react";
import { usePathname } from "next/navigation";

interface VerticalNavbarProps {
  activeTab?: string;
  onTabChange?: (tabId: string) => void;
  unreadCount?: number;
}

export function VerticalNavbar({
  activeTab,
  onTabChange,
  unreadCount = 3,
}: VerticalNavbarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();

  // Determine active navigation item from current route
  const currentActiveTab =
    activeTab ||
    (pathname === "/maintenance"
      ? "maintenance"
      : pathname === "/assets"
      ? "assets"
      : pathname === "/trains"
      ? "trains"
      : pathname === "/"
      ? "dashboard"
      : "dashboard");

  const navItems = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: LayoutDashboard,
      href: "/",
    },
    {
      id: "trains",
      label: "Trains",
      icon: Train,
      href: "/trains",
    },
    {
      id: "assets",
      label: "Assets",
      icon: Building2,
      href: "/assets",
    },
    {
      id: "maintenance",
      label: "Maintenance",
      icon: Wrench,
      href: "/maintenance",
    },
    {
      id: "orders",
      label: "Orders",
      icon: ClipboardList,
      href: "/maintenance",
    },
    {
      id: "alerts",
      label: "Alerts",
      icon: Bell,
      href: "/",
    },
  ];

  return (
    <aside
      className={`fixed top-0 left-0 bottom-0 z-40
        bg-brand-secondary
        border-r border-[#262b34]
        flex flex-col justify-between
        transition-all duration-300
        select-none
        ${collapsed ? "w-20" : "w-64"}`}
    >
      {/* =========================
          TOP BRAND / LOGO
      ========================== */}
      <div>
        <div className="h-16 flex items-center justify-between px-4 border-b border-[#262b34]/60">
          <Link
            href="/"
            className="flex items-center gap-3 overflow-hidden cursor-pointer"
          >
            {/* Blue Logo Box */}
            <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-brand-primary text-white shadow-md flex-shrink-0">
              <Train className="w-5 h-5 text-white" />
            </div>

            {/* Brand Text */}
            {!collapsed && (
              <div className="transition-opacity duration-200">
                <div className="flex items-center gap-1.5">
                  <span className="font-extrabold text-sm tracking-tight text-white">
                    AutoBlock
                  </span>
                  <span className="text-white text-[10px] font-bold px-1.5 py-0.2 rounded bg-brand-primary">
                    AI
                  </span>
                </div>
                <span className="text-[10px] font-semibold text-slate-400 tracking-wider uppercase block">
                  INDIAN RAILWAYS
                </span>
              </div>
            )}
          </Link>

          {/* Collapse Button */}
          <button
            onClick={() => setCollapsed(!collapsed)}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            {collapsed ? (
              <ChevronRight className="w-4 h-4" />
            ) : (
              <ChevronLeft className="w-4 h-4" />
            )}
          </button>
        </div>

        {/* =========================
            NAVIGATION
        ========================== */}
        <nav className="p-3 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isCurrent = currentActiveTab === item.id;

            return (
              <Link
                key={item.id}
                href={item.href}
                onClick={() => onTabChange?.(item.id)}
                title={collapsed ? item.label : undefined}
                className={`
                  w-full
                  flex
                  items-center
                  justify-between
                  px-3.5
                  py-2.5
                  rounded-xl
                  text-xs
                  font-medium
                  transition-colors
                  group
                  ${
                    isCurrent
                      ? "bg-[#1f2b3e] text-blue-400 border border-brand-primary/30 font-semibold"
                      : "text-slate-400 hover:text-slate-200 hover:bg-[#1f242d] border border-transparent"
                  }
                `}
              >
                <div className="flex items-center gap-3.5">
                  <Icon
                    className={`
                      w-4 h-4
                      transition-colors
                      ${
                        isCurrent
                          ? "text-blue-400"
                          : "text-slate-400 group-hover:text-slate-200"
                      }
                    `}
                  />
                  {!collapsed && <span>{item.label}</span>}
                </div>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* =========================
          BOTTOM SECTION
      ========================== */}
      <div className="p-3 space-y-2 border-t border-[#262b34]/60">
        {/* System Status Box */}
        {!collapsed ? (
          <div className="p-3 rounded-xl bg-[#0f141a] border border-[#262b34] space-y-1">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-primary"></span>
              </span>
              <span className="text-[11px] font-semibold text-slate-300">
                System Status
              </span>
            </div>
            <div className="text-[10px] font-medium text-emerald-400 pl-4">
              All Systems Operational
            </div>
          </div>
        ) : (
          <div className="flex justify-center py-2" title="System Status: Operational">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
          </div>
        )}

        {/* User Profile Box */}
        <div className="flex items-center justify-between p-2 rounded-xl hover:bg-[#1f242d] transition-colors cursor-pointer">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-full bg-brand-surface text-brand-secondary font-bold text-xs flex items-center justify-center flex-shrink-0 shadow-sm">
              AD
            </div>
            {!collapsed && (
              <div className="min-w-0">
                <div className="text-xs font-bold text-white truncate">
                  Admin User
                </div>
                <div className="text-[10px] text-slate-400 truncate">
                  Control Room
                </div>
              </div>
            )}
          </div>
          {!collapsed && <ChevronDown className="w-3.5 h-3.5 text-slate-400" />}
        </div>
      </div>
    </aside>
  );
}