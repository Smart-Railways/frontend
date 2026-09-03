"use client";

import React, { useState, useMemo } from "react";
import { VerticalNavbar } from "@/components/navigation/vertical-navbar";
import { LiveClock } from "@/components/ui/live-clock";
import {
  Wrench,
  Plus,
  Search,
  RefreshCw,
  AlertTriangle,
  Clock,
  CheckCircle2,
  XCircle,
  Calendar,
  Edit2,
  Trash2,
  Eye,
  LayoutGrid,
  Table as TableIcon,
  ShieldAlert,
  Zap,
  Hourglass,
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

// Urgency metadata & styling (Light brand tokens)
const URGENCY_CONFIG: Record<
  string,
  { label: string; color: string; badge: string; dot: string }
> = {
  CRITICAL: {
    label: "Critical Urgency",
    color: "text-red-700",
    badge: "bg-red-50 border-red-200 text-red-700",
    dot: "bg-red-500 animate-pulse",
  },
  HIGH: {
    label: "High Urgency",
    color: "text-orange-700",
    badge: "bg-orange-50 border-orange-200 text-orange-700",
    dot: "bg-orange-500",
  },
  MEDIUM: {
    label: "Medium Urgency",
    color: "text-amber-700",
    badge: "bg-amber-50 border-amber-200 text-amber-700",
    dot: "bg-amber-500",
  },
  LOW: {
    label: "Low Urgency",
    color: "text-brand-primary",
    badge: "bg-brand-blue-light border-blue-200 text-brand-primary",
    dot: "bg-brand-primary",
  },
};

// Status metadata & styling (Light brand tokens)
const STATUS_CONFIG: Record<
  string,
  { label: string; badge: string; icon: typeof Clock }
> = {
  PENDING: {
    label: "Pending",
    badge: "bg-amber-50 border-amber-200 text-amber-700",
    icon: Hourglass,
  },
  SCHEDULED: {
    label: "Scheduled",
    badge: "bg-brand-blue-light border-blue-200 text-brand-primary",
    icon: Clock,
  },
  COMPLETED: {
    label: "Completed",
    badge: "bg-emerald-50 border-emerald-200 text-emerald-700",
    icon: CheckCircle2,
  },
  CANCELLED: {
    label: "Cancelled",
    badge: "bg-slate-100 border-slate-200 text-slate-600",
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
  const { data: tasks = [], isLoading: loadingTasks, isRefetching: refetchingTasks, refetch: refetchTasks } = useMaintenanceTasks();
  const { data: assets = [], isLoading: loadingAssets, refetch: refetchAssets } = useAssets();
  const { data: sections = [] } = useRailwaySections();

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

  // Open Create Modal with auto-suggested task code
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

  const handleOpenEditModal = (task: MaintenanceTask) => {
    setEditingTask(task);
    setFormData({
      task_code: task.task_code,
      asset: task.asset,
      details: task.details || "",
      risk_rating: task.risk_rating,
      urgency: task.urgency,
      deadline: task.deadline ? task.deadline.substring(0, 10) : new Date().toISOString().split("T")[0],
      estimated_duration: task.estimated_duration,
      task_status: task.task_status,
    });
    setIsFormModalOpen(true);
  };

  // Form Submission
  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.task_code.trim()) {
      showToast("error", "Task Code is required.");
      return;
    }

    if (!formData.asset) {
      showToast("error", "Please select a target asset.");
      return;
    }

    if (editingTask) {
      updateTaskMutation.mutate(
        { id: editingTask.id, data: formData },
        {
          onSuccess: (updated) => {
            setIsFormModalOpen(false);
            setEditingTask(null);
            showToast("success", `Maintenance task "${updated?.task_code || editingTask.task_code}" updated successfully.`);
          },
          onError: (err) => {
            showToast("error", err instanceof Error ? err.message : "Failed to update task.");
          },
        }
      );
    } else {
      createTaskMutation.mutate(formData, {
        onSuccess: (created) => {
          setIsFormModalOpen(false);
          showToast("success", `Maintenance task "${created?.task_code || formData.task_code}" created successfully.`);
        },
        onError: (err) => {
          showToast("error", err instanceof Error ? err.message : "Failed to create task.");
        },
      });
    }
  };

  // Confirm Delete Action
  const handleConfirmDelete = async () => {
    if (!deletingTask) return;

    deleteTaskMutation.mutate(deletingTask.id, {
      onSuccess: () => {
        showToast("success", `Task "${deletingTask.task_code}" deleted successfully.`);
        setDeletingTask(null);
      },
      onError: (err) => {
        showToast("error", err instanceof Error ? err.message : "Failed to delete task.");
      },
    });
  };

  // Filtered Tasks
  const filteredTasks = useMemo(() => {
    return tasks.filter((t) => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchCode = t.task_code?.toLowerCase().includes(q);
        const matchAsset = t.asset_name?.toLowerCase().includes(q);
        const matchDetails = t.details?.toLowerCase().includes(q);
        const matchId = String(t.id).includes(q);
        if (!matchCode && !matchAsset && !matchDetails && !matchId) return false;
      }

      if (selectedUrgencyFilter !== "ALL" && t.urgency !== selectedUrgencyFilter) return false;
      if (selectedStatusFilter !== "ALL" && t.task_status !== selectedStatusFilter) return false;
      if (selectedAssetFilter !== "ALL" && String(t.asset) !== selectedAssetFilter) return false;

      return true;
    });
  }, [tasks, searchQuery, selectedUrgencyFilter, selectedStatusFilter, selectedAssetFilter]);

  // Metric Summary
  const stats = useMemo(() => {
    const total = tasks.length;
    const pendingCount = tasks.filter((t) => t.task_status === "PENDING").length;
    const scheduledCount = tasks.filter((t) => t.task_status === "SCHEDULED").length;
    const criticalCount = tasks.filter((t) => t.urgency === "CRITICAL" || t.risk_rating >= 8).length;
    const totalMinutes = tasks.reduce((sum, t) => sum + (t.estimated_duration || 0), 0);

    return {
      total,
      pendingCount,
      scheduledCount,
      criticalCount,
      totalMinutes,
    };
  }, [tasks]);

  const isSaving = createTaskMutation.isPending || updateTaskMutation.isPending;
  const isDeleting = deleteTaskMutation.isPending;

  return (
    <div className="min-h-screen bg-brand-tertiary text-brand-secondary flex flex-col font-sans selection:bg-brand-primary/20 selection:text-brand-primary">
      <VerticalNavbar activeTab={activeNavTab} onTabChange={setActiveNavTab} unreadCount={1} />

      <div className="flex-1 flex pl-20 lg:pl-64">
        <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-7 flex flex-col space-y-5 max-w-[1600px] mx-auto w-full">
          
          {/* Toast Notification Banner */}
          {toastMessage && (
            <div
              className={`fixed top-4 right-4 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-xl border transition-all animate-in fade-in slide-in-from-top-3 ${
                toastMessage.type === "success"
                  ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                  : "bg-red-50 border-red-200 text-red-800"
              }`}
            >
              {toastMessage.type === "success" ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
              ) : (
                <XCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
              )}
              <span className="text-xs font-bold">{toastMessage.text}</span>
              <button
                onClick={() => setToastMessage(null)}
                className="text-brand-muted hover:text-brand-secondary text-xs ml-2 font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>
          )}

          {/* Header */}
          <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-brand-border/80">
            <div>
              <div className="flex items-center gap-2.5">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-brand-blue-light text-brand-primary">
                  <Wrench className="w-4 h-4" />
                </div>
                <h1 className="text-xl sm:text-2xl font-extrabold text-brand-secondary tracking-tight">
                  Maintenance Tasks & Corridor Scheduling
                </h1>
              </div>
              <p className="text-xs text-brand-muted mt-1 font-medium">
                Manage preventive block tasks, asset risk ratings, urgency queues, and maintenance timelines.
              </p>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-3 flex-wrap">
              <LiveClock />

              <button
                onClick={() => {
                  refetchTasks();
                  refetchAssets();
                }}
                disabled={refetchingTasks}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-brand-surface hover:bg-brand-tertiary border border-brand-border text-xs font-bold text-brand-secondary transition-colors disabled:opacity-50 cursor-pointer shadow-2xs"
              >
                <RefreshCw className={`w-3.5 h-3.5 text-brand-primary ${refetchingTasks ? "animate-spin" : ""}`} />
                <span>{refetchingTasks ? "Refreshing..." : "Refresh"}</span>
              </button>

              <button
                onClick={handleOpenCreateModal}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-brand-primary hover:bg-blue-700 text-white text-xs font-bold shadow-xs transition-all cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Schedule Task</span>
              </button>
            </div>
          </header>

          {/* Metric Cards */}
          <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="p-4 rounded-2xl bg-brand-surface border border-brand-border shadow-sm flex items-start gap-3.5">
              <div className="w-9 h-9 rounded-full bg-brand-blue-light text-brand-primary flex items-center justify-center flex-shrink-0 mt-0.5">
                <Wrench className="w-4 h-4" />
              </div>
              <div>
                <div className="text-[10px] font-extrabold uppercase tracking-wider text-brand-muted mb-0.5">
                  Total Tasks
                </div>
                <div className="text-2xl font-black text-brand-secondary tracking-tight">{stats.total}</div>
                <div className="text-[11px] text-brand-muted mt-0.5 font-medium">Across all assets</div>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-brand-surface border border-brand-border shadow-sm flex items-start gap-3.5">
              <div className="w-9 h-9 rounded-full bg-amber-50 text-amber-700 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Hourglass className="w-4 h-4" />
              </div>
              <div>
                <div className="text-[10px] font-extrabold uppercase tracking-wider text-brand-muted mb-0.5">
                  Pending Execution
                </div>
                <div className="text-2xl font-black text-amber-600 tracking-tight">{stats.pendingCount}</div>
                <div className="text-[11px] text-brand-muted mt-0.5 font-medium">Needs block allocation</div>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-brand-surface border border-brand-border shadow-sm flex items-start gap-3.5">
              <div className="w-9 h-9 rounded-full bg-brand-blue-light text-brand-primary flex items-center justify-center flex-shrink-0 mt-0.5">
                <Clock className="w-4 h-4" />
              </div>
              <div>
                <div className="text-[10px] font-extrabold uppercase tracking-wider text-brand-muted mb-0.5">
                  Scheduled Blocks
                </div>
                <div className="text-2xl font-black text-brand-primary tracking-tight">{stats.scheduledCount}</div>
                <div className="text-[11px] text-brand-muted mt-0.5 font-medium">Ready for dispatch</div>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-brand-surface border border-brand-border shadow-sm flex items-start gap-3.5">
              <div className="w-9 h-9 rounded-full bg-red-50 text-red-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                <ShieldAlert className="w-4 h-4" />
              </div>
              <div>
                <div className="text-[10px] font-extrabold uppercase tracking-wider text-brand-muted mb-0.5">
                  Critical Priority
                </div>
                <div className="text-2xl font-black text-red-600 tracking-tight">{stats.criticalCount}</div>
                <div className="text-[11px] text-brand-muted mt-0.5 font-medium">High risk or urgent</div>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-brand-surface border border-brand-border shadow-sm flex items-start gap-3.5">
              <div className="w-9 h-9 rounded-full bg-purple-50 text-purple-700 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Zap className="w-4 h-4" />
              </div>
              <div>
                <div className="text-[10px] font-extrabold uppercase tracking-wider text-brand-muted mb-0.5">
                  Total Block Time
                </div>
                <div className="text-2xl font-black text-brand-secondary tracking-tight">
                  {Math.floor(stats.totalMinutes / 60)}h {stats.totalMinutes % 60}m
                </div>
                <div className="text-[11px] text-brand-muted mt-0.5 font-medium">Estimated track occupancy</div>
              </div>
            </div>
          </section>

          {/* Filtering and Controls Bar */}
          <section className="p-4 sm:p-5 rounded-2xl bg-brand-surface border border-brand-border shadow-sm space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
              
              {/* Search Bar */}
              <div className="md:col-span-4 relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-brand-muted" />
                <input
                  type="text"
                  placeholder="Search task code, asset, details..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-brand-surface border border-brand-border focus:border-brand-primary text-xs text-brand-secondary placeholder:text-brand-muted rounded-xl pl-9 pr-3 py-2.5 outline-none transition-colors font-medium shadow-2xs"
                />
              </div>

              {/* Status Filter Dropdown */}
              <div className="md:col-span-3">
                <select
                  value={selectedStatusFilter}
                  onChange={(e) => setSelectedStatusFilter(e.target.value)}
                  className="w-full bg-brand-surface border border-brand-border focus:border-brand-primary text-brand-secondary text-xs rounded-xl px-3.5 py-2.5 outline-none cursor-pointer font-bold shadow-2xs"
                >
                  <option value="ALL">All Statuses</option>
                  <option value="PENDING">Pending Execution</option>
                  <option value="SCHEDULED">Scheduled</option>
                  <option value="COMPLETED">Completed</option>
                  <option value="CANCELLED">Cancelled</option>
                </select>
              </div>

              {/* Target Asset Filter Dropdown */}
              <div className="md:col-span-3">
                <select
                  value={selectedAssetFilter}
                  onChange={(e) => setSelectedAssetFilter(e.target.value)}
                  className="w-full bg-brand-surface border border-brand-border focus:border-brand-primary text-brand-secondary text-xs rounded-xl px-3.5 py-2.5 outline-none cursor-pointer font-bold shadow-2xs"
                >
                  <option value="ALL">All Tracked Assets</option>
                  {assets.map((a) => (
                    <option key={a.id} value={String(a.id)}>
                      {a.asset_title} (#{a.id})
                    </option>
                  ))}
                </select>
              </div>

              {/* View Mode Toggle */}
              <div className="md:col-span-2 flex items-center justify-end gap-1.5">
                <button
                  onClick={() => setViewMode("table")}
                  className={`p-2 rounded-xl border transition-colors cursor-pointer shadow-2xs ${
                    viewMode === "table"
                      ? "bg-brand-primary text-white border-brand-primary"
                      : "bg-brand-surface text-brand-muted border-brand-border hover:bg-brand-tertiary"
                  }`}
                  title="Table View"
                >
                  <TableIcon className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode("cards")}
                  className={`p-2 rounded-xl border transition-colors cursor-pointer shadow-2xs ${
                    viewMode === "cards"
                      ? "bg-brand-primary text-white border-brand-primary"
                      : "bg-brand-surface text-brand-muted border-brand-border hover:bg-brand-tertiary"
                  }`}
                  title="Card Grid View"
                >
                  <LayoutGrid className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Urgency Filter Badges */}
            <div className="flex items-center gap-1.5 flex-wrap pt-3 border-t border-brand-border/60">
              <span className="text-[11px] font-extrabold text-brand-muted uppercase tracking-wider mr-1">
                Urgency:
              </span>
              {["ALL", "CRITICAL", "HIGH", "MEDIUM", "LOW"].map((urg) => (
                <button
                  key={urg}
                  onClick={() => setSelectedUrgencyFilter(urg)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    selectedUrgencyFilter === urg
                      ? "bg-brand-primary text-white shadow-xs"
                      : "text-brand-muted hover:text-brand-secondary hover:bg-brand-tertiary"
                  }`}
                >
                  {urg === "ALL" ? "All Urgencies" : urg}
                </button>
              ))}
            </div>
          </section>

          {/* Task List Content */}
          <section className="rounded-2xl bg-brand-surface border border-brand-border shadow-sm overflow-hidden">
            {/* Table Header Bar */}
            <div className="p-4 border-b border-brand-border flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-brand-surface">
              <div>
                <h2 className="text-sm font-bold text-brand-secondary flex items-center gap-2">
                  <span>Maintenance Queue & Task Registry</span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-brand-blue-light text-brand-primary border border-brand-primary/20 font-bold">
                    {filteredTasks.length} of {tasks.length}
                  </span>
                </h2>
                <p className="text-xs text-brand-muted mt-0.5 font-medium">
                  Corridor maintenance requirements and duration bounds
                </p>
              </div>

              <div className="text-xs text-brand-muted font-mono">
                REST Endpoint: <code className="text-brand-primary bg-brand-blue-light px-2 py-0.5 rounded border border-brand-primary/20 font-bold">/railways/maintenance-tasks/</code>
              </div>
            </div>

            {/* View Switching */}
            {loadingTasks || loadingAssets ? (
              <div className="py-16 text-center text-brand-muted">
                <div className="flex flex-col items-center justify-center gap-2">
                  <RefreshCw className="w-7 h-7 animate-spin text-brand-primary" />
                  <span className="text-xs font-bold text-brand-secondary">Loading maintenance tasks...</span>
                </div>
              </div>
            ) : filteredTasks.length === 0 ? (
              <div className="py-16 text-center text-brand-muted">
                <div className="flex flex-col items-center justify-center gap-3">
                  <Wrench className="w-10 h-10 text-brand-muted opacity-60" />
                  <div className="text-sm font-bold text-brand-secondary">
                    No maintenance tasks found
                  </div>
                  <p className="text-xs text-brand-muted max-w-md">
                    Schedule preventive maintenance or block windows for your assets.
                  </p>
                  <button
                    onClick={handleOpenCreateModal}
                    className="mt-2 flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-brand-primary hover:bg-blue-700 text-xs font-bold text-white shadow-xs transition-colors cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    Schedule First Task
                  </button>
                </div>
              </div>
            ) : viewMode === "table" ? (
              /* TABLE VIEW */
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-brand-surface text-brand-muted font-bold uppercase tracking-wider border-b border-brand-border text-[10px]">
                    <tr>
                      <th className="py-3 px-4">Task Code</th>
                      <th className="py-3 px-4">Target Asset</th>
                      <th className="py-3 px-4">Urgency</th>
                      <th className="py-3 px-4">Risk Rating</th>
                      <th className="py-3 px-4">Duration</th>
                      <th className="py-3 px-4">Deadline</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-brand-border/60 text-brand-secondary">
                    {filteredTasks.map((task) => {
                      const urg = URGENCY_CONFIG[task.urgency || "MEDIUM"] || URGENCY_CONFIG.MEDIUM;
                      const stat = STATUS_CONFIG[task.task_status || "PENDING"] || STATUS_CONFIG.PENDING;

                      return (
                        <tr
                          key={task.id}
                          className="hover:bg-brand-tertiary/60 transition-colors group"
                        >
                          <td className="py-3.5 px-4 font-mono font-extrabold text-brand-primary text-sm">
                            {task.task_code}
                          </td>
                          <td className="py-3.5 px-4">
                            <div className="font-extrabold text-brand-secondary">
                              {task.asset_name || `Asset #${task.asset}`}
                            </div>
                            {task.details && (
                              <div className="text-[10px] text-brand-muted truncate max-w-xs font-medium">
                                {task.details}
                              </div>
                            )}
                          </td>
                          <td className="py-3.5 px-4">
                            <span
                              className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10px] font-extrabold border ${urg.badge}`}
                            >
                              <span className={`w-1.5 h-1.5 rounded-full ${urg.dot}`}></span>
                              {task.urgency}
                            </span>
                          </td>
                          <td className="py-3.5 px-4">
                            <span className="font-mono font-bold text-brand-secondary text-xs">
                              {task.risk_rating}/10
                            </span>
                          </td>
                          <td className="py-3.5 px-4 font-mono text-brand-secondary font-bold">
                            {task.estimated_duration} mins
                          </td>
                          <td className="py-3.5 px-4 font-mono text-brand-secondary font-medium">
                            {formatDate(task.deadline)}
                          </td>
                          <td className="py-3.5 px-4">
                            <span
                              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold border ${stat.badge}`}
                            >
                              <stat.icon className="w-3 h-3" />
                              {stat.label}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => setInspectingTask(task)}
                                className="p-1.5 rounded-lg bg-brand-surface hover:bg-brand-tertiary border border-brand-border text-brand-primary shadow-xs transition-colors cursor-pointer"
                                title="Inspect Task"
                              >
                                <Eye className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleOpenEditModal(task)}
                                className="p-1.5 rounded-lg bg-brand-surface hover:bg-brand-tertiary border border-brand-border text-brand-primary shadow-xs transition-colors cursor-pointer"
                                title="Edit Task"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => setDeletingTask(task)}
                                className="p-1.5 rounded-lg bg-brand-surface hover:bg-red-50 border border-brand-border hover:border-red-200 text-red-600 shadow-xs transition-colors cursor-pointer"
                                title="Delete Task"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
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
                  const urg = URGENCY_CONFIG[task.urgency || "MEDIUM"] || URGENCY_CONFIG.MEDIUM;
                  const stat = STATUS_CONFIG[task.task_status || "PENDING"] || STATUS_CONFIG.PENDING;

                  return (
                    <div
                      key={task.id}
                      className="p-4 rounded-xl bg-brand-surface border border-brand-border hover:border-brand-primary/50 transition-all flex flex-col justify-between space-y-3 shadow-sm"
                    >
                      <div className="space-y-2">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <span className="font-mono font-black text-brand-primary text-sm">
                              {task.task_code}
                            </span>
                            <h3 className="text-sm font-bold text-brand-secondary">
                              {task.asset_name || `Asset #${task.asset}`}
                            </h3>
                          </div>
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-extrabold border ${urg.badge}`}
                          >
                            <span className={`w-1.5 h-1.5 rounded-full ${urg.dot}`}></span>
                            {task.urgency}
                          </span>
                        </div>

                        {task.details && (
                          <p className="text-xs text-brand-muted line-clamp-2 font-medium">
                            {task.details}
                          </p>
                        )}

                        <div className="space-y-1 pt-1 text-xs">
                          <div className="flex items-center justify-between text-brand-muted">
                            <span>Duration:</span>
                            <span className="font-mono font-bold text-brand-secondary">
                              {task.estimated_duration} mins
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-brand-muted">
                            <span>Risk Rating:</span>
                            <span className="font-mono font-bold text-brand-secondary">
                              {task.risk_rating}/10
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-brand-muted">
                            <span>Deadline:</span>
                            <span className="font-mono text-brand-secondary font-medium">
                              {formatDate(task.deadline)}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-brand-border flex items-center justify-between">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold border ${stat.badge}`}
                        >
                          <stat.icon className="w-3 h-3" />
                          {stat.label}
                        </span>

                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => setInspectingTask(task)}
                            className="p-1.5 rounded-lg bg-brand-surface hover:bg-brand-tertiary border border-brand-border text-brand-primary transition-colors cursor-pointer"
                            title="Inspect"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleOpenEditModal(task)}
                            className="p-1.5 rounded-lg bg-brand-surface hover:bg-brand-tertiary border border-brand-border text-brand-primary transition-colors cursor-pointer"
                            title="Edit"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setDeletingTask(task)}
                            className="p-1.5 rounded-lg bg-brand-surface hover:bg-red-50 border border-brand-border text-red-600 transition-colors cursor-pointer"
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

      {/* MODAL 1: Create or Edit Task */}
      {isFormModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-brand-surface border border-brand-border rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-brand-border">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-brand-blue-light text-brand-primary flex items-center justify-center">
                  <Wrench className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-brand-secondary">
                    {editingTask ? `Edit Task ${editingTask.task_code}` : "Schedule Maintenance Task"}
                  </h3>
                  <p className="text-xs text-brand-muted">
                    {editingTask ? "PUT /railways/maintenance-tasks/:id/" : "POST /railways/maintenance-tasks/"}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsFormModalOpen(false)}
                className="text-brand-muted hover:text-brand-secondary text-lg font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmitForm} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-extrabold text-brand-secondary block mb-1">
                    Task Code <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. TMS-001"
                    value={formData.task_code}
                    onChange={(e) => setFormData({ ...formData, task_code: e.target.value })}
                    required
                    className="w-full bg-brand-surface border border-brand-border focus:border-brand-primary text-brand-secondary text-xs rounded-xl px-3.5 py-2.5 outline-none font-bold shadow-2xs"
                  />
                </div>

                <div>
                  <label className="font-extrabold text-brand-secondary block mb-1">
                    Target Asset <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.asset}
                    onChange={(e) => setFormData({ ...formData, asset: Number(e.target.value) })}
                    required
                    className="w-full bg-brand-surface border border-brand-border focus:border-brand-primary text-brand-secondary text-xs rounded-xl px-3.5 py-2.5 outline-none cursor-pointer font-bold shadow-2xs"
                  >
                    {assets.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.asset_title} (#{a.id})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="font-extrabold text-brand-secondary block mb-1">
                  Task Details / Work Scope
                </label>
                <textarea
                  rows={2}
                  placeholder="Describe maintenance scope, required track possession, personnel..."
                  value={formData.details || ""}
                  onChange={(e) => setFormData({ ...formData, details: e.target.value })}
                  className="w-full bg-brand-surface border border-brand-border focus:border-brand-primary text-brand-secondary text-xs rounded-xl px-3.5 py-2 outline-none font-medium shadow-2xs"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-extrabold text-brand-secondary block mb-1">
                    Urgency Level
                  </label>
                  <select
                    value={formData.urgency}
                    onChange={(e) => setFormData({ ...formData, urgency: e.target.value as MaintenancePriority })}
                    className="w-full bg-brand-surface border border-brand-border focus:border-brand-primary text-brand-secondary text-xs rounded-xl px-3.5 py-2.5 outline-none cursor-pointer font-bold shadow-2xs"
                  >
                    <option value="CRITICAL">CRITICAL</option>
                    <option value="HIGH">HIGH</option>
                    <option value="MEDIUM">MEDIUM</option>
                    <option value="LOW">LOW</option>
                  </select>
                </div>

                <div>
                  <label className="font-extrabold text-brand-secondary block mb-1">
                    Status
                  </label>
                  <select
                    value={formData.task_status}
                    onChange={(e) => setFormData({ ...formData, task_status: e.target.value as MaintenanceStatus })}
                    className="w-full bg-brand-surface border border-brand-border focus:border-brand-primary text-brand-secondary text-xs rounded-xl px-3.5 py-2.5 outline-none cursor-pointer font-bold shadow-2xs"
                  >
                    <option value="PENDING">PENDING</option>
                    <option value="SCHEDULED">SCHEDULED</option>
                    <option value="COMPLETED">COMPLETED</option>
                    <option value="CANCELLED">CANCELLED</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-extrabold text-brand-secondary block mb-1">
                    Estimated Duration (Mins)
                  </label>
                  <input
                    type="number"
                    min={5}
                    step={5}
                    value={formData.estimated_duration}
                    onChange={(e) => setFormData({ ...formData, estimated_duration: Number(e.target.value) })}
                    required
                    className="w-full bg-brand-surface border border-brand-border focus:border-brand-primary text-brand-secondary text-xs rounded-xl px-3.5 py-2 outline-none font-mono font-bold shadow-2xs"
                  />
                </div>

                <div>
                  <label className="font-extrabold text-brand-secondary block mb-1">
                    Completion Deadline
                  </label>
                  <input
                    type="date"
                    value={formData.deadline || ""}
                    onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                    className="w-full bg-brand-surface border border-brand-border focus:border-brand-primary text-brand-secondary text-xs rounded-xl px-3.5 py-2 outline-none cursor-pointer font-bold shadow-2xs"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-brand-border">
                <button
                  type="button"
                  onClick={() => setIsFormModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-brand-surface hover:bg-brand-tertiary border border-brand-border text-xs font-bold text-brand-secondary transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-4 py-2 rounded-xl bg-brand-primary hover:bg-blue-700 text-xs font-bold text-white shadow-xs transition-all disabled:opacity-50 cursor-pointer"
                >
                  {isSaving ? "Saving..." : editingTask ? "Update Task" : "Save Task"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: Inspect Task Details */}
      {inspectingTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-brand-surface border border-brand-border rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-brand-border">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-brand-blue-light text-brand-primary flex items-center justify-center">
                  <Eye className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-brand-secondary">
                    {inspectingTask.task_code}
                  </h3>
                  <span className="text-xs text-brand-muted">Task ID #{inspectingTask.id}</span>
                </div>
              </div>
              <button
                onClick={() => setInspectingTask(null)}
                className="text-brand-muted hover:text-brand-secondary text-lg font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-brand-tertiary border border-brand-border">
                <span className="text-brand-muted block text-[10px] uppercase font-bold">Target Asset</span>
                <span className="font-bold text-brand-secondary mt-0.5 block">{inspectingTask.asset_name || `Asset #${inspectingTask.asset}`}</span>
              </div>
              <div className="p-3 rounded-xl bg-brand-tertiary border border-brand-border">
                <span className="text-brand-muted block text-[10px] uppercase font-bold">Urgency</span>
                <span className="font-bold text-brand-primary mt-0.5 block">{inspectingTask.urgency}</span>
              </div>
              <div className="p-3 rounded-xl bg-brand-tertiary border border-brand-border">
                <span className="text-brand-muted block text-[10px] uppercase font-bold">Duration</span>
                <span className="font-bold text-brand-secondary mt-0.5 block font-mono">{inspectingTask.estimated_duration} mins</span>
              </div>
              <div className="p-3 rounded-xl bg-brand-tertiary border border-brand-border">
                <span className="text-brand-muted block text-[10px] uppercase font-bold">Deadline</span>
                <span className="font-bold text-brand-secondary mt-0.5 block font-mono">{formatDate(inspectingTask.deadline)}</span>
              </div>
              {inspectingTask.details && (
                <div className="col-span-2 p-3 rounded-xl bg-brand-tertiary border border-brand-border">
                  <span className="text-brand-muted block text-[10px] uppercase font-bold">Work Scope Details</span>
                  <span className="font-medium text-brand-secondary mt-0.5 block">{inspectingTask.details}</span>
                </div>
              )}
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setInspectingTask(null)}
                className="px-4 py-2 rounded-xl bg-brand-surface hover:bg-brand-tertiary border border-brand-border text-xs font-bold text-brand-secondary transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: Delete Confirmation */}
      {deletingTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-brand-surface border border-brand-border rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-red-50 text-red-600 flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-brand-secondary">Confirm Delete</h3>
                <p className="text-xs text-brand-muted mt-0.5">
                  Are you sure you want to delete task <span className="font-bold text-brand-secondary">"{deletingTask.task_code}"</span>?
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-brand-border">
              <button
                onClick={() => setDeletingTask(null)}
                className="px-4 py-2 rounded-xl bg-brand-surface hover:bg-brand-tertiary border border-brand-border text-xs font-bold text-brand-secondary transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-xs font-bold text-white shadow-xs transition-colors disabled:opacity-50 cursor-pointer"
              >
                {isDeleting ? "Deleting..." : "Delete Task"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
