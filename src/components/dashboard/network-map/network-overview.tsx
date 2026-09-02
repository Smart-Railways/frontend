"use client";

import React, { useState } from "react";
import {
  MoreVertical,
  Plus,
  Minus,
  LocateFixed,
  Radio,
} from "lucide-react";
import {
  NETWORK_STATIONS,
  NETWORK_LEGEND,
} from "@/data/mock-dashboard-data";

export function NetworkOverview() {
  const [viewMode, setViewMode] = useState<"map" | "list">("map");
  const [zoomLevel, setZoomLevel] = useState(1);
  const [selectedStation, setSelectedStation] = useState<string | null>(null);

  // SVG network station coordinates mapped to 700x420 canvas
  const stations = [
    { id: "delhi", name: "DELHI", code: "NDLS", x: 340, y: 110, color: "#10B981" },
    { id: "ghaziabad", name: "GHAZIABAD", code: "GZB", x: 490, y: 120, color: "#EF4444" },
    { id: "meerut", name: "MEERUT", code: "MTC", x: 570, y: 70, color: "#F59E0B" },
    { id: "aligarh", name: "ALIGARH", code: "ALJN", x: 580, y: 220, color: "#3B82F6" },
    { id: "mathura", name: "MATHURA", code: "MTJ", x: 470, y: 310, color: "#F59E0B" },
    { id: "bharatpur", name: "BHARATPUR", code: "BTE", x: 330, y: 360, color: "#10B981" },
    { id: "rewari", name: "REWARI", code: "RE", x: 230, y: 195, color: "#10B981" },
    { id: "jaipur", name: "JAIPUR", code: "JP", x: 150, y: 320, color: "#3B82F6" },
  ];

  return (
    <div className="rounded-xl bg-[#0d1527] border border-[#172642] p-4 flex flex-col h-[480px] relative overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-[#172642]/60 z-10">
        <div>
          <h2 className="text-sm font-bold text-white tracking-wide uppercase flex items-center gap-2">
            Railway Network Overview
          </h2>
          <span className="text-xs text-slate-400">Real-time Network Status</span>
        </div>

        <div className="flex items-center gap-2">
          {/* View switcher */}
          <div className="flex items-center p-0.5 rounded-lg bg-[#070b13] border border-[#172642]">
            <button
              onClick={() => setViewMode("map")}
              className={`px-3 py-1 rounded-md text-xs font-semibold transition-all ${
                viewMode === "map"
                  ? "bg-blue-600 text-white shadow-sm"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Map View
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`px-3 py-1 rounded-md text-xs font-semibold transition-all ${
                viewMode === "list"
                  ? "bg-blue-600 text-white shadow-sm"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              List View
            </button>
          </div>

          <button 
            aria-label="More options"
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-[#172642] transition-colors"
          >
            <MoreVertical className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Network Canvas & Visualizer */}
      <div className="relative flex-1 w-full bg-[#09101d] rounded-lg mt-3 overflow-hidden border border-[#172642]/60">
        {/* Subtle Map Grid Lines */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#17264215_1px,transparent_1px),linear-gradient(to_bottom,#17264215_1px,transparent_1px)] bg-[size:32px_32px]"></div>

        {/* Legend Overlay (Top-Left) */}
        <div className="absolute top-3 left-3 z-10 bg-[#070b13]/85 backdrop-blur-md p-2.5 rounded-lg border border-[#172642] space-y-1 text-[10px]">
          {NETWORK_LEGEND.map((item) => (
            <div key={item.label} className="flex items-center justify-between gap-3 text-slate-300">
              <div className="flex items-center gap-1.5">
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: item.color }}
                ></span>
                <span>{item.label}</span>
              </div>
              <span className="font-semibold text-slate-200">{item.count}</span>
            </div>
          ))}
        </div>

        {/* Interactive SVG Railway Topology */}
        <svg
          viewBox="0 0 700 420"
          className="w-full h-full select-none"
          style={{ transform: `scale(${zoomLevel})`, transformOrigin: "center" }}
        >
          {/* Glow Filters */}
          <defs>
            <filter id="glow-green" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
            <filter id="glow-red" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3.5" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
            <filter id="glow-amber" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Railway Tracks / Network Corridors */}
          {/* Delhi to Ghaziabad (Critical / Conflict - Red Glow) */}
          <line
            x1="340"
            y1="110"
            x2="490"
            y2="120"
            stroke="#EF4444"
            strokeWidth="3.5"
            strokeDasharray="6 3"
            filter="url(#glow-red)"
          />
          {/* Ghaziabad to Meerut (Maintenance - Amber Glow) */}
          <line
            x1="490"
            y1="120"
            x2="570"
            y2="70"
            stroke="#F59E0B"
            strokeWidth="3"
            strokeDasharray="4 2"
            filter="url(#glow-amber)"
          />
          {/* Ghaziabad to Aligarh (Active - Green Glow) */}
          <line
            x1="490"
            y1="120"
            x2="580"
            y2="220"
            stroke="#10B981"
            strokeWidth="3"
            filter="url(#glow-green)"
          />
          {/* Aligarh to Mathura (Active - Green Glow) */}
          <line
            x1="580"
            y1="220"
            x2="470"
            y2="310"
            stroke="#10B981"
            strokeWidth="3"
            filter="url(#glow-green)"
          />
          {/* Delhi to Mathura direct corridor (Maintenance Block - Amber) */}
          <path
            d="M 340 110 Q 420 210 470 310"
            fill="none"
            stroke="#F59E0B"
            strokeWidth="3.5"
            strokeDasharray="6 3"
            filter="url(#glow-amber)"
          />
          {/* Mathura to Bharatpur (Active Corridor - Green) */}
          <line
            x1="470"
            y1="310"
            x2="330"
            y2="360"
            stroke="#10B981"
            strokeWidth="3"
            filter="url(#glow-green)"
          />
          {/* Delhi to Rewari (Active - Green) */}
          <line
            x1="340"
            y1="110"
            x2="230"
            y2="195"
            stroke="#10B981"
            strokeWidth="3"
            filter="url(#glow-green)"
          />
          {/* Rewari to Jaipur (Active - Green) */}
          <line
            x1="230"
            y1="195"
            x2="150"
            y2="320"
            stroke="#10B981"
            strokeWidth="3"
            filter="url(#glow-green)"
          />
          {/* Jaipur to Bharatpur (Active - Green) */}
          <line
            x1="150"
            y1="320"
            x2="330"
            y2="360"
            stroke="#10B981"
            strokeWidth="2.5"
            strokeDasharray="4 2"
          />

          {/* Animated Train Pulses on Corridors */}
          <circle cx="415" cy="115" r="4" fill="#EF4444">
            <animate attributeName="opacity" values="1;0.2;1" dur="1.5s" repeatCount="indefinite" />
          </circle>
          <circle cx="530" cy="170" r="4" fill="#10B981">
            <animate attributeName="opacity" values="1;0.3;1" dur="2s" repeatCount="indefinite" />
          </circle>
          <circle cx="410" cy="225" r="4" fill="#F59E0B">
            <animate attributeName="opacity" values="1;0.4;1" dur="1.8s" repeatCount="indefinite" />
          </circle>
          <circle cx="190" cy="255" r="4" fill="#10B981">
            <animate attributeName="opacity" values="1;0.2;1" dur="2.2s" repeatCount="indefinite" />
          </circle>

          {/* Station Nodes */}
          {stations.map((st) => (
            <g
              key={st.id}
              className="cursor-pointer group"
              onClick={() => setSelectedStation(st.name)}
            >
              {/* Outer halo */}
              <circle
                cx={st.x}
                cy={st.y}
                r="9"
                fill="#0d1527"
                stroke={st.color}
                strokeWidth="2"
                className="transition-transform group-hover:scale-125"
              />
              {/* Center point */}
              <circle cx={st.x} cy={st.y} r="4" fill="#ffffff" />
              {/* Label */}
              <text
                x={st.x}
                y={st.y - 14}
                textAnchor="middle"
                fill="#e2e8f0"
                fontSize="11"
                fontWeight="700"
                letterSpacing="0.5"
                className="pointer-events-none drop-shadow-md"
              >
                {st.name}
              </text>
            </g>
          ))}
        </svg>

        {/* Bottom Left: Live Tracking Status Badge */}
        <div className="absolute bottom-3 left-3 z-10 flex items-center gap-2 bg-[#070b13]/85 backdrop-blur-md px-3 py-1.5 rounded-full border border-emerald-500/40 shadow-lg">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="text-xs font-semibold text-emerald-300">Live Tracking</span>
        </div>

        {/* Bottom Right: Map Zoom Controls */}
        <div className="absolute bottom-3 right-3 z-10 flex flex-col bg-[#070b13]/90 rounded-lg border border-[#172642] overflow-hidden shadow-lg">
          <button
            onClick={() => setZoomLevel((z) => Math.min(z + 0.15, 1.8))}
            className="p-2 text-slate-300 hover:text-white hover:bg-[#172642] border-b border-[#172642] transition-colors"
            title="Zoom In"
            aria-label="Zoom in"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setZoomLevel((z) => Math.max(z - 0.15, 0.7))}
            className="p-2 text-slate-300 hover:text-white hover:bg-[#172642] border-b border-[#172642] transition-colors"
            title="Zoom Out"
            aria-label="Zoom out"
          >
            <Minus className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setZoomLevel(1)}
            className="p-2 text-slate-300 hover:text-white hover:bg-[#172642] transition-colors"
            title="Reset Map"
            aria-label="Reset map"
          >
            <LocateFixed className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
