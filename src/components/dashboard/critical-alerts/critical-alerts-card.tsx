"use client";

import React from "react";
import { TriangleAlert, ChevronRight, ArrowRight } from "lucide-react";
import { CRITICAL_ALERTS } from "@/data/mock-dashboard-data";

export function CriticalAlertsCard() {
  const getSeverityStyles = (severity: string) => {
    switch (severity) {
      case "critical":
        return {
          icon: "text-red-400",
          iconBg: "bg-red-500/10 border-red-500/30",
          borderHover: "hover:border-red-500/40",
        };
      case "high":
        return {
          icon: "text-amber-400",
          iconBg: "bg-amber-500/10 border-amber-500/30",
          borderHover: "hover:border-amber-500/40",
        };
      case "medium":
      default:
        return {
          icon: "text-amber-400",
          iconBg: "bg-amber-500/10 border-amber-500/30",
          borderHover: "hover:border-amber-500/40",
        };
    }
  };

  return (
    <div className="rounded-xl bg-[#0d1527] border border-[#172642] p-4 flex flex-col justify-between">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-[#172642]/60">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-red-500/10 text-red-400 border border-red-500/20">
            <TriangleAlert className="w-4 h-4" />
          </div>
          <h3 className="text-xs font-bold text-white tracking-wide uppercase">
            Critical Alerts
          </h3>
        </div>

        <button className="text-[11px] font-semibold text-blue-400 hover:text-blue-300 flex items-center gap-1 transition-colors">
          <span>View All</span>
          <ArrowRight className="w-3 h-3" />
        </button>
      </div>

      {/* Alerts Feed */}
      <div className="space-y-2.5 mt-3">
        {CRITICAL_ALERTS.map((alert) => {
          const style = getSeverityStyles(alert.severity);

          return (
            <div
              key={alert.id}
              className={`flex items-center justify-between p-2.5 rounded-lg bg-[#09101d] border border-[#172642]/80 ${style.borderHover} transition-all cursor-pointer group`}
            >
              <div className="flex items-start gap-3">
                <div
                  className={`p-2 rounded-lg border mt-0.5 group-hover:scale-105 transition-transform ${style.iconBg}`}
                >
                  <TriangleAlert className={`w-4 h-4 ${style.icon}`} />
                </div>
                <div>
                  <h4 className="text-xs font-medium text-slate-100 group-hover:text-red-300 transition-colors">
                    {alert.title}
                  </h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    {alert.description}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1 text-[11px] text-slate-400 group-hover:text-slate-200 transition-colors ml-2">
                <span>{alert.timestamp}</span>
                <ChevronRight className="w-3.5 h-3.5 text-slate-500 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
