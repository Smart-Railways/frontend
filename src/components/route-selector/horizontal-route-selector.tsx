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

function formatStationLabel(station: { name: string; code: string; city?: string }) {
  const rawName = station.city || station.name;
  const titleCaseName = rawName
    .toLowerCase()
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

  return `${titleCaseName} (${station.code})`;
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
  <div className="w-full">
    <div
      className={cn(
        "relative flex flex-col md:flex-row items-stretch md:items-center",
        "rounded-2xl border border-brand-border/70",
        "bg-brand-surface/80 backdrop-blur-sm",
        "p-2",
        "shadow-[0_2px_12px_rgba(0,0,0,0.035)]"
      )}
    >
      {/* ORIGIN */}
      <div
        className={cn(
          "group flex-1 min-w-0",
          "rounded-xl",
          "px-4 py-3",
          "transition-all duration-200",
          "hover:bg-brand-blue-light/20",
          "focus-within:bg-brand-blue-light/20"
        )}
      >
        <div className="flex items-center gap-3">
          {/* Origin icon */}
          <div
            className={cn(
              "flex size-9 shrink-0 items-center justify-center",
              "rounded-lg",
              "bg-brand-blue-light/70"
            )}
          >
            <div className="size-2.5 rounded-full bg-brand-primary ring-[3px] ring-brand-primary/15" />
          </div>

          <div className="min-w-0 flex-1">
            <div className="mb-0.5 flex items-center gap-2">
              <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-brand-muted">
                From
              </span>
            </div>

            <Select
              value={sourceId || ""}
              onValueChange={(val) => val && onSourceChange(val)}
            >
              <SelectTrigger
                className={cn(
                  "h-auto w-full border-0 bg-transparent p-0",
                  "shadow-none outline-none",
                  "hover:bg-transparent",
                  "focus:ring-0 focus:ring-offset-0",
                  "focus-visible:ring-0 focus-visible:ring-offset-0",
                  "justify-start gap-2",
                  "text-left"
                )}
              >
                <SelectValue placeholder="Choose origin station...">
                  {selectedSource ? (
                    <div className="flex min-w-0 items-center gap-2">
                      <span className="truncate text-[15px] font-semibold tracking-[-0.01em] text-brand-secondary">
                        {selectedSource.city || selectedSource.name}
                      </span>

                      <span className="shrink-0 rounded-md bg-brand-blue-light/70 px-1.5 py-0.5 text-[10px] font-bold tracking-wide text-brand-primary">
                        {selectedSource.code}
                      </span>
                    </div>
                  ) : undefined}
                </SelectValue>
              </SelectTrigger>

              <SelectContent
                className={cn(
                  "max-h-72 min-w-[280px]",
                  "rounded-xl",
                  "border-brand-border",
                  "bg-brand-surface",
                  "p-1.5",
                  "shadow-xl"
                )}
              >
                {corridorStations.map((station) => (
                  <SelectItem
                    key={`src-${station.id}`}
                    value={station.id}
                    disabled={station.id === targetId}
                    className={cn(
                      "rounded-lg px-3 py-2.5",
                      "text-brand-secondary",
                      "cursor-pointer",
                      "focus:bg-brand-blue-light/50",
                      "focus:text-brand-primary"
                    )}
                  >
                    <div className="flex items-center justify-between gap-4">
                      <span className="font-medium">
                        {formatStationLabel(station).split(" (")[0]}
                      </span>

                      <span className="text-[10px] font-bold text-brand-muted">
                        {station.code}
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* CENTER CONNECTION */}
      <div className="relative flex items-center justify-center px-1 md:px-0">
        {/* Desktop connector */}
        <div className="absolute left-0 right-0 top-1/2 hidden h-px bg-brand-border/60 md:block" />

        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={handleSwapClick}
          disabled={!sourceId && !targetId}
          title="Reverse corridor direction"
          aria-label="Reverse corridor direction"
          className={cn(
            "relative z-10 size-9 shrink-0 rounded-full",
            "border border-brand-border",
            "bg-brand-surface",
            "text-brand-secondary",
            "shadow-[0_1px_4px_rgba(0,0,0,0.06)]",
            "transition-all duration-200",
            "hover:border-brand-primary/30",
            "hover:bg-brand-blue-light/60",
            "hover:text-brand-primary",
            "active:scale-90",
            "disabled:cursor-not-allowed disabled:opacity-40",
            "cursor-pointer"
          )}
        >
          <ArrowRightLeft
            className={cn(
              "size-3.5 transition-transform duration-300",
              isSwapping && "rotate-180 text-brand-primary"
            )}
          />
        </Button>
      </div>

      {/* DESTINATION */}
      <div
        className={cn(
          "group flex-1 min-w-0",
          "rounded-xl",
          "px-4 py-3",
          "transition-all duration-200",
          "hover:bg-brand-blue-light/20",
          "focus-within:bg-brand-blue-light/20"
        )}
      >
        <div className="flex items-center gap-3">
          {/* Destination icon */}
          <div
            className={cn(
              "flex size-9 shrink-0 items-center justify-center",
              "rounded-lg",
              "bg-brand-blue-light/70"
            )}
          >
            <MapPin className="size-4 text-brand-primary" strokeWidth={2.2} />
          </div>

          <div className="min-w-0 flex-1">
            <div className="mb-0.5 flex items-center gap-2">
              <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-brand-muted">
                To
              </span>
            </div>

            <Select
              value={targetId || ""}
              onValueChange={(val) => val && onTargetChange(val)}
            >
              <SelectTrigger
                className={cn(
                  "h-auto w-full border-0 bg-transparent p-0",
                  "shadow-none outline-none",
                  "hover:bg-transparent",
                  "focus:ring-0 focus:ring-offset-0",
                  "focus-visible:ring-0 focus-visible:ring-offset-0",
                  "justify-start gap-2",
                  "text-left"
                )}
              >
                <SelectValue placeholder="Choose destination station...">
                  {selectedTarget ? (
                    <div className="flex min-w-0 items-center gap-2">
                      <span className="truncate text-[15px] font-semibold tracking-[-0.01em] text-brand-secondary">
                        {selectedTarget.city || selectedTarget.name}
                      </span>

                      <span className="shrink-0 rounded-md bg-brand-blue-light/70 px-1.5 py-0.5 text-[10px] font-bold tracking-wide text-brand-primary">
                        {selectedTarget.code}
                      </span>
                    </div>
                  ) : undefined}
                </SelectValue>
              </SelectTrigger>

              <SelectContent
                className={cn(
                  "max-h-72 min-w-[280px]",
                  "rounded-xl",
                  "border-brand-border",
                  "bg-brand-surface",
                  "p-1.5",
                  "shadow-xl"
                )}
              >
                {corridorStations.map((station) => (
                  <SelectItem
                    key={`dst-${station.id}`}
                    value={station.id}
                    disabled={station.id === sourceId}
                    className={cn(
                      "rounded-lg px-3 py-2.5",
                      "text-brand-secondary",
                      "cursor-pointer",
                      "focus:bg-brand-blue-light/50",
                      "focus:text-brand-primary"
                    )}
                  >
                    <div className="flex items-center justify-between gap-4">
                      <span className="font-medium">
                        {formatStationLabel(station).split(" (")[0]}
                      </span>

                      <span className="text-[10px] font-bold text-brand-muted">
                        {station.code}
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    </div>
  </div>
);
}