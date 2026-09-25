"use client";

import React, { useState, useMemo, useRef, useEffect } from "react";
import Image from "next/image";
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
  MoreVertical,
  Table as TableIcon,
  ShieldAlert,
  Zap,
  Hourglass,
  Timer,
  ArrowRight,
  Sparkles,
  Cpu,
  Info,
  MapPin,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from "@/components/ui/popover";
import { MaintenancePageSkeleton, MaintenanceTasksTableSkeleton } from "./skeletons";
import { checkBlockConflict } from "@/actions/blocks";
import {
  usePaginatedMaintenanceTasks,
  useAssets,
  useRailwaySections,
  useBlockWindows,
  useCheckBlockConflict,
  useFeasibleWindows,
  useCreateBlockWindow,
  useUpdateBlockWindow,
  usePatchMaintenanceTask,
  useCreateMaintenanceTask,
  useUpdateMaintenanceTask,
  useDeleteMaintenanceTask,
  useMaintenanceLogs,
  useStartMaintenanceTask,
  useCompleteMaintenanceTask,
  useCancelMaintenanceTask,
} from "@/hooks";
import {
  MaintenanceTask,
  CreateMaintenanceTaskInput,
  ConflictCheckResponse,
  FeasibleWindowsResponse,
  FeasibleWindowSlot,
  BlockWindow,
  FeasibleWindowsRequest,
} from "@/types";
import {
  MaintenancePriority,
  MaintenanceStatus,
  MAINTENANCE_PRIORITY_LABELS,
  MAINTENANCE_STATUS_LABELS,
} from "@/enums";
import { getDateBounds, validateDate } from "@/lib/date-schemas";
import { AIBlockRecommendationBanner } from "@/components/dashboard/ai-block-recommendation-banner";
import { Checkbox } from "@/components/ui/checkbox";

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
    badge: "bg-amber-500 border-amber-600 text-white",
    icon: AlertTriangle,
  },
  [MaintenanceStatus.SCHEDULED]: {
    label: MAINTENANCE_STATUS_LABELS[MaintenanceStatus.SCHEDULED],
    badge: "bg-blue-600 border-blue-700 text-white",
    icon: Clock,
  },
  [MaintenanceStatus.ACTIVE]: {
    label: MAINTENANCE_STATUS_LABELS[MaintenanceStatus.ACTIVE],
    badge: "bg-amber-600 border-amber-600 text-white",
    icon: Wrench,
  },
  [MaintenanceStatus.COMPLETED]: {
    label: MAINTENANCE_STATUS_LABELS[MaintenanceStatus.COMPLETED],
    badge: "bg-emerald-600 border-emerald-700 text-white",
    icon: CheckCircle2,
  },
  [MaintenanceStatus.CANCELLED]: {
    label: MAINTENANCE_STATUS_LABELS[MaintenanceStatus.CANCELLED],
    badge: "bg-slate-600 border-slate-700 text-white",
    icon: XCircle,
  },
  [MaintenanceStatus.DELAYED]: {
    label: MAINTENANCE_STATUS_LABELS[MaintenanceStatus.DELAYED],
    badge: "bg-red-700 border-rose-700 text-white",
    icon: Timer,
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

function formatIstDateTime(value?: string | null): string {
  if (!value) return "—";
  const date = new Date(value.replace(" ", "T"));
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("en-IN", {
    timeZone: "Asia/Kolkata",
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(date);
}

function todayInIst(): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());
  const part = (type: string) => parts.find((value) => value.type === type)?.value;
  return `${part("year")}-${part("month")}-${part("day")}`;
}

// Helper: Format feasible window start/end timestamps into readable date & 24h time
function formatWindowSlot(startStr: string, endStr: string) {
  try {
    const parse = (s: string) => {
      const parts = s.trim().split(/[\sT]+/);
      const [y, m, d] = parts[0].split("-").map(Number);
      const [hh, mm] = (parts[1] || "00:00").split(":").map(Number);
      return new Date(y, m - 1, d, hh, mm);
    };

    const d1 = parse(startStr);
    const d2 = parse(endStr);

    const dateStr = d1.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });

    const time1 = d1.toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });

    const time2 = d2.toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });

    return {
      date: dateStr,
      time: `${time1} – ${time2}`,
    };
  } catch {
    return {
      date: startStr.split(" ")[0] || startStr,
      time: `${startStr} – ${endStr}`,
    };
  }
}

// Helper: Format block window timestamp strings into 24h format date & time
function formatBlockWindowText(bw: { id: number; section?: number; section_name?: string; start_time: string; end_time: string; status?: string }) {
  const format24 = (dtStr: string) => {
    if (!dtStr) return "";
    try {
      const parts = dtStr.trim().split(/[\sT]+/);
      const [y, m, d] = parts[0].split("-").map(Number);
      const [hh, mm] = (parts[1] || "00:00").split(":").map(Number);
      const date = new Date(y, m - 1, d, hh, mm);
      if (Number.isNaN(date.getTime())) return dtStr;
      const datePart = date.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
      const timePart = date.toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      });
      return `${datePart} ${timePart}`;
    } catch {
      return dtStr;
    }
  };

  const startFormatted = format24(bw.start_time);
  const endFormatted = format24(bw.end_time);
  const sectionLabel = bw.section_name || `Section #${bw.section}`;
  return `Window #${bw.id} • ${sectionLabel} (${startFormatted} – ${endFormatted}) [${bw.status || "ACTIVE"}]`;
}

// Format a Date for a datetime-local input using the user's local timezone.
function formatDateTimeLocal(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");

  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

// Rolling 30-day maximum for maintenance date/time selection (inclusive of the 30th day up to 23:59).
function getMaxMaintenanceDateTime(baseDate?: Date): string {
  const base = baseDate || new Date();
  const maxDate = new Date(base.getFullYear(), base.getMonth(), base.getDate() + 30, 23, 59);
  return formatDateTimeLocal(maxDate);
}

// Calculate maximum allowed End Time for a given Start Time (at most the next day up to 23:59).
function getMaxEndTimeForStart(startStr?: string): string {
  if (!startStr) return getMaxMaintenanceDateTime();
  try {
    const clean = startStr.trim().replace(" ", "T");
    const sDate = new Date(clean);
    if (Number.isNaN(sDate.getTime())) return getMaxMaintenanceDateTime();
    const nextDay = new Date(sDate.getFullYear(), sDate.getMonth(), sDate.getDate() + 1, 23, 59);
    return formatDateTimeLocal(nextDay);
  } catch {
    return getMaxMaintenanceDateTime();
  }
}

// Rolling minimum for maintenance start (current local time + 1 hour).
function getMinMaintenanceDateTime(baseDate?: Date): string {
  const base = baseDate || new Date();
  const minTime = new Date(base.getTime() + 60 * 60 * 1000);
  return formatDateTimeLocal(minTime);
}

// Format timestamp string safely to HH:MM (handles null/undefined/various formats)
function formatTimeHHMM(dtStr?: string | null): string {
  if (!dtStr) return "--:--";
  if (dtStr.length >= 16) return dtStr.slice(11, 16);
  if (dtStr.includes(" ")) return dtStr.split(" ")[1]?.slice(0, 5) || dtStr;
  if (dtStr.includes("T")) return dtStr.split("T")[1]?.slice(0, 5) || dtStr;
  return dtStr;
}

// Convert API timestamp (e.g. "2026-09-04 04:00:00") to datetime-local value ("2026-09-04T04:00")
function toDatetimeLocalValue(dtStr?: string): string {
  if (!dtStr) return formatDateTimeLocal(new Date());
  try {
    const clean = dtStr.trim().replace(" ", "T");
    const d = new Date(clean);
    if (!Number.isNaN(d.getTime())) {
      return formatDateTimeLocal(d);
    }
    return dtStr.substring(0, 16);
  } catch {
    return formatDateTimeLocal(new Date());
  }
}

// Convert datetime-local value ("2026-09-04T04:00") to API timestamp ("2026-09-04 04:00:00")
function toApiTimestamp(localStr: string): string {
  if (!localStr) return "";
  if (localStr.includes("T")) {
    const parts = localStr.split("T");
    const timePart = parts[1].length === 5 ? `${parts[1]}:00` : parts[1];
    return `${parts[0]} ${timePart}`;
  }
  return localStr;
}

// Validation helper strictly enforcing maintenance date/time rules
function validateMaintenanceTimes(
  startVal: string,
  endVal: string,
  now: Date
): {
  startError: string | null;
  endError: string | null;
  generalError: string | null;
} {
  const maxDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 30, 23, 59, 59);
  let startError: string | null = null;
  let endError: string | null = null;

  if (!startVal || !startVal.trim()) {
    startError = "Maintenance start time is required.";
  } else {
    const sDate = new Date(startVal.replace(" ", "T"));
    if (Number.isNaN(sDate.getTime())) {
      startError = "Invalid start date and time format.";
    } else if (sDate.getTime() < now.getTime() + 60 * 60 * 1000 - 45000) {
      // Grace buffer for picker interaction elapsed seconds
      startError = "Start Maintenance cannot be earlier than 1 hour from current time.";
    } else if (sDate.getTime() > maxDate.getTime()) {
      startError = "Start Maintenance cannot exceed the 30-day rolling window from today.";
    }
  }

  if (!endVal || !endVal.trim()) {
    endError = "Maintenance end time is required.";
  } else {
    const eDate = new Date(endVal.replace(" ", "T"));
    if (Number.isNaN(eDate.getTime())) {
      endError = "Invalid end date and time format.";
    } else if (eDate.getTime() < now.getTime()) {
      endError = "End Maintenance cannot be in the past.";
    } else if (eDate.getTime() > maxDate.getTime()) {
      endError = "End Maintenance cannot exceed the 30-day rolling window from today.";
    } else if (startVal) {
      const sDate = new Date(startVal.replace(" ", "T"));
      if (!Number.isNaN(sDate.getTime()) && eDate.getTime() <= sDate.getTime()) {
        endError = "End Maintenance must always be after Start Maintenance.";
      }
    }
  }

  const generalError = startError || endError || null;
  return { startError, endError, generalError };
}

// Convert an API date/time string into the format required by datetime-local.
function toDateTimeLocal(value: string): string {
  if (!value) return "";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value.replace(" ", "T").substring(0, 16);
  }

  return formatDateTimeLocal(date);
}



