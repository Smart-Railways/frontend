"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  MapContainer,
  TileLayer,
  Polyline,
  Marker,
  Popup,
  Tooltip,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import {
  ZoomIn,
  ZoomOut,
  Maximize2,
  Train as TrainIcon,
  Clock,
  Wrench,
  AlertTriangle,
  ExternalLink,
} from "lucide-react";
import {
  STATIONS,
  RailwayStation,
  findRailwayRoute,
  getStationById,
} from "@/data/india-railway-network";
import { useMaintenanceTasks } from "@/hooks";

interface IndiaLeafletMapProps {
  sourceId: string;
  targetId: string;
  onSelectStation?: (stationId: string) => void;
}

// Clean, bold, professional Leaflet DivIcons strictly adhering to the 4-color palette
// No circular glowing rings, no animate-ping, high contrast
function createStationIcon(
  station: RailwayStation,
  isSource: boolean,
  isTarget: boolean,
  isOnRoute: boolean
) {
  // Origin Station: Primary AI Signal Green (#10B981)
  if (isSource) {
    return L.divIcon({
      className: "custom-leaflet-marker",
      html: `
        <div class="relative flex flex-col items-center -translate-x-1/2 -translate-y-1/2 select-none">
          <div class="flex items-center justify-center px-2 py-0.5 rounded-md bg-[#072ac8] border-2 border-white text-white text-[10px] font-black tracking-wider shadow-md">
            START
          </div>
          <span class="mt-1 px-2 py-0.5 rounded-md bg-[#070b13] border border-[#072ac8] text-[#072ac8] text-[10px] font-extrabold whitespace-nowrap shadow-md">
            ${station.name} (${station.code})
          </span>
        </div>
      `,
      iconSize: [60, 36],
      iconAnchor: [30, 18],
    });
  }

  // Destination Station: Secondary Railway Blue (#2563EB)
  if (isTarget) {
    return L.divIcon({
      className: "custom-leaflet-marker",
      html: `
        <div class="relative flex flex-col items-center -translate-x-1/2 -translate-y-1/2 select-none">
          <div class="flex items-center justify-center px-2 py-0.5 rounded-md bg-[#072ac8] border-2 border-white text-white text-[10px] font-black tracking-wider shadow-md">
            END
          </div>
          <span class="mt-1 px-2 py-0.5 rounded-md bg-[#070b13] border border-[#072ac8] text-[#072ac8] text-[10px] font-extrabold whitespace-nowrap shadow-md">
            ${station.name} (${station.code})
          </span>
        </div>
      `,
      iconSize: [60, 36],
      iconAnchor: [30, 18],
    });
  }

  // Intermediate Corridor Stations: Solid AI Signal Green dot with clean white border
  if (isOnRoute) {
    return L.divIcon({
      className: "custom-leaflet-marker",
      html: `
        <div class="relative flex flex-col items-center -translate-x-1/2 -translate-y-1/2 group select-none">
          <div class="w-3.5 h-3.5 rounded-full bg-[#072ac8] border-2 border-white shadow-md"></div>
          <span class="mt-1 px-1.5 py-0.5 rounded bg-[#070b13] border border-[#172642] text-[9px] font-bold text-slate-200 whitespace-nowrap shadow-md">
            ${station.name}
          </span>
        </div>
      `,
      iconSize: [40, 26],
      iconAnchor: [20, 7],
    });
  }

  // Other Stations: Subtle Railway Blue dot
  return L.divIcon({
    className: "custom-leaflet-marker",
    html: `
      <div class="w-2.5 h-2.5 rounded-full bg-[#3B82F6]/60 border border-[#070b13] -translate-x-1/2 -translate-y-1/2 select-none"></div>
    `,
    iconSize: [10, 10],
    iconAnchor: [5, 5],
  });
}

// Controller component to smoothly fly map to active corridor bounds
function MapBoundsController({
  routeCoordinates,
  sourceStation,
  targetStation,
}: {
  routeCoordinates: [number, number][];
  sourceStation?: RailwayStation;
  targetStation?: RailwayStation;
}) {
  const map = useMap();

  useEffect(() => {
    if (routeCoordinates.length > 1) {
      const bounds = L.latLngBounds(routeCoordinates);
      map.flyToBounds(bounds, {
        padding: [80, 80],
        maxZoom: 10,
        duration: 1.2,
      });
    } else if (sourceStation) {
      map.flyTo([sourceStation.lat, sourceStation.lng], 8, { duration: 1 });
    }
  }, [map, routeCoordinates, sourceStation, targetStation]);

  return null;
}

