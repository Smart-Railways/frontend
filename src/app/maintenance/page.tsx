"use client";

import React, { useState, useMemo } from "react";
import { VerticalNavbar } from "@/components/navigation/vertical-navbar";
import {
  Wrench,
  Plus,
  Search,
  RefreshCw,
  AlertTriangle,
  Clock,
  CheckCircle2,
  XCircle,
  Code2,
  Calendar,
  Edit2,
  Trash2,
  Eye,
  Filter,
  LayoutGrid,
  Table as TableIcon,
  ShieldAlert,
  Zap,
  Building2,
  Layers,
  Sparkles,
  ArrowUpDown,
  Hourglass,
  SlidersHorizontal,
} from "lucide-react";
import {
  useMaintenanceTasks,
  useAssets,
  useRailwaySections,
  useCreateMaintenanceTask,
  useUpdateMaintenanceTask,
  useDeleteMaintenanceTask,
} from "@/hooks";
import {
  MaintenanceTask,
  CreateMaintenanceTaskInput,
  MaintenancePriority,
  MaintenanceStatus,
} from "@/types";

// Urgency metadata & styling
const URGENCY_CONFIG: Record<
  string,
  { label: string; color: string; badge: string; dot: string }
> = {
  CRITICAL: {
    label: "Critical Urgency",
    color: "text-red-400",
    badge: "bg-red-500/15 border-red-500/40 text-red-300",
    dot: "bg-red-400 animate-pulse",
  },
  HIGH: {
    label: "High Urgency",
    color: "text-orange-400",
    badge: "bg-orange-500/15 border-orange-500/40 text-orange-300",
    dot: "bg-orange-400",
  },
  MEDIUM: {
    label: "Medium Urgency",
    color: "text-yellow-400",
    badge: "bg-yellow-500/15 border-yellow-500/40 text-yellow-300",
    dot: "bg-yellow-400",
  },
  LOW: {
    label: "Low Urgency",
    color: "text-blue-400",
    badge: "bg-blue-500/15 border-blue-500/40 text-blue-300",
    dot: "bg-blue-400",
  },
};

// Status metadata & styling
const STATUS_CONFIG: Record<
  string,
  { label: string; badge: string; icon: typeof Clock }
> = {
  PENDING: {
    label: "Pending",
    badge: "bg-amber-500/15 border-amber-500/30 text-amber-300",
    icon: Hourglass,
  },
  SCHEDULED: {
    label: "Scheduled",
    badge: "bg-cyan-500/15 border-cyan-500/30 text-cyan-300",
    icon: Clock,
  },
  COMPLETED: {
    label: "Completed",
    badge: "bg-emerald-500/15 border-emerald-500/30 text-emerald-300",
    icon: CheckCircle2,
  },
  CANCELLED: {
    label: "Cancelled",
    badge: "bg-slate-500/15 border-slate-500/30 text-slate-400",
    icon: XCircle,
  },
};

// Helper: Format date
function formatDate(dateStr?: string | null): string {
  if (!dateStr) return "N/A";
  try {
    const [y, m, d] = dateStr.split("-").map(Number);
    const date = new Date(y, m - 1, d);
    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return dateStr;
  }
}

