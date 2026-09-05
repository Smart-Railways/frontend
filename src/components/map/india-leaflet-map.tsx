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
  AlertTriangle,
  ExternalLink,
} from "lucide-react";
import {
  STATIONS,
  RailwayStation,
  findRailwayRoute,
  getStationById,
  getStationByName,
} from "@/data/india-railway-network";
import { useMaintenanceTasks, useRailwaySections } from "@/hooks";

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
  isOnRoute: boolean,
  isMaintenanceStation?: boolean
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

  // Station on a Scheduled Maintenance Corridor
  if (isMaintenanceStation) {
    return L.divIcon({
      className: "custom-leaflet-marker",
      html: `
        <div class="relative flex flex-col items-center -translate-x-1/2 -translate-y-1/2 group select-none">
          <div class="w-3.5 h-3.5 rounded-full bg-[#991B1B] border-2 border-white shadow-md flex items-center justify-center animate-pulse">
            <div class="w-1.5 h-1.5 rounded-full bg-white"></div>
          </div>
          <span class="mt-1 px-1.5 py-0.5 rounded bg-red-50 border border-red-300 text-[9px] font-extrabold text-[#991B1B] whitespace-nowrap shadow-xs">
            ${station.name}
          </span>
        </div>
      `,
      iconSize: [70, 30],
      iconAnchor: [35, 10],
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

  // Fetch real-time maintenance tasks & railway sections from backend
  const { data: maintenanceTasks = [] } = useMaintenanceTasks();
  const { data: sections = [] } = useRailwaySections();

  // Compute active railway route for the selected corridor
  const activeRoute = useMemo(() => {
    if (!sourceId || !targetId || sourceId === targetId) return null;
    return findRailwayRoute(sourceId, targetId);
  }, [sourceId, targetId]);

  const sourceStation = getStationById(sourceId);
  const targetStation = getStationById(targetId);

  // Identify all corridor sections that have scheduled/active maintenance
  const scheduledMaintenanceSections = useMemo(() => {
    const scheduled = maintenanceTasks.filter(
      (t) => t.task_status === "SCHEDULED" || t.task_status === "PENDING"
    );

    const result: Array<{
      key: string;
      sectionName: string;
      tasks: typeof maintenanceTasks;
      fromStation: RailwayStation;
      toStation: RailwayStation;
      coordinates: [number, number][];
    }> = [];

    // Group tasks by section name
    const map = new Map<string, typeof maintenanceTasks>();
    scheduled.forEach((t) => {
      const name = (t.section_name || "").toLowerCase().trim();
      if (name) {
        const arr = map.get(name) || [];
        arr.push(t);
        map.set(name, arr);
      }
    });

    // Match with backend sections
    sections.forEach((sec) => {
      const secNameLower = sec.section_name.toLowerCase().trim();
      const tasksForSec = map.get(secNameLower);
      if (tasksForSec && tasksForSec.length > 0) {
        const fromSt =
          getStationById(sec.source_station_code || "") ||
          getStationByName(sec.origin_station);
        const toSt =
          getStationById(sec.destination_station_code || "") ||
          getStationByName(sec.end_station);

        if (fromSt && toSt) {
          result.push({
            key: `sec-${sec.id}`,
            sectionName: sec.section_name,
            tasks: tasksForSec,
            fromStation: fromSt,
            toStation: toSt,
            coordinates: [
              [fromSt.lat, fromSt.lng],
              [toSt.lat, toSt.lng],
            ],
          });
        }
      }
    });

    // Also match any task whose section name connects two known stations
    map.forEach((tasksForSec, secNameLower) => {
      const exists = result.some(
        (r) => r.sectionName.toLowerCase().trim() === secNameLower
      );
      if (!exists) {
        const parts = secNameLower.split(/[-–—/]/).map((p) => p.trim());
        if (parts.length >= 2) {
          const fromSt = getStationByName(parts[0]) || getStationById(parts[0]);
          const toSt = getStationByName(parts[1]) || getStationById(parts[1]);
          if (fromSt && toSt) {
            result.push({
              key: `custom-${fromSt.id}-${toSt.id}`,
              sectionName: `${fromSt.name} - ${toSt.name}`,
              tasks: tasksForSec,
              fromStation: fromSt,
              toStation: toSt,
              coordinates: [
                [fromSt.lat, fromSt.lng],
                [toSt.lat, toSt.lng],
              ],
            });
          }
        }
      }
    });

    return result;
  }, [maintenanceTasks, sections]);

  // Set of station IDs belonging to scheduled maintenance sections
  const maintenanceStationIdSet = useMemo(() => {
    const set = new Set<string>();
    scheduledMaintenanceSections.forEach((sec) => {
      set.add(sec.fromStation.id);
      set.add(sec.toStation.id);
    });
    return set;
  }, [scheduledMaintenanceSections]);

  // Set of station IDs strictly belonging to the active corridor
  const activeStationIdSet = useMemo(() => {
    const set = new Set<string>(activeRoute?.stationIds || []);
    if (sourceId) set.add(sourceId);
    if (targetId) set.add(targetId);
    return set;
  }, [activeRoute, sourceId, targetId]);

  // Breakdown active route into individual consecutive segments
  const routeSegments = useMemo(() => {
    if (!activeRoute || activeRoute.stationIds.length < 2) return [];

    const segments: Array<{
      fromId: string;
      toId: string;
      fromStation: RailwayStation;
      toStation: RailwayStation;
      coordinates: [number, number][];
      hasMaintenance: boolean;
      maintenanceTasks: typeof maintenanceTasks;
      sectionName?: string;
    }> = [];

    for (let i = 0; i < activeRoute.stationIds.length - 1; i++) {
      const fromId = activeRoute.stationIds[i];
      const toId = activeRoute.stationIds[i + 1];
      const fromStation = getStationById(fromId);
      const toStation = getStationById(toId);

      if (fromStation && toStation) {
        // Check if this segment matches any scheduled maintenance section
        const matchingSec = scheduledMaintenanceSections.find((sec) => {
          return (
            (sec.fromStation.id === fromId && sec.toStation.id === toId) ||
            (sec.fromStation.id === toId && sec.toStation.id === fromId)
          );
        });

        const segmentTasks = matchingSec
          ? matchingSec.tasks
          : maintenanceTasks.filter((t) => {
              const statusOk = t.task_status === "SCHEDULED" || t.task_status === "PENDING";
              if (!statusOk) return false;
              const text = `${t.section_name || ""} ${t.asset_name || ""} ${t.details || ""}`.toLowerCase();
              const hasFrom = text.includes(fromStation.name.toLowerCase()) || text.includes(fromStation.code.toLowerCase());
              const hasTo = text.includes(toStation.name.toLowerCase()) || text.includes(toStation.code.toLowerCase());
              return hasFrom && hasTo;
            });

        segments.push({
          fromId,
          toId,
          fromStation,
          toStation,
          coordinates: [
            [fromStation.lat, fromStation.lng],
            [toStation.lat, toStation.lng],
          ],
          hasMaintenance: Boolean(matchingSec || segmentTasks.length > 0),
          maintenanceTasks: matchingSec ? matchingSec.tasks : segmentTasks,
          sectionName: matchingSec?.sectionName,
        });
      }
    }

    return segments;
  }, [activeRoute, scheduledMaintenanceSections, maintenanceTasks]);

  // Coordinates for the highlighted corridor route
  const routeCoordinates: [number, number][] = useMemo(() => {
    if (!activeRoute) return [];
    return activeRoute.geoCoordinates;
  }, [activeRoute]);

  // STRICTLY FILTER STATIONS: Show corridor stations + maintenance corridor stations
  const visibleStations = useMemo(() => {
    const combinedSet = new Set<string>(activeStationIdSet);
    scheduledMaintenanceSections.forEach((sec) => {
      combinedSet.add(sec.fromStation.id);
      combinedSet.add(sec.toStation.id);
    });

    if (combinedSet.size > 0) {
      return STATIONS.filter((s) => combinedSet.has(s.id));
    }
    return STATIONS.filter((s) => s.id === "ndls" || s.id === "mtj" || s.id === "st" || s.id === "mmct");
  }, [activeStationIdSet, scheduledMaintenanceSections]);

  const handleResetIndiaView = () => {
    if (mapInstance && routeCoordinates.length > 1) {
      const bounds = L.latLngBounds(routeCoordinates);
      mapInstance.flyToBounds(bounds, { padding: [80, 80], maxZoom: 10, duration: 1.2 });
    } else if (mapInstance) {
      mapInstance.flyTo([22.5937, 78.9629], 5, { duration: 1.2 });
    }
  };


  return (
    <div className="relative w-full h-[600px] lg:h-[680px] rounded-2xl bg-brand-surface border border-brand-border shadow-sm overflow-hidden flex flex-col z-0">
      

      {/* Bottom Left Map Legend */}
      <div
        style={{ zIndex: 400 }}
        className="absolute bottom-4 left-4 flex items-center gap-3 px-3 py-1.5 rounded-xl bg-brand-surface/95 backdrop-blur-md border border-brand-border shadow-sm text-[11px] font-bold text-brand-secondary pointer-events-auto"
      >
        <div className="flex items-center gap-1.5">
          <span className="w-4 h-1 rounded bg-[#2563EB]"></span>
          <span>Clear Corridor</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-4 h-1.5 rounded bg-[#991B1B] border-t border-dashed border-[#FCA5A5]"></span>
          <span className="text-[#991B1B] font-extrabold">Maintenance Scheduled</span>
        </div>
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
          url={
            process.env.NEXT_PUBLIC_CARTO_API_KEY
              ? `https://{s}.basemaps.cartocdn.com/rastertiles/light_all/{z}/{x}/{y}.png?api_key=${process.env.NEXT_PUBLIC_CARTO_API_KEY}`
              : "https://{s}.basemaps.cartocdn.com/rastertiles/light_all/{z}/{x}/{y}.png"
          }
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

        {/* 1. ACTIVE ROUTE SEGMENTS */}
        {routeSegments.map((segment, idx) => {
          if (segment.hasMaintenance) {
            // HIGHLIGHT IN DARK RED (#991B1B) FOR SCHEDULED MAINTENANCE
            return (
              <React.Fragment key={`seg-maint-${idx}`}>
                {/* Thick dark red base line */}
                <Polyline
                  positions={segment.coordinates}
                  pathOptions={{
                    color: "#991B1B", // Dark red
                    weight: 6,
                    opacity: 1,
                    lineCap: "round",
                    lineJoin: "round",
                  }}
                />
                {/* Dashed hazard track overlay */}
                <Polyline
                  positions={segment.coordinates}
                  pathOptions={{
                    color: "#FCA5A5",
                    weight: 3,
                    opacity: 0.95,
                    dashArray: "6, 8",
                    lineCap: "round",
                  }}
                >
                  <Tooltip direction="top" offset={[0, -10]} opacity={0.95}>
                    <div className="text-xs font-bold text-[#991B1B] px-1 flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3 text-[#991B1B]" />
                      <span>Scheduled Maintenance: {segment.sectionName || `${segment.fromStation.name} - ${segment.toStation.name}`}</span>
                    </div>
                  </Tooltip>
                  <Popup className="custom-leaflet-popup">
                    <div className="p-2 space-y-2 text-xs text-brand-secondary">
                      <div className="flex items-center gap-1.5 font-extrabold text-[#991B1B]">
                        <AlertTriangle className="w-4 h-4 text-[#991B1B] shrink-0" />
                        <span>SCHEDULED TRACK MAINTENANCE</span>
                      </div>
                      <div className="font-bold text-brand-secondary">
                        Corridor: {segment.sectionName || `${segment.fromStation.name} - ${segment.toStation.name}`}
                      </div>
                      {segment.maintenanceTasks.map((t) => (
                        <div key={t.id} className="p-2 rounded-lg bg-red-50 border border-red-200 text-xs space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="font-mono font-bold text-red-800">{t.task_code}</span>
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-extrabold bg-red-200 text-red-900 uppercase">
                              {t.task_status}
                            </span>
                          </div>
                          <p className="text-[11px] text-red-900 font-medium">{t.details || t.asset_name}</p>
                          <div className="text-[10px] text-red-700 font-mono">
                            Duration: {t.estimated_duration} mins • Urgency: {t.urgency}
                          </div>
                        </div>
                      ))}
                    </div>
                  </Popup>
                </Polyline>
              </React.Fragment>
            );
          }

          // Normal active route segment in Royal Blue
          return (
            <React.Fragment key={`seg-normal-${idx}`}>
              <Polyline
                positions={segment.coordinates}
                pathOptions={{
                  color: "#2563EB",
                  weight: 4,
                  opacity: 0.95,
                  lineCap: "round",
                  lineJoin: "round",
                }}
              />
              <Polyline
                positions={segment.coordinates}
                pathOptions={{
                  color: "#DBEAFE",
                  weight: 2,
                  opacity: 0.9,
                  dashArray: "5, 10",
                  lineCap: "round",
                }}
              />
            </React.Fragment>
          );
        })}

        {/* 2. NETWORK-WIDE SCHEDULED MAINTENANCE CORRIDORS (Always in DARK RED) */}
        {scheduledMaintenanceSections
          .filter((sec) => {
            // Avoid duplicate rendering if already in active route segments
            return !routeSegments.some(
              (seg) =>
                seg.hasMaintenance &&
                ((seg.fromId === sec.fromStation.id && seg.toId === sec.toStation.id) ||
                  (seg.fromId === sec.toStation.id && seg.toId === sec.fromStation.id))
            );
          })
          .map((sec) => (
            <React.Fragment key={sec.key}>
              {/* Dark red solid track */}
              <Polyline
                positions={sec.coordinates}
                pathOptions={{
                  color: "#991B1B", // Dark red
                  weight: 6,
                  opacity: 0.95,
                  lineCap: "round",
                  lineJoin: "round",
                }}
              />
              {/* Dashed hazard overlay */}
              <Polyline
                positions={sec.coordinates}
                pathOptions={{
                  color: "#FCA5A5",
                  weight: 3,
                  opacity: 0.95,
                  dashArray: "6, 8",
                  lineCap: "round",
                }}
              >
                <Tooltip direction="top" offset={[0, -10]} opacity={0.95}>
                  <div className="text-xs font-bold text-[#991B1B] px-1 flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3 text-[#991B1B]" />
                    <span>Scheduled Maintenance: {sec.sectionName}</span>
                  </div>
                </Tooltip>
                <Popup className="custom-leaflet-popup">
                  <div className="p-2 space-y-2 text-xs text-brand-secondary">
                    <div className="flex items-center gap-1.5 font-extrabold text-[#991B1B]">
                      <AlertTriangle className="w-4 h-4 text-[#991B1B] shrink-0" />
                      <span>SCHEDULED TRACK MAINTENANCE</span>
                    </div>
                    <div className="font-bold text-brand-secondary">
                      Corridor: {sec.sectionName}
                    </div>
                    {sec.tasks.map((t) => (
                      <div key={t.id} className="p-2 rounded-lg bg-red-50 border border-red-200 text-xs space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="font-mono font-bold text-red-800">{t.task_code}</span>
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-extrabold bg-red-200 text-red-900 uppercase">
                            {t.task_status}
                          </span>
                        </div>
                        <p className="text-[11px] text-red-900 font-medium">{t.details || t.asset_name}</p>
                        <div className="text-[10px] text-red-700 font-mono">
                          Duration: {t.estimated_duration} mins • Urgency: {t.urgency}
                        </div>
                      </div>
                    ))}
                  </div>
                </Popup>
              </Polyline>
            </React.Fragment>
          ))}

        {/* 3. STATIONS ALONG THE CORRIDOR & MAINTENANCE SECTIONS */}
        {visibleStations.map((station) => {
          const isSource = station.id === sourceId;
          const isTarget = station.id === targetId;
          const isOnRoute = activeStationIdSet.has(station.id);
          const isMaintenanceStation = maintenanceStationIdSet.has(station.id);
          const icon = createStationIcon(station, isSource, isTarget, isOnRoute, isMaintenanceStation);

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
                  {isMaintenanceStation && " [Maintenance Section]"}
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
                  {isMaintenanceStation && (
                    <div className="mt-1 p-1 rounded bg-red-50 text-[10px] text-red-800 font-bold border border-red-200 flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3 text-red-600" />
                      <span>Corridor section with scheduled maintenance</span>
                    </div>
                  )}
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
