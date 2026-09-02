"use client";

import React, { useState, useMemo } from "react";
import {
  ArrowRightLeft,
  MapPin,
  RotateCcw,
  Layers,
  ChevronDown,
} from "lucide-react";
import {
  STATIONS,
  AVAILABLE_CORRIDORS,
  RailwayCorridorPreset,
  getStationById,
  getStationByName,
  findRailwayRoute,
} from "@/data/india-railway-network";
import { useRailwaySections } from "@/hooks";

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

  // Fetch backend sections
  const { data: backendSections = [] } = useRailwaySections();

  // Combine backend sections and national railway presets
  const allCorridors = useMemo(() => {
    const list: RailwayCorridorPreset[] = [];

    // Prioritize backend sections from API database
    backendSections.forEach((sec) => {
      // Clean section name (e.g. "Surat-Mumbai", "New Delhi - Mathura")
      let srcStation = getStationByName(sec.origin_station);
      let dstStation = getStationByName(sec.end_station);

      // Try splitting section_name if stations aren't matched directly
      if (!srcStation || !dstStation) {
        const parts = sec.section_name.split(/[-–—]/).map((p) => p.trim());
        if (parts.length >= 2) {
          if (!srcStation) srcStation = getStationByName(parts[0]);
          if (!dstStation) dstStation = getStationByName(parts[1]);
        }
      }

      if (srcStation && dstStation) {
        const exists = list.some(
          (c) =>
            (c.sourceId === srcStation.id && c.targetId === dstStation.id) ||
            (c.sourceId === dstStation.id && c.targetId === srcStation.id)
        );

        if (!exists) {
          list.push({
            id: `sec-${sec.id}`,
            name: `${sec.section_name}`,
            sourceId: srcStation.id,
            targetId: dstStation.id,
            distanceKm: sec.distance,
            zone: "Active Railway Section",
            tag: "Database Section",
            isBackendSection: true,
            backendSectionId: sec.id,
          });
        }
      }
    });

    // Add remaining presets
    AVAILABLE_CORRIDORS.forEach((preset) => {
      const exists = list.some(
        (c) =>
          (c.sourceId === preset.sourceId && c.targetId === preset.targetId) ||
          (c.sourceId === preset.targetId && c.targetId === preset.sourceId)
      );
      if (!exists) {
        list.push(preset);
      }
    });

    return list;
  }, [backendSections]);

  // Current active corridor match
  const activeCorridor = useMemo(() => {
    return allCorridors.find(
      (c) =>
        (c.sourceId === sourceId && c.targetId === targetId) ||
        (c.sourceId === targetId && c.targetId === sourceId)
    );
  }, [allCorridors, sourceId, targetId]);

  // List of stations that strictly belong to the available corridors
  const corridorStations = useMemo(() => {
    const stationIdSet = new Set<string>();
    allCorridors.forEach((c) => {
      stationIdSet.add(c.sourceId);
      stationIdSet.add(c.targetId);
      const route = findRailwayRoute(c.sourceId, c.targetId);
      if (route) {
        route.stationIds.forEach((id) => stationIdSet.add(id));
      }
    });
    return STATIONS.filter((s) => stationIdSet.has(s.id));
  }, [allCorridors]);

  const handleSwapClick = () => {
    setIsSwapping(true);
    onSwap();
    setTimeout(() => setIsSwapping(false), 300);
  };

  const handleCorridorSelect = (corridorId: string) => {
    const corr = allCorridors.find((c) => c.id === corridorId);
    if (corr) {
      onSourceChange(corr.sourceId);
      onTargetChange(corr.targetId);
    }
  };

  const selectedSource = getStationById(sourceId);
  const selectedTarget = getStationById(targetId);
  const hasSelection = Boolean(sourceId || targetId);

  return (
    <div className="w-full space-y-2.5">
      {/* Main Container */}
      <div className="p-3 sm:p-4 rounded-2xl bg-[#0d1527]/95 backdrop-blur-md border border-[#172642] shadow-2xl flex flex-col space-y-3">
      

        {/* Origin / Destination Station Selectors */}
        <div className="flex flex-col md:flex-row items-center gap-2.5 sm:gap-3">
          
          {/* Origin Station Box */}
          <div className="flex-1 w-full relative flex items-center bg-[#070b13] border border-[#1e2e4a] hover:border-emerald-500/60 focus-within:border-emerald-500 focus-within:ring-1 focus-within:ring-emerald-500/30 rounded-xl px-3.5 py-2.5 transition-all">
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
                {corridorStations.map((station) => (
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

          {/* Interactive Swap Direction Button */}
          <button
            onClick={handleSwapClick}
            disabled={!sourceId && !targetId}
            title="Reverse corridor direction"
            aria-label="Reverse corridor direction"
            className="p-2.5 rounded-xl bg-[#121c32] hover:bg-[#1a2948] text-slate-300 hover:text-emerald-400 border border-[#1e2e4a] hover:border-emerald-500/40 shadow-md transition-all flex-shrink-0 disabled:opacity-40 disabled:cursor-not-allowed group active:scale-90 cursor-pointer"
          >
            <ArrowRightLeft
              className={`w-4 h-4 transition-transform duration-300 ${
                isSwapping ? "rotate-180 text-emerald-400" : "group-hover:rotate-45"
              }`}
            />
          </button>

          {/* Destination Station Box */}
          <div className="flex-1 w-full relative flex items-center bg-[#070b13] border border-[#1e2e4a] hover:border-blue-500/60 focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500/30 rounded-xl px-3.5 py-2.5 transition-all">
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
                {corridorStations.map((station) => (
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

          {/* Reset Route Action */}
          <button
            onClick={onClear}
            disabled={!hasSelection}
            title="Reset selected corridor"
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
    </div>
  );
}
