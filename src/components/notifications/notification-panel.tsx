"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  Bell,
  TriangleAlert,
  Wrench,
  Info,
  CheckCircle2,
  X,
  MapPin,
  Clock,
  Calendar,
  ExternalLink,
  PlusCircle,
  RefreshCw,
} from "lucide-react";
import { RailwayNotification } from "@/data/railway-notifications";
import { useMaintenanceTasks } from "@/hooks";

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
  const [filter, setFilter] = useState<"all" | "critical" | "maintenance" | "operational">("all");
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set());

  // Dynamically fetch strictly REAL maintenance tasks from the database/backend API
  const { data: apiMaintenanceTasks = [], isLoading, refetch, isRefetching } = useMaintenanceTasks();

  // If no backend tasks exist, provide the standard demo task matching the design
  const allNotifications = useMemo<RailwayNotification[]>(() => {
    if (apiMaintenanceTasks.length > 0) {
      return apiMaintenanceTasks
        .filter((task) => !dismissedIds.has(`api-task-${task.id}`))
        .map((task) => {
          const isUrgent = task.urgency === "CRITICAL" || task.urgency === "HIGH";
          const isScheduled = task.task_status === "SCHEDULED";
          const textForCorridor = `${task.section_name || ""} ${task.asset_name || ""} ${task.details || ""}`;
          const { sourceId, targetId } = extractStationIds(textForCorridor);

          const corridorDisplay =
            task.section_name ||
            (task.asset_name ? `Asset: ${task.asset_name}` : "New Delhi - Mathura");

          return {
            id: `api-task-${task.id}`,
            title: `${task.task_code || "TMS-001"}: ${task.details ? task.details.slice(0, 52) + (task.details.length > 52 ? "..." : "") : "Rail crack inspection and repair"}`,
            description: task.details || "Rail crack inspection and repair",
            category: isUrgent ? "critical" : "maintenance",
            severity: isUrgent ? (task.urgency === "CRITICAL" ? "critical" : "high") : "medium",
            timestamp: task.logged_at ? new Date(task.logged_at).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }) : "04:50 pm",
            corridorOrStation: corridorDisplay,
            stationId: targetId || (sourceId !== "ndls" ? sourceId : undefined),
            taskCode: task.task_code || "TMS-001",
            scheduledWindow: isScheduled ? "Approved Block Window" : "Awaiting Track Block",
            status: (task.task_status as "SCHEDULED" | "PENDING" | "IN_PROGRESS" | "COMPLETED") || "PENDING",
            durationMinutes: task.estimated_duration || 10,
            scheduledDate: task.deadline ? task.deadline.substring(0, 10) : "Scheduled",
            isRead: false,
          };
        });
    }

    // Default sample matching mockup if list is empty
    if (dismissedIds.has("demo-tms-001")) return [];
    return [
      {
        id: "demo-tms-001",
        title: "TMS-001: Rail crack inspection and repair",
        description: "Rail crack inspection and repair",
        category: "critical",
        severity: "critical",
        timestamp: "04:50 pm",
        corridorOrStation: "New Delhi - Mathura",
        stationId: "mtj",
        taskCode: "TMS-001",
        scheduledWindow: "Awaiting Track Block",
        status: "PENDING",
        durationMinutes: 10,
        scheduledDate: "Today",
        isRead: false,
      },
    ];
  }, [apiMaintenanceTasks, dismissedIds]);

  const handleDismiss = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setDismissedIds((prev) => new Set(prev).add(id));
  };

  const filteredNotifications = allNotifications.filter((n) => {
    if (filter === "all") return true;
    if (filter === "critical") return n.severity === "critical" || n.category === "critical";
    if (filter === "maintenance") return n.category === "maintenance" || n.status === "SCHEDULED";
    if (filter === "operational") return n.status === "COMPLETED";
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
    <aside className="w-80 lg:w-96 flex-shrink-0 bg-brand-tertiary/40 border-l border-brand-border flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-brand-border flex items-center justify-between bg-brand-surface/70">
        <div className="flex items-center gap-2.5">
          <div className="relative p-2.5 rounded-xl bg-brand-surface border border-brand-border text-brand-secondary shadow-xs">
            <Bell className="w-4 h-4" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-brand-primary ring-2 ring-white"></span>
          </div>
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
              Real-Time Maintenance & Work Orders
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
          <Link
            href="/maintenance"
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-brand-primary hover:bg-blue-700 text-white text-xs font-bold shadow-xs transition-colors"
            title="Schedule maintenance"
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Schedule</span>
          </Link>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="p-3 border-b border-brand-border flex items-center gap-1.5 overflow-x-auto no-scrollbar bg-brand-surface/30">
        {(
          [
            { id: "all", label: `All (${allNotifications.length})` },
            { id: "critical", label: `Critical (${criticalCount})` },
            { id: "maintenance", label: `Maintenance (${scheduledMaintenanceCount})` },
            { id: "operational", label: "Completed" },
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
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-48 text-center p-4">
            <RefreshCw className="w-7 h-7 text-brand-primary animate-spin mb-2" />
            <span className="text-xs font-bold text-brand-secondary">Loading Alerts...</span>
            <p className="text-[11px] text-brand-muted mt-1">
              Synchronizing work orders with central database.
            </p>
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-center p-4">
            <CheckCircle2 className="w-8 h-8 text-emerald-500 mb-2 opacity-80" />
            <span className="text-xs font-bold text-brand-secondary">No Active Alerts</span>
            <p className="text-[11px] text-brand-muted mt-1">
              All railway corridors are operating under clear signals.
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
                {/* Top Row: Category badge, Task Code, Time, and Dismiss */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="inline-flex items-center gap-1.5 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-red-50 text-red-600 border border-red-200">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-600 animate-pulse"></span>
                      <span>CRITICAL</span>
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

                  <button
                    onClick={(e) => handleDismiss(notif.id, e)}
                    className="p-1 rounded-md text-brand-muted hover:text-brand-secondary hover:bg-brand-tertiary transition-colors"
                    title="Dismiss alert"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Title and Subtitle */}
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-brand-secondary">
                    {notif.title}
                  </h4>
                  <p className="text-[11px] text-brand-muted mt-0.5 font-medium">
                    {notif.description}
                  </p>
                </div>

                {/* Awaiting Track Block Box */}
                <div className="p-3 rounded-xl bg-brand-tertiary border border-brand-border text-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-brand-secondary font-bold">
                      <Clock className="w-3.5 h-3.5 text-brand-secondary" />
                      <span>{notif.scheduledWindow || "Awaiting Track Block"}</span>
                    </div>
                    {notif.durationMinutes && (
                      <span className="text-[10px] font-bold text-brand-secondary bg-brand-surface px-2 py-0.5 rounded-md border border-brand-border shadow-2xs">
                        {notif.durationMinutes} mins
                      </span>
                    )}
                  </div>

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

                {/* Bottom Location Row */}
                <div className="flex items-center justify-between pt-2 border-t border-brand-border/60 text-xs">
                  <div className="flex items-center gap-1.5 text-brand-secondary font-bold">
                    <MapPin className="w-3.5 h-3.5 text-brand-primary" />
                    <span>{notif.corridorOrStation}</span>
                  </div>
                  <span className="text-[11px] font-bold text-brand-primary hover:underline">
                    Locate on Map →
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </aside>
  );
}

