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
  Table as TableIcon,
  ShieldAlert,
  Zap,
  Hourglass,
  Timer,
  ArrowRight,
  Info,
  MapPin,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useMaintenanceTasks,
  useAssets,
  useRailwaySections,
  useBlockWindows,
  useCheckBlockConflict,
  useFeasibleWindows,
  useCreateMaintenanceTask,
  useUpdateMaintenanceTask,
  useDeleteMaintenanceTask,
} from "@/hooks";
import {
  MaintenanceTask,
  CreateMaintenanceTaskInput,
  ConflictCheckResponse,
  FeasibleWindowsResponse,
} from "@/types";
import {
  MaintenancePriority,
  MaintenanceStatus,
  MAINTENANCE_PRIORITY_LABELS,
  MAINTENANCE_STATUS_LABELS,
} from "@/enums";

// Urgency metadata & styling (Light brand tokens)
const URGENCY_CONFIG: Record<
  MaintenancePriority,
  { label: string; color: string; badge: string; dot: string }
> = {
  [MaintenancePriority.CRITICAL]: {
    label: `${MAINTENANCE_PRIORITY_LABELS[MaintenancePriority.CRITICAL]} Urgency`,
    color: "text-red-700",
    badge: "bg-red-50 border-red-200 text-red-700",
    dot: "bg-red-500 animate-pulse",
  },
  [MaintenancePriority.HIGH]: {
    label: `${MAINTENANCE_PRIORITY_LABELS[MaintenancePriority.HIGH]} Urgency`,
    color: "text-orange-700",
    badge: "bg-orange-50 border-orange-200 text-orange-700",
    dot: "bg-orange-500",
  },
  [MaintenancePriority.MEDIUM]: {
    label: `${MAINTENANCE_PRIORITY_LABELS[MaintenancePriority.MEDIUM]} Urgency`,
    color: "text-amber-700",
    badge: "bg-amber-50 border-amber-200 text-amber-700",
    dot: "bg-amber-500",
  },
  [MaintenancePriority.LOW]: {
    label: `${MAINTENANCE_PRIORITY_LABELS[MaintenancePriority.LOW]} Urgency`,
    color: "text-brand-primary",
    badge: "bg-brand-blue-light border-blue-200 text-brand-primary",
    dot: "bg-brand-primary",
  },
};

// Status metadata & styling (Light brand tokens)
const STATUS_CONFIG: Record<
  MaintenanceStatus,
  { label: string; badge: string; icon: typeof Clock }