// Custom Map Overlay Buttons Inside Leaflet Container
function MapControls({
  onResetView,
}: {
  onResetView: () => void;
}) {
  const map = useMap();

  return (
    <div className="leaflet-top leaflet-right" style={{ pointerEvents: "auto", margin: "16px" }}>
      <div className="flex items-center gap-2">
        <div className="flex items-center bg-[#0d1527]/90 backdrop-blur-md border border-[#172642] rounded-full p-1 shadow-2xl">
          <button
            onClick={() => map.zoomIn()}
            className="p-1.5 rounded-full text-slate-300 hover:text-white hover:bg-[#172642] transition-colors cursor-pointer"
            title="Zoom In"
            aria-label="Zoom in"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => map.zoomOut()}
            className="p-1.5 rounded-full text-slate-300 hover:text-white hover:bg-[#172642] transition-colors cursor-pointer"
            title="Zoom Out"
            aria-label="Zoom out"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onResetView}
            className="p-1.5 rounded-full text-slate-300 hover:text-white hover:bg-[#172642] transition-colors cursor-pointer"
            title="Fit India Map"
            aria-label="Fit India Map"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}

export function IndiaLeafletMap({
  sourceId,
  targetId,
  onSelectStation,
}: IndiaLeafletMapProps) {
  const [mapInstance, setMapInstance] = useState<L.Map | null>(null);

  // Fetch real-time maintenance tasks from database
  const { data: maintenanceTasks = [] } = useMaintenanceTasks();

  // Compute active railway route for the selected corridor
  const activeRoute = useMemo(() => {
    if (!sourceId || !targetId || sourceId === targetId) return null;
    return findRailwayRoute(sourceId, targetId);
  }, [sourceId, targetId]);

  const sourceStation = getStationById(sourceId);
  const targetStation = getStationById(targetId);

  // Match real maintenance tasks to the active route / corridor
  const activeMaintenanceTasks = useMemo(() => {
    if (!sourceStation || !targetStation) return [];

    const stationCodes = new Set([
      sourceStation.code.toLowerCase(),
      targetStation.code.toLowerCase(),
      sourceStation.id.toLowerCase(),
      targetStation.id.toLowerCase(),
      ...(activeRoute?.stationIds || []).map((id) => id.toLowerCase()),
    ]);

    const stationNames = [
      sourceStation.name.toLowerCase(),
      sourceStation.city.toLowerCase(),
      targetStation.name.toLowerCase(),
      targetStation.city.toLowerCase(),
    ];

    return maintenanceTasks.filter((task) => {
      const text = `${task.section_name || ""} ${task.asset_name || ""} ${task.details || ""} ${task.task_code || ""}`.toLowerCase();

      // Direct name check
      const hasNameMatch = stationNames.some((name) => name.length > 2 && text.includes(name));
      if (hasNameMatch) return true;

      // Station code check
      for (const code of stationCodes) {
        if (code.length >= 2 && text.includes(code)) return true;
      }

      return false;
    });
  }, [maintenanceTasks, sourceStation, targetStation, activeRoute]);

  const hasActiveMaintenance = activeMaintenanceTasks.length > 0;
  const primaryMaintenanceTask = activeMaintenanceTasks[0];

  // Set of station IDs strictly belonging to the active corridor
  const activeStationIdSet = useMemo(() => {
    const set = new Set<string>(activeRoute?.stationIds || []);
    if (sourceId) set.add(sourceId);
    if (targetId) set.add(targetId);
    return set;
  }, [activeRoute, sourceId, targetId]);

  // Coordinates for the highlighted corridor route
  const routeCoordinates: [number, number][] = useMemo(() => {
    if (!activeRoute) return [];
    return activeRoute.geoCoordinates;
  }, [activeRoute]);

  // STRICTLY FILTER STATIONS: Only show the stations that are in the chosen corridor!
  const visibleStations = useMemo(() => {
    if (activeStationIdSet.size > 0) {
      return STATIONS.filter((s) => activeStationIdSet.has(s.id));
    }
    return STATIONS.filter((s) => s.id === "ndls" || s.id === "mtj" || s.id === "st" || s.id === "mmct");
  }, [activeStationIdSet]);

  const handleResetIndiaView = () => {
    if (mapInstance && routeCoordinates.length > 1) {
      const bounds = L.latLngBounds(routeCoordinates);
      mapInstance.flyToBounds(bounds, { padding: [80, 80], maxZoom: 10, duration: 1.2 });
    } else if (mapInstance) {
      mapInstance.flyTo([22.5937, 78.9629], 5, { duration: 1.2 });
    }
  };

  return (
    <div className="relative w-full h-[680px] lg:h-[760px] rounded-3xl bg-[#060a13] border border-[#172642] shadow-2xl overflow-hidden flex flex-col z-0">
      
      {/* Top Left Active Corridor Header Badge */}
      <div
        style={{ zIndex: 400 }}
        className="absolute top-4 left-4 flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-[#0d1527]/95 backdrop-blur-md border border-[#172642] shadow-2xl pointer-events-auto flex-wrap"
      >
        <span className="w-2 h-2 rounded-full bg-emerald-400 flex-shrink-0"></span>
        <span className="text-xs font-bold text-white tracking-wide">
          Corridor Section:
        </span>
        <span className="text-xs font-extrabold text-emerald-400">
          {sourceStation ? sourceStation.name : "--"} → {targetStation ? targetStation.name : "--"}
        </span>
        <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#172642] text-slate-300 font-mono font-bold">
          {visibleStations.length} STATIONS
        </span>

        {hasActiveMaintenance && (
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/15 text-red-500 border border-amber-500/30 font-bold flex items-center gap-1">
            <Wrench className="w-3 h-3 text-red-500" />
            <span>MAINTENANCE NOTICE ({activeMaintenanceTasks.length})</span>
          </span>
        )}
      </div>

      {/* Main Leaflet Map */}
      <MapContainer
        center={sourceStation ? [sourceStation.lat, sourceStation.lng] : [22.5937, 78.9629]}
        zoom={6}
        minZoom={4}
        maxZoom={14}
        className="w-full h-full z-0"
        style={{ background: "#060a13" }}
        ref={setMapInstance}
        zoomControl={false}
      >
        {/* CartoDB Dark Matter Base Tiles */}
        <TileLayer
          attribution='&copy; <a href="https://carto.com/">CARTO</a>, &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url={
            process.env.NEXT_PUBLIC_MAP_TILE_URL ||
            (process.env.NEXT_PUBLIC_CARTO_API_KEY
              ? `https://{s}.basemaps.cartocdn.com/rastertiles/dark_all/{z}/{x}/{y}.png?key=${process.env.NEXT_PUBLIC_CARTO_API_KEY}`
              : "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png")
          }
          subdomains="abcd"
          maxZoom={19}
        />

        {/* Map Controller for dynamic bounds & overlays */}
        <MapBoundsController
          routeCoordinates={routeCoordinates}
          sourceStation={sourceStation}
          targetStation={targetStation}
        />

        <MapControls onResetView={handleResetIndiaView} />

        {/* HIGHLIGHTED ACTIVE CORRIDOR (Bold, clean, professional - Primary AI Signal Green) */}
        {routeCoordinates.length > 1 && (
          <>
            {/* Outer high-contrast dark casing */}
            <Polyline
              positions={routeCoordinates}
              pathOptions={{
                color: "#050811",
                weight: 8,
                opacity: 1,
                lineCap: "round",
                lineJoin: "round",
              }}
            />
            {/* Main bold route line in Primary Blue */}
            <Polyline
              positions={routeCoordinates}
              pathOptions={{
                color: "#072ac8",
                weight: 5,
                opacity: 1,
                lineCap: "round",
                lineJoin: "round",
              }}
            />
            {/* Center railway track dash */}
            <Polyline
              positions={routeCoordinates}
              pathOptions={{
                color: "#ffffff",
                weight: 1.5,
                opacity: 0.85,
                dashArray: "6, 12",
                lineCap: "square",
              }}
            />
          </>
        )}

        {/* STATIONS ALONG THE CORRIDOR */}
        {visibleStations.map((station) => {
          const isSource = station.id === sourceId;
          const isTarget = station.id === targetId;
          const isOnRoute = activeStationIdSet.has(station.id);
          const icon = createStationIcon(station, isSource, isTarget, isOnRoute);

          return (
            <Marker
              key={station.id}
              position={[station.lat, station.lng]}
              icon={icon}
              eventHandlers={{
                click: () => onSelectStation?.(station.id),
              }}
            >
              <Tooltip direction="top" offset={[0, -10]} opacity={0.95}>
                <div className="text-[11px] font-bold text-slate-900 px-1">
                  {station.name} ({station.code}) — {station.city}
                </div>
              </Tooltip>

              <Popup className="custom-leaflet-popup">
                <div className="p-1.5 space-y-1.5 text-slate-900">
                  <div className="flex items-center justify-between gap-3">
                    <span className="font-extrabold text-xs text-slate-900">
                      {station.name} ({station.code})
                    </span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-100 text-blue-800 font-bold">
                      Zone {station.zone}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-600">
                    {station.city}, {station.state}
                  </div>
                  <div className="text-[10px] text-slate-500 font-mono">
                    Platforms: <strong>{station.platforms}</strong> • Corridor Station
                  </div>
                  {hasActiveMaintenance && (
                    <div className="mt-1 p-1.5 rounded bg-amber-50 border border-amber-300 text-[10px] text-amber-900 font-medium">
                      ⚠️ <strong>Maintenance Notice:</strong> {primaryMaintenanceTask?.task_code} recorded in this sector.
                    </div>
                  )}
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>

      {/* Floating Route Summary HUD Card & Stations Flow */}
      {activeRoute && sourceStation && targetStation && (
        <div
          style={{ zIndex: 400 }}
          className="absolute bottom-4 left-4 right-4 pointer-events-auto flex flex-col space-y-2"
        >
          {/* Main Corridor Summary Card */}
          <div className="rounded-2xl bg-[#070b13]/95 backdrop-blur-xl border border-[#172642] p-4 shadow-2xl transition-all flex flex-col gap-3 animate-in fade-in slide-in-from-bottom-3 duration-300">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              {/* Origin & Destination */}
              <div className="flex items-center gap-3 w-full md:w-auto">
                <div className="flex items-center justify-center w-11 h-11 rounded-xl border border-emerald-500/30 bg-emerald-500/15 text-emerald-400 shadow-md">
                  <TrainIcon className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-white">
                      {sourceStation.name} ({sourceStation.code})
                    </span>
                    <span className="text-emerald-400 font-bold">
                      →
                    </span>
                    <span className="font-bold text-sm text-white">
                      {targetStation.name} ({targetStation.code})
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-400">
                    <span>{activeRoute.stationIds.length} Stations in Corridor</span>
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
                    Corridor Distance
                  </span>
                  <span className="text-base font-extrabold text-white tracking-tight">
                    {activeRoute.totalDistanceKm.toLocaleString()} km
                  </span>
                </div>

                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Est. Transit Time
                  </span>
                  <span className="text-base font-extrabold text-white tracking-tight flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-blue-400" />
                    {Math.floor(activeRoute.estDurationMinutes / 60)}h{" "}
                    {activeRoute.estDurationMinutes % 60}m
                  </span>
                </div>

                <div className="hidden sm:block">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Corridor Status
                  </span>
                  {hasActiveMaintenance ? (
                    <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-bold shadow-sm">
                      <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                      <span>Maintenance Scheduled</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-semibold">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                      <span>Clear Signal</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Track Maintenance Notice Banner (Tertiary: Maintenance Amber) */}
            {hasActiveMaintenance && primaryMaintenanceTask && (
              <div className="p-3 rounded-xl bg-[#0d1527] border border-amber-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-in fade-in duration-300">
                <div className="flex items-start sm:items-center gap-2.5">
                  <div className="p-1.5 rounded-lg bg-amber-500/15 border border-amber-500/30 text-amber-400 mt-0.5 sm:mt-0">
                    <AlertTriangle className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-black text-amber-300 font-mono">
                        {primaryMaintenanceTask.task_code}
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-200 border border-amber-500/40 font-bold">
                        {primaryMaintenanceTask.urgency || "HIGH"} URGENCY
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/40 font-bold font-mono">
                        Status: {primaryMaintenanceTask.task_status || "PENDING"}
                      </span>
                    </div>
                    <p className="text-xs text-slate-200 mt-1 line-clamp-1 font-medium">
                      {primaryMaintenanceTask.details}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 self-end sm:self-center flex-shrink-0">
                  <div className="text-right font-mono text-[11px] text-slate-300">
                    <span className="text-slate-400 block text-[9px] uppercase">Duration Window</span>
                    <strong>{primaryMaintenanceTask.estimated_duration} mins</strong>
                  </div>
                  <Link
                    href="/maintenance"
                    className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-extrabold transition-all shadow-md flex items-center gap-1.5"
                  >
                    <span>Inspect Order</span>
                    <ExternalLink className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default IndiaLeafletMap;
