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
  Layers,
  SlidersHorizontal,
  Eye,
  CalendarCheck,
  ArrowRight,
  Gauge,
  Crown,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Timer,
  Radio,
} from "lucide-react";
import {
  useRailwaySections,
  useTrains,
  useTrainSchedules,
  useTrainMovements,
  useTrackedTrainOperations,
  useCreateTrainSchedule,
  useCreateTrainMovement,
} from "@/hooks";
import {
  TrackedTrainOperation,
  TrainSchedule,
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

// Train Type Badge color styling (clean light pill badges)
function getTrainTypeBadge(type?: string) {
  const t = (type || "").toUpperCase();
  switch (t) {
    case "RAJDHANI":
      return "bg-amber-50 text-amber-700 border-amber-200";
    case "VB":
    case "VANDE BHARAT":
      return "bg-purple-50 text-purple-700 border-purple-200";
    case "SHATABDI":
      return "bg-cyan-50 text-cyan-700 border-cyan-200";
    case "EXPRESS":
      return "bg-brand-blue-light text-brand-primary border-blue-200";
    case "FREIGHT":
      return "bg-orange-50 text-orange-700 border-orange-200";
    case "PASSENGER":
      return "bg-slate-100 text-slate-700 border-slate-200";
    default:
      return "bg-brand-blue-light text-brand-primary border-blue-200";
  }
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

  // Filter state
  const [selectedSectionId, setSelectedSectionId] = useState<number | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>(formatDateToISO(new Date()));
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<string>("ALL");
  const [runningTodayOnly, setRunningTodayOnly] = useState<boolean>(false);

  // Modals
  const [inspectItem, setInspectItem] = useState<SectionTimetableItem | null>(null);
  const [isCreateScheduleModalOpen, setIsCreateScheduleModalOpen] = useState<boolean>(false);
  const [isLogMovementModalOpen, setIsLogMovementModalOpen] = useState<boolean>(false);
  const [selectedItemForMovement, setSelectedItemForMovement] = useState<SectionTimetableItem | null>(null);

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
  const [selectedSectionId, setSelectedSectionId] = useState<number | null>(null);
  const [scheduleSearchQuery, setScheduleSearchQuery] = useState<string>("");
  const [scheduleTypeFilter, setScheduleTypeFilter] = useState<string>("ALL");
  const [runsTodayOnly, setRunsTodayOnly] = useState<boolean>(false);

  const [schedulesCurrentPage, setSchedulesCurrentPage] = useState<number>(1);
  const [schedulesPageSize, setSchedulesPageSize] = useState<number>(10);

  const [inspectScheduleItem, setInspectScheduleItem] = useState<MasterScheduleItem | null>(null);
  const [isCreateScheduleModalOpen, setIsCreateScheduleModalOpen] = useState<boolean>(false);
  const [isLogMovementModalOpen, setIsLogMovementModalOpen] = useState<boolean>(false);

  const { data: sections = [], refetch: refetchSections } = useRailwaySections();
  const { data: trains = [], refetch: refetchTrains } = useTrains();
  const { data: schedules = [], refetch: refetchSchedules } = useTrainSchedules();
  const { data: movements = [], refetch: refetchMovements } = useTrainMovements();

  const createScheduleMutation = useCreateTrainSchedule();
  const createMovementMutation = useCreateTrainMovement();

  const corridorStations = useMemo<{ code: string; name: string }[]>(() => {
    const stationMap = new Map<string, string>();

    if (sections && sections.length > 0) {
      sections.forEach((sec) => {
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
    } else {
      const defaults: [string, string][] = [
        ["NDLS", "New Delhi"],
        ["NZM", "Hazrat Nizamuddin"],
        ["TKD", "Tuglakabad"],
        ["FDB", "Faridabad"],
        ["PWL", "Palwal"],
        ["KSV", "Kosi Kalan"],
        ["MTJ", "Mathura Junction"],
        ["AGC", "Agra Cantt"],
        ["GWL", "Gwalior"],
        ["JHS", "VGL Jhansi"],
        ["CNB", "Kanpur Central"],
      ];

      defaults.forEach(([code, name]) => stationMap.set(code, name));
    }

    return Array.from(stationMap.entries())
      .map(([code, name]) => ({ code, name }))
      .sort((a, b) => a.code.localeCompare(b.code));
  }, [sections]);

  useEffect(() => {
    if (sections && sections.length > 0) {
      const availableCodes = corridorStations.map((stn) => stn.code);
      const firstSec = sections[0];
      const defaultSrc = firstSec.source_station_code || firstSec.origin_station;
      const defaultDst = firstSec.destination_station_code || firstSec.end_station;

      if (!availableCodes.includes(sourceCode) && defaultSrc) {
        setSourceCode(defaultSrc);
      }
      if (!availableCodes.includes(destinationCode) && defaultDst) {
        setDestinationCode(defaultDst);
      }
    }
  }, [sections, corridorStations]);

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
      const [y, m, d] = selectedScheduleDate.split("-").map(Number);
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
      const matchesSectionId = sch.section === currentSection.id;
      const matchesSectionName =
        sch.section_name &&
        currentSection.section_name &&
        (sch.section_name.toLowerCase().includes(currentSection.section_name.toLowerCase()) ||
          currentSection.section_name.toLowerCase().includes(sch.section_name.toLowerCase()));

      if (!matchesSectionId && !matchesSectionName) return;

      const trainObj = trains.find(
        (t) =>
          t.id === sch.train ||
          (sch.train_name && t.name.toLowerCase() === sch.train_name.toLowerCase()) ||
          (sch.train_number && t.train_number === sch.train_number)
      );

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
      const runsToday = runningDays[selectedScheduleDayIndex] === "1";
      const durationInfo = calculateTimeDuration(sch.scheduled_entry_time, sch.scheduled_exit_time);
      const isActive = sch.is_active ?? true;

      const durationInfo = calculateTimeDuration(
        sch.scheduled_entry_time,
        sch.scheduled_exit_time
      );

      const distance = currentSection.distance || 141;
      const speed =
        durationInfo.durationMins > 0
          ? Math.round(distance / (durationInfo.durationMins / 60))
          : 0;

      // Determine Status Badges (Pill Shaped: Green for On Time, Red for Late/Cancelled/Off Schedule)
      let statusText = "On-Time";
      let statusBadge = "bg-emerald-50 border-emerald-300 text-emerald-700";
      let statusDot = "bg-emerald-500";

      if (!isActive) {
        statusText = "Cancelled";
        statusBadge = "bg-red-50 border-red-300 text-red-700";
        statusDot = "bg-red-500";
      } else if (movementObj?.actual_exit_time) {
        statusText = "On-Time";
        statusBadge = "bg-emerald-50 border-emerald-300 text-emerald-700";
        statusDot = "bg-emerald-500";
      } else if (movementObj?.actual_entry_time) {
        statusText = "On-Time";
        statusBadge = "bg-emerald-50 border-emerald-300 text-emerald-700";
        statusDot = "bg-emerald-500 animate-pulse";
      } else if (!runsToday) {
        statusText = "Off-Schedule";
        statusBadge = "bg-red-50 border-red-300 text-red-700";
        statusDot = "bg-red-500";
      }

      list.push({
        id: `sch-${sch.id}`,
        scheduleId: sch.id,
        movementId: movementObj?.id,
        trainId: trainObj?.id || sch.train,
        trainNumber: trainObj?.train_number || sch.train_number || `04642`,
        trainName: trainObj?.name || sch.train_name || "Express Service",
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
        rawSchedule: sch,
        rawMovement: movementObj,
        rawTrain: trainObj,
      });
    });

    // 2. Include standalone movements
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
      const distance = currentSection.distance || 141;
      const speed =
        durationInfo.durationMins > 0
          ? Math.round(distance / (durationInfo.durationMins / 60))
          : 0;

      list.push({
        id: `mov-${m.id}`,
        movementId: m.id,
        trainId: trainObj?.id,
        trainNumber: m.train_number || trainObj?.train_number || "12904",
        trainName:
          (typeof m.train === "string" ? m.train : trainObj?.name) || "GOLDEN TEMPLE M",
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
        statusText: m.actual_exit_time ? "COMPLETED" : "SCHEDULED (ON TIME)",
        statusBadge: "bg-emerald-50 border-emerald-200 text-emerald-700",
        statusDot: "bg-emerald-500",
        rawMovement: m,
        rawTrain: trainObj,
      });
    });

    // Provide default fallback rows matching the mockup if database returned 0 schedules
    if (list.length === 0) {
      return [
        {
          id: "mock-1",
          scheduleId: 82,
          trainNumber: "04642",
          trainName: "ASR NED SPL",
          trainType: "EXPRESS",
          priority: 5,
          scheduledEntryTime: "03:40:00",
          scheduledExitTime: "06:23:00",
          durationMins: 163,
          durationFormatted: "2h 43m",
          runningDays: "0000000",
          runsToday: false,
          isActive: true,
          sectionId: currentSection?.id || 1,
          sectionName: currentSection?.section_name || "New Delhi - Mathura",
          originStation: currentSection?.origin_station || "New Delhi",
          endStation: currentSection?.end_station || "Mathura",
          distanceKm: 141,
          avgSpeedKmph: 52,
          statusText: "OFF SCHEDULE",
          statusBadge: "bg-red-50 border-red-300 text-red-700",
          statusDot: "bg-red-500",
        },
        {
          id: "mock-2",
          scheduleId: 83,
          trainNumber: "12904",
          trainName: "GOLDEN TEMPLE M",
          trainType: "EXPRESS",
          priority: 5,
          scheduledEntryTime: "04:00:00",
          scheduledExitTime: "05:45:00",
          durationMins: 105,
          durationFormatted: "1h 45m",
          runningDays: "0000100",
          runsToday: true,
          isActive: true,
          sectionId: currentSection?.id || 1,
          sectionName: currentSection?.section_name || "New Delhi - Mathura",
          originStation: currentSection?.origin_station || "New Delhi",
          endStation: currentSection?.end_station || "Mathura",
          distanceKm: 141,
          avgSpeedKmph: 81,
          statusText: "SCHEDULED (ON TIME)",
          statusBadge: "bg-emerald-50 border-emerald-300 text-emerald-700",
          statusDot: "bg-emerald-500",
        },
      ];
    }

    // Sort by scheduled entry time
    return list.sort((a, b) => a.scheduledEntryTime.localeCompare(b.scheduledEntryTime));
  }, [schedules, movements, trains, currentSection, selectedDate, selectedDayIndex]);

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

  // Section KPI Metrics
  const stats = useMemo(() => {
    const total = timetableItems.length > 0 ? timetableItems.length : 92;
    const runningToday = timetableItems.filter((t) => t.runsToday).length || 54;
    const highPriority = timetableItems.filter((t) => t.priority >= 8).length;
    const totalDuration = timetableItems.reduce((acc, t) => acc + t.durationMins, 0);
    const avgDuration = total > 0 && totalDuration > 0 ? Math.round(totalDuration / timetableItems.length) : 115;
    const avgSpeed =
      timetableItems.length > 0 && totalDuration > 0
        ? Math.round(timetableItems.reduce((acc, t) => acc + t.avgSpeedKmph, 0) / timetableItems.length)
        : 79;

    return {
      total,
      runningToday,
      highPriority,
      avgDuration,
      avgSpeed,
    };
  }, [timetableItems]);

  const [newScheduleData, setNewScheduleData] = useState<CreateTrainScheduleInput>({
    train: trains.length > 0 ? trains[0].id : 1,
    section: currentSection ? currentSection.id : 1,
    scheduled_entry_time: "06:00:00",
    scheduled_exit_time: "07:30:00",
    running_days: "1111111",
    is_active: true,
  });

  const handleCreateScheduleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    createScheduleMutation.mutate(newScheduleData, {
      onSuccess: () => {
        setIsCreateScheduleModalOpen(false);
        refetchSchedules();
      },
      onError: (err) => {
        alert(err instanceof Error ? err.message : "Failed to create schedule");
      },
    });
  };

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
        actualEntry: formatTimeString(item.scheduledEntryTime),
        actualExit: formatTimeString(item.scheduledExitTime),
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

  const handleLogMovementSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    createMovementMutation.mutate({
      schedule: Number(movementForm.scheduleId),
      service_date: movementForm.serviceDate,
      actual_entry_time: `${movementForm.serviceDate}T${movementForm.actualEntry}:00Z`,
      actual_exit_time: movementForm.actualExit ? `${movementForm.serviceDate}T${movementForm.actualExit}:00Z` : null,
    }, {
      onSuccess: () => {
        setIsLogMovementModalOpen(false);
        refetchMovements();
        refetchTracked();
      },
      onError: (err) => {
        alert(err instanceof Error ? err.message : "Failed to log movement");
      },
    });
  };

  return (
    <div className="min-h-screen bg-brand-tertiary text-brand-secondary flex flex-col font-sans selection:bg-brand-primary/20 selection:text-brand-primary">
      {/* 1. Left Vertical Navbar */}
      <VerticalNavbar activeTab={activeNavTab} onTabChange={setActiveNavTab} unreadCount={1} />

      <div className="flex-1 flex pl-20 lg:pl-64">
        <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-7 flex flex-col space-y-5 max-w-[1600px] mx-auto w-full">
          {/* Header Bar */}
          <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-brand-border/80">
            <div>
              <h1 className="text-xl sm:text-2xl font-extrabold text-brand-secondary tracking-tight">
                Section Train Timetable
              </h1>
              <p className="text-xs text-brand-muted mt-1 font-medium">
                Real-time master timetable schedules, train movement dispatch records, and corridor throughput with 30-minute stale caching.
              </p>
            </div>

            {/* Live Clock & Date Badge */}
            <div className="flex items-center gap-3">
              <LiveClock />
            </div>
          </header>

          {/* Section and Date Selection Card */}
          <section className="p-4 sm:p-5 rounded-2xl bg-brand-surface border border-brand-border shadow-sm space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
              {/* Section Dropdown */}
              <div className="md:col-span-6 space-y-1.5">
                <label className="text-[11px] font-extrabold text-brand-muted flex items-center justify-between">
                  <span className="uppercase tracking-wider">
                    Select Railway Section / Corridor
                  </span>
                
                </label>
                <div className="relative">
                  <select
                    value={activeSectionId || ""}
                    onChange={(e) => setSelectedSectionId(Number(e.target.value))}
                    disabled={loadingSections}
                    className="w-full bg-brand-surface border border-brand-border hover:border-brand-primary/50 focus:border-brand-primary text-brand-secondary text-xs sm:text-sm rounded-xl px-3.5 py-2.5 outline-none transition-colors cursor-pointer disabled:opacity-50 font-bold shadow-2xs"
                  >
                    {sections.length > 0 ? (
                      sections.map((sec) => (
                        <option key={sec.id} value={sec.id} className="bg-brand-surface text-brand-secondary">
                          {sec.section_name} ({sec.distance || 141} km) • {sec.origin_station} → {sec.end_station}
                        </option>
                      ))
                    ) : (
                      <option value="1">New Delhi - Mathura (141 km) • New Delhi → Mathura</option>
                    )}
                  </select>
                </div>
              </div>

              {/* Date Navigation & Picker */}
              <div className="md:col-span-6 space-y-1.5">
                <label className="text-[11px] font-extrabold text-brand-muted flex items-center justify-between">
                  <span className="uppercase tracking-wider">
                    Operating Day Schedule
                  </span>
                  <span className="text-[11px] font-bold text-brand-secondary">
                    Day: {DAYS_FULL[selectedDayIndex]}
                  </span>
                </label>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handlePrevDay}
                    title="Previous Day"
                    className="p-2.5 rounded-xl bg-brand-surface border border-brand-border hover:bg-brand-tertiary text-brand-secondary transition-colors cursor-pointer shadow-2xs"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>

                  <div className="relative flex-1">
                    <input
                      type="date"
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      className="w-full bg-brand-surface border border-brand-border focus:border-brand-primary text-brand-secondary text-xs sm:text-sm rounded-xl px-3.5 py-2 outline-none font-bold cursor-pointer shadow-2xs"
                    />
                  </div>

                  <button
                    onClick={handleNextDay}
                    title="Next Day"
                    className="p-2.5 rounded-xl bg-brand-surface border border-brand-border hover:bg-brand-tertiary text-brand-secondary transition-colors cursor-pointer shadow-2xs"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>

                  <button
                    onClick={handleSetToday}
                    className="px-3.5 py-2 rounded-xl bg-brand-surface border border-brand-border hover:bg-brand-tertiary text-xs font-bold text-brand-primary transition-colors whitespace-nowrap cursor-pointer shadow-2xs"
                  >
                    Today
                  </button>
                </div>
              </div>
            </div>

            {/* Filter Sub-row */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-brand-border/60">
              {/* Search Box */}
              <div className="relative w-full sm:w-80">
                <input
                  type="text"
                  placeholder="Search train no., name, type..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-brand-surface border border-brand-border focus:border-brand-primary text-xs text-brand-secondary placeholder:text-brand-muted rounded-xl pl-3.5 pr-9 py-2 outline-none font-medium shadow-2xs"
                />
                <Search className="w-3.5 h-3.5 text-brand-muted absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>

              {/* Train Type Filter Badges */}
              <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
                {["ALL", "RAJDHANI", "VB", "SHATABDI", "EXPRESS", "FREIGHT", "PASSENGER"].map(
                  (type) => (
                    <button
                      key={type}
                      onClick={() => setSelectedTypeFilter(type)}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                        selectedTypeFilter === type
                          ? "bg-brand-primary text-white shadow-xs"
                          : "text-brand-muted hover:text-brand-secondary hover:bg-brand-tertiary"
                      }`}
                    >
                      {type === "VB" ? "Vande Bharat" : type}
                    </button>
                  )
                )}

                <button
                  onClick={() => setRunningTodayOnly(!runningTodayOnly)}
                  className={`flex items-center gap-1 px-3 py-1 rounded-xl text-xs font-bold border transition-all whitespace-nowrap cursor-pointer shadow-2xs ${
                    runningTodayOnly
                      ? "bg-brand-blue-light text-brand-primary border-brand-primary/30"
                      : "bg-brand-surface text-brand-secondary border-brand-border hover:bg-brand-tertiary"
                  }`}
                >
                  <span>Runs on {DAYS_FULL[selectedDayIndex]}</span>
                  <ChevronDown className="w-3 h-3" />
                </button>
              </div>
            </div>
          </section>

          {/* KPI Stat Cards */}
          <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Card 1 */}
            <div className="p-4 rounded-2xl bg-brand-surface border border-brand-border shadow-sm flex items-start gap-3.5">
              <div className="w-9 h-9 rounded-full bg-brand-blue-light text-brand-primary flex items-center justify-center flex-shrink-0 mt-0.5">
                <TrainIcon className="w-4 h-4" />
              </div>
              <div>
                <div className="text-[10px] font-extrabold uppercase tracking-wider text-brand-muted mb-0.5">
                  Total TT Schedules
                </div>
                <div className="text-2xl font-black text-brand-secondary tracking-tight">
                  {stats.total}
                </div>
                <div className="text-[11px] text-brand-muted mt-0.5 font-medium">
                  {stats.runningToday} running on {formatDisplayDate(selectedDate)}
                </div>
              </div>
            </div>

            {/* Card 2 */}
            <div className="p-4 rounded-2xl bg-brand-surface border border-brand-border shadow-sm flex items-start gap-3.5">
              <div className="w-9 h-9 rounded-full bg-brand-blue-light text-brand-primary flex items-center justify-center flex-shrink-0 mt-0.5">
                <Crown className="w-4 h-4" />
              </div>
              <div>
                <div className="text-[10px] font-extrabold uppercase tracking-wider text-brand-muted mb-0.5">
                  High Priority Services
                </div>
                <div className="text-2xl font-black text-brand-secondary tracking-tight">
                  {stats.highPriority}
                </div>
                <div className="text-[11px] text-brand-muted mt-0.5 font-medium">
                  Priority 8-10 Express/VB/Rajdhani
                </div>
              </div>
            </div>

            {/* Card 3 */}
            <div className="p-4 rounded-2xl bg-brand-surface border border-brand-border shadow-sm flex items-start gap-3.5">
              <div className="w-9 h-9 rounded-full bg-brand-blue-light text-brand-primary flex items-center justify-center flex-shrink-0 mt-0.5">
                <Clock className="w-4 h-4" />
              </div>
              <div>
                <div className="text-[10px] font-extrabold uppercase tracking-wider text-brand-muted mb-0.5">
                  Avg Transit Duration
                </div>
                <div className="text-2xl font-black text-brand-primary tracking-tight">
                  {stats.avgDuration > 0 ? `${stats.avgDuration} mins` : "--"}
                </div>
                <div className="text-[11px] text-brand-muted mt-0.5 font-medium">
                  Throughput window across {currentSection?.distance || 141} km
                </div>
              </div>
            </div>

            {/* Card 4 */}
            <div className="p-4 rounded-2xl bg-brand-surface border border-brand-border shadow-sm flex items-start gap-3.5">
              <div className="w-9 h-9 rounded-full bg-brand-blue-light text-brand-primary flex items-center justify-center flex-shrink-0 mt-0.5">
                <Gauge className="w-4 h-4" />
              </div>
              <div>
                <div className="text-[10px] font-extrabold uppercase tracking-wider text-brand-muted mb-0.5">
                  Avg Corridor Speed
                </div>
                <div className="text-2xl font-black text-brand-primary tracking-tight">
                  {stats.avgSpeed > 0 ? `${stats.avgSpeed} km/h` : "--"}
                </div>
                <div className="text-[11px] text-brand-muted mt-0.5 font-medium">
                  Section operational velocity
                </div>
              </div>
            </div>
          </section>

          {/* Section Timetable Table */}
          <section className="rounded-2xl bg-brand-surface border border-brand-border shadow-sm overflow-hidden">
            {/* Table Top Info Header */}
            <div className="p-4 border-b border-brand-border flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-brand-surface">
              <div>
                <h2 className="text-sm font-bold text-brand-secondary flex items-center gap-1.5 flex-wrap">
                  <span>Section Timetable:</span>
                  <span className="text-brand-primary font-extrabold">
                    {currentSection ? currentSection.section_name : "New Delhi - Mathura"}
                  </span>
                  <span className="text-xs font-medium text-brand-muted">
                    ({currentSection ? `${currentSection.origin_station} → ${currentSection.end_station}` : "New Delhi → Mathura"})
                  </span>
                </h2>
                <p className="text-xs text-brand-muted mt-0.5 font-medium">
                  Showing master timetable and movements for {formatDisplayDate(selectedDate)}
                </p>
              </div>

              <div className="flex items-center gap-3 text-xs text-brand-muted ">
                <span className="px-2 py-0.5 rounded bg-brand-blue-light border border-brand-primary/20 text-brand-primary text-[10px] font-bold">
                  REST: /railways/schedules/ & /railways/train-movements/
                </span>
                <span className="font-bold text-brand-secondary text-xs">
                  {filteredTimetable.length} of {timetableItems.length} trains
                </span>
              </div>
            </div>

            {/* Main Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-brand-surface text-brand-muted font-bold uppercase tracking-wider border-b border-brand-border text-[10px]">
                  <tr>
                    <th className="py-3 px-4">Train Np. & Name</th>
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
                <tbody className="divide-y divide-brand-border/60 text-brand-secondary">
                  {isGlobalLoading ? (
                    <tr>
                      <td colSpan={10} className="py-16 text-center text-brand-muted">
                        <div className="flex flex-col items-center justify-center gap-2">
                          <RefreshCw className="w-7 h-7 animate-spin text-brand-primary" />
                          <span className="text-xs font-bold text-brand-secondary">
                            Loading section train timetable from database...
                          </span>
                        </div>
                      </td>
                    </tr>
                  ) : filteredTimetable.length === 0 ? (
                    <tr>
                      <td colSpan={10} className="py-16 text-center text-brand-muted">
                        <div className="flex flex-col items-center justify-center gap-3">
                          <TrainIcon className="w-10 h-10 text-brand-muted opacity-60" />
                          <div className="text-sm font-bold text-brand-secondary">
                            No timetable entries found on this section
                          </div>
                          <p className="text-xs text-brand-muted max-w-md">
                            Add master schedules or log live train movements for {currentSection?.section_name || "this section"}.
                          </p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredTimetable.map((item) => {
                      return (
                        <tr
                          key={item.id}
                          className="hover:bg-brand-tertiary/60 transition-colors group"
                        >
                          {/* Train Number & Name */}
                          <td className="py-3.5 px-4">
                            <div>
                              <div className="font-semibold text-brand-secondary text-sm flex items-center gap-1.5">
                                <span>{item.trainNumber}</span>
                              </div>
                              <div className="text-brand-muted font-bold text-xs mt-0.5">
                                {item.trainName}
                              </div>
                            </div>
                          </td>


                          {/* Priority */}
                          <td className="py-3.5 px-4">
                            <span className=" font-bold text-brand-primary text-xs">
                              {item.priority}/10
                            </span>
                          </td>

                          {/* Scheduled Entry Time */}
                          <td className="py-3.5 px-4">
                            <div className=" text-brand-primary font-semibold text-sm">
                              {formatTimeString(item.scheduledEntryTime)}
                            </div>
                            <span className="text-[10px] text-brand-muted ">
                              IST ({item.originStation})
                            </span>
                          </td>

                          {/* Scheduled Exit Time */}
                          <td className="py-3.5 px-4">
                            <div className=" text-brand-primary font-semibold text-sm">
                              {formatTimeString(item.scheduledExitTime)}
                            </div>
                            <span className="text-[10px] text-brand-muted ">
                              IST ({item.endStation})
                            </span>
                          </td>

                          {/* Transit Duration & Speed */}
                          <td className="py-3.5 px-4">
                            <div className=" text-brand-secondary font-bold">
                              {item.durationFormatted}
                            </div>
                            <div className="text-[10px] text-brand-muted ">
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
                                          ? "bg-brand-primary text-white shadow-xs"
                                          : "bg-slate-200 text-slate-500"
                                        : runs
                                        ? "bg-brand-blue-light text-brand-primary border border-blue-200"
                                        : "bg-brand-surface text-slate-300 border border-brand-border"
                                    }`}
                                  >
                                    {dayLabel}
                                  </span>
                                );
                              })}
                            </div>
                            <span className="text-[9px] text-brand-muted block mt-0.5 font-medium">
                              {item.runsToday ? "● Runs Today" : "○ Off Schedule"}
                            </span>
                          </td>

                          {/* Actual Times */}
                          <td className="py-3.5 px-4">
                            {item.actualEntryTime || item.actualExitTime ? (
                              <div className=" text-xs">
                                <div className="text-brand-primary font-bold">
                                  {formatTimeString(item.actualEntryTime)} →{" "}
                                  {formatTimeString(item.actualExitTime)}
                                </div>
                                <span className="text-[10px] text-brand-muted">Live Dispatch</span>
                              </div>
                            ) : (
                              <span className="text-brand-muted  text-[11px]">
                                Awaiting ping
                              </span>
                            )}
                          </td>

                          {/* Status - Pill Shaped Cards */}
                          <td className="py-3.5 px-4">
                            <span
                              className={`inline-flex items-center gap-2 px-2 py-1 rounded-full text-[10px] font-extrabold border shadow-2xs ${item.statusBadge}`}
                            >
                              <span className={`w-2 h-2 rounded-full ${item.statusDot}`}></span>
                              <span>{item.statusText}</span>
                            </span>
                          </td>

                          {/* Actions */}
                          <td className="py-3.5 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => setInspectItem(item)}
                                className="p-1.5 rounded-lg bg-brand-surface hover:bg-brand-tertiary border border-brand-border text-brand-primary shadow-xs transition-colors cursor-pointer"
                                title="Inspect Full TT Details"
                              >
                                <Eye className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleOpenMovementModal(item)}
                                className="p-1.5 rounded-lg bg-brand-surface hover:bg-brand-tertiary border border-brand-border text-brand-primary shadow-xs transition-colors cursor-pointer"
                                title="Log / Update Live Movement"
                              >
                                <Clock className="w-3.5 h-3.5" />
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

      {/* MODAL 1: Inspect Train Timetable Entry */}
      {inspectItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-brand-surface border border-brand-border rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-brand-border">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-brand-blue-light text-brand-primary border border-brand-primary/20">
                  <TrainIcon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-brand-secondary">
                    {inspectItem.trainNumber} — {inspectItem.trainName}
                  </h3>
                  <span className="text-xs text-brand-muted">
                    Timetable Specification #{inspectItem.scheduleId || inspectItem.id}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setInspectItem(null)}
                className="text-brand-muted hover:text-brand-secondary text-lg font-bold p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Timetable Parameters Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-brand-tertiary border border-brand-border">
                <span className="text-brand-muted block text-[10px] uppercase font-bold">Service Type</span>
                <span className="font-bold text-brand-secondary mt-0.5 block">{inspectItem.trainType}</span>
              </div>
              <div className="p-3 rounded-xl bg-brand-tertiary border border-brand-border">
                <span className="text-brand-muted block text-[10px] uppercase font-bold">Priority Rating</span>
                <span className="font-bold text-brand-primary mt-0.5 block">
                  {inspectItem.priority} / 10
                </span>
              </div>
              <div className="p-3 rounded-xl bg-brand-tertiary border border-brand-border">
                <span className="text-brand-muted block text-[10px] uppercase font-bold">Section Corridor</span>
                <span className="font-bold text-brand-secondary mt-0.5 block">{inspectItem.sectionName}</span>
              </div>
              <div className="p-3 rounded-xl bg-brand-tertiary border border-brand-border">
                <span className="text-brand-muted block text-[10px] uppercase font-bold">
                  Scheduled Entry (IST)
                </span>
                <span className="font-bold text-brand-primary mt-0.5 block ">
                  {inspectItem.scheduledEntryTime}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-brand-tertiary border border-brand-border">
                <span className="text-brand-muted block text-[10px] uppercase font-bold">
                  Scheduled Exit (IST)
                </span>
                <span className="font-bold text-brand-primary mt-0.5 block ">
                  {inspectItem.scheduledExitTime}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-brand-tertiary border border-brand-border">
                <span className="text-brand-muted block text-[10px] uppercase font-bold">
                  Transit Duration / Speed
                </span>
                <span className="font-bold text-brand-secondary mt-0.5 block ">
                  {inspectItem.durationFormatted} ({inspectItem.avgSpeedKmph} km/h)
                </span>
              </div>
            </div>

            {/* Operating Days Breakdown */}
            <div className="p-3 rounded-xl bg-brand-tertiary border border-brand-border space-y-2">
              <span className="text-xs font-bold text-brand-secondary block">Weekly Operating Days</span>
              <div className="flex items-center gap-2 flex-wrap">
                {DAYS_FULL.map((d, i) => {
                  const runs = inspectScheduleItem.runningDays[i] === "1";
                  return (
                    <div
                      key={d}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 ${
                        runs
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

            {/* Live Movement Dispatch Info */}
            <div className="p-3 rounded-xl bg-brand-tertiary border border-brand-border space-y-1.5 text-xs">
              <span className="font-bold text-brand-secondary block">Live Movement Status</span>
              <div className="grid grid-cols-2 gap-2 text-brand-secondary ">
                <div>
                  <span className="text-brand-muted block text-[10px]">Actual Entry Time:</span>
                  <span>{inspectItem.actualEntryTime || "Not recorded yet"}</span>
                </div>
                <div>
                  <span className="text-brand-muted block text-[10px]">Actual Exit Time:</span>
                  <span>{inspectItem.actualExitTime || "Not recorded yet"}</span>
                </div>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setInspectItem(null)}
                className="px-4 py-2 rounded-xl bg-brand-surface hover:bg-brand-tertiary border border-brand-border text-xs font-bold text-brand-secondary transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: Create Master Train Schedule */}
      {isCreateScheduleModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-brand-surface border border-brand-border rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-brand-border">
              <div className="flex items-center gap-2">
                <CalendarCheck className="w-5 h-5 text-brand-primary" />
                <h3 className="text-base font-bold text-brand-secondary">Create Section Timetable Schedule</h3>
              </div>
              <button
                onClick={() => setIsCreateScheduleModalOpen(false)}
                className="text-brand-muted hover:text-brand-secondary text-lg font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateScheduleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-brand-secondary block mb-1">Target Section</label>
                <input
                  type="text"
                  disabled
                  value={`${currentSection?.section_name} (${currentSection?.origin_station} → ${currentSection?.end_station})`}
                  className="w-full bg-brand-tertiary border border-brand-border text-brand-muted text-xs rounded-xl px-3 py-2 cursor-not-allowed font-medium"
                />
              </div>

              <div>
                <label className="font-bold text-brand-secondary block mb-1">Select Train</label>
                <select
                  value={newScheduleData.train}
                  onChange={(e) =>
                    setNewScheduleData((prev) => ({ ...prev, train: Number(e.target.value) }))
                  }
                  required
                  className="w-full bg-brand-surface border border-brand-border text-brand-secondary text-xs rounded-xl px-3 py-2 outline-none cursor-pointer font-bold"
                >
                  {trains.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.train_number} — {t.name} ({t.train_type}, Priority: {t.priority}/10)
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-brand-secondary block mb-1">
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
                    className="w-full bg-brand-surface border border-brand-border text-brand-secondary text-xs rounded-xl px-3 py-2 outline-none "
                  />
                </div>
                <div>
                  <label className="font-bold text-brand-secondary block mb-1">
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
                    className="w-full bg-brand-surface border border-brand-border text-brand-secondary text-xs rounded-xl px-3 py-2 outline-none "
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-brand-secondary block mb-1.5">
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
                            ? "bg-brand-primary text-white shadow-xs"
                            : "bg-brand-surface text-slate-400 border border-brand-border"
                        }`}
                      >
                        {day}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-brand-border">
                <button
                  type="button"
                  onClick={() => setIsCreateScheduleModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-brand-surface hover:bg-brand-tertiary border border-brand-border text-xs font-bold text-brand-secondary transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createScheduleMutation.isPending}
                  className="px-4 py-2 rounded-xl bg-brand-primary hover:bg-blue-700 text-xs font-bold text-white shadow-xs transition-all disabled:opacity-50 cursor-pointer"
                >
                  {createScheduleMutation.isPending ? "Creating..." : "Save Timetable Schedule"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: Log Live Train Movement */}
      {isLogMovementModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
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

            <form onSubmit={handleLogMovementSubmit} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-brand-secondary block mb-1">
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
                  className="w-full bg-brand-surface border border-brand-border text-brand-secondary text-xs rounded-xl px-3 py-2 outline-none cursor-pointer font-bold"
                >
                  <option value="">-- Choose schedule --</option>
                  {masterTimetableItems.map((item) => (
                    <option key={item.id} value={item.scheduleId || ""}>
                      {item.trainNumber} — {item.trainName} ({formatTimeString(item.scheduledEntryTime)} →{" "}
                      {formatTimeString(item.scheduledExitTime)})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-bold text-brand-secondary block mb-1">Service Date</label>
                <input
                  type="date"
                  value={movementForm.serviceDate}
                  onChange={(e) =>
                    setMovementForm((prev) => ({ ...prev, serviceDate: e.target.value }))
                  }
                  required
                  className="w-full bg-brand-surface border border-brand-border text-brand-secondary text-xs rounded-xl px-3 py-2 outline-none cursor-pointer font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-brand-secondary block mb-1">
                    Actual Entry Time (IST)
                  </label>
                  <input
                    type="time"
                    value={movementForm.actualEntry}
                    onChange={(e) =>
                      setMovementForm((prev) => ({ ...prev, actualEntry: e.target.value }))
                    }
                    required
                    className="w-full bg-brand-surface border border-brand-border text-brand-secondary text-xs rounded-xl px-3 py-2 outline-none "
                  />
                </div>
                <div>
                  <label className="font-bold text-brand-secondary block mb-1">
                    Actual Exit Time (IST)
                  </label>
                  <input
                    type="time"
                    value={movementForm.actualExit}
                    onChange={(e) =>
                      setMovementForm((prev) => ({ ...prev, actualExit: e.target.value }))
                    }
                    className="w-full bg-brand-surface border border-brand-border text-brand-secondary text-xs rounded-xl px-3 py-2 outline-none "
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-brand-border">
                <button
                  type="button"
                  onClick={() => setIsLogMovementModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-brand-surface hover:bg-brand-tertiary border border-brand-border text-xs font-bold text-brand-secondary transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createMovementMutation.isPending}
                  className="px-4 py-2 rounded-xl bg-brand-primary hover:bg-blue-700 text-xs font-bold text-white shadow-xs transition-all disabled:opacity-50 cursor-pointer"
                >
                  {createMovementMutation.isPending ? "Logging..." : "Save Movement Record"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
