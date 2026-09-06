"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  Bell,
  TriangleAlert,
  Wrench,
  Info,
  CheckCircle2,
  MapPin,
  Clock,
  Calendar,
  ExternalLink,
  PlusCircle,
  RefreshCw,
  Sparkles,
  Zap,
} from "lucide-react";
import { useMaintenanceTasks, useBlockWindows, useAssets } from "@/hooks";
import { Skeleton } from "@/components/ui/skeleton";

export interface RailwayNotification {
  id: string;
  rawTaskId: number;
  title: string;
  description: string;
  category: "critical" | "maintenance" | "advisory" | "operational";
  severity: "critical" | "high" | "medium" | "low";
  timestamp: string;
  corridorOrStation: string;
  stationId?: string;
  isRead?: boolean;
  taskCode?: string;
  scheduledWindow?: string;
  currentSlot?: string | null;
  currentSlotDate?: string | null;
  aiRecommendedSlot?: string | null;
  status?: "SCHEDULED" | "PENDING" | "IN_PROGRESS" | "COMPLETED";
  durationMinutes?: number;
  scheduledDate?: string;
}

interface NotificationPanelProps {
  onSelectCorridor?: (stationId?: string, originId?: string) => void;
}

// Helper to infer source and destination station IDs from corridor/section text
function extractStationIds(text: string): { sourceId?: string; targetId?: string } {
  const lower = (text || "").toLowerCase();
  const found: string[] = [];

  const mappings: [string[], string][] = [
    [["delhi", "ndls"], "ndls"],
    [["mathura", "mtj"], "mtj"],
    [["agra", "agc"], "agc"],
    [["gwalior", "gwl"], "gwl"],
    [["jhansi", "vglj", "jhs"], "jhs"],
    [["bina"], "bina"],
    [["bhopal", "bpl"], "bpl"],
    [["ratlam", "rtm"], "rtm"],
    [["vadodara", "brc"], "brc"],
    [["surat", "st"], "st"],
    [["mumbai", "mmct"], "mmct"],
  ];

  for (const [aliases, code] of mappings) {
    if (aliases.some((alias) => lower.includes(alias))) {
      if (!found.includes(code)) found.push(code);
    }
  }

  if (found.length >= 2) {
    return { sourceId: found[0], targetId: found[1] };
  } else if (found.length === 1) {
    return { sourceId: "ndls", targetId: found[0] };
  }
  return {};
}

