"use client";

import React, { useState, useEffect } from "react";
import { VerticalNavbar } from "@/components/navigation/vertical-navbar";
import { HorizontalRouteSelector } from "@/components/route-selector/horizontal-route-selector";
import { IndiaRailwayMap } from "@/components/map/india-railway-map";
import { NotificationPanel } from "@/components/notifications/notification-panel";
import { Route } from "lucide-react";
import { LiveClock } from "@/components/ui/live-clock";
import { Skeleton } from "@/components/ui/skeleton";

// ---------------------------------------------------------------------------
// Skeleton shown during initial client hydration (map + route selector heavy)
// ---------------------------------------------------------------------------
function DashboardPageSkeleton() {
  return (
    <div className="min-h-screen bg-brand-tertiary text-brand-secondary flex flex-col font-sans">
      <div className="flex-1 flex pl-0 lg:pl-64 pt-14 lg:pt-0">
        <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-7 flex flex-col space-y-4 max-w-[1600px] mx-auto w-full">

          {/* Header */}
          <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-brand-border/80">
            <div className="space-y-1.5">
              <div className="flex items-center gap-3">
                <Skeleton className="w-9 h-9 rounded-xl" />
                <Skeleton className="h-7 w-56" />
              </div>
              <Skeleton className="h-3 w-96" />
            </div>
            <Skeleton className="h-8 w-36 rounded-xl" />
          </header>

          {/* Route Selector Bar */}
          <section>
            <div className="p-4 rounded-2xl bg-brand-surface border border-brand-border shadow-sm flex items-center gap-3">
              <Skeleton className="h-9 w-48 rounded-xl" />
              <Skeleton className="w-8 h-8 rounded-xl" />
              <Skeleton className="h-9 w-48 rounded-xl" />
              <div className="ml-auto flex items-center gap-2">
                <Skeleton className="h-8 w-20 rounded-xl" />
                <Skeleton className="h-8 w-20 rounded-xl" />
              </div>
            </div>
          </section>

          {/* Map Placeholder */}
          <section className="flex-1 min-h-[580px]">
            <div className="w-full h-full min-h-[580px] rounded-2xl bg-brand-surface border border-brand-border shadow-sm overflow-hidden relative">
              <Skeleton className="absolute inset-0 w-full h-full rounded-2xl" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="flex flex-col items-center gap-3">
                  <Skeleton className="w-16 h-16 rounded-2xl" />
                  <Skeleton className="h-4 w-40" />
                  <Skeleton className="h-3 w-56" />
                </div>
              </div>
            </div>
          </section>

        </main>

        {/* Right notification panel stub */}
        <div className="hidden xl:flex flex-col w-72 p-4 gap-4 border-l border-brand-border/60">
          <Skeleton className="h-6 w-36" />
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="p-3 rounded-xl bg-brand-surface border border-brand-border space-y-2">
              <div className="flex items-center gap-2">
                <Skeleton className="w-6 h-6 rounded-lg shrink-0" />
                <Skeleton className="h-4 w-24" />
              </div>
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-3/4" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  // Default premier corridor: New Delhi (NDLS) to Mumbai Central (MMCT)
  const [sourceId, setSourceId] = useState<string>("ndls");
  const [targetId, setTargetId] = useState<string>("mmct");
  const [activeNavTab, setActiveNavTab] = useState<string>("dashboard");
  // Show skeleton during client-side hydration — map is expensive to render
  const [mounted, setMounted] = useState<boolean>(false);

  useEffect(() => {
    setMounted(true);
  }, []);

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

  if (!mounted) {
    return (
      <div className="min-h-screen bg-brand-tertiary flex flex-col font-sans">
        <VerticalNavbar activeTab={activeNavTab} onTabChange={setActiveNavTab} unreadCount={1} />
        <DashboardPageSkeleton />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-tertiary text-brand-secondary flex flex-col font-sans selection:bg-brand-primary/20 selection:text-brand-primary">
      {/* 1. Left Fixed Vertical Navbar */}
      <VerticalNavbar
        activeTab={activeNavTab}
        onTabChange={setActiveNavTab}
        unreadCount={1}
      />

      {/* Main App Container with Left Navbar Offset & Right Notification Panel */}
      <div className="flex-1 flex pl-0 lg:pl-64 pt-14 lg:pt-0">
        {/* 2. Center Content Area */}
        <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-7 flex flex-col space-y-4 max-w-[1600px] mx-auto w-full">
          
          {/* Top Operational Header */}
          <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-brand-border/80">
            <div>
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-brand-secondary/80 text-white shadow-xs flex-shrink-0">
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

            {/* Live Clock & Date Badge (Desktop only; on mobile/tablet it is in upper corridor) */}
            <div className="hidden lg:flex items-center gap-3">
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
        <div className="hidden xl:block shrink-0 sticky top-0 h-screen overflow-hidden">
          <NotificationPanel
            onSelectCorridor={handleSelectCorridorFromNotification}
          />
        </div>
      </div>
    </div>
  );
}
