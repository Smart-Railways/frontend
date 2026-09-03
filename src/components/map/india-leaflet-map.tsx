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

// Clean, bold Leaflet DivIcons strictly adhering to brand palette
function createStationIcon(
  station: RailwayStation,
  isSource: boolean,
  isTarget: boolean,
  isOnRoute: boolean
) {
  // Origin Station: START badge with Royal Blue dot
  if (isSource) {
    return L.divIcon({
      className: "custom-leaflet-marker",
      html: `
        <div class="relative flex flex-col items-center -translate-x-1/2 -translate-y-1/2 select-none">
          <div class="flex items-center justify-center px-2 py-0.5 rounded-md bg-[#2563EB] text-white text-[10px] font-extrabold tracking-wider shadow-sm">
            START
          </div>
          <div class="w-3.5 h-3.5 rounded-full bg-[#2563EB] border-2 border-white shadow-md my-0.5"></div>
          <span class="px-2 py-0.5 rounded-md bg-[#FFFDF9] border border-[#E7E2D8] text-[#171A1F] text-[10px] font-extrabold whitespace-nowrap shadow-xs">
            ${station.name} (${station.code})
          </span>
        </div>
      `,
      iconSize: [80, 50],
      iconAnchor: [40, 25],
    });
  }

  // Destination Station: Royal Blue dot with station card
  if (isTarget) {
    return L.divIcon({
      className: "custom-leaflet-marker",
      html: `
        <div class="relative flex flex-col items-center -translate-x-1/2 -translate-y-1/2 select-none">
          <div class="w-3.5 h-3.5 rounded-full bg-[#2563EB] border-2 border-white shadow-md mb-0.5"></div>
          <span class="px-2 py-0.5 rounded-md bg-[#FFFDF9] border border-[#E7E2D8] text-[#171A1F] text-[10px] font-extrabold whitespace-nowrap shadow-xs">
            ${station.name} (${station.code})
          </span>
        </div>
      `,
      iconSize: [80, 36],
      iconAnchor: [40, 18],
    });
  }

  // Intermediate Corridor Stations: Royal Blue dot with clean label
  if (isOnRoute) {
    return L.divIcon({
      className: "custom-leaflet-marker",
      html: `
        <div class="relative flex flex-col items-center -translate-x-1/2 -translate-y-1/2 group select-none">
          <div class="w-3 h-3 rounded-full bg-[#2563EB] border-2 border-white shadow-sm"></div>
          <span class="mt-1 px-1.5 py-0.5 rounded bg-[#FFFDF9] border border-[#E7E2D8] text-[9px] font-extrabold text-[#171A1F] whitespace-nowrap shadow-xs">
            ${station.name}
          </span>
        </div>
      `,
      iconSize: [60, 28],
      iconAnchor: [30, 8],
    });
  }

  // Other Stations: Subtle Blue dot
  return L.divIcon({
    className: "custom-leaflet-marker",
    html: `
      <div class="w-2.5 h-2.5 rounded-full bg-[#2563EB]/40 border border-white -translate-x-1/2 -translate-y-1/2 select-none"></div>
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
      <div className="flex items-center gap-1.5 bg-brand-surface border border-brand-border rounded-xl p-1 shadow-sm">
        <button
          onClick={() => map.zoomIn()}
          className="p-1.5 rounded-lg text-brand-muted hover:text-brand-secondary hover:bg-brand-tertiary transition-colors cursor-pointer"
          title="Zoom In"
          aria-label="Zoom in"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <button
          onClick={() => map.zoomOut()}
          className="p-1.5 rounded-lg text-brand-muted hover:text-brand-secondary hover:bg-brand-tertiary transition-colors cursor-pointer"
          title="Zoom Out"
          aria-label="Zoom out"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        <button
          onClick={onResetView}
          className="p-1.5 rounded-lg text-brand-muted hover:text-brand-secondary hover:bg-brand-tertiary transition-colors cursor-pointer"
          title="Fit Route"
          aria-label="Fit Route"
        >
          <Maximize2 className="w-4 h-4" />
        </button>
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

  // STRICTLY FILTER STATIONS: Show stations on the corridor
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

  const corridorTitle = sourceStation && targetStation
    ? `${sourceStation.name} - ${targetStation.name}`
    : "NEW DELHI - MUMBAI";

  return (
    <div className="relative w-full h-[600px] lg:h-[680px] rounded-2xl bg-brand-surface border border-brand-border shadow-sm overflow-hidden flex flex-col z-0">
      
      {/* Top Left Active Corridor Header Badge */}
      <div
        style={{ zIndex: 400 }}
        className="absolute top-4 left-4 flex items-center gap-2.5 px-3.5 py-2 rounded-xl bg-brand-surface/95 backdrop-blur-md border border-brand-border shadow-sm pointer-events-auto flex-wrap"
      >
        <span className="w-2.5 h-2.5 rounded-full bg-brand-primary flex-shrink-0"></span>
        <span className="text-xs font-bold text-brand-secondary tracking-wide">
          Corridor Section:
        </span>
        <span className="text-xs font-extrabold text-brand-primary uppercase">
          {corridorTitle}
        </span>
        <span className="text-[10px] px-2 py-0.5 rounded bg-slate-100 text-brand-muted font-bold border border-brand-border">
          {visibleStations.length} STATIONS
        </span>

        <span className="text-[10px] px-2.5 py-0.5 rounded-md bg-brand-blue-light text-brand-primary border border-brand-primary/30 font-bold flex items-center gap-1">
          <Wrench className="w-3 h-3 text-brand-primary" />
          <span>MAINTENANCE NOTICE ({activeMaintenanceTasks.length > 0 ? activeMaintenanceTasks.length : 1})</span>
        </span>
      </div>

      {/* Main Leaflet Map */}
      <MapContainer
        center={sourceStation ? [sourceStation.lat, sourceStation.lng] : [22.5937, 78.9629]}
        zoom={6}
        minZoom={4}
        maxZoom={14}
        className="w-full h-full z-0"
        style={{ background: "#F8F5EE" }}
        ref={setMapInstance}
        zoomControl={false}
      >
        {/* CartoDB Positron Light Tiles */}
        <TileLayer
          attribution='&copy; <a href="https://carto.com/">CARTO</a>, &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.basemaps.cartocdn.com/rastertiles/light_all/{z}/{x}/{y}.png"
          subdomains="abcd"
          maxZoom={19}
        />

        {/* Map Controller for dynamic bounds */}
        <MapBoundsController
          routeCoordinates={routeCoordinates}
          sourceStation={sourceStation}
          targetStation={targetStation}
        />

        <MapControls onResetView={handleResetIndiaView} />

        {/* HIGHLIGHTED ACTIVE CORRIDOR (Royal Blue line) */}
        {routeCoordinates.length > 1 && (
          <>
            {/* Main corridor solid blue line */}
            <Polyline
              positions={routeCoordinates}
              pathOptions={{
                color: "#2563EB",
                weight: 4,
                opacity: 0.95,
                lineCap: "round",
                lineJoin: "round",
              }}
            />
            {/* Dashed overlay track line */}
            <Polyline
              positions={routeCoordinates}
              pathOptions={{
                color: "#DBEAFE",
                weight: 2,
                opacity: 0.9,
                dashArray: "5, 10",
                lineCap: "round",
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
                <div className="text-[11px] font-bold text-brand-secondary px-1">
                  {station.name} ({station.code}) — {station.city}
                </div>
              </Tooltip>

              <Popup className="custom-leaflet-popup">
                <div className="p-1.5 space-y-1.5 text-brand-secondary">
                  <div className="flex items-center justify-between gap-3">
                    <span className="font-extrabold text-xs text-brand-secondary">
                      {station.name} ({station.code})
                    </span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-brand-blue-light text-brand-primary font-bold">
                      Zone {station.zone}
                    </span>
                  </div>
                  <div className="text-[11px] text-brand-muted">
                    {station.city}, {station.state}
                  </div>
                  <div className="text-[10px] text-brand-muted font-mono">
                    Platforms: <strong>{station.platforms}</strong> • Corridor Station
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}

export default IndiaLeafletMap;
