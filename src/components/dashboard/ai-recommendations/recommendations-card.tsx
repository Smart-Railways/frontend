"use client";

import React from "react";
import { Sparkles, Star, GitMerge, Clock, ArrowRight } from "lucide-react";
import { AI_RECOMMENDATIONS } from "@/data/mock-dashboard-data";

export function RecommendationsCard() {
  const getIcon = (type: string) => {
    switch (type) {
      case "star":
        return <Star className="w-4 h-4 text-amber-400" />;
      case "combine":
        return <GitMerge className="w-4 h-4 text-emerald-400" />;
      case "clock":
      default:
        return <Clock className="w-4 h-4 text-blue-400" />;
    }
  };

  const getBadgeStyle = (variant: string) => {
    switch (variant) {
      case "high-impact":
        return "bg-amber-500/10 text-amber-400 border-amber-500/30";
      case "optimized":
        return "bg-emerald-500/10 text-emerald-400 border-emerald-500/30";
      case "recommended":
      default:
        return "bg-blue-500/10 text-blue-400 border-blue-500/30";
    }
  };

  return (
    <div className="rounded-xl bg-[#0d1527] border border-[#172642] p-4 flex flex-col justify-between">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-[#172642]/60">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-white tracking-wide uppercase">
              AI Recommendations
            </h3>
            <span className="text-[11px] text-slate-400">Smart Optimization Suggestions</span>
          </div>
        </div>

        <button className="text-[11px] font-semibold text-blue-400 hover:text-blue-300 flex items-center gap-1 transition-colors">
          <span>View All</span>
          <ArrowRight className="w-3 h-3" />
        </button>
      </div>

      {/* Recommendations List */}
      <div className="space-y-2.5 mt-3">
        {AI_RECOMMENDATIONS.map((rec) => (
          <div
            key={rec.id}
            className="flex items-center justify-between p-2.5 rounded-lg bg-[#09101d] border border-[#172642]/80 hover:border-slate-600/50 transition-all cursor-pointer group"
          >
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-[#121c32] border border-[#1c2e50] mt-0.5 group-hover:scale-105 transition-transform">
                {getIcon(rec.iconType)}
              </div>
              <div>
                <h4 className="text-xs font-medium text-slate-100 group-hover:text-blue-300 transition-colors">
                  {rec.title}
                </h4>
                <p className="text-[11px] text-slate-400 mt-0.5">{rec.description}</p>
              </div>
            </div>

            <span
              className={`text-[10px] font-semibold px-2.5 py-1 rounded-full border whitespace-nowrap ml-3 ${getBadgeStyle(
                rec.badgeVariant
              )}`}
            >
              {rec.badgeText}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
