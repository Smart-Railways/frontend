"use client";

import React, { useState, useMemo } from "react";
import { VerticalNavbar } from "@/components/navigation/vertical-navbar";
import {
  Train as TrainIcon,
  Calendar as CalendarIcon,
  Clock,
  Search,
  RefreshCw,
  Plus,
  ShieldCheck,
  Zap,
  ChevronLeft,
  ChevronRight,
  Layers,
  SlidersHorizontal,
  Eye,
  Info,
  CalendarCheck,
  ArrowRight,
  Gauge,
  Code2,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Activity,
  Timer,
} from "lucide-react";
import {
  useRailwaySections,
  useTrains,
  useTrainSchedules,
  useTrainMovements,
  useCreateTrainSchedule,
  useCreateTrainMovement,
} from "@/hooks";
import {
  Train,
  TrainSchedule,
  TrainMovement,
  CreateTrainScheduleInput,
  CreateTrainMovementInput,
} from "@/types";

const DAYS_SHORT = ["M", "T", "W", "T", "F", "S", "S"];
const DAYS_FULL = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

// Helper to format date as YYYY-MM-DD
function formatDateToISO(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

// Helper to format date display (e.g. "Thu, 03 Sep 2026")
function formatDisplayDate(dateStr: string): string {
  try {
    const [y, m, d] = dateStr.split("-").map(Number);
    const date = new Date(y, m - 1, d);
    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      weekday: "short",
    });
  } catch {
    return dateStr;
  }
}

// Helper to format time (e.g. "06:00:00" -> "06:00")
function formatTimeString(timeStr?: string | null): string {
  if (!timeStr) return "--:--";
  if (timeStr.includes("T")) {
    const timePart = timeStr.split("T")[1].replace("Z", "");
    return timePart.substring(0, 5);
  }
  if (timeStr.includes(" ")) {
    return timeStr.split(" ")[1].substring(0, 5);
  }
  return timeStr.substring(0, 5);
}

