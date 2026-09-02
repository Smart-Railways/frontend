"use client";

import React, { useState } from "react";
import {
  Bell,
  TriangleAlert,
  Wrench,
  Info,
  CheckCircle2,
  X,
  MapPin,
  CheckCheck,
} from "lucide-react";
import {
  INITIAL_NOTIFICATIONS,
  RailwayNotification,
} from "@/data/railway-notifications";

interface NotificationPanelProps {
  onSelectCorridor?: (stationId?: string) => void;
}

export function NotificationPanel({ onSelectCorridor }: NotificationPanelProps) {
  const [notifications, setNotifications] = useState<RailwayNotification[]>(
    INITIAL_NOTIFICATIONS
  );
  const [filter, setFilter] = useState<"all" | "critical" | "maintenance" | "operational">("all");

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const handleDismiss = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const handleMarkAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  const filteredNotifications = notifications.filter((n) => {
    if (filter === "all") return true;
    return n.category === filter;
  });

  const getCategoryBadge = (category: string) => {
    switch (category) {
      case "critical":
        return {
          icon: TriangleAlert,
          bg: "bg-red-500/10 text-red-400 border-red-500/30",
          dot: "bg-red-500",
        };
      case "maintenance":
        return {
          icon: Wrench,
          bg: "bg-amber-500/10 text-amber-400 border-amber-500/30",
          dot: "bg-amber-400",
        };
      case "operational":
        return {
          icon: CheckCircle2,
          bg: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
          dot: "bg-emerald-400",
        };
      case "advisory":
      default:
        return {
          icon: Info,
          bg: "bg-blue-500/10 text-blue-400 border-blue-500/30",
          dot: "bg-blue-400",
        };
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
            <h2 className="text-sm font-bold text-white tracking-wide">
              Railway Alerts
            </h2>
            <span className="text-[11px] text-slate-400 font-medium">
              Live Operations Feed
            </span>
          </div>
        </div>

      </div>

      {/* Filter Tabs */}
      <div className="p-3 border-b border-[#172642]/60 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
        {(
          [
            { id: "all", label: "All" },
            { id: "critical", label: "Critical" },
            { id: "maintenance", label: "Maintenance" },
            { id: "operational", label: "Clear" },
          ] as const
        ).map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFilter(tab.id)}
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

      {/* Notifications List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {filteredNotifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-center p-4">
            <CheckCircle2 className="w-8 h-8 text-emerald-400 mb-2 opacity-80" />
            <span className="text-xs font-bold text-white">No active alerts</span>
            <p className="text-[11px] text-slate-400 mt-1">
              All railway corridors are operating under clear signals.
            </p>
          </div>
        ) : (
          filteredNotifications.map((notif) => {
            const badge = getCategoryBadge(notif.category);

            return (
              <div
                key={notif.id}
                onClick={() => notif.stationId && onSelectCorridor?.(notif.stationId)}
                className={`p-3.5 rounded-xl border transition-all cursor-pointer group relative overflow-hidden ${
                  !notif.isRead
                    ? "bg-[#0d1527] border-[#1e3052] hover:border-emerald-500/40 shadow-md"
                    : "bg-[#09101d]/70 border-[#172642]/60 hover:border-slate-600/50 opacity-80 hover:opacity-100"
                }`}
              >
                {/* Unread accent left border */}
                {!notif.isRead && (
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-emerald-400"></div>
                )}

                {/* Top Row: Category badge & Time */}
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span
                      className={`inline-flex items-center gap-1.5 text-[10px] font-bold px-2 py-0.5 rounded-full border ${badge.bg}`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${badge.dot}`}></span>
                      <span className="uppercase tracking-wider">
                        {notif.category}
                      </span>
                    </span>
                    <span className="text-[10px] font-medium text-slate-400">
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
                <h4 className="text-xs font-bold text-white group-hover:text-emerald-300 transition-colors">
                  {notif.title}
                </h4>

                {/* Description */}
                <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                  {notif.description}
                </p>

                {/* Bottom Corridor Location Tag */}
                <div className="flex items-center justify-between mt-2.5 pt-2 border-t border-[#172642]/60 text-[11px]">
                  <div className="flex items-center gap-1.5 text-slate-300">
                    <MapPin className="w-3.5 h-3.5 text-blue-400" />
                    <span className="font-semibold text-slate-200">
                      {notif.corridorOrStation}
                    </span>
                  </div>
                  {notif.stationId && (
                    <span className="text-[10px] font-semibold text-blue-400 group-hover:text-emerald-400 transition-colors">
                      Locate →
                    </span>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Bottom Summary Bar */}
      <div className="p-3 border-t border-[#172642] bg-[#05080e]/60 text-center">
        <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
          Central Railway Control Center • Automatic Dispatch
        </span>
      </div>
    </aside>
  );
}
