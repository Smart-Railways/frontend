"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  LayoutDashboard,
  Route,
  Train,
  Building2,
  Bell,
  Settings,
  ShieldCheck,
  Activity,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

interface VerticalNavbarProps {
  activeTab?: string;
  onTabChange?: (tabId: string) => void;
  unreadCount?: number;
}

export function VerticalNavbar({
  activeTab = "routes",
  onTabChange,
  unreadCount = 3,
}: VerticalNavbarProps) {
  const [collapsed, setCollapsed] = useState(false);

  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, href: "#" },
    { id: "routes", label: "Routes", icon: Route, href: "#", active: true },
    { id: "trains", label: "Trains", icon: Train, href: "#" },
    { id: "stations", label: "Stations", icon: Building2, href: "#" },
    {
      id: "notifications",
      label: "Notifications",
      icon: Bell,
      href: "#",
      badge: unreadCount > 0 ? unreadCount : undefined,
    },
    { id: "settings", label: "Settings", icon: Settings, href: "#" },
  ];

  return (
    <aside
      className={`fixed top-0 left-0 bottom-0 z-40 bg-[#070b13]/95 backdrop-blur-md border-r border-[#172642] flex flex-col justify-between transition-all duration-300 select-none shadow-2xl ${
        collapsed ? "w-20" : "w-64"
      }`}
    >
      {/* Top Brand / Logo */}
      <div>
        <div className="h-16 flex items-center justify-between px-4 border-b border-[#172642]">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-900 border border-blue-400/30 shadow-lg shadow-blue-950/60 flex-shrink-0">
              <Train className="w-5 h-5 text-white" />
              <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
            </div>

            {!collapsed && (
              <div className="transition-opacity duration-200">
                <div className="flex items-center gap-1.5">
                  <span className="font-extrabold text-sm tracking-tight text-white">
                    AutoBlock
                  </span>
                  <span className="text-emerald-400 font-extrabold text-xs px-1.5 py-0.5 rounded bg-emerald-950/60 border border-emerald-500/30">
                    AI
                  </span>
                </div>
                <span className="text-[10px] font-semibold text-slate-400 tracking-wider uppercase block">
                  Indian Railways
                </span>
              </div>
            )}
          </div>

          {/* Collapse toggle button */}
          <button
            onClick={() => setCollapsed(!collapsed)}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-[#121d36] transition-colors"
          >
            {collapsed ? (
              <ChevronRight className="w-4 h-4" />
            ) : (
              <ChevronLeft className="w-4 h-4" />
            )}
          </button>
        </div>

        {/* Navigation Items List */}
        <nav className="p-3 space-y-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isCurrent = (activeTab || "routes") === item.id;

            return (
              <button
                key={item.id}
                onClick={() => onTabChange?.(item.id)}
                title={collapsed ? item.label : undefined}
                className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-xs font-semibold transition-all group ${
                  isCurrent
                    ? "bg-gradient-to-r from-emerald-500/20 via-emerald-500/10 to-transparent text-emerald-300 border border-emerald-500/40 shadow-[0_0_15px_-3px_rgba(16,185,129,0.25)]"
                    : "text-slate-400 hover:text-slate-100 hover:bg-[#0d1527] border border-transparent"
                }`}
              >
                <div className="flex items-center gap-3.5">
                  <Icon
                    className={`w-4 h-4 transition-colors ${
                      isCurrent
                        ? "text-emerald-400 drop-shadow-[0_0_8px_rgba(16,185,129,0.8)]"
                        : "text-slate-500 group-hover:text-slate-300"
                    }`}
                  />
                  {!collapsed && <span>{item.label}</span>}
                </div>

                {/* Badge indicator */}
                {item.badge !== undefined && (
                  <span
                    className={`flex items-center justify-center font-bold rounded-full ${
                      collapsed
                        ? "w-2 h-2 bg-red-500"
                        : "text-[10px] px-2 py-0.5 bg-red-500/20 text-red-400 border border-red-500/40"
                    }`}
                  >
                    {!collapsed && item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Network Safety & User Badge */}
      <div className="p-3 border-t border-[#172642]/80 space-y-3">
        {!collapsed ? (
          <div className="p-3 rounded-xl bg-gradient-to-br from-[#0d1527] to-[#09101d] border border-[#172642] text-white">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">
                Kavach 4.0
              </span>
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(16,185,129,0.9)] animate-pulse"></span>
              <span className="text-[10px] text-emerald-300 font-medium">
                Collision Shield Active
              </span>
            </div>
          </div>
        ) : (
          <div className="flex justify-center">
            <div className="p-2 rounded-xl bg-[#0d1527] border border-emerald-500/30 text-emerald-400" title="Kavach Active">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
        )}

        {/* User Profile Mini Bar */}
        <div className={`flex items-center gap-2.5 ${collapsed ? "justify-center" : "px-1"}`}>
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-700 to-indigo-600 flex items-center justify-center text-xs font-bold text-white shadow-md border border-blue-400/30 flex-shrink-0">
            IR
          </div>
          {!collapsed && (
            <div className="overflow-hidden">
              <span className="text-xs font-bold text-white block truncate">
                Central Operations
              </span>
              <span className="text-[10px] text-slate-400 font-medium block truncate">
                Rail Bhavan, New Delhi
              </span>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
