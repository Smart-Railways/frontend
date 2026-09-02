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
  AlertOctagon,
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

  // Purely real notifications derived directly from live database maintenance tasks
  const allNotifications = useMemo<RailwayNotification[]>(() => {
    return apiMaintenanceTasks
      .filter((task) => !dismissedIds.has(`api-task-${task.id}`))
      .map((task) => {
        const isUrgent = task.urgency === "CRITICAL" || task.urgency === "HIGH";
        const isScheduled = task.task_status === "SCHEDULED";
        const textForCorridor = `${task.section_name || ""} ${task.asset_name || ""} ${task.details || ""}`;
        const { sourceId, targetId } = extractStationIds(textForCorridor);

        const corridorDisplay =
          task.section_name ||
          (task.asset_name ? `Asset: ${task.asset_name}` : "Track Infrastructure Corridor");

        return {
          id: `api-task-${task.id}`,
          title: `${task.task_code || "TMS"}: ${task.details ? task.details.slice(0, 52) + (task.details.length > 52 ? "..." : "") : "Maintenance Work Order"}`,
          description: task.details || "Track inspection and infrastructure repair work order.",
          category: isUrgent ? "critical" : "maintenance",
          severity: isUrgent ? (task.urgency === "CRITICAL" ? "critical" : "high") : "medium",
          timestamp: task.logged_at ? new Date(task.logged_at).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }) : "Active Order",
          corridorOrStation: corridorDisplay,
          stationId: targetId || (sourceId !== "ndls" ? sourceId : undefined),
          taskCode: task.task_code,
          scheduledWindow: isScheduled ? "Approved Block Window" : "Awaiting Track Block",
          status: (task.task_status as "SCHEDULED" | "PENDING" | "IN_PROGRESS" | "COMPLETED") || "PENDING",
          durationMinutes: task.estimated_duration || 45,
          scheduledDate: task.deadline ? task.deadline.substring(0, 10) : "Scheduled",
          isRead: false,
        };
      });
  }, [apiMaintenanceTasks, dismissedIds]);

  const unreadCount = allNotifications.length;

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

  const scheduledMaintenanceCount = allNotifications.filter(
    (n) => n.status === "SCHEDULED" || n.category === "maintenance"
  ).length;

  const criticalCount = allNotifications.filter(
    (n) => n.severity === "critical" || n.category === "critical"
  ).length;

  const getCategoryBadge = (category: string, severity: string) => {
    if (severity === "critical" || category === "critical") {
      return {
        icon: TriangleAlert,
        bg: "bg-red-500/10 text-red-400 border-red-500/30",
        dot: "bg-red-500 animate-pulse",
      };
    }
    if (category === "maintenance") {
      return {
        icon: Wrench,
        bg: "bg-amber-500/10 text-amber-400 border-amber-500/30",
        dot: "bg-amber-400",
      };
    }
    return {
      icon: Info,
      bg: "bg-blue-500/10 text-blue-400 border-blue-500/30",
      dot: "bg-blue-400",
    };
  };

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
    <aside className="w-80 lg:w-96 flex-shrink-0 bg-[#070b13]/90 backdrop-blur-md border-l border-[#172642] flex flex-col h-full shadow-2xl">
      {/* Header */}
      <div className="p-4 border-b border-[#172642] flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="relative p-2 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400">
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-red-500 ring-2 ring-[#070b13] animate-pulse"></span>
            )}
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h2 className="text-sm font-bold text-white tracking-wide">
                Railway Alerts
              </h2>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-500/15 text-emerald-300 font-mono font-bold border border-emerald-500/30">
                LIVE
              </span>
            </div>
            <span className="text-[11px] text-slate-400 font-medium">
              Real-Time Maintenance & Work Orders
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => refetch()}
            disabled={isRefetching}
            className="p-1.5 rounded-lg bg-[#0d1527] hover:bg-[#152342] border border-[#172642] text-slate-300 hover:text-white transition-colors"
            title="Refresh alerts from database"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefetching ? "animate-spin text-amber-400" : ""}`} />
          </button>
          <Link
            href="/maintenance"
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-[11px] font-semibold text-amber-300 transition-colors"
            title="Go to Maintenance Planner"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Schedule</span>
          </Link>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="p-3 border-b border-[#172642]/60 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
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
            className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
              filter === tab.id
                ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm"
                : "text-slate-400 hover:text-slate-200 hover:bg-[#0d1527]"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Maintenance Quick Banner when Maintenance tab is active */}
      {filter === "maintenance" && (
        <div className="mx-3 mt-3 p-2.5 rounded-xl bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border border-amber-500/25 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Wrench className="w-4 h-4 text-amber-400" />
            <div>
              <div className="text-[11px] font-bold text-amber-200">
                Active Maintenance Registry
              </div>
              <div className="text-[10px] text-slate-400">
                {scheduledMaintenanceCount} real-time work orders active
              </div>
            </div>
          </div>
          <Link
            href="/maintenance"
            className="text-[10px] font-bold text-amber-400 hover:text-amber-300 underline flex items-center gap-0.5"
          >
            Manage <ExternalLink className="w-2.5 h-2.5 inline" />
          </Link>
        </div>
      )}

      {/* Notifications List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-48 text-center p-4">
            <RefreshCw className="w-7 h-7 text-amber-400 animate-spin mb-2" />
            <span className="text-xs font-bold text-white">Loading Real Alerts...</span>
            <p className="text-[11px] text-slate-400 mt-1">
              Synchronizing work orders with central database.
            </p>
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-center p-4">
            <CheckCircle2 className="w-8 h-8 text-emerald-400 mb-2 opacity-80" />
            <span className="text-xs font-bold text-white">No Active Alerts</span>
            <p className="text-[11px] text-slate-400 mt-1">
              All railway corridors are operating under clear signals with no active maintenance disruptions.
            </p>
            <Link
              href="/maintenance"
              className="mt-3 text-[11px] font-semibold text-amber-400 hover:underline inline-flex items-center gap-1"
            >
              <span>+ Create new maintenance order</span>
            </Link>
          </div>
        ) : (
          filteredNotifications.map((notif) => {
            const badge = getCategoryBadge(notif.category, notif.severity);
            const isMaintenance = notif.category === "maintenance" || notif.status === "SCHEDULED" || notif.status === "PENDING";

            return (
              <div
                key={notif.id}
                onClick={() => handleCardClick(notif)}
                className={`p-3.5 rounded-xl border transition-all cursor-pointer group relative overflow-hidden ${
                  isMaintenance
                    ? "bg-[#0d1527] border-amber-500/30 hover:border-amber-500/60 shadow-md"
                    : notif.severity === "critical"
                    ? "bg-[#140b10] border-red-500/40 hover:border-red-500 shadow-md"
                    : "bg-[#09101d]/70 border-[#172642]/60 hover:border-slate-600/50 opacity-80 hover:opacity-100"
                }`}
              >
                {/* Accent left border */}
                {notif.severity === "critical" ? (
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-red-500"></div>
                ) : isMaintenance ? (
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-amber-400"></div>
                ) : null}

                {/* Top Row: Category badge, Task Code, and Time */}
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span
                      className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border ${badge.bg}`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${badge.dot}`}></span>
                      <span className="uppercase tracking-wider">
                        {notif.category}
                      </span>
                    </span>

                    {notif.taskCode && (
                      <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-[#070b13] border border-[#1e3256] text-amber-300">
                        {notif.taskCode}
                      </span>
                    )}

                    <span className="text-[10px] font-medium text-slate-400 ml-1">
                      {notif.timestamp}
                    </span>
                  </div>

                  <button
                    onClick={(e) => handleDismiss(notif.id, e)}
                    className="p-1 rounded-md text-slate-500 hover:text-slate-300 hover:bg-[#172642] transition-colors"
                    title="Dismiss alert"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Title */}
                <h4 className="text-xs font-bold text-white group-hover:text-amber-300 transition-colors">
                  {notif.title}
                </h4>

                {/* Description */}
                <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                  {notif.description}
                </p>

                {/* Scheduled Maintenance Details Box */}
                {(notif.scheduledWindow || notif.durationMinutes) && (
                  <div className="mt-2.5 p-2 rounded-lg bg-[#070b13]/90 border border-amber-500/20 text-[11px] space-y-1.5">
                    <div className="flex items-center justify-between text-slate-300">
                      <div className="flex items-center gap-1 text-amber-300 font-semibold">
                        <Clock className="w-3 h-3 text-amber-400" />
                        <span>
                          {notif.scheduledWindow || "Maintenance Window"}
                        </span>
                      </div>
                      {notif.durationMinutes && (
                        <span className="text-[10px] font-mono text-slate-400 bg-[#0d1527] px-1.5 py-0.5 rounded border border-[#172642]">
                          {notif.durationMinutes} mins
                        </span>
                      )}
                    </div>

                    <div className="flex items-center justify-between pt-1 border-t border-[#172642]/60 text-[10px]">
                      <span className="inline-flex items-center gap-1 text-cyan-400 font-semibold">
                        <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse"></span>
                        {notif.status || "SCHEDULED"}
                      </span>

                      <Link
                        href="/maintenance"
                        className="text-amber-400 hover:text-amber-300 font-semibold inline-flex items-center gap-1 hover:underline"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <span>View Order</span>
                        <ExternalLink className="w-2.5 h-2.5" />
                      </Link>
                    </div>
                  </div>
                )}

                {/* Bottom Corridor Location Tag */}
                <div className="flex items-center justify-between mt-2.5 pt-2 border-t border-[#172642]/60 text-[11px]">
                  <div className="flex items-center gap-1.5 text-slate-300">
                    <MapPin className="w-3.5 h-3.5 text-blue-400" />
                    <span className="font-semibold text-slate-200 truncate max-w-[180px]">
                      {notif.corridorOrStation}
                    </span>
                  </div>
                  <span className="text-[10px] font-semibold text-blue-400 group-hover:text-amber-400 transition-colors">
                    Locate on Map →
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Bottom Summary Bar */}
      <div className="p-3 border-t border-[#172642] bg-[#05080e]/60 flex items-center justify-between text-[10px] text-slate-400">
        <span className="font-semibold text-slate-400">
          Live Database Feed ({allNotifications.length} Tasks)
        </span>
        <Link
          href="/maintenance"
          className="text-amber-400 hover:text-amber-300 font-semibold hover:underline"
        >
          All Schedules →
        </Link>
      </div>
    </aside>
  );
}
