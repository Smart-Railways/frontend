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

    backendSections.forEach((sec) => {
      let srcStation = getStationByName(sec.origin_station);
      let dstStation = getStationByName(sec.end_station);

      if (!srcStation || !dstStation) {
        const parts = sec.section_name
          .split(/[-–—]/)
          .map((p) => p.trim());

        if (parts.length >= 2) {
          if (!srcStation) srcStation = getStationByName(parts[0]);
          if (!dstStation) dstStation = getStationByName(parts[1]);
        }
      }

      if (srcStation && dstStation) {
        const exists = list.some(
          (c) =>
            (c.sourceId === srcStation.id &&
              c.targetId === dstStation.id) ||
            (c.sourceId === dstStation.id &&
              c.targetId === srcStation.id)
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

    AVAILABLE_CORRIDORS.forEach((preset) => {
      const exists = list.some(
        (c) =>
          (c.sourceId === preset.sourceId &&
            c.targetId === preset.targetId) ||
          (c.sourceId === preset.targetId &&
            c.targetId === preset.sourceId)
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
    <div className="w-full border-none">
      {/* Main Container Card */}
      <Card className="p-1.5 rounded-2xl bg-brand-surface border border-brand-border ring-0 shadow-xs flex flex-col space-y-2">
        {/* Origin / Destination Station Selectors */}
        <div className="flex flex-col md:flex-row items-center gap-2 sm:gap-2.5">

          {/* Origin Station Box */}
          <div className="flex-1 w-full relative flex items-center bg-brand-surface border border-brand-border/80 hover:border-brand-primary/50 focus-within:border-brand-primary focus-within:ring-1 focus-within:ring-brand-primary/20 rounded-xl px-3.5 py-2.5 transition-all shadow-2xs">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-brand-blue-light/70 text-brand-primary mr-3 shrink-0">
              <div className="w-2.5 h-2.5 rounded-full bg-brand-primary ring-2 ring-brand-primary/20" />
            </div>

            <div className="flex-1 min-w-0">
              <label className="text-[11px] font-medium text-brand-muted tracking-wider block mb-0.5">
                Origin Station
              </label>

              <Select
                value={sourceId || ""}
                onValueChange={(val) => val && onSourceChange(val)}
              >
                <SelectTrigger className="w-full h-auto p-0 bg-transparent border-0 text-brand-secondary text-xs sm:text-sm font-semibold focus:ring-0 focus-visible:ring-0 focus-visible:border-transparent shadow-none hover:bg-transparent justify-between cursor-pointer">
                  <SelectValue placeholder="Choose origin station...">
                    {selectedSource
                      ? `${selectedSource.name} (${selectedSource.code})`
                      : undefined}
                  </SelectValue>
                </SelectTrigger>

                <SelectContent className="bg-brand-surface border-brand-border text-brand-secondary max-h-60 overflow-y-auto shadow-lg">
                  {corridorStations.map((station) => (
                    <SelectItem
                      key={`src-${station.id}`}
                      value={station.id}
                      disabled={station.id === targetId}
                      className="text-brand-secondary focus:bg-brand-blue-light focus:text-brand-primary text-xs font-medium cursor-pointer"
                    >
                      {station.name} ({station.code}) — {station.city}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

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
            className="p-2.5 size-auto rounded-full bg-brand-surface hover:bg-brand-blue-light/50 text-brand-secondary hover:text-brand-primary border-brand-border/80 shadow-2xs transition-all flex-shrink-0 disabled:opacity-40 disabled:cursor-not-allowed group active:scale-90 cursor-pointer"
          >
            <ArrowRightLeft
              className={cn(
                "w-4 h-4 transition-transform duration-300",
                isSwapping
                  ? "rotate-180 text-brand-primary"
                  : "group-hover:text-brand-primary"
              )}
            />
          </Button>

          {/* Destination Station Box */}
          <div className="flex-1 w-full relative flex items-center bg-brand-surface border border-brand-border/80 hover:border-brand-primary/50 focus-within:border-brand-primary focus-within:ring-1 focus-within:ring-brand-primary/20 rounded-xl px-3.5 py-2.5 transition-all shadow-2xs">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-brand-blue-light/70 text-brand-primary mr-3 shrink-0">
              <MapPin className="w-4 h-4 text-brand-primary" />
            </div>

            <div className="flex-1 min-w-0">
              <label className="text-[11px] font-medium text-brand-muted tracking-wider block mb-0.5">
                Destination Station
              </label>

              <Select
                value={targetId || ""}
                onValueChange={(val) => val && onTargetChange(val)}
              >
                <SelectTrigger className="w-full h-auto p-0 bg-transparent border-0 text-brand-secondary text-xs sm:text-sm font-semibold focus:ring-0 focus-visible:ring-0 focus-visible:border-transparent shadow-none hover:bg-transparent justify-between cursor-pointer">
                  <SelectValue placeholder="Choose destination station...">
                    {selectedTarget
                      ? `${selectedTarget.name} (${selectedTarget.code})`
                      : undefined}
                  </SelectValue>
                </SelectTrigger>

                <SelectContent className="bg-brand-surface border-brand-border text-brand-secondary max-h-60 overflow-y-auto shadow-lg">
                  {corridorStations.map((station) => (
                    <SelectItem
                      key={`dst-${station.id}`}
                      value={station.id}
                      disabled={station.id === sourceId}
                      className="text-brand-secondary focus:bg-brand-blue-light focus:text-brand-primary text-xs font-medium cursor-pointer"
                    >
                      {station.name} ({station.code}) — {station.city}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

        </div>
      </Card>
    </div>
  );
}