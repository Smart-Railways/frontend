"use client";

import React, { useState } from "react";
import { Brain, Sparkles, Settings2, Loader2, CheckCircle2 } from "lucide-react";
import { AI_ENGINE_STATUS } from "@/data/mock-dashboard-data";

export function AIEngineBanner() {
  const [isRunning, setIsRunning] = useState(false);
  const [lastOptimized, setLastOptimized] = useState(AI_ENGINE_STATUS.lastRunTime);
  const [showSuccessToast, setShowSuccessToast] = useState(false);

  const handleRunOptimization = () => {
    setIsRunning(true);
    setTimeout(() => {
      setIsRunning(false);
      setLastOptimized("Just now");
      setShowSuccessToast(true);
      setTimeout(() => setShowSuccessToast(false), 4000);
    }, 1800);
  };

  return (
    <div className="relative rounded-xl bg-gradient-to-r from-[#0d1527] via-[#0f1d38] to-[#0d1527] border border-blue-500/30 p-4 shadow-xl overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-0 right-1/4 w-72 h-32 bg-blue-600/10 blur-3xl pointer-events-none"></div>

      <div className="flex flex-col lg:flex-row items-center justify-between gap-4 relative z-10">
        {/* Left: Engine Status & Identification */}
        <div className="flex items-center gap-3.5 w-full lg:w-auto">
          <div className="w-11 h-11 rounded-xl bg-emerald-500/15 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.3)] flex-shrink-0">
            <Brain className="w-6 h-6" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-white tracking-wide uppercase">
                AI Optimization Engine
              </h3>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            </div>
            <p className="text-xs text-slate-300 mt-0.5">
              Ready to generate optimal block plan{" "}
              <span className="text-slate-500">•</span>{" "}
              <span className="text-slate-400">Last run: {lastOptimized}</span>
            </p>
          </div>
        </div>

        {/* Center: Live Compute Stats */}
        <div className="grid grid-cols-3 gap-6 py-1 px-4 rounded-lg bg-[#070b13]/60 border border-[#172642] text-center w-full lg:w-auto">
          <div>
            <span className="text-base font-extrabold text-white block">
              {AI_ENGINE_STATUS.corridorsAnalyzed}
            </span>
            <span className="text-[10px] text-slate-400 font-medium whitespace-nowrap">
              Corridors Analyzed
            </span>
          </div>

          <div className="border-x border-[#172642] px-4">
            <span className="text-base font-extrabold text-white block">
              {AI_ENGINE_STATUS.constraintsChecked}
            </span>
            <span className="text-[10px] text-slate-400 font-medium whitespace-nowrap">
              Constraints Checked
            </span>
          </div>

          <div>
            <span className="text-base font-extrabold text-white block">
              {AI_ENGINE_STATUS.combinationsTested.toLocaleString()}
            </span>
            <span className="text-[10px] text-slate-400 font-medium whitespace-nowrap">
              Combinations Tested
            </span>
          </div>
        </div>

        {/* Right: Primary Action Trigger & Advanced Settings */}
        <div className="flex flex-col items-center sm:items-end w-full lg:w-auto">
          <button
            onClick={handleRunOptimization}
            disabled={isRunning}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-gradient-to-r from-red-600 via-orange-600 to-amber-600 hover:from-red-500 hover:via-orange-500 hover:to-amber-500 text-white font-bold text-xs shadow-lg shadow-orange-950/50 hover:shadow-orange-700/40 border border-orange-400/40 flex items-center justify-center gap-2 transition-all transform active:scale-95 disabled:opacity-60"
          >
            {isRunning ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Optimizing Corridors...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Run AI Optimization</span>
              </>
            )}
          </button>

          <button className="text-[11px] text-slate-400 hover:text-slate-200 mt-1.5 flex items-center gap-1 transition-colors">
            <Settings2 className="w-3 h-3" />
            <span>Advanced Settings</span>
          </button>
        </div>
      </div>

      {/* Optimization Success Feedback Notification */}
      {showSuccessToast && (
        <div className="absolute top-2 right-2 flex items-center gap-1.5 bg-emerald-950/90 text-emerald-300 text-xs px-3 py-1.5 rounded-lg border border-emerald-500/50 shadow-lg animate-in fade-in slide-in-from-top-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>Optimal block schedule generated successfully!</span>
        </div>
      )}
    </div>
  );
}
