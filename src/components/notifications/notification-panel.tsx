"use client";

import React, { useMemo } from "react";
import Link from "next/link";
import {
  CheckCircle2,
  MapPin,
  Clock,
  ExternalLink,
  RefreshCw,
  Activity,
  Zap,
  AlertTriangle,
  Wrench,
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
  status?: "ACTIVE";
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

// Severity display config
const severityConfig = {
  critical: {
    badge: "bg-red-500 text-white",
    border: "border-l-red-500",
    iconBg: "bg-red-50",
    icon: AlertTriangle,
    iconColor: "text-red-500",
    bar: "bg-red-500",
    accentColor: "#ef4444",
  },
  high: {
    badge: "bg-amber-500 text-white",
    border: "border-l-amber-500",
    iconBg: "bg-amber-50",
    icon: Zap,
    iconColor: "text-amber-500",
    bar: "bg-amber-500",
    accentColor: "#f59e0b",
  },
  medium: {
    badge: "bg-blue-500 text-white",
    border: "border-l-blue-400",
    iconBg: "bg-blue-50",
    icon: Wrench,
    iconColor: "text-blue-500",
    bar: "bg-blue-500",
    accentColor: "#3b82f6",
  },
  low: {
    badge: "bg-slate-500 text-white",
    border: "border-l-slate-400",
    iconBg: "bg-slate-50",
    icon: Wrench,
    iconColor: "text-slate-500",
    bar: "bg-slate-400",
    accentColor: "#94a3b8",
  },
};

/**
 * Alert severity represents the maintenance task's criticality score. Priority
 * remains a planning field and can legitimately differ from a task's risk.
 */
function getAlertSeverity(
  riskRating: number | null | undefined,
  urgency: string | null | undefined,
): RailwayNotification["severity"] {
  if (typeof riskRating === "number") {
    if (riskRating >= 8) return "critical";
    if (riskRating >= 6) return "high";
    if (riskRating >= 4) return "medium";
    return "low";
  }

  switch (urgency?.trim().toUpperCase()) {
    case "CRITICAL":
      return "critical";
    case "HIGH":
      return "high";
    case "LOW":
      return "low";
    default:
      return "medium";
  }
}

export function NotificationPanel({ onSelectCorridor }: NotificationPanelProps) {
  // The home alert panel is an execution monitor: show work that is underway only.
  const { data: apiMaintenanceTasks = [], isLoading: loadingTasks, refetch, isRefetching } = useMaintenanceTasks();
  const { data: blockWindows = [], isLoading: loadingBlocks } = useBlockWindows();
  const { data: assets = [] } = useAssets();

  const isLoading = loadingTasks || loadingBlocks;

  const allNotifications = useMemo<RailwayNotification[]>(() => {
    return apiMaintenanceTasks
      .filter((task) => task.task_status?.toUpperCase() === "ACTIVE")
      .map((task) => {
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
        return {
          id: `api-task-${task.id}`,
          rawTaskId: task.id,
          title: `${taskCodeDisplay}: ${detailsDisplay.slice(0, 52)}${detailsDisplay.length > 52 ? "..." : ""}`,
          description: detailsDisplay,
          category: task.risk_rating >= 8 ? "critical" : "maintenance",
          severity: getAlertSeverity(task.risk_rating, task.urgency),
          timestamp: task.logged_at ? new Date(task.logged_at).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }) : "",
          corridorOrStation: corridorDisplay,
          stationId: targetId || (sourceId !== "ndls" ? sourceId : undefined),
          taskCode: taskCodeDisplay,
          scheduledWindow: "Maintenance in progress",
          currentSlot,
          currentSlotDate,
          status: "ACTIVE",
          durationMinutes: duration,
          scheduledDate: task.deadline ? task.deadline.substring(0, 10) : "Scheduled",
          isRead: false,
        };
      });
  }, [apiMaintenanceTasks, blockWindows, assets]);

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

      {/* ── Header ───────────────────────────────────────────── */}
      <div className="px-4 py-3.5 border-b border-brand-border flex items-center justify-between bg-brand-surface/80 shrink-0 backdrop-blur-sm">
        <div className="flex flex-col gap-0.5">
          {/* Title row — "Railway Alerts" + LIVE pill on same line */}
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-extrabold text-brand-secondary tracking-tight leading-none">
              Railway Alerts
            </h2>
            <span className="inline-flex items-center gap-1 bg-red-50 border border-red-200 text-red-600 text-[10px] font-extrabold px-2 py-0.5 rounded-full leading-none tracking-wide select-none">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-beacon-pulse shrink-0" />
              LIVE
            </span>
          </div>
          <span className="text-[11px] text-brand-muted font-medium leading-none mt-0.5">
            Active Maintenance
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Active count badge */}
          {!isLoading && allNotifications.length > 0 && (
            <span className="text-[10px] font-bold bg-brand-primary/10 text-brand-primary px-2 py-0.5 rounded-full border border-brand-primary/20 leading-none">
              {allNotifications.length} active
            </span>
          )}
          <button
            onClick={() => refetch()}
            disabled={isRefetching}
            className="smooth-btn p-2 rounded-xl bg-brand-surface hover:bg-brand-tertiary border border-brand-border text-brand-secondary shadow-xs hover:border-brand-primary/30 active:scale-90 transition-all cursor-pointer"
            title="Refresh alerts"
          >
            <RefreshCw className={`w-3.5 h-3.5 transition-transform ${isRefetching ? "animate-spin text-brand-primary" : ""}`} />
          </button>
        </div>
      </div>

      {/* ── Notifications List ────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto min-h-0 p-3 space-y-3">
        {(isLoading || isRefetching) ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, idx) => (
              <div
                key={idx}
                className="rounded-2xl bg-brand-surface border border-brand-border shadow-xs overflow-hidden"
              >
                <div className="h-0.5 w-full bg-gradient-to-r from-brand-border via-brand-muted/30 to-brand-border" />
                <div className="p-4 space-y-3">
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-5 w-16 rounded-full" />
                    <Skeleton className="h-5 w-20 rounded-md" />
                    <Skeleton className="h-3 w-12 rounded" />
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
                    <Skeleton className="h-1.5 w-full rounded-full" />
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
              </div>
            ))}
          </div>
        ) : allNotifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-52 text-center p-4 gap-3">
            <div className="w-12 h-12 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6 text-emerald-500" />
            </div>
            <div>
              <span className="text-xs font-bold text-brand-secondary block">No Active Maintenance</span>
              <p className="text-[11px] text-brand-muted mt-1 leading-relaxed">
                No maintenance work is currently in progress on the monitored corridors.
              </p>
            </div>
          </div>
        ) : (
          allNotifications.map((notif, idx) => {
            const sev = severityConfig[notif.severity] ?? severityConfig.medium;
            return (
              <div
                key={notif.id}
                onClick={() => handleCardClick(notif)}
                style={{ animationDelay: `${Math.min(idx * 60, 300)}ms` }}
                className={`smooth-card animate-fade-in-up rounded-2xl border border-brand-border border-l-[3px] ${sev.border} bg-brand-surface shadow-xs hover:border-brand-primary/40 cursor-pointer overflow-hidden`}
              >
                <div className="p-3.5 space-y-2.5">

                  {/* Row 1: Severity badge · task code · timestamp */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`inline-flex items-center gap-1.5 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full tracking-wide leading-none ${sev.badge}`}>
                      <span className={`w-1.5 h-1.5 rounded-full bg-white/80 ${notif.severity === "critical" ? "animate-beacon-pulse" : ""}`} />
                      {notif.severity.toUpperCase()}
                    </span>

                    {notif.taskCode && (
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-brand-secondary text-white tracking-wider leading-none">
                        {notif.taskCode}
                      </span>
                    )}

                    <span className="text-[10px] text-brand-muted font-medium ml-auto">
                      {notif.timestamp}
                    </span>
                  </div>

                  {/* Row 2: Icon chip + Title + Description */}
                  <div className="flex items-start gap-2">
                    <div className="min-w-0">
                      <h4 className="text-xs font-bold text-brand-secondary leading-snug">
                        {notif.title}
                      </h4>
                      <p className="text-[10px] text-brand-muted mt-0.5 font-medium leading-snug">
                        {notif.description}
                      </p>
                    </div>
                  </div>

                  {/* Row 3: Block Slot + Duration + Progress + Status box */}
                  <div className="rounded-xl bg-brand-tertiary/60 border border-brand-border/80 overflow-hidden">
                    <div className="px-3 py-2.5 space-y-2">

                      {/* Slot + duration */}
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <span className="text-[8px] font-bold uppercase tracking-widest text-brand-muted/70 block mb-0.5">
                            Block Window
                          </span>
                          <div className="flex items-center gap-1.5">
                            <Clock className="w-3 h-3 text-brand-primary shrink-0" />
                            <span className={`text-[11px] font-bold leading-none ${
                              notif.currentSlot
                                ? "text-brand-secondary font-mono"
                                : "text-brand-muted italic"
                            }`}>
                              {notif.currentSlot || "Pending Allocation"}
                            </span>
                          </div>
                          {notif.currentSlotDate && (
                            <span className="text-[9px] text-brand-muted mt-0.5 block">
                              {notif.currentSlotDate}
                            </span>
                          )}
                        </div>

                        {notif.durationMinutes && (
                          <div className="text-right shrink-0">
                            <span className="text-[8px] font-bold uppercase tracking-widest text-brand-muted/70 block mb-0.5">
                              DURATION
                            </span>
                            <span className="text-[11px] font-mono font-bold text-brand-secondary bg-brand-surface px-2 py-0.5 rounded-lg border border-brand-border shadow-xs inline-block">
                              {notif.durationMinutes}m
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Status + View Order */}
                      <div className="flex items-center justify-between pt-1.5 border-t border-brand-border/50">
                        <span className="inline-flex items-center gap-1.5 text-[10px] font-bold">
                          <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-60" />
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                          </span>
                          <span className="text-emerald-600 font-bold">{notif.status || "ACTIVE"}</span>
                        </span>

                        <Link
                          href="/maintenance"
                          className="text-brand-secondary hover:text-brand-primary font-bold text-[10px] inline-flex items-center gap-1 transition-colors"
                          onClick={(e) => e.stopPropagation()}
                        >
                          View Order
                          <ExternalLink className="w-2.5 h-2.5" />
                        </Link>
                      </div>
                    </div>
                  </div>

                  {/* Row 4: Location + Locate CTA */}
                  <div className="flex items-center justify-between pt-0.5">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <MapPin className="w-3 h-3 text-brand-primary shrink-0" />
                      <span className="text-[11px] font-semibold text-brand-secondary truncate max-w-[140px]">
                        {notif.corridorOrStation}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCardClick(notif);
                      }}
                      className="smooth-btn text-[10px] font-bold text-brand-primary hover:bg-brand-primary/5 px-2 py-0.5 rounded-lg border border-brand-primary/25 hover:border-brand-primary/50 transition-all cursor-pointer shrink-0"
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

      {/* ── Footer: activity bar ──────────────────────────────── */}
      {!isLoading && allNotifications.length > 0 && (
        <div className="px-4 py-2.5 border-t border-brand-border bg-brand-surface/60 shrink-0 flex items-center gap-2">
          <Activity className="w-3 h-3 text-brand-primary animate-pulse" />
          <span className="text-[10px] text-brand-muted font-medium">
            Monitoring {allNotifications.length} active work order{allNotifications.length !== 1 ? "s" : ""}
          </span>
        </div>
      )}
    </aside>
  );
}
