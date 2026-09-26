"use client";

import { useState } from "react";
import { VerticalNavbar } from "@/components/navigation/vertical-navbar";
import { LiveClock } from "@/components/ui/live-clock";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useMaintenanceLogs, useMaintenanceTasks } from "@/hooks";
import { CheckCircle2, ClipboardList, FileClock, History, RefreshCw, XCircle } from "lucide-react";

function formatIstDateTime(value?: string | null): string {
  if (!value) return "—";
  const date = new Date(value.replace(" ", "T"));
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("en-IN", { timeZone: "Asia/Kolkata", day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit", hour12: false }).format(date);
}

function getStatusTone(status?: string | null) {
  const value = status?.toLowerCase() ?? "";
  if (value.includes("cancel")) return { badge: "border-rose-200 bg-rose-50 text-rose-700", icon: "bg-rose-600", label: "cancelled" };
  if (value.includes("complete")) return { badge: "border-emerald-200 bg-emerald-50 text-emerald-700", icon: "bg-emerald-600", label: "completed" };
  return { badge: "border-blue-200 bg-blue-50 text-blue-700", icon: "bg-brand-primary", label: status?.toLowerCase() || "recorded" };
}

function getTaskName(task: { asset_name?: string; details?: string }) {
  return task.asset_name?.trim() || task.details?.trim() || "maintenance task";
}

export default function AuditHistoryPage() {
  const [selectedTaskId, setSelectedTaskId] = useState("");
  const tasksQuery = useMaintenanceTasks();
  const logsQuery = useMaintenanceLogs(selectedTaskId || null);
  const selectedTask = tasksQuery.data?.find((task) => String(task.id) === selectedTaskId);
  const refreshAuditHistory = () => {
    tasksQuery.refetch();
    if (selectedTaskId) logsQuery.refetch();
  };

  return (
    <div className="min-h-screen bg-brand-tertiary">
      <VerticalNavbar activeTab="audit-history" />
      <main className="min-h-screen px-4 pb-8 pt-20 sm:px-6 lg:ml-64 lg:px-8 lg:pt-8">
        <div className="mx-auto max-w-6xl">
          <header className="animate-fade-in-down flex flex-col justify-between gap-3 border-b border-brand-border pb-4 sm:flex-row sm:items-center">
            <div>
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-md bg-brand-secondary text-brand-tertiary"><History className="h-3.5 w-3.5" /></div>
                <h1 className="text-xl font-semibold tracking-tight text-brand-secondary sm:text-2xl">Audit History</h1>
              </div>
              <p className="mt-1 text-sm text-brand-muted">A complete, time-stamped record of activity and evidence for each maintenance task.</p>
            </div>
            <div className="hidden items-center lg:flex"><LiveClock /></div>
          </header>

          <section className="mt-5 overflow-hidden rounded-xl border border-brand-border bg-brand-surface">
            <div className="flex items-center gap-2.5 border-b border-brand-border px-4 py-3 sm:px-5">
              <div>
                <h2 className="text-sm font-semibold text-brand-secondary">Find a task record</h2>
                <p className="mt-0.5 text-xs text-brand-muted">choose a maintenance task to view its event trail.</p>
              </div>
            </div>
            <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-end sm:p-5">
              <div className="w-full sm:max-w-2xl">
                <label htmlFor="audit-task" className="mb-1.5 block text-xs font-medium text-brand-muted">Maintenance task</label>
                <Select value={selectedTaskId} onValueChange={(value) => setSelectedTaskId(value ?? "")} disabled={tasksQuery.isLoading || tasksQuery.isError}>
                  <SelectTrigger id="audit-task" className="h-10 w-full rounded-md border-brand-border bg-white text-sm text-brand-secondary shadow-none focus:ring-2 focus:ring-brand-primary/15">
                    <SelectValue placeholder={tasksQuery.isLoading ? "Loading tasks…" : "Choose a task to view its audit history"}>
                      {() => selectedTask ? `${getTaskName(selectedTask)} · ${selectedTask.task_code}` : undefined}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent className="z-[100] max-h-72 rounded-md border-brand-border bg-brand-surface p-1 text-brand-secondary shadow-lg">
                    {tasksQuery.data?.map((task) => <SelectItem key={task.id} value={String(task.id)} className="min-h-9 rounded px-2.5 py-1.5 text-sm focus:bg-brand-blue-light/70">{getTaskName(task)} · {task.task_code}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <button type="button" onClick={refreshAuditHistory} disabled={tasksQuery.isFetching || logsQuery.isFetching} className="flex h-8 shrink-0 items-center justify-center gap-1.5 rounded-md cursor-pointer border bg-brand-primary px-3 text-xs font-medium text-white transition-colors disabled:cursor-not-allowed disabled:opacity-50" title="refresh audit history">
                <RefreshCw className={`h-3.5 w-3.5 text-white ${tasksQuery.isFetching || logsQuery.isFetching ? "animate-spin" : ""}`} />
                <span>Refresh</span>
              </button>
            </div>
            {tasksQuery.isError && <p role="alert" className="px-4 pb-4 text-sm text-red-600 sm:px-5">unable to load maintenance tasks. please refresh and try again.</p>}
          </section>

          <section className="mt-4 overflow-hidden rounded-xl border border-brand-border bg-brand-surface">
            <div className="flex items-center justify-between border-b border-brand-border px-4 py-3 sm:px-5">
              <div><h2 className="text-sm font-semibold text-brand-secondary">Activity Timeline</h2><p className="mt-0.5 text-xs text-brand-muted">Events are shown from most recent to oldest.</p></div>
              {selectedTaskId && logsQuery.data && <span className="rounded-full bg-brand-tertiary px-2.5 py-1 text-xs font-medium text-brand-muted">{logsQuery.data.length} {logsQuery.data.length === 1 ? "event" : "events"}</span>}
            </div>
            {!selectedTaskId ? <EmptyState title="Select a maintenance task" description="Its start, completion, cancellation, and checklist records will appear here." tone="blue" /> : logsQuery.isLoading ? (
              <div className="flex min-h-64 items-center justify-center gap-2 text-sm text-brand-muted"><RefreshCw className="h-5 w-5 animate-spin text-brand-primary" />loading audit history…</div>
            ) : logsQuery.isError ? (
              <div className="flex min-h-64 flex-col items-center justify-center text-center"><p role="alert" className="text-sm text-red-600">unable to load this task’s audit history.</p><button type="button" onClick={() => logsQuery.refetch()} className="mt-3 rounded-md border border-brand-border bg-brand-surface px-3 py-2 text-xs font-medium text-brand-secondary transition-colors hover:bg-brand-tertiary">try again</button></div>
            ) : logsQuery.data?.length ? (
              <ol className="mx-4 my-4 space-y-3 border-l border-brand-border pl-5 sm:mx-5">
                {logsQuery.data.map((log) => {
                  const tone = getStatusTone(log.status);
                  const Icon = tone.label === "cancelled" ? XCircle : CheckCircle2;
                  return <li key={log.id} className="relative">
                    <span className={`absolute -left-[26px] top-4 flex h-4 w-4 items-center justify-center rounded-full ${tone.icon} ring-4 ring-brand-surface`}><Icon className="h-2.5 w-2.5 text-white" /></span>
                    <div className="rounded-lg border border-brand-border bg-brand-tertiary/35 p-3.5 transition-colors hover:bg-brand-tertiary/60 sm:p-4">
                      <div className="flex flex-col gap-2.5 sm:flex-row sm:items-start sm:justify-between">
                        <div><div className="flex flex-wrap items-center gap-2"><h3 className="text-xs font-semibold text-brand-secondary">{log.event}</h3></div>{log.remark && <p className="mt-2 text-sm leading-5 text-brand-secondary">{log.remark}</p>}</div>
                        <time className="shrink-0 text-xs tabular-nums text-brand-muted sm:pt-0.5">{formatIstDateTime(log.logged_at)}IST</time>
                      </div>
                      {log.details?.checklist && <details className="mt-3 border-t border-brand-border pt-2.5 text-sm text-brand-secondary"><summary className="cursor-pointer text-xs font-medium text-brand-primary">checklist evidence</summary><ul className="mt-2 space-y-1 pl-4 text-xs">{log.details.checklist.map((item, index) => <li key={`${item.item}-${index}`} className="list-disc">{item.item}: {item.completed ? "completed" : "not completed"}</li>)}</ul></details>}
                    </div>
                  </li>;
                })}
              </ol>
            ) : <EmptyState title="no audit events yet" description="events will appear after this task is started, completed, or cancelled." />}
          </section>
        </div>
      </main>
    </div>
  );
}

function EmptyState({ title, description, tone = "neutral" }: { title: string; description: string; tone?: "blue" | "neutral" }) {
  return <div className="flex min-h-64 flex-col items-center justify-center px-5 text-center"><span className={`mb-3 flex h-10 w-10 items-center justify-center rounded-full ${tone === "blue" ? "bg-brand-blue-light text-brand-primary" : "bg-brand-tertiary text-brand-muted"}`}><ClipboardList className="h-5 w-5" /></span><h2 className="font-semibold text-brand-secondary">{title}</h2><p className="mt-1 max-w-sm text-sm text-brand-muted">{description}</p></div>;
}
