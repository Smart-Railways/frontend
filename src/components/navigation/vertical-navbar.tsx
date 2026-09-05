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
      
    </aside>
  );
}