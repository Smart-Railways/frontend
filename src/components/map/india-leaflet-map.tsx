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
  maintenanceStatus?: "ACTIVE" | "SCHEDULED"
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

  // Maintenance station: ACTIVE = red, SCHEDULED = amber
  if (maintenanceStatus) {
    const isActive = maintenanceStatus === "ACTIVE";
    const color = isActive ? "#DC2626" : "#F59E0B";
    const bg = isActive ? "#FEF2F2" : "#FFFBEB";
    const border = isActive ? "#FCA5A5" : "#FCD34D";

    return L.divIcon({
      className: "custom-leaflet-marker",
      html: `
        <div class="relative flex flex-col items-center -translate-x-1/2 -translate-y-1/2 group select-none">
          <div class="w-3.5 h-3.5 rounded-full border-2 border-white shadow-md flex items-center justify-center ${isActive ? "animate-pulse" : ""}" style="background:${color};">
            <div class="w-1.5 h-1.5 rounded-full bg-white"></div>
          </div>
          <span class="mt-1 px-1.5 py-0.5 rounded text-[9px] font-extrabold whitespace-nowrap shadow-xs" style="background:${bg}; border:1px solid ${border}; color:${color};">
            ${station.name}
          </span>
        </div>
      `,
      iconSize: [80, 32],
      iconAnchor: [40, 10],
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

  // Maintenance status used by the map:
  // ACTIVE / IN_PROGRESS / ONGOING / UNDER_MAINTENANCE -> RED
  // SCHEDULED -> AMBER
  const maintenanceSections = useMemo(() => {
    const maintenance = maintenanceTasks.filter((task) => {
      const status = task.task_status?.toUpperCase();
      return (
        status === "SCHEDULED" ||
        status === "ACTIVE" ||
        status === "IN_PROGRESS" ||
        status === "ONGOING" ||
        status === "UNDER_MAINTENANCE"
      );
    });

    const result: Array<{
      key: string;
      sectionName: string;
      tasks: typeof maintenanceTasks;
      fromStation: RailwayStation;
      toStation: RailwayStation;
      coordinates: [number, number][];
      maintenanceStatus: "ACTIVE" | "SCHEDULED";
    }> = [];

    const taskMap = new Map<string, typeof maintenanceTasks>();

    maintenance.forEach((task) => {
      const name = (task.section_name || "").toLowerCase().trim();
      if (!name) return;
      const arr = taskMap.get(name) || [];
      arr.push(task);
      taskMap.set(name, arr);
    });

    sections.forEach((sec) => {
      const secNameLower = sec.section_name.toLowerCase().trim();
      const tasksForSec = taskMap.get(secNameLower);
      if (!tasksForSec?.length) return;

      const fromSt =
        getStationById(sec.source_station_code || "") ||
        getStationByName(sec.origin_station);
      const toSt =
        getStationById(sec.destination_station_code || "") ||
        getStationByName(sec.end_station);

      if (!fromSt || !toSt) return;

      const isActive = tasksForSec.some((task) => {
        const status = task.task_status?.toUpperCase();
        return (
          status === "ACTIVE" ||
          status === "IN_PROGRESS" ||
          status === "ONGOING" ||
          status === "UNDER_MAINTENANCE"
        );
      });

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
        maintenanceStatus: isActive ? "ACTIVE" : "SCHEDULED",
      });
    });

    // Also support section names like "New Delhi - Mathura".
    taskMap.forEach((tasksForSec, secNameLower) => {
      const exists = result.some(
        (r) => r.sectionName.toLowerCase().trim() === secNameLower
      );
      if (exists) return;

      const parts = secNameLower.split(/[-–—/]/).map((p) => p.trim());
      if (parts.length < 2) return;

      const fromSt = getStationByName(parts[0]) || getStationById(parts[0]);
      const toSt = getStationByName(parts[1]) || getStationById(parts[1]);
      if (!fromSt || !toSt) return;

      const isActive = tasksForSec.some((task) => {
        const status = task.task_status?.toUpperCase();
        return (
          status === "ACTIVE" ||
          status === "IN_PROGRESS" ||
          status === "ONGOING" ||
          status === "UNDER_MAINTENANCE"
        );
      });

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
        maintenanceStatus: isActive ? "ACTIVE" : "SCHEDULED",
      });
    });

    return result;
  }, [maintenanceTasks, sections]);

  const maintenanceStationIdSet = useMemo(() => {
    const set = new Set<string>();
    maintenanceSections.forEach((sec) => {
      set.add(sec.fromStation.id);
      set.add(sec.toStation.id);
    });
    return set;
  }, [maintenanceSections]);

  // Set of station IDs strictly belonging to the active corridor
  const activeStationIdSet = useMemo(() => {
    const set = new Set<string>(activeRoute?.stationIds || []);
    if (sourceId) set.add(sourceId);
    if (targetId) set.add(targetId);
    return set;
  }, [activeRoute, sourceId, targetId]);

  // Breakdown active route into individual consecutive segments.
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
      maintenanceStatus?: "ACTIVE" | "SCHEDULED";
    }> = [];

    for (let i = 0; i < activeRoute.stationIds.length - 1; i++) {
      const fromId = activeRoute.stationIds[i];
      const toId = activeRoute.stationIds[i + 1];
      const fromStation = getStationById(fromId);
      const toStation = getStationById(toId);
      if (!fromStation || !toStation) continue;

      const matchingSec = maintenanceSections.find((sec) =>
        (sec.fromStation.id === fromId && sec.toStation.id === toId) ||
        (sec.fromStation.id === toId && sec.toStation.id === fromId)
      );

      const segmentTasks = matchingSec
        ? matchingSec.tasks
        : maintenanceTasks.filter((task) => {
            const status = task.task_status?.toUpperCase();
            const statusOk =
              status === "SCHEDULED" ||
              status === "ACTIVE" ||
              status === "IN_PROGRESS" ||
              status === "ONGOING" ||
              status === "UNDER_MAINTENANCE";
            if (!statusOk) return false;

            const taskText =
              `${task.section_name || ""} ${task.asset_name || ""} ${task.details || ""}`.toLowerCase();

            const hasFrom =
              taskText.includes(fromStation.name.toLowerCase()) ||
              taskText.includes(fromStation.code.toLowerCase());
            const hasTo =
              taskText.includes(toStation.name.toLowerCase()) ||
              taskText.includes(toStation.code.toLowerCase());

            return hasFrom && hasTo;
          });

      const hasMaintenance = Boolean(matchingSec || segmentTasks.length);
      const hasActive =
        matchingSec?.maintenanceStatus === "ACTIVE" ||
        segmentTasks.some((task) => {
          const status = task.task_status?.toUpperCase();
          return (
            status === "ACTIVE" ||
            status === "IN_PROGRESS" ||
            status === "ONGOING" ||
            status === "UNDER_MAINTENANCE"
          );
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
        hasMaintenance,
        maintenanceTasks: segmentTasks,
        sectionName: matchingSec?.sectionName,
        maintenanceStatus: hasMaintenance
          ? hasActive
            ? "ACTIVE"
            : "SCHEDULED"
          : undefined,
      });
    }

    return segments;
  }, [activeRoute, maintenanceSections, maintenanceTasks]);

  // Coordinates for the highlighted corridor route
  const routeCoordinates: [number, number][] = useMemo(() => {
    if (!activeRoute) return [];
    return activeRoute.geoCoordinates;
  }, [activeRoute]);

  // Show corridor stations + maintenance corridor stations
  const visibleStations = useMemo(() => {
    const combinedSet = new Set<string>(activeStationIdSet);
    maintenanceSections.forEach((sec) => {
      combinedSet.add(sec.fromStation.id);
      combinedSet.add(sec.toStation.id);
    });

    if (combinedSet.size > 0) {
      return STATIONS.filter((s) => combinedSet.has(s.id));
    }

    return STATIONS.filter(
      (s) =>
        s.id === "ndls" ||
        s.id === "mtj" ||
        s.id === "st" ||
        s.id === "mmct"
    );
  }, [activeStationIdSet, maintenanceSections]);

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
        className="absolute bottom-4 left-4 z-10 flex items-center gap-4 px-3 py-1.5 rounded-xl bg-brand-surface/95 backdrop-blur-md border border-brand-border shadow-sm text-[11px] font-bold text-brand-secondary pointer-events-auto"
      >
        <div className="flex items-center gap-1.5">
          <span className="w-4 h-1 rounded bg-[#2563EB]"></span>
          <span>Normal</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-4 h-1.5 rounded bg-[#DC2626]"></span>
          <span className="text-[#DC2626] font-extrabold">Active Maintenance</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-4 h-1.5 rounded bg-[#F59E0B]"></span>
          <span className="text-[#F59E0B] font-extrabold">Scheduled Maintenance</span>
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
          url={`https://{s}.basemaps.cartocdn.com/rastertiles/light_all/{z}/{x}/{y}.png?key=${process.env.NEXT_PUBLIC_CARTO_API_KEY || "cb1_2tev_1_a1638606f4f174ff288df664"}`}
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
            const isActive = segment.maintenanceStatus === "ACTIVE";
            const mainColor = isActive ? "#DC2626" : "#F59E0B";
            const overlayColor = isActive ? "#FCA5A5" : "#FCD34D";
            const label = isActive
              ? "ACTIVE MAINTENANCE"
              : "SCHEDULED MAINTENANCE";

            return (
              <React.Fragment key={`seg-maint-${idx}`}>
                <Polyline
                  positions={segment.coordinates}
                  pathOptions={{
                    color: mainColor,
                    weight: 6,
                    opacity: 1,
                    lineCap: "round",
                    lineJoin: "round",
                  }}
                />

                <Polyline
                  positions={segment.coordinates}
                  pathOptions={{
                    color: overlayColor,
                    weight: 3,
                    opacity: 0.95,
                    dashArray: "6, 8",
                    lineCap: "round",
                  }}
                >
                  <Tooltip direction="top" offset={[0, -10]} opacity={0.95}>
                    <div className="text-xs font-bold px-1 flex items-center gap-1" style={{ color: mainColor }}>
                      <AlertTriangle className="w-3 h-3" style={{ color: mainColor }} />
                      <span>
                        {label}: {segment.sectionName || `${segment.fromStation.name} - ${segment.toStation.name}`}
                      </span>
                    </div>
                  </Tooltip>

                  <Popup className="custom-leaflet-popup">
                    <div className="p-2 space-y-2 text-xs text-brand-secondary">
                      <div className="flex items-center gap-1.5 font-extrabold" style={{ color: mainColor }}>
                        <AlertTriangle className="w-4 h-4 shrink-0" style={{ color: mainColor }} />
                        <span>{label}</span>
                      </div>
                      <div className="font-bold text-brand-secondary">
                        Corridor: {segment.sectionName || `${segment.fromStation.name} - ${segment.toStation.name}`}
                      </div>
                      {segment.maintenanceTasks.map((task) => (
                        <div
                          key={task.id}
                          className="p-2 rounded-lg text-xs space-y-1"
                          style={{
                            backgroundColor: isActive ? "#FEF2F2" : "#FFFBEB",
                            border: `1px solid ${isActive ? "#FECACA" : "#FDE68A"}`,
                          }}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-mono font-bold" style={{ color: mainColor }}>
                              {task.task_code}
                            </span>
                            <span
                              className="px-1.5 py-0.5 rounded text-[10px] font-extrabold uppercase"
                              style={{
                                backgroundColor: isActive ? "#FECACA" : "#FDE68A",
                                color: isActive ? "#991B1B" : "#92400E",
                              }}
                            >
                              {task.task_status}
                            </span>
                          </div>
                          <p className="text-[11px] font-medium">
                            {task.details || task.asset_name}
                          </p>
                          <div className="text-[10px] font-mono" style={{ color: mainColor }}>
                            Duration: {task.estimated_duration} mins • Urgency: {task.urgency}
                          </div>
                        </div>
                      ))}
                    </div>
                  </Popup>
                </Polyline>
              </React.Fragment>
            );
          }

          // Normal route remains blue.
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

        {/* 2. NETWORK-WIDE MAINTENANCE CORRIDORS */}
        {maintenanceSections
          .filter((sec) =>
            !routeSegments.some(
              (seg) =>
                seg.hasMaintenance &&
                ((seg.fromId === sec.fromStation.id && seg.toId === sec.toStation.id) ||
                  (seg.fromId === sec.toStation.id && seg.toId === sec.fromStation.id))
            )
          )
          .map((sec) => {
            const isActive = sec.maintenanceStatus === "ACTIVE";
            const mainColor = isActive ? "#DC2626" : "#F59E0B";
            const overlayColor = isActive ? "#FCA5A5" : "#FCD34D";
            const label = isActive ? "ACTIVE MAINTENANCE" : "SCHEDULED MAINTENANCE";

            return (
              <React.Fragment key={sec.key}>
                <Polyline
                  positions={sec.coordinates}
                  pathOptions={{
                    color: mainColor,
                    weight: 6,
                    opacity: 0.95,
                    lineCap: "round",
                    lineJoin: "round",
                  }}
                />
                <Polyline
                  positions={sec.coordinates}
                  pathOptions={{
                    color: overlayColor,
                    weight: 3,
                    opacity: 0.95,
                    dashArray: "6, 8",
                    lineCap: "round",
                  }}
                >
                  <Tooltip direction="top" offset={[0, -10]} opacity={0.95}>
                    <div className="text-xs font-bold px-1 flex items-center gap-1" style={{ color: mainColor }}>
                      <AlertTriangle className="w-3 h-3" style={{ color: mainColor }} />
                      <span>{label}: {sec.sectionName}</span>
                    </div>
                  </Tooltip>
                  <Popup className="custom-leaflet-popup">
                    <div className="p-2 space-y-2 text-xs text-brand-secondary">
                      <div className="flex items-center gap-1.5 font-extrabold" style={{ color: mainColor }}>
                        <AlertTriangle className="w-4 h-4 shrink-0" style={{ color: mainColor }} />
                        <span>{label}</span>
                      </div>
                      <div className="font-bold text-brand-secondary">Corridor: {sec.sectionName}</div>
                      {sec.tasks.map((task) => (
                        <div
                          key={task.id}
                          className="p-2 rounded-lg text-xs space-y-1"
                          style={{
                            backgroundColor: isActive ? "#FEF2F2" : "#FFFBEB",
                            border: `1px solid ${isActive ? "#FECACA" : "#FDE68A"}`,
                          }}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-mono font-bold" style={{ color: mainColor }}>{task.task_code}</span>
                            <span
                              className="px-1.5 py-0.5 rounded text-[10px] font-extrabold uppercase"
                              style={{
                                backgroundColor: isActive ? "#FECACA" : "#FDE68A",
                                color: isActive ? "#991B1B" : "#92400E",
                              }}
                            >
                              {task.task_status}
                            </span>
                          </div>
                          <p className="text-[11px] font-medium">{task.details || task.asset_name}</p>
                          <div className="text-[10px] font-mono" style={{ color: mainColor }}>
                            Duration: {task.estimated_duration} mins • Urgency: {task.urgency}
                          </div>
                        </div>
                      ))}
                    </div>
                  </Popup>
                </Polyline>
              </React.Fragment>
            );
          })}

        {/* 3. STATIONS ALONG THE CORRIDOR & MAINTENANCE SECTIONS */}
        {visibleStations.map((station) => {
          const isSource = station.id === sourceId;
          const isTarget = station.id === targetId;
          const isOnRoute = activeStationIdSet.has(station.id);

          const maintenanceSection = maintenanceSections.find(
            (sec) =>
              sec.fromStation.id === station.id ||
              sec.toStation.id === station.id
          );

          const maintenanceStatus = maintenanceSection?.maintenanceStatus;

          const icon = createStationIcon(
            station,
            isSource,
            isTarget,
            isOnRoute,
            maintenanceStatus
          );

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
                  {maintenanceStatus && ` [${maintenanceStatus === "ACTIVE" ? "Active" : "Scheduled"} Maintenance]`}
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
                  {maintenanceStatus && (
                    <div
                      className="mt-1 p-1 rounded text-[10px] font-bold border flex items-center gap-1"
                      style={{
                        backgroundColor: maintenanceStatus === "ACTIVE" ? "#FEF2F2" : "#FFFBEB",
                        color: maintenanceStatus === "ACTIVE" ? "#991B1B" : "#92400E",
                        borderColor: maintenanceStatus === "ACTIVE" ? "#FECACA" : "#FDE68A",
                      }}
                    >
                      <AlertTriangle
                        className="w-3 h-3"
                        style={{ color: maintenanceStatus === "ACTIVE" ? "#DC2626" : "#F59E0B" }}
                      />
                      <span>
                        {maintenanceStatus === "ACTIVE"
                          ? "Active maintenance section"
                          : "Scheduled maintenance section"}
                      </span>
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
