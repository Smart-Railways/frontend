"use client";

import React from "react";
import { Calendar, Wrench, TriangleAlert, ExternalLink } from "lucide-react";
import { MAINTENANCE_TIMELINE_ROWS } from "@/data/mock-dashboard-data";

export function MaintenanceTimelineCard() {
  const timeLabels = ["12 AM", "4 AM", "8 AM", "12 PM", "4 PM", "8 PM", "12 AM"];

  return (
    <div className="rounded-xl bg-[#0d1527] border border-[#172642] p-4 flex flex-col justify-between">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-[#172642]/60">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20">
            <Calendar className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-white tracking-wide uppercase">
              Maintenance Timeline
            </h3>
            <span className="text-[11px] text-slate-400">05 Sep 2026</span>
          </div>
        </div>

        <button className="px-2.5 py-1 rounded-lg bg-[#070b13] border border-[#172642] text-[11px] font-semibold text-slate-300 hover:text-white hover:border-slate-500 transition-all flex items-center gap-1.5">
          <span>View Full Schedule</span>
          <ExternalLink className="w-3 h-3" />
        </button>
      </div>

      {/* Timeline Chart Area */}
      <div className="relative mt-3 pt-2">
        {/* Time Axis Labels */}
        <div className="grid grid-cols-7 text-[10px] font-medium text-slate-400 mb-2 pl-36 text-center">
          {timeLabels.map((time, idx) => (
            <span key={idx}>{time}</span>
          ))}
        </div>

        {/* Rows Container */}
        <div className="relative space-y-2.5">
          {/* Vertical NOW Indicator */}
          <div
            className="absolute top-0 bottom-0 z-20 pointer-events-none flex flex-col items-center"
            style={{ left: "calc(36% + 144px)" }}
          >
            <span className="bg-blue-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded shadow-md tracking-wider">
              NOW
            </span>
            <div className="w-[2px] h-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.8)]"></div>
          </div>

          {MAINTENANCE_TIMELINE_ROWS.map((row) => (
            <div
              key={row.id}
              className="flex items-center text-xs h-7 group"
            >
              {/* Corridor Label */}
              <div className="w-36 flex-shrink-0 text-[11px] font-medium text-slate-300 truncate pr-2">
                {row.corridor}
              </div>

              {/* Timeline Track Track */}
              <div className="relative flex-1 h-full bg-[#070b13] rounded-md border border-[#172642]/60 overflow-hidden">
                {/* Subtle grid ticks */}
                <div className="absolute inset-0 grid grid-cols-6 divide-x divide-[#172642]/30 pointer-events-none">
                  <div></div>
                  <div></div>
                  <div></div>
                  <div></div>
                  <div></div>
                  <div></div>
                </div>

                {/* Scheduled Blocks */}
                {row.blocks.map((block) => {
                  let blockStyle = "bg-blue-600/80 border-blue-400 text-blue-100";
                  let Icon = null;

                  if (block.type === "maintenance") {
                    blockStyle =
                      "bg-emerald-600/70 border-emerald-400 text-emerald-100 shadow-[0_0_10px_rgba(16,185,129,0.3)]";
                    Icon = Wrench;
                  } else if (block.type === "inspection") {
                    blockStyle =
                      "bg-amber-600/70 border-amber-400 text-amber-100 shadow-[0_0_10px_rgba(245,158,11,0.3)]";
                    Icon = Wrench;
                  } else if (block.type === "warning") {
                    blockStyle =
                      "bg-amber-600/80 border-amber-400 text-amber-100 shadow-[0_0_10px_rgba(245,158,11,0.3)]";
                    Icon = Wrench;
                  } else if (block.type === "critical") {
                    blockStyle =
                      "bg-red-600/80 border-red-400 text-red-100 shadow-[0_0_10px_rgba(239,68,68,0.4)]";
                    Icon = TriangleAlert;
                  }

                  return (
                    <div
                      key={block.id}
                      className={`absolute top-0.5 bottom-0.5 rounded border flex items-center justify-center transition-transform hover:scale-105 cursor-pointer ${blockStyle}`}
                      style={{
                        left: `${block.startPct}%`,
                        width: `${block.widthPct}%`,
                      }}
                    >
                      {Icon && <Icon className="w-3 h-3 drop-shadow" />}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
