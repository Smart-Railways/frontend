"use client";

import React, { useState, useMemo, useEffect } from "react";
import { VerticalNavbar } from "@/components/navigation/vertical-navbar";
import { LiveClock } from "@/components/ui/live-clock";
import {
  Train as TrainIcon,
  Search,
  RefreshCw,
  Plus,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Eye,
  CalendarCheck,
  ArrowLeftRight,
  Crown,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Timer,
  Radio,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useRailwaySections,
  useTrains,
  useTrainSchedules,
  useTrainMovements,
  useTrackedTrainOperations,
} from "@/hooks";
import {
  TrackedTrainOperation,
  TrainSchedule,
  CreateTrainScheduleInput,
  CreateTrainMovementInput,
} from "@/types";
import { DEFAULT_RAILWAY_SECTIONS } from "@/constants/railway-defaults";
import { formatTrainTimeIST, formatTimeString } from "@/lib/time-utils";

const DAYS_SHORT = ["M", "T", "W", "T", "F", "S", "S"];
const DAYS_FULL = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

// Helper to format date as YYYY-MM-DD
function formatDateToISO(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

// Helper to format date display (e.g. "Fri, 04 Sept, 2026")
function formatDisplayDate(dateStr: string): string {
  try {
    const [y, m, d] = dateStr.split("-").map(Number);
    const date = new Date(y, m - 1, d);
    return date.toLocaleDateString("en-IN", {
      weekday: "short",
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return dateStr;
  }
}

// Format minutes delay into hours and minutes
function formatDelayMetric(delayMinutes: number | null): {
  text: string;
  subText: string;
  isLate: boolean;
  isHighLate: boolean;
  isOnTime: boolean;
  badgeClass: string;
  dotClass: string;
} {
  if (delayMinutes === null || delayMinutes === undefined) {
    return {
      text: "Awaiting Log",
      subText: "Pending Entry",
      isLate: false,
      isHighLate: false,
      isOnTime: false,
      badgeClass: "bg-slate-100 text-slate-600 border-slate-200",
      dotClass: "bg-slate-400",
    };
  }

  if (delayMinutes <= 0) {
    const earlyMins = Math.abs(delayMinutes);
    return {
      text: earlyMins > 0 ? `On Time (${earlyMins}m Early)` : "On Time",
      subText: "Strict Adherence",
      isLate: false,
      isHighLate: false,
      isOnTime: true,
      badgeClass: "bg-emerald-50 text-emerald-700 border-emerald-300",
      dotClass: "bg-emerald-500",
    };
  }

  const hours = Math.floor(delayMinutes / 60);
  const mins = delayMinutes % 60;
  const isHighLate = delayMinutes >= 60;

  let formattedDelay = "";
  if (hours > 0) {
    formattedDelay = `+${hours}h ${mins > 0 ? `${mins}m ` : "0m "}Late`;
  } else {
    formattedDelay = `+${mins}m Late`;
  }

  return {
    text: formattedDelay,
    subText: `${delayMinutes} mins total delay`,
    isLate: true,
    isHighLate,
    isOnTime: false,
    badgeClass: isHighLate
      ? "bg-red-50 text-red-700 border-red-300 shadow-2xs"
      : "bg-amber-50 text-amber-700 border-amber-300 shadow-2xs",
    dotClass: isHighLate ? "bg-red-500 animate-pulse" : "bg-amber-500",
  };
}

// Calculate duration between two time strings
function calculateTimeDuration(
  entryTime?: string | null,
  exitTime?: string | null
): { durationMins: number; formatted: string } {
  if (!entryTime || !exitTime) return { durationMins: 0, formatted: "--" };

  const parseToMins = (t: string) => {
    const formatted = formatTrainTimeIST(t);
    if (!formatted || formatted === "--:--") return 0;
    const [hh, mm] = formatted.split(":").map(Number);
    return (hh || 0) * 60 + (mm || 0);
  };

  const startMins = parseToMins(entryTime);
  let endMins = parseToMins(exitTime);
  if (endMins < startMins) {
    endMins += 24 * 60; // Next day offset
  }

  const diff = endMins - startMins;
  const hours = Math.floor(diff / 60);
  const mins = diff % 60;
  const formatted = hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  return { durationMins: diff, formatted };
}

// Train Type Styling & Symbolic Presence
export function getTrainTypeTheme(trainType?: string, trainName?: string) {
  const t = (trainType || "").toUpperCase();
  const n = (trainName || "").toUpperCase();

  if (t.includes("RAJDHANI") || n.includes("RAJDHANI")) {
    return {
      typeKey: "RAJDHANI",
      displayName: "Rajdhani Express",
      badge: "bg-red-50 text-red-700 border-red-200 font-bold",
      accentBg: "bg-red-500",
      textColor: "text-red-700",
      lineColor: "bg-red-600",
      borderColor: "border-r-4 border-r-red-600",
      lightBg: "bg-red-50/50",
      iconColor: "text-red-600",
    };
  }

  if (t.includes("SHATABDI") || n.includes("SHATABDI")) {
    return {
      typeKey: "SHATABDI",
      displayName: "Shatabdi Express",
      badge: "bg-blue-50 text-blue-700 border-blue-200 font-bold",
      accentBg: "bg-blue-600",
      textColor: "text-blue-700",
      lineColor: "bg-blue-600",
      borderColor: "border-r-4 border-r-blue-600",
      lightBg: "bg-blue-50/50",
      iconColor: "text-blue-600",
    };
  }

  if (t.includes("TEJAS") || n.includes("TEJAS")) {
    return {
      typeKey: "TEJAS",
      displayName: "Tejas Express",
      badge: "bg-sky-50 text-sky-700 border-sky-200 font-bold",
      accentBg: "bg-sky-600",
      textColor: "text-sky-700",
      lineColor: "bg-sky-600",
      borderColor: "border-r-4 border-r-sky-600",
      lightBg: "bg-sky-50/50",
      iconColor: "text-sky-600",
    };
  }

  if (
    t.includes("VB") ||
    t.includes("VANDE BHARAT") ||
    n.includes("VANDE BHARAT") ||
    n.includes("VB")
  ) {
    return {
      typeKey: "VB",
      displayName: "Vande Bharat",
      badge: "bg-slate-100 text-slate-800 border-slate-300 font-bold",
      accentBg: "bg-slate-700",
      textColor: "text-slate-800",
      lineColor: "bg-slate-700",
      borderColor: "border-r-4 border-r-slate-700",
      lightBg: "bg-slate-100/60",
      iconColor: "text-slate-700",
    };
  }

  if (t.includes("EXPRESS") || t.includes("SUPERFAST") || t.includes("SF")) {
    return {
      typeKey: "EXPRESS",
      displayName: "Superfast / Express",
      badge: "bg-emerald-50 text-emerald-700 border-emerald-200 font-bold",
      accentBg: "bg-emerald-600",
      textColor: "text-emerald-700",
      lineColor: "bg-emerald-600",
      borderColor: "border-r-4 border-r-emerald-600",
      lightBg: "bg-emerald-50/50",
      iconColor: "text-emerald-600",
    };
  }

  if (t.includes("FREIGHT") || t.includes("GOODS")) {
    return {
      typeKey: "FREIGHT",
      displayName: "Freight Cargo",
      badge: "bg-amber-50 text-amber-700 border-amber-200 font-bold",
      accentBg: "bg-amber-600",
      textColor: "text-amber-700",
      lineColor: "bg-amber-500",
      borderColor: "border-r-4 border-r-amber-500",
      lightBg: "bg-amber-50/50",
      iconColor: "text-amber-600",
    };
  }

  return {
    typeKey: "PASSENGER",
    displayName: "Passenger / General",
    badge: "bg-slate-100 text-slate-700 border-slate-200 font-bold",
    accentBg: "bg-slate-500",
    textColor: "text-slate-700",
    lineColor: "bg-slate-400",
    borderColor: "border-r-4 border-r-slate-400",
    lightBg: "bg-slate-50",
    iconColor: "text-slate-500",
  };
}

// Item structure for Master Schedules Table
interface MasterScheduleItem {
  id: string | number;
  scheduleId?: number;
  trainId?: number;
  trainNumber: string;
  trainName: string;
  trainType: string;
  priority: number;
  scheduledEntryTime: string;
  scheduledExitTime: string;
  durationMins: number;
  durationFormatted: string;
  runningDays: string;
  runsToday: boolean;
  isActive: boolean;
  sectionId: number;
  sectionName: string;
  statusText: string;
  statusBadge: string;
  statusDot: string;
}

export default function TrainsPage() {
  const [activeNavTab, setActiveNavTab] = useState<string>("trains");
  const [activeViewMode, setActiveViewMode] = useState<"all" | "tracked" | "schedules">("all");

  const [trackedDate, setTrackedDate] = useState<string>(formatDateToISO(new Date()));
  const [sourceCode, setSourceCode] = useState<string>("NDLS");
  const [destinationCode, setDestinationCode] = useState<string>("MTJ");
  const [trackedSearchQuery, setTrackedSearchQuery] = useState<string>("");
  const [inspectTrackedTrain, setInspectTrackedTrain] = useState<TrackedTrainOperation | null>(null);

  const [trackedCurrentPage, setTrackedCurrentPage] = useState<number>(1);
  const [trackedPageSize, setTrackedPageSize] = useState<number>(10);

  const {
    data: trackedOperationsData,
    isLoading: loadingTracked,
    isRefetching: refetchingTracked,
    refetch: refetchTracked,
  } = useTrackedTrainOperations({
    date: trackedDate,
    source: sourceCode,
    destination: destinationCode,
  });

  const [selectedScheduleDate, setSelectedScheduleDate] = useState<string>(formatDateToISO(new Date()));
  const [selectedSectionId, setSelectedSectionId] = useState<number | null>(1);
  const [scheduleSearchQuery, setScheduleSearchQuery] = useState<string>("");
  const [scheduleTypeFilter, setScheduleTypeFilter] = useState<string>("ALL");
  const [runsTodayOnly, setRunsTodayOnly] = useState<boolean>(false);

  const [schedulesCurrentPage, setSchedulesCurrentPage] = useState<number>(1);
  const [schedulesPageSize, setSchedulesPageSize] = useState<number>(10);

  const [inspectScheduleItem, setInspectScheduleItem] = useState<MasterScheduleItem | null>(null);
  const [isCreateScheduleModalOpen, setIsCreateScheduleModalOpen] = useState<boolean>(false);
  const [isLogMovementModalOpen, setIsLogMovementModalOpen] = useState<boolean>(false);

  const { data: sections = [], isLoading: loadingSections, refetch: refetchSections } = useRailwaySections();
  const { data: trains = [], isLoading: loadingTrains, refetch: refetchTrains } = useTrains();
  const { data: schedules = [], isLoading: loadingSchedules, refetch: refetchSchedules } = useTrainSchedules();
  const { data: movements = [], isLoading: loadingMovements, refetch: refetchMovements } = useTrainMovements();

  const availableSections = useMemo(() => {
    return sections && sections.length > 0 ? sections : DEFAULT_RAILWAY_SECTIONS;
  }, [sections]);

  const currentSection = useMemo(() => {
    return (
      availableSections.find((s) => s.id === selectedSectionId) ||
      availableSections[0] ||
      DEFAULT_RAILWAY_SECTIONS[0]
    );
  }, [availableSections, selectedSectionId]);

  const corridorStations = useMemo<{ code: string; name: string }[]>(() => {
    const stationMap = new Map<string, string>();

    availableSections.forEach((sec) => {
      const srcCode = sec.source_station_code || sec.origin_station;
      const srcName = sec.origin_station || sec.source_station_code || srcCode;
      if (srcCode) {
        stationMap.set(srcCode, srcName);
      }
      const dstCode = sec.destination_station_code || sec.end_station;
      const dstName = sec.end_station || sec.destination_station_code || dstCode;
      if (dstCode) {
        stationMap.set(dstCode, dstName);
      }
    });

    return Array.from(stationMap.entries())
      .map(([code, name]) => ({ code, name }))
      .sort((a, b) => a.code.localeCompare(b.code));
  }, [availableSections]);

  useEffect(() => {
    if (availableSections && availableSections.length > 0) {
      const active =
        availableSections.find((s) => s.id === selectedSectionId) ||
        availableSections[0];
      if (active) {
        const defaultSrc = active.source_station_code || active.origin_station || "NDLS";
        const defaultDst = active.destination_station_code || active.end_station || "MTJ";
        setSourceCode(defaultSrc);
        setDestinationCode(defaultDst);
      }
    }
  }, [availableSections, selectedSectionId]);

  const handleSelectSection = (secId: number) => {
    setSelectedSectionId(secId);
    const sec = availableSections.find((s) => s.id === secId);
    if (sec) {
      const src = sec.source_station_code || sec.origin_station;
      const dst = sec.destination_station_code || sec.end_station;
      if (src) setSourceCode(src);
      if (dst) setDestinationCode(dst);
    }
  };

  const handleRefetchAll = () => {
    refetchTracked();
    refetchSchedules();
    refetchSections();
    refetchTrains();
    refetchMovements();
  };

  const selectedScheduleDayIndex = useMemo(() => {
    try {
      const [y, m, d] = selectedScheduleDate.split("-").map(Number);
      const date = new Date(y, m - 1, d);
      return (date.getDay() + 6) % 7;
    } catch { return 0; }
  }, [selectedScheduleDate]);

  const handleSwapStations = () => {
    const temp = sourceCode;
    setSourceCode(destinationCode);
    setDestinationCode(temp);
  };

  const filteredTrackedTrains = useMemo<TrackedTrainOperation[]>(() => {
    const rawList = trackedOperationsData?.trains || [];
    if (!trackedSearchQuery.trim()) return rawList;
    const q = trackedSearchQuery.toLowerCase();
    return rawList.filter((t) => t.train_number.toLowerCase().includes(q) || t.train_name.toLowerCase().includes(q) || t.train_type.toLowerCase().includes(q));
  }, [trackedOperationsData, trackedSearchQuery]);

  useEffect(() => {
    setTrackedCurrentPage(1);
  }, [trackedSearchQuery, trackedDate, sourceCode, destinationCode]);

  const paginatedTrackedTrains = useMemo(() => {
    const startIndex = (trackedCurrentPage - 1) * trackedPageSize;
    return filteredTrackedTrains.slice(startIndex, startIndex + trackedPageSize);
  }, [filteredTrackedTrains, trackedCurrentPage, trackedPageSize]);

  const totalTrackedPages = Math.max(1, Math.ceil(filteredTrackedTrains.length / trackedPageSize));

  const trackedStats = useMemo(() => {
    const list = trackedOperationsData?.trains || [];
    const total = list.length;
    const onTimeCount = list.filter((t) => (t.delay_minutes ?? 0) <= 0).length;
    const delayedCount = list.filter((t) => (t.delay_minutes ?? 0) > 0).length;
    const delays = list.map((t) => t.delay_minutes).filter((d): d is number => d !== null);
    const avgDelay = delays.length > 0 ? Math.round(delays.reduce((a, b) => a + b, 0) / delays.length) : 0;
    const maxDelay = delays.length > 0 ? Math.max(...delays) : 0;
    return { total, onTimeCount, delayedCount, avgDelay, maxDelay };
  }, [trackedOperationsData]);

  const masterTimetableItems = useMemo<MasterScheduleItem[]>(() => {
    if (!schedules) return [];
    return schedules.map((sch) => {
      const trainObj = trains.find((t) => t.id === sch.train);
      const runningDays = sch.running_days || "1111111";
      const runsToday = runningDays[selectedScheduleDayIndex] === "1";
      const durationInfo = calculateTimeDuration(sch.scheduled_entry_time, sch.scheduled_exit_time);
      const isActive = sch.is_active ?? true;
      let statusText = "Runs Today";
      let statusBadge = "bg-emerald-50 border-emerald-300 text-emerald-700";
      let statusDot = "bg-emerald-500";
      if (!isActive) { statusText = "Suspended"; statusBadge = "bg-red-50 border-red-300 text-red-700"; statusDot = "bg-red-500"; }
      else if (!runsToday) { statusText = "Off-Schedule"; statusBadge = "bg-slate-100 border-slate-300 text-slate-600"; statusDot = "bg-slate-400"; }
      return {
        id: `sch-${sch.id}`,
        scheduleId: sch.id,
        trainId: trainObj?.id,
        trainNumber: trainObj?.train_number || sch.train_number || "---",
        trainName: trainObj?.name || sch.train_name || "Express",
        trainType: trainObj?.train_type || "EXPRESS",
        priority: trainObj?.priority || 5,
        scheduledEntryTime: sch.scheduled_entry_time,
        scheduledExitTime: sch.scheduled_exit_time,
        durationMins: durationInfo.durationMins,
        durationFormatted: durationInfo.formatted,
        runningDays,
        runsToday,
        isActive,
        sectionId: sch.section,
        sectionName: sch.section_name || "Corridor",
        statusText,
        statusBadge,
        statusDot,
      };
    }).sort((a, b) => a.scheduledEntryTime.localeCompare(b.scheduledEntryTime));
  }, [schedules, trains, selectedScheduleDayIndex]);

  const filteredSchedules = useMemo(() => {
    return masterTimetableItems.filter((item) => {
      if (runsTodayOnly && !item.runsToday) return false;
      if (scheduleTypeFilter !== "ALL" && item.trainType !== scheduleTypeFilter) return false;
      if (scheduleSearchQuery.trim()) {
        const q = scheduleSearchQuery.toLowerCase();
        if (!item.trainNumber.toLowerCase().includes(q) && !item.trainName.toLowerCase().includes(q) && !item.sectionName.toLowerCase().includes(q)) return false;
      }
      return true;
    });
  }, [masterTimetableItems, runsTodayOnly, scheduleTypeFilter, scheduleSearchQuery]);

  useEffect(() => {
    setSchedulesCurrentPage(1);
  }, [scheduleSearchQuery, scheduleTypeFilter, runsTodayOnly, selectedSectionId, selectedScheduleDate]);

  const paginatedSchedules = useMemo(() => {
    const startIndex = (schedulesCurrentPage - 1) * schedulesPageSize;
    return filteredSchedules.slice(startIndex, startIndex + schedulesPageSize);
  }, [filteredSchedules, schedulesCurrentPage, schedulesPageSize]);

  const totalSchedulePages = Math.max(1, Math.ceil(filteredSchedules.length / schedulesPageSize));

  const scheduleStats = useMemo(() => {
    const total = masterTimetableItems.length;
    const runningToday = masterTimetableItems.filter((t) => t.runsToday).length;
    const highPriority = masterTimetableItems.filter((t) => t.priority >= 8).length;
    return { total, runningToday, highPriority };
  }, [masterTimetableItems]);

  const [newScheduleData, setNewScheduleData] = useState<CreateTrainScheduleInput>({
    train: trains.length > 0 ? trains[0].id : 1,
    section: currentSection ? currentSection.id : 1,
    scheduled_entry_time: "06:00:00",
    scheduled_exit_time: "07:30:00",
    running_days: "1111111",
    is_active: true,
  });


  const [movementForm, setMovementForm] = useState<{
    scheduleId: number | string;
    serviceDate: string;
    actualEntry: string;
    actualExit: string;
  }>({
    scheduleId: "",
    serviceDate: trackedDate,
    actualEntry: "06:00",
    actualExit: "07:45",
  });

  const handleOpenMovementModal = (item?: MasterScheduleItem | TrackedTrainOperation) => {
    if (item && "scheduleId" in item && item.scheduleId) {
      setMovementForm({
        scheduleId: item.scheduleId,
        serviceDate: trackedDate,
        actualEntry: formatTrainTimeIST(item.scheduledEntryTime),
        actualExit: formatTrainTimeIST(item.scheduledExitTime),
      });
    } else {
      setMovementForm({
        scheduleId: schedules.length > 0 ? schedules[0].id : "",
        serviceDate: trackedDate,
        actualEntry: "06:00",
        actualExit: "07:45",
      });
    }
    setIsLogMovementModalOpen(true);
  };


  return (
    <div className="min-h-screen bg-brand-tertiary text-brand-secondary flex flex-col font-sans">
      <VerticalNavbar activeTab={activeNavTab} onTabChange={setActiveNavTab} unreadCount={1} />

      <div className="flex-1 flex pl-20 lg:pl-64">
        <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-7 flex flex-col space-y-6 max-w-[1680px] mx-auto w-full">
          <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-brand-border/80">
            <div>
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-brand-primary text-white flex items-center justify-center shadow-xs">
                  <TrainIcon className="w-4 h-4" />
                </div>
                <h1 className="text-xl sm:text-2xl font-extrabold text-brand-secondary tracking-tight">Train Operations & Schedules</h1>
              </div>
            </div>
            <div className="flex items-center gap-2.5">
              <button
                onClick={handleRefetchAll}
                className="p-2 rounded-xl bg-brand-surface border border-brand-border hover:bg-brand-tertiary shadow-2xs transition-colors cursor-pointer"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
              <LiveClock />
            </div>
          </header>

          {(activeViewMode === "all" || activeViewMode === "tracked") && (
            <section className="rounded-2xl bg-brand-surface border border-brand-border shadow-sm overflow-hidden space-y-4 p-4 sm:p-5">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-3 border-b border-brand-border/80">
                <div className="space-y-1">
                  <h2 className="text-base sm:text-lg font-black text-brand-secondary tracking-tight flex items-center gap-2">
                    <span>Tracked Trains Operations</span>
                  </h2>
                </div>
                <div className="flex items-center gap-2 flex-wrap text-xs">
                  <span className="px-2.5 py-1 rounded-lg bg-brand-blue-light/70 text-brand-primary border border-brand-primary/20 font-mono font-bold">
                    GET railways/trains/operations/?date={trackedDate}&source={sourceCode}&destination={destinationCode}
                  </span>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-brand-tertiary/70 border border-brand-border/70 space-y-3.5">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
                  {/* Operation Date */}
                  <div className="md:col-span-4 space-y-1">
                    <label className="text-[12px] font-extrabold text-brand-muted tracking-wider block">
                      Operation Date
                    </label>
                    <input
                      type="date"
                      value={trackedDate}
                      onChange={(e) => setTrackedDate(e.target.value)}
                      className="w-full bg-brand-surface border border-brand-border text-brand-secondary text-xs rounded-xl px-3 py-2 outline-none font-bold cursor-pointer"
                    />
                  </div>

                  {/* Single Section Name Dropdown (Replaces the 2 separate station dropdowns & swap button) */}
                  <div className="md:col-span-6 space-y-1">
                    <label className="text-[12px] font-extrabold text-brand-muted tracking-wider flex items-center justify-between">
                      <span>Railway Corridor Section</span>
                      <span className="text-[10px] text-brand-muted font-medium">
                        ({availableSections.length} sections available)
                      </span>
                    </label>
                    <div className="relative">
                      <select
                        value={currentSection.id}
                        onChange={(e) => handleSelectSection(Number(e.target.value))}
                        className="w-full bg-brand-surface border border-brand-border text-xs text-brand-secondary font-bold rounded-xl px-3.5 py-2 outline-none cursor-pointer appearance-none pr-8 shadow-2xs"
                      >
                        {availableSections.map((sec) => (
                          <option key={sec.id} value={sec.id}>
                            {sec.section_name} ({sec.source_station_code || sec.origin_station} → {sec.destination_station_code || sec.end_station})
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="w-3.5 h-3.5 text-brand-muted absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                  </div>

                  {/* Fetch Button */}
                  <div className="md:col-span-2 flex justify-end">
                    <button
                      onClick={() => refetchTracked()}
                      disabled={refetchingTracked}
                      className="w-full px-4 py-2 rounded-xl bg-brand-primary hover:bg-blue-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer shadow-sm transition-all disabled:opacity-50"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${refetchingTracked ? "animate-spin" : ""}`} />
                      <span>{refetchingTracked ? "Fetching..." : "Fetch"}</span>
                    </button>
                  </div>
                </div>

                {/* Live Corridor Status Bar */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-brand-border/60 text-xs">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[11px] font-extrabold text-brand-muted uppercase tracking-wider">
                      Active Corridor:
                    </span>
                    <span className="font-black text-brand-secondary text-xs">
                      {currentSection.section_name}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-lg bg-brand-surface border border-brand-border font-mono text-[11px] font-bold text-brand-primary">
                      {currentSection.source_station_code || currentSection.origin_station} → {currentSection.destination_station_code || currentSection.end_station}
                    </span>
                    <span className="text-[11px] text-brand-muted font-bold">
                      • {currentSection.distance} km
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-brand-muted font-bold">Corridor Status:</span>
                    {currentSection.status !== false ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-300 text-[10px] font-black">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                        <span>OPERATIONAL / LIVE</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-300 text-[10px] font-black">
                        <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                        <span>MAINTENANCE BLOCK</span>
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="overflow-x-auto border border-brand-border/80 rounded-xl">
                <table className="w-full text-left text-xs">
                  <thead className="bg-brand-surface text-brand-muted font-bold tracking-wider border-b border-brand-border text-[12px]">
                    <tr>
                      <th className="py-3 px-4">Train No. & Name</th>
                      <th className="py-3 px-4">Type & Priority</th>
                      <th className="py-3 px-4">Section</th>
                      <th className="py-3 px-4">Window</th>
                      <th className="py-3 px-4">Actuals</th>
                      <th className="py-3 px-4">Delay Matrix (IST)</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-brand-border/60 text-brand-secondary">
                    {loadingTracked ? (
                      Array.from({ length: 5 }).map((_, idx) => (
                        <tr key={idx} className="hover:bg-brand-tertiary/40 transition-colors">
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2.5">
                              <Skeleton className="w-1.5 h-8 rounded-full shrink-0" />
                              <div className="space-y-1.5">
                                <Skeleton className="h-4 w-16" />
                                <Skeleton className="h-3 w-28" />
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              <Skeleton className="h-5 w-16 rounded-md" />
                              <Skeleton className="h-4 w-8" />
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <Skeleton className="h-4 w-28" />
                          </td>
                          <td className="py-3 px-4 font-mono">
                            <Skeleton className="h-4 w-24" />
                          </td>
                          <td className="py-3 px-4 font-mono">
                            <Skeleton className="h-4 w-24" />
                          </td>
                          <td className="py-3 px-4">
                            <Skeleton className="h-6 w-24 rounded-full" />
                          </td>
                          <td className="py-3 px-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Skeleton className="w-2.5 h-6 rounded-xs" />
                              <Skeleton className="w-7 h-7 rounded-lg" />
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : filteredTrackedTrains.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-12 text-center text-brand-muted">
                          <div className="flex flex-col items-center justify-center gap-2">
                            <TrainIcon className="w-8 h-8 text-brand-muted opacity-50" />
                            <div className="text-sm font-bold text-brand-secondary">No tracked train operations found</div>
                            <p className="text-xs text-brand-muted">Try selecting a different corridor section or date.</p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      paginatedTrackedTrains.map((item, idx) => {
                        const theme = getTrainTypeTheme(item.train_type, item.train_name);
                        const delayObj = formatDelayMetric(item.delay_minutes);
                        return (
                          <tr key={`${item.train_number}-${idx}`} className={`hover:bg-brand-tertiary/60 ${theme.borderColor}`}>
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-2.5">
                                <div className={`w-1.5 h-8 rounded-full ${theme.lineColor}`} />
                                <div>
                                  <div className="font-extrabold text-sm">{item.train_number}</div>
                                  <div className="text-brand-muted font-bold text-xs">{item.train_name}</div>
                                </div>
                              </div>
                            </td>
                            <td className="py-3 px-4">
                              <span className={`px-2 py-0.5 rounded-md text-[10px] font-extrabold border ${theme.badge}`}>
                                {item.train_type}
                              </span>
                              <span className="ml-2 font-bold">{item.priority}/10</span>
                            </td>
                            <td className="py-3 px-4">{item.section.name}</td>
                            <td className="py-3 px-4 font-mono">{formatTimeString(item.schedule.entry_time)} → {formatTimeString(item.schedule.exit_time)}</td>
                            <td className="py-3 px-4 font-mono">{formatTimeString(item.movement?.actual_entry_time)} → {formatTimeString(item.movement?.actual_exit_time)}</td>
                            <td className="py-3 px-4">
                              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-extrabold border ${delayObj.badgeClass}`}>
                                {delayObj.text}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-right">
                              <div className="flex items-center justify-end gap-2">
                                <span className={`w-2.5 h-6 rounded-xs ${theme.lineColor}`} />
                                <button onClick={() => setInspectTrackedTrain(item)} className="p-1.5 rounded-lg bg-brand-surface border border-brand-border hover:bg-brand-tertiary">
                                  <Eye className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>

              {/* Table 1 Frontend Pagination Controls */}
              {filteredTrackedTrains.length > 0 && (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 text-xs">
                  <div className="flex items-center gap-2 text-brand-muted font-medium">
                    <span>
                      Showing{" "}
                      <strong className="text-brand-secondary">
                        {(trackedCurrentPage - 1) * trackedPageSize + 1}
                      </strong>{" "}
                      to{" "}
                      <strong className="text-brand-secondary">
                        {Math.min(trackedCurrentPage * trackedPageSize, filteredTrackedTrains.length)}
                      </strong>{" "}
                      of{" "}
                      <strong className="text-brand-secondary">
                        {filteredTrackedTrains.length}
                      </strong>{" "}
                      tracked trains
                    </span>

                    <div className="flex items-center gap-1.5 pl-3 border-l border-brand-border">
                      <span className="text-[11px]">Rows:</span>
                      <select
                        value={trackedPageSize}
                        onChange={(e) => {
                          setTrackedPageSize(Number(e.target.value));
                          setTrackedCurrentPage(1);
                        }}
                        className="bg-brand-surface border border-brand-border rounded-lg px-2 py-1 text-xs font-bold text-brand-secondary outline-none cursor-pointer"
                      >
                        <option value={5}>5</option>
                        <option value={10}>10</option>
                        <option value={20}>20</option>
                        <option value={50}>50</option>
                      </select>
                    </div>
                  </div>

                  {/* Page Navigation */}
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setTrackedCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={trackedCurrentPage === 1}
                      className="p-1.5 rounded-lg bg-brand-surface border border-brand-border hover:bg-brand-tertiary disabled:opacity-40 disabled:pointer-events-none text-brand-secondary transition-colors cursor-pointer shadow-2xs"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>

                    {Array.from({ length: totalTrackedPages }).map((_, idx) => {
                      const pageNumber = idx + 1;
                      if (
                        pageNumber === 1 ||
                        pageNumber === totalTrackedPages ||
                        (pageNumber >= trackedCurrentPage - 1 && pageNumber <= trackedCurrentPage + 1)
                      ) {
                        return (
                          <button
                            key={pageNumber}
                            onClick={() => setTrackedCurrentPage(pageNumber)}
                            className={`w-7 h-7 rounded-lg font-bold text-xs transition-colors cursor-pointer ${trackedCurrentPage === pageNumber
                                ? "bg-brand-primary text-white shadow-xs"
                                : "bg-brand-surface border border-brand-border text-brand-secondary hover:bg-brand-tertiary"
                              }`}
                          >
                            {pageNumber}
                          </button>
                        );
                      }
                      if (
                        pageNumber === trackedCurrentPage - 2 ||
                        pageNumber === trackedCurrentPage + 2
                      ) {
                        return (
                          <span key={pageNumber} className="px-1 text-brand-muted">
                            ...
                          </span>
                        );
                      }
                      return null;
                    })}

                    <button
                      onClick={() => setTrackedCurrentPage((p) => Math.min(totalTrackedPages, p + 1))}
                      disabled={trackedCurrentPage === totalTrackedPages}
                      className="p-1.5 rounded-lg bg-brand-surface border border-brand-border hover:bg-brand-tertiary disabled:opacity-40 disabled:pointer-events-none text-brand-secondary transition-colors cursor-pointer shadow-2xs"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </section>
          )}

          {/* ========================================================================= */}
          {/* TABLE 2: TODAY'S MASTER TRAIN SCHEDULES */}
          {/* Endpoint: GET /api/train-schedules/ (railways/train-schedules/) */}
          {/* ========================================================================= */}
          {(activeViewMode === "all" || activeViewMode === "schedules") && (
            <section
              id="master-schedules-table"
              className="rounded-2xl bg-brand-surface border border-brand-border shadow-sm overflow-hidden space-y-4 p-4 sm:p-5"
            >
              {/* Section Header */}
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-3 border-b border-brand-border/80">
                <div className="space-y-1">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <span className="flex items-center justify-center w-6 h-6 rounded-lg bg-brand-blue-light text-brand-primary font-extrabold text-xs border border-brand-primary/20">
                      2
                    </span>
                    <h2 className="text-base sm:text-lg font-black text-brand-secondary tracking-tight flex items-center gap-2">
                      <span>Today&apos;s Master Train Schedules (TT)</span>
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-brand-blue-light text-brand-primary border border-brand-primary/20">
                        <CalendarCheck className="w-3 h-3" />
                        Master Timetable
                      </span>
                    </h2>
                  </div>
                  <p className="text-xs text-brand-muted font-medium">
                    Scheduled timetable specifications and operating pattern for{" "}
                    <span className="font-bold text-brand-secondary">{DAYS_FULL[selectedScheduleDayIndex]} ({formatDisplayDate(selectedScheduleDate)})</span>.
                  </p>
                </div>

                {/* Endpoint badge & Create Schedule button */}
                <div className="flex items-center gap-2.5 flex-wrap text-xs">
                  <span className="px-2.5 py-1 rounded-lg bg-brand-blue-light/70 text-brand-primary border border-brand-primary/20 font-mono text-[11px] font-bold">
                    GET /api/train-schedules/
                  </span>
                  <button
                    onClick={() => setIsCreateScheduleModalOpen(true)}
                    className="px-3.5 py-1.5 rounded-xl bg-brand-primary hover:bg-blue-700 text-white font-bold transition-all flex items-center gap-1.5 shadow-2xs cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Schedule</span>
                  </button>
                </div>
              </div>

              {/* Master Schedule Controls Card */}
              <div className="p-4 rounded-xl bg-brand-tertiary/70 border border-brand-border/70 space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
                  {/* Section Corridor Dropdown */}
                  <div className="md:col-span-6 space-y-1">
                    <label className="text-[10px] font-extrabold text-brand-muted uppercase tracking-wider">
                      Filter Railway Corridor / Section
                    </label>
                    <select
                      value={selectedSectionId ?? ""}
                      onChange={(e) => setSelectedSectionId(e.target.value ? Number(e.target.value) : null)}
                      className="w-full bg-brand-surface border border-brand-border hover:border-brand-primary/50 focus:border-brand-primary text-brand-secondary text-xs rounded-xl px-3 py-2 outline-none font-bold cursor-pointer shadow-2xs"
                    >
                      <option value="">All Corridors & Sections</option>
                      {availableSections.map((sec) => (
                        <option key={sec.id} value={sec.id}>
                          {sec.section_name} ({sec.distance || 141} km) • {sec.origin_station} → {sec.end_station}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Day Date Navigator */}
                  <div className="md:col-span-6 space-y-1">
                    <label className="text-[10px] font-extrabold text-brand-muted uppercase tracking-wider flex items-center justify-between">
                      <span>Schedule Date & Active Day</span>
                      <span className="text-brand-secondary font-bold">Day: {DAYS_FULL[selectedScheduleDayIndex]}</span>
                    </label>
                    <div className="flex items-center gap-1.5">
                      <input
                        type="date"
                        value={selectedScheduleDate}
                        onChange={(e) => setSelectedScheduleDate(e.target.value)}
                        className="flex-1 bg-brand-surface border border-brand-border focus:border-brand-primary text-brand-secondary text-xs rounded-xl px-3 py-2 outline-none font-bold cursor-pointer shadow-2xs"
                      />
                      <button
                        onClick={() => setSelectedScheduleDate(formatDateToISO(new Date()))}
                        className="px-2.5 py-2 rounded-xl bg-brand-surface border border-brand-border hover:bg-brand-surface/80 text-[11px] font-bold text-brand-primary transition-colors cursor-pointer shadow-2xs"
                      >
                        Today
                      </button>
                    </div>
                  </div>
                </div>

                {/* Filter Sub-row */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 border-t border-brand-border/60">
                  <div className="relative w-full sm:w-72">
                    <input
                      type="text"
                      placeholder="Search train no., name, section..."
                      value={scheduleSearchQuery}
                      onChange={(e) => setScheduleSearchQuery(e.target.value)}
                      className="w-full bg-brand-surface border border-brand-border focus:border-brand-primary text-xs text-brand-secondary placeholder:text-brand-muted rounded-xl pl-3 pr-8 py-1.5 outline-none font-medium shadow-2xs"
                    />
                    <Search className="w-3 h-3 text-brand-muted absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>

                  <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
                    {["ALL", "RAJDHANI", "VB", "SHATABDI", "TEJAS", "EXPRESS", "FREIGHT", "PASSENGER"].map((type) => (
                      <button
                        key={type}
                        onClick={() => setScheduleTypeFilter(type)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${scheduleTypeFilter === type
                            ? "bg-brand-primary text-white shadow-xs"
                            : "text-brand-muted hover:text-brand-secondary hover:bg-brand-surface"
                          }`}
                      >
                        {type === "VB" ? "Vande Bharat" :
                         type.charAt(0) + type.slice(1).toLowerCase()}
                      </button>
                    ))}

                    <button
                      onClick={() => setRunsTodayOnly(!runsTodayOnly)}
                      className={`flex items-center gap-1 px-3 py-1 rounded-xl text-xs font-bold border transition-all whitespace-nowrap cursor-pointer shadow-2xs ${runsTodayOnly
                          ? "bg-brand-blue-light text-brand-primary border-brand-primary/30"
                          : "bg-brand-surface text-brand-secondary border-brand-border hover:bg-brand-surface/80"
                        }`}
                    >
                      <span>Runs Today</span>
                      <ChevronDown className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>

              {/* KPI Stat Cards for Master Schedules */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div className="p-3.5 rounded-xl bg-brand-surface border border-brand-border shadow-2xs flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-brand-blue-light text-brand-primary flex items-center justify-center flex-shrink-0">
                    <TrainIcon className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-[10px] font-bold uppercase text-brand-muted">Total Schedules</div>
                    {loadingSchedules ? (
                      <Skeleton className="h-7 w-12 my-0.5 rounded" />
                    ) : (
                      <div className="text-xl font-black text-brand-secondary">{scheduleStats.total}</div>
                    )}
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-brand-surface border border-brand-border shadow-2xs flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0">
                    <CalendarCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-[10px] font-bold uppercase text-brand-muted">Runs Today</div>
                    {loadingSchedules ? (
                      <Skeleton className="h-7 w-12 my-0.5 rounded" />
                    ) : (
                      <div className="text-xl font-black text-emerald-700">{scheduleStats.runningToday}</div>
                    )}
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-brand-surface border border-brand-border shadow-2xs flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center flex-shrink-0">
                    <Crown className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-[10px] font-bold uppercase text-brand-muted">High Priority</div>
                    {loadingSchedules ? (
                      <Skeleton className="h-7 w-12 my-0.5 rounded" />
                    ) : (
                      <div className="text-xl font-black text-amber-700">{scheduleStats.highPriority}</div>
                    )}
                  </div>
                </div>
              </div>

              {/* Table 2 Data View */}
              <div className="overflow-x-auto border border-brand-border/80 rounded-xl">
                <table className="w-full text-left text-xs">
                  <thead className="bg-brand-surface text-brand-muted font-bold tracking-wider border-b border-brand-border text-[12px]">
                    <tr>
                      <th className="py-3 px-4">Train No. & Name</th>
                      <th className="py-3 px-4">Priority & Type</th>
                      <th className="py-3 px-4">Section / Corridor</th>
                      <th className="py-3 px-4">Scheduled Entry (IST)</th>
                      <th className="py-3 px-4">Scheduled Exit (IST)</th>
                      <th className="py-3 px-4">Transit Duration</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-brand-border/60 text-brand-secondary">
                    {loadingSchedules ? (
                      Array.from({ length: 5 }).map((_, idx) => (
                        <tr key={idx} className="hover:bg-brand-tertiary/40 transition-colors">
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2.5">
                              <Skeleton className="w-1.5 h-8 rounded-full shrink-0" />
                              <div className="space-y-1.5">
                                <Skeleton className="h-4 w-16" />
                                <Skeleton className="h-3 w-28" />
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              <Skeleton className="h-5 w-16 rounded-md" />
                              <Skeleton className="h-4 w-8" />
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <Skeleton className="h-4 w-28" />
                          </td>
                          <td className="py-3 px-4 font-mono">
                            <Skeleton className="h-4 w-14" />
                          </td>
                          <td className="py-3 px-4 font-mono">
                            <Skeleton className="h-4 w-14" />
                          </td>
                          <td className="py-3 px-4 font-mono">
                            <Skeleton className="h-4 w-14" />
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-1">
                              {Array.from({ length: 7 }).map((_, i) => (
                                <Skeleton key={i} className="w-4 h-4 rounded-full" />
                              ))}
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <Skeleton className="h-5 w-16 rounded-md" />
                          </td>
                          <td className="py-3 px-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Skeleton className="w-2.5 h-6 rounded-xs" />
                              <Skeleton className="w-7 h-7 rounded-lg" />
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : filteredSchedules.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-14 text-center text-brand-muted">
                          <div className="flex flex-col items-center justify-center gap-2 max-w-md mx-auto">
                            <CalendarCheck className="w-8 h-8 text-brand-muted opacity-50" />
                            <div className="text-sm font-bold text-brand-secondary">
                              No master schedules match current filter criteria
                            </div>
                            <p className="text-xs text-brand-muted">
                              Try clearing filters or click &quot;Add Schedule&quot; above to create a new timetable record.
                            </p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      paginatedSchedules.map((item) => {
                        const theme = getTrainTypeTheme(item.trainType, item.trainName);

                        return (
                          <tr
                            key={item.id}
                            className={"hover:bg-brand-tertiary/60 transition-colors"}
                          >
                            {/* Train No & Name with symbolic type bar */}
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-2.5">
                                <div className={`w-1.5 h-8 rounded-full ${theme.lineColor} flex-shrink-0`} />
                                <div>
                                  <div className="font-extrabold text-brand-secondary text-sm flex items-center gap-1.5">
                                    <span>{item.trainNumber}</span>
                                  </div>
                                  <div className="text-brand-muted font-bold text-xs mt-0.5">
                                    {item.trainName}
                                  </div>
                                </div>
                              </div>
                            </td>

                            {/* Priority */}
<td className="py-3 px-4">
  <span className="font-bold text-black text-xs">
    {item.priority}/10
  </span>
</td>

                            {/* Section Corridor */}
                            <td className="py-3 px-4">
                              <div className="font-semibold text-brand-secondary text-xs">
                                {item.sectionName}
                              </div>
                            </td>

                            {/* Scheduled Entry */}
                            <td className="py-3 px-4">
                              <div className="text-brand-primary font-semibold text-xs font-mono">
                                {formatTrainTimeIST(item.scheduledEntryTime)}
                              </div>
                              <span className="text-[10px] text-brand-muted">IST Entry</span>
                            </td>

                            {/* Scheduled Exit */}
                            <td className="py-3 px-4">
                              <div className="text-brand-primary font-semibold text-xs font-mono">
                                {formatTrainTimeIST(item.scheduledExitTime)}
                              </div>
                              <span className="text-[10px] text-brand-muted">IST Exit</span>
                            </td>

                            {/* Transit Duration */}
                            <td className="py-3 px-4">
                              <div className="text-brand-secondary font-bold">
                                {item.durationFormatted}
                              </div>
                            </td>


                            {/* Actions & Symbolic End Presence */}
                            <td className="py-3 px-4 text-right">
                              <div className="flex items-center justify-end gap-2">
                                <button
                                  onClick={() => setInspectScheduleItem(item)}
                                  className="p-1.5 rounded-lg bg-brand-surface hover:bg-brand-tertiary border border-brand-border text-black shadow-xs transition-colors cursor-pointer"
                                  title="Inspect Master Schedule Details"
                                >
                                  <Eye className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>

              {/* Table 2 Frontend Pagination Controls */}
              {filteredSchedules.length > 0 && (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 text-xs">
                  <div className="flex items-center gap-2 text-brand-muted font-medium">
                    <span>
                      Showing{" "}
                      <strong className="text-brand-secondary">
                        {(schedulesCurrentPage - 1) * schedulesPageSize + 1}
                      </strong>{" "}
                      to{" "}
                      <strong className="text-brand-secondary">
                        {Math.min(schedulesCurrentPage * schedulesPageSize, filteredSchedules.length)}
                      </strong>{" "}
                      of{" "}
                      <strong className="text-brand-secondary">
                        {filteredSchedules.length}
                      </strong>{" "}
                      master schedules
                    </span>

                    <div className="flex items-center gap-1.5 pl-3 border-l border-brand-border">
                      <span className="text-[11px]">Rows:</span>
                      <select
                        value={schedulesPageSize}
                        onChange={(e) => {
                          setSchedulesPageSize(Number(e.target.value));
                          setSchedulesCurrentPage(1);
                        }}
                        className="bg-brand-surface border border-brand-border rounded-lg px-2 py-1 text-xs font-bold text-brand-secondary outline-none cursor-pointer"
                      >
                        <option value={5}>5</option>
                        <option value={10}>10</option>
                        <option value={20}>20</option>
                        <option value={50}>50</option>
                      </select>
                    </div>
                  </div>

                  {/* Page Navigation */}
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setSchedulesCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={schedulesCurrentPage === 1}
                      className="p-1.5 rounded-lg bg-brand-surface border border-brand-border hover:bg-brand-tertiary disabled:opacity-40 disabled:pointer-events-none text-brand-secondary transition-colors cursor-pointer shadow-2xs"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>

                    {Array.from({ length: totalSchedulePages }).map((_, idx) => {
                      const pageNumber = idx + 1;
                      if (
                        pageNumber === 1 ||
                        pageNumber === totalSchedulePages ||
                        (pageNumber >= schedulesCurrentPage - 1 && pageNumber <= schedulesCurrentPage + 1)
                      ) {
                        return (
                          <button
                            key={pageNumber}
                            onClick={() => setSchedulesCurrentPage(pageNumber)}
                            className={`w-7 h-7 rounded-lg font-bold text-xs transition-colors cursor-pointer ${schedulesCurrentPage === pageNumber
                                ? "bg-brand-primary text-white shadow-xs"
                                : "bg-brand-surface border border-brand-border text-brand-secondary hover:bg-brand-tertiary"
                              }`}
                          >
                            {pageNumber}
                          </button>
                        );
                      }
                      if (
                        pageNumber === schedulesCurrentPage - 2 ||
                        pageNumber === schedulesCurrentPage + 2
                      ) {
                        return (
                          <span key={pageNumber} className="px-1 text-brand-muted">
                            ...
                          </span>
                        );
                      }
                      return null;
                    })}

                    <button
                      onClick={() => setSchedulesCurrentPage((p) => Math.min(totalSchedulePages, p + 1))}
                      disabled={schedulesCurrentPage === totalSchedulePages}
                      className="p-1.5 rounded-lg bg-brand-surface border border-brand-border hover:bg-brand-tertiary disabled:opacity-40 disabled:pointer-events-none text-brand-secondary transition-colors cursor-pointer shadow-2xs"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </section>
          )}
        </main>
      </div>

      {/* ========================================================================= */}
      {/* MODAL 1: Inspect Tracked Train Operation */}
      {/* ========================================================================= */}
      {inspectTrackedTrain && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-brand-surface border border-brand-border rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-brand-border">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <Radio className="w-5 h-5 animate-pulse" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-brand-secondary">
                    {inspectTrackedTrain.train_number} — {inspectTrackedTrain.train_name}
                  </h3>
                  <span className="text-xs text-brand-muted">
                    Tracked Operation Record • {inspectTrackedTrain.section.source_code} → {inspectTrackedTrain.section.destination_code}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setInspectTrackedTrain(null)}
                className="text-brand-muted hover:text-brand-secondary text-lg font-bold p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-brand-tertiary border border-brand-border">
                <span className="text-brand-muted block text-[10px] uppercase font-bold">Service Type</span>
                <span className="font-bold text-brand-secondary mt-0.5 block">{inspectTrackedTrain.train_type}</span>
              </div>
              <div className="p-3 rounded-xl bg-brand-tertiary border border-brand-border">
                <span className="text-brand-muted block text-[10px] uppercase font-bold">Priority Rating</span>
                <span className="font-bold text-brand-primary mt-0.5 block">{inspectTrackedTrain.priority} / 10</span>
              </div>
              <div className="p-3 rounded-xl bg-brand-tertiary border border-brand-border">
                <span className="text-brand-muted block text-[10px] uppercase font-bold">Corridor Section</span>
                <span className="font-bold text-brand-secondary mt-0.5 block">{inspectTrackedTrain.section.name}</span>
              </div>
              <div className="p-3 rounded-xl bg-brand-tertiary border border-brand-border">
                <span className="text-brand-muted block text-[10px] uppercase font-bold">Scheduled Entry</span>
                <span className="font-bold text-brand-primary mt-0.5 block font-mono">{formatTrainTimeIST(inspectTrackedTrain.schedule.entry_time)}</span>
              </div>
              <div className="p-3 rounded-xl bg-brand-tertiary border border-brand-border">
                <span className="text-brand-muted block text-[10px] uppercase font-bold">Scheduled Exit</span>
                <span className="font-bold text-brand-primary mt-0.5 block font-mono">{formatTrainTimeIST(inspectTrackedTrain.schedule.exit_time)}</span>
              </div>
              <div className="p-3 rounded-xl bg-brand-tertiary border border-brand-border">
                <span className="text-brand-muted block text-[10px] uppercase font-bold">Delay Offset</span>
                <span className={`font-bold mt-0.5 block ${(inspectTrackedTrain.delay_minutes ?? 0) > 0 ? "text-red-600" : "text-emerald-600"
                  }`}>
                  {formatDelayMetric(inspectTrackedTrain.delay_minutes).text}
                </span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-brand-tertiary border border-brand-border space-y-2 text-xs">
              <span className="font-bold text-brand-secondary block">Actual Movement Timestamps (IST)</span>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <span className="text-brand-muted block text-[10px]">Actual Entry Time:</span>
                  <span className="font-mono text-brand-secondary font-bold">
                    {formatTrainTimeIST(inspectTrackedTrain.movement?.actual_entry_time, "Not logged yet")}
                  </span>
                </div>
                <div>
                  <span className="text-brand-muted block text-[10px]">Actual Exit Time:</span>
                  <span className="font-mono text-brand-secondary font-bold">
                    {formatTrainTimeIST(inspectTrackedTrain.movement?.actual_exit_time, "Not logged yet")}
                  </span>
                </div>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setInspectTrackedTrain(null)}
                className="px-4 py-2 rounded-xl bg-brand-surface hover:bg-brand-tertiary border border-brand-border text-xs font-bold text-brand-secondary transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: Inspect Master Train Schedule */}
      {/* ========================================================================= */}
      {inspectScheduleItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-brand-surface border border-brand-border rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-brand-border">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-brand-blue-light text-brand-primary border border-brand-primary/20">
                  <TrainIcon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-brand-secondary">
                    {inspectScheduleItem.trainNumber} — {inspectScheduleItem.trainName}
                  </h3>
                  <span className="text-xs text-brand-muted">
                    Master Timetable Specification #{inspectScheduleItem.scheduleId || inspectScheduleItem.id}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setInspectScheduleItem(null)}
                className="text-brand-muted hover:text-brand-secondary text-lg font-bold p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-brand-tertiary border border-brand-border">
                <span className="text-brand-muted block text-[10px] uppercase font-bold">Service Type</span>
                <span className="font-bold text-brand-secondary mt-0.5 block">{inspectScheduleItem.trainType}</span>
              </div>
              <div className="p-3 rounded-xl bg-brand-tertiary border border-brand-border">
                <span className="text-brand-muted block text-[10px] uppercase font-bold">Priority Rating</span>
                <span className="font-bold text-brand-primary mt-0.5 block">{inspectScheduleItem.priority} / 10</span>
              </div>
              <div className="p-3 rounded-xl bg-brand-tertiary border border-brand-border">
                <span className="text-brand-muted block text-[10px] uppercase font-bold">Corridor Section</span>
                <span className="font-bold text-brand-secondary mt-0.5 block">{inspectScheduleItem.sectionName}</span>
              </div>
              <div className="p-3 rounded-xl bg-brand-tertiary border border-brand-border">
                <span className="text-brand-muted block text-[10px] uppercase font-bold">Scheduled Entry</span>
                <span className="font-bold text-brand-primary mt-0.5 block font-mono">{formatTrainTimeIST(inspectScheduleItem.scheduledEntryTime)}</span>
              </div>
              <div className="p-3 rounded-xl bg-brand-tertiary border border-brand-border">
                <span className="text-brand-muted block text-[10px] uppercase font-bold">Scheduled Exit</span>
                <span className="font-bold text-brand-primary mt-0.5 block font-mono">{formatTrainTimeIST(inspectScheduleItem.scheduledExitTime)}</span>
              </div>
              <div className="p-3 rounded-xl bg-brand-tertiary border border-brand-border">
                <span className="text-brand-muted block text-[10px] uppercase font-bold">Transit Duration</span>
                <span className="font-bold text-brand-secondary mt-0.5 block">
                  {inspectScheduleItem.durationFormatted}
                </span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-brand-tertiary border border-brand-border space-y-2">
              <span className="text-xs font-bold text-brand-secondary block">Weekly Operating Days</span>
              <div className="flex items-center gap-2 flex-wrap">
                {DAYS_FULL.map((d, i) => {
                  const runs = inspectScheduleItem.runningDays[i] === "1";
                  return (
                    <div
                      key={d}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 ${runs
                          ? "bg-brand-blue-light text-brand-primary border border-brand-primary/30"
                          : "bg-brand-surface text-slate-400 border border-brand-border"
                        }`}
                    >
                      <span>{d}</span>
                      <span>{runs ? "✓" : "✗"}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setInspectScheduleItem(null)}
                className="px-4 py-2 rounded-xl bg-brand-surface hover:bg-brand-tertiary border border-brand-border text-xs font-bold text-brand-secondary transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: Create Master Train Schedule */}
      {/* ========================================================================= */}
      {isCreateScheduleModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-brand-surface border border-brand-border rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-brand-border">
              <div className="flex items-center gap-2">
                <CalendarCheck className="w-5 h-5 text-brand-primary" />
                <h3 className="text-base font-bold text-brand-secondary">Create Master Train Schedule</h3>
              </div>
              <button
                onClick={() => setIsCreateScheduleModalOpen(false)}
                className="text-brand-muted hover:text-brand-secondary text-lg font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 4: Log Live Train Movement */}
      {/* ========================================================================= */}
      {isLogMovementModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-brand-surface border border-brand-border rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-brand-border">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-brand-primary" />
                <h3 className="text-base font-bold text-brand-secondary">Log Live Train Movement</h3>
              </div>
              <button
                onClick={() => setIsLogMovementModalOpen(false)}
                className="text-brand-muted hover:text-brand-secondary text-lg font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}