"use client";

import React from "react";
import { Activity } from "lucide-react";

export function SystemHealth() {
  return (
    <div className="mx-3 mt-auto mb-4 rounded-xl bg-gradient-to-b from-[#0d1527] to-[#09101d] border border-[#172642] p-3 text-white overflow-hidden relative shadow-lg">
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-semibold text-slate-200">System Health</span>
        <Activity className="w-3.5 h-3.5 text-blue-400 animate-pulse" />
      </div>

      {/* Operational status */}
      <div className="flex items-center gap-1.5 mb-2">
        <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.8)]"></span>
        <span className="text-[11px] font-medium text-emerald-300">
          All systems operational
        </span>
      </div>

      {/* Uptime metric & progress bar */}
      <div className="space-y-1 mb-3">
        <div className="flex justify-between items-center text-[10px] text-slate-400">
          <span>Uptime</span>
          <span className="font-semibold text-white">99.8%</span>
        </div>
        <div className="h-1.5 w-full bg-[#172642] rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-blue-500 to-emerald-400 rounded-full"
            style={{ width: "99.8%" }}
          ></div>
        </div>
      </div>

      {/* High-speed Train Graphic / Illustration */}
      <div className="relative w-full h-16 rounded-lg overflow-hidden bg-gradient-to-t from-blue-950/40 to-transparent border border-blue-900/30 flex items-end">
        <svg
          viewBox="0 0 200 60"
          className="w-full h-full opacity-80"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Bridge arches */}
          <path
            d="M0 55 H200"
            stroke="#1e3a5f"
            strokeWidth="1.5"
          />
          <path
            d="M10 55 Q 30 42 50 55 M50 55 Q 70 42 90 55 M90 55 Q 110 42 130 55 M130 55 Q 150 42 170 55"
            stroke="#172e4a"
            strokeWidth="1.5"
            fill="none"
          />
          {/* Train Tracks */}
          <line x1="0" y1="44" x2="200" y2="44" stroke="#2a4773" strokeWidth="1" />
          <line x1="0" y1="47" x2="200" y2="47" stroke="#1d3150" strokeWidth="0.8" strokeDasharray="3 3" />
          
          {/* Futuristic Vande Bharat / Bullet Train Body */}
          <path
            d="M 190 35 L 75 35 Q 45 35 25 43 L 190 43 Z"
            fill="#e2e8f0"
          />
          {/* Train Nose Cone Aerodynamic Curve */}
          <path
            d="M 25 43 Q 15 42 10 44 L 25 44 Z"
            fill="#94a3b8"
          />
          {/* Windshield */}
          <path
            d="M 35 38 Q 45 37 58 37 L 55 41 Q 40 41 30 42 Z"
            fill="#0f172a"
          />
          {/* Indian Railway Blue Stripe */}
          <path
            d="M 32 41 L 190 41 L 190 43 L 26 43 Z"
            fill="#2563eb"
          />
          {/* Passenger Windows */}
          <rect x="70" y="37" width="10" height="3" rx="1" fill="#0f172a" />
          <rect x="85" y="37" width="10" height="3" rx="1" fill="#0f172a" />
          <rect x="100" y="37" width="10" height="3" rx="1" fill="#0f172a" />
          <rect x="115" y="37" width="10" height="3" rx="1" fill="#0f172a" />
          <rect x="130" y="37" width="10" height="3" rx="1" fill="#0f172a" />
          <rect x="145" y="37" width="10" height="3" rx="1" fill="#0f172a" />
          <rect x="160" y="37" width="10" height="3" rx="1" fill="#0f172a" />
          {/* Train Headlight Beam */}
          <polygon
            points="10,43 0,40 0,46"
            fill="rgba(56, 189, 248, 0.4)"
            filter="blur(1px)"
          />
        </svg>
      </div>
    </div>
  );
}
