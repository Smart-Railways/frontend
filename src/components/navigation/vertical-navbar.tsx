"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  LayoutDashboard,
  Train,
  Building2,
  Wrench,
  ChevronLeft,
  ChevronRight,
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

  // Determine active navigation item from the current route
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
      color: "green",
    },
    {
      id: "trains",
      label: "Trains",
      icon: Train,
      href: "/trains",
      color: "blue",
    },
    {
      id: "assets",
      label: "Assets",
      icon: Building2,
      href: "/assets",
      color: "blue",
    },
    {
      id: "maintenance",
      label: "Maintenance",
      icon: Wrench,
      href: "/maintenance",
      color: "amber",
    },
  ];

  return (
    <aside
      className={`fixed top-0 left-0 bottom-0 z-40
        bg-[#070b13]
        border-r border-[#172642]
        flex flex-col justify-between
        transition-all duration-300
        select-none
        ${collapsed ? "w-20" : "w-64"}`}
    >
      {/* =========================
          TOP BRAND / LOGO
      ========================== */}

      <div>
        <div className="h-16 flex items-center justify-between px-4 border-b border-[#172642]">
          <Link
            href="/"
            className="flex items-center gap-3 overflow-hidden cursor-pointer"
          >
            {/* Logo */}
            <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-900 border border-blue-400/30 flex-shrink-0">
              <Train className="w-5 h-5 text-white" />

              {/* Status Indicator */}
              <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
              </span>
            </div>

            {/* Brand Text */}
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
          </Link>

          {/* Collapse Button */}
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

        {/* =========================
            NAVIGATION
        ========================== */}

        <nav className="p-3 space-y-1.5">
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
                  py-3
                  rounded-xl
                  text-xs
                  font-semibold
                  transition-colors
                  group
                  border

                  ${
                    isCurrent
                      ? "bg-[#163A63] text-blue-400 border-[#2563EB]"
                      : "text-slate-400 bg-transparent border-transparent hover:bg-[#0D1728] hover:text-slate-200"
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
                          ? "text-[#60A5FA]"
                          : "text-slate-500 group-hover:text-slate-300"
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