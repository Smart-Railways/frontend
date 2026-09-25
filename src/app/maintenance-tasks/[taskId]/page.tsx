"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { AlertTriangle, ArrowLeft, Clock, Wrench } from "lucide-react";
import { useMaintenanceTask } from "@/hooks";

export default function MaintenanceTaskDetailPage() {
  const { taskId } = useParams<{ taskId: string }>();
  const taskQuery = useMaintenanceTask(taskId);

  if (taskQuery.isLoading) return <main className="mx-auto max-w-3xl p-6 text-brand-muted">Loading maintenance task…</main>;
  if (taskQuery.isError || !taskQuery.data) return <main className="mx-auto max-w-3xl p-6"><Link href="/maintenance" className="inline-flex items-center gap-2 text-sm font-semibold text-brand-primary"><ArrowLeft className="size-4" /> Maintenance tasks</Link><p className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-red-800"><AlertTriangle className="mr-2 inline size-5" />{taskQuery.error instanceof Error ? taskQuery.error.message : "This maintenance task could not be loaded."}</p></main>;

  const task = taskQuery.data;
  return <main className="mx-auto min-h-screen max-w-3xl p-4 sm:p-6"><Link href="/maintenance" className="inline-flex items-center gap-2 text-sm font-semibold text-brand-primary"><ArrowLeft className="size-4" /> Maintenance tasks</Link><section className="mt-6 rounded-2xl border border-brand-border bg-brand-surface p-6"><p className="inline-flex items-center gap-2 text-sm font-bold text-brand-primary"><Wrench className="size-4" /> {task.task_code}</p><h1 className="mt-2 text-2xl font-extrabold text-brand-secondary">{task.asset_name || `Asset #${task.asset}`}</h1><p className="mt-3 text-brand-muted">{task.details}</p><div className="mt-6 grid gap-4 text-sm sm:grid-cols-3"><p><span className="block text-xs font-semibold text-brand-muted">Status</span>{task.task_status || "PENDING"}</p><p><span className="block text-xs font-semibold text-brand-muted">Due date</span>{task.deadline}</p><p><span className="block text-xs font-semibold text-brand-muted">Duration</span><Clock className="mr-1 inline size-4" />{task.estimated_duration} minutes</p></div></section></main>;
}
