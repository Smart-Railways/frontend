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
  const [activeNavTab, setActiveNavTab] = useState<string>("dashboard");

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
    if (stationId !== sourceId) {
      setTargetId(stationId);
    } else {
      setSourceId("ndls");
      setTargetId(stationId);
    }
  };

  return (
    <div className="min-h-screen bg-brand-tertiary text-brand-secondary flex flex-col font-sans selection:bg-brand-primary/20 selection:text-brand-primary">
      {/* 1. Left Fixed Vertical Navbar */}
      <VerticalNavbar
        activeTab={activeNavTab}
        onTabChange={setActiveNavTab}
        unreadCount={1}
      />

      {/* Main App Container with Left Navbar Offset & Right Notification Panel */}
      <div className="flex-1 flex pl-20 lg:pl-64">
        {/* 2. Center Content Area */}
        <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-7 flex flex-col space-y-4 max-w-[1600px] mx-auto w-full">
          
          {/* Top Operational Header */}
          <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-brand-border/80">
            <div>
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-brand-secondary text-white shadow-xs flex-shrink-0">
                  <Route className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-xl sm:text-2xl font-extrabold text-brand-secondary tracking-tight">
                    Railway Route Dashboard
                  </h1>
                </div>
              </div>
              <p className="text-xs text-brand-muted mt-1.5 font-medium">
                Pan-India corridor planning, automated block scheduling, and real-time network pathfinder.
              </p>
            </div>

            {/* Live Clock & Date Badge */}
            <div className="flex items-center gap-3">
              <LiveClock />
            </div>
          </header>

          {/* 3. Horizontal Route Selector */}
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
          <section aria-label="India Railway Map" className="flex-1 min-h-[580px]">
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
