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
} from "lucide-react";
import {
  useRailwaySections,
  useTrains,
  useTrainMovements,
  useCreateTrainMovement,
} from "@/hooks";
import { CreateTrainMovementInput } from "@/types";

// Helper to format date as YYYY-MM-DD
function formatDateToISO(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

// Helper to format date display (e.g. "03 Sep 2026")
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

// Helper to format time (e.g. "17:40:00" or "2026-09-03 17:40:00" -> "17:40 IST")
function formatTimeOnly(dateTimeStr: string): string {
  if (!dateTimeStr) return "--:--";
  const parts = dateTimeStr.split(" ");
  const timePart = parts.length > 1 ? parts[1] : parts[0];
  return timePart.substring(0, 5);
}

// Calculate duration in minutes between two timestamps
function calculateDuration(entry: string, exit: string): number | null {
  try {
    const d1 = new Date(entry.replace(" ", "T")).getTime();
    const d2 = new Date(exit.replace(" ", "T")).getTime();
    if (isNaN(d1) || isNaN(d2)) return null;
    return Math.max(0, Math.round((d2 - d1) / 60000));
  } catch {
    return null;
  }
}

// Train Type Badge color styling
function getTrainTypeBadge(type?: string) {
  const t = (type || "").toUpperCase();
  switch (t) {
    case "RAJDHANI":
      return "bg-amber-500/15 text-amber-300 border-amber-500/30";
    case "VB":
    case "VANDE BHARAT":
      return "bg-purple-500/15 text-purple-300 border-purple-500/30";
    case "SHATABDI":
      return "bg-cyan-500/15 text-cyan-300 border-cyan-500/30";
    case "EXPRESS":
      return "bg-emerald-500/15 text-emerald-300 border-emerald-500/30";
    case "FREIGHT":
      return "bg-orange-500/15 text-orange-300 border-orange-500/30";
    default:
      return "bg-blue-500/15 text-blue-300 border-blue-500/30";
  }
}

export default function TrainsPage() {
  // Navigation active tab
  const [activeNavTab, setActiveNavTab] = useState<string>("trains");

  // Filter state
  const [selectedSectionId, setSelectedSectionId] = useState<number | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>(formatDateToISO(new Date()));
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<string>("ALL");

  // TanStack Query: Fetch data reactively without manual useEffect / state management
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
    data: movements = [],
    isLoading: loadingMovements,
    isRefetching: refetchingMovements,
    refetch: refetchMovements,
  } = useTrainMovements();

  // TanStack Query: Mutation for adding train movements with auto-invalidation
  const createMovementMutation = useCreateTrainMovement();

  // UI state for logging movement modal
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [formTrainId, setFormTrainId] = useState<number | "">("");
  const [formEntryTime, setFormEntryTime] = useState<string>("08:00");
  const [formExitTime, setFormExitTime] = useState<string>("08:35");

  // Auto-select first section when loaded if not yet set
  const activeSectionId = selectedSectionId ?? (sections.length > 0 ? sections[0].id : null);

  const isGlobalLoading = loadingSections || loadingTrains || loadingMovements;
  const isGlobalRefetching = refetchingSections || refetchingTrains || refetchingMovements;

  const handleRefresh = () => {
    refetchSections();
    refetchTrains();
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

  // Currently selected section object
  const currentSection = useMemo(() => {
    return sections.find((s) => s.id === activeSectionId) || sections[0] || null;
  }, [sections, activeSectionId]);

  // Filtered train movements for this section and this day
  const filteredMovements = useMemo(() => {
    if (!activeSectionId) return [];

    return movements
      .filter((m) => {
        // 1. Filter by section
        if (m.section !== activeSectionId) return false;

        // 2. Filter by date (matches entry_time or exit_time)
        const entryDate = m.entry_time ? m.entry_time.substring(0, 10) : "";
        const exitDate = m.exit_time ? m.exit_time.substring(0, 10) : "";
        const matchesDate = entryDate === selectedDate || exitDate === selectedDate;
        if (!matchesDate) return false;

        // 3. Filter by search query (train number or train name)
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchesNumber = m.train_number?.toLowerCase().includes(q);
          const matchesName = m.train_name?.toLowerCase().includes(q);
          if (!matchesNumber && !matchesName) return false;
        }

        // 4. Filter by train type
        if (selectedTypeFilter !== "ALL") {
          const trainObj = trains.find((t) => t.id === m.train || t.train_number === m.train_number);
          if (trainObj && trainObj.train_type !== selectedTypeFilter) {
            return false;
          }
        }

        return true;
      })
      .sort((a, b) => {
        const timeA = a.entry_time || "";
        const timeB = b.entry_time || "";
        return timeA.localeCompare(timeB);
      });
  }, [movements, activeSectionId, selectedDate, searchQuery, selectedTypeFilter, trains]);

  // Statistics for the selected section & day
  const stats = useMemo(() => {
    const totalTrains = filteredMovements.length;
    let highPriorityCount = 0;
    let totalDuration = 0;

    filteredMovements.forEach((m) => {
      const trainObj = trains.find((t) => t.id === m.train || t.train_number === m.train_number);
      if (trainObj && trainObj.priority >= 8) {
        highPriorityCount++;
      }
      const dur = calculateDuration(m.entry_time, m.exit_time);
      if (dur) totalDuration += dur;
    });

    const avgDuration = totalTrains > 0 ? Math.round(totalDuration / totalTrains) : 0;

    return {
      totalTrains,
      highPriorityCount,
      avgDuration,
    };
  }, [filteredMovements, trains]);

  // Add movement form submission using TanStack mutation
  const handleAddMovement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeSectionId || !formTrainId || !formEntryTime || !formExitTime) {
      alert("Please fill in all fields.");
      return;
    }

    const entryFormatted = `${selectedDate} ${formEntryTime}:00`;
    const exitFormatted = `${selectedDate} ${formExitTime}:00`;

    const input: CreateTrainMovementInput = {
      section: activeSectionId,
      train: Number(formTrainId),
      entry_time: entryFormatted,
      exit_time: exitFormatted,
    };

    createMovementMutation.mutate(input, {
      onSuccess: () => {
        setIsAddModalOpen(false);
        setFormTrainId("");
      },
      onError: (error) => {
        alert(error instanceof Error ? error.message : "Failed to add train movement.");
      },
    });
  };

  return (
    <div className="min-h-screen bg-[#070b13] text-slate-100 flex flex-col font-sans selection:bg-emerald-500/30 selection:text-emerald-200">
      {/* 1. Left Vertical Navbar */}
      <VerticalNavbar
        activeTab={activeNavTab}
        onTabChange={setActiveNavTab}
        unreadCount={3}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex pl-20 lg:pl-64">
        <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-7 flex flex-col space-y-6 max-w-[1500px] mx-auto w-full">
          
          {/* Header */}
          <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#172642]/60">
            <div>
              <div className="flex items-center gap-2.5">
                <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-500/15 border border-blue-500/30 text-blue-400 shadow-sm shadow-blue-950">
                  <TrainIcon className="w-4 h-4" />
                </div>
                <div>
                  <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
                    Section Train Timetable
                  </h1>
                </div>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Real-time train movements, timetable schedules, and corridor occupancy powered by TanStack Query.
              </p>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-2.5 flex-wrap">
              <button
                onClick={handleRefresh}
                disabled={isGlobalRefetching}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#0d1527] hover:bg-[#121d36] border border-[#172642] text-xs text-slate-300 transition-colors disabled:opacity-50 cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 text-blue-400 ${isGlobalRefetching ? "animate-spin" : ""}`} />
                <span>{isGlobalRefetching ? "Refreshing..." : "Refresh"}</span>
              </button>

              <button
                onClick={() => setIsAddModalOpen(true)}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-semibold shadow-md shadow-emerald-950/40 border border-emerald-400/30 transition-all cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Log Movement</span>
              </button>
            </div>
          </header>

          {/* Section and Date Selection Bar */}
          <section className="p-4 rounded-2xl bg-[#0d1527]/90 border border-[#172642] shadow-xl backdrop-blur-sm space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
              
              {/* Section Dropdown */}
              <div className="md:col-span-6 space-y-1.5">
                <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5 uppercase tracking-wider">
                  <Layers className="w-3.5 h-3.5 text-emerald-400" />
                  Select Railway Section / Corridor
                </label>
                <div className="relative">
                  <select
                    value={activeSectionId || ""}
                    onChange={(e) => setSelectedSectionId(Number(e.target.value))}
                    disabled={loadingSections}
                    className="w-full bg-[#070b13] border border-[#1e3256] focus:border-emerald-500 text-white text-sm rounded-xl px-3.5 py-2.5 outline-none transition-colors appearance-none cursor-pointer disabled:opacity-50"
                  >
                    {sections.map((sec) => (
                      <option key={sec.id} value={sec.id} className="bg-[#070b13] text-white">
                        {sec.section_name} ({sec.distance} km) • {sec.origin_station} → {sec.end_station}
                      </option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-400">
                    <SlidersHorizontal className="w-4 h-4" />
                  </div>
                </div>
              </div>

              {/* Date Navigation & Picker */}
              <div className="md:col-span-6 space-y-1.5">
                <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5 uppercase tracking-wider">
                  <CalendarIcon className="w-3.5 h-3.5 text-blue-400" />
                  Operating Day Schedule
                </label>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handlePrevDay}
                    title="Previous Day"
                    className="p-2.5 rounded-xl bg-[#070b13] border border-[#1e3256] hover:bg-[#121d36] text-slate-300 hover:text-white transition-colors cursor-pointer"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>

                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="flex-1 bg-[#070b13] border border-[#1e3256] focus:border-blue-500 text-white text-sm rounded-xl px-3.5 py-2 outline-none font-medium cursor-pointer"
                  />

                  <button
                    onClick={handleNextDay}
                    title="Next Day"
                    className="p-2.5 rounded-xl bg-[#070b13] border border-[#1e3256] hover:bg-[#121d36] text-slate-300 hover:text-white transition-colors cursor-pointer"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>

                  <button
                    onClick={handleSetToday}
                    className="px-3 py-2 rounded-xl bg-[#070b13] border border-[#1e3256] hover:bg-[#121d36] text-xs font-semibold text-blue-400 hover:text-blue-300 transition-colors whitespace-nowrap cursor-pointer"
                  >
                    Today
                  </button>
                </div>
              </div>
            </div>

            {/* Filter Sub-row */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-[#172642]/60">
              {/* Search Box */}
              <div className="relative w-full sm:w-80">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search train no. or name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-[#070b13] border border-[#1e3256] focus:border-emerald-500 text-xs text-white rounded-xl pl-9 pr-3 py-2 outline-none"
                />
              </div>

              {/* Train Type Filter Badges */}
              <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
                {["ALL", "RAJDHANI", "VB", "SHATABDI", "EXPRESS", "FREIGHT"].map((type) => (
                  <button
                    key={type}
                    onClick={() => setSelectedTypeFilter(type)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border transition-all whitespace-nowrap cursor-pointer ${
                      selectedTypeFilter === type
                        ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/50 shadow-sm"
                        : "bg-[#070b13] text-slate-400 border-[#172642] hover:text-slate-200"
                    }`}
                  >
                    {type === "VB" ? "Vande Bharat" : type}
                  </button>
                ))}
              </div>
            </div>
          </section>

          {/* KPI Stat Cards for Section & Day */}
          <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl bg-gradient-to-br from-[#0d1527] to-[#070b13] border border-[#172642]">
              <div className="flex items-center justify-between text-slate-400 mb-1">
                <span className="text-xs font-semibold uppercase tracking-wider">Scheduled Trains</span>
                <TrainIcon className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="text-2xl font-black text-white">{stats.totalTrains}</div>
              <div className="text-[11px] text-slate-400 mt-1">
                For {formatDisplayDate(selectedDate)}
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-gradient-to-br from-[#0d1527] to-[#070b13] border border-[#172642]">
              <div className="flex items-center justify-between text-slate-400 mb-1">
                <span className="text-xs font-semibold uppercase tracking-wider">High Priority Services</span>
                <Zap className="w-4 h-4 text-amber-400" />
              </div>
              <div className="text-2xl font-black text-amber-300">{stats.highPriorityCount}</div>
              <div className="text-[11px] text-slate-400 mt-1">Priority 8+ Trains</div>
            </div>

            <div className="p-4 rounded-2xl bg-gradient-to-br from-[#0d1527] to-[#070b13] border border-[#172642]">
              <div className="flex items-center justify-between text-slate-400 mb-1">
                <span className="text-xs font-semibold uppercase tracking-wider">Avg Transit Time</span>
                <Clock className="w-4 h-4 text-blue-400" />
              </div>
              <div className="text-2xl font-black text-blue-300">
                {stats.avgDuration > 0 ? `${stats.avgDuration}m` : "--"}
              </div>
              <div className="text-[11px] text-slate-400 mt-1">Throughput duration</div>
            </div>

          </section>

          {/* Trains Table Section */}
          <section className="rounded-2xl bg-[#0d1527] border border-[#172642] shadow-2xl overflow-hidden">
            {/* Table Header Bar */}
            <div className="p-4 border-b border-[#172642] flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-[#09101d]">
              <div>
                <h2 className="text-sm font-bold text-white flex items-center gap-2">
                  <span>Scheduled Trains on Section:</span>
                  <span className="text-emerald-400 font-extrabold">
                    {currentSection ? currentSection.section_name : "Loading..."}
                  </span>
                </h2>
                <p className="text-xs text-slate-400">
                  Showing movements on {formatDisplayDate(selectedDate)}
                </p>
              </div>

              <div className="text-xs text-slate-400 font-mono">
                {filteredMovements.length} {filteredMovements.length === 1 ? "train" : "trains"} found
              </div>
            </div>

            {/* Main Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#070b13]/80 text-slate-400 font-bold uppercase tracking-wider border-b border-[#172642]">
                  <tr>
                    <th className="py-3 px-4">Train Number & Name</th>
                    <th className="py-3 px-4">Type</th>
                    <th className="py-3 px-4">Priority</th>
                    <th className="py-3 px-4">Entry Time (IST)</th>
                    <th className="py-3 px-4">Exit Time (IST)</th>
                    <th className="py-3 px-4">Transit Time</th>
                    <th className="py-3 px-4">Section Corridor</th>
                    <th className="py-3 px-4 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#172642]/60">
                  {isGlobalLoading ? (
                    <tr>
                      <td colSpan={8} className="py-12 text-center text-slate-400">
                        <div className="flex flex-col items-center justify-center gap-2">
                          <RefreshCw className="w-6 h-6 animate-spin text-blue-400" />
                          <span>Loading section train timetable via TanStack Query...</span>
                        </div>
                      </td>
                    </tr>
                  ) : filteredMovements.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-12 text-center text-slate-400">
                        <div className="flex flex-col items-center justify-center gap-3">
                          <TrainIcon className="w-10 h-10 text-slate-600" />
                          <div className="text-sm font-bold text-slate-300">
                            No scheduled trains found for this section on {formatDisplayDate(selectedDate)}
                          </div>
                          <p className="text-xs text-slate-500 max-w-md">
                            Try selecting another date, clearing filters, or log a new train movement schedule.
                          </p>
                          <button
                            onClick={() => setIsAddModalOpen(true)}
                            className="mt-2 flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#121d36] hover:bg-[#1a2b4f] border border-[#1e3256] text-xs font-semibold text-emerald-400 transition-colors cursor-pointer"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            Log Movement for this Day
                          </button>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredMovements.map((movement) => {
                      const trainObj = trains.find(
                        (t) => t.id === movement.train || t.train_number === movement.train_number
                      );
                      const duration = calculateDuration(movement.entry_time, movement.exit_time);
                      const trainType = trainObj?.train_type || "EXPRESS";
                      const priority = trainObj?.priority || 5;

                      return (
                        <tr
                          key={movement.id}
                          className="hover:bg-[#121d36]/60 transition-colors group"
                        >
                          {/* Train Number & Name */}
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-2.5">
                              <div className="w-8 h-8 rounded-lg bg-[#070b13] border border-[#1e3256] flex items-center justify-center text-blue-400 font-mono font-bold group-hover:border-blue-400/50 transition-colors">
                                <TrainIcon className="w-4 h-4" />
                              </div>
                              <div>
                                <div className="font-extrabold text-white text-sm font-mono">
                                  {movement.train_number || trainObj?.train_number || "—"}
                                </div>
                                <div className="text-slate-300 font-medium text-xs">
                                  {movement.train_name || trainObj?.name || "Train"}
                                </div>
                              </div>
                            </div>
                          </td>

                          {/* Type */}
                          <td className="py-3.5 px-4">
                            <span
                              className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-extrabold border ${getTrainTypeBadge(
                                trainType
                              )}`}
                            >
                              {trainType}
                            </span>
                          </td>

                          {/* Priority */}
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-1.5">
                              <span
                                className={`font-mono font-bold ${
                                  priority >= 8
                                    ? "text-amber-400"
                                    : priority >= 5
                                    ? "text-blue-400"
                                    : "text-slate-400"
                                }`}
                              >
                                {priority}/10
                              </span>
                              {priority >= 8 && (
                                <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                                  High
                                </span>
                              )}
                            </div>
                          </td>

                          {/* Entry Time */}
                          <td className="py-3.5 px-4">
                            <div className="font-mono text-emerald-400 font-bold">
                              {formatTimeOnly(movement.entry_time)}
                            </div>
                            <div className="text-[10px] text-slate-500">
                              {movement.entry_time ? movement.entry_time.substring(0, 10) : ""}
                            </div>
                          </td>

                          {/* Exit Time */}
                          <td className="py-3.5 px-4">
                            <div className="font-mono text-cyan-400 font-bold">
                              {formatTimeOnly(movement.exit_time)}
                            </div>
                            <div className="text-[10px] text-slate-500">
                              {movement.exit_time ? movement.exit_time.substring(0, 10) : ""}
                            </div>
                          </td>

                          {/* Transit Duration */}
                          <td className="py-3.5 px-4">
                            <span className="font-mono text-slate-300 bg-[#070b13] px-2 py-0.5 rounded border border-[#172642]">
                              {duration !== null ? `${duration} mins` : "--"}
                            </span>
                          </td>

                          {/* Section */}
                          <td className="py-3.5 px-4">
                            <div className="text-slate-300 font-medium">
                              {movement.section_name || currentSection?.section_name || "Section"}
                            </div>
                            <div className="text-[10px] text-slate-500">
                              {currentSection ? `${currentSection.origin_station} → ${currentSection.end_station}` : ""}
                            </div>
                          </td>

                          {/* Status */}
                          <td className="py-3.5 px-4 text-right">
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-950/60 text-emerald-300 border border-emerald-500/30">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                              Scheduled
                            </span>
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

      {/* Modal: Log New Train Movement */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-[#0d1527] border border-[#172642] rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#172642]">
              <div className="flex items-center gap-2">
                <TrainIcon className="w-5 h-5 text-emerald-400" />
                <h3 className="text-base font-bold text-white">Log Train Movement Schedule</h3>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-white text-lg font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddMovement} className="space-y-4">
              {/* Target Section */}
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">
                  Corridor Section
                </label>
                <input
                  type="text"
                  disabled
                  value={currentSection?.section_name || ""}
                  className="w-full bg-[#070b13] border border-[#172642] text-slate-300 text-xs rounded-xl px-3 py-2 cursor-not-allowed"
                />
              </div>

              {/* Target Date */}
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">
                  Operating Date
                </label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full bg-[#070b13] border border-[#1e3256] text-white text-xs rounded-xl px-3 py-2 outline-none cursor-pointer"
                  required
                />
              </div>

              {/* Select Train */}
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">
                  Select Train
                </label>
                <select
                  value={formTrainId}
                  onChange={(e) => setFormTrainId(Number(e.target.value))}
                  required
                  className="w-full bg-[#070b13] border border-[#1e3256] text-white text-xs rounded-xl px-3 py-2 outline-none cursor-pointer"
                >
                  <option value="">-- Choose a train --</option>
                  {trains.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.train_number} - {t.name} ({t.train_type})
                    </option>
                  ))}
                </select>
              </div>

              {/* Entry and Exit Times */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">
                    Entry Time (IST)
                  </label>
                  <input
                    type="time"
                    value={formEntryTime}
                    onChange={(e) => setFormEntryTime(e.target.value)}
                    required
                    className="w-full bg-[#070b13] border border-[#1e3256] text-white text-xs rounded-xl px-3 py-2 outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">
                    Exit Time (IST)
                  </label>
                  <input
                    type="time"
                    value={formExitTime}
                    onChange={(e) => setFormExitTime(e.target.value)}
                    required
                    className="w-full bg-[#070b13] border border-[#1e3256] text-white text-xs rounded-xl px-3 py-2 outline-none"
                  />
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#172642]">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-[#070b13] hover:bg-[#121d36] text-xs font-semibold text-slate-300 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createMovementMutation.isPending}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-xs font-bold text-white shadow-md transition-all disabled:opacity-50 cursor-pointer"
                >
                  {createMovementMutation.isPending ? "Logging Movement..." : "Save Schedule"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
