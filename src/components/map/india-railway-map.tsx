import React from "react";
import dynamic from "next/dynamic";
import { RefreshCw } from "lucide-react";

const LeafletMapComponent = dynamic(
  () => import("./india-leaflet-map").then((mod) => mod.IndiaLeafletMap),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-[600px] lg:h-[680px] rounded-2xl bg-brand-surface border border-brand-border flex items-center justify-center text-brand-muted shadow-sm">
        <div className="flex flex-col items-center gap-3">
          <RefreshCw className="w-8 h-8 animate-spin text-brand-primary" />
          <span className="text-xs font-bold uppercase tracking-wider text-brand-secondary">
            Initializing Leaflet Geographic Grid...
          </span>
        </div>
      </div>
    ),
  }
);

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
  return (
    <div className="w-full h-full">
      <LeafletMapComponent
        sourceId={sourceId}
        targetId={targetId}
        onSelectStation={onSelectStation}
      />
    </div>
  );
}

export default IndiaRailwayMap;