export default function MaintenancePage() {
  const [activeNavTab, setActiveNavTab] = useState<string>("maintenance");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // TanStack Query Hooks
  const {
    data: tasksPage,
    isLoading: loadingTasks,
    isFetching: fetchingTasks,
    isRefetching: refetchingTasks,
    refetch: refetchTasks,
  } = usePaginatedMaintenanceTasks({ page: currentPage, page_size: pageSize });
  const tasks = tasksPage?.results ?? [];
  const totalPages = Math.max(1, Math.ceil((tasksPage?.count ?? 0) / pageSize));
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
  const createBlockWindowMutation = useCreateBlockWindow();
  const updateBlockWindowMutation = useUpdateBlockWindow();
  const patchMaintenanceTaskMutation = usePatchMaintenanceTask();
  const startMaintenanceMutation = useStartMaintenanceTask();
  const completeMaintenanceMutation = useCompleteMaintenanceTask();
  const cancelMaintenanceMutation = useCancelMaintenanceTask();
  const [schedulingSlot, setSchedulingSlot] = useState<string | null>(null);
  const [scheduledSuccessMsg, setScheduledSuccessMsg] = useState<string | null>(null);
  /** Tracks the block window ID created by the feasible windows flow for Phase 3 AI banner */
  const [createdBlockWindowId, setCreatedBlockWindowId] = useState<number | null>(null);

  // Inline Row AI Recommendation State
  const [expandedAiTaskId, setExpandedAiTaskId] = useState<number | null>(null);
  const [loadingAiTaskId, setLoadingAiTaskId] = useState<number | null>(null);
  const [aiRecommendationsMap, setAiRecommendationsMap] = useState<
    Record<
      number,
      {
        current_slot: string;
        recommended_slot: FeasibleWindowSlot | null;
        reason: string;
      }
    >
  >({});

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
  const maintenanceLogsQuery = useMaintenanceLogs(inspectingTask?.id);
  const [lifecycleTask, setLifecycleTask] = useState<MaintenanceTask | null>(null);
  const [lifecycleMode, setLifecycleMode] = useState<"start" | "complete" | "cancel" | null>(null);
  const [lifecycleRemark, setLifecycleRemark] = useState("");
  const [lifecycleError, setLifecycleError] = useState<string | null>(null);
  const [startChecklist, setStartChecklist] = useState([
    { item: "PPE checked", completed: false },
    { item: "Work permit approved", completed: false },
    { item: "Section isolated", completed: false },
  ]);
  const startDateTimeRef = useRef<HTMLInputElement>(null);
  const endDateTimeRef = useRef<HTMLInputElement>(null);

  // Conflict Modal State
  const [isConflictModalOpen, setIsConflictModalOpen] = useState<boolean>(false);
  const [conflictForm, setConflictForm] = useState<{
    section: number;
    maintenance_start: string;
    maintenance_end: string;
  }>({
    section: 1,
    maintenance_start: "",
    maintenance_end: "",
  });
  const [conflictResult, setConflictResult] = useState<ConflictCheckResponse | null>(null);
  const [conflictError, setConflictError] = useState<string | null>(null);
  const [conflictStartError, setConflictStartError] = useState<string | null>(null);
  const [conflictEndError, setConflictEndError] = useState<string | null>(null);
  const [currentNow, setCurrentNow] = useState<Date>(() => new Date());

  // Dynamic ticking interval: refresh current time every 30 seconds so rolling window & past-time bounds shift automatically
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentNow(new Date());
    }, 30000);
    return () => clearInterval(timer);
  }, []);

  // Rolling 30-day window dynamically calculated
  const minStartDateTime = useMemo(() => getMinMaintenanceDateTime(currentNow), [currentNow]);
  const maxMaintenanceDateTime = useMemo(() => getMaxMaintenanceDateTime(currentNow), [currentNow]);

  // End Maintenance minimum bound: must strictly be after Start Maintenance (and not in past)
  const minEndDateTime = useMemo(() => {
    if (conflictForm.maintenance_start) {
      const parsedStart = new Date(conflictForm.maintenance_start.replace(" ", "T"));
      if (!Number.isNaN(parsedStart.getTime())) {
        const afterStart = new Date(parsedStart.getTime() + 60 * 1000);
        return formatDateTimeLocal(afterStart > currentNow ? afterStart : currentNow);
      }
    }
    return formatDateTimeLocal(new Date(currentNow.getTime() + 60 * 1000));
  }, [conflictForm.maintenance_start, currentNow]);

  // Feasible Windows Modal State
  const [isFeasibleModalOpen, setIsFeasibleModalOpen] = useState<boolean>(false);
  const [feasibleForm, setFeasibleForm] = useState<{
    task_id: string;
    date: string;
  }>({
    task_id: "",
    date: todayInIst(), // default to today in the backend's scheduling timezone
  });
  const [feasibleResult, setFeasibleResult] = useState<FeasibleWindowsResponse | null>(null);
  const [feasibleError, setFeasibleError] = useState<string | null>(null);

  // Create / Update Block Window Modal State
  const [isBlockWindowModalOpen, setIsBlockWindowModalOpen] = useState<boolean>(false);
  const [blockWindowStep, setBlockWindowStep] = useState<"FORM" | "AI_RECOMMENDATION">("FORM");
  const [selectedBlockTask, setSelectedBlockTask] = useState<MaintenanceTask | null>(null);
  const [editingBlockWindow, setEditingBlockWindow] = useState<BlockWindow | null>(null);
  const [blockWindowForm, setBlockWindowForm] = useState<{
    section: number;
    start_time: string;
    end_time: string;
    status: string;
  }>(() => {
    const minStart = new Date(Date.now() + 60 * 60 * 1000);
    return {
      section: 1,
      start_time: formatDateTimeLocal(minStart),
      end_time: formatDateTimeLocal(new Date(minStart.getTime() + 60 * 60 * 1000)),
      status: "RESERVED",
    };
  });
  const [blockWindowError, setBlockWindowError] = useState<string | null>(null);
  const [blockWindowSuccessMsg, setBlockWindowSuccessMsg] = useState<string | null>(null);
  const [standardConflictResult, setStandardConflictResult] = useState<ConflictCheckResponse | null>(null);
  const [conflictCheckLoading, setConflictCheckLoading] = useState<boolean>(false);

  // Live Standard Conflict Check inside Block Window form
  useEffect(() => {
    if (!isBlockWindowModalOpen || blockWindowStep !== "FORM") return;

    let isCancelled = false;
    const timer = setTimeout(async () => {
      if (!blockWindowForm.start_time || !blockWindowForm.end_time || !blockWindowForm.section) {
        setStandardConflictResult(null);
        setConflictCheckLoading(false);
        return;
      }

      const startTimeApi = toApiTimestamp(blockWindowForm.start_time);
      const endTimeApi = toApiTimestamp(blockWindowForm.end_time);

      const startMs = new Date(startTimeApi).getTime();
      const endMs = new Date(endTimeApi).getTime();
      if (Number.isNaN(startMs) || Number.isNaN(endMs) || startMs >= endMs) {
        setStandardConflictResult(null);
        setConflictCheckLoading(false);
        return;
      }

      setConflictCheckLoading(true);
      try {
        const res = await checkBlockConflict({
          section: Number(blockWindowForm.section),
          maintenance_start: startTimeApi,
          maintenance_end: endTimeApi,
        });
        if (!isCancelled) {
          setStandardConflictResult(res.success && res.data ? res.data : null);
          setConflictCheckLoading(false);
        }
      } catch {
        if (!isCancelled) {
          setStandardConflictResult(null);
          setConflictCheckLoading(false);
        }
      }
    }, 400);

    return () => {
      isCancelled = true;
      clearTimeout(timer);
    };
  }, [
    isBlockWindowModalOpen,
    blockWindowStep,
    blockWindowForm.section,
    blockWindowForm.start_time,
    blockWindowForm.end_time,
  ]);

  // Form State
  const [deadlineError, setDeadlineError] = useState<string | null>(null);
  const [formData, setFormData] = useState<CreateMaintenanceTaskInput>(() => {
    const now = new Date();
    const future = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    return {
      task_code: "",
      asset: 0,
      details: "",
      risk_rating: 8,
      urgency: MaintenancePriority.HIGH,
      deadline: future.toISOString().split("T")[0],
      estimated_duration: 45,
      task_status: MaintenanceStatus.PENDING,
    };
  });

  // Open Create Modal with auto-suggested task code
  const handleOpenCreateModal = () => {
    setEditingTask(null);
    setDeadlineError(null);
    const randomSuffix = Math.floor(100 + Math.random() * 900);
    setFormData({
      task_code: `TMS-${randomSuffix}`,
      asset: 0,
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
    setDeadlineError(null);
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
            setExpandedAiTaskId(null);
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
          setExpandedAiTaskId(null);
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
        setExpandedAiTaskId(null);
      },
      onError: (err) => {
        showToast("error", err instanceof Error ? err.message : "Failed to delete task.");
      },
    });
  };

  const openLifecycleModal = (task: MaintenanceTask, mode: "start" | "complete" | "cancel") => {
    setLifecycleTask(task);
    setLifecycleMode(mode);
    setLifecycleRemark("");
    setLifecycleError(null);
    if (mode === "start") setStartChecklist([
      { item: "PPE checked", completed: false },
      { item: "Work permit approved", completed: false },
      { item: "Section isolated", completed: false },
    ]);
  };

  const handleLifecycleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!lifecycleTask || !lifecycleMode) return;
    setLifecycleError(null);
    if (lifecycleMode === "start" && !startChecklist.every((item) => item.completed)) {
      showToast("error", "Complete every safety checklist item before starting.");
      return;
    }
    if (lifecycleMode !== "start" && !lifecycleRemark.trim()) {
      showToast("error", "A non-blank remark is required.");
      return;
    }
    try {
      const updated = lifecycleMode === "start"
        ? await startMaintenanceMutation.mutateAsync({ id: lifecycleTask.id, checklist: startChecklist })
        : lifecycleMode === "complete"
          ? await completeMaintenanceMutation.mutateAsync({ id: lifecycleTask.id, remark: lifecycleRemark.trim() })
          : await cancelMaintenanceMutation.mutateAsync({ id: lifecycleTask.id, remark: lifecycleRemark.trim() });
      // Keep an already-open detail view current, but never open a second dialog
      // after an action initiated from the table menu.
      if (updated && inspectingTask?.id === lifecycleTask.id) setInspectingTask(updated);
      setExpandedAiTaskId(null);
      // Lifecycle mutation hooks invalidate the task, block, and audit-log queries.
      // Avoid a second network request by not manually refetching them here.
      showToast("success", `Maintenance task ${lifecycleMode === "start" ? "started" : lifecycleMode === "complete" ? "completed" : "cancelled"}.`);
      setLifecycleTask(null);
      setLifecycleMode(null);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Maintenance action failed. Please refresh and try again.";
      const friendlyMessage = /not found/i.test(message)
        ? "This task no longer exists in the backend. Refresh the task list before trying another action."
        : message;
      setLifecycleError(friendlyMessage);
      showToast("error", friendlyMessage);
      await refetchTasks();
    }
  };

  // Conflict Modal Handlers
  const handleOpenConflictModal = (task?: MaintenanceTask) => {
    setConflictError(null);
    setConflictStartError(null);
    setConflictEndError(null);
    setConflictResult(null);

    const now = new Date();
    setCurrentNow(now);

    const targetTask = task || (tasks.length > 0 ? tasks[0] : null);
    const taskAsset = targetTask
      ? assets.find((a) => a.id === targetTask.asset)
      : null;
    const sectionId = taskAsset?.section || sections[0]?.id || 1;
    const sectionName =
      targetTask?.section_name || taskAsset?.section_name || "";

    const maxDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 30, 23, 59, 59);

    // Select the nearest block window whose START is strictly now or in future and within 30 days
    const matchingWindow = targetTask
      ? blockWindows
        .filter((bw) => {
          if (
            taskAsset?.section &&
            Number(bw.section) === Number(taskAsset.section)
          ) {
            return true;
          }

          return Boolean(
            sectionName &&
            bw.section_name &&
            bw.section_name.trim().toLowerCase() ===
            sectionName.trim().toLowerCase()
          );
        })
        .filter((bw) => {
          const startTime = new Date(bw.start_time);
          const endTime = new Date(bw.end_time);

          // Only use a window that starts in the future, ends after start, and fits within 30-day window
          return (
            startTime >= now &&
            startTime <= maxDate &&
            endTime > startTime &&
            endTime <= maxDate
          );
        })
        .sort((a, b) => {
          return (
            new Date(a.start_time).getTime() -
            new Date(b.start_time).getTime()
          );
        })[0]
      : null;

    // If there is no future block window, create a safe future fallback.
    const fallbackStart = new Date(now);
    fallbackStart.setMinutes(fallbackStart.getMinutes() + 30);

    const fallbackEnd = new Date(fallbackStart);
    fallbackEnd.setHours(fallbackEnd.getHours() + 3);

    const initialStart = matchingWindow?.start_time
      ? toDateTimeLocal(matchingWindow.start_time)
      : formatDateTimeLocal(fallbackStart);

    const initialEnd = matchingWindow?.end_time
      ? toDateTimeLocal(matchingWindow.end_time)
      : formatDateTimeLocal(fallbackEnd);

    setConflictForm({
      section: Number(sectionId),
      maintenance_start: initialStart,
      maintenance_end: initialEnd,
    });

    setIsConflictModalOpen(true);
  };

  const handleRunConflictCheck = (e: React.FormEvent) => {
    e.preventDefault();
    setConflictError(null);
    setConflictResult(null);

    const now = new Date();
    setCurrentNow(now);

    const validation = validateMaintenanceTimes(
      conflictForm.maintenance_start,
      conflictForm.maintenance_end,
      now
    );

    setConflictStartError(validation.startError);
    setConflictEndError(validation.endError);

    if (validation.generalError) {
      setConflictError(validation.generalError);
      return;
    }

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
    setScheduledSuccessMsg(null);

    const targetTask = task || (tasks.length > 0 ? tasks[0] : null);
    const targetTaskId = targetTask ? targetTask.task_code : "";

    setFeasibleForm({
      task_id: targetTaskId,
      date: todayInIst(), // default to today in the backend's scheduling timezone
    });
    setIsFeasibleModalOpen(true);
  };

  // Create / Update Block Window Modal Handlers
  const handleOpenBlockWindowModal = (task: MaintenanceTask, bw?: BlockWindow) => {
    setSelectedBlockTask(task);
    setEditingBlockWindow(bw || null);
    setBlockWindowError(null);
    setBlockWindowSuccessMsg(null);
    setBlockWindowStep("FORM");
    setCreatedBlockWindowId(null);
    setStandardConflictResult(null);

    const taskAsset = assets.find((a) => a.id === task.asset);
    const defaultSection = bw?.section || taskAsset?.section || sections[0]?.id || 1;
    const now = new Date();
    const minStart = new Date(now.getTime() + 60 * 60 * 1000);
    const minStartMs = minStart.getTime() - 60000;
    const durationMins = task.estimated_duration || 60;

    let initialStart = formatDateTimeLocal(minStart);
    let initialEnd = formatDateTimeLocal(new Date(minStart.getTime() + durationMins * 60 * 1000));

    if (bw) {
      const parsedStartMs = new Date(toApiTimestamp(toDatetimeLocalValue(bw.start_time))).getTime();
      const parsedEndMs = new Date(toApiTimestamp(toDatetimeLocalValue(bw.end_time))).getTime();

      const validStart = parsedStartMs < minStartMs ? formatDateTimeLocal(minStart) : toDatetimeLocalValue(bw.start_time);
      const validStartMs = new Date(toApiTimestamp(validStart)).getTime();
      const validEnd = parsedEndMs <= validStartMs
        ? formatDateTimeLocal(new Date(validStartMs + durationMins * 60 * 1000))
        : toDatetimeLocalValue(bw.end_time);

      initialStart = validStart;
      initialEnd = validEnd;
    }

    setBlockWindowForm({
      section: Number(defaultSection),
      start_time: initialStart,
      end_time: initialEnd,
      status: bw?.status || "RESERVED",
    });
    setIsBlockWindowModalOpen(true);
  };

  const handleSubmitBlockWindow = async (e: React.FormEvent) => {
    e.preventDefault();
    setBlockWindowError(null);
    setBlockWindowSuccessMsg(null);

    if (!blockWindowForm.start_time || !blockWindowForm.end_time) {
      setBlockWindowError("Please specify both start and end times.");
      return;
    }

    const startTimeApi = toApiTimestamp(blockWindowForm.start_time);
    const endTimeApi = toApiTimestamp(blockWindowForm.end_time);

    const startMs = new Date(startTimeApi).getTime();
    const endMs = new Date(endTimeApi).getTime();
    const minAllowedMs = Date.now() + 60 * 60 * 1000 - 2 * 60 * 1000;
    const maxMs = Date.now() + 30 * 24 * 60 * 60 * 1000;

    if (startMs < minAllowedMs) {
      setBlockWindowError("Start time cannot be earlier than 1 hour from current time.");
      return;
    }

    if (endMs <= startMs) {
      setBlockWindowError("End time must be strictly after start time.");
      return;
    }

    if (startMs > maxMs) {
      setBlockWindowError("Block window cannot be scheduled more than 30 days in advance.");
      return;
    }

    if (endMs > maxMs) {
      setBlockWindowError("Block window end time cannot exceed the 30-day scheduling limit.");
      return;
    }

    if (blockWindowForm.start_time) {
      const maxAllowedEndMs = new Date(toApiTimestamp(getMaxEndTimeForStart(blockWindowForm.start_time))).getTime();
      if (endMs > maxAllowedEndMs) {
        setBlockWindowError("End time date cannot exceed the next day from the selected start time.");
        return;
      }
    }

    try {
      if (editingBlockWindow) {
        await updateBlockWindowMutation.mutateAsync({
          id: editingBlockWindow.id,
          data: {
            section: Number(blockWindowForm.section),
            task: selectedBlockTask ? selectedBlockTask.id : undefined,
            task_id: selectedBlockTask ? selectedBlockTask.task_code : undefined,
            start_time: startTimeApi,
            end_time: endTimeApi,
            status: "RESERVED",
          },
        });
        const msg = `Block Window #${editingBlockWindow.id} updated successfully!`;
        setExpandedAiTaskId(null);
        setBlockWindowSuccessMsg(msg);
        showToast("success", msg);
        setTimeout(() => {
          setIsBlockWindowModalOpen(false);
        }, 1000);
      } else {
        const createdBlock = await createBlockWindowMutation.mutateAsync({
          section: Number(blockWindowForm.section),
          task: selectedBlockTask ? selectedBlockTask.id : undefined,
          task_id: selectedBlockTask ? selectedBlockTask.task_code : undefined,
          start_time: startTimeApi,
          end_time: endTimeApi,
          status: "RESERVED",
        });

        if (selectedBlockTask && selectedBlockTask.task_status !== MaintenanceStatus.SCHEDULED) {
          await patchMaintenanceTaskMutation.mutateAsync({
            id: selectedBlockTask.id,
            data: { task_status: "SCHEDULED" },
          });
        }

        showToast("success", `Block Window ${createdBlock?.id ? `#${createdBlock.id} ` : ""}created successfully!`);
        setExpandedAiTaskId(null);
        setIsBlockWindowModalOpen(false);
        setBlockWindowStep("FORM");
      }
    } catch (err) {
      setBlockWindowError(err instanceof Error ? err.message : "Failed to save block window.");
    }
  };

  // Selected task in Feasible Window modal
  const selectedFeasibleTask = useMemo(() => {
    return tasks.find((t) => t.task_code === feasibleForm.task_id) || null;
  }, [tasks, feasibleForm.task_id]);

  const selectedFeasibleTaskAsset = useMemo(() => {
    if (!selectedFeasibleTask) return null;
    return assets.find((a) => a.id === selectedFeasibleTask.asset) || null;
  }, [assets, selectedFeasibleTask]);

  // Section Name for display only (not used for filtering block windows)
  const selectedFeasibleSectionName =
    selectedFeasibleTask?.section_name || selectedFeasibleTaskAsset?.section_name || "";

  const handleRunFeasibleCheck = (e: React.FormEvent) => {
    e.preventDefault();
    setFeasibleError(null);
    setFeasibleResult(null);
    setScheduledSuccessMsg(null);

    if (!feasibleForm.task_id.trim()) {
      setFeasibleError("Please specify a valid Task Code.");
      return;
    }
    if (!feasibleForm.date) {
      setFeasibleError("Please select a target date.");
      return;
    }
    if (feasibleForm.date < todayInIst()) {
      setFeasibleError("Past dates cannot be scheduled.");
      return;
    }

    feasibleWindowsMutation.mutate(
      {
        task_id: feasibleForm.task_id,
        date: feasibleForm.date,
      },
      {
        onSuccess: (data) => {
          setFeasibleResult(data ?? null);
        },
        onError: (err) => {
          const message = err instanceof Error ? err.message : "Failed to calculate feasible windows";
          setFeasibleError(/past|expired/i.test(message) ? "Past dates cannot be scheduled." : message);
        },
      }
    );
  };

  // Integrated Scheduling Handler: Creates the BlockWindow and updates the task to SCHEDULED
  const handleConfirmSchedule = async (slot: FeasibleWindowSlot) => {
    if (!selectedFeasibleTask) return;

    // Use section ID from the AI response (most accurate); fall back to asset section
    const secId = feasibleResult?.section?.id
      ?? assets.find((a) => a.id === selectedFeasibleTask.asset)?.section;

    if (!secId) {
      setFeasibleError("Could not determine railway section for this task.");
      return;
    }

    setSchedulingSlot(slot.start);
    setFeasibleError(null);
    setScheduledSuccessMsg(null);
    setCreatedBlockWindowId(null);

    try {
      // 1. Create the BlockWindow in RESERVED status
      const createdBlock = await createBlockWindowMutation.mutateAsync({
        section: Number(secId),
        task: selectedFeasibleTask.id,
        task_id: selectedFeasibleTask.task_code,
        start_time: slot.start,
        end_time: slot.end,
        status: "RESERVED",
      });

      // Capture the ID for Phase 3 AI banner
      if (createdBlock?.id) {
        setCreatedBlockWindowId(createdBlock.id);
      }

      // 2. Mark the maintenance task as SCHEDULED
      await patchMaintenanceTaskMutation.mutateAsync({
        id: selectedFeasibleTask.id,
        data: { task_status: "SCHEDULED" },
      });

      const timeInfo = formatWindowSlot(slot.start, slot.end);
      const msg = `Corridor Block Reserved for ${timeInfo.date} (${timeInfo.time})! Task ${selectedFeasibleTask.task_code} has been officially marked as SCHEDULED.`;
      setScheduledSuccessMsg(msg);
      showToast("success", msg);
    } catch (err) {
      setFeasibleError(err instanceof Error ? err.message : "Failed to reserve corridor block window.");
    } finally {
      setSchedulingSlot(null);
    }
  };

  // Toggle Inline AI Recommendation per Row
  const handleToggleAiRecommendation = (task: MaintenanceTask, forceRefresh = false) => {
    if (expandedAiTaskId === task.id && !forceRefresh) {
      setExpandedAiTaskId(null);
      return;
    }

    setExpandedAiTaskId(task.id);

    const taskAsset = assets.find((a) => a.id === task.asset);
    const secId = taskAsset?.section;
    const secName = task.section_name || taskAsset?.section_name;
    const matchingBw = task.block_window
      ? {
        id: task.block_window.id,
        section: Number(task.block_window.section || secId || 1),
        start_time: task.block_window.start_time,
        end_time: task.block_window.end_time,
        status: task.block_window.status || "RESERVED",
      }
      : blockWindows.find((bw) => {
        if (bw.task && bw.task === task.id) return true;
        if (bw.task_id && bw.task_id === task.task_code) return true;
        if (bw.task_code && bw.task_code === task.task_code) return true;
        return false;
      });

    const currentSlotLabel = matchingBw
      ? (() => {
        const info = formatWindowSlot(matchingBw.start_time, matchingBw.end_time);
        return `${info.time} · ${info.date}`;
      })()
      : task.task_status === MaintenanceStatus.SCHEDULED
        ? "Allocated"
        : "Pending Allocation";

    const targetDate = matchingBw?.start_time
      ? matchingBw.start_time.substring(0, 10)
      : task.deadline
        ? task.deadline.substring(0, 10)
        : todayInIst();

    if (!aiRecommendationsMap[task.id] || forceRefresh) {
      setLoadingAiTaskId(task.id);

      const requestPayload: FeasibleWindowsRequest = matchingBw
        ? {
          block_window_id: matchingBw.id,
          task_id: task.task_code,
          date: targetDate,
        }
        : {
          task_id: task.task_code,
          date: targetDate,
        };

      feasibleWindowsMutation.mutate(
        requestPayload,
        {
          onSuccess: (data: any) => {
            setLoadingAiTaskId(null);
            const best =
              data?.recommended_slot ||
              (data?.windows && data.windows.length > 0 ? data.windows[0] : null);

            if (best) {
              const slotTime = formatWindowSlot(best.start, best.end);
              const reason =
                data?.recommendation_reason ||
                `Zero train conflicts in current slot. However, AI identified an optimized slot at ${slotTime.time}`;

              setAiRecommendationsMap((prev) => ({
                ...prev,
                [task.id]: {
                  current_slot: currentSlotLabel,
                  recommended_slot: best,
                  reason,
                },
              }));
            } else {
              setAiRecommendationsMap((prev) => ({
                ...prev,
                [task.id]: {
                  current_slot: currentSlotLabel,
                  recommended_slot: null,
                  reason:
                    data?.recommendation_reason ||
                    "No conflict-free AI recommendation found for this corridor on the target date.",
                },
              }));
            }
          },
          onError: (err) => {
            setLoadingAiTaskId(null);
            setAiRecommendationsMap((prev) => ({
              ...prev,
              [task.id]: {
                current_slot: currentSlotLabel,
                recommended_slot: null,
                reason:
                  err instanceof Error
                    ? err.message
                    : "Failed to evaluate AI recommendation for this corridor.",
              },
            }));
          },
        }
      );
    }
  };

  // Accept Inline AI Slot
  const handleAcceptAiSlot = async (
    task: MaintenanceTask,
    slot?: FeasibleWindowSlot | null
  ) => {
    if (!slot) return;
    const taskAsset = assets.find((a) => a.id === task.asset);
    const secId = taskAsset?.section || 1;
    const secName = task.section_name || taskAsset?.section_name;

    const matchingBw = task.block_window
      ? {
        id: task.block_window.id,
        section: Number(task.block_window.section || secId || 1),
        start_time: task.block_window.start_time,
        end_time: task.block_window.end_time,
        status: task.block_window.status || "RESERVED",
      }
      : blockWindows.find((bw) => {
        if (bw.task && bw.task === task.id) return true;
        if (bw.task_id && bw.task_id === task.task_code) return true;
        if (bw.task_code && bw.task_code === task.task_code) return true;
        return false;
      });

    setSchedulingSlot(slot.start);
    try {
      if (matchingBw) {
        await updateBlockWindowMutation.mutateAsync({
          id: matchingBw.id,
          data: {
            section: Number(secId),
            task: task.id,
            task_id: task.task_code,
            start_time: slot.start,
            end_time: slot.end,
            status: matchingBw.status || "RESERVED",
          },
        });
      } else {
        await createBlockWindowMutation.mutateAsync({
          section: Number(secId),
          task: task.id,
          task_id: task.task_code,
          start_time: slot.start,
          end_time: slot.end,
          status: "RESERVED",
        });
      }

      if (task.task_status !== MaintenanceStatus.SCHEDULED) {
        await patchMaintenanceTaskMutation.mutateAsync({
          id: task.id,
          data: { task_status: "SCHEDULED" },
        });
      }

      // Invalidate cached AI recommendation for this task so next open is completely fresh
      setAiRecommendationsMap((prev) => {
        const next = { ...prev };
        delete next[task.id];
        return next;
      });

      // The create/update and status mutations already invalidate the task and block queries.

      const timeInfo = formatWindowSlot(slot.start, slot.end);
      const msg = `AI Recommended Slot Accepted! Block Reserved for ${timeInfo.date} (${timeInfo.time}). Task ${task.task_code} marked as SCHEDULED.`;
      showToast("success", msg);
      setExpandedAiTaskId(null);
    } catch (err) {
      showToast("error", err instanceof Error ? err.message : "Failed to accept AI slot.");
    } finally {
      setSchedulingSlot(null);
    }
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
    const total = tasksPage?.count ?? 0;
    const pendingCount = tasks.filter((t) => t.task_status === MaintenanceStatus.PENDING).length;
    const scheduledCount = tasks.filter((t) => t.task_status === MaintenanceStatus.SCHEDULED).length;
    const completedCount = tasks.filter((t) => t.task_status === MaintenanceStatus.COMPLETED).length;
    const criticalCount = tasks.filter(
      (t) => t.urgency === MaintenancePriority.CRITICAL || t.risk_rating >= 8
    ).length;
    const totalMinutes = tasks.reduce((sum, t) => sum + (t.estimated_duration || 0), 0);

    return {
      total,
      pendingCount,
      scheduledCount,
      completedCount,
      criticalCount,
      totalMinutes,
    };
  }, [tasks, tasksPage?.count]);

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

      <div className="flex-1 flex pl-0 lg:pl-64 pt-14 lg:pt-0 animate-fade-in-up">
        <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-7 flex flex-col space-y-5 max-w-[1600px] mx-auto w-full">

          {/* Toast Notification Banner */}
          {toastMessage && (
            <div
              className={`fixed top-4 right-4 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-xl border transition-all animate-in fade-in slide-in-from-top-3 ${toastMessage.type === "success"
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
          <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-brand-border/80 animate-fade-in-down">
            <div>
              <div className="flex items-center gap-2.5">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-brand-secondary/80 text-brand-tertiary transition-transform duration-300 hover:scale-105">
                  <Wrench className="w-4 h-4" />
                </div>
                <h1 className="text-xl sm:text-2xl font-bold text-brand-secondary tracking-tight">
                  Maintenance Tasks & Corridor Scheduling
                </h1>
              </div>
              <p className="text-xs text-brand-muted mt-1 font-medium">
                Manage preventive block tasks, asset risk ratings, urgency queues, and maintenance timelines.
              </p>
            </div>

            {/* Quick Actions */}
            <div className="hidden lg:flex items-center gap-2.5 flex-wrap">
              <LiveClock />
            </div>
          </header>

          {/* Metric Cards */}
          <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="smooth-card p-4 rounded-2xl bg-brand-surface border border-brand-border shadow-sm flex items-start gap-3.5">
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

            <div className="smooth-card p-4 rounded-2xl bg-brand-surface border border-brand-border shadow-sm flex items-start gap-3.5">
              <div className="w-9 h-9 rounded-full bg-brand-secondary/80 text-white flex items-center justify-center flex-shrink-0 mt-0.5">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-bold text-brand-muted mb-0.5">
                  Completed Maintenance
                </div>
                {loadingTasks ? (
                  <Skeleton className="h-8 w-14 my-0.5 rounded-lg" />
                ) : (
                  <div className="text-2xl font-black text-brand-secondary/80 tracking-tight">{stats.completedCount}</div>
                )}
                <div className="text-[11px] text-brand-muted mt-0.5 font-medium">Finished successfully</div>
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
              <div className="lg:col-span-3 relative">
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
                <Select value={selectedCorridorFilter} onValueChange={(val) => val && setSelectedCorridorFilter(val)}>
                  <SelectTrigger className="w-full bg-brand-surface border border-brand-border hover:border-brand-primary/50 text-brand-secondary text-xs rounded-xl px-3.5 py-2.5 outline-none font-bold shadow-2xs cursor-pointer">
                    <SelectValue placeholder="All Corridors" />
                  </SelectTrigger>
                  <SelectContent className="bg-brand-surface border-brand-border text-brand-secondary max-h-60 overflow-y-auto shadow-xl rounded-xl p-1.5">
                    <SelectItem value="ALL" className="rounded-lg px-3 py-2 text-xs font-medium cursor-pointer focus:bg-brand-blue-light/50 focus:text-brand-primary">
                      All Corridors ({availableCorridors.length})
                    </SelectItem>
                    {availableCorridors.map((c) => (
                      <SelectItem key={c.key} value={c.key} className="rounded-lg px-3 py-2 text-xs font-medium cursor-pointer focus:bg-brand-blue-light/50 focus:text-brand-primary">
                        {c.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Status Filter Dropdown */}
              <div className="lg:col-span-3">
                <Select value={selectedStatusFilter} onValueChange={(val) => val && setSelectedStatusFilter(val)}>
                  <SelectTrigger className="w-full bg-brand-surface border border-brand-border hover:border-brand-primary/50 text-brand-secondary text-xs rounded-xl px-3.5 py-2.5 outline-none font-bold shadow-2xs cursor-pointer">
                    <SelectValue placeholder="All Statuses" />
                  </SelectTrigger>
                  <SelectContent className="bg-brand-surface border-brand-border text-brand-secondary max-h-60 overflow-y-auto shadow-xl rounded-xl p-1.5">
                    <SelectItem value="ALL" className="rounded-lg px-3 py-2 text-xs font-medium cursor-pointer focus:bg-brand-blue-light/50 focus:text-brand-primary">All Statuses</SelectItem>
                    <SelectItem value={MaintenanceStatus.PENDING} className="rounded-lg px-3 py-2 text-xs font-medium cursor-pointer focus:bg-brand-blue-light/50 focus:text-brand-primary">
                      {MAINTENANCE_STATUS_LABELS[MaintenanceStatus.PENDING]}
                    </SelectItem>
                    <SelectItem value={MaintenanceStatus.SCHEDULED} className="rounded-lg px-3 py-2 text-xs font-medium cursor-pointer focus:bg-brand-blue-light/50 focus:text-brand-primary">
                      {MAINTENANCE_STATUS_LABELS[MaintenanceStatus.SCHEDULED]}
                    </SelectItem>
                    <SelectItem value={MaintenanceStatus.ACTIVE} className="rounded-lg px-3 py-2 text-xs font-medium cursor-pointer focus:bg-brand-blue-light/50 focus:text-brand-primary">
                      {MAINTENANCE_STATUS_LABELS[MaintenanceStatus.ACTIVE]}
                    </SelectItem>
                    <SelectItem value={MaintenanceStatus.COMPLETED} className="rounded-lg px-3 py-2 text-xs font-medium cursor-pointer focus:bg-brand-blue-light/50 focus:text-brand-primary">
                      {MAINTENANCE_STATUS_LABELS[MaintenanceStatus.COMPLETED]}
                    </SelectItem>
                    <SelectItem value={MaintenanceStatus.CANCELLED} className="rounded-lg px-3 py-2 text-xs font-medium cursor-pointer focus:bg-brand-blue-light/50 focus:text-brand-primary">
                      {MAINTENANCE_STATUS_LABELS[MaintenanceStatus.CANCELLED]}
                    </SelectItem>
                    <SelectItem value={MaintenanceStatus.DELAYED} className="rounded-lg px-3 py-2 text-xs font-medium cursor-pointer focus:bg-brand-blue-light/50 focus:text-brand-primary">
                      {MAINTENANCE_STATUS_LABELS[MaintenanceStatus.DELAYED]}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Target Asset Filter Dropdown */}
              <div className="lg:col-span-3">
                <Select value={selectedAssetFilter} onValueChange={(val) => val && setSelectedAssetFilter(val)}>
                  <SelectTrigger className="w-full bg-brand-surface border border-brand-border hover:border-brand-primary/50 text-brand-secondary text-xs rounded-xl px-3.5 py-2.5 outline-none font-bold shadow-2xs cursor-pointer">
                    <SelectValue placeholder="All Assets" />
                  </SelectTrigger>
                  <SelectContent className="bg-brand-surface border-brand-border text-brand-secondary max-h-60 overflow-y-auto shadow-xl rounded-xl p-1.5">
                    <SelectItem value="ALL" className="rounded-lg px-3 py-2 text-xs font-medium cursor-pointer focus:bg-brand-blue-light/50 focus:text-brand-primary">All Assets</SelectItem>
                    {assets.map((a) => (
                      <SelectItem key={a.id} value={String(a.id)} className="rounded-lg px-3 py-2 text-xs font-medium cursor-pointer focus:bg-brand-blue-light/50 focus:text-brand-primary">
                        {a.asset_title} (#{a.id})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>


          </section>

          {/* Task List Content */}
          <section className="rounded-2xl bg-brand-surface border border-brand-border shadow-sm overflow-visible pb-4">
            {/* Table Header Bar */}
            <div className="p-4 border-b border-brand-border flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-brand-surface">
              <div>
                <h2 className="text-sm font-bold text-brand-secondary flex items-center gap-2">
                  <span>Maintenance Queue & Task Registry</span>
                </h2>
                <p className="text-xs text-brand-muted mt-0.5 font-medium">
                  Corridor maintenance requirements and duration bounds
                </p>
              </div>

              <div className="flex items-center gap-2 overflow-x-auto scrollbar-none w-full sm:w-auto shrink-0 pb-1 sm:pb-0">
                <button
                  onClick={() => {
                    setExpandedAiTaskId(null);
                    refetchTasks();
                  }}
                  disabled={refetchingTasks}
                  className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-brand-surface hover:bg-brand-tertiary border border-brand-border text-brand-secondary text-xs font-bold shadow-xs transition-all cursor-pointer shrink-0 whitespace-nowrap disabled:opacity-50"
                  title="Refresh maintenance tasks"
                >
                  <RefreshCw className={`w-3.5 h-3.5 text-brand-primary ${refetchingTasks ? "animate-spin" : ""}`} />
                  <span>Refresh</span>
                </button>
                <button
                  onClick={handleOpenCreateModal}
                  className="flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-brand-primary hover:bg-blue-700 text-white text-xs font-bold shadow-xs transition-all cursor-pointer shrink-0 whitespace-nowrap"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Schedule Task</span>
                </button>
              </div>
            </div>

            {/* View Switching */}
            {(loadingTasks || loadingAssets || refetchingTasks) ? (
              <MaintenanceTasksTableSkeleton />
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
                <table className="w-full text-center text-xs">
                  <thead className="bg-brand-surface text-brand-muted font-semibold border-b border-brand-border text-[10px] lg:text-[12px]">
                    <tr>
                      <th className="py-3 px-4 text-center font-semibold">
                        <div className="flex items-center justify-center gap-1">
                          <span>Criticality</span>
                          <Popover>
                            <PopoverTrigger
                              aria-label="About Criticality"
                              className="inline-flex h-4 w-4 items-center justify-center rounded-full text-brand-muted transition-colors hover:text-brand-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary"
                            >
                              <Info className="h-3.5 w-3.5" />
                            </PopoverTrigger>
                            <PopoverContent
                              align="center"
                              className="w-72 border border-brand-border bg-brand-surface p-3 text-left shadow-xl opacity-100"
                            >
                              <PopoverHeader>
                                <PopoverTitle className="text-xs font-bold text-brand-secondary">
                                  Criticality
                                </PopoverTitle>
                                <PopoverDescription className="text-[11px] leading-relaxed text-brand-muted">
                                  This label shows the task's risk/severity level selected when the maintenance task is created or edited. It is not calculated from the table data.
                                </PopoverDescription>
                              </PopoverHeader>
                              <p className="text-[11px] leading-relaxed text-brand-muted">
                                Labels are based on the selected rating: Critical (8–10), High (6–7), Moderate (4–5), and Low (1–3).
                              </p>
                            </PopoverContent>
                          </Popover>
                        </div>
                      </th>
                      <th className="py-3 px-4 text-center font-semibold">Task Code</th>
                      <th className="py-3 px-4 text-center font-semibold">Target Asset</th>
                      <th className="py-3 px-4 text-center font-semibold">Corridor</th>
                      <th className="py-3 px-4 text-center font-semibold">
                        <div className="flex items-center justify-center gap-1">
                          <span>Block Window</span>
                          <Popover>
                            <PopoverTrigger
                              aria-label="About Block Window"
                              className="inline-flex h-4 w-4 items-center justify-center rounded-full text-brand-muted transition-colors hover:text-brand-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary"
                            >
                              <Info className="h-3.5 w-3.5" />
                            </PopoverTrigger>
                            <PopoverContent
                              align="center"
                              className="w-72 border border-brand-border bg-brand-surface p-3 text-left shadow-xl opacity-100"
                            >
                              <PopoverHeader>
                                <PopoverTitle className="text-xs font-bold text-brand-secondary">
                                  Block Window
                                </PopoverTitle>
                                <PopoverDescription className="text-[11px] leading-relaxed text-brand-muted">
                                  This shows the reserved corridor time and date for the maintenance task. No train movement is scheduled during this period.
                                </PopoverDescription>
                              </PopoverHeader>
                              <p className="text-[11px] leading-relaxed text-brand-muted">
                                Select the AI logo beside the time to view an AI-recommended alternative slot when one is available.
                              </p>
                            </PopoverContent>
                          </Popover>
                        </div>
                      </th>
                      <th className="py-3 px-4 text-center font-semibold">Status</th>
                      <th className="py-3 px-4 text-right font-semibold">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-brand-border/60 text-brand-secondary">
                    {filteredTasks.map((task, index) => {
                      const urgKey = (task.urgency as MaintenancePriority) || MaintenancePriority.MEDIUM;
                      const statKey = (task.task_status as MaintenanceStatus) || MaintenanceStatus.PENDING;
                      const urg = URGENCY_CONFIG[urgKey] || URGENCY_CONFIG[MaintenancePriority.MEDIUM];
                      const stat = STATUS_CONFIG[statKey] || STATUS_CONFIG[MaintenanceStatus.PENDING];
                      const taskAsset = assets.find((a) => a.id === task.asset);
                      const corridorName = task.section_name || taskAsset?.section_name || "General Corridor";
                      const isLastItem = index >= Math.max(1, filteredTasks.length - 3) || (filteredTasks.length <= 4 && index >= 2);

                      const secId = taskAsset?.section;
                      const secName = task.section_name || taskAsset?.section_name;
                      const matchingBw = task.block_window
                        ? {
                          id: task.block_window.id,
                          section: Number(task.block_window.section || secId || 1),
                          start_time: task.block_window.start_time,
                          end_time: task.block_window.end_time,
                          status: task.block_window.status || "RESERVED",
                        }
                        : blockWindows.find((bw) => {
                          if (bw.task && bw.task === task.id) return true;
                          if (bw.task_id && bw.task_id === task.task_code) return true;
                          if (bw.task_code && bw.task_code === task.task_code) return true;
                          return false;
                        });

                      const hasAllocatedWindow = Boolean(matchingBw);
                      const effectiveStatKey = (statKey === MaintenanceStatus.COMPLETED || statKey === MaintenanceStatus.CANCELLED)
                        ? statKey
                        : (statKey === MaintenanceStatus.PENDING && hasAllocatedWindow ? MaintenanceStatus.SCHEDULED : statKey);
                      const effectiveStat = STATUS_CONFIG[effectiveStatKey] || stat;
                      const isActiveMaintenance = effectiveStatKey === MaintenanceStatus.ACTIVE;

                      return (
                        <React.Fragment key={task.id}>
                          <tr className="hover:bg-brand-tertiary/60 transition-colors group">
                              {/* Criticality Score / Index */}
                            <td className="py-3.5 px-4 text-center">
                              <div className="inline-flex items-center justify-center">
                                {(() => {
                                  const score = task.risk_rating ?? 5;

                                  const riskStyle =
                                    score >= 8
                                      ? { label: "Critical", className: "text-red-700" }
                                      : score >= 6
                                        ? { label: "High", className: "text-orange-700" }
                                        : score >= 4
                                          ? { label: "Moderate", className: "text-amber-700" }
                                          : { label: "Low", className: "text-emerald-700" };

                                  return (
                                    <span
                                      className={`text-[11px] font-extrabold ${riskStyle.className}`}
                                    >
                                      {riskStyle.label}
                                    </span>
                                  );
                                })()}
                              </div>
                            </td>
                            <td className="py-3.5 px-4 text-center font-semibold text-brand-primary text-xs lg:text-sm">
                              {task.task_code}
                            </td>
                            <td className="py-3.5 px-4 text-center">
                              <div className="font-semibold text-brand-secondary">
                                {task.asset_name || `Asset #${task.asset}`}
                              </div>
                            </td>
                            <td className="py-3.5 px-4 text-center">
                              <div className="flex items-center justify-center gap-1.5 font-semibold text-brand-secondary text-xs">
                                <MapPin className="w-3.5 h-3.5 text-brand-primary shrink-0" />
                                <span>{corridorName}</span>
                              </div>
                            </td>

                            {/* Block Window */}
                            <td className="py-3.5 px-4 text-center">
                              {matchingBw ? (
                                (() => {
                                  const slotInfo = formatWindowSlot(
                                    matchingBw.start_time,
                                    matchingBw.end_time
                                  );

                                  const showAiBot =
                                    effectiveStatKey !== MaintenanceStatus.COMPLETED &&
                                    effectiveStatKey !== MaintenanceStatus.CANCELLED &&
                                    !isActiveMaintenance &&
                                    task.task_status !== MaintenanceStatus.COMPLETED &&
                                    task.task_status !== MaintenanceStatus.CANCELLED;

                                  return (
                                    <div className="inline-flex items-center justify-center gap-2.5 min-w-[170px]">
                                      {/* Timing + Date */}
                                      <div className="w-[105px] flex-shrink-0 flex flex-col items-center justify-center gap-0.5">
                                        <span className="font-mono text-xs text-brand-secondary font-bold whitespace-nowrap">
                                          {slotInfo.time}
                                        </span>
                                        <span className="text-[10px] text-brand-muted font-medium whitespace-nowrap">
                                          {slotInfo.date}
                                        </span>
                                      </div>

                                      {/* AI Bot */}
                                      <div className="w-9 flex-shrink-0 flex items-center justify-center">
                                        {showAiBot && (
                                          <button
                                            type="button"
                                            onClick={() => handleToggleAiRecommendation(task)}
                                            className={`w-9 h-9 flex items-center justify-center rounded-lg border shadow-xs transition-all cursor-pointer ${expandedAiTaskId === task.id
                                              ? "bg-gray-900 text-white border-gray-900 shadow-sm"
                                              : "bg-gray-100 hover:bg-gray-200 border-gray-300 text-gray-900"
                                              }`}
                                            title="AI Recommended Slot"
                                            aria-label="AI Recommended Slot"
                                          >
                                            <Image
                                              src="/ai.svg"
                                              alt="AI recommendation"
                                              width={24}
                                              height={24}
                                              className={`h-16 w-16 object-contain ${expandedAiTaskId === task.id
                                                ? "brightness-0 invert"
                                                : ""
                                                }`}
                                            />
                                          </button>
                                        )}
                                      </div>
                                    </div>
                                  );
                                })()
                              ) : isActiveMaintenance ? (
                                <span className="text-brand-muted">—</span>
                              ) : (
                                <div className="inline-flex flex-col items-center gap-1.5">
                                  <button
                                    onClick={() => handleOpenBlockWindowModal(task)}
                                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-white font-bold text-[11px] shadow-xs transition-colors cursor-pointer"
                                  >
                                    <Plus className="w-3 h-3" />
                                    <span>Add Block Window</span>
                                  </button>
                                </div>
                              )}
                            </td>


                           {/* Status */}
                            <td className="py-3.5 px-4 text-center">
                              <div className="flex items-center justify-center">
                                <span
                                  className={`inline-flex items-center justify-center gap-1.5 w-[108px] h-[28px] rounded-md text-[10px] font-semibold border ${effectiveStat.badge}`}
                                >
                                  <effectiveStat.icon className="w-3.5 h-3.5 text-white shrink-0" />
                                  <span className="whitespace-nowrap">
                                    {effectiveStat.label}
                                  </span>
                                </span>
                              </div>
                            </td>
                            {/* Actions - all actions are inside the vertical ellipsis */}
                            <td className="py-3.5 px-4 text-center">
                              <div className="flex items-center justify-end gap-1.5">
                                <DropdownMenu>
                                  <DropdownMenuTrigger
                                    className="p-2 rounded-lg bg-brand-surface hover:bg-brand-tertiary border border-brand-border text-black shadow-xs transition-colors cursor-pointer outline-none focus:ring-2 focus:ring-brand-primary/20"
                                    title="Actions"
                                    aria-label="Actions"
                                  >
                                    <MoreVertical className="w-4 h-4" />
                                  </DropdownMenuTrigger>

                                  <DropdownMenuContent
                                    align="end"
                                    sideOffset={6}
                                    className="w-56 bg-brand-surface border-brand-border text-brand-secondary shadow-xl rounded-xl p-1.5 z-50"
                                  >
                                     {effectiveStatKey === MaintenanceStatus.SCHEDULED && (
                                      <DropdownMenuItem
                                        onClick={() => openLifecycleModal(task, "start")}
                                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-amber-50 text-sm font-semibold text-amber-700 cursor-pointer focus:bg-amber-50 focus:text-amber-700"
                                      >
                                        <Wrench className="w-4 h-4 text-amber-700" />
                                        <span>Start Maintenance</span>
                                      </DropdownMenuItem>
                                    )}

                                      {/* Complete Task */}
                                    {(effectiveStatKey === MaintenanceStatus.ACTIVE ||
                                      (effectiveStatKey === MaintenanceStatus.DELAYED && Boolean(task.started_at))) && (
                                        <DropdownMenuItem
                                          onClick={() => openLifecycleModal(task, "complete")}
                                          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-emerald-50 text-sm font-semibold text-emerald-700 cursor-pointer focus:bg-emerald-50 focus:text-emerald-700"
                                        >
                                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                                          <span>Complete Task</span>
                                        </DropdownMenuItem>
                                      )}

                                    {/* Cancel Task */}
                                    {effectiveStatKey !== MaintenanceStatus.COMPLETED &&
                                      effectiveStatKey !== MaintenanceStatus.CANCELLED && (
                                        <DropdownMenuItem
                                          onClick={() => openLifecycleModal(task, "cancel")}
                                          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold text-red-700 cursor-pointer"
                                        >
                                          <XCircle className="w-4 h-4 text-red-700" />
                                          <span>Cancel Task</span>
                                        </DropdownMenuItem>
                                      )}

                                    {/* View Details - always available */}
                                    <DropdownMenuItem
                                      onClick={() => setInspectingTask(task)}
                                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-brand-tertiary text-sm font-semibold text-brand-secondary cursor-pointer focus:bg-brand-tertiary focus:text-brand-secondary"
                                    >
                                      <Eye className="w-4 h-4 text-black" />
                                      <span>View Details</span>
                                    </DropdownMenuItem>
                                   

                                    {/* Edit Task + Block Window */}
                                    {!isActiveMaintenance &&
                                      effectiveStatKey !== MaintenanceStatus.COMPLETED &&
                                      effectiveStatKey !== MaintenanceStatus.CANCELLED && (
                                        <>
                                          <DropdownMenuItem
                                            onClick={() => handleOpenEditModal(task)}
                                            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-brand-tertiary text-sm font-semibold text-brand-secondary cursor-pointer focus:bg-brand-tertiary focus:text-brand-secondary"
                                          >
                                            <Edit2 className="w-4 h-4 text-brand-secondary" />
                                            <span>Edit Task</span>
                                          </DropdownMenuItem>

                                          <DropdownMenuItem
                                            onClick={() => handleOpenBlockWindowModal(task, matchingBw)}
                                            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-brand-tertiary text-sm font-semibold text-brand-secondary cursor-pointer focus:bg-brand-tertiary focus:text-brand-secondary"
                                          >
                                            <Calendar className="w-4 h-4 text-brand-secondary" />
                                            <span>Block Window</span>
                                          </DropdownMenuItem>
                                        </>
                                      )}
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </div>
                            </td>
                          </tr>

                          {/* Inline AI Recommendation Expanded Panel (Not in Dialogue) */}
                          {expandedAiTaskId === task.id && statKey !== MaintenanceStatus.PENDING && statKey !== MaintenanceStatus.COMPLETED && statKey !== MaintenanceStatus.CANCELLED && effectiveStatKey !== MaintenanceStatus.COMPLETED && effectiveStatKey !== MaintenanceStatus.CANCELLED && Boolean(matchingBw) && (
                            <tr key={`ai-${task.id}`} className="bg-gray-50 border-b border-gray-200">
                              <td colSpan={7} className="p-3.5">
                                {loadingAiTaskId === task.id ? (
                                  <div className="p-4 rounded-2xl bg-white border border-gray-300 flex items-center justify-center gap-2 text-xs font-bold text-gray-900 shadow-xs">
                                    <RefreshCw className="w-4 h-4 text-gray-900 animate-spin" />
                                    <span>Evaluating AI Slot Optimisation...</span>
                                  </div>
                                ) : (
                                  <div className="p-4.5 rounded-2xl bg-white border border-gray-300 text-left space-y-2 shadow-sm">
                                    {/* Header */}
                                    <div className="flex items-center justify-between flex-wrap">
                                      <div className="flex items-center text-xs font-bold text-brand-secondary">
                                        <Image
                                          src="/ai.svg"
                                          alt=""
                                          width={16}
                                          height={16}
                                          className="h-12 w-12 object-contain"
                                        />
                                        <span>Sanket AI</span>
                                      </div>
                                      <button
                                        type="button"
                                        onClick={() => handleToggleAiRecommendation(task, true)}
                                        disabled={loadingAiTaskId === task.id}
                                        className="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 bg-white px-2.5 py-1.5 text-[11px] font-bold text-gray-900 transition-colors hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
                                        title="Refresh AI slot recommendation"
                                      >
                                        <RefreshCw className={`h-3.5 w-3.5 ${loadingAiTaskId === task.id ? "animate-spin" : ""}`} />
                                        Refresh
                                      </button>
                                    </div>

                                    {/* User-facing recommendation summary */}
                                    <p className="text-xs text-brand-secondary font-medium leading-relaxed">
                                      {aiRecommendationsMap[task.id]?.recommended_slot
                                        ? "Your current block window is conflict-free. An alternative scheduling option is available below for your review."
                                        : "Your current block window is conflict-free. No alternative scheduling option is available at this time."}
                                    </p>
                                    {aiRecommendationsMap[task.id]?.recommended_slot ? (
                                      <div className="pt-3 border-t border-gray-200 flex items-center justify-between flex-wrap gap-4">
                                        {/* Slot Comparison */}
                                        <div className="flex items-center gap-6 text-xs">
                                          <div>
                                            <span className="text-[10px] font-bold uppercase text-brand-muted block mb-0.5">Current Slot</span>
                                            <span className="font-mono font-bold text-brand-secondary">
                                              {matchingBw ? (
                                                (() => {
                                                  const curInfo = formatWindowSlot(matchingBw.start_time, matchingBw.end_time);
                                                  return `${curInfo.time} · ${curInfo.date}`;
                                                })()
                                              ) : (
                                                aiRecommendationsMap[task.id]?.current_slot || "Pending Allocation"
                                              )}
                                            </span>
                                          </div>

                                          <div>
                                            <span className="text-[10px] font-bold uppercase text-gray-900 block mb-0.5 flex items-center gap-1">
                                           AI Recommended
                                            </span>
                                            <span className="font-mono font-bold text-gray-900 text-sm">
                                              {(() => {
                                                const recSlot = aiRecommendationsMap[task.id]?.recommended_slot;
                                                if (!recSlot) return null;
                                                const recInfo = formatWindowSlot(recSlot.start, recSlot.end);
                                                return `${recInfo.time} (${recSlot.duration_minutes} min) · ${recInfo.date}`;
                                              })()}
                                            </span>
                                          </div>
                                        </div>

                                        {/* Accept AI Slot Button */}
                                        <button
                                          type="button"
                                          onClick={() => handleAcceptAiSlot(task, aiRecommendationsMap[task.id]?.recommended_slot)}
                                          disabled={schedulingSlot !== null}
                                          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gray-900 hover:bg-gray-800 active:bg-black text-white font-bold text-xs shadow-md shadow-gray-900/20 transition-all cursor-pointer disabled:opacity-60"
                                        >
                                          {schedulingSlot === aiRecommendationsMap[task.id]?.recommended_slot?.start ? (
                                            <>
                                              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                                              <span>Applying AI Slot...</span>
                                            </>
                                          ) : (
                                            <>
                                              <ArrowRight className="w-4 h-4 text-white" />
                                              <span>Accept AI Slot</span>
                                            </>
                                          )}
                                        </button>
                                      </div>
                                    ) : (
                                      <div className="pt-2 border-t border-gray-200 text-xs font-semibold text-brand-secondary">
                                        No conflict-free AI recommendation found for this corridor on the target date.
                                      </div>
                                    )}
                                  </div>
                                )}
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
            {tasksPage && tasksPage.count > 0 && (
              <div className="flex flex-col gap-3 border-t border-brand-border px-4 py-3 text-xs sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3 text-brand-muted">
                  <span className="font-medium">
                    Showing <strong className="text-brand-secondary">{(currentPage - 1) * pageSize + 1}</strong> to{" "}
                    <strong className="text-brand-secondary">{Math.min(currentPage * pageSize, tasksPage.count)}</strong> of{" "}
                    <strong className="text-brand-secondary">{tasksPage.count}</strong> maintenance tasks
                  </span>
                  <label className="flex items-center gap-2 border-l border-brand-border pl-3">
                    Rows:
                    <select
                      value={pageSize}
                      onChange={(event) => {
                        setPageSize(Number(event.target.value));
                        setCurrentPage(1);
                      }}
                      className="rounded-lg border border-brand-border bg-brand-surface px-2.5 py-1.5 font-bold text-brand-secondary outline-none"
                    >
                      <option value={5}>5</option>
                      <option value={10}>10</option>
                      <option value={20}>20</option>
                      <option value={50}>50</option>
                    </select>
                  </label>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                    disabled={!tasksPage.previous || fetchingTasks}
                    className="rounded-lg border border-brand-border p-2 text-brand-secondary transition-colors hover:bg-brand-tertiary disabled:cursor-not-allowed disabled:opacity-40"
                    aria-label="Previous page"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  {Array.from({ length: totalPages }).map((_, index) => {
                    const page = index + 1;
                    if (page === 1 || page === totalPages || (page >= currentPage - 1 && page <= currentPage + 1)) {
                      return <button key={page} type="button" onClick={() => setCurrentPage(page)} className={`h-8 min-w-8 rounded-lg px-2 font-bold transition-colors ${currentPage === page ? "bg-brand-primary text-white" : "border border-brand-border text-brand-secondary hover:bg-brand-tertiary"}`}>{page}</button>;
                    }
                    if (page === currentPage - 2 || page === currentPage + 2) return <span key={page} className="px-0.5 text-brand-muted">…</span>;
                    return null;
                  })}
                  <button
                    type="button"
                    onClick={() => setCurrentPage((page) => page + 1)}
                    disabled={!tasksPage.next || fetchingTasks}
                    className="rounded-lg border border-brand-border p-2 text-brand-secondary transition-colors hover:bg-brand-tertiary disabled:cursor-not-allowed disabled:opacity-40"
                    aria-label="Next page"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
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
                    <option value={0} disabled>
                      -- Select Target Asset --
                    </option>
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

              <div>
                <label className="font-extrabold text-brand-secondary block mb-1">
                  Urgency Level
                </label>
                <select
                  value={formData.urgency}
                  onChange={(e) => setFormData({ ...formData, urgency: e.target.value as MaintenancePriority })}
                  className="w-full bg-brand-surface border border-brand-border focus:border-brand-primary text-brand-secondary text-xs rounded-xl px-3.5 py-2.5 outline-none cursor-pointer font-bold shadow-2xs"
                >
                  <option value={MaintenancePriority.CRITICAL}>{MAINTENANCE_PRIORITY_LABELS[MaintenancePriority.CRITICAL]}</option>
                  <option value={MaintenancePriority.HIGH}>{MAINTENANCE_PRIORITY_LABELS[MaintenancePriority.HIGH]}</option>
                  <option value={MaintenancePriority.MEDIUM}>{MAINTENANCE_PRIORITY_LABELS[MaintenancePriority.MEDIUM]}</option>
                  <option value={MaintenancePriority.LOW}>{MAINTENANCE_PRIORITY_LABELS[MaintenancePriority.LOW]}</option>
                </select>
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
                    Completion Deadline{" "}

                  </label>
                  <input
                    type="date"
                    value={formData.deadline || ""}
                    min={getDateBounds("maintenance").min}
                    max={getDateBounds("maintenance").max}
                    onChange={(e) => {
                      const val = e.target.value;
                      const error = validateDate(val, "maintenance");
                      setDeadlineError(error);
                      if (!error) {
                        setFormData({ ...formData, deadline: val });
                      }
                    }}
                    className={`w-full bg-brand-surface border focus:border-brand-primary text-brand-secondary text-xs rounded-xl px-3.5 py-2 outline-none cursor-pointer font-bold shadow-2xs ${deadlineError
                      ? "border-red-400 focus:border-red-500"
                      : "border-brand-border"
                      }`}
                  />
                  {deadlineError && (
                    <p className="text-[10px] text-red-500 font-semibold mt-0.5">
                      {deadlineError}
                    </p>
                  )}
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
          <div className="bg-brand-surface border border-brand-border rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-brand-border">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-brand-secondary/10 text-black flex items-center justify-center">
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

            {/* Phase 3 AI Continuous Monitoring for this task */}
            {(() => {
              const taskAsset = assets.find((a) => a.id === inspectingTask.asset);
              const secId = taskAsset?.section;
              const secName = inspectingTask.section_name || taskAsset?.section_name;
              const matchingBw = inspectingTask.block_window
                ? {
                  id: inspectingTask.block_window.id,
                  section: Number(inspectingTask.block_window.section || secId || 1),
                  start_time: inspectingTask.block_window.start_time,
                  end_time: inspectingTask.block_window.end_time,
                  status: inspectingTask.block_window.status || "RESERVED",
                }
                : blockWindows.find((bw) => {
                  if (bw.task && bw.task === inspectingTask.id) return true;
                  if (bw.task_id && bw.task_id === inspectingTask.task_code) return true;
                  if (bw.task_code && bw.task_code === inspectingTask.task_code) return true;
                  return false;
                });


              return (
                <div className="space-y-3">
                  <div className="rounded-xl border border-brand-border bg-brand-tertiary p-3 text-xs">
                    <p className="font-bold text-brand-secondary">Execution evidence</p>
                    {inspectingTask.started_at && <p className="mt-1 text-brand-secondary">Started: {formatIstDateTime(inspectingTask.started_at)} IST</p>}
                    {inspectingTask.completion_remark && <p className="mt-1 text-brand-secondary">Completion{inspectingTask.completed_at ? ` (${formatIstDateTime(inspectingTask.completed_at)} IST)` : ""}: {inspectingTask.completion_remark}</p>}
                    {inspectingTask.cancellation_remark && <p className="mt-1 text-brand-secondary">Cancellation{inspectingTask.cancelled_at ? ` (${formatIstDateTime(inspectingTask.cancelled_at)} IST)` : ""}: {inspectingTask.cancellation_remark}</p>}
                    {inspectingTask.is_delayed && <p className="mt-1 font-bold text-red-700">Deadline warning: task is delayed.</p>}
                    {inspectingTask.checklist && inspectingTask.checklist.length > 0 && <details className="mt-2 text-brand-secondary"><summary className="cursor-pointer font-semibold">Start checklist</summary><ul className="mt-1 list-disc pl-4">{inspectingTask.checklist.map((item, index) => <li key={`${item.item}-${index}`}>{item.item}: {item.completed ? "completed" : "not completed"}</li>)}</ul></details>}
                    {inspectingTask.block_window && <p className="mt-2 text-brand-secondary">Block window: {inspectingTask.block_window.section_name || `Section #${inspectingTask.block_window.section}`} · {formatIstDateTime(inspectingTask.block_window.start_time)} – {formatIstDateTime(inspectingTask.block_window.end_time)} IST</p>}
                  </div>
                  <div className="rounded-xl border border-brand-border bg-brand-surface p-3 text-xs">
                    <p className="font-bold text-brand-secondary">Maintenance audit log</p>
                    {maintenanceLogsQuery.isLoading ? <p className="mt-2 text-brand-muted">Loading audit history…</p> : maintenanceLogsQuery.isError ? <button onClick={() => maintenanceLogsQuery.refetch()} className="mt-2 font-bold text-brand-primary underline cursor-pointer">Retry loading logs</button> : maintenanceLogsQuery.data?.length ? <ol className="mt-3 space-y-3 border-l border-brand-border pl-3">{maintenanceLogsQuery.data.map((log) => <li key={log.id} className="relative"><span className="absolute -left-[17px] top-1 h-2 w-2 rounded-full bg-brand-primary" /><p className="font-semibold text-brand-secondary">{log.event} · {log.status}</p><p className="text-brand-muted">{formatIstDateTime(log.logged_at)} IST</p>{log.remark && <p className="mt-1 text-brand-secondary">{log.remark}</p>}{log.details?.checklist && <details className="mt-1"><summary className="cursor-pointer text-brand-primary">Checklist evidence</summary><ul className="list-disc pl-4 text-brand-secondary">{log.details.checklist.map((item, index) => <li key={`${item.item}-${index}`}>{item.item}: {item.completed ? "completed" : "not completed"}</li>)}</ul></details>}</li>)}</ol> : <p className="mt-2 text-brand-muted">No audit events have been recorded.</p>}
                  </div>
                </div>
              );
            })()}

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

      {lifecycleTask && lifecycleMode && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <form onSubmit={handleLifecycleSubmit} className="w-full max-w-md max-h-[calc(100dvh-2rem)] overflow-y-auto space-y-4 rounded-2xl border border-brand-border bg-brand-surface p-6 shadow-2xl">
            <div><h3 className="text-base font-extrabold text-brand-secondary">{lifecycleMode === "start" ? "Start maintenance" : lifecycleMode === "complete" ? "Complete maintenance" : "Cancel maintenance"}</h3><p className="mt-1 text-xs text-brand-muted">{lifecycleTask.task_code}</p></div>
            {lifecycleMode === "start" ? <div className="space-y-3">{startChecklist.map((entry, index) => <label key={entry.item} className="flex items-center gap-3 rounded-xl border border-brand-border p-3 text-sm font-semibold text-brand-secondary"><Checkbox checked={entry.completed} onCheckedChange={(checked) => setStartChecklist((items) => items.map((item, itemIndex) => itemIndex === index ? { ...item, completed: checked === true } : item))} />{entry.item}</label>)}</div> : <textarea value={lifecycleRemark} onChange={(event) => setLifecycleRemark(event.target.value)} required placeholder={lifecycleMode === "complete" ? "Describe the completed work and restoration." : "Give the cancellation reason."} className="min-h-28 w-full rounded-xl border border-brand-border bg-brand-tertiary p-3 text-sm text-brand-secondary outline-none focus:border-brand-primary" />}
            {lifecycleError && <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-3 text-xs font-semibold text-red-700">{lifecycleError}</div>}
            <div className="flex justify-end gap-2"><button type="button" onClick={() => { setLifecycleTask(null); setLifecycleMode(null); setLifecycleError(null); }} className="rounded-lg border border-brand-border px-3 py-2 text-xs font-bold text-brand-secondary cursor-pointer">Back</button><button type="submit" disabled={startMaintenanceMutation.isPending || completeMaintenanceMutation.isPending || cancelMaintenanceMutation.isPending || (lifecycleMode === "start" && !startChecklist.every((item) => item.completed))} className="rounded-lg bg-brand-primary px-3 py-2 text-xs font-bold text-white disabled:opacity-50 cursor-pointer">{startMaintenanceMutation.isPending || completeMaintenanceMutation.isPending || cancelMaintenanceMutation.isPending ? "Saving…" : "Confirm"}</button></div>
          </form>
        </div>
      )}

      {/* MODAL 3: Delete Confirmation */}
      {deletingTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-brand-surface border border-brand-border rounded-2xl max-w-md w-full max-h-[calc(100dvh-2rem)] overflow-y-auto p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-red-50 text-red-600 flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-brand-secondary">Confirm Delete</h3>
                <p className="text-xs text-brand-muted mt-0.5">
                  Are you sure you want to delete task <span className="font-bold text-brand-secondary">&quot;{deletingTask.task_code}&quot;</span>?
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
                <div className="w-8 h-8 rounded-lg bg-brand-secondary/80 flex items-center justify-center">
                  <ShieldAlert className="w-4 h-4 text-white" />
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
                    Railway Section
                  </label>
                  <div className="w-full px-3 py-2 rounded-xl bg-brand-tertiary border border-brand-border text-brand-secondary text-xs font-semibold">
                    {sections.find((sec) => Number(sec.id) === Number(conflictForm.section))?.section_name || `Section #${conflictForm.section}`}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-brand-secondary mb-1">
                      Maintenance Start Time
                    </label>
                    <div className="relative">
                      <input
                        ref={startDateTimeRef}
                        type="datetime-local"
                        value={conflictForm.maintenance_start.replace(" ", "T").substring(0, 16)}
                        min={minStartDateTime}
                        max={maxMaintenanceDateTime}
                        onChange={(e) => {
                          const value = e.target.value;
                          const formattedVal = value.replace("T", " ");
                          let nextEnd = conflictForm.maintenance_end;

                          // If start is valid and current end is <= new start, advance end time cleanly
                          if (value) {
                            const sDate = new Date(value);
                            const eDate = new Date(conflictForm.maintenance_end.replace(" ", "T"));
                            if (!Number.isNaN(sDate.getTime()) && (!conflictForm.maintenance_end || eDate <= sDate)) {
                              const autoEnd = new Date(sDate.getTime() + 2 * 60 * 60 * 1000);
                              const maxLimit = new Date(currentNow.getFullYear(), currentNow.getMonth(), currentNow.getDate() + 30, 23, 59);
                              const safeEnd = autoEnd > maxLimit ? maxLimit : autoEnd;
                              nextEnd = formatDateTimeLocal(safeEnd).replace("T", " ");
                            }
                          }

                          setConflictForm((prev) => ({
                            ...prev,
                            maintenance_start: formattedVal,
                            maintenance_end: nextEnd,
                          }));

                          const valRes = validateMaintenanceTimes(value, nextEnd, currentNow);
                          setConflictStartError(valRes.startError);
                          setConflictEndError(valRes.endError);
                          if (conflictError) setConflictError(null);
                        }}
                        className={`w-full px-3 py-2 pr-20 rounded-xl bg-brand-tertiary border text-brand-secondary text-xs font-mono font-semibold focus:outline-hidden cursor-pointer transition-colors ${conflictStartError
                          ? "border-red-400 bg-red-50/40 focus:border-red-500"
                          : "border-brand-border focus:border-brand-primary"
                          }`}
                      />
                      <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-0.5 bg-brand-tertiary">
                        <button
                          type="button"
                          onClick={() => {
                            const input = startDateTimeRef.current as (HTMLInputElement & { showPicker?: () => void }) | null;
                            input?.showPicker?.();
                          }}
                          className="p-1.5 rounded-md hover:bg-brand-border transition-colors cursor-pointer"
                          title="Select date"
                        >
                          <Calendar className="w-4 h-4 text-brand-secondary" />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            const input = startDateTimeRef.current as (HTMLInputElement & { showPicker?: () => void }) | null;
                            input?.showPicker?.();
                          }}
                          className="p-1.5 rounded-md hover:bg-brand-border transition-colors cursor-pointer"
                          title="Select time"
                        >
                          <Clock className="w-4 h-4 text-brand-secondary" />
                        </button>
                      </div>
                    </div>
                    {conflictStartError ? (
                      <span className="text-[11px] font-bold text-red-600 mt-1 flex items-center gap-1 animate-in fade-in">
                        <AlertTriangle className="w-3 h-3 text-red-600 shrink-0" />
                        <span>{conflictStartError}</span>
                      </span>
                    ) : (
                      <span className="text-[10px] text-brand-muted mt-1 block">Present/future time only • Automatically selected from the task corridor block window</span>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-brand-secondary mb-1">
                      Maintenance End Time
                    </label>
                    <div className="relative">
                      <input
                        ref={endDateTimeRef}
                        type="datetime-local"
                        value={conflictForm.maintenance_end.replace(" ", "T").substring(0, 16)}
                        min={minEndDateTime}
                        max={maxMaintenanceDateTime}
                        onChange={(e) => {
                          const value = e.target.value;
                          const formattedVal = value.replace("T", " ");
                          setConflictForm((prev) => ({
                            ...prev,
                            maintenance_end: formattedVal,
                          }));

                          const valRes = validateMaintenanceTimes(conflictForm.maintenance_start, value, currentNow);
                          setConflictStartError(valRes.startError);
                          setConflictEndError(valRes.endError);
                          if (conflictError) setConflictError(null);
                        }}
                        className={`w-full px-3 py-2 pr-20 rounded-xl bg-brand-tertiary border text-brand-secondary text-xs font-mono font-semibold focus:outline-hidden cursor-pointer transition-colors ${conflictEndError
                          ? "border-red-400 bg-red-50/40 focus:border-red-500"
                          : "border-brand-border focus:border-brand-primary"
                          }`}
                      />
                      <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-0.5 bg-brand-tertiary">
                        <button
                          type="button"
                          onClick={() => {
                            const input = endDateTimeRef.current as (HTMLInputElement & { showPicker?: () => void }) | null;
                            input?.showPicker?.();
                          }}
                          className="p-1.5 rounded-md hover:bg-brand-border transition-colors cursor-pointer"
                          title="Select date"
                        >
                          <Calendar className="w-4 h-4 text-brand-secondary" />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            const input = endDateTimeRef.current as (HTMLInputElement & { showPicker?: () => void }) | null;
                            input?.showPicker?.();
                          }}
                          className="p-1.5 rounded-md hover:bg-brand-border transition-colors cursor-pointer"
                          title="Select time"
                        >
                          <Clock className="w-4 h-4 text-brand-secondary" />
                        </button>
                      </div>
                    </div>
                    {conflictEndError ? (
                      <span className="text-[11px] font-bold text-red-600 mt-1 flex items-center gap-1 animate-in fade-in">
                        <AlertTriangle className="w-3 h-3 text-red-600 shrink-0" />
                        <span>{conflictEndError}</span>
                      </span>
                    ) : (
                      <span className="text-[10px] text-brand-muted mt-1 block">Must be after start time • Automatically selected from the task corridor block window</span>
                    )}
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
                  disabled={checkConflictMutation.isPending || Boolean(conflictStartError || conflictEndError)}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500 text-xs font-bold text-white shadow-xs transition-colors disabled:opacity-50 cursor-pointer"
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

            {/* Scheduled Success Alert */}
            {scheduledSuccessMsg && (
              <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs flex items-start gap-2.5 animate-in fade-in duration-200 shadow-xs">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-emerald-900">Corridor Block Reserved!</div>
                  <div className="mt-0.5 text-emerald-700">{scheduledSuccessMsg}</div>
                </div>
              </div>
            )}

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
                <div className="w-8 h-8 rounded-lg bg-purple/50 text-purple-600 flex items-center justify-center">
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
                onClick={() => { setIsFeasibleModalOpen(false); setCreatedBlockWindowId(null); }}
                className="text-brand-muted hover:text-brand-secondary text-lg font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleRunFeasibleCheck} className="space-y-4">
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-brand-secondary mb-1">
                    Maintenance Task
                  </label>
                  <div className="w-full px-3 py-2 rounded-xl bg-brand-tertiary border border-brand-border text-brand-secondary text-xs font-semibold">
                    {selectedFeasibleTask
                      ? `${selectedFeasibleTask.task_code} - ${selectedFeasibleTask.asset_name || `Asset #${selectedFeasibleTask.asset}`} (${selectedFeasibleTask.estimated_duration} mins)`
                      : "No task selected"}
                  </div>
                  {selectedFeasibleTask && (
                    <div className="flex items-center gap-1.5 mt-1.5 px-2.5 py-1 rounded-lg bg-brand-tertiary border border-brand-border text-[11px] text-brand-secondary">
                      <MapPin className="w-3.5 h-3.5 text-brand-primary shrink-0" />
                      <span>
                        Scheduled Corridor:{" "}
                        <strong className="text-brand-primary">
                          {selectedFeasibleSectionName || "Unknown Section"}
                        </strong>
                      </span>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-brand-secondary mb-1">
                    Target Date
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="date"
                      value={feasibleForm.date}
                      min={todayInIst()}
                      max={getDateBounds("block-windows").max}
                      onChange={(e) => {
                        setFeasibleForm((prev) => ({ ...prev, date: e.target.value }));
                        setFeasibleResult(null);
                        setFeasibleError(null);
                      }}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-brand-tertiary border border-brand-border hover:border-brand-primary/50 text-brand-secondary text-xs font-mono font-semibold outline-none focus:ring-1 focus:ring-brand-primary/30 transition-colors cursor-pointer"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => { setIsFeasibleModalOpen(false); setCreatedBlockWindowId(null); }}
                  className="px-4 py-2 rounded-xl bg-brand-surface hover:bg-brand-tertiary border border-brand-border text-xs font-bold text-brand-secondary transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={feasibleWindowsMutation.isPending}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-purple-500 text-xs font-bold text-white shadow-xs transition-colors disabled:opacity-50 cursor-pointer"
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

            {/* Scheduled Success Alert */}
            {scheduledSuccessMsg && (
              <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs flex items-start gap-2.5 animate-in fade-in duration-200 shadow-xs">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-emerald-900">Corridor Block Reserved!</div>
                  <div className="mt-0.5 text-emerald-700">{scheduledSuccessMsg}</div>
                </div>
              </div>
            )}

            {/* Phase 3: AI Recommendation Banner — shown after block window is created */}
            {createdBlockWindowId && (
              <div className="space-y-2">
                <div className="flex items-center gap-1.5 text-[11px] font-semibold text-brand-muted">
                
                  <span>Live AI Monitoring · auto-refreshes every 60 s</span>
                </div>
                <AIBlockRecommendationBanner
                  blockWindowId={createdBlockWindowId}
                  taskId={feasibleForm.task_id || undefined}
                  onSlotUpdated={() => {
                    showToast("success", "Block window rescheduled to AI-recommended slot.");
                  }}
                />
              </div>
            )}

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
                  <div className="p-2.5 rounded-xl bg-brand-tertiary border border-brand-border col-span-1">
                    <span className="text-brand-muted block text-xs font-semibold">Section</span>
                    <span className="font-bold text-brand-secondary mt-0.5 block truncate">
                      {feasibleResult.section.name}
                    </span>
                    <span className="text-[10px] text-brand-muted font-mono">
                      {feasibleResult.section.source_code} → {feasibleResult.section.destination_code}
                    </span>
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

                    <div className="space-y-2.5 max-h-64 overflow-y-auto pr-1">
                      {feasibleResult.windows
                        .slice()
                        .sort((a, b) => (b.decision_score ?? 0) - (a.decision_score ?? 0))
                        .map((w, idx) => {
                          const scorePercent = w.decision_score != null ? Math.round(w.decision_score * 100) : null;
                          const slotTime = formatWindowSlot(w.start, w.end);

                          return (
                            <div
                              key={idx}
                              className="p-3.5 rounded-xl bg-emerald-50/70 border border-emerald-200 text-xs flex flex-col gap-2.5 transition-all hover:shadow-xs hover:border-emerald-300"
                            >
                              <div className="flex items-start justify-between gap-3">
                                <div>
                                  <div className="flex items-center gap-2">
                                    <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 font-semibold text-[11px]">
                                      {slotTime.date}
                                    </span>
                                    <span className="font-mono font-bold text-brand-secondary text-xs">
                                      {slotTime.time}
                                    </span>
                                  </div>
                                  <div className="text-[11px] text-emerald-800 mt-1 font-medium">
                                    Sufficient clearance for {feasibleResult.required_duration_minutes}-minute work.
                                  </div>
                                </div>
                                <div className="flex items-center gap-2 shrink-0">
                                  {idx === 0 && scorePercent != null && (
                                    <span className="px-2 py-0.5 rounded-md bg-amber-500 text-white font-bold text-[10px] tracking-wide uppercase shadow-xs">
                                      ⭐ Best Slot
                                    </span>
                                  )}
                                  <span className="px-2.5 py-1 rounded-lg bg-emerald-600 text-white font-mono font-bold text-xs shrink-0">
                                    {w.duration_minutes} mins
                                  </span>
                                </div>
                              </div>

                              {scorePercent != null && (
                                <div className="pt-2 border-t border-emerald-200/70 flex items-center justify-between gap-2">
                                  <div className="flex items-center gap-2">
                                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border ${scorePercent >= 70
                                      ? "bg-red-50 text-red-700 border-red-200"
                                      : scorePercent >= 40
                                        ? "bg-amber-50 text-amber-800 border-amber-200"
                                        : "bg-emerald-50 text-emerald-800 border-emerald-200"
                                      }`}>
                                      Risk Factor: {scorePercent}%
                                    </span>
                                    <span className="text-[10px] text-gray-500 font-medium hidden sm:inline">
                                      {scorePercent >= 70
                                        ? "High Urgency"
                                        : scorePercent >= 40
                                          ? "Moderate"
                                          : "Routine"}
                                    </span>
                                  </div>

                                  <div className="flex items-center gap-2 w-32">
                                    <div className="w-full bg-emerald-200/80 rounded-full h-1.5 overflow-hidden">
                                      <div
                                        className={`h-1.5 rounded-full ${scorePercent >= 70
                                          ? "bg-red-500"
                                          : scorePercent >= 40
                                            ? "bg-amber-500"
                                            : "bg-emerald-600"
                                          }`}
                                        style={{ width: `${scorePercent}%` }}
                                      />
                                    </div>
                                    <span className="text-[10px] font-mono font-bold text-gray-600 shrink-0">
                                      {scorePercent}%
                                    </span>
                                  </div>
                                </div>
                              )}

                              {/* 1-Click Integrated Scheduling Action Button */}
                              <button
                                type="button"
                                onClick={() => handleConfirmSchedule(w)}
                                disabled={schedulingSlot !== null}
                                className="w-full mt-1 py-2 px-3 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 disabled:opacity-60 text-white rounded-lg font-bold text-xs flex items-center justify-center gap-1.5 transition shadow-xs cursor-pointer"
                              >
                                {schedulingSlot === w.start ? (
                                  <>
                                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                                    <span>Reserving Corridor Block...</span>
                                  </>
                                ) : (
                                  <>
                                    <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                                    <span>Confirm & Schedule Block Window</span>
                                  </>
                                )}
                              </button>
                            </div>
                          );
                        })}
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

      {/* MODAL: Create / Update Block Window */}
      {isBlockWindowModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-brand-surface border border-brand-border rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-brand-border">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-brand-primary text-white flex items-center justify-center border border-purple-200">
                  <Calendar className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-brand-secondary">
                    {blockWindowStep === "AI_RECOMMENDATION"
                      ? "AI Slot Optimization"
                      : editingBlockWindow
                        ? `Update Block Window #${editingBlockWindow.id}`
                        : "Create Block Window"}
                  </h3>
                  <p className="text-xs text-brand-muted">
                    {blockWindowStep === "AI_RECOMMENDATION"
                      ? "Continuous CP-SAT conflict analysis and collision-free slot recommendation"
                      : editingBlockWindow
                        ? "Modify allocated time bounds and status for this corridor block window"
                        : "Reserve a dedicated corridor maintenance window for this task"}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsBlockWindowModalOpen(false)}
                className="text-brand-muted hover:text-brand-secondary text-lg font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            {blockWindowStep === "FORM" ? (
              <form onSubmit={handleSubmitBlockWindow} className="space-y-4">
                {selectedBlockTask && (
                  <div className="p-3 rounded-xl bg-brand-tertiary border border-brand-border space-y-1">
                    <div className="text-[11px] font-bold text-brand-muted uppercase">Target Maintenance Task</div>
                    <div className="text-xs font-bold text-brand-secondary flex items-center justify-between">
                      <span>{selectedBlockTask.task_code} - {selectedBlockTask.asset_name || `Asset #${selectedBlockTask.asset}`}</span>
                      <span className="font-mono text-brand-primary font-extrabold">{selectedBlockTask.estimated_duration} mins required</span>
                    </div>
                  </div>
                )}

                <div className="space-y-3">
                  {/* Corridor / Section Select (Disabled: fixed to asset corridor) */}
                  <div>
                    <label className="block text-xs font-bold text-brand-secondary mb-1">
                      Corridor / Railway Section
                    </label>
                    <select
                      value={blockWindowForm.section}
                      disabled
                      onChange={(e) => setBlockWindowForm((prev) => ({ ...prev, section: Number(e.target.value) }))}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-brand-tertiary/80 border border-brand-border text-brand-secondary text-xs font-semibold outline-none disabled:opacity-80 disabled:cursor-not-allowed shadow-2xs"
                    >
                      {sections.map((sec) => (
                        <option key={sec.id} value={sec.id}>
                          {sec.section_name || `Section #${sec.id}`} ({sec.source_station_code || sec.origin_station || "SRC"} → {sec.destination_station_code || sec.end_station || "DST"})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Start Time & End Time inputs (24h format) */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-brand-secondary mb-1">
                        Start Time (24h)
                      </label>
                      <input
                        type="datetime-local"
                        value={blockWindowForm.start_time}
                        min={getMinMaintenanceDateTime()}
                        max={getMaxMaintenanceDateTime()}
                        onChange={(e) => {
                          const newStart = e.target.value;
                          setBlockWindowForm((prev) => {
                            let updatedEnd = prev.end_time;
                            if (newStart && updatedEnd) {
                              const sTime = new Date(newStart).getTime();
                              const eTime = new Date(updatedEnd).getTime();
                              const maxAllowedETime = new Date(toApiTimestamp(getMaxEndTimeForStart(newStart))).getTime();

                              if (eTime <= sTime) {
                                const durationMins = selectedBlockTask?.estimated_duration || 60;
                                updatedEnd = formatDateTimeLocal(new Date(sTime + durationMins * 60 * 1000));
                              } else if (eTime > maxAllowedETime) {
                                updatedEnd = getMaxEndTimeForStart(newStart);
                              }
                            }
                            return { ...prev, start_time: newStart, end_time: updatedEnd };
                          });
                        }}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-brand-tertiary border border-brand-border hover:border-brand-primary/50 text-brand-secondary text-xs font-mono font-semibold outline-none focus:ring-1 focus:ring-brand-primary/30 transition-colors cursor-pointer"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-brand-secondary mb-1">
                        End Time (24h)
                      </label>
                      <input
                        type="datetime-local"
                        value={blockWindowForm.end_time}
                        min={blockWindowForm.start_time || getMinMaintenanceDateTime()}
                        max={getMaxEndTimeForStart(blockWindowForm.start_time)}
                        onChange={(e) => setBlockWindowForm((prev) => ({ ...prev, end_time: e.target.value }))}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-brand-tertiary border border-brand-border hover:border-brand-primary/50 text-brand-secondary text-xs font-mono font-semibold outline-none focus:ring-1 focus:ring-brand-primary/30 transition-colors cursor-pointer"
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Standard Backend Conflict Recommendation Banner */}
                {conflictCheckLoading ? (
                  <div className="p-3 rounded-xl bg-brand-tertiary border border-brand-border flex items-center gap-2.5 text-xs font-semibold text-brand-muted animate-pulse">
                    <RefreshCw className="w-4 h-4 text-brand-primary animate-spin" />
                    <span>Checking corridor train traffic & conflicts...</span>
                  </div>
                ) : standardConflictResult ? (
                  standardConflictResult.has_conflict ? (
                    <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 space-y-2 text-xs">
                      <div className="flex items-center gap-2 text-amber-900 font-extrabold">
                        <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                        <span>Standard Conflict Warning ({standardConflictResult.conflict_count} train conflict{standardConflictResult.conflict_count > 1 ? "s" : ""})</span>
                      </div>
                      {standardConflictResult.conflicts.length > 0 && (
                        <div className="space-y-1 pl-6">
                          {standardConflictResult.conflicts.map((c) => (
                            <div key={c.train_number} className="text-[11px] font-medium text-amber-800 flex items-center justify-between">
                              <span>Train {c.train_number} ({c.train_name})</span>
                              <span className="font-mono text-amber-700 font-semibold">{formatTimeHHMM(c.entry_time)} – {formatTimeHHMM(c.exit_time)}</span>
                            </div>
                          ))}
                        </div>
                      )}
                      <p className="text-[11px] text-amber-700 font-medium leading-relaxed pt-1 border-t border-amber-200/60">
                        You can still create this block window manually. Our AI engine will suggest optimal conflict-free slots immediately after creation.
                      </p>
                    </div>
                  ) : (
                    <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center gap-2 text-xs font-bold text-emerald-800">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>All Clear: No train movements conflict with the selected timeframe.</span>
                    </div>
                  )
                ) : null}

                {/* Success Alert */}
                {blockWindowSuccessMsg && (
                  <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs flex items-center gap-2.5 animate-in fade-in duration-200">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span className="font-bold">{blockWindowSuccessMsg}</span>
                  </div>
                )}

                {/* Error Alert */}
                {blockWindowError && (
                  <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-center gap-2.5">
                    <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
                    <span className="font-bold">{blockWindowError}</span>
                  </div>
                )}

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-brand-border">
                  <button
                    type="button"
                    onClick={() => setIsBlockWindowModalOpen(false)}
                    className="px-4 py-2 rounded-xl bg-brand-surface hover:bg-brand-tertiary border border-brand-border text-xs font-bold text-brand-secondary transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={createBlockWindowMutation.isPending || updateBlockWindowMutation.isPending}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-brand-primary hover:bg-blue-700 text-xs font-bold text-white shadow-xs transition-colors disabled:opacity-50 cursor-pointer"
                  >
                    {(createBlockWindowMutation.isPending || updateBlockWindowMutation.isPending) ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Saving Window...</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>{editingBlockWindow ? "Update Block Window" : "Create Block Window"}</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            ) : (
              /* Post-Creation AI Optimization Step */
              <div className="space-y-4">
                <div className="p-3.5 rounded-xl bg-brand-tertiary border border-brand-border space-y-1">
                  <div className="text-[10px] font-bold uppercase text-brand-muted">Newly Created Block Window #{createdBlockWindowId}</div>
                  <div className="text-xs font-bold text-brand-secondary">
                    {selectedBlockTask?.task_code} - {selectedBlockTask?.asset_name || `Asset #${selectedBlockTask?.asset}`}
                  </div>
                </div>

                {createdBlockWindowId && (
                  <AIBlockRecommendationBanner
                    blockWindowId={createdBlockWindowId}
                    taskId={selectedBlockTask?.task_code}
                    onSlotUpdated={() => {
                      showToast("success", "AI recommended slot accepted & block window updated!");
                      setIsBlockWindowModalOpen(false);
                    }}
                  />
                )}

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-brand-border">
                  <button
                    type="button"
                    onClick={() => setIsBlockWindowModalOpen(false)}
                    className="px-4 py-2 rounded-xl bg-brand-surface hover:bg-brand-tertiary border border-brand-border text-xs font-bold text-brand-secondary transition-colors cursor-pointer"
                  >
                    Keep My Slot & Finish
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
