"use client";

import React from "react";
import { TrainFront, ArrowRight } from "lucide-react";
import { DISRUPTION_SUMMARY } from "@/data/mock-dashboard-data";

export function DisruptionCard() {
  const {
    totalTrains,
    lowImpactCount,
    lowImpactPercentage,
    mediumImpactCount,
    mediumImpactPercentage,
    highImpactCount,
    highImpactPercentage,
  } = DISRUPTION_SUMMARY;

  // SVG Donut calculation: Circumference = 2 * PI * r = 2 * 3.14159 * 40 = 251.3
  const circumference = 251.3;
  const lowDash = (lowImpactPercentage / 100) * circumference;
  const medDash = (mediumImpactPercentage / 100) * circumference;
  const highDash = (highImpactPercentage / 100) * circumference;

  const lowOffset = 0;
  const medOffset = -lowDash;
  const highOffset = -(lowDash + medDash);

  return (
    <div className="rounded-xl bg-[#0d1527] border border-[#172642] p-4 flex flex-col justify-between">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-[#172642]/60">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <TrainFront className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-white tracking-wide uppercase">
              Train Disruption Analysis
            </h3>
            <span className="text-[11px] text-slate-400">Impact Summary</span>
          </div>
        </div>
      </div>

      {/* Donut & Stats Content */}
      <div className="flex items-center justify-between gap-4 my-2">
        {/* SVG Donut Chart */}
        <div className="relative w-28 h-28 flex-shrink-0 flex items-center justify-center">
          <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
            {/* Background ring */}
            <circle
              cx="50"
              cy="50"
              r="40"
              fill="transparent"
              stroke="#172642"
              strokeWidth="10"
            />
            {/* Low Impact segment (Green) */}
            <circle
              cx="50"
              cy="50"
              r="40"
              fill="transparent"
              stroke="#10b981"
              strokeWidth="10"
              strokeDasharray={`${lowDash} ${circumference}`}
              strokeDashoffset={lowOffset}
              className="transition-all duration-500"
            />
            {/* Medium Impact segment (Amber) */}
            <circle
              cx="50"
              cy="50"
              r="40"
              fill="transparent"
              stroke="#f59e0b"
              strokeWidth="10"
              strokeDasharray={`${medDash} ${circumference}`}
              strokeDashoffset={medOffset}
              className="transition-all duration-500"
            />
            {/* High Impact segment (Red) */}
            <circle
              cx="50"
              cy="50"
              r="40"
              fill="transparent"
              stroke="#ef4444"
              strokeWidth="10"
              strokeDasharray={`${highDash} ${circumference}`}
              strokeDashoffset={highOffset}
              className="transition-all duration-500"
            />
          </svg>

          {/* Center Label */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-xl font-extrabold text-white leading-none">
              {totalTrains}
            </span>
            <span className="text-[10px] text-slate-400 font-medium mt-0.5">
              Trains
            </span>
          </div>
        </div>

        {/* Legend & Breakdown */}
        <div className="flex-1 space-y-2 text-[11px]">
          <div className="flex items-center justify-between text-slate-300">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              <span>Low Impact</span>
            </div>
            <span className="font-semibold text-white">
              {lowImpactCount} ({lowImpactPercentage}%)
            </span>
          </div>

          <div className="flex items-center justify-between text-slate-300">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-400"></span>
              <span>Medium Impact</span>
            </div>
            <span className="font-semibold text-white">
              {mediumImpactCount} ({mediumImpactPercentage}%)
            </span>
          </div>

          <div className="flex items-center justify-between text-slate-300">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-red-400"></span>
              <span>High Impact</span>
            </div>
            <span className="font-semibold text-white">
              {highImpactCount} ({highImpactPercentage}%)
            </span>
          </div>
        </div>
      </div>

      {/* Footer Link */}
      <div className="pt-2 border-t border-[#172642]/60 text-center">
        <button className="text-[11px] font-semibold text-blue-400 hover:text-blue-300 inline-flex items-center gap-1 transition-colors">
          <span>View Detailed Impact</span>
          <ArrowRight className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
}
