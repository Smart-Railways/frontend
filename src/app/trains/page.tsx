"use client";

import React, { useState, useMemo, useEffect } from "react";
import { VerticalNavbar } from "@/components/navigation/vertical-navbar";
import { LiveClock } from "@/components/ui/live-clock";
import {
  Train as TrainIcon,
  Search,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Eye,
  Radio,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  useRailwaySections,
  useTrainMovements,
} from "@/hooks";
import {
  RailwaySection,
  TrainMovement,
  Train,
  TrainSchedule,
} from "@/types";
import { TrainType } from "@/enums";
import {
  formatTrainTimeIST,
  formatDateToISO,
  formatDelayMetric,
  calculateTimeDuration,
} from "@/lib/time-utils";
import { getTrainTypeTheme } from "@/lib/train-theme";
import { validateDate, clampDate } from "@/lib/date-schemas";
import {
  TrainsPageSkeleton,
  TrackedTrainsTableSkeleton,
} from "./skeletons";

function getYesterdayISO(): string {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return formatDateToISO(yesterday);
}

function normaliseSearchText(value: unknown): string {
  return String(value ?? "")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

const DAYS_FULL = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

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
  const [activeViewMode] = useState<"all" | "tracked" | "schedules">("all");
  const [scheduleDateError, setScheduleDateError] = useState<string | null>(null);
  const [trackedSectionId, setTrackedSectionId] = useState<number>(1);
  const [sourceCode, setSourceCode] = useState<string>("NDLS");
  const [destinationCode, setDestinationCode] = useState<string>("MTJ");
  const [movementDate, setMovementDate] = useState<string>(() => formatDateToISO(new Date()));
  const [trackedSearchQuery, setTrackedSearchQuery] = useState<string>("");
  const [inspectTrackedTrain, setInspectTrackedTrain] = useState<TrainMovement | null>(null);

  const [trackedCurrentPage, setTrackedCurrentPage] = useState<number>(1);
  const [trackedPageSize, setTrackedPageSize] = useState<number>(10);

  const [selectedScheduleDate, setSelectedScheduleDate] = useState<string>(formatDateToISO(new Date()));
  const [selectedSectionId, setSelectedSectionId] = useState<number | null>(1);
  const [scheduleSearchQuery, setScheduleSearchQuery] = useState<string>("");
  const [scheduleTypeFilter, setScheduleTypeFilter] = useState<string>("ALL");
  const [runsTodayOnly, setRunsTodayOnly] = useState<boolean>(false);
  const [schedulesCurrentPage, setSchedulesCurrentPage] = useState<number>(1);
  const [schedulesPageSize] = useState<number>(10);
  const [inspectScheduleItem, setInspectScheduleItem] = useState<MasterScheduleItem | null>(null);

  const { data: sections = [], isLoading: loadingSections } = useRailwaySections();
  // This screen only renders live movements. These placeholders keep the
  // unused timetable modal inert without issuing trains or train-schedules calls.
  const trains: Train[] = [];
  const schedules: TrainSchedule[] = [];
  const movementQueryParams = useMemo(
    () => ({
      date: movementDate,
      from: sourceCode,
      to: destinationCode,
      page: trackedSearchQuery.trim() ? 1 : trackedCurrentPage,
      page_size: trackedSearchQuery.trim() ? 100 : trackedPageSize,
    }),
    [movementDate, sourceCode, destinationCode, trackedCurrentPage, trackedPageSize, trackedSearchQuery]
  );
  const {
    data: movementsData,
    isLoading: loadingMovements,
    isFetching: fetchingMovements,
    isRefetching: refetchingMovements,
    refetch: refetchMovements,
  } = useTrainMovements(movementQueryParams);

  const availableSections = useMemo<RailwaySection[]>(() => {
    return sections || [];
  }, [sections]);

  const currentTrackedSection = useMemo<RailwaySection | null>(() => {
    if (availableSections.length === 0) return null;
    return (
      availableSections.find((s: RailwaySection) => s.id === trackedSectionId) ||
      availableSections[0]
    );
  }, [availableSections, trackedSectionId]);

  const handleSelectTrackedSection = (secId: number) => {
    setTrackedSectionId(secId);
    setTrackedCurrentPage(1);
    const sec = availableSections.find((s: RailwaySection) => s.id === secId);
    if (sec) {
      const src = sec.source_station_code || sec.origin_station || "NDLS";
      const dst = sec.destination_station_code || sec.end_station || "MTJ";
      setSourceCode(src);
      setDestinationCode(dst);
    }
  };

  const isPageLoading = loadingSections;

  const selectedScheduleDayIndex = useMemo(() => {
    const [year, month, day] = selectedScheduleDate.split("-").map(Number);
    return (new Date(year, month - 1, day).getDay() + 6) % 7;
  }, [selectedScheduleDate]);


  const filteredTrackedTrains = useMemo<TrainMovement[]>(() => {
    const rawList = movementsData?.results || [];
    if (!trackedSearchQuery.trim()) return rawList;
    const words = normaliseSearchText(trackedSearchQuery).split(" ").filter(Boolean);
    return rawList.filter((t) => {
      const searchableText = normaliseSearchText([
        t.train_number,
        t.train,
        t.train_name,
        t.section,
        t.section_name,
        t.service_date,
        t.status_label,
        t.delay_minutes === 0 ? "on time" : t.delay_minutes == null ? "live status unavailable" : `${t.delay_minutes} min delay`,
        t.scheduled_entry_time,
        t.scheduled_exit_time,
      ].join(" "));
      return words.every((word) => searchableText.includes(word));
    });
  }, [movementsData, trackedSearchQuery]);

  const isSearchingTrackedTrains = Boolean(trackedSearchQuery.trim());
  const totalTrackedCount = isSearchingTrackedTrains ? filteredTrackedTrains.length : (movementsData?.count ?? 0);
  const totalTrackedPages = Math.max(1, Math.ceil(totalTrackedCount / trackedPageSize));
  const displayedTrackedTrains = isSearchingTrackedTrains
    ? filteredTrackedTrains.slice(
        (trackedCurrentPage - 1) * trackedPageSize,
        trackedCurrentPage * trackedPageSize
      )
    : filteredTrackedTrains;

  const masterTimetableItems = useMemo<MasterScheduleItem[]>(() => {
    if (!schedules) return [];
    return schedules.map((sch: any) => {
      // Extract nested train object if sch.train or sch.train_details is an object
      const nestedTrain = typeof sch.train === "object" && sch.train !== null
        ? sch.train
        : typeof sch.train_details === "object" && sch.train_details !== null
        ? sch.train_details
        : null;

      const targetTrainId = nestedTrain?.id ?? sch.train;
      const targetTrainNum = nestedTrain?.train_number ?? sch.train_number ?? (typeof sch.train === "string" ? sch.train : undefined);

      // Find matching train object in trains store using coerced string comparison
      const trainObj = trains.find((t) => {
        if (targetTrainId !== undefined && targetTrainId !== null && String(t.id) === String(targetTrainId)) return true;
        if (targetTrainNum && String(t.train_number) === String(targetTrainNum)) return true;
        return false;
      });

      // Resolve train number, name, type, and priority with robust fallback hierarchy
      const resolvedTrainNumber = String(
        nestedTrain?.train_number ||
        trainObj?.train_number ||
        sch.train_number ||
        sch.train_code ||
        (typeof sch.train === "string" || typeof sch.train === "number" ? sch.train : "---")
      );

      const resolvedTrainName = String(
        nestedTrain?.name ||
        nestedTrain?.train_name ||
        trainObj?.name ||
        (trainObj as any)?.train_name ||
        sch.train_name ||
        sch.name ||
        "Express"
      );

      const resolvedTrainType = String(
        nestedTrain?.train_type ||
        trainObj?.train_type ||
        sch.train_type ||
        TrainType.EXPRESS
      );

      const resolvedPriority = Number(
        nestedTrain?.priority ??
        trainObj?.priority ??
        sch.priority ??
        5
      );

      const runningDays = sch.running_days || "1111111";
      const runsToday = runningDays[selectedScheduleDayIndex] === "1";
      const durationInfo = calculateTimeDuration(sch.scheduled_entry_time, sch.scheduled_exit_time);
      const isActive = sch.is_active ?? true;
      let statusText = "Runs Today";
      let statusBadge = "bg-emerald-50 border-emerald-300 text-emerald-700";
      let statusDot = "bg-emerald-500";
      if (!isActive) { statusText = "Suspended"; statusBadge = "bg-red-50 border-red-300 text-red-700"; statusDot = "bg-red-500"; }
      else if (!runsToday) { statusText = "Off-Schedule"; statusBadge = "bg-slate-100 border-slate-300 text-slate-600"; statusDot = "bg-slate-400"; }

      const secObj = availableSections.find((s) => String(s.id) === String(sch.section));
      const resolvedSectionName = secObj?.section_name || (sch.section_name && !/^\d+$/.test(sch.section_name) ? sch.section_name : sch.section ? `Corridor ${sch.section}` : "Corridor");

      return {
        id: `sch-${sch.id}`,
        scheduleId: sch.id,
        trainId: trainObj?.id ?? nestedTrain?.id,
        trainNumber: resolvedTrainNumber,
        trainName: resolvedTrainName,
        trainType: resolvedTrainType,
        priority: resolvedPriority,
        scheduledEntryTime: sch.scheduled_entry_time,
        scheduledExitTime: sch.scheduled_exit_time,
        durationMins: durationInfo.durationMins,
        durationFormatted: durationInfo.formatted,
        runningDays,
        runsToday,
        isActive,
        sectionId: sch.section,
        sectionName: resolvedSectionName,
        statusText,
        statusBadge,
        statusDot,
      };
    }).sort((a, b) => a.scheduledEntryTime.localeCompare(b.scheduledEntryTime));
  }, [schedules, trains, selectedScheduleDayIndex, availableSections]);

  const filteredSchedules = useMemo(() => {
    return masterTimetableItems.filter((item) => {
      if (runsTodayOnly && !item.runsToday) return false;
      if (scheduleTypeFilter !== "ALL") {
        if (scheduleTypeFilter === "TEJAS") {
          if (!String(item.trainName || "").toUpperCase().includes("TEJAS")) return false;
        } else {
          if (item.trainType !== scheduleTypeFilter) return false;
        }
      }
      if (scheduleSearchQuery.trim()) {
        const q = scheduleSearchQuery.toLowerCase().trim();
        const words = q.split(/\s+/).filter(Boolean);
        const searchableText = `${item.trainNumber} ${item.trainName} ${item.sectionName} ${item.trainType} ${item.scheduleId}`.toLowerCase();
        
        return words.every((word) => searchableText.includes(word));
      }
      return true;
    });
  }, [masterTimetableItems, runsTodayOnly, scheduleTypeFilter, scheduleSearchQuery]);

  useEffect(() => {
    setSchedulesCurrentPage(1);
  }, [scheduleSearchQuery, scheduleTypeFilter, runsTodayOnly, selectedSectionId, selectedScheduleDate]);

  // Backend already paginates; we only apply local filters (search/type/runsToday) on the current page.
  // Do NOT slice again — use filteredSchedules directly for rendering.
  const paginatedSchedules = filteredSchedules;

  const totalScheduleCount = masterTimetableItems.length;
  const totalSchedulePages = Math.max(1, Math.ceil(totalScheduleCount / schedulesPageSize));

  const scheduleStats = useMemo(() => {
    const total = totalScheduleCount;
    const runningToday = masterTimetableItems.filter((t) => t.runsToday).length;
    const highPriority = masterTimetableItems.filter((t) => t.priority >= 8).length;
    return { total, runningToday, highPriority };
  }, [totalScheduleCount, masterTimetableItems]);

  if (isPageLoading) {
    return (
      <div className="min-h-screen bg-brand-tertiary flex flex-col font-sans">
        <VerticalNavbar activeTab={activeNavTab} onTabChange={setActiveNavTab} unreadCount={1} />
        <TrainsPageSkeleton />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-tertiary text-brand-secondary flex flex-col font-sans">
      <VerticalNavbar activeTab={activeNavTab} onTabChange={setActiveNavTab} unreadCount={1} />

      <div className="flex-1 flex pl-0 lg:pl-64 pt-14 lg:pt-0 animate-fade-in-up">
        <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-7 flex flex-col space-y-6 max-w-[1680px] mx-auto w-full">
          <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-brand-border/80 animate-fade-in-down">
            <div>
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-brand-secondary/80 text-white flex items-center justify-center shadow-xs transition-transform duration-300 hover:scale-105">
                  <TrainIcon className="w-4 h-4" />
                </div>
                <h1 className="text-xl sm:text-2xl font-bold text-brand-secondary tracking-tight">Train Operations & Schedules</h1>
              </div>
            </div>
            <div className="hidden lg:flex items-center gap-2.5">
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
                
              </div>

              <div className="p-4 rounded-xl bg-brand-tertiary/70 border border-brand-border/70 space-y-3.5">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
                  <div className="md:col-span-4 space-y-1">
                    <label className="text-[10px] font-extrabold text-brand-muted tracking-wider flex items-center justify-between">
                      <span>Service Date</span>
                    </label>
                    <input
                      type="date"
                      value={movementDate}
                      min={getYesterdayISO()}
                      max={formatDateToISO(new Date())}
                      onChange={(e) => {
                        setMovementDate(e.target.value);
                        setTrackedCurrentPage(1);
                      }}
                      className="h-10 w-full bg-brand-surface border border-brand-border text-brand-secondary text-xs rounded-xl px-3 outline-none font-bold cursor-pointer"
                    />
                  </div>

                  <div className="md:col-span-6 space-y-1">
                    <label className="text-[10px] font-extrabold text-brand-muted tracking-wider flex items-center justify-between">
                      <span>Railway Corridor Section</span>
                    </label>
                    <Select
                      value={String(currentTrackedSection?.id ?? "")}
                      onValueChange={(val) => val && handleSelectTrackedSection(Number(val))}
                    >
                      <SelectTrigger className="h-10 w-full bg-brand-surface border border-brand-border hover:border-brand-primary/50 text-xs text-brand-secondary font-bold rounded-xl px-3.5 outline-none cursor-pointer shadow-2xs">
                        <SelectValue placeholder="Select section...">
                          {currentTrackedSection ? currentTrackedSection.section_name : undefined}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent className="bg-brand-surface border-brand-border text-brand-secondary max-h-60 overflow-y-auto shadow-xl rounded-xl p-1.5">
                        {availableSections.map((sec: RailwaySection) => (
                          <SelectItem
                            key={sec.id}
                            value={String(sec.id)}
                            className="rounded-lg px-3 py-2 text-xs font-medium cursor-pointer focus:bg-brand-blue-light/50 focus:text-brand-primary"
                          >
                            {sec.section_name} ({sec.source_station_code || sec.origin_station} → {sec.destination_station_code || sec.end_station})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Refresh Button */}
                  <div className="md:col-span-2 flex justify-end">
                    <button
                      onClick={() => refetchMovements()}
                      disabled={refetchingMovements || loadingMovements}
                      className="h-10 w-full px-4 rounded-xl bg-brand-primary hover:bg-blue-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer shadow-sm transition-all disabled:opacity-60"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${refetchingMovements ? "animate-spin" : ""}`} />
                      <span>{refetchingMovements ? "Refreshing..." : "Refresh"}</span>
                    </button>
                  </div>
                </div>

                {/* Search input sub-row for Tracked Trains */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 border-t border-brand-border/60">
                  <div className="relative w-full sm:w-72">
                    <input
                      type="text"
                      placeholder="Search tracked train no., name, type..."
                      value={trackedSearchQuery}
                      onChange={(e) => {
                        setTrackedSearchQuery(e.target.value);
                        setTrackedCurrentPage(1);
                      }}
                      className="w-full bg-brand-surface border border-brand-border focus:border-brand-primary text-xs text-brand-secondary placeholder:text-brand-muted rounded-xl pl-3 pr-8 py-1.5 outline-none font-medium shadow-2xs"
                    />
                    {trackedSearchQuery ? (
                      <button
                      onClick={() => {
                        setTrackedSearchQuery("");
                        setTrackedCurrentPage(1);
                      }}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-brand-muted hover:text-brand-secondary text-xs font-bold cursor-pointer"
                        title="Clear search"
                      >
                        ✕
                      </button>
                    ) : (
                      <Search className="w-3.5 h-3.5 text-brand-muted absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    )}
                  </div>
                </div>
              </div>

              <div className="overflow-x-auto border border-brand-border/80 rounded-xl">
                <table className="w-full text-left text-xs">
                  <thead className="bg-brand-surface text-brand-muted font-bold tracking-wider border-b border-brand-border text-[10px] lg:text-[12px]">
                    <tr>
                      <th className="py-3 px-4">Train No. & Name</th>
                      <th className="py-3 px-4">Section</th>
                      <th className="py-3 px-4 font-semibold">Scheduled</th>
                      <th className="py-3 px-4">Actual</th>
                      <th className="py-3 px-4 text-center">Delay (IST)</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-brand-border/60 text-brand-secondary">
                    {(loadingMovements || fetchingMovements || refetchingMovements) ? (
                      <TrackedTrainsTableSkeleton count={5} />
                    ) : filteredTrackedTrains.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-12 text-center text-brand-muted">
                          <div className="flex flex-col items-center justify-center gap-2 max-w-md mx-auto">
                            <TrainIcon className="w-8 h-8 text-brand-muted opacity-50" />
                            <div className="text-sm font-bold text-brand-secondary">No live train movements found</div>
                            <p className="text-xs text-brand-muted">
                              No live movements are available for corridor {sourceCode} → {destinationCode}.
                            </p>
                         
                          </div>
                        </td>
                      </tr>
                    ) : (
                      displayedTrackedTrains.map((item) => {
                        const theme = getTrainTypeTheme(undefined, String(item.train));
                        const delayObj = formatDelayMetric(item.delay_minutes ?? null);
                        return (
                          <tr key={item.id} className="hover:bg-brand-tertiary/60">
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-2.5">
                                <div className={`w-1.5 h-8 rounded-full ${theme.lineColor}`} />
                                <div>
                                  <div className="font-bold text-sm">{item.train_number}</div>
                                  <div className="text-brand-muted font-medium text-xs">{String(item.train || "Train")}</div>
                                </div>
                              </div>
                            </td>
                            <td className="py-3 px-4 font-semibold">{String(item.section || currentTrackedSection?.section_name || "Corridor")}</td>
                            <td className="py-3 px-4 font-mono font-semibold">{formatTrainTimeIST(item.scheduled_entry_time)} → {formatTrainTimeIST(item.scheduled_exit_time)}</td>
                            <td className="py-3 px-4 font-mono font-semibold">{formatTrainTimeIST(item.actual_entry_time ?? item.estimated_entry_time)} → {formatTrainTimeIST(item.actual_exit_time ?? item.estimated_exit_time)}</td>
                            <td className="py-3 px-4 text-center">
                              <span className={`inline-flex items-center justify-center whitespace-nowrap px-2.5 py-1 rounded-full text-[10px] font-extrabold border ${delayObj.badgeClass}`}>
                                {delayObj.text}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-right">
                              <div className="flex items-center justify-end gap-2">
                               
                                <button onClick={() => setInspectTrackedTrain(item)} className="p-1.5 rounded-lg bg-brand-surface border border-brand-border hover:bg-brand-tertiary text-black shadow-xs transition-colors cursor-pointer">
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

              {totalTrackedCount > 0 && (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 text-xs">
                  <div className="flex items-center gap-2 text-brand-muted font-medium">
                    <span>
                      Showing{" "}
                      <strong className="text-brand-secondary">
                        {displayedTrackedTrains.length ? (trackedCurrentPage - 1) * trackedPageSize + 1 : 0}
                      </strong>{" "}
                      to{" "}
                      <strong className="text-brand-secondary">
                        {Math.min(trackedCurrentPage * trackedPageSize, totalTrackedCount)}
                      </strong>{" "}
                      of{" "}
                      <strong className="text-brand-secondary">
                        {totalTrackedCount}
                      </strong>{" "}
                      {isSearchingTrackedTrains ? "matching live train movements" : "live train movements"}
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
                      disabled={isSearchingTrackedTrains ? trackedCurrentPage === 1 : !movementsData?.previous || fetchingMovements}
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
                      disabled={isSearchingTrackedTrains ? trackedCurrentPage === totalTrackedPages : !movementsData?.next || fetchingMovements}
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
          <div className="bg-brand-surface border border-brand-border rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto animate-scale-in">
            <div className="flex items-center justify-between pb-3 border-b border-brand-border">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <Radio className="w-5 h-5 animate-pulse" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-brand-secondary">
                    {inspectTrackedTrain.train_number} — {String(inspectTrackedTrain.train || "Train")}
                  </h3>
                  <span className="text-xs text-brand-muted">
                    Live movement • {String(inspectTrackedTrain.section || currentTrackedSection?.section_name || "Corridor")}
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
                <span className="text-brand-muted block text-[10px] uppercase font-bold">Service Date</span>
                <span className="font-bold text-brand-secondary mt-0.5 block">{inspectTrackedTrain.service_date || "Unavailable"}</span>
              </div>
              <div className="p-3 rounded-xl bg-brand-tertiary border border-brand-border">
                <span className="text-brand-muted block text-[10px] uppercase font-bold">Live Status</span>
                <span className="font-bold text-brand-primary mt-0.5 block">{inspectTrackedTrain.status_label || "Live status unavailable"}</span>
              </div>
              <div className="p-3 rounded-xl bg-brand-tertiary border border-brand-border">
                <span className="text-brand-muted block text-[10px] uppercase font-bold">Corridor Section</span>
                <span className="font-bold text-brand-secondary mt-0.5 block">
                  {String(inspectTrackedTrain.section || currentTrackedSection?.section_name || "Corridor")}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-brand-tertiary border border-brand-border">
                <span className="text-brand-muted block text-[10px] uppercase font-bold">Scheduled Entry</span>
                <span className="font-bold text-brand-primary mt-0.5 block font-mono">{formatTrainTimeIST(inspectTrackedTrain.scheduled_entry_time)}</span>
              </div>
              <div className="p-3 rounded-xl bg-brand-tertiary border border-brand-border">
                <span className="text-brand-muted block text-[10px] uppercase font-bold">Scheduled Exit</span>
                <span className="font-bold text-brand-primary mt-0.5 block font-mono">{formatTrainTimeIST(inspectTrackedTrain.scheduled_exit_time)}</span>
              </div>
              <div className="p-3 rounded-xl bg-brand-tertiary border border-brand-border">
                <span className="text-brand-muted block text-[10px] uppercase font-bold">Delay Offset</span>
                <span className={`font-bold mt-0.5 block ${inspectTrackedTrain.delay_minutes == null ? "text-slate-600" : inspectTrackedTrain.delay_minutes > 0 ? "text-red-600" : "text-emerald-600"}`}>
                  {formatDelayMetric(inspectTrackedTrain.delay_minutes ?? null).text}
                </span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-brand-tertiary border border-brand-border space-y-2 text-xs">
              <span className="font-bold text-brand-secondary block">Actual Movement Timestamps (IST)</span>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <span className="text-brand-muted block text-[10px]">Actual Entry Time:</span>
                  <span className=" text-brand-secondary font-bold">
                    {formatTrainTimeIST(inspectTrackedTrain.actual_entry_time, "Not logged yet")}
                  </span>
                </div>
                <div>
                  <span className="text-brand-muted block text-[10px]">Actual Exit Time:</span>
                  <span className=" text-brand-secondary font-bold">
                    {formatTrainTimeIST(inspectTrackedTrain.actual_exit_time, "Not logged yet")}
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

    </div>
  );
}
