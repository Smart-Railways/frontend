"use client";

import React, { useState } from "react";
import {
  ArrowRightLeft,
  MapPin,
  RotateCcw,
} from "lucide-react";
import { STATIONS } from "@/data/india-railway-network";

interface HorizontalRouteSelectorProps {
  sourceId: string;
  targetId: string;
  onSourceChange: (stationId: string) => void;
  onTargetChange: (stationId: string) => void;
  onSwap: () => void;
  onClear: () => void;
}

export function HorizontalRouteSelector({
  sourceId,
  targetId,
  onSourceChange,
  onTargetChange,
  onSwap,
  onClear,
}: HorizontalRouteSelectorProps) {
  const [isSwapping, setIsSwapping] = useState(false);

  const handleSwapClick = () => {
    setIsSwapping(true);
    onSwap();
    setTimeout(() => setIsSwapping(false), 300);
  };

  const selectedSource = STATIONS.find((s) => s.id === sourceId);
  const selectedTarget = STATIONS.find((s) => s.id === targetId);
  const hasSelection = Boolean(sourceId || targetId);

  return (
    <div className="w-full">
      {/* Main Clean Horizontal Bar */}
      <div className="p-2.5 sm:p-3 rounded-2xl bg-[#0d1527]/90 backdrop-blur-md border border-[#172642] shadow-xl shadow-black/40 flex flex-col md:flex-row items-center gap-2.5 sm:gap-3 transition-all">
        
        {/* Source Station Select Field */}
        <div className="flex-1 w-full relative flex items-center bg-[#070b13] border border-[#1e2e4a] hover:border-emerald-500/50 focus-within:border-emerald-500 focus-within:ring-1 focus-within:ring-emerald-500/30 rounded-xl px-3.5 py-2.5 transition-all">
          <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 mr-3 flex-shrink-0">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.9)] animate-pulse"></div>
          </div>
          <div className="flex-1 min-w-0">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Origin Station
            </label>
            <select
              value={sourceId}
              onChange={(e) => onSourceChange(e.target.value)}
              className="w-full bg-transparent text-white text-xs font-semibold focus:outline-none cursor-pointer appearance-none truncate"
            >
              <option value="" disabled className="bg-[#0d1527] text-slate-400">
                Choose origin station...
              </option>
              {STATIONS.map((station) => (
                <option
                  key={`src-${station.id}`}
                  value={station.id}
                  disabled={station.id === targetId}
                  className="bg-[#0d1527] text-white"
                >
                  {station.name} ({station.code}) — {station.city}
                </option>
              ))}
            </select>
          </div>
          {selectedSource && (
            <span className="hidden sm:inline-block text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-950/60 text-emerald-300 border border-emerald-500/30">
              {selectedSource.code}
            </span>
          )}
        </div>

        {/* Interactive Swap Button */}
        <button
          onClick={handleSwapClick}
          disabled={!sourceId && !targetId}
          title="Swap origin and destination"
          aria-label="Swap origin and destination"
          className="p-2.5 rounded-xl bg-[#121c32] hover:bg-[#1a2948] text-slate-300 hover:text-emerald-400 border border-[#1e2e4a] hover:border-emerald-500/40 shadow-md transition-all flex-shrink-0 disabled:opacity-40 disabled:cursor-not-allowed group active:scale-90"
        >
          <ArrowRightLeft
            className={`w-4 h-4 transition-transform duration-300 ${
              isSwapping ? "rotate-180 text-emerald-400" : "group-hover:rotate-45"
            }`}
          />
        </button>

        {/* Destination Station Select Field */}
        <div className="flex-1 w-full relative flex items-center bg-[#070b13] border border-[#1e2e4a] hover:border-blue-500/50 focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500/30 rounded-xl px-3.5 py-2.5 transition-all">
          <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-blue-500/15 border border-blue-500/30 text-blue-400 mr-3 flex-shrink-0">
            <MapPin className="w-3.5 h-3.5" />
          </div>
          <div className="flex-1 min-w-0">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Destination Station
            </label>
            <select
              value={targetId}
              onChange={(e) => onTargetChange(e.target.value)}
              className="w-full bg-transparent text-white text-xs font-semibold focus:outline-none cursor-pointer appearance-none truncate"
            >
              <option value="" disabled className="bg-[#0d1527] text-slate-400">
                Choose destination station...
              </option>
              {STATIONS.map((station) => (
                <option
                  key={`dst-${station.id}`}
                  value={station.id}
                  disabled={station.id === sourceId}
                  className="bg-[#0d1527] text-white"
                >
                  {station.name} ({station.code}) — {station.city}
                </option>
              ))}
            </select>
          </div>
          {selectedTarget && (
            <span className="hidden sm:inline-block text-[10px] font-bold px-2 py-0.5 rounded bg-blue-950/60 text-blue-300 border border-blue-500/30">
              {selectedTarget.code}
            </span>
          )}
        </div>

        {/* Redesigned Reset Route Action (Replaced Cross Icon) */}
        <button
          onClick={onClear}
          disabled={!hasSelection}
          title="Reset selected route"
          className={`flex items-center gap-1.5 px-3 py-2.5 rounded-xl border transition-all text-xs font-semibold flex-shrink-0 group ${
            hasSelection
              ? "bg-[#121c32] hover:bg-[#182645] text-slate-300 hover:text-white border-[#1e2e4a] hover:border-slate-500/50 shadow-md cursor-pointer active:scale-95"
              : "bg-[#0a0f1d] text-slate-600 border-[#152033] cursor-not-allowed opacity-50"
          }`}
        >
          <RotateCcw
            className={`w-3.5 h-3.5 transition-transform duration-300 ${
              hasSelection ? "group-hover:-rotate-90 text-slate-400 group-hover:text-emerald-400" : "text-slate-600"
            }`}
          />
          <span className="hidden sm:inline">Reset</span>
        </button>

      </div>
    </div>
  );
}
