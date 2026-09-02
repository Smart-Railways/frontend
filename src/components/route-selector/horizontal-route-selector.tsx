"use client";

import React, { useState, useMemo } from "react";
import {
  ArrowRightLeft,
  MapPin,
  RotateCcw,
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
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

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

  const selectedSource = getStationById(sourceId);
  const selectedTarget = getStationById(targetId);
  const hasSelection = Boolean(sourceId || targetId);

  return (
    <div className="w-full space-y-2.5">
      {/* Main Container */}
      <Card className="p-3 sm:p-4 rounded-2xl bg-[#0d1527]/95 backdrop-blur-md border-[#172642] shadow-2xl flex flex-col space-y-3 gap-0">
        {/* Origin / Destination Station Selectors */}
        <div className="flex flex-col md:flex-row items-center gap-2.5 sm:gap-3">
          {/* Origin Station Box */}
          <div className="flex-1 w-full relative flex items-center bg-[#070b13] border border-[#1e2e4a] hover:border-emerald-500/60 focus-within:border-emerald-500 focus-within:ring-1 focus-within:ring-emerald-500/30 rounded-xl px-3.5 py-2.5 transition-all">
            <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 mr-3 flex-shrink-0">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.9)] animate-pulse" />
            </div>
            <div className="flex-1 min-w-0">
              <label className="text-[10px] font-bold text-slate-400 tracking-wider block">
                Origin Station
              </label>
              <Select
                value={sourceId || ""}
                onValueChange={(val) => val && onSourceChange(val)}
              >
                <SelectTrigger className="w-full h-auto p-0 bg-transparent border-0 text-white text-xs font-semibold focus:ring-0 focus-visible:ring-0 focus-visible:border-transparent shadow-none hover:bg-transparent justify-between cursor-pointer">
                  <SelectValue placeholder="Choose origin station...">
                    {selectedSource ? `${selectedSource.name} (${selectedSource.code})` : undefined}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent className="bg-[#0d1527] border-[#172642] text-white max-h-60 overflow-y-auto">
                  {corridorStations.map((station) => (
                    <SelectItem
                      key={`src-${station.id}`}
                      value={station.id}
                      disabled={station.id === targetId}
                      className="text-white focus:bg-[#172642] focus:text-white text-xs cursor-pointer"
                    >
                      {station.name} ({station.code}) — {station.city}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {selectedSource && (
              <Badge
                variant="outline"
                className="hidden sm:inline-flex text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-950/60 text-emerald-300 border-emerald-500/30 ml-2"
              >
                {selectedSource.code}
              </Badge>
            )}
          </div>

          {/* Interactive Swap Direction Button */}
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={handleSwapClick}
            disabled={!sourceId && !targetId}
            title="Reverse corridor direction"
            aria-label="Reverse corridor direction"
            className="p-2.5 size-auto rounded-xl bg-[#121c32] hover:bg-[#1a2948] text-slate-300 hover:text-emerald-400 border-[#1e2e4a] hover:border-emerald-500/40 shadow-md transition-all flex-shrink-0 disabled:opacity-40 disabled:cursor-not-allowed group active:scale-90 cursor-pointer"
          >
            <ArrowRightLeft
              className={cn(
                "w-4 h-4 transition-transform duration-300",
                isSwapping ? "rotate-180 text-emerald-400" : "group-hover:rotate-45"
              )}
            />
          </Button>

          {/* Destination Station Box */}
          <div className="flex-1 w-full relative flex items-center bg-[#070b13] border border-[#1e2e4a] hover:border-blue-500/60 focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500/30 rounded-xl px-3.5 py-2.5 transition-all">
            <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-blue-500/15 border border-blue-500/30 text-blue-400 mr-3 flex-shrink-0">
              <MapPin className="w-3.5 h-3.5" />
            </div>
            <div className="flex-1 min-w-0">
              <label className="text-[10px] font-bold text-slate-400 tracking-wider block">
                Destination Station
              </label>
              <Select
                value={targetId || ""}
                onValueChange={(val) => val && onTargetChange(val)}
              >
                <SelectTrigger className="w-full h-auto p-0 bg-transparent border-0 text-white text-xs font-semibold focus:ring-0 focus-visible:ring-0 focus-visible:border-transparent shadow-none hover:bg-transparent justify-between cursor-pointer">
                  <SelectValue placeholder="Choose destination station...">
                    {selectedTarget ? `${selectedTarget.name} (${selectedTarget.code})` : undefined}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent className="bg-[#0d1527] border-[#172642] text-white max-h-60 overflow-y-auto">
                  {corridorStations.map((station) => (
                    <SelectItem
                      key={`dst-${station.id}`}
                      value={station.id}
                      disabled={station.id === sourceId}
                      className="text-white focus:bg-[#172642] focus:text-white text-xs cursor-pointer"
                    >
                      {station.name} ({station.code}) — {station.city}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {selectedTarget && (
              <Badge
                variant="outline"
                className="hidden sm:inline-flex text-[10px] font-bold px-2 py-0.5 rounded bg-blue-950/60 text-blue-300 border-blue-500/30 ml-2"
              >
                {selectedTarget.code}
              </Badge>
            )}
          </div>

          {/* Reset Route Action */}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onClear}
            disabled={!hasSelection}
            title="Reset selected corridor"
            className={cn(
              "flex items-center gap-1.5 px-3 py-2.5 rounded-xl border transition-all text-xs font-semibold flex-shrink-0 group h-auto",
              hasSelection
                ? "bg-[#121c32] hover:bg-[#182645] text-slate-300 hover:text-white border-[#1e2e4a] hover:border-slate-500/50 shadow-md cursor-pointer active:scale-95"
                : "bg-[#0a0f1d] text-slate-600 border-[#152033] cursor-not-allowed opacity-50"
            )}
          >
            <RotateCcw
              className={cn(
                "w-3.5 h-3.5 transition-transform duration-300",
                hasSelection
                  ? "group-hover:-rotate-90 text-slate-400 group-hover:text-emerald-400"
                  : "text-slate-600"
              )}
            />
            <span className="hidden sm:inline">Reset</span>
          </Button>
        </div>
      </Card>
    </div>
  );
}