export default function MaintenancePage() {
  const [activeNavTab, setActiveNavTab] = useState<string>("maintenance");

  // TanStack Query Hooks
  const {
    data: tasks = [],
    isLoading: loadingTasks,
    isRefetching: refetchingTasks,
    refetch: refetchTasks,
  } = useMaintenanceTasks();

  const {
    data: assets = [],
    isLoading: loadingAssets,
    refetch: refetchAssets,
  } = useAssets();

  const {
    data: sections = [],
    isLoading: loadingSections,
  } = useRailwaySections();

  // Mutations
  const createTaskMutation = useCreateMaintenanceTask();
  const updateTaskMutation = useUpdateMaintenanceTask();
  const deleteTaskMutation = useDeleteMaintenanceTask();

  // Filters & State
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedUrgencyFilter, setSelectedUrgencyFilter] = useState<string>("ALL");
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>("ALL");
  const [selectedAssetFilter, setSelectedAssetFilter] = useState<string>("ALL");
  const [viewMode, setViewMode] = useState<"table" | "cards">("table");

  // Notifications
  const [toastMessage, setToastMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const showToast = (type: "success" | "error", text: string) => {
    setToastMessage({ type, text });
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Modal States
  const [isFormModalOpen, setIsFormModalOpen] = useState<boolean>(false);
  const [editingTask, setEditingTask] = useState<MaintenanceTask | null>(null);
  const [deletingTask, setDeletingTask] = useState<MaintenanceTask | null>(null);
  const [inspectingTask, setInspectingTask] = useState<MaintenanceTask | null>(null);
  const [showApiDocModal, setShowApiDocModal] = useState<boolean>(false);

  // Form State
  const [formData, setFormData] = useState<CreateMaintenanceTaskInput>({
    task_code: "",
    asset: 1,
    details: "",
    risk_rating: 8,
    urgency: "HIGH",
    deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    estimated_duration: 45,
    task_status: "PENDING",
  });

  // Open Create Modal with default or auto-suggested task code
  const handleOpenCreateModal = () => {
    setEditingTask(null);
    const randomSuffix = Math.floor(100 + Math.random() * 900);
    setFormData({
      task_code: `TMS-${randomSuffix}`,
      asset: assets.length > 0 ? assets[0].id : 1,
      details: "",
      risk_rating: 8,
      urgency: "HIGH",
      deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      estimated_duration: 45,
      task_status: "PENDING",
    });
    setIsFormModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEditModal = (task: MaintenanceTask) => {
    setEditingTask(task);
    setFormData({
      task_code: task.task_code,
      asset: task.asset,
      details: task.details,
      risk_rating: task.risk_rating,
      urgency: (task.urgency as MaintenancePriority) || "HIGH",
      deadline: task.deadline ? task.deadline.substring(0, 10) : new Date().toISOString().split("T")[0],
      estimated_duration: task.estimated_duration || 45,
      task_status: (task.task_status as MaintenanceStatus) || "PENDING",
    });
    setIsFormModalOpen(true);
  };

  // Submit Handler
  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.task_code.trim()) {
      showToast("error", "Task Code is required.");
      return;
    }
    if (!formData.asset) {
      showToast("error", "Please select an asset.");
      return;
    }
    if (!formData.details.trim()) {
      showToast("error", "Task Details description is required.");
      return;
    }

    if (editingTask) {
      // PUT /railways/maintenances/:id/
      updateTaskMutation.mutate(
        { id: editingTask.id, data: formData },
        {
          onSuccess: (updated) => {
            setIsFormModalOpen(false);
            setEditingTask(null);
            showToast("success", `Maintenance task "${updated?.task_code || formData.task_code}" updated successfully.`);
          },
          onError: (err) => {
            showToast("error", err instanceof Error ? err.message : "Failed to update maintenance task.");
          },
        }
      );
    } else {
      // POST /railways/maintenances/
      createTaskMutation.mutate(formData, {
        onSuccess: (created) => {
          setIsFormModalOpen(false);
          showToast("success", `Maintenance task "${created?.task_code || formData.task_code}" created successfully.`);
        },
        onError: (err) => {
          showToast("error", err instanceof Error ? err.message : "Failed to create maintenance task.");
        },
      });
    }
  };

  // Delete Handler
  const handleConfirmDelete = async () => {
    if (!deletingTask) return;

    deleteTaskMutation.mutate(deletingTask.id, {
      onSuccess: () => {
        showToast("success", `Maintenance task "${deletingTask.task_code}" deleted successfully.`);
        setDeletingTask(null);
      },
      onError: (err) => {
        showToast("error", err instanceof Error ? err.message : "Failed to delete maintenance task.");
      },
    });
  };

  // Filtered Tasks
  const filteredTasks = useMemo(() => {
    return tasks.filter((t) => {
      // 1. Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchCode = t.task_code?.toLowerCase().includes(q);
        const matchDetails = t.details?.toLowerCase().includes(q);
        const matchAsset = t.asset_name?.toLowerCase().includes(q);
        const matchSection = t.section_name?.toLowerCase().includes(q);
        const matchId = String(t.id).includes(q);
        if (!matchCode && !matchDetails && !matchAsset && !matchSection && !matchId) {
          return false;
        }
      }

      // 2. Urgency Filter
      if (selectedUrgencyFilter !== "ALL" && t.urgency !== selectedUrgencyFilter) {
        return false;
      }

      // 3. Status Filter
      if (selectedStatusFilter !== "ALL" && t.task_status !== selectedStatusFilter) {
        return false;
      }

      // 4. Asset Filter
      if (selectedAssetFilter !== "ALL" && String(t.asset) !== selectedAssetFilter) {
        return false;
      }

      return true;
    });
  }, [tasks, searchQuery, selectedUrgencyFilter, selectedStatusFilter, selectedAssetFilter]);

  // Key KPI stats
  const stats = useMemo(() => {
    const total = tasks.length;
    const criticalUrgency = tasks.filter((t) => t.urgency === "CRITICAL" || t.urgency === "HIGH").length;
    const pending = tasks.filter((t) => t.task_status === "PENDING").length;
    const scheduled = tasks.filter((t) => t.task_status === "SCHEDULED").length;
    const totalDuration = tasks.reduce((sum, t) => sum + (t.estimated_duration || 0), 0);
    const avgDuration = total > 0 ? Math.round(totalDuration / total) : 0;

    return {
      total,
      criticalUrgency,
      pending,
      scheduled,
      avgDuration,
    };
  }, [tasks]);

  const isSaving = createTaskMutation.isPending || updateTaskMutation.isPending;
  const isDeleting = deleteTaskMutation.isPending;

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
          
          {/* Toast Notification */}
          {toastMessage && (
            <div
              className={`fixed top-4 right-4 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-2xl border backdrop-blur-md transition-all animate-in fade-in slide-in-from-top-3 ${
                toastMessage.type === "success"
                  ? "bg-emerald-950/90 border-emerald-500/50 text-emerald-200"
                  : "bg-red-950/90 border-red-500/50 text-red-200"
              }`}
            >
              {toastMessage.type === "success" ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
              ) : (
                <XCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
              )}
              <span className="text-xs font-semibold">{toastMessage.text}</span>
              <button
                onClick={() => setToastMessage(null)}
                className="text-slate-400 hover:text-white text-xs ml-2 cursor-pointer"
              >
                ✕
              </button>
            </div>
          )}

          {/* Header */}
          <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#172642]/60">
            <div>
              <div className="flex items-center gap-2.5">
                <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-amber-500/15 border border-amber-500/30 text-amber-400 shadow-sm shadow-amber-950">
                  <Wrench className="w-4 h-4" />
                </div>
                <div>
                  <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
                    Maintenance Tasks & Work Orders
                  </h1>
                </div>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Schedule, track, and dispatch maintenance work orders across track infrastructure, S&T circuits, and traction lines.
              </p>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-2.5 flex-wrap">
              <button
                onClick={() => setShowApiDocModal(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#0d1527] hover:bg-[#121d36] border border-[#172642] text-xs text-slate-300 transition-colors cursor-pointer"
                title="View API Docs & Schema"
              >
                <Code2 className="w-3.5 h-3.5 text-purple-400" />
                <span>API Spec</span>
              </button>

              <button
                onClick={() => {
                  refetchTasks();
                  refetchAssets();
                }}
                disabled={refetchingTasks}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#0d1527] hover:bg-[#121d36] border border-[#172642] text-xs text-slate-300 transition-colors disabled:opacity-50 cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 text-blue-400 ${refetchingTasks ? "animate-spin" : ""}`} />
                <span>{refetchingTasks ? "Refreshing..." : "Refresh"}</span>
              </button>

              <button
                onClick={handleOpenCreateModal}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-600 via-amber-500 to-orange-500 hover:from-amber-500 hover:to-orange-400 text-white text-xs font-semibold shadow-md shadow-amber-950/40 border border-amber-400/30 transition-all cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Create Work Order</span>
              </button>
            </div>
          </header>

          {/* Metric Cards */}
          <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="p-4 rounded-2xl bg-gradient-to-br from-[#0d1527] to-[#070b13] border border-[#172642]">
              <div className="flex items-center justify-between text-slate-400 mb-1">
                <span className="text-xs font-semibold uppercase tracking-wider">Total Tasks</span>
                <Wrench className="w-4 h-4 text-amber-400" />
              </div>
              <div className="text-2xl font-black text-white">{stats.total}</div>
              <div className="text-[11px] text-slate-400 mt-1">Active maintenance registry</div>
            </div>

            <div className="p-4 rounded-2xl bg-gradient-to-br from-[#0d1527] to-[#070b13] border border-[#172642]">
              <div className="flex items-center justify-between text-slate-400 mb-1">
                <span className="text-xs font-semibold uppercase tracking-wider">Critical / High</span>
                <ShieldAlert className="w-4 h-4 text-red-400" />
              </div>
              <div className="text-2xl font-black text-red-400">{stats.criticalUrgency}</div>
              <div className="text-[11px] text-slate-400 mt-1">Requires immediate window</div>
            </div>

            <div className="p-4 rounded-2xl bg-gradient-to-br from-[#0d1527] to-[#070b13] border border-[#172642]">
              <div className="flex items-center justify-between text-slate-400 mb-1">
                <span className="text-xs font-semibold uppercase tracking-wider">Pending Orders</span>
                <Hourglass className="w-4 h-4 text-amber-400" />
              </div>
              <div className="text-2xl font-black text-amber-300">{stats.pending}</div>
              <div className="text-[11px] text-slate-400 mt-1">Awaiting corridor block</div>
            </div>

            <div className="p-4 rounded-2xl bg-gradient-to-br from-[#0d1527] to-[#070b13] border border-[#172642]">
              <div className="flex items-center justify-between text-slate-400 mb-1">
                <span className="text-xs font-semibold uppercase tracking-wider">Scheduled Tasks</span>
                <Clock className="w-4 h-4 text-cyan-400" />
              </div>
              <div className="text-2xl font-black text-cyan-300">{stats.scheduled}</div>
              <div className="text-[11px] text-slate-400 mt-1">Corridor booked</div>
            </div>

            <div className="p-4 rounded-2xl bg-gradient-to-br from-[#0d1527] to-[#070b13] border border-[#172642]">
              <div className="flex items-center justify-between text-slate-400 mb-1">
                <span className="text-xs font-semibold uppercase tracking-wider">Avg Est. Duration</span>
                <Zap className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="text-2xl font-black text-emerald-300">{stats.avgDuration} mins</div>
              <div className="text-[11px] text-slate-400 mt-1">Per maintenance window</div>
            </div>
          </section>

          {/* Filtering and Controls Bar */}
          <section className="p-4 rounded-2xl bg-[#0d1527]/90 border border-[#172642] shadow-xl backdrop-blur-sm space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
              
              {/* Search Bar */}
              <div className="md:col-span-4 relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search code, details, asset, section..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-[#070b13] border border-[#1e3256] focus:border-amber-500 text-xs text-white rounded-xl pl-9 pr-3 py-2.5 outline-none transition-colors"
                />
              </div>

              {/* Status Filter Dropdown */}
              <div className="md:col-span-3">
                <select
                  value={selectedStatusFilter}
                  onChange={(e) => setSelectedStatusFilter(e.target.value)}
                  className="w-full bg-[#070b13] border border-[#1e3256] focus:border-amber-500 text-white text-xs rounded-xl px-3 py-2.5 outline-none cursor-pointer"
                >
                  <option value="ALL">All Task Statuses</option>
                  <option value="PENDING">PENDING</option>
                  <option value="SCHEDULED">SCHEDULED</option>
                  <option value="COMPLETED">COMPLETED</option>
                  <option value="CANCELLED">CANCELLED</option>
                </select>
              </div>

              {/* Asset Filter Dropdown */}
              <div className="md:col-span-3">
                <select
                  value={selectedAssetFilter}
                  onChange={(e) => setSelectedAssetFilter(e.target.value)}
                  className="w-full bg-[#070b13] border border-[#1e3256] focus:border-amber-500 text-white text-xs rounded-xl px-3 py-2.5 outline-none cursor-pointer"
                >
                  <option value="ALL">All Target Assets</option>
                  {assets.map((a) => (
                    <option key={a.id} value={String(a.id)}>
                      {a.asset_title} (#{a.id}) - {a.division}
                    </option>
                  ))}
                </select>
              </div>

              {/* View Mode Toggle */}
              <div className="md:col-span-2 flex items-center justify-end gap-1.5">
                <button
                  onClick={() => setViewMode("table")}
                  className={`p-2 rounded-lg border transition-colors cursor-pointer ${
                    viewMode === "table"
                      ? "bg-amber-500/20 text-amber-300 border-amber-500/40"
                      : "bg-[#070b13] text-slate-400 border-[#172642] hover:text-white"
                  }`}
                  title="Table View"
                >
                  <TableIcon className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode("cards")}
                  className={`p-2 rounded-lg border transition-colors cursor-pointer ${
                    viewMode === "cards"
                      ? "bg-amber-500/20 text-amber-300 border-amber-500/40"
                      : "bg-[#070b13] text-slate-400 border-[#172642] hover:text-white"
                  }`}
                  title="Card Grid View"
                >
                  <LayoutGrid className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Urgency Filter Badges */}
            <div className="flex items-center gap-1.5 flex-wrap pt-3 border-t border-[#172642]/60">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mr-1">
                Urgency Priority:
              </span>
              {["ALL", "CRITICAL", "HIGH", "MEDIUM", "LOW"].map((urg) => (
                <button
                  key={urg}
                  onClick={() => setSelectedUrgencyFilter(urg)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border transition-all cursor-pointer ${
                    selectedUrgencyFilter === urg
                      ? "bg-amber-500/20 text-amber-300 border-amber-500/50 shadow-sm"
                      : "bg-[#070b13] text-slate-400 border-[#172642] hover:text-slate-200"
                  }`}
                >
                  {urg === "ALL" ? "All Priorities" : urg}
                </button>
              ))}
            </div>
          </section>

          {/* Maintenance Tasks List */}
          <section className="rounded-2xl bg-[#0d1527] border border-[#172642] shadow-2xl overflow-hidden">
            {/* Header Bar */}
            <div className="p-4 border-b border-[#172642] flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-[#09101d]">
              <div>
                <h2 className="text-sm font-bold text-white flex items-center gap-2">
                  <span>Registered Maintenance Tasks</span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30">
                    {filteredTasks.length} of {tasks.length}
                  </span>
                </h2>
                <p className="text-xs text-slate-400">
                  Track inspection work orders, relay tests, and maintenance schedules
                </p>
              </div>

              <div className="text-xs text-slate-400 font-mono">
                REST Endpoint: <code className="text-amber-400 bg-[#070b13] px-1.5 py-0.5 rounded border border-[#172642]">/railways/maintenances/</code>
              </div>
            </div>

            {/* Content Body: Loading / Empty / Data */}
            {loadingTasks || loadingAssets ? (
              <div className="py-16 text-center text-slate-400">
                <div className="flex flex-col items-center justify-center gap-2">
                  <RefreshCw className="w-7 h-7 animate-spin text-amber-400" />
                  <span className="text-xs font-semibold">Loading maintenance tasks from backend...</span>
                </div>
              </div>
            ) : filteredTasks.length === 0 ? (
              <div className="py-16 text-center text-slate-400">
                <div className="flex flex-col items-center justify-center gap-3">
                  <Wrench className="w-10 h-10 text-slate-600" />
                  <div className="text-sm font-bold text-slate-300">
                    No matching maintenance tasks found
                  </div>
                  <p className="text-xs text-slate-500 max-w-md">
                    Try adjusting search parameters or create a new maintenance work order.
                  </p>
                  <button
                    onClick={handleOpenCreateModal}
                    className="mt-2 flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-600 to-orange-500 hover:from-amber-500 text-xs font-bold text-white shadow-md transition-colors cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    Create Maintenance Task
                  </button>
                </div>
              </div>
            ) : viewMode === "table" ? (
              /* TABLE VIEW */
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#070b13]/80 text-slate-400 font-bold uppercase tracking-wider border-b border-[#172642]">
                    <tr>
                      <th className="py-3 px-4">Task Code</th>
                      <th className="py-3 px-4">Target Asset & Section</th>
                      <th className="py-3 px-4">Task Details</th>
                      <th className="py-3 px-4">Urgency</th>
                      <th className="py-3 px-4">Risk Rating</th>
                      <th className="py-3 px-4">Est. Duration</th>
                      <th className="py-3 px-4">Deadline</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#172642]/60">
                    {filteredTasks.map((task) => {
                      const urgencyInfo = URGENCY_CONFIG[task.urgency] || URGENCY_CONFIG.MEDIUM;
                      const statusInfo = STATUS_CONFIG[task.task_status || "PENDING"] || STATUS_CONFIG.PENDING;
                      const StatusIcon = statusInfo.icon;

                      return (
                        <tr
                          key={task.id}
                          className="hover:bg-[#121d36]/60 transition-colors group"
                        >
                          {/* Task Code */}
                          <td className="py-3.5 px-4 font-mono font-bold text-amber-300">
                            <div className="flex items-center gap-2">
                              <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                              <span>{task.task_code}</span>
                            </div>
                            <span className="text-[10px] text-slate-500 block font-sans">
                              ID: #{task.id}
                            </span>
                          </td>

                          {/* Asset & Section */}
                          <td className="py-3.5 px-4">
                            <div className="font-bold text-white">
                              {task.asset_name || `Asset #${task.asset}`}
                            </div>
                            <div className="text-[10px] text-slate-400">
                              {task.section_name || "Section"}
                            </div>
                          </td>

                          {/* Details */}
                          <td className="py-3.5 px-4 max-w-xs">
                            <div className="text-slate-200 line-clamp-2" title={task.details}>
                              {task.details}
                            </div>
                          </td>

                          {/* Urgency */}
                          <td className="py-3.5 px-4">
                            <span
                              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-extrabold border ${urgencyInfo.badge}`}
                            >
                              <span className={`w-1.5 h-1.5 rounded-full ${urgencyInfo.dot}`}></span>
                              {task.urgency}
                            </span>
                          </td>

                          {/* Risk Rating */}
                          <td className="py-3.5 px-4 font-mono font-bold">
                            <span
                              className={
                                task.risk_rating >= 8
                                  ? "text-red-400"
                                  : task.risk_rating >= 5
                                  ? "text-amber-400"
                                  : "text-emerald-400"
                              }
                            >
                              {task.risk_rating}/10
                            </span>
                          </td>

                          {/* Duration */}
                          <td className="py-3.5 px-4 font-mono text-slate-300">
                            <div className="flex items-center gap-1.5">
                              <Clock className="w-3.5 h-3.5 text-slate-400" />
                              <span>{task.estimated_duration} mins</span>
                            </div>
                          </td>

                          {/* Deadline */}
                          <td className="py-3.5 px-4 font-mono text-slate-300">
                            <div className="flex items-center gap-1.5">
                              <Calendar className="w-3.5 h-3.5 text-slate-400" />
                              <span>{formatDate(task.deadline)}</span>
                            </div>
                          </td>

                          {/* Status */}
                          <td className="py-3.5 px-4">
                            <span
                              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold border ${statusInfo.badge}`}
                            >
                              <StatusIcon className="w-3 h-3" />
                              {statusInfo.label}
                            </span>
                          </td>

                          {/* Actions */}
                          <td className="py-3.5 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => setInspectingTask(task)}
                                className="p-1.5 rounded-lg bg-[#070b13] hover:bg-[#1a2b4f] border border-[#1e3256] text-slate-300 hover:text-white transition-colors"
                                title="Inspect Task"
                              >
                                <Eye className="w-3.5 h-3.5 text-blue-400" />
                              </button>
                              <button
                                onClick={() => handleOpenEditModal(task)}
                                className="p-1.5 rounded-lg bg-[#070b13] hover:bg-[#1a2b4f] border border-[#1e3256] text-slate-300 hover:text-white transition-colors"
                                title="Edit Task"
                              >
                                <Edit2 className="w-3.5 h-3.5 text-amber-400" />
                              </button>
                              <button
                                onClick={() => setDeletingTask(task)}
                                className="p-1.5 rounded-lg bg-[#070b13] hover:bg-red-950/50 border border-[#1e3256] hover:border-red-500/40 text-slate-300 hover:text-red-400 transition-colors"
                                title="Delete Task"
                              >
                                <Trash2 className="w-3.5 h-3.5 text-red-400" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              /* CARD GRID VIEW */
              <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredTasks.map((task) => {
                  const urgencyInfo = URGENCY_CONFIG[task.urgency] || URGENCY_CONFIG.MEDIUM;
                  const statusInfo = STATUS_CONFIG[task.task_status || "PENDING"] || STATUS_CONFIG.PENDING;
                  const StatusIcon = statusInfo.icon;

                  return (
                    <div
                      key={task.id}
                      className="p-4 rounded-xl bg-gradient-to-b from-[#09101d] to-[#070b13] border border-[#172642] hover:border-amber-500/40 transition-all flex flex-col justify-between space-y-3 shadow-lg"
                    >
                      <div className="space-y-2">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-amber-300 font-mono text-sm">
                                {task.task_code}
                              </span>
                              <span className="text-[10px] text-slate-400 font-mono">
                                #{task.id}
                              </span>
                            </div>
                            <h3 className="text-sm font-bold text-white mt-1">
                              {task.asset_name || `Asset #${task.asset}`}
                            </h3>
                          </div>

                          <span
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-extrabold border ${urgencyInfo.badge}`}
                          >
                            <span className={`w-1.5 h-1.5 rounded-full ${urgencyInfo.dot}`}></span>
                            {task.urgency}
                          </span>
                        </div>

                        <p className="text-xs text-slate-300 line-clamp-2 bg-[#070b13] p-2 rounded-lg border border-[#172642]">
                          {task.details}
                        </p>

                        <div className="space-y-1 pt-1 text-xs">
                          <div className="flex items-center justify-between text-slate-400">
                            <span>Status:</span>
                            <span
                              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold border ${statusInfo.badge}`}
                            >
                              <StatusIcon className="w-3 h-3" />
                              {statusInfo.label}
                            </span>
                          </div>

                          <div className="flex items-center justify-between text-slate-400">
                            <span>Duration:</span>
                            <span className="text-slate-200 font-mono text-xs">
                              {task.estimated_duration} mins
                            </span>
                          </div>

                          <div className="flex items-center justify-between text-slate-400">
                            <span>Deadline:</span>
                            <span className="text-slate-300 font-mono text-xs">
                              {formatDate(task.deadline)}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Card Bottom Actions */}
                      <div className="pt-2 border-t border-[#172642] flex items-center justify-between">
                        <button
                          onClick={() => setInspectingTask(task)}
                          className="flex items-center gap-1 text-[11px] font-semibold text-blue-400 hover:text-blue-300 cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Inspect</span>
                        </button>

                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => handleOpenEditModal(task)}
                            className="p-1.5 rounded-lg bg-[#070b13] hover:bg-[#121d36] border border-[#1e3256] text-amber-400 hover:text-amber-300 transition-colors"
                            title="Edit"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setDeletingTask(task)}
                            className="p-1.5 rounded-lg bg-[#070b13] hover:bg-red-950/50 border border-[#1e3256] text-red-400 hover:text-red-300 transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        </main>
      </div>

      {/* MODAL 1: Create or Edit Maintenance Task */}
      {isFormModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[#0d1527] border border-[#172642] rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-[#172642]">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
                  <Wrench className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">
                    {editingTask ? `Edit Task #${editingTask.task_code}` : "Create Maintenance Work Order"}
                  </h3>
                  <p className="text-xs text-slate-400">
                    {editingTask ? "PUT /railways/maintenances/:id/" : "POST /railways/maintenances/"}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsFormModalOpen(false)}
                className="text-slate-400 hover:text-white text-lg font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmitForm} className="space-y-4">
              
              {/* Task Code & Asset Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Task Code */}
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">
                    Task Code <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. TMS-001"
                    value={formData.task_code}
                    onChange={(e) => setFormData({ ...formData, task_code: e.target.value })}
                    required
                    className="w-full bg-[#070b13] border border-[#1e3256] focus:border-amber-500 text-white text-xs rounded-xl px-3.5 py-2.5 outline-none font-mono"
                  />
                </div>

                {/* Target Asset */}
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">
                    Target Railway Asset <span className="text-red-400">*</span>
                  </label>
                  <select
                    value={formData.asset}
                    onChange={(e) => setFormData({ ...formData, asset: Number(e.target.value) })}
                    required
                    className="w-full bg-[#070b13] border border-[#1e3256] focus:border-amber-500 text-white text-xs rounded-xl px-3.5 py-2.5 outline-none cursor-pointer"
                  >
                    {assets.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.asset_title} (#{a.id}) - {a.division}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Task Details */}
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">
                  Task Details & Work Description <span className="text-red-400">*</span>
                </label>
                <textarea
                  rows={3}
                  placeholder="e.g. Routine track circuit inspection and relay testing"
                  value={formData.details}
                  onChange={(e) => setFormData({ ...formData, details: e.target.value })}
                  required
                  className="w-full bg-[#070b13] border border-[#1e3256] focus:border-amber-500 text-white text-xs rounded-xl px-3.5 py-2.5 outline-none transition-colors"
                />
              </div>

              {/* Urgency, Status, Duration Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Urgency */}
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">
                    Urgency Priority <span className="text-red-400">*</span>
                  </label>
                  <select
                    value={formData.urgency}
                    onChange={(e) => setFormData({ ...formData, urgency: e.target.value as MaintenancePriority })}
                    required
                    className="w-full bg-[#070b13] border border-[#1e3256] focus:border-amber-500 text-white text-xs rounded-xl px-3 py-2.5 outline-none cursor-pointer"
                  >
                    <option value="CRITICAL">CRITICAL</option>
                    <option value="HIGH">HIGH</option>
                    <option value="MEDIUM">MEDIUM</option>
                    <option value="LOW">LOW</option>
                  </select>
                </div>

                {/* Status */}
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">
                    Task Status <span className="text-red-400">*</span>
                  </label>
                  <select
                    value={formData.task_status}
                    onChange={(e) => setFormData({ ...formData, task_status: e.target.value as MaintenanceStatus })}
                    required
                    className="w-full bg-[#070b13] border border-[#1e3256] focus:border-amber-500 text-white text-xs rounded-xl px-3 py-2.5 outline-none cursor-pointer"
                  >
                    <option value="PENDING">PENDING</option>
                    <option value="SCHEDULED">SCHEDULED</option>
                    <option value="COMPLETED">COMPLETED</option>
                    <option value="CANCELLED">CANCELLED</option>
                  </select>
                </div>

                {/* Estimated Duration */}
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">
                    Duration (Minutes) <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="number"
                    min={5}
                    max={1440}
                    step={5}
                    value={formData.estimated_duration}
                    onChange={(e) => setFormData({ ...formData, estimated_duration: Number(e.target.value) })}
                    required
                    className="w-full bg-[#070b13] border border-[#1e3256] focus:border-amber-500 text-white text-xs rounded-xl px-3 py-2.5 outline-none"
                  />
                </div>
              </div>

              {/* Risk Rating & Deadline Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Risk Rating */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-bold text-slate-300">
                      Risk Rating (1 - 10)
                    </label>
                    <span className="text-xs font-mono font-bold text-amber-400">
                      {formData.risk_rating} / 10
                    </span>
                  </div>
                  <input
                    type="range"
                    min={1}
                    max={10}
                    step={1}
                    value={formData.risk_rating}
                    onChange={(e) => setFormData({ ...formData, risk_rating: Number(e.target.value) })}
                    className="w-full accent-amber-500 cursor-pointer h-2 bg-[#070b13] rounded-lg"
                  />
                </div>

                {/* Deadline */}
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">
                    Target Deadline Date <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="date"
                    value={formData.deadline}
                    onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                    required
                    className="w-full bg-[#070b13] border border-[#1e3256] focus:border-amber-500 text-white text-xs rounded-xl px-3.5 py-2.5 outline-none cursor-pointer"
                  />
                </div>
              </div>

              {/* Outgoing JSON Payload Preview */}
              <div className="p-3 rounded-xl bg-[#070b13] border border-[#172642] space-y-1.5">
                <div className="flex items-center justify-between text-[11px] font-bold text-slate-400">
                  <span className="flex items-center gap-1.5">
                    <Code2 className="w-3.5 h-3.5 text-purple-400" />
                    Outgoing JSON Payload Preview
                  </span>
                  <span className="text-amber-400 font-mono text-[10px]">
                    {editingTask ? `PUT /railways/maintenances/${editingTask.id}/` : "POST /railways/maintenances/"}
                  </span>
                </div>
                <pre className="text-[11px] font-mono text-amber-300 bg-[#04070d] p-2.5 rounded-lg overflow-x-auto border border-[#121d36]">
                  {JSON.stringify(formData, null, 2)}
                </pre>
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[#172642]">
                <button
                  type="button"
                  onClick={() => setIsFormModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-[#070b13] hover:bg-[#121d36] text-xs font-semibold text-slate-300 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-600 to-orange-500 hover:from-amber-500 text-xs font-bold text-white shadow-lg shadow-amber-950/50 transition-all disabled:opacity-50 cursor-pointer"
                >
                  {isSaving
                    ? editingTask
                      ? "Updating Task..."
                      : "Creating Task..."
                    : editingTask
                    ? "Save Changes"
                    : "Create Task"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: Inspect Maintenance Task */}
      {inspectingTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[#0d1527] border border-[#172642] rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#172642]">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-blue-500/15 border border-blue-500/30 flex items-center justify-center text-blue-400">
                  <Eye className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white font-mono">
                    {inspectingTask.task_code}
                  </h3>
                  <span className="text-xs text-slate-400">
                    Task ID: #{inspectingTask.id}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setInspectingTask(null)}
                className="text-slate-400 hover:text-white text-lg font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-xl bg-[#070b13] border border-[#172642]">
                <span className="text-slate-400 block text-[11px] mb-1">Details & Description</span>
                <p className="text-white text-xs leading-relaxed">{inspectingTask.details}</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-[#070b13] border border-[#172642]">
                  <span className="text-slate-400 block text-[11px]">Target Asset</span>
                  <span className="font-bold text-white text-sm">
                    {inspectingTask.asset_name || `Asset #${inspectingTask.asset}`}
                  </span>
                  <span className="text-[10px] text-slate-500 block">ID: {inspectingTask.asset}</span>
                </div>

                <div className="p-3 rounded-xl bg-[#070b13] border border-[#172642]">
                  <span className="text-slate-400 block text-[11px]">Corridor Section</span>
                  <span className="font-bold text-white text-sm">
                    {inspectingTask.section_name || "Section"}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-[#070b13] border border-[#172642]">
                  <span className="text-slate-400 block text-[11px]">Urgency Priority</span>
                  <span className="font-bold text-amber-400 text-sm">{inspectingTask.urgency}</span>
                </div>

                <div className="p-3 rounded-xl bg-[#070b13] border border-[#172642]">
                  <span className="text-slate-400 block text-[11px]">Risk Rating</span>
                  <span className="font-bold text-red-400 text-sm">
                    {inspectingTask.risk_rating} / 10
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-[#070b13] border border-[#172642]">
                  <span className="text-slate-400 block text-[11px]">Est. Duration</span>
                  <span className="font-mono text-cyan-300 font-bold text-sm">
                    {inspectingTask.estimated_duration} mins
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-[#070b13] border border-[#172642]">
                  <span className="text-slate-400 block text-[11px]">Target Deadline</span>
                  <span className="font-mono text-slate-200">
                    {formatDate(inspectingTask.deadline)}
                  </span>
                </div>
              </div>

              {/* Raw JSON inspection */}
              <div className="space-y-1">
                <span className="text-[11px] font-bold text-slate-400">Server Response Payload:</span>
                <pre className="text-[11px] font-mono text-cyan-300 bg-[#04070d] p-3 rounded-xl border border-[#172642] overflow-x-auto">
                  {JSON.stringify(inspectingTask, null, 2)}
                </pre>
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-[#172642]">
              <button
                onClick={() => {
                  const toEdit = inspectingTask;
                  setInspectingTask(null);
                  handleOpenEditModal(toEdit);
                }}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#121d36] hover:bg-[#1a2b4f] border border-[#1e3256] text-xs font-semibold text-amber-400 cursor-pointer"
              >
                <Edit2 className="w-3.5 h-3.5" />
                <span>Edit Task</span>
              </button>

              <button
                onClick={() => setInspectingTask(null)}
                className="px-4 py-1.5 rounded-xl bg-[#070b13] hover:bg-[#121d36] text-xs font-semibold text-slate-300 cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: Delete Confirmation */}
      {deletingTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[#0d1527] border border-red-500/30 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-red-400">
              <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Delete Maintenance Task</h3>
                <p className="text-xs text-slate-400">DELETE /railways/maintenances/{deletingTask.id}/</p>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Are you sure you want to delete maintenance work order{" "}
              <span className="font-bold text-white">"{deletingTask.task_code}"</span> (ID: #{deletingTask.id})? This action cannot be undone.
            </p>

            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[#172642]">
              <button
                type="button"
                onClick={() => setDeletingTask(null)}
                className="px-4 py-2 rounded-xl bg-[#070b13] hover:bg-[#121d36] text-xs font-semibold text-slate-300 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-xs font-bold text-white shadow-lg transition-all disabled:opacity-50 cursor-pointer"
              >
                {isDeleting ? "Deleting..." : "Confirm Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 4: API Docs & Schema Inspector */}
      {showApiDocModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[#0d1527] border border-[#172642] rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-4 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-[#172642]">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-400">
                  <Code2 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">6.3 Maintenance Tasks API Spec</h3>
                  <p className="text-xs text-slate-400">REST API specification for /railways/maintenances/</p>
                </div>
              </div>
              <button
                onClick={() => setShowApiDocModal(false)}
                className="text-slate-400 hover:text-white text-lg font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 text-xs">
              {/* GET Endpoint */}
              <div className="p-3.5 rounded-xl bg-[#070b13] border border-[#172642] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-emerald-400 flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-emerald-500/20 border border-emerald-500/30 text-[10px]">
                      GET
                    </span>
                    /railways/maintenances/
                  </span>
                  <span className="text-[11px] text-slate-400">List all maintenance tasks</span>
                </div>
              </div>

              {/* POST Endpoint */}
              <div className="p-3.5 rounded-xl bg-[#070b13] border border-[#172642] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-amber-400 flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-amber-500/20 border border-amber-500/30 text-[10px]">
                      POST
                    </span>
                    /railways/maintenances/
                  </span>
                  <span className="text-[11px] text-slate-400">Create maintenance work order</span>
                </div>
                <div>
                  <span className="text-[11px] font-semibold text-slate-400 block mb-1">
                    Request Body:
                  </span>
                  <pre className="text-[11px] font-mono text-amber-300 bg-[#04070d] p-2.5 rounded-lg border border-[#121d36]">
{`{
  "task_code": "TMS-001",
  "asset": 1,
  "details": "Routine track circuit inspection and relay testing",
  "risk_rating": 8,
  "urgency": "HIGH",
  "deadline": "2026-09-10",
  "estimated_duration": 45,
  "task_status": "PENDING"
}`}
                  </pre>
                </div>
                <div>
                  <span className="text-[11px] font-semibold text-slate-400 block mb-1">
                    Response (201 Created):
                  </span>
                  <pre className="text-[11px] font-mono text-emerald-300 bg-[#04070d] p-2.5 rounded-lg border border-[#121d36]">
{`{
  "id": 1,
  "task_code": "TMS-001",
  "asset": 1,
  "asset_name": "Track Circuit 01",
  "section_name": "New Delhi - Mathura",
  "details": "Routine track circuit inspection and relay testing",
  "risk_rating": 8,
  "urgency": "HIGH",
  "deadline": "2026-09-10",
  "estimated_duration": 45,
  "task_status": "PENDING"
}`}
                  </pre>
                </div>
              </div>

              {/* PUT & DELETE */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3.5 rounded-xl bg-[#070b13] border border-[#172642] space-y-1">
                  <span className="font-mono font-bold text-cyan-400 flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-cyan-500/20 border border-cyan-500/30 text-[10px]">
                      PUT / PATCH
                    </span>
                    /railways/maintenances/:id/
                  </span>
                  <p className="text-[11px] text-slate-400">Update work order parameters</p>
                </div>

                <div className="p-3.5 rounded-xl bg-[#070b13] border border-[#172642] space-y-1">
                  <span className="font-mono font-bold text-red-400 flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-red-500/20 border border-red-500/30 text-[10px]">
                      DELETE
                    </span>
                    /railways/maintenances/:id/
                  </span>
                  <p className="text-[11px] text-slate-400">Remove work order record</p>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-[#172642] text-right">
              <button
                onClick={() => setShowApiDocModal(false)}
                className="px-4 py-1.5 rounded-xl bg-[#070b13] hover:bg-[#121d36] text-xs font-semibold text-slate-300 cursor-pointer"
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
