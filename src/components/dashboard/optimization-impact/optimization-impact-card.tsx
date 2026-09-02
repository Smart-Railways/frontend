"use client";

import React from "react";
import { TrendingUp } from "lucide-react";
import { OPTIMIZATION_IMPACT_STATS } from "@/data/mock-dashboard-data";

export function OptimizationImpactCard() {
  const getBarColor = (color: string) => {
    switch (color) {
      case "signal-green":
        return "bg-emerald-500";
      case "maintenance-amber":
        return "bg-amber-500";
      case "railway-blue":
      default:
        return "bg-blue-500";
    }
  };

  return (
    <div className="rounded-xl bg-[#0d1527] border border-[#172642] p-4 flex flex-col justify-between">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-[#172642]/60">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20">
            <TrendingUp className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-white tracking-wide uppercase">
              Optimization Impact
            </h3>
            <span className="text-[11px] text-slate-400">This Month</span>
          </div>
        </div>
      </div>

      {/* 4 Mini Impact Metrics Grid */}
      <div className="grid grid-cols-4 gap-2.5 my-2">
        {OPTIMIZATION_IMPACT_STATS.map((stat, idx) => (
          <div
            key={idx}
            className="flex flex-col items-center text-center p-2 rounded-lg bg-[#09101d] border border-[#172642]/60"
          >
            {/* Main Value */}
            <span className="text-xs font-extrabold text-white tracking-tight">
              {stat.value}
            </span>

            {/* Mini Bar Chart */}
            <div className="flex items-end justify-center gap-1 h-8 my-2">
              {stat.bars.map((height, bIdx) => (
                <div
                  key={bIdx}
                  className={`w-1 rounded-sm ${getBarColor(stat.color)}`}
                  style={{ height: `${height}%`, opacity: 0.35 + (bIdx * 0.15) }}
                ></div>
              ))}
            </div>

            {/* Label */}
            <span className="text-[10px] text-slate-400 font-medium leading-tight line-clamp-2 h-7 flex items-center">
              {stat.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