> = {
  [MaintenanceStatus.PENDING]: {
    label: MAINTENANCE_STATUS_LABELS[MaintenanceStatus.PENDING],
    badge: "bg-amber-50 border-amber-200 text-amber-700",
    icon: Hourglass,
  },
  [MaintenanceStatus.SCHEDULED]: {
    label: MAINTENANCE_STATUS_LABELS[MaintenanceStatus.SCHEDULED],
    badge: "bg-brand-blue-light border-blue-200 text-brand-primary",
    icon: Clock,
  },
  [MaintenanceStatus.COMPLETED]: {
    label: MAINTENANCE_STATUS_LABELS[MaintenanceStatus.COMPLETED],
    badge: "bg-emerald-50 border-emerald-200 text-emerald-700",
    icon: CheckCircle2,
  },
  [MaintenanceStatus.CANCELLED]: {
    label: MAINTENANCE_STATUS_LABELS[MaintenanceStatus.CANCELLED],
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

// ---------------------------------------------------------------------------
// Full-page skeleton shown on initial load until ALL data sources resolve
// ---------------------------------------------------------------------------
function MaintenancePageSkeleton() {
  return (
    <div className="min-h-screen bg-brand-tertiary text-brand-secondary flex flex-col font-sans">
      <div className="flex-1 flex pl-20 lg:pl-64">
        <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-7 flex flex-col space-y-5 max-w-[1600px] mx-auto w-full">

          {/* Header */}
          <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-brand-border/80">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2.5">
                <Skeleton className="w-8 h-8 rounded-full" />
                <Skeleton className="h-7 w-80" />
              </div>
              <Skeleton className="h-3 w-96" />
            </div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <Skeleton className="h-8 w-32 rounded-xl" />
              <Skeleton className="h-8 w-32 rounded-xl" />
              <Skeleton className="h-8 w-32 rounded-xl" />
              <Skeleton className="h-8 w-24 rounded-xl" />
              <Skeleton className="h-8 w-36 rounded-xl" />
            </div>
          </header>

          {/* KPI Cards */}
          <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {["Total Tasks","Pending Execution","Scheduled Blocks","Critical Priority","Total Block Time"].map((label) => (
              <div key={label} className="p-4 rounded-2xl bg-brand-surface border border-brand-border shadow-sm flex items-start gap-3.5">
                <Skeleton className="w-9 h-9 rounded-full shrink-0" />
                <div className="space-y-1.5">
                  <Skeleton className="h-3 w-24" />
                  <Skeleton className="h-8 w-14" />
                  <Skeleton className="h-2.5 w-28" />
                </div>
              </div>
            ))}
          </section>

          {/* Filter Bar */}
          <section className="p-4 sm:p-5 rounded-2xl bg-brand-surface border border-brand-border shadow-sm space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 items-center">
              <div className="lg:col-span-4"><Skeleton className="h-9 w-full rounded-xl" /></div>
              <div className="lg:col-span-3"><Skeleton className="h-9 w-full rounded-xl" /></div>
              <div className="lg:col-span-2"><Skeleton className="h-9 w-full rounded-xl" /></div>
              <div className="lg:col-span-2"><Skeleton className="h-9 w-full rounded-xl" /></div>
              <div className="lg:col-span-1 flex justify-end gap-1.5">
                <Skeleton className="w-9 h-9 rounded-xl" />
                <Skeleton className="w-9 h-9 rounded-xl" />
              </div>
            </div>
            <div className="flex items-center gap-2 pt-3 border-t border-brand-border/60">
              <Skeleton className="h-3 w-16" />
              {[1,2,3,4,5].map((i) => <Skeleton key={i} className="h-6 w-20 rounded-lg" />)}
            </div>
          </section>

          {/* Table */}
          <section className="rounded-2xl bg-brand-surface border border-brand-border shadow-sm overflow-hidden">
            <div className="p-4 border-b border-brand-border flex items-center justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Skeleton className="h-5 w-48" />
                  <Skeleton className="h-5 w-16 rounded-full" />
                </div>
                <Skeleton className="h-3 w-64" />
              </div>
              <Skeleton className="h-5 w-36 rounded" />
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-brand-surface border-b border-brand-border">
                  <tr>
                    {["ID","Task Code","Asset","Corridor","Urgency","Status","Risk","Deadline","Duration","Actions"].map((h) => (
                      <th key={h} className="py-3 px-3"><Skeleton className="h-3 w-14" /></th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-brand-border/60">
                  {Array.from({ length: 7 }).map((_, idx) => (
                    <tr key={idx}>
                      <td className="py-3 px-3"><Skeleton className="h-4 w-6" /></td>
                      <td className="py-3 px-3"><Skeleton className="h-5 w-20 rounded-md" /></td>
                      <td className="py-3 px-3">
                        <div className="space-y-1">
                          <Skeleton className="h-4 w-32" />
                          <Skeleton className="h-2.5 w-16" />
                        </div>
                      </td>
                      <td className="py-3 px-3"><Skeleton className="h-4 w-28" /></td>
                      <td className="py-3 px-3"><Skeleton className="h-5 w-20 rounded-full" /></td>
                      <td className="py-3 px-3"><Skeleton className="h-5 w-24 rounded-full" /></td>
                      <td className="py-3 px-3"><Skeleton className="h-4 w-10" /></td>
                      <td className="py-3 px-3"><Skeleton className="h-4 w-20" /></td>
                      <td className="py-3 px-3"><Skeleton className="h-4 w-12" /></td>
                      <td className="py-3 px-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Skeleton className="w-7 h-7 rounded-lg" />
                          <Skeleton className="w-7 h-7 rounded-lg" />
                          <Skeleton className="w-7 h-7 rounded-lg" />
                          <Skeleton className="w-7 h-7 rounded-lg" />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

        </main>
      </div>
    </div>
  );
}

export default function MaintenancePage() {
  const [activeNavTab, setActiveNavTab] = useState<string>("maintenance");

  // TanStack Query Hooks
  const { data: tasks = [], isLoading: loadingTasks, isRefetching: refetchingTasks, refetch: refetchTasks } = useMaintenanceTasks();
  const { data: assets = [], isLoading: loadingAssets, refetch: refetchAssets } = useAssets();
  const { data: sections = [] } = useRailwaySections();
  const { data: blockWindows = [], isLoading: loadingBlockWindows } = useBlockWindows();

  // Gate: show full-page skeleton until every first-load fetch resolves
  const isPageLoading = loadingTasks || loadingAssets || loadingBlockWindows;

  // Mutations
  const createTaskMutation = useCreateMaintenanceTask();
  const updateTaskMutation = useUpdateMaintenanceTask();
  const deleteTaskMutation = useDeleteMaintenanceTask();
  const checkConflictMutation = useCheckBlockConflict();
  const feasibleWindowsMutation = useFeasibleWindows();

  // Filters & State
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedCorridorFilter, setSelectedCorridorFilter] = useState<string>("ALL");
  const [selectedUrgencyFilter, setSelectedUrgencyFilter] = useState<string>("ALL");
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>("ALL");
  const [selectedAssetFilter, setSelectedAssetFilter] = useState<string>("ALL");
  const [viewMode, setViewMode] = useState<"table">("table");
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

  // Conflict Modal State
  const [isConflictModalOpen, setIsConflictModalOpen] = useState<boolean>(false);
  const [conflictForm, setConflictForm] = useState<{
    section: number;
    maintenance_start: string;
    maintenance_end: string;
  }>({
    section: 1,
    maintenance_start: "2026-09-04 02:00:00",
    maintenance_end: "2026-09-04 05:00:00",
  });
  const [conflictResult, setConflictResult] = useState<ConflictCheckResponse | null>(null);
  const [conflictError, setConflictError] = useState<string | null>(null);

  // Feasible Windows Modal State
  const [isFeasibleModalOpen, setIsFeasibleModalOpen] = useState<boolean>(false);
  const [feasibleForm, setFeasibleForm] = useState<{
    task_id: string;
    block_window_id: number;
  }>({
    task_id: "",
    block_window_id: 0,
  });
  const [feasibleResult, setFeasibleResult] = useState<FeasibleWindowsResponse | null>(null);
  const [feasibleError, setFeasibleError] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState<CreateMaintenanceTaskInput>({
    task_code: "",
    asset: 1,
    details: "",
    risk_rating: 8,
    urgency: MaintenancePriority.HIGH,
    deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    estimated_duration: 45,
    task_status: MaintenanceStatus.PENDING,
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
      urgency: MaintenancePriority.HIGH,
      deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      estimated_duration: 45,
      task_status: MaintenanceStatus.PENDING,
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

  // Conflict Modal Handlers
  const handleOpenConflictModal = (sectionId?: number) => {
    setConflictError(null);
    setConflictResult(null);

    const defaultSection = sectionId || (sections[0]?.id ? Number(sections[0].id) : 1);

    setConflictForm({
      section: defaultSection,
      maintenance_start: "2026-09-04 02:00:00",
      maintenance_end: "2026-09-04 05:00:00",
    });
    setIsConflictModalOpen(true);
  };

  const handleRunConflictCheck = (e: React.FormEvent) => {
    e.preventDefault();
    setConflictError(null);
    setConflictResult(null);

    let start = conflictForm.maintenance_start.replace("T", " ");
    if (start.length === 16) start += ":00";
    let end = conflictForm.maintenance_end.replace("T", " ");
    if (end.length === 16) end += ":00";

    checkConflictMutation.mutate(
      {
        section: Number(conflictForm.section),
        maintenance_start: start,
        maintenance_end: end,
      },
      {
        onSuccess: (data) => {
          setConflictResult(data ?? null);
        },
        onError: (err) => {
          setConflictError(err instanceof Error ? err.message : "Failed to run conflict check");
        },
      }
    );
  };

  // Feasible Windows Modal Handlers
  const handleOpenFeasibleModal = (task?: MaintenanceTask) => {
    setFeasibleError(null);
    setFeasibleResult(null);

    const targetTask = task || (tasks.length > 0 ? tasks[0] : null);
    const targetTaskId = targetTask ? targetTask.task_code : "";
    let preferredWindowId = 0;

    if (targetTask) {
      const taskAsset = assets.find((a) => a.id === targetTask.asset);
      const secId = taskAsset?.section;
      const secName = targetTask.section_name || taskAsset?.section_name;
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
      if (matchingBw) preferredWindowId = matchingBw.id;
    }

    setFeasibleForm({
      task_id: targetTaskId,
      block_window_id: preferredWindowId,
    });
    setIsFeasibleModalOpen(true);
  };

  // Selected task in Feasible Window modal
  const selectedFeasibleTask = useMemo(() => {
    return tasks.find((t) => t.task_code === feasibleForm.task_id) || null;
  }, [tasks, feasibleForm.task_id]);

  const selectedFeasibleTaskAsset = useMemo(() => {
    if (!selectedFeasibleTask) return null;
    return assets.find((a) => a.id === selectedFeasibleTask.asset) || null;
  }, [assets, selectedFeasibleTask]);

  // Section ID & Name for the maintenance task
  const selectedFeasibleSectionId = selectedFeasibleTaskAsset?.section ?? null;
  const selectedFeasibleSectionName =
    selectedFeasibleTask?.section_name || selectedFeasibleTaskAsset?.section_name || "";

  // Filter block windows ONLY for that section
  const sectionBlockWindows = useMemo(() => {
    if (!selectedFeasibleTask) return [];
    return blockWindows.filter((bw) => {
      if (selectedFeasibleSectionId && Number(bw.section) === Number(selectedFeasibleSectionId)) {
        return true;
      }
      if (
        selectedFeasibleSectionName &&
        bw.section_name &&
        bw.section_name.trim().toLowerCase() === selectedFeasibleSectionName.trim().toLowerCase()
      ) {
        return true;
      }
      return false;
    });
  }, [selectedFeasibleTask, selectedFeasibleSectionId, selectedFeasibleSectionName, blockWindows]);

  const handleRunFeasibleCheck = (e: React.FormEvent) => {
    e.preventDefault();
    setFeasibleError(null);
    setFeasibleResult(null);

    if (!feasibleForm.task_id.trim()) {
      setFeasibleError("Please specify a valid Task Code.");
      return;
    }
    if (!feasibleForm.block_window_id) {
      setFeasibleError("Please select an available block window for this corridor.");
      return;
    }

    feasibleWindowsMutation.mutate(
      {
        task_id: feasibleForm.task_id,
        block_window_id: Number(feasibleForm.block_window_id),
      },
      {
        onSuccess: (data) => {
          setFeasibleResult(data ?? null);
        },
        onError: (err) => {
          setFeasibleError(err instanceof Error ? err.message : "Failed to calculate feasible windows");
        },
      }
    );
  };

  // Available Corridors for filtering
  const availableCorridors = useMemo(() => {
    const list = new Map<string, string>();
    sections.forEach((s) => {
      if (s.section_name) {
        list.set(s.section_name, s.section_name);
      }
    });
    tasks.forEach((t) => {
      if (t.section_name && !list.has(t.section_name)) {
        list.set(t.section_name, t.section_name);
      }
    });
    return Array.from(list.entries()).map(([key, label]) => ({ key, label }));
  }, [sections, tasks]);

  // Filtered Tasks
  const filteredTasks = useMemo(() => {
    return tasks.filter((t) => {
      const taskAsset = assets.find((a) => a.id === t.asset);
      const corridorName = t.section_name || taskAsset?.section_name;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchCode = t.task_code?.toLowerCase().includes(q);
        const matchAsset = t.asset_name?.toLowerCase().includes(q);
        const matchDetails = t.details?.toLowerCase().includes(q);
        const matchId = String(t.id).includes(q);
        const matchCorridor = corridorName?.toLowerCase().includes(q);
        if (!matchCode && !matchAsset && !matchDetails && !matchId && !matchCorridor) return false;
      }

      if (selectedCorridorFilter !== "ALL" && corridorName !== selectedCorridorFilter) {
        return false;
      }

      if (selectedUrgencyFilter !== "ALL" && t.urgency !== selectedUrgencyFilter) return false;
      if (selectedStatusFilter !== "ALL" && t.task_status !== selectedStatusFilter) return false;
      if (selectedAssetFilter !== "ALL" && String(t.asset) !== selectedAssetFilter) return false;

      return true;
    });
  }, [
    tasks,
    assets,
    searchQuery,
    selectedCorridorFilter,
    selectedUrgencyFilter,
    selectedStatusFilter,
    selectedAssetFilter,
  ]);

  // Metric Summary
  const stats = useMemo(() => {
    const total = tasks.length;
    const pendingCount = tasks.filter((t) => t.task_status === MaintenanceStatus.PENDING).length;
    const scheduledCount = tasks.filter((t) => t.task_status === MaintenanceStatus.SCHEDULED).length;
    const criticalCount = tasks.filter(
      (t) => t.urgency === MaintenancePriority.CRITICAL || t.risk_rating >= 8
    ).length;
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

  if (isPageLoading) {
    return (
      <div className="min-h-screen bg-brand-tertiary flex flex-col font-sans">
        <VerticalNavbar activeTab={activeNavTab} onTabChange={setActiveNavTab} unreadCount={1} />
        <MaintenancePageSkeleton />
      </div>
    );
  }

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
            <div className="flex items-center gap-2.5 flex-wrap">
              <LiveClock />

              <button
                onClick={() => handleOpenConflictModal()}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-brand-secondary/80 border text-xs font-bold text-white transition-colors cursor-pointer shadow-2xs"
                title="Run timetable conflict simulation against active train movements"
              >
                <ShieldAlert className="w-3.5 h-3.5 text-white" />
                <span>Check Conflict</span>
              </button>

              <button
                onClick={() => handleOpenFeasibleModal()}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-brand-secondary/80 border text-xs font-bold text-white transition-colors cursor-pointer shadow-2xs"
                title="Find feasible maintenance windows for tasks"
              >
                <Timer className="w-3.5 h-3.5 text-white" />
                <span>Feasible Windows</span>
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
              <div className="w-9 h-9 rounded-full bg-brand-secondary/80 text-white flex items-center justify-center flex-shrink-0 mt-0.5">
                <Wrench className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-bold text-brand-muted mb-0.5">
                  Total Tasks
                </div>
                {loadingTasks ? (
                  <Skeleton className="h-8 w-14 my-0.5 rounded-lg" />
                ) : (
                  <div className="text-2xl font-black text-brand-secondary tracking-tight">{stats.total}</div>
                )}
                <div className="text-[11px] text-brand-muted mt-0.5 font-medium">Across all assets</div>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-brand-surface border border-brand-border shadow-sm flex items-start gap-3.5">
              <div className="w-9 h-9 rounded-full bg-brand-secondary/80 text-white flex items-center justify-center flex-shrink-0 mt-0.5">
                <Hourglass className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-bold text-brand-muted mb-0.5">
                  Pending Execution
                </div>
                {loadingTasks ? (
                  <Skeleton className="h-8 w-14 my-0.5 rounded-lg" />
                ) : (
                  <div className="text-2xl font-black text-black tracking-tight">{stats.pendingCount}</div>
                )}
                <div className="text-[11px] text-brand-muted mt-0.5 font-medium">Needs block allocation</div>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-brand-surface border border-brand-border shadow-sm flex items-start gap-3.5">
              <div className="w-9 h-9 rounded-full bg-brand-secondary/80 text-white flex items-center justify-center flex-shrink-0 mt-0.5">
                <Clock className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-bold text-brand-muted mb-0.5">
                  Scheduled Blocks
                </div>
                {loadingTasks ? (
                  <Skeleton className="h-8 w-14 my-0.5 rounded-lg" />
                ) : (
                  <div className="text-2xl font-black text-black tracking-tight">{stats.scheduledCount}</div>
                )}
                <div className="text-[11px] text-brand-muted mt-0.5 font-medium">Ready for dispatch</div>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-brand-surface border border-brand-border shadow-sm flex items-start gap-3.5">
              <div className="w-9 h-9 rounded-full bg-brand-secondary/80 text-white flex items-center justify-center flex-shrink-0 mt-0.5">
                <ShieldAlert className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-bold text-brand-muted mb-0.5">
                  Critical Priority
                </div>
                {loadingTasks ? (
                  <Skeleton className="h-8 w-14 my-0.5 rounded-lg" />
                ) : (
                  <div className="text-2xl font-black text-black tracking-tight">{stats.criticalCount}</div>
                )}
                <div className="text-[11px] text-brand-muted mt-0.5 font-medium">High risk or urgent</div>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-brand-surface border border-brand-border shadow-sm flex items-start gap-3.5">
              <div className="w-9 h-9 rounded-full bg-brand-secondary/80 text-white flex items-center justify-center flex-shrink-0 mt-0.5">
                <Zap className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-bold text-brand-muted mb-0.5">
                  Total Block Time
                </div>
                {loadingTasks ? (
                  <Skeleton className="h-8 w-20 my-0.5 rounded-lg" />
                ) : (
                  <div className="text-2xl font-black text-brand-secondary tracking-tight">
                    {Math.floor(stats.totalMinutes / 60)}h {stats.totalMinutes % 60}m
                  </div>
                )}
                <div className="text-[11px] text-brand-muted mt-0.5 font-medium">Estimated track occupancy</div>
              </div>
            </div>
          </section>

          {/* Filtering and Controls Bar */}
          <section className="p-4 sm:p-5 rounded-2xl bg-brand-surface border border-brand-border shadow-sm space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 items-center">
              
              {/* Search Bar */}
              <div className="lg:col-span-4 relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-brand-muted" />
                <input
                  type="text"
                  placeholder="Search task code, corridor, asset, details..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-brand-surface border border-brand-border focus:border-brand-primary text-xs text-brand-secondary placeholder:text-brand-muted rounded-xl pl-9 pr-3 py-2.5 outline-none transition-colors font-medium shadow-2xs"
                />
              </div>

              {/* Corridor / Section Filter Dropdown */}
              <div className="lg:col-span-3">
                <select
                  value={selectedCorridorFilter}
                  onChange={(e) => setSelectedCorridorFilter(e.target.value)}
                  className="w-full bg-brand-surface border border-brand-border focus:border-brand-primary text-brand-secondary text-xs rounded-xl px-3.5 py-2.5 outline-none cursor-pointer font-bold shadow-2xs"
                >
                  <option value="ALL">All Corridors ({availableCorridors.length})</option>
                  {availableCorridors.map((c) => (
                    <option key={c.key} value={c.key}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Status Filter Dropdown */}
              <div className="lg:col-span-2">
                <select
                  value={selectedStatusFilter}
                  onChange={(e) => setSelectedStatusFilter(e.target.value)}
                  className="w-full bg-brand-surface border border-brand-border focus:border-brand-primary text-brand-secondary text-xs rounded-xl px-3.5 py-2.5 outline-none cursor-pointer font-bold shadow-2xs"
                >
                  <option value="ALL">All Statuses</option>
                  <option value={MaintenanceStatus.PENDING}>
                    {MAINTENANCE_STATUS_LABELS[MaintenanceStatus.PENDING]}
                  </option>
                  <option value={MaintenanceStatus.SCHEDULED}>
                    {MAINTENANCE_STATUS_LABELS[MaintenanceStatus.SCHEDULED]}
                  </option>
                  <option value={MaintenanceStatus.COMPLETED}>
                    {MAINTENANCE_STATUS_LABELS[MaintenanceStatus.COMPLETED]}
                  </option>
                  <option value={MaintenanceStatus.CANCELLED}>
                    {MAINTENANCE_STATUS_LABELS[MaintenanceStatus.CANCELLED]}
                  </option>
                </select>
              </div>

              {/* Target Asset Filter Dropdown */}
              <div className="lg:col-span-2">
                <select
                  value={selectedAssetFilter}
                  onChange={(e) => setSelectedAssetFilter(e.target.value)}
                  className="w-full bg-brand-surface border border-brand-border focus:border-brand-primary text-brand-secondary text-xs rounded-xl px-3.5 py-2.5 outline-none cursor-pointer font-bold shadow-2xs"
                >
                  <option value="ALL">All Assets</option>
                  {assets.map((a) => (
                    <option key={a.id} value={String(a.id)}>
                      {a.asset_title} (#{a.id})
                    </option>
                  ))}
                </select>
              </div>

              {/* View Mode Toggle */}
              <div className="lg:col-span-1 flex items-center justify-end gap-1.5">
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
              </div>
            </div>

            {/* Urgency Filter Badges */}
            <div className="flex items-center gap-1.5 flex-wrap pt-3 border-t border-brand-border/60">
              <span className="text-xs font-bold text-brand-muted mr-1">
                Urgency:
              </span>
              {["ALL", "Critical", "High", "Medium", "Low"].map((urg) => (
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
                  {loadingTasks || loadingAssets ? (
                    <Skeleton className="h-5 w-14 rounded-full" />
                  ) : (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-brand-blue-light text-brand-primary border border-brand-primary/20 font-bold">
                      {filteredTasks.length} of {tasks.length}
                    </span>
                  )}
                </h2>
                <p className="text-xs text-brand-muted mt-0.5 font-medium">
                  Corridor maintenance requirements and duration bounds
                </p>
              </div>

              <div className="flex items-center gap-3 flex-wrap">
                <div className="text-xs text-brand-muted font-mono">
                  REST Endpoint: <code className="text-brand-primary bg-brand-blue-light px-2 py-0.5 rounded border border-brand-primary/20 font-bold">/railways/maintenance-tasks/</code>
                </div>
                <button
                  onClick={() => { refetchTasks(); refetchAssets(); }}
                  disabled={refetchingTasks || loadingTasks}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-brand-surface hover:bg-brand-tertiary border border-brand-border text-xs font-bold text-brand-secondary transition-colors disabled:opacity-60 cursor-pointer shadow-2xs shrink-0"
                >
                  <RefreshCw className={`w-3.5 h-3.5 text-brand-primary ${refetchingTasks ? "animate-spin" : ""}`} />
                  <span>{refetchingTasks ? "Refreshing..." : "Refresh"}</span>
                </button>
              </div>
            </div>

            {/* View Switching */}
            {(loadingTasks || loadingAssets || refetchingTasks) ? (
              <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-brand-surface text-brand-muted font-semibold border-b border-brand-border text-xs">
                      <tr>
                        <th className="py-3 px-4">Task Code</th>
                        <th className="py-3 px-4">Target Asset</th>
                        <th className="py-3 px-4">Corridor / Section</th>
                        <th className="py-3 px-4">Urgency</th>
                        <th className="py-3 px-4">Risk Rating</th>
                        <th className="py-3 px-4">Duration</th>
                        <th className="py-3 px-4">Deadline</th>
                        <th className="py-3 px-4">Status</th>
                        <th className="py-3 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-brand-border/60">
                      {Array.from({ length: 5 }).map((_, idx) => (
                        <tr key={idx} className="hover:bg-brand-tertiary/40 transition-colors">
                          <td className="py-3.5 px-4 font-mono font-bold">
                            <Skeleton className="h-4 w-20" />
                          </td>
                          <td className="py-3.5 px-4">
                            <div className="space-y-1.5">
                              <Skeleton className="h-4 w-36" />
                              <Skeleton className="h-2.5 w-24" />
                            </div>
                          </td>
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-1.5">
                              <Skeleton className="w-3.5 h-3.5 rounded shrink-0" />
                              <Skeleton className="h-4 w-28" />
                            </div>
                          </td>
                          <td className="py-3.5 px-4">
                            <Skeleton className="h-5 w-20 rounded-md" />
                          </td>
                          <td className="py-3.5 px-4 font-mono">
                            <Skeleton className="h-4 w-12" />
                          </td>
                          <td className="py-3.5 px-4 font-mono">
                            <Skeleton className="h-4 w-16" />
                          </td>
                          <td className="py-3.5 px-4 font-mono">
                            <div className="flex items-center gap-1.5">
                              <Skeleton className="w-3.5 h-3.5 rounded-full shrink-0" />
                              <Skeleton className="h-3.5 w-20 rounded" />
                            </div>
                          </td>
                          <td className="py-3.5 px-4">
                            <Skeleton className="h-5 w-20 rounded-md" />
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <Skeleton className="w-7 h-7 rounded-lg" />
                              <Skeleton className="w-7 h-7 rounded-lg" />
                              <Skeleton className="w-7 h-7 rounded-lg" />
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
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
            ) : (
              /* TABLE VIEW */
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-brand-surface text-brand-muted font-semibold border-b border-brand-border text-xs">
                    <tr>
                      <th className="py-3 px-4">Task Code</th>
                      <th className="py-3 px-4">Target Asset</th>
                      <th className="py-3 px-4">Corridor / Section</th>
                      <th className="py-3 px-4">Risk Rating</th>
                      <th className="py-3 px-4">Duration</th>
                      <th className="py-3 px-4">Deadline</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-brand-border/60 text-brand-secondary">
                    {filteredTasks.map((task) => {
                      const urgKey = (task.urgency as MaintenancePriority) || MaintenancePriority.MEDIUM;
                      const statKey = (task.task_status as MaintenanceStatus) || MaintenanceStatus.PENDING;
                      const urg = URGENCY_CONFIG[urgKey] || URGENCY_CONFIG[MaintenancePriority.MEDIUM];
                      const stat = STATUS_CONFIG[statKey] || STATUS_CONFIG[MaintenanceStatus.PENDING];
                      const taskAsset = assets.find((a) => a.id === task.asset);
                      const corridorName = task.section_name || taskAsset?.section_name || "General Corridor";

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
                          </td>
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-1.5 font-semibold text-brand-secondary text-xs">
                              <MapPin className="w-3.5 h-3.5 text-brand-primary shrink-0" />
                              <span>{corridorName}</span>
                            </div>
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
                    <option value={MaintenancePriority.CRITICAL}>{MaintenancePriority.CRITICAL} ({MAINTENANCE_PRIORITY_LABELS[MaintenancePriority.CRITICAL]})</option>
                    <option value={MaintenancePriority.HIGH}>{MaintenancePriority.HIGH} ({MAINTENANCE_PRIORITY_LABELS[MaintenancePriority.HIGH]})</option>
                    <option value={MaintenancePriority.MEDIUM}>{MaintenancePriority.MEDIUM} ({MAINTENANCE_PRIORITY_LABELS[MaintenancePriority.MEDIUM]})</option>
                    <option value={MaintenancePriority.LOW}>{MaintenancePriority.LOW} ({MAINTENANCE_PRIORITY_LABELS[MaintenancePriority.LOW]})</option>
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
                    <option value={MaintenanceStatus.PENDING}>{MaintenanceStatus.PENDING} ({MAINTENANCE_STATUS_LABELS[MaintenanceStatus.PENDING]})</option>
                    <option value={MaintenanceStatus.SCHEDULED}>{MaintenanceStatus.SCHEDULED} ({MAINTENANCE_STATUS_LABELS[MaintenanceStatus.SCHEDULED]})</option>
                    <option value={MaintenanceStatus.COMPLETED}>{MaintenanceStatus.COMPLETED} ({MAINTENANCE_STATUS_LABELS[MaintenanceStatus.COMPLETED]})</option>
                    <option value={MaintenanceStatus.CANCELLED}>{MaintenanceStatus.CANCELLED} ({MAINTENANCE_STATUS_LABELS[MaintenanceStatus.CANCELLED]})</option>
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

              <div className="p-3 rounded-xl bg-brand-tertiary/60 border border-brand-border space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="font-extrabold text-brand-secondary">
                    Risk / Severity Rating (1 - 10)
                  </label>
                  <span className="font-mono font-black text-brand-primary">
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
                  className="w-full accent-brand-primary cursor-pointer h-2 bg-brand-border rounded-lg"
                />
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
                <span className="text-brand-muted block text-xs font-semibold">Target Asset</span>
                <span className="font-bold text-brand-secondary mt-0.5 block">{inspectingTask.asset_name || `Asset #${inspectingTask.asset}`}</span>
              </div>
              <div className="p-3 rounded-xl bg-brand-tertiary border border-brand-border">
                <span className="text-brand-muted block text-xs font-semibold">Corridor / Section</span>
                <span className="font-bold text-brand-secondary mt-0.5 block flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-brand-primary shrink-0" />
                  {inspectingTask.section_name || assets.find((a) => a.id === inspectingTask.asset)?.section_name || "General Corridor"}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-brand-tertiary border border-brand-border">
                <span className="text-brand-muted block text-xs font-semibold">Urgency</span>
                <span className="font-bold text-brand-primary mt-0.5 block">{inspectingTask.urgency}</span>
              </div>
              <div className="p-3 rounded-xl bg-brand-tertiary border border-brand-border">
                <span className="text-brand-muted block text-xs font-semibold">Duration</span>
                <span className="font-bold text-brand-secondary mt-0.5 block font-mono">{inspectingTask.estimated_duration} mins</span>
              </div>
              <div className="p-3 rounded-xl bg-brand-tertiary border border-brand-border">
                <span className="text-brand-muted block text-xs font-semibold">Deadline</span>
                <span className="font-bold text-brand-secondary mt-0.5 block font-mono">{formatDate(inspectingTask.deadline)}</span>
              </div>
              {inspectingTask.details && (
                <div className="col-span-2 p-3 rounded-xl bg-brand-tertiary border border-brand-border">
                  <span className="text-brand-muted block text-xs font-semibold">Work Scope Details</span>
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

      {/* MODAL 4: Timetable Conflict Detection Engine */}
      {isConflictModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-brand-surface border border-brand-border rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-brand-border">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center">
                  <ShieldAlert className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-brand-secondary">
                    Timetable Conflict Detector
                  </h3>
                  <p className="text-xs text-brand-muted">
                    Simulate maintenance block windows against active train movements
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsConflictModalOpen(false)}
                className="text-brand-muted hover:text-brand-secondary text-lg font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleRunConflictCheck} className="space-y-4">
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-brand-secondary mb-1">
                    Railway Section <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={conflictForm.section}
                    onChange={(e) =>
                      setConflictForm({ ...conflictForm, section: Number(e.target.value) })
                    }
                    className="w-full px-3 py-2 rounded-xl bg-brand-surface border border-brand-border text-brand-secondary text-xs focus:outline-hidden focus:border-brand-primary cursor-pointer"
                    required
                  >
                    {sections.map((sec) => (
                      <option key={sec.id} value={sec.id}>
                        {sec.section_name} ({sec.origin_station} to {sec.end_station})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-brand-secondary mb-1">
                      Maintenance Start Time <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="YYYY-MM-DD HH:MM:SS"
                      value={conflictForm.maintenance_start}
                      onChange={(e) =>
                        setConflictForm({ ...conflictForm, maintenance_start: e.target.value })
                      }
                      className="w-full px-3 py-2 rounded-xl bg-brand-surface border border-brand-border text-brand-secondary text-xs font-mono focus:outline-hidden focus:border-brand-primary"
                      required
                    />
                    <span className="text-[10px] text-brand-muted mt-1 block">e.g. 2026-09-04 02:00:00</span>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-brand-secondary mb-1">
                      Maintenance End Time <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="YYYY-MM-DD HH:MM:SS"
                      value={conflictForm.maintenance_end}
                      onChange={(e) =>
                        setConflictForm({ ...conflictForm, maintenance_end: e.target.value })
                      }
                      className="w-full px-3 py-2 rounded-xl bg-brand-surface border border-brand-border text-brand-secondary text-xs font-mono focus:outline-hidden focus:border-brand-primary"
                      required
                    />
                    <span className="text-[10px] text-brand-muted mt-1 block">e.g. 2026-09-04 05:00:00</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsConflictModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-brand-surface hover:bg-brand-tertiary border border-brand-border text-xs font-bold text-brand-secondary transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={checkConflictMutation.isPending}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-xs font-bold text-white shadow-xs transition-colors disabled:opacity-50 cursor-pointer"
                >
                  {checkConflictMutation.isPending ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Simulating Traffic...</span>
                    </>
                  ) : (
                    <>
                      <ShieldAlert className="w-3.5 h-3.5" />
                      <span>Run Conflict Check</span>
                    </>
                  )}
                </button>
              </div>
            </form>

            {/* Error Display */}
            {conflictError && (
              <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-start gap-2.5">
                <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold">Conflict Check Failed</div>
                  <div className="mt-0.5 text-red-700">{conflictError}</div>
                </div>
              </div>
            )}

            {/* Conflict Result Display */}
            {conflictResult && (
              <div className="space-y-3 pt-2 border-t border-brand-border">
                {conflictResult.has_conflict ? (
                  <div className="space-y-3">
                    <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-900 text-xs flex items-start gap-2.5">
                      <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                      <div>
                        <div className="font-extrabold text-sm text-red-900">
                          Traffic Conflict Detected ({conflictResult.conflict_count} Collisions)
                        </div>
                        <p className="mt-0.5 text-red-700">
                          Active scheduled train movements intersect with this requested maintenance window.
                        </p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="text-xs font-bold text-brand-secondary">
                        Conflicting Train Movements:
                      </div>
                      <div className="space-y-1.5 max-h-48 overflow-y-auto">
                        {conflictResult.conflicts.map((c, idx) => (
                          <div
                            key={idx}
                            className="p-2.5 rounded-xl bg-brand-surface border border-red-200 shadow-2xs flex items-center justify-between gap-3 text-xs"
                          >
                            <div>
                              <div className="font-bold text-brand-secondary flex items-center gap-1.5">
                                <span className="font-mono text-red-700 font-bold">{c.train_number}</span>
                                <span>-</span>
                                <span>{c.train_name}</span>
                              </div>
                              <div className="text-[11px] text-brand-muted mt-0.5 font-mono">
                                Occupancy: {c.entry_time} → {c.exit_time}
                              </div>
                            </div>
                            <span className="px-2 py-0.5 rounded-md bg-red-100 text-red-800 text-[10px] font-bold border border-red-200 shrink-0">
                              Schedule Collision
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <div className="font-extrabold text-sm text-emerald-900">
                        Corridor Clear - No Conflict Detected
                      </div>
                      <p className="mt-0.5 text-emerald-700">
                        Zero scheduled train movements collide with this maintenance window on Section #{conflictForm.section}. Safe for track occupancy.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODAL 5: Feasible Block Windows Finder */}
      {isFeasibleModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-brand-surface border border-brand-border rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-brand-border">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-700 flex items-center justify-center">
                  <Timer className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-brand-secondary">
                    Feasible Maintenance Window Finder
                  </h3>
                  <p className="text-xs text-brand-muted">
                    Calculate available conflict-free intervals inside corridor block windows
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsFeasibleModalOpen(false)}
                className="text-brand-muted hover:text-brand-secondary text-lg font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleRunFeasibleCheck} className="space-y-4">
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-brand-secondary mb-1">
                    Select Maintenance Task <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={feasibleForm.task_id}
                    onChange={(e) => {
                      const selectedCode = e.target.value;
                      const task = tasks.find((t) => t.task_code === selectedCode);
                      let matchingWindowId = 0;
                      if (task) {
                        const taskAsset = assets.find((a) => a.id === task.asset);
                        const secId = taskAsset?.section;
                        const secName = task.section_name || taskAsset?.section_name;
                        const matchingBws = blockWindows.filter((bw) => {
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
                        if (matchingBws.length > 0) {
                          matchingWindowId = matchingBws[0].id;
                        }
                      }
                      setFeasibleForm({
                        task_id: selectedCode,
                        block_window_id: matchingWindowId,
                      });
                    }}
                    className="w-full px-3 py-2 rounded-xl bg-brand-surface border border-brand-border text-brand-secondary text-xs focus:outline-hidden focus:border-brand-primary cursor-pointer"
                    required
                  >
                    <option value="">Select a maintenance task...</option>
                    {tasks.map((t) => (
                      <option key={t.id} value={t.task_code}>
                        {t.task_code} - {t.asset_name || `Asset #${t.asset}`} ({t.estimated_duration} mins)
                      </option>
                    ))}
                  </select>
                  {selectedFeasibleTask && (
                    <div className="flex items-center gap-1.5 mt-1.5 px-2.5 py-1 rounded-lg bg-brand-tertiary border border-brand-border text-[11px] text-brand-secondary">
                      <MapPin className="w-3.5 h-3.5 text-brand-primary shrink-0" />
                      <span>
                        Scheduled Corridor:{" "}
                        <strong className="text-brand-primary">
                          {selectedFeasibleSectionName || `Section #${selectedFeasibleSectionId}`}
                        </strong>
                      </span>
                    </div>
                  )}
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-bold text-brand-secondary">
                      Select Block Window <span className="text-red-500">*</span>
                    </label>
                    {selectedFeasibleSectionName && (
                      <span className="text-[10px] text-brand-muted font-medium">
                        Only showing blocks for {selectedFeasibleSectionName}
                      </span>
                    )}
                  </div>
                  <select
                    value={feasibleForm.block_window_id}
                    onChange={(e) =>
                      setFeasibleForm({ ...feasibleForm, block_window_id: Number(e.target.value) })
                    }
                    className="w-full px-3 py-2 rounded-xl bg-brand-surface border border-brand-border text-brand-secondary text-xs focus:outline-hidden focus:border-brand-primary cursor-pointer"
                    required
                  >
                    {sectionBlockWindows.length === 0 ? (
                      <option value={0}>
                        No block windows registered for {selectedFeasibleSectionName || `Section #${selectedFeasibleSectionId}`}
                      </option>
                    ) : (
                      <>
                        <option value={0}>Select a block window...</option>
                        {sectionBlockWindows.map((bw) => (
                          <option key={bw.id} value={bw.id}>
                            Window #{bw.id} - {bw.section_name || `Section ${bw.section}`} ({bw.start_time} to {bw.end_time}) [{bw.status}]
                          </option>
                        ))}
                      </>
                    )}
                  </select>
                  {loadingBlockWindows && (
                    <span className="text-[10px] text-brand-muted mt-1 block">Loading block windows...</span>
                  )}

                  {sectionBlockWindows.length === 0 && selectedFeasibleTask && (
                    <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-2 mt-2">
                      <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                      <div>
                        <div className="font-bold">No Block Windows on this Corridor</div>
                        <div className="text-[11px] text-amber-800 mt-0.5">
                          There are currently no block windows allocated on{" "}
                          <strong>{selectedFeasibleSectionName || `Section #${selectedFeasibleSectionId}`}</strong>.
                          Maintenance cannot be executed without a block window on the same corridor section.
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsFeasibleModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-brand-surface hover:bg-brand-tertiary border border-brand-border text-xs font-bold text-brand-secondary transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={feasibleWindowsMutation.isPending}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-xs font-bold text-white shadow-xs transition-colors disabled:opacity-50 cursor-pointer"
                >
                  {feasibleWindowsMutation.isPending ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Evaluating Windows...</span>
                    </>
                  ) : (
                    <>
                      <Timer className="w-3.5 h-3.5" />
                      <span>Find Feasible Windows</span>
                    </>
                  )}
                </button>
              </div>
            </form>

            {/* Error Display */}
            {feasibleError && (
              <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-start gap-2.5">
                <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold">Evaluation Error</div>
                  <div className="mt-0.5 text-red-700">{feasibleError}</div>
                </div>
              </div>
            )}

            {/* Feasible Result Display */}
            {feasibleResult && (
              <div className="space-y-3 pt-2 border-t border-brand-border">
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div className="p-2.5 rounded-xl bg-brand-tertiary border border-brand-border">
                    <span className="text-brand-muted block text-xs font-semibold">Section</span>
                    <span className="font-bold text-brand-secondary mt-0.5 block truncate">{feasibleResult.section}</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-brand-tertiary border border-brand-border">
                    <span className="text-brand-muted block text-xs font-semibold">Required Time</span>
                    <span className="font-bold text-brand-primary mt-0.5 block font-mono">{feasibleResult.required_duration_minutes} mins</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-brand-tertiary border border-brand-border">
                    <span className="text-brand-muted block text-xs font-semibold">Corridor Status</span>
                    <span className={`font-bold mt-0.5 block ${feasibleResult.feasible ? "text-emerald-600" : "text-red-600"}`}>
                      {feasibleResult.feasible ? "FEASIBLE" : "INFEASIBLE"}
                    </span>
                  </div>
                </div>

                {feasibleResult.feasible && feasibleResult.windows && feasibleResult.windows.length > 0 ? (
                  <div className="space-y-2">
                    <div className="text-xs font-bold text-brand-secondary flex items-center justify-between">
                      <span>Available Feasible Windows:</span>
                      <span className="text-emerald-600 font-bold text-[11px]">{feasibleResult.windows.length} slot(s) found</span>
                    </div>

                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {feasibleResult.windows.map((w, idx) => (
                        <div
                          key={idx}
                          className="p-3 rounded-xl bg-emerald-50/60 border border-emerald-200 text-xs flex items-center justify-between gap-3"
                        >
                          <div>
                            <div className="font-mono font-bold text-brand-secondary flex items-center gap-1.5">
                              <span>{w.start}</span>
                              <ArrowRight className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                              <span>{w.end}</span>
                            </div>
                            <div className="text-[11px] text-emerald-800 mt-0.5 font-medium">
                              Sufficient clearance for {feasibleResult.required_duration_minutes}-minute work.
                            </div>
                          </div>
                          <span className="px-2.5 py-1 rounded-lg bg-emerald-600 text-white font-mono font-bold text-xs shrink-0">
                            {w.duration_minutes} mins
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-2.5">
                    <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <div className="font-bold">No Feasible Slots In This Window</div>
                      <div className="mt-0.5 text-amber-700">
                        The requested block window does not have a continuous free slot of at least {feasibleResult.required_duration_minutes} minutes without train traffic.
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