// Calculate duration between two time strings
function calculateTimeDuration(
  entryTime?: string | null,
  exitTime?: string | null
): { durationMins: number; formatted: string } {
  if (!entryTime || !exitTime) return { durationMins: 0, formatted: "--" };

  const parseToMins = (t: string) => {
    let cleanTime = t;
    if (cleanTime.includes("T")) {
      cleanTime = cleanTime.split("T")[1].replace("Z", "");
    } else if (cleanTime.includes(" ")) {
      cleanTime = cleanTime.split(" ")[1];
    }
    const [hh, mm] = cleanTime.split(":").map(Number);
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

// Train Type Badge color styling
function getTrainTypeBadge(type?: string) {
  const t = (type || "").toUpperCase();
  switch (t) {
    case "RAJDHANI":
      return "bg-amber-500/15 text-amber-300 border-amber-500/40";
    case "VB":
    case "VANDE BHARAT":
      return "bg-purple-500/15 text-purple-300 border-purple-500/40";
    case "SHATABDI":
      return "bg-cyan-500/15 text-cyan-300 border-cyan-500/40";
    case "EXPRESS":
      return "bg-emerald-500/15 text-emerald-300 border-emerald-500/40";
    case "FREIGHT":
      return "bg-orange-500/15 text-orange-300 border-orange-500/40";
    case "PASSENGER":
      return "bg-blue-500/15 text-blue-300 border-blue-500/40";
    default:
      return "bg-slate-500/15 text-slate-300 border-slate-500/40";
  }
}

// Combined Timetable Row Item
interface SectionTimetableItem {
  id: string | number;
  scheduleId?: number;
  movementId?: number;
  trainId?: number;
  trainNumber: string;
  trainName: string;
  trainType: string;
  priority: number;
  scheduledEntryTime: string;
  scheduledExitTime: string;
  actualEntryTime?: string | null;
  actualExitTime?: string | null;
  durationMins: number;
  durationFormatted: string;
  runningDays: string;
  runsToday: boolean;
  isActive: boolean;
  sectionId: number;
  sectionName: string;
  originStation: string;
  endStation: string;
  distanceKm: number;
  avgSpeedKmph: number;
  statusText: string;
  statusBadge: string;
  statusDot: string;
  rawSchedule?: TrainSchedule;
  rawMovement?: TrainMovement;
  rawTrain?: Train;
}

export default function TrainsPage() {
  const [activeNavTab, setActiveNavTab] = useState<string>("trains");

  // Filter state
  const [selectedSectionId, setSelectedSectionId] = useState<number | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>(formatDateToISO(new Date()));
  const [searchQuery, setSearchQuery] = useState<string>("" );
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<string>("ALL");
  const [runningTodayOnly, setRunningTodayOnly] = useState<boolean>(false);

  // Modals
  const [inspectItem, setInspectItem] = useState<SectionTimetableItem | null>(null);
  const [isCreateScheduleModalOpen, setIsCreateScheduleModalOpen] = useState<boolean>(false);
  const [isLogMovementModalOpen, setIsLogMovementModalOpen] = useState<boolean>(false);
  const [selectedItemForMovement, setSelectedItemForMovement] = useState<SectionTimetableItem | null>(null);

  // TanStack Queries for all relevant endpoints
  const {
    data: sections = [],
    isLoading: loadingSections,
    isRefetching: refetchingSections,
    refetch: refetchSections,
  } = useRailwaySections();

  const {
    data: trains = [],
    isLoading: loadingTrains,
    isRefetching: refetchingTrains,
    refetch: refetchTrains,
  } = useTrains();

  const {
    data: schedules = [],
    isLoading: loadingSchedules,
    isRefetching: refetchingSchedules,
    refetch: refetchSchedules,
  } = useTrainSchedules();

  const {
    data: movements = [],
    isLoading: loadingMovements,
    isRefetching: refetchingMovements,
    refetch: refetchMovements,
  } = useTrainMovements();

  // Mutations
  const createScheduleMutation = useCreateTrainSchedule();
  const createMovementMutation = useCreateTrainMovement();

  // Active section calculation
  const activeSectionId = selectedSectionId ?? (sections.length > 0 ? sections[0].id : null);
  const currentSection = useMemo(() => {
    return sections.find((s) => s.id === activeSectionId) || sections[0] || null;
  }, [sections, activeSectionId]);

  const isGlobalLoading = loadingSections || loadingTrains || loadingSchedules || loadingMovements;
  const isGlobalRefetching =
    refetchingSections || refetchingTrains || refetchingSchedules || refetchingMovements;

  const handleRefresh = () => {
    refetchSections();
    refetchTrains();
    refetchSchedules();
    refetchMovements();
  };

  // Date Navigation handlers
  const handlePrevDay = () => {
    const [y, m, d] = selectedDate.split("-").map(Number);
    const prev = new Date(y, m - 1, d - 1);
    setSelectedDate(formatDateToISO(prev));
  };

  const handleNextDay = () => {
    const [y, m, d] = selectedDate.split("-").map(Number);
    const next = new Date(y, m - 1, d + 1);
    setSelectedDate(formatDateToISO(next));
  };

  const handleSetToday = () => {
    setSelectedDate(formatDateToISO(new Date()));
  };

  // Day of week for selectedDate (Monday=0, ..., Sunday=6)
  const selectedDayIndex = useMemo(() => {
    try {
      const [y, m, d] = selectedDate.split("-").map(Number);
      const date = new Date(y, m - 1, d);
      return (date.getDay() + 6) % 7;
    } catch {
      return 0;
    }
  }, [selectedDate]);

  // Combine Train Schedules, Movements, and Train Metadata for the Active Section
  const timetableItems = useMemo<SectionTimetableItem[]>(() => {
    if (!currentSection) return [];

    const list: SectionTimetableItem[] = [];
    const matchedMovementIds = new Set<number>();

    // 1. Map from Master Train Schedules (TT)
    schedules.forEach((sch) => {
      // Check if schedule belongs to active section
      const matchesSectionId = sch.section === currentSection.id;
      const matchesSectionName =
        sch.section_name &&
        currentSection.section_name &&
        (sch.section_name.toLowerCase().includes(currentSection.section_name.toLowerCase()) ||
          currentSection.section_name.toLowerCase().includes(sch.section_name.toLowerCase()));

      if (!matchesSectionId && !matchesSectionName) return;

      // Find Train Details
      const trainObj = trains.find(
        (t) =>
          t.id === sch.train ||
          (sch.train_name && t.name.toLowerCase() === sch.train_name.toLowerCase()) ||
          (sch.train_number && t.train_number === sch.train_number)
      );

      // Find Movement for this Schedule on selected date
      const movementObj = movements.find((m) => {
        const matchesSch = m.schedule === sch.id;
        const matchesTrain =
          trainObj && (m.train === trainObj.id || m.train_number === trainObj.train_number);
        const matchesDate = m.service_date === selectedDate;
        return (matchesSch || matchesTrain) && matchesDate;
      });

      if (movementObj) {
        matchedMovementIds.add(movementObj.id);
      }

      const runningDays = sch.running_days || "1111111";
      const runsToday = runningDays[selectedDayIndex] === "1";
      const isActive = sch.is_active ?? true;

      const durationInfo = calculateTimeDuration(
        sch.scheduled_entry_time,
        sch.scheduled_exit_time
      );

      const distance = currentSection.distance || 140;
      const speed =
        durationInfo.durationMins > 0
          ? Math.round(distance / (durationInfo.durationMins / 60))
          : 0;

      // Determine Status
      let statusText = "SCHEDULED (ON TIME)";
      let statusBadge = "bg-emerald-500/15 border-emerald-500/40 text-emerald-300";
      let statusDot = "bg-emerald-400";

      if (!isActive) {
        statusText = "SUSPENDED";
        statusBadge = "bg-slate-500/15 border-slate-500/40 text-slate-400";
        statusDot = "bg-slate-400";
      } else if (movementObj?.actual_exit_time) {
        statusText = "COMPLETED";
        statusBadge = "bg-blue-500/15 border-blue-500/40 text-blue-300";
        statusDot = "bg-blue-400";
      } else if (movementObj?.actual_entry_time) {
        statusText = "RUNNING IN SECTION";
        statusBadge = "bg-purple-500/15 border-purple-500/40 text-purple-300";
        statusDot = "bg-purple-400 animate-pulse";
      } else if (!runsToday) {
        statusText = "OFF SCHEDULE";
        statusBadge = "bg-amber-500/15 border-amber-500/40 text-amber-300";
        statusDot = "bg-amber-400";
      }

      list.push({
        id: `sch-${sch.id}`,
        scheduleId: sch.id,
        movementId: movementObj?.id,
        trainId: trainObj?.id || sch.train,
        trainNumber: trainObj?.train_number || sch.train_number || `TR-${sch.train}`,
        trainName: trainObj?.name || sch.train_name || "Express Service",
        trainType: trainObj?.train_type || "EXPRESS",
        priority: trainObj?.priority || 5,
        scheduledEntryTime: sch.scheduled_entry_time,
        scheduledExitTime: sch.scheduled_exit_time,
        actualEntryTime: movementObj?.actual_entry_time,
        actualExitTime: movementObj?.actual_exit_time,
        durationMins: durationInfo.durationMins,
        durationFormatted: durationInfo.formatted,
        runningDays,
        runsToday,
        isActive,
        sectionId: currentSection.id,
        sectionName: currentSection.section_name,
        originStation: currentSection.origin_station,
        endStation: currentSection.end_station,
        distanceKm: distance,
        avgSpeedKmph: speed,
        statusText,
        statusBadge,
        statusDot,
        rawSchedule: sch,
        rawMovement: movementObj,
        rawTrain: trainObj,
      });
    });

    // 2. Include standalone movements on this section that weren't linked to a schedule
    movements.forEach((m) => {
      if (matchedMovementIds.has(m.id)) return;

      const matchesSec =
        String(m.section) === String(currentSection.id) ||
        (m.section_name &&
          m.section_name.toLowerCase().includes(currentSection.section_name.toLowerCase()));
      const matchesDate = m.service_date === selectedDate || !m.service_date;

      if (!matchesSec || !matchesDate) return;

      const trainObj = trains.find(
        (t) =>
          String(t.id) === String(m.train) ||
          (m.train_number && t.train_number === m.train_number) ||
          (typeof m.train === "string" && t.name.toLowerCase() === m.train.toLowerCase())
      );

      const entryTime = m.scheduled_entry_time || m.entry_time || "08:00:00";
      const exitTime = m.scheduled_exit_time || m.exit_time || "09:45:00";
      const durationInfo = calculateTimeDuration(entryTime, exitTime);
      const distance = currentSection.distance || 140;
      const speed =
        durationInfo.durationMins > 0
          ? Math.round(distance / (durationInfo.durationMins / 60))
          : 0;

      list.push({
        id: `mov-${m.id}`,
        movementId: m.id,
        trainId: trainObj?.id,
        trainNumber: m.train_number || trainObj?.train_number || "EXP-01",
        trainName:
          (typeof m.train === "string" ? m.train : trainObj?.name) || "Corridor Movement",
        trainType: trainObj?.train_type || "EXPRESS",
        priority: trainObj?.priority || 5,
        scheduledEntryTime: entryTime,
        scheduledExitTime: exitTime,
        actualEntryTime: m.actual_entry_time,
        actualExitTime: m.actual_exit_time,
        durationMins: durationInfo.durationMins,
        durationFormatted: durationInfo.formatted,
        runningDays: "1111111",
        runsToday: true,
        isActive: true,
        sectionId: currentSection.id,
        sectionName: currentSection.section_name,
        originStation: currentSection.origin_station,
        endStation: currentSection.end_station,
        distanceKm: distance,
        avgSpeedKmph: speed,
        statusText: m.actual_exit_time ? "COMPLETED" : "LIVE MOVEMENT",
        statusBadge: "bg-purple-500/15 border-purple-500/40 text-purple-300",
        statusDot: "bg-purple-400",
        rawMovement: m,
        rawTrain: trainObj,
      });
    });

    // Sort by scheduled entry time
    return list.sort((a, b) => a.scheduledEntryTime.localeCompare(b.scheduledEntryTime));
  }, [schedules, movements, trains, currentSection, selectedDate, selectedDayIndex]);

  // Filtered timetable based on search and type filters
  const filteredTimetable = useMemo(() => {
    return timetableItems.filter((item) => {
      // Running today filter
      if (runningTodayOnly && !item.runsToday) return false;

      // Type filter
      if (selectedTypeFilter !== "ALL") {
        if (selectedTypeFilter === "VB") {
          if (item.trainType !== "VB" && item.trainType !== "VANDE BHARAT") return false;
        } else if (item.trainType !== selectedTypeFilter) {
          return false;
        }
      }

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchNum = item.trainNumber.toLowerCase().includes(q);
        const matchName = item.trainName.toLowerCase().includes(q);
        const matchType = item.trainType.toLowerCase().includes(q);
        if (!matchNum && !matchName && !matchType) return false;
      }

      return true;
    });
  }, [timetableItems, runningTodayOnly, selectedTypeFilter, searchQuery]);

  // Section KPI Metrics
  const stats = useMemo(() => {
    const total = timetableItems.length;
    const runningToday = timetableItems.filter((t) => t.runsToday).length;
    const highPriority = timetableItems.filter((t) => t.priority >= 8).length;
    const totalDuration = timetableItems.reduce((acc, t) => acc + t.durationMins, 0);
    const avgDuration = total > 0 ? Math.round(totalDuration / total) : 0;
    const avgSpeed =
      total > 0
        ? Math.round(timetableItems.reduce((acc, t) => acc + t.avgSpeedKmph, 0) / total)
        : 0;

    return {
      total,
      runningToday,
      highPriority,
      avgDuration,
      avgSpeed,
    };
  }, [timetableItems]);

  // Create Schedule Form State
  const [newScheduleData, setNewScheduleData] = useState<CreateTrainScheduleInput>({
    train: trains.length > 0 ? trains[0].id : 1,
    section: currentSection ? currentSection.id : 1,
    scheduled_entry_time: "06:00:00",
    scheduled_exit_time: "07:45:00",
    running_days: "1111111",
    is_active: true,
  });

  const handleCreateScheduleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentSection) return;

    createScheduleMutation.mutate(
      {
        ...newScheduleData,
        section: currentSection.id,
      },
      {
        onSuccess: () => {
          setIsCreateScheduleModalOpen(false);
          refetchSchedules();
        },
        onError: (err) => {
          alert(err instanceof Error ? err.message : "Failed to create schedule");
        },
      }
    );
  };

  // Log Movement Form State
  const [movementForm, setMovementForm] = useState<{
    scheduleId: number | "";
    serviceDate: string;
    actualEntry: string;
    actualExit: string;
  }>({
    scheduleId: "",
    serviceDate: selectedDate,
    actualEntry: "06:05",
    actualExit: "07:50",
  });

  const handleOpenMovementModal = (item?: SectionTimetableItem) => {
    if (item && item.scheduleId) {
      setSelectedItemForMovement(item);
      setMovementForm({
        scheduleId: item.scheduleId,
        serviceDate: selectedDate,
        actualEntry: formatTimeString(item.actualEntryTime || item.scheduledEntryTime),
        actualExit: formatTimeString(item.actualExitTime || item.scheduledExitTime),
      });
    } else {
      setSelectedItemForMovement(null);
      setMovementForm({
        scheduleId: schedules.length > 0 ? schedules[0].id : "",
        serviceDate: selectedDate,
        actualEntry: "06:00",
        actualExit: "07:45",
      });
    }
    setIsLogMovementModalOpen(true);
  };

  const handleLogMovementSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!movementForm.scheduleId) {
      alert("Please select a valid schedule.");
      return;
    }

    const payload: CreateTrainMovementInput = {
      schedule: Number(movementForm.scheduleId),
      service_date: movementForm.serviceDate,
      actual_entry_time: `${movementForm.serviceDate}T${movementForm.actualEntry}:00Z`,
      actual_exit_time: movementForm.actualExit
        ? `${movementForm.serviceDate}T${movementForm.actualExit}:00Z`
        : null,
    };

    createMovementMutation.mutate(payload, {
      onSuccess: () => {
        setIsLogMovementModalOpen(false);
        refetchMovements();
      },
      onError: (err) => {
        alert(err instanceof Error ? err.message : "Failed to log movement");
      },
    });
  };

  return (
    /* Brand Cockpit Page Background: bg-brand-cockpit (#080c15 / #070b13) */
    <div className="min-h-screen bg-brand-cockpit text-slate-100 flex flex-col font-sans selection:bg-emerald-500/30 selection:text-emerald-200">
      {/* 1. Left Vertical Navbar */}
      <VerticalNavbar activeTab={activeNavTab} onTabChange={setActiveNavTab} unreadCount={3} />

      {/* Main Content Area */}
      <div className="flex-1 flex pl-20 lg:pl-64">
        <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-7 flex flex-col space-y-6 max-w-[1500px] mx-auto w-full">
          {/* Header Bar with Brand Border */}
          <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-brand-border/60">
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
                  Section Train Timetable
                </h1>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Real-time master timetable schedules, train movement dispatch records, and corridor throughput with 30-minute stale caching.
              </p>
            </div>

            {/* Quick Actions */}
            {/* <div className="flex items-center gap-2.5 flex-wrap">
              <button
                onClick={handleRefresh}
                disabled={isGlobalRefetching}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#0d1527] hover:bg-[#121d36] border border-[#172642] text-xs text-slate-300 transition-colors disabled:opacity-50 cursor-pointer"
              >
                <RefreshCw
                  className={`w-3.5 h-3.5 text-blue-400 ${
                    isGlobalRefetching ? "animate-spin" : ""
                  }`}
                />
                <span>{isGlobalRefetching ? "Refreshing..." : "Refresh"}</span>
              </button>

              <button
                onClick={() => {
                  setNewScheduleData({
                    train: trains.length > 0 ? trains[0].id : 1,
                    section: currentSection ? currentSection.id : 1,
                    scheduled_entry_time: "06:00:00",
                    scheduled_exit_time: "07:45:00",
                    running_days: "1111111",
                    is_active: true,
                  });
                  setIsCreateScheduleModalOpen(true);
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#0d1527] hover:bg-[#121d36] border border-emerald-500/30 text-xs font-semibold text-emerald-300 transition-all cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5 text-emerald-400" />
                <span>+ Add Schedule (TT)</span>
              </button>

              <button
                onClick={() => handleOpenMovementModal()}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white text-xs font-semibold shadow-md shadow-emerald-950/40 border border-emerald-400/30 transition-all cursor-pointer"
              >
                <Clock className="w-3.5 h-3.5" />
                <span>Log Movement</span>
              </button>
            </div> */}
          </header>

          {/* Section and Date Selection Bar: Brand Card Surface (bg-brand-card) & Border (border-brand-border) */}
          <section className="p-4 rounded-2xl bg-brand-card/90 border border-brand-border shadow-xl backdrop-blur-sm space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
              {/* Section Dropdown */}
              <div className="md:col-span-6 space-y-1.5">
                <label className="text-xs font-bold text-slate-300 flex items-center justify-between">
                  <span className="flex items-center gap-1.5 uppercase tracking-wider">
                    Select Railway Section / Corridor
                  </span>
                  {currentSection && (
                    <span className="text-[10px] font-mono text-emerald-300 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30">
                      ID: #{currentSection.id} • {currentSection.distance} km
                    </span>
                  )}
                </label>
                <div className="relative">
                  {/* Brand Cockpit Input Fields: bg-brand-cockpit & border-brand-border */}
                  <select
                    value={activeSectionId || ""}
                    onChange={(e) => setSelectedSectionId(Number(e.target.value))}
                    disabled={loadingSections}
                    className="w-full bg-brand-cockpit border border-brand-border focus:border-emerald-500 text-white text-sm rounded-xl px-3.5 py-2.5 outline-none transition-colors cursor-pointer disabled:opacity-50 font-medium"
                  >
                    {sections.map((sec) => (
                      <option key={sec.id} value={sec.id} className="bg-brand-cockpit text-white">
                        {sec.section_name} ({sec.distance} km) • {sec.origin_station} →{" "}
                        {sec.end_station}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Date Navigation & Picker */}
              <div className="md:col-span-6 space-y-1.5">
                <label className="text-xs font-bold text-slate-300 flex items-center justify-between">
                  <span className="flex items-center gap-1.5 uppercase tracking-wider">
                    Operating Day Schedule
                  </span>
                  <span className="text-[10px] text-blue-300 font-mono">
                    Day: {DAYS_FULL[selectedDayIndex]}
                  </span>
                </label>
                {/* Date Controls: bg-brand-cockpit & hover:bg-brand-cardHover */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={handlePrevDay}
                    title="Previous Day"
                    className="p-2.5 rounded-xl bg-brand-cockpit border border-brand-border hover:bg-brand-cardHover text-slate-300 hover:text-white transition-colors cursor-pointer"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>

                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="flex-1 bg-brand-cockpit border border-brand-border focus:border-blue-500 text-white text-sm rounded-xl px-3.5 py-2 outline-none font-medium cursor-pointer"
                  />

                  <button
                    onClick={handleNextDay}
                    title="Next Day"
                    className="p-2.5 rounded-xl bg-brand-cockpit border border-brand-border hover:bg-brand-cardHover text-slate-300 hover:text-white transition-colors cursor-pointer"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>

                  <button
                    onClick={handleSetToday}
                    className="px-3 py-2 rounded-xl bg-brand-cockpit border border-brand-border hover:bg-brand-cardHover text-xs font-semibold text-blue-400 hover:text-blue-300 transition-colors whitespace-nowrap cursor-pointer"
                  >
                    Today
                  </button>
                </div>
              </div>
            </div>

            {/* Filter Sub-row */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-brand-border/60">
              {/* Search Box */}
              <div className="w-full sm:w-80">
                <input
                  type="text"
                  placeholder="Search train no., name, type..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-brand-cockpit border border-brand-border focus:border-emerald-500 text-xs text-white rounded-xl px-3.5 py-2 outline-none"
                />
              </div>

              {/* Train Type Filter Badges */}
              <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
                {["ALL", "RAJDHANI", "VB", "SHATABDI", "EXPRESS", "FREIGHT", "PASSENGER"].map(
                  (type) => (
                    <button
                      key={type}
                      onClick={() => setSelectedTypeFilter(type)}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border transition-all whitespace-nowrap cursor-pointer ${
                        selectedTypeFilter === type
                          ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/50 shadow-sm"
                          : "bg-brand-cockpit text-slate-400 border-brand-border hover:text-slate-200"
                      }`}
                    >
                      {type === "VB" ? "Vande Bharat" : type}
                    </button>
                  )
                )}

                <button
                  onClick={() => setRunningTodayOnly(!runningTodayOnly)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border transition-all whitespace-nowrap cursor-pointer ${
                    runningTodayOnly
                      ? "bg-brand-primary/20 text-blue-300 border-brand-primary/50 shadow-sm"
                      : "bg-brand-cockpit text-slate-400 border-brand-border hover:text-slate-200"
                  }`}
                >
                  Runs on {DAYS_FULL[selectedDayIndex]}
                </button>
              </div>
            </div>
          </section>

          {/* KPI Stat Cards: Minimal & Professional with Brand Primary Color */}
          <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl bg-gradient-to-br from-brand-card to-brand-cockpit border border-brand-border">
              <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                Total TT Schedules
              </div>
              <div className="text-2xl font-black text-white">{stats.total}</div>
              <div className="text-[11px] text-slate-400 mt-1">
                {stats.runningToday} running on {formatDisplayDate(selectedDate)}
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-gradient-to-br from-brand-card to-brand-cockpit border border-brand-border">
              <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                High Priority Services
              </div>
              <div className="text-2xl font-black text-blue-400">{stats.highPriority}</div>
              <div className="text-[11px] text-slate-400 mt-1">Priority 8-10 Express/VB/Rajdhani</div>
            </div>

            <div className="p-4 rounded-2xl bg-gradient-to-br from-brand-card to-brand-cockpit border border-brand-border">
              <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                Avg Transit Duration
              </div>
              <div className="text-2xl font-black text-blue-400">
                {stats.avgDuration > 0 ? `${stats.avgDuration} mins` : "--"}
              </div>
              <div className="text-[11px] text-slate-400 mt-1">
                Throughput window across {currentSection?.distance || 140} km
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-gradient-to-br from-brand-card to-brand-cockpit border border-brand-border">
              <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                Avg Corridor Speed
              </div>
              <div className="text-2xl font-black text-blue-400">
                {stats.avgSpeed > 0 ? `${stats.avgSpeed} km/h` : "--"}
              </div>
              <div className="text-[11px] text-slate-400 mt-1">Section operational velocity</div>
            </div>
          </section>

          {/* Trains Table Section: Surface bg-brand-card, Header bg-brand-cockpit, Divider divide-brand-border */}
          <section className="rounded-2xl bg-brand-card border border-brand-border shadow-2xl overflow-hidden">
            {/* Table Header Bar */}
            <div className="p-4 border-b border-brand-border flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-brand-cockpit/90">
              <div>
                <h2 className="text-sm font-bold text-white flex items-center gap-2">
                  <span>Section Timetable:</span>
                  <span className="text-emerald-400 font-extrabold">
                    {currentSection ? currentSection.section_name : "Loading..."}
                  </span>
                  <span className="text-xs font-normal text-slate-400">
                    ({currentSection ? `${currentSection.origin_station} → ${currentSection.end_station}` : ""})
                  </span>
                </h2>
                <p className="text-xs text-slate-400">
                  Showing master timetable and movements for {formatDisplayDate(selectedDate)}
                </p>
              </div>

              <div className="flex items-center gap-3 text-xs text-slate-400 font-mono">
                <span className="px-2 py-0.5 rounded bg-brand-cockpit border border-brand-border text-amber-300">
                  REST: /railways/schedules/ & /railways/train-movements/
                </span>
                <span className="font-bold text-white">
                  {filteredTimetable.length} of {timetableItems.length} trains
                </span>
              </div>
            </div>

            {/* Main Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-brand-cockpit/80 text-slate-400 font-bold uppercase tracking-wider border-b border-brand-border">
                  <tr>
                    <th className="py-3 px-4">Train # & Name</th>
                    <th className="py-3 px-4">Type</th>
                    <th className="py-3 px-4">Priority</th>
                    <th className="py-3 px-4">Scheduled Entry (IST)</th>
                    <th className="py-3 px-4">Scheduled Exit (IST)</th>
                    <th className="py-3 px-4">Transit / Speed</th>
                    <th className="py-3 px-4">Running Days</th>
                    <th className="py-3 px-4">Actual Times</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-brand-border/60">
                  {isGlobalLoading ? (
                    <tr>
                      <td colSpan={10} className="py-16 text-center text-slate-400">
                        <div className="flex flex-col items-center justify-center gap-2">
                          <RefreshCw className="w-7 h-7 animate-spin text-blue-400" />
                          <span className="text-xs font-bold text-slate-200">
                            Loading section train timetable from database...
                          </span>
                        </div>
                      </td>
                    </tr>
                  ) : filteredTimetable.length === 0 ? (
                    <tr>
                      <td colSpan={10} className="py-16 text-center text-slate-400">
                        <div className="flex flex-col items-center justify-center gap-3">
                          <TrainIcon className="w-10 h-10 text-slate-600" />
                          <div className="text-sm font-bold text-slate-300">
                            No timetable entries found on this section
                          </div>
                          <p className="text-xs text-slate-500 max-w-md">
                            Add master schedules or log live train movements for{" "}
                            {currentSection?.section_name}.
                          </p>
                          <div className="flex items-center gap-2 mt-2">
                            <button
                              onClick={() => setIsCreateScheduleModalOpen(true)}
                              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-xs font-semibold text-white transition-colors cursor-pointer"
                            >
                              <Plus className="w-3.5 h-3.5" />
                              + Add Schedule
                            </button>
                            <button
                              onClick={() => handleOpenMovementModal()}
                              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-brand-cardHover hover:bg-brand-accent border border-brand-border text-xs font-semibold text-blue-300 transition-colors cursor-pointer"
                            >
                              <Clock className="w-3.5 h-3.5" />
                              Log Movement
                            </button>
                          </div>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredTimetable.map((item) => {
                      return (
                        <tr
                          key={item.id}
                          className="hover:bg-brand-cardHover/60 transition-colors group"
                        >
                          {/* Train Number & Name */}
                          <td className="py-3.5 px-4">
                            <div>
                              <div className="font-extrabold text-white text-sm font-mono flex items-center gap-1.5">
                                <span>{item.trainNumber}</span>
                                {item.scheduleId && (
                                  <span className="text-[10px] font-sans font-normal text-slate-500">
                                    #TT-{item.scheduleId}
                                  </span>
                                )}
                              </div>
                              <div className="text-slate-300 font-medium text-xs">
                                {item.trainName}
                              </div>
                            </div>
                          </td>

                          {/* Type */}
                          <td className="py-3.5 px-4">
                            <span
                              className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-extrabold border ${getTrainTypeBadge(
                                item.trainType
                              )}`}
                            >
                              {item.trainType}
                            </span>
                          </td>

                          {/* Priority */}
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-1.5">
                              <span
                                className={`font-mono font-bold ${
                                  item.priority >= 8
                                    ? "text-amber-400"
                                    : item.priority >= 5
                                    ? "text-blue-400"
                                    : "text-slate-400"
                                }`}
                              >
                                {item.priority}/10
                              </span>
                              {item.priority >= 8 && (
                                <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                                  High
                                </span>
                              )}
                            </div>
                          </td>

                          {/* Scheduled Entry Time */}
                          <td className="py-3.5 px-4">
                            <div className="font-mono text-emerald-400 font-extrabold text-sm">
                              {formatTimeString(item.scheduledEntryTime)}
                            </div>
                            <span className="text-[10px] text-slate-500 font-mono">
                              IST ({item.originStation})
                            </span>
                          </td>

                          {/* Scheduled Exit Time */}
                          <td className="py-3.5 px-4">
                            <div className="font-mono text-cyan-400 font-extrabold text-sm">
                              {formatTimeString(item.scheduledExitTime)}
                            </div>
                            <span className="text-[10px] text-slate-500 font-mono">
                              IST ({item.endStation})
                            </span>
                          </td>

                          {/* Transit Duration & Speed */}
                          <td className="py-3.5 px-4">
                            <div className="font-mono text-slate-200 font-bold">
                              {item.durationFormatted}
                            </div>
                            <div className="text-[10px] text-slate-400 font-mono">
                              {item.avgSpeedKmph > 0 ? `~${item.avgSpeedKmph} km/h` : "--"}
                            </div>
                          </td>

                          {/* Running Days (7-Day Strip) */}
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-1">
                              {DAYS_SHORT.map((dayLabel, idx) => {
                                const runs = item.runningDays[idx] === "1";
                                const isSelectedDay = idx === selectedDayIndex;
                                return (
                                  <span
                                    key={idx}
                                    title={`${DAYS_FULL[idx]}: ${runs ? "Runs" : "No Service"}`}
                                    className={`w-4 h-4 rounded text-[9px] font-bold flex items-center justify-center ${
                                      isSelectedDay
                                        ? runs
                                          ? "bg-brand-primary text-white ring-1 ring-white shadow-sm"
                                          : "bg-slate-700 text-slate-400"
                                        : runs
                                        ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                                        : "bg-brand-cockpit text-slate-600 border border-brand-border"
                                    }`}
                                  >
                                    {dayLabel}
                                  </span>
                                );
                              })}
                            </div>
                            <span className="text-[9px] text-slate-500 block mt-0.5 font-mono">
                              {item.runsToday ? "● Runs Today" : "○ Off Schedule"}
                            </span>
                          </td>

                          {/* Actual Times */}
                          <td className="py-3.5 px-4">
                            {item.actualEntryTime || item.actualExitTime ? (
                              <div className="font-mono text-xs">
                                <div className="text-purple-300 font-bold">
                                  {formatTimeString(item.actualEntryTime)} →{" "}
                                  {formatTimeString(item.actualExitTime)}
                                </div>
                                <span className="text-[10px] text-slate-400">Live Dispatch</span>
                              </div>
                            ) : (
                              <span className="text-slate-500 font-mono text-[11px]">
                                Awaiting ping
                              </span>
                            )}
                          </td>

                          {/* Status */}
                          <td className="py-3.5 px-4">
                            <span
                              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold border ${item.statusBadge}`}
                            >
                              <span className={`w-1.5 h-1.5 rounded-full ${item.statusDot}`}></span>
                              {item.statusText}
                            </span>
                          </td>

                          {/* Actions */}
                          <td className="py-3.5 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => setInspectItem(item)}
                                className="p-1.5 rounded-lg bg-brand-cockpit hover:bg-brand-primary/20 border border-brand-border text-slate-300 hover:text-white transition-colors"
                                title="Inspect Full TT Details"
                              >
                                <Eye className="w-3.5 h-3.5 text-blue-400" />
                              </button>
                              <button
                                onClick={() => handleOpenMovementModal(item)}
                                className="p-1.5 rounded-lg bg-brand-cockpit hover:bg-brand-primary/20 border border-brand-border text-slate-300 hover:text-white transition-colors"
                                title="Log / Update Live Movement"
                              >
                                <Clock className="w-3.5 h-3.5 text-emerald-400" />
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
          </section>
        </main>
      </div>

      {/* MODAL 1: Inspect Train Timetable Entry (bg-brand-card & border-brand-border) */}
      {inspectItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-brand-card border border-brand-border rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-brand-border">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-brand-primary/15 text-blue-400 border border-brand-primary/30">
                  <TrainIcon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-white">
                    {inspectItem.trainNumber} — {inspectItem.trainName}
                  </h3>
                  <span className="text-xs text-slate-400">
                    Timetable Specification #{inspectItem.scheduleId || inspectItem.id}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setInspectItem(null)}
                className="text-slate-400 hover:text-white text-lg font-bold p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Timetable Parameters Grid: bg-brand-cockpit & border-brand-border */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-brand-cockpit border border-brand-border">
                <span className="text-slate-400 block text-[10px] uppercase">Service Type</span>
                <span className="font-bold text-white mt-0.5 block">{inspectItem.trainType}</span>
              </div>
              <div className="p-3 rounded-xl bg-brand-cockpit border border-brand-border">
                <span className="text-slate-400 block text-[10px] uppercase">Priority Rating</span>
                <span className="font-bold text-amber-400 mt-0.5 block">
                  {inspectItem.priority} / 10
                </span>
              </div>
              <div className="p-3 rounded-xl bg-brand-cockpit border border-brand-border">
                <span className="text-slate-400 block text-[10px] uppercase">Section Corridor</span>
                <span className="font-bold text-white mt-0.5 block">{inspectItem.sectionName}</span>
              </div>
              <div className="p-3 rounded-xl bg-brand-cockpit border border-brand-border">
                <span className="text-slate-400 block text-[10px] uppercase">
                  Scheduled Entry (IST)
                </span>
                <span className="font-bold text-emerald-400 mt-0.5 block font-mono">
                  {inspectItem.scheduledEntryTime}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-brand-cockpit border border-brand-border">
                <span className="text-slate-400 block text-[10px] uppercase">
                  Scheduled Exit (IST)
                </span>
                <span className="font-bold text-cyan-400 mt-0.5 block font-mono">
                  {inspectItem.scheduledExitTime}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-brand-cockpit border border-brand-border">
                <span className="text-slate-400 block text-[10px] uppercase">
                  Transit Duration / Speed
                </span>
                <span className="font-bold text-white mt-0.5 block font-mono">
                  {inspectItem.durationFormatted} ({inspectItem.avgSpeedKmph} km/h)
                </span>
              </div>
            </div>

            {/* Operating Days Breakdown: bg-brand-cockpit */}
            <div className="p-3 rounded-xl bg-brand-cockpit border border-brand-border space-y-2">
              <span className="text-xs font-bold text-slate-300 block">Weekly Operating Days</span>
              <div className="flex items-center gap-2 flex-wrap">
                {DAYS_FULL.map((d, i) => {
                  const runs = inspectItem.runningDays[i] === "1";
                  return (
                    <div
                      key={d}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 ${
                        runs
                          ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                          : "bg-brand-card text-slate-600 border border-brand-border"
                      }`}
                    >
                      <span>{d}</span>
                      <span>{runs ? "✓" : "✗"}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Live Movement Dispatch Info: bg-brand-cockpit */}
            <div className="p-3 rounded-xl bg-brand-cockpit border border-brand-border space-y-1.5 text-xs">
              <span className="font-bold text-slate-300 block">Live Movement Status</span>
              <div className="grid grid-cols-2 gap-2 text-slate-300 font-mono">
                <div>
                  <span className="text-slate-500 block text-[10px]">Actual Entry Time:</span>
                  <span>{inspectItem.actualEntryTime || "Not recorded yet"}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">Actual Exit Time:</span>
                  <span>{inspectItem.actualExitTime || "Not recorded yet"}</span>
                </div>
              </div>
            </div>

            {/* Raw JSON Data */}
            <details className="text-xs">
              <summary className="text-slate-400 hover:text-slate-200 cursor-pointer font-bold mb-2">
                View Raw DRF API Payload
              </summary>
              <pre className="p-3 rounded-xl bg-brand-cockpit border border-brand-border text-[11px] font-mono text-emerald-300 overflow-x-auto">
                {JSON.stringify(
                  {
                    schedule: inspectItem.rawSchedule,
                    movement: inspectItem.rawMovement,
                    train: inspectItem.rawTrain,
                  },
                  null,
                  2
                )}
              </pre>
            </details>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setInspectItem(null)}
                className="px-4 py-2 rounded-xl bg-brand-cockpit hover:bg-brand-cardHover text-xs font-semibold text-slate-300 transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: Create Master Train Schedule (bg-brand-card & border-brand-border) */}
      {isCreateScheduleModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="bg-brand-card border border-brand-border rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-brand-border">
              <div className="flex items-center gap-2">
                <CalendarCheck className="w-5 h-5 text-emerald-400" />
                <h3 className="text-base font-bold text-white">Create Section Timetable Schedule</h3>
              </div>
              <button
                onClick={() => setIsCreateScheduleModalOpen(false)}
                className="text-slate-400 hover:text-white text-lg font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateScheduleSubmit} className="space-y-4 text-xs">
              {/* Target Section: bg-brand-cockpit */}
              <div>
                <label className="font-bold text-slate-300 block mb-1">Target Section</label>
                <input
                  type="text"
                  disabled
                  value={`${currentSection?.section_name} (${currentSection?.origin_station} → ${currentSection?.end_station})`}
                  className="w-full bg-brand-cockpit border border-brand-border text-slate-300 text-xs rounded-xl px-3 py-2 cursor-not-allowed"
                />
              </div>

              {/* Select Train: bg-brand-cockpit */}
              <div>
                <label className="font-bold text-slate-300 block mb-1">Select Train</label>
                <select
                  value={newScheduleData.train}
                  onChange={(e) =>
                    setNewScheduleData((prev) => ({ ...prev, train: Number(e.target.value) }))
                  }
                  required
                  className="w-full bg-brand-cockpit border border-brand-border text-white text-xs rounded-xl px-3 py-2 outline-none cursor-pointer"
                >
                  {trains.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.train_number} — {t.name} ({t.train_type}, Priority: {t.priority}/10)
                    </option>
                  ))}
                </select>
              </div>

              {/* Entry & Exit Times: bg-brand-cockpit */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-300 block mb-1">
                    Scheduled Entry Time (IST)
                  </label>
                  <input
                    type="time"
                    step="1"
                    value={newScheduleData.scheduled_entry_time.substring(0, 5)}
                    onChange={(e) =>
                      setNewScheduleData((prev) => ({
                        ...prev,
                        scheduled_entry_time: `${e.target.value}:00`,
                      }))
                    }
                    required
                    className="w-full bg-brand-cockpit border border-brand-border text-white text-xs rounded-xl px-3 py-2 outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-300 block mb-1">
                    Scheduled Exit Time (IST)
                  </label>
                  <input
                    type="time"
                    step="1"
                    value={newScheduleData.scheduled_exit_time.substring(0, 5)}
                    onChange={(e) =>
                      setNewScheduleData((prev) => ({
                        ...prev,
                        scheduled_exit_time: `${e.target.value}:00`,
                      }))
                    }
                    required
                    className="w-full bg-brand-cockpit border border-brand-border text-white text-xs rounded-xl px-3 py-2 outline-none font-mono"
                  />
                </div>
              </div>

              {/* Running Days Selector */}
              <div>
                <label className="font-bold text-slate-300 block mb-1.5">
                  Weekly Operating Days (Mon → Sun)
                </label>
                <div className="flex items-center gap-1.5">
                  {DAYS_FULL.map((day, idx) => {
                    const currentDays = newScheduleData.running_days || "1111111";
                    const isSet = currentDays[idx] === "1";
                    return (
                      <button
                        type="button"
                        key={day}
                        onClick={() => {
                          const arr = currentDays.split("");
                          arr[idx] = isSet ? "0" : "1";
                          setNewScheduleData((prev) => ({
                            ...prev,
                            running_days: arr.join(""),
                          }));
                        }}
                        className={`flex-1 py-1.5 rounded-lg text-center font-bold text-xs transition-colors cursor-pointer ${
                          isSet
                            ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/50"
                            : "bg-brand-cockpit text-slate-500 border border-brand-border"
                        }`}
                      >
                        {day}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-brand-border">
                <button
                  type="button"
                  onClick={() => setIsCreateScheduleModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-brand-cockpit hover:bg-brand-cardHover text-xs font-semibold text-slate-300 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createScheduleMutation.isPending}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 text-xs font-bold text-white shadow-md transition-all disabled:opacity-50 cursor-pointer"
                >
                  {createScheduleMutation.isPending ? "Creating Schedule..." : "Save Timetable Schedule"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: Log Live Train Movement (bg-brand-card & border-brand-border) */}
      {isLogMovementModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="bg-brand-card border border-brand-border rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-brand-border">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-emerald-400" />
                <h3 className="text-base font-bold text-white">Log Live Train Movement</h3>
              </div>
              <button
                onClick={() => setIsLogMovementModalOpen(false)}
                className="text-slate-400 hover:text-white text-lg font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleLogMovementSubmit} className="space-y-4 text-xs">
              {/* Select Schedule: bg-brand-cockpit */}
              <div>
                <label className="font-bold text-slate-300 block mb-1">
                  Select Timetable Schedule
                </label>
                <select
                  value={movementForm.scheduleId}
                  onChange={(e) =>
                    setMovementForm((prev) => ({
                      ...prev,
                      scheduleId: e.target.value ? Number(e.target.value) : "",
                    }))
                  }
                  required
                  className="w-full bg-brand-cockpit border border-brand-border text-white text-xs rounded-xl px-3 py-2 outline-none cursor-pointer"
                >
                  <option value="">-- Choose schedule --</option>
                  {timetableItems.map((item) => (
                    <option key={item.id} value={item.scheduleId || ""}>
                      {item.trainNumber} — {item.trainName} ({formatTimeString(item.scheduledEntryTime)} →{" "}
                      {formatTimeString(item.scheduledExitTime)})
                    </option>
                  ))}
                </select>
              </div>

              {/* Service Date: bg-brand-cockpit */}
              <div>
                <label className="font-bold text-slate-300 block mb-1">Service Date</label>
                <input
                  type="date"
                  value={movementForm.serviceDate}
                  onChange={(e) =>
                    setMovementForm((prev) => ({ ...prev, serviceDate: e.target.value }))
                  }
                  required
                  className="w-full bg-brand-cockpit border border-brand-border text-white text-xs rounded-xl px-3 py-2 outline-none cursor-pointer"
                />
              </div>

              {/* Actual Entry & Exit Times: bg-brand-cockpit */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-300 block mb-1">
                    Actual Entry Time (IST)
                  </label>
                  <input
                    type="time"
                    value={movementForm.actualEntry}
                    onChange={(e) =>
                      setMovementForm((prev) => ({ ...prev, actualEntry: e.target.value }))
                    }
                    required
                    className="w-full bg-brand-cockpit border border-brand-border text-white text-xs rounded-xl px-3 py-2 outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-300 block mb-1">
                    Actual Exit Time (IST)
                  </label>
                  <input
                    type="time"
                    value={movementForm.actualExit}
                    onChange={(e) =>
                      setMovementForm((prev) => ({ ...prev, actualExit: e.target.value }))
                    }
                    className="w-full bg-brand-cockpit border border-brand-border text-white text-xs rounded-xl px-3 py-2 outline-none font-mono"
                  />
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-brand-border">
                <button
                  type="button"
                  onClick={() => setIsLogMovementModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-brand-cockpit hover:bg-brand-cardHover text-xs font-semibold text-slate-300 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createMovementMutation.isPending}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 text-xs font-bold text-white shadow-md transition-all disabled:opacity-50 cursor-pointer"
                >
                  {createMovementMutation.isPending ? "Logging Movement..." : "Save Movement Record"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
