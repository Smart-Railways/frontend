"use client";

import React, { useState } from "react";
import { VerticalNavbar } from "@/components/navigation/vertical-navbar";
import { HorizontalRouteSelector } from "@/components/route-selector/horizontal-route-selector";
import { IndiaRailwayMap } from "@/components/map/india-railway-map";
import { NotificationPanel } from "@/components/notifications/notification-panel";
import { Route } from "lucide-react";
import { LiveClock } from "@/components/ui/live-clock";

export default function Home() {
  // Default premier corridor: New Delhi (NDLS) to Mumbai Central (MMCT)
  const [sourceId, setSourceId] = useState<string>("ndls");
  const [targetId, setTargetId] = useState<string>("mmct");
  const [activeNavTab, setActiveNavTab] = useState<string>("routes");

  const handleSwapStations = () => {
    const temp = sourceId;
    setSourceId(targetId);
    setTargetId(temp);
  };

  const handleClearRoute = () => {
    setSourceId("");
    setTargetId("");
  };

  const handleSelectStationFromMap = (stationId: string) => {
    if (!sourceId) {
      setSourceId(stationId);
    } else if (!targetId && stationId !== sourceId) {
      setTargetId(stationId);
    } else {
      // Re-assign target
      setTargetId(stationId);
    }
  };

  const handleSelectCorridorFromNotification = (stationId?: string, originId?: string) => {
    if (originId && stationId) {
      setSourceId(originId);
      setTargetId(stationId);
      return;
    }
    if (!stationId) return;
    // Set as destination from current origin
    if (stationId !== sourceId) {
      setTargetId(stationId);
    } else {
      setSourceId("ndls");
      setTargetId(stationId);
    }
  };

  return (
    <div className="min-h-screen bg-[#070b13] text-slate-100 flex flex-col font-sans selection:bg-emerald-500/30 selection:text-emerald-200">
      {/* 1. Left Fixed Vertical Navbar */}
      <VerticalNavbar
        activeTab={activeNavTab}
        onTabChange={setActiveNavTab}
        unreadCount={4}
      />

      {/* Main App Container with Left Navbar Offset & Right Notification Panel */}
      <div className="flex-1 flex pl-20 lg:pl-64">
        {/* 2. Center Content Area (Main Focus: India Railway Map & Selector) */}
        <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-7 flex flex-col space-y-5 overflow-y-auto max-w-[1500px] mx-auto w-full">
          
          {/* Top Operational Header */}
          <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#172642]/60">
            <div>
              <div className="flex items-center gap-2.5">
                <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 shadow-sm shadow-emerald-950">
                  <Route className="w-4 h-4" />
                </div>
                <div>
                  <h1 className="text-lg sm:text-xl font-extrabold text-white tracking-tight">
                    Railway Route Dashboard
                  </h1>
                </div>
              </div>
              <p className="text-xs text-slate-400 mt-3">
                Pan-India corridor planning, automated block scheduling, and real-time network pathfinder.
              </p>
            </div>

            {/* Quick System Badges */}
            <div className="flex items-center gap-3">
              <LiveClock />
            </div>
          </header>

          {/* 3. Horizontal From -> To Dropdown Selector */}
          <section aria-label="Route Selector">
            <HorizontalRouteSelector
              sourceId={sourceId}
              targetId={targetId}
              onSourceChange={setSourceId}
              onTargetChange={setTargetId}
              onSwap={handleSwapStations}
              onClear={handleClearRoute}
            />
          </section>

          {/* 4. Center Stage: India Railway Map */}
          <section aria-label="India Railway Map" className="flex-1 min-h-[600px]">
            <IndiaRailwayMap
              sourceId={sourceId}
              targetId={targetId}
              onSelectStation={handleSelectStationFromMap}
            />
          </section>
        </main>

        {/* 5. Right-side Notification Panel */}
        <div className="hidden xl:block">
          <NotificationPanel
            onSelectCorridor={handleSelectCorridorFromNotification}
          />
        </div>
      </div>
    </div>
  );
}
