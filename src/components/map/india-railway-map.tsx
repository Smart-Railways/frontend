import React from "react";
import dynamic from "next/dynamic";
import { RefreshCw } from "lucide-react";

const LeafletMapComponent = dynamic(
  () => import("./india-leaflet-map").then((mod) => mod.IndiaLeafletMap),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-[680px] lg:h-[760px] rounded-3xl bg-[#060a13] border border-[#172642] flex items-center justify-center text-slate-400">
        <div className="flex flex-col items-center gap-3">
          <RefreshCw className="w-8 h-8 animate-spin text-emerald-400" />
          <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
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