export function NotificationPanel({ onSelectCorridor }: NotificationPanelProps) {
  const [filter, setFilter] = useState<"all" | "critical" | "maintenance">("all");

  // Dynamically fetch strictly REAL pending/active maintenance tasks from backend API
  const { data: apiMaintenanceTasks = [], isLoading: loadingTasks, refetch, isRefetching } = useMaintenanceTasks();
  const { data: blockWindows = [], isLoading: loadingBlocks } = useBlockWindows();
  const { data: assets = [] } = useAssets();

  const isLoading = loadingTasks || loadingBlocks;

  const allNotifications = useMemo<RailwayNotification[]>(() => {
    return apiMaintenanceTasks
      .filter((task) => task.task_status !== "COMPLETED") // Only show pending/active tasks
      .map((task) => {
        const isUrgent = task.urgency === "CRITICAL" || task.urgency === "HIGH";
        const isScheduled = task.task_status === "SCHEDULED";
        const textForCorridor = `${task.section_name || ""} ${task.asset_name || ""} ${task.details || ""}`;
        const { sourceId, targetId } = extractStationIds(textForCorridor);

        const corridorDisplay =
          task.section_name ||
          (task.asset_name ? `Asset: ${task.asset_name}` : "Corridor Section");

        const taskCodeDisplay = task.task_code || `TMS-${task.id}`;
        const detailsDisplay = task.details || "Preventive Maintenance Task";

        // Find matching block window
        const taskAsset = assets.find((a) => a.id === task.asset);
        const secId = taskAsset?.section;
        const secName = task.section_name || taskAsset?.section_name;
        const matchingBw = blockWindows.find((bw) => {
          if (secId && Number(bw.section) === Number(secId)) return true;
          if (
            secName &&
            bw.section_name &&
            bw.section_name.trim().toLowerCase() === secName.trim().toLowerCase()
          ) {
            return true;
          }
          return false;
        });

        let currentSlot: string | null = null;
        let currentSlotDate: string | null = null;

        if (matchingBw) {
          try {
            const s = new Date(matchingBw.start_time);
            const e = new Date(matchingBw.end_time);
            if (!isNaN(s.getTime()) && !isNaN(e.getTime())) {
              const startStr = s.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", hour12: false });
              const endStr = e.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", hour12: false });
              currentSlot = `${startStr} – ${endStr}`;
              currentSlotDate = s.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
            }
          } catch {
            currentSlot = "Allocated Window";
          }
        }

        const duration = task.estimated_duration || 90;
        const aiSlotDisplay = `00:00 – ${String(Math.floor(duration / 60)).padStart(2, "0")}:${String(duration % 60).padStart(2, "0")} (${duration} min)`;

        return {
          id: `api-task-${task.id}`,
          rawTaskId: task.id,
          title: `${taskCodeDisplay}: ${detailsDisplay.slice(0, 52)}${detailsDisplay.length > 52 ? "..." : ""}`,
          description: detailsDisplay,
          category: isUrgent ? "critical" : "maintenance",
          severity: isUrgent ? (task.urgency === "CRITICAL" ? "critical" : "high") : "medium",
          timestamp: task.logged_at ? new Date(task.logged_at).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }) : "",
          corridorOrStation: corridorDisplay,
          stationId: targetId || (sourceId !== "ndls" ? sourceId : undefined),
          taskCode: taskCodeDisplay,
          scheduledWindow: isScheduled ? "Approved Block Window" : "Awaiting Track Block",
          currentSlot,
          currentSlotDate,
          aiRecommendedSlot: aiSlotDisplay,
          status: (task.task_status as "SCHEDULED" | "PENDING" | "IN_PROGRESS" | "COMPLETED") || "PENDING",
          durationMinutes: duration,
          scheduledDate: task.deadline ? task.deadline.substring(0, 10) : "Scheduled",
          isRead: false,
        };
      });
  }, [apiMaintenanceTasks, blockWindows, assets]);

  const filteredNotifications = allNotifications.filter((n) => {
    if (filter === "all") return true;
    if (filter === "critical") return n.severity === "critical" || n.category === "critical";
    if (filter === "maintenance") return n.category === "maintenance" || n.status === "SCHEDULED";
    return true;
  });

  const criticalCount = allNotifications.filter(
    (n) => n.severity === "critical" || n.category === "critical"
  ).length;

  const scheduledMaintenanceCount = allNotifications.filter(
    (n) => n.status === "SCHEDULED" || n.category === "maintenance"
  ).length;

  const handleCardClick = (notif: RailwayNotification) => {
    const { sourceId, targetId } = extractStationIds(
      `${notif.corridorOrStation} ${notif.description} ${notif.title}`
    );
    if (targetId && sourceId) {
      onSelectCorridor?.(targetId, sourceId);
    } else if (notif.stationId) {
      onSelectCorridor?.(notif.stationId);
    }
  };

  return (
    <aside className="w-80 lg:w-96 shrink-0 bg-brand-tertiary/40 border-l border-brand-border flex flex-col h-screen sticky top-0 overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-brand-border flex items-center justify-between bg-brand-surface/70 shrink-0">
        <div className="flex items-center gap-2.5">
          <div>
            <div className="flex items-center gap-1.5">
              <h2 className="text-sm font-extrabold text-brand-secondary tracking-tight">
                Railway Alerts
              </h2>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-brand-blue-light text-brand-primary font-bold border border-brand-primary/20">
                LIVE
              </span>
            </div>
            <span className="text-[11px] text-brand-muted font-medium block">
              Real-Time Pending Maintenance & Work Orders
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => refetch()}
            disabled={isRefetching}
            className="p-2 rounded-xl bg-brand-surface hover:bg-brand-tertiary border border-brand-border text-brand-secondary shadow-xs transition-colors cursor-pointer"
            title="Refresh alerts"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefetching ? "animate-spin text-brand-primary" : ""}`} />
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="p-3 border-b border-brand-border flex items-center gap-1.5 overflow-x-auto no-scrollbar bg-brand-surface/30 shrink-0">
        {(
          [
            { id: "all", label: `All (${allNotifications.length})` },
            { id: "critical", label: `Critical (${criticalCount})` },
            { id: "maintenance", label: `Maintenance (${scheduledMaintenanceCount})` },
          ] as const
        ).map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFilter(tab.id as typeof filter)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
              filter === tab.id
                ? "bg-brand-primary text-white shadow-xs"
                : "text-brand-muted hover:text-brand-secondary hover:bg-brand-surface"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Notifications List */}
      <div className="flex-1 overflow-y-auto min-h-0 p-4 space-y-3">
        {(isLoading || isRefetching) ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, idx) => (
              <div
                key={idx}
                className="p-4 rounded-2xl bg-brand-surface border border-brand-border shadow-xs space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-5 w-16 rounded-full" />
                    <Skeleton className="h-5 w-20 rounded-md" />
                    <Skeleton className="h-3 w-12 rounded" />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Skeleton className="h-4 w-48 rounded" />
                  <Skeleton className="h-3 w-36 rounded" />
                </div>
                <div className="p-3 rounded-xl bg-brand-tertiary border border-brand-border space-y-2">
                  <div className="flex items-center justify-between">
                    <Skeleton className="h-4 w-32 rounded" />
                    <Skeleton className="h-4 w-14 rounded-md" />
                  </div>
                  <div className="flex items-center justify-between pt-1 border-t border-brand-border/60">
                    <Skeleton className="h-3 w-16 rounded" />
                    <Skeleton className="h-3 w-20 rounded" />
                  </div>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-brand-border/60">
                  <Skeleton className="h-4 w-28 rounded" />
                  <Skeleton className="h-3 w-24 rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-center p-4">
            <CheckCircle2 className="w-8 h-8 text-emerald-500 mb-2 opacity-80" />
            <span className="text-xs font-bold text-brand-secondary">No Pending Maintenance Alerts</span>
            <p className="text-[11px] text-brand-muted mt-1">
              All railway corridors are operating under clear signals with no pending work orders.
            </p>
          </div>
        ) : (
          filteredNotifications.map((notif) => {
            return (
              <div
                key={notif.id}
                onClick={() => handleCardClick(notif)}
                className="p-4 rounded-2xl bg-brand-surface border border-brand-border shadow-xs hover:shadow-md transition-all cursor-pointer space-y-3"
              >
                {/* Top Row: Category badge, Task Code, Time */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`inline-flex items-center gap-1.5 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full shadow-2xs ${
                      notif.severity === "critical"
                        ? "bg-red-600 text-white"
                        : notif.severity === "high"
                        ? "bg-amber-500 text-white"
                        : "bg-brand-primary text-white"
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full bg-white ${notif.severity === "critical" ? "animate-pulse" : ""}`}></span>
                      <span>{notif.severity.toUpperCase()}</span>
                    </span>

                    {notif.taskCode && (
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-brand-secondary text-white">
                        {notif.taskCode}
                      </span>
                    )}

                    <span className="text-[10px] font-medium text-brand-muted">
                      {notif.timestamp}
                    </span>
                  </div>
                </div>

                {/* Title and Subtitle */}
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-brand-secondary">
                    {notif.title}
                  </h4>
                  <p className="text-[11px] text-brand-muted mt-0.5 font-medium leading-snug">
                    {notif.description}
                  </p>
                </div>

                {/* Slots & Quick Details Box */}
                <div className="p-3 rounded-xl bg-brand-tertiary/70 border border-brand-border text-xs space-y-2.5">
                  {/* Current Slot Info */}
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[9px] font-bold uppercase text-brand-muted block mb-0.5 tracking-wider">CURRENT SLOT</span>
                      <div className="flex items-center gap-1.5 font-mono text-xs font-bold text-brand-secondary">
                        <Clock className="w-3.5 h-3.5 text-brand-primary shrink-0" />
                        <span>{notif.currentSlot || "Pending Allocation"}</span>
                      </div>
                    </div>
                    {notif.durationMinutes ? (
                      <span className="text-[10px] font-mono font-bold text-brand-secondary bg-brand-surface px-2 py-0.5 rounded-md border border-brand-border shadow-2xs">
                        {notif.durationMinutes} mins
                      </span>
                    ) : null}
                  </div>

                  {/* AI Slot Quick Action Banner */}
                  <div className="p-2.5 rounded-lg bg-brand-blue-light/50 border border-brand-primary/30 flex items-center justify-between gap-2">
                    <div>
                      <span className="text-[9px] font-bold uppercase text-brand-primary flex items-center gap-1 tracking-wider">
                        <Sparkles className="w-3 h-3 text-brand-primary fill-brand-primary/20" /> AI RECOMMENDED SLOT
                      </span>
                      <span className="font-mono text-xs font-bold text-brand-primary block mt-0.5">
                        {notif.aiRecommendedSlot}
                      </span>
                    </div>
                  </div>

                  {/* Status & View Order */}
                  <div className="flex items-center justify-between pt-1 border-t border-brand-border/60 text-xs">
                    <span className="inline-flex items-center gap-1.5 text-brand-primary font-bold text-[11px]">
                      <span className="w-1.5 h-1.5 rounded-full bg-brand-primary"></span>
                      {notif.status || "PENDING"}
                    </span>

                    <Link
                      href="/maintenance"
                      className="text-brand-secondary hover:text-brand-primary font-bold text-[11px] inline-flex items-center gap-1"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <span>View Order</span>
                      <ExternalLink className="w-3 h-3" />
                    </Link>
                  </div>
                </div>

                {/* Quick Action Shortcuts Bar */}
                <div className="flex items-center justify-between pt-2 border-t border-brand-border/60 text-xs flex-wrap gap-1.5">
                  <div className="flex items-center gap-1.5 text-brand-secondary font-bold text-[11px]">
                    <MapPin className="w-3.5 h-3.5 text-brand-primary shrink-0" />
                    <span className="truncate max-w-[130px]">{notif.corridorOrStation}</span>
                  </div>

                  <div className="flex items-center gap-1.5">

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCardClick(notif);
                      }}
                      className="text-[11px] font-bold text-brand-primary hover:underline ml-1 cursor-pointer"
                    >
                      Locate →
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </aside>
  );
}
