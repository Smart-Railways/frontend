"use client";

import { useState } from "react";
import { VerticalNavbar } from "@/components/navigation/vertical-navbar";
import { LiveClock } from "@/components/ui/live-clock";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useMaintenanceLogs, useMaintenanceTasks } from "@/hooks";
import {
  CheckCircle2,
  ClipboardList,
  FileClock,
  RefreshCw,
  XCircle,
} from "lucide-react";

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

function getStatusTone(status?: string | null) {
  const value = status?.toLowerCase() ?? "";
  if (value.includes("cancel")) {
    return {
      badge: "border-rose-200 bg-rose-50 text-rose-700",
      icon: "bg-rose-600",
      label: "Cancelled",
    };
  }
  if (value.includes("complete")) {
    return {
      badge: "border-emerald-200 bg-emerald-50 text-emerald-700",
      icon: "bg-emerald-600",
      label: "Completed",
    };
  }
  return {
    badge: "border-blue-200 bg-blue-50 text-blue-700",
    icon: "bg-brand-primary",
    label: status || "Recorded",
  };
}

function getTaskName(task: { asset_name?: string; details?: string }) {
  return task.asset_name?.trim() || task.details?.trim() || "Maintenance task";
}

export default function AuditHistoryPage() {
  const [selectedTaskId, setSelectedTaskId] = useState<string>("");
  const tasksQuery = useMaintenanceTasks();
  const logsQuery = useMaintenanceLogs(selectedTaskId || null);
  const selectedTask = tasksQuery.data?.find((task) => String(task.id) === selectedTaskId);

  return (
    <div className="min-h-screen bg-brand-tertiary">
      <VerticalNavbar activeTab="audit-history" />
      <main className="min-h-screen px-4 pb-10 pt-20 sm:px-6 lg:ml-64 lg:px-10 lg:pt-10">
        <div className="mx-auto max-w-7xl">
          <header className="mb-8 flex flex-col gap-5 border-b border-brand-border pb-7 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xl font-bold font-black tracking-[-0.035em] text-brand-secondary sm:text-2xl">Audit history</p>
              <p className="mt-2 max-w-xl text-sm leading-6 text-brand-muted">A complete, time-stamped record of activity and evidence for every maintenance task.</p>
            </div>
            <LiveClock className="hidden sm:flex" />
          </header>

          <section className="overflow-hidden rounded-2xl border border-brand-border bg-brand-surface shadow-[0_2px_10px_rgba(23,26,31,0.04)]">
            <div className="flex items-center gap-3 border-b border-brand-border bg-[#fcfaf5] px-5 py-4 sm:px-6">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-secondary text-white">
                <FileClock className="h-4 w-4" />
              </span>
              <div>
                <h2 className="text-sm font-extrabold text-brand-secondary">Find a task record</h2>
                <p className="mt-0.5 text-xs text-brand-muted">Choose a maintenance task to view its event trail.</p>
              </div>
            </div>
            <div className="flex flex-col gap-3 p-5 sm:flex-row sm:items-start sm:p-6">
              <div className="w-full sm:max-w-2xl">
                <label htmlFor="audit-task" className="mb-2 block text-xs font-bold uppercase tracking-[0.08em] text-brand-muted">Maintenance task</label>
                <Select value={selectedTaskId} onValueChange={(value) => setSelectedTaskId(value ?? "")} disabled={tasksQuery.isLoading || tasksQuery.isError}>
                <SelectTrigger id="audit-task" className="h-11 w-full bg-white text-brand-secondary shadow-sm">
                  <SelectValue placeholder={tasksQuery.isLoading ? "Loading tasks…" : "Choose a task to view its audit history"}>
                    {() => selectedTask ? `${getTaskName(selectedTask)} · ${selectedTask.task_code}` : undefined}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent className="z-[100] max-h-72 rounded-xl border border-brand-border bg-brand-surface p-1.5 text-brand-secondary shadow-2xl">
                  {tasksQuery.data?.map((task) => (
                    <SelectItem key={task.id} value={String(task.id)} className="min-h-10 rounded-lg px-3 py-2 text-brand-secondary focus:bg-brand-blue-light/70">
                      {getTaskName(task)} · {task.task_code}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              </div>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  tasksQuery.refetch();
                  if (selectedTaskId) logsQuery.refetch();
                }}
                disabled={tasksQuery.isFetching || logsQuery.isFetching}
                className="h-11 shrink-0 border-brand-border bg-white px-4 text-brand-secondary shadow-sm sm:mt-[26px]"
              >
                <RefreshCw className={`h-4 w-4 ${tasksQuery.isFetching || logsQuery.isFetching ? "animate-spin" : ""}`} />
                Refresh
              </Button>
            </div>
            {tasksQuery.isError && <p role="alert" className="mt-3 text-sm font-medium text-red-600">Unable to load maintenance tasks. Please refresh and try again.</p>}
          </section>

          <section className="mt-6 overflow-hidden rounded-2xl border border-brand-border bg-brand-surface shadow-[0_2px_10px_rgba(23,26,31,0.04)]">
            <div className="flex items-center justify-between border-b border-brand-border px-5 py-4 sm:px-6">
              <div>
                <h2 className="text-sm font-extrabold text-brand-secondary">Activity timeline</h2>
                <p className="mt-0.5 text-xs text-brand-muted">Events are shown from most recent to oldest.</p>
              </div>
              {selectedTaskId && logsQuery.data && (
                <span className="rounded-full bg-brand-tertiary px-3 py-1 text-xs font-bold text-brand-muted">{logsQuery.data.length} {logsQuery.data.length === 1 ? "event" : "events"}</span>
              )}
            </div>
            {!selectedTaskId ? (
              <div className="flex min-h-72 flex-col items-center justify-center px-5 text-center">
                <span className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-brand-blue-light text-brand-primary"><ClipboardList className="h-6 w-6" /></span>
                <h2 className="font-bold text-brand-secondary">Select a maintenance task</h2>
                <p className="mt-1 max-w-sm text-sm text-brand-muted">Its start, completion, cancellation, and checklist records will appear here.</p>
              </div>
            ) : logsQuery.isLoading ? (
              <div className="flex min-h-72 items-center justify-center gap-3 text-sm font-semibold text-brand-muted">
                <RefreshCw className="h-5 w-5 animate-spin text-brand-primary" /> Loading audit history…
              </div>
            ) : logsQuery.isError ? (
              <div className="flex min-h-72 flex-col items-center justify-center text-center">
                <p role="alert" className="text-sm font-semibold text-red-600">Unable to load this task’s audit history.</p>
                <Button type="button" variant="outline" onClick={() => logsQuery.refetch()} className="mt-3 border-brand-border">Try again</Button>
              </div>
            ) : logsQuery.data?.length ? (
              <ol className="mx-5 my-6 space-y-5 border-l-2 border-slate-200 pl-6 sm:mx-6">
                {logsQuery.data.map((log) => (
                  <li key={log.id} className="relative">
                    {(() => {
                      const tone = getStatusTone(log.status);
                      const Icon = tone.label === "Cancelled" ? XCircle : CheckCircle2;
                      return (
                        <>
                    <span className={`absolute -left-[35px] top-5 flex h-5 w-5 items-center justify-center rounded-full ${tone.icon} ring-4 ring-brand-surface`}>
                      <Icon className="h-3 w-3 text-white" />
                    </span>
                    <div className="rounded-xl border border-brand-border bg-[#fcfaf5] p-5 transition-shadow hover:shadow-sm">
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                          <div className="flex flex-wrap items-center gap-2.5">
                            <h3 className="text-base font-extrabold text-brand-secondary">{log.event}</h3>
                            <span className={`rounded-full border px-2.5 py-1 text-[11px] font-extrabold uppercase tracking-[0.06em] ${tone.badge}`}>{tone.label}</span>
                          </div>
                          {log.remark && <p className="mt-3 text-sm leading-6 text-brand-secondary">{log.remark}</p>}
                        </div>
                        <time className="shrink-0 rounded-md bg-white px-2.5 py-1.5 text-xs font-semibold tabular-nums text-brand-muted ring-1 ring-brand-border/80">{formatIstDateTime(log.logged_at)} IST</time>
                      </div>
                      {log.details?.checklist && (
                        <details className="mt-4 border-t border-brand-border pt-3 text-sm text-brand-secondary">
                          <summary className="cursor-pointer font-semibold text-brand-primary">Checklist evidence</summary>
                          <ul className="mt-2 space-y-1 pl-5">
                            {log.details.checklist.map((item, index) => <li key={`${item.item}-${index}`} className="list-disc">{item.item}: {item.completed ? "Completed" : "Not completed"}</li>)}
                          </ul>
                        </details>
                      )}
                    </div>
                        </>
                      );
                    })()}
                  </li>
                ))}
              </ol>
            ) : (
              <div className="flex min-h-72 flex-col items-center justify-center text-center">
                <span className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-brand-tertiary text-brand-muted"><ClipboardList className="h-6 w-6" /></span>
                <h2 className="font-bold text-brand-secondary">No audit events yet</h2>
                <p className="mt-1 text-sm text-brand-muted">Events will appear after this task is started, completed, or cancelled.</p>
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}
