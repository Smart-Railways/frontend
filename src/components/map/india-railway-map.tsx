"use client";

import React, { useState, useMemo } from "react";
import {
  ZoomIn,
  ZoomOut,
  Maximize2,
  Train,
  Clock,
  Radio,
} from "lucide-react";
import {
  STATIONS,
  TRACKS,
  RailwayStation,
  findRailwayRoute,
  getStationById,
} from "@/data/india-railway-network";
import { INDIA_MAP_DATA } from "@/data/india-map-paths";

interface IndiaRailwayMapProps {
  sourceId: string;
  targetId: string;
  onSelectStation?: (stationId: string) => void;
}

export function IndiaRailwayMap({
  sourceId,
  targetId,
  onSelectStation,
}: IndiaRailwayMapProps) {
  const [zoomLevel, setZoomLevel] = useState(1);
  const [hoveredStation, setHoveredStation] = useState<RailwayStation | null>(null);
  const [showHubsOnly, setShowHubsOnly] = useState(false);

  // Compute shortest railway route if both source and target are selected
  const activeRoute = useMemo(() => {
    if (!sourceId || !targetId || sourceId === targetId) return null;
    return findRailwayRoute(sourceId, targetId);
  }, [sourceId, targetId]);

  // Set of station IDs along the highlighted route
  const activeStationIdSet = useMemo(() => {
    return new Set(activeRoute?.stationIds || []);
  }, [activeRoute]);

  // Set of track keys along the highlighted route
  const activeTrackKeySet = useMemo(() => {
    const set = new Set<string>();
    if (!activeRoute || activeRoute.stationIds.length < 2) return set;
    const ids = activeRoute.stationIds;
    for (let i = 0; i < ids.length - 1; i++) {
      set.add(`${ids[i]}-${ids[i + 1]}`);
      set.add(`${ids[i + 1]}-${ids[i]}`);
    }
    return set;
  }, [activeRoute]);

  // Filter stations based on toggle
  const visibleStations = useMemo(() => {
    if (showHubsOnly) {
      return STATIONS.filter(
        (s) =>
          s.isHub ||
          s.isCapital ||
          s.id === sourceId ||
          s.id === targetId ||
          activeStationIdSet.has(s.id)
      );
    }
    return STATIONS;
  }, [showHubsOnly, sourceId, targetId, activeStationIdSet]);

  const sourceStation = getStationById(sourceId);
  const targetStation = getStationById(targetId);

  // Generate SVG path for the active route
  const activeRouteSvgPath = useMemo(() => {
    if (!activeRoute || activeRoute.stationIds.length < 2) return "";
    const points = activeRoute.stationIds
      .map((id) => getStationById(id))
      .filter((s): s is RailwayStation => Boolean(s))
      .map((s) => `${s.x},${s.y}`);
    return `M ${points.join(" L ")}`;
  }, [activeRoute]);

  return (
    <div className="relative w-full h-[680px] lg:h-[760px] rounded-3xl bg-[#060a13] border border-[#172642] shadow-2xl overflow-hidden flex flex-col">
      {/* Top Map Status & Controls Overlay */}
      <div className="absolute top-4 left-4 right-4 z-20 flex items-center justify-between pointer-events-none">
        {/* Network Status Badge */}
        <div className="pointer-events-auto flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#0d1527]/90 backdrop-blur-md border border-[#172642] shadow-xl">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="text-xs font-bold text-white tracking-wide">
            Indian Railways National Grid
          </span>
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300 font-mono font-bold">
            LIVE NETWORK
          </span>
        </div>

        {/* Map View Controls */}
        <div className="pointer-events-auto flex items-center gap-2">
          <button
            onClick={() => setShowHubsOnly(!showHubsOnly)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold backdrop-blur-md border transition-all shadow-md ${
              showHubsOnly
                ? "bg-blue-600/30 text-blue-300 border-blue-500/50"
                : "bg-[#0d1527]/90 text-slate-300 border-[#172642] hover:text-white"
            }`}
          >
            {showHubsOnly ? "Major Hubs" : "All Junctions"}
          </button>

          <div className="flex items-center bg-[#0d1527]/90 backdrop-blur-md border border-[#172642] rounded-full p-1 shadow-lg">
            <button
              onClick={() => setZoomLevel((z) => Math.min(z + 0.15, 2.2))}
              className="p-1.5 rounded-full text-slate-300 hover:text-white hover:bg-[#172642] transition-colors"
              title="Zoom In"
              aria-label="Zoom in"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setZoomLevel((z) => Math.max(z - 0.15, 0.75))}
              className="p-1.5 rounded-full text-slate-300 hover:text-white hover:bg-[#172642] transition-colors"
              title="Zoom Out"
              aria-label="Zoom out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setZoomLevel(1)}
              className="p-1.5 rounded-full text-slate-300 hover:text-white hover:bg-[#172642] transition-colors"
              title="Reset View"
              aria-label="Reset view"
            >
              <Maximize2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Interactive SVG Map Canvas */}
      <div className="relative flex-1 w-full h-full flex items-center justify-center overflow-hidden">
        {/* Cockpit Ambient Lighting & Grid */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_45%_48%,#0f1c36_0%,#050811_75%)] pointer-events-none"></div>
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#17264215_1px,transparent_1px),linear-gradient(to_bottom,#17264215_1px,transparent_1px)] bg-[size:36px_36px] pointer-events-none"></div>

        <svg
          viewBox={INDIA_MAP_DATA.viewBox}
          className="w-full h-full max-h-full transition-transform duration-300 ease-out select-none"
          style={{ transform: `scale(${zoomLevel})`, transformOrigin: "45% 48%" }}
        >
          <defs>
            {/* Primary AI Signal Green Glow Filter */}
            <filter id="ai-signal-glow" x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur stdDeviation="5" result="blur1" />
              <feGaussianBlur stdDeviation="2" result="blur2" />
              <feMerge>
                <feMergeNode in="blur1" />
                <feMergeNode in="blur2" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>

            {/* Linear Gradient for Active Route */}
            <linearGradient id="active-route-grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#10B981" />
              <stop offset="50%" stopColor="#00E676" />
              <stop offset="100%" stopColor="#34D399" />
            </linearGradient>
          </defs>

          {/* Real Official Survey Geographic Boundaries of India (All 36 States & Territories) */}
          <g className="india-states filter drop-shadow-[0_12px_36px_rgba(0,0,0,0.85)]">
            {INDIA_MAP_DATA.locations.map((loc) => (
              <path
                key={loc.id}
                d={loc.path}
                fill="#0b1323"
                stroke="#1c3050"
                strokeWidth="0.75"
                className="transition-colors hover:fill-[#101b33]"
              />
            ))}
          </g>

          {/* Background Railway Tracks (Precision Dual-Layer Rail Corridor) */}
          <g>
            {TRACKS.map((track) => {
              const fromStation = getStationById(track.from);
              const toStation = getStationById(track.to);
              if (!fromStation || !toStation) return null;

              const isTrackActive = activeTrackKeySet.has(`${track.from}-${track.to}`);
              if (isTrackActive) return null; // Rendered below with neon glow

              return (
                <g key={track.id} className="group">
                  {/* Outer dark casing */}
                  <line
                    x1={fromStation.x}
                    y1={fromStation.y}
                    x2={toStation.x}
                    y2={toStation.y}
                    stroke="#070d17"
                    strokeWidth="3.2"
                    strokeLinecap="round"
                  />
                  {/* Steel railway line */}
                  <line
                    x1={fromStation.x}
                    y1={fromStation.y}
                    x2={toStation.x}
                    y2={toStation.y}
                    stroke="#223a5e"
                    strokeWidth="1.4"
                    strokeDasharray={track.tracks === "Single" ? "3 2" : undefined}
                    className="transition-colors group-hover:stroke-blue-400"
                  />
                </g>
              );
            })}
          </g>

          {/* ACTIVE SELECTED RAILWAY CORRIDOR (Primary AI Signal Green) */}
          {activeRoute && activeRouteSvgPath && (
            <g>
              {/* Outer Luminous Green Glow Aura */}
              <path
                d={activeRouteSvgPath}
                fill="none"
                stroke="#10B981"
                strokeWidth="9"
                strokeLinecap="round"
                strokeLinejoin="round"
                filter="url(#ai-signal-glow)"
                opacity="0.85"
              />

              {/* Core Solid Signal Green Line */}
              <path
                d={activeRouteSvgPath}
                fill="none"
                stroke="url(#active-route-grad)"
                strokeWidth="4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* High-Speed Train Signal Flow Runner */}
              <path
                d={activeRouteSvgPath}
                fill="none"
                stroke="#ffffff"
                strokeWidth="2.2"
                strokeDasharray="12 24"
                strokeLinecap="round"
                className="animate-[pulse_1.5s_infinite]"
              >
                <animate
                  attributeName="stroke-dashoffset"
                  from="150"
                  to="0"
                  dur="2s"
                  repeatCount="indefinite"
                />
              </path>
            </g>
          )}

          {/* STATION NODES (Accurate Positioning on Real Indian Territory) */}
          {visibleStations.map((station) => {
            const isSource = station.id === sourceId;
            const isTarget = station.id === targetId;
            const isOnActiveRoute = activeStationIdSet.has(station.id);
            const isCapital = station.isCapital; // Delhi

            return (
              <g
                key={station.id}
                className="cursor-pointer group"
                onClick={() => onSelectStation?.(station.id)}
                onMouseEnter={() => setHoveredStation(station)}
                onMouseLeave={() => setHoveredStation(null)}
              >
                {/* Origin Green Radar Ping */}
                {isSource && (
                  <>
                    <circle
                      cx={station.x}
                      cy={station.y}
                      r="20"
                      fill="none"
                      stroke="#10B981"
                      strokeWidth="1.8"
                      opacity="0.7"
                      className="animate-ping"
                    />
                    <circle
                      cx={station.x}
                      cy={station.y}
                      r="13"
                      fill="rgba(16, 185, 129, 0.25)"
                      stroke="#00E676"
                      strokeWidth="1.5"
                    />
                  </>
                )}

                {/* Destination Blue Radar Ping */}
                {isTarget && (
                  <>
                    <circle
                      cx={station.x}
                      cy={station.y}
                      r="20"
                      fill="none"
                      stroke="#3b82f6"
                      strokeWidth="1.8"
                      opacity="0.7"
                      className="animate-ping"
                    />
                    <circle
                      cx={station.x}
                      cy={station.y}
                      r="13"
                      fill="rgba(59, 130, 246, 0.25)"
                      stroke="#60a5fa"
                      strokeWidth="1.5"
                    />
                  </>
                )}

                {/* DELHI Red Box Marker (Distinctive feature in reference image) */}
                {isCapital && !isSource && !isTarget ? (
                  <rect
                    x={station.x - 5.5}
                    y={station.y - 5.5}
                    width="11"
                    height="11"
                    rx="1.5"
                    fill="#EF4444"
                    stroke="#ffffff"
                    strokeWidth="1.8"
                    className="shadow-md shadow-red-950 transition-transform group-hover:scale-125"
                  />
                ) : (
                  /* Standard Railway Junction Marker: Gold circle with dark border (Reference style) */
                  <circle
                    cx={station.x}
                    cy={station.y}
                    r={isSource || isTarget ? 6.5 : isOnActiveRoute ? 5.2 : station.isHub ? 4.2 : 3.2}
                    fill={
                      isSource
                        ? "#10B981"
                        : isTarget
                        ? "#3B82F6"
                        : isOnActiveRoute
                        ? "#10B981"
                        : "#F59E0B"
                    }
                    stroke={isSource || isTarget ? "#ffffff" : "#0f172a"}
                    strokeWidth={isSource || isTarget ? "2.2" : "1.2"}
                    className="transition-transform duration-200 group-hover:scale-135"
                  />
                )}

                {/* Center White Dot for Hubs/Endpoints */}
                {(station.isHub || isSource || isTarget) && !isCapital && (
                  <circle
                    cx={station.x}
                    cy={station.y}
                    r="1.4"
                    fill="#ffffff"
                  />
                )}

                {/* Station Name Label with high-contrast text */}
                <text
                  x={station.x}
                  y={station.y - (isSource || isTarget ? 11 : isCapital ? 9 : 6)}
                  textAnchor="middle"
                  fill={
                    isSource
                      ? "#10B981"
                      : isTarget
                      ? "#60a5fa"
                      : isCapital
                      ? "#fca5a5"
                      : isOnActiveRoute
                      ? "#34d399"
                      : "#cbd5e1"
                  }
                  fontSize={isCapital ? "10" : isSource || isTarget ? "10" : "7"}
                  fontWeight={isCapital || isSource || isTarget ? "800" : "600"}
                  letterSpacing="0.2"
                  className="pointer-events-none drop-shadow-[0_1px_3px_rgba(0,0,0,0.95)]"
                >
                  {station.name}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Hovered Station Tooltip */}
        {hoveredStation && (
          <div
            className="absolute z-30 pointer-events-none bg-[#070b13]/95 backdrop-blur-md border border-[#172642] p-3 rounded-xl shadow-2xl text-white space-y-1 transform -translate-x-1/2 -translate-y-full mb-3"
            style={{
              left: `${(hoveredStation.x / 612) * 100}%`,
              top: `${(hoveredStation.y / 696) * 100}%`,
            }}
          >
            <div className="flex items-center justify-between gap-3">
              <span className="font-extrabold text-xs text-white">
                {hoveredStation.name}
              </span>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300 font-mono">
                {hoveredStation.code}
              </span>
            </div>
            <div className="text-[11px] text-slate-400">
              {hoveredStation.city}, {hoveredStation.state}
            </div>
            <div className="flex items-center gap-3 pt-1 border-t border-[#172642] text-[10px] text-slate-300">
              <span>Zone: <strong className="text-emerald-400">{hoveredStation.zone}</strong></span>
              <span>Platforms: <strong>{hoveredStation.platforms}</strong></span>
            </div>
          </div>
        )}
      </div>

      {/* Floating Route Summary HUD Card */}
      {activeRoute && sourceStation && targetStation && (
        <div className="absolute bottom-4 left-4 right-4 z-20 pointer-events-auto">
          <div className="rounded-2xl bg-[#070b13]/95 backdrop-blur-xl border border-emerald-500/40 p-4 shadow-2xl shadow-emerald-950/40 flex flex-col md:flex-row items-center justify-between gap-4 animate-in fade-in slide-in-from-bottom-3 duration-300">
            {/* Origin & Destination */}
            <div className="flex items-center gap-3 w-full md:w-auto">
              <div className="flex items-center justify-center w-11 h-11 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.3)]">
                <Train className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm text-white">
                    {sourceStation.name} ({sourceStation.code})
                  </span>
                  <span className="text-emerald-400 font-bold">→</span>
                  <span className="font-bold text-sm text-white">
                    {targetStation.name} ({targetStation.code})
                  </span>
                </div>
                <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-400">
                  <span>{activeRoute.stationIds.length - 1} Corridors</span>
                  <span>•</span>
                  <span className="text-emerald-300 font-medium">
                    {activeRoute.popularTrains[0]}
                  </span>
                </div>
              </div>
            </div>

            {/* Route Metrics */}
            <div className="flex items-center justify-between md:justify-end gap-6 w-full md:w-auto border-t md:border-t-0 md:border-l border-[#172642] pt-2 md:pt-0 md:pl-6">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Track Distance
                </span>
                <span className="text-base font-extrabold text-white tracking-tight">
                  {activeRoute.totalDistanceKm.toLocaleString()} km
                </span>
              </div>

              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Est. Travel Time
                </span>
                <span className="text-base font-extrabold text-white tracking-tight flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-blue-400" />
                  {Math.floor(activeRoute.estDurationMinutes / 60)}h{" "}
                  {activeRoute.estDurationMinutes % 60}m
                </span>
              </div>

              <div className="hidden sm:block">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Corridor Health
                </span>
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-semibold">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  <span>Optimal Signal</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
