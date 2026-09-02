"use client";

import React, { useState } from "react";
import {
  Train,
  Bell,
  Sun,
  Moon,
  ChevronDown,
} from "lucide-react";
import { LiveClock } from "@/components/ui/live-clock";

export function DashboardHeader() {
  const [isDark, setIsDark] = useState(true);

  return (
    <header className="h-16 w-full border-b border-[#172642] bg-[#070b13]/90 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-30">
      {/* Brand & Indian Railways Identity */}
      <div className="flex items-center gap-3">
        <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-blue-900 border border-blue-500/30 shadow-lg shadow-blue-950/50">
          <Train className="w-5 h-5 text-white" />
          <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
          </span>
        </div>
        <div>
          <div className="flex items-center gap-1.5">
            <span className="font-bold text-base tracking-tight text-white">
              AutoBlockPlanner
            </span>
            <span className="text-blue-400 font-extrabold text-base">AI</span>
          </div>
          <span className="text-[11px] font-medium text-slate-400 tracking-wider uppercase block -mt-0.5">
            Indian Railways
          </span>
        </div>
      </div>

      {/* Center Status: AI Model Status */}
      <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#0d1527] border border-[#172642] shadow-inner">
        <span className="text-xs text-slate-400 font-medium">AI Model Status</span>
        <div className="flex items-center gap-1.5 bg-emerald-950/60 text-emerald-400 px-2.5 py-0.5 rounded-full text-xs font-semibold border border-emerald-500/30">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          Active
        </div>
      </div>

      {/* Right Actions: Time, Notifications, Theme, User */}
      <div className="flex items-center gap-4">
        {/* Date & Time */}
        <LiveClock className="hidden lg:flex" />

        {/* Notifications */}
        <button
          aria-label="Alerts and notifications"
          className="relative p-2 rounded-lg bg-[#0d1527] hover:bg-[#121d36] text-slate-300 hover:text-white border border-[#172642] transition-colors"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute -top-1 -right-1 flex items-center justify-center w-4 h-4 bg-red-600 text-white text-[10px] font-bold rounded-full shadow-sm shadow-red-950">
            3
          </span>
        </button>

        {/* Theme Toggle */}
        <button
          onClick={() => setIsDark(!isDark)}
          aria-label="Toggle theme"
          className="p-2 rounded-lg bg-[#0d1527] hover:bg-[#121d36] text-slate-300 hover:text-white border border-[#172642] transition-colors"
        >
          {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-blue-400" />}
        </button>

        {/* User Profile */}
        <div className="flex items-center gap-2.5 pl-2 border-l border-[#172642]">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-700 to-indigo-600 flex items-center justify-center font-bold text-xs text-white shadow-md border border-blue-400/30">
            OP
          </div>
          <div className="hidden sm:flex flex-col text-left">
            <span className="text-xs font-semibold text-white leading-tight">
              Ops Manager
            </span>
            <span className="text-[10px] text-slate-400 font-medium">
              Northern Zone
            </span>
          </div>
          <ChevronDown className="w-3.5 h-3.5 text-slate-500 hidden sm:block" />
        </div>
      </div>
    </header>
  );
}
