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
import { CheckCircle2, ClipboardList, RefreshCw } from "lucide-react";

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

export default function AuditHistoryPage() {
  const [selectedTaskId, setSelectedTaskId] = useState<string>("");
  const tasksQuery = useMaintenanceTasks();
  const logsQuery = useMaintenanceLogs(selectedTaskId || null);

  return (
    <div className="min-h-screen bg-brand-tertiary">
      <VerticalNavbar activeTab="audit-history" />
      <main className="min-h-screen px-4 pb-10 pt-20 sm:px-6 lg:ml-64 lg:px-8 lg:pt-8">
        <div className="mx-auto max-w-6xl">
          <header className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <div className="mb-2 flex items-center gap-2 text-brand-primary">
                <ClipboardList className="h-5 w-5" />
                <span className="text-xs font-bold uppercase tracking-[0.16em]">Maintenance records</span>
              </div>
              <h1 className="text-2xl font-black tracking-tight text-brand-secondary sm:text-3xl">Audit History</h1>
              <p className="mt-2 text-sm text-brand-muted">Review lifecycle events and recorded evidence for each maintenance task.</p>
            </div>
            <LiveClock className="hidden sm:flex" />
          </header>

          <section className="rounded-2xl border border-brand-border bg-brand-surface p-4 shadow-xs sm:p-5">
            <label htmlFor="audit-task" className="mb-2 block text-sm font-bold text-brand-secondary">Maintenance task</label>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Select value={selectedTaskId} onValueChange={(value) => setSelectedTaskId(value ?? "")} disabled={tasksQuery.isLoading || tasksQuery.isError}>
                <SelectTrigger id="audit-task" className="w-full bg-brand-tertiary text-brand-secondary sm:max-w-xl">
                  <SelectValue placeholder={tasksQuery.isLoading ? "Loading tasks…" : "Choose a task to view its audit history"} />
                </SelectTrigger>
                <SelectContent>
                  {tasksQuery.data?.map((task) => (
                    <SelectItem key={task.id} value={String(task.id)}>
                      {task.task_code} · {task.asset_name || task.details || `Task #${task.id}`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  tasksQuery.refetch();
                  if (selectedTaskId) logsQuery.refetch();
                }}
                disabled={tasksQuery.isFetching || logsQuery.isFetching}
                className="border-brand-border text-brand-secondary"
              >
                <RefreshCw className={`h-4 w-4 ${tasksQuery.isFetching || logsQuery.isFetching ? "animate-spin" : ""}`} />
                Refresh
              </Button>
            </div>
            {tasksQuery.isError && <p role="alert" className="mt-3 text-sm font-medium text-red-600">Unable to load maintenance tasks. Please refresh and try again.</p>}
          </section>

          <section className="mt-5 rounded-2xl border border-brand-border bg-brand-surface p-5 shadow-xs sm:p-6">
            {!selectedTaskId ? (
              <div className="flex min-h-56 flex-col items-center justify-center text-center">
                <ClipboardList className="mb-3 h-10 w-10 text-brand-muted" />
                <h2 className="font-bold text-brand-secondary">Select a maintenance task</h2>
                <p className="mt-1 max-w-sm text-sm text-brand-muted">Its start, completion, cancellation, and checklist records will appear here.</p>
              </div>
            ) : logsQuery.isLoading ? (
              <div className="flex min-h-56 items-center justify-center gap-3 text-sm font-semibold text-brand-muted">
                <RefreshCw className="h-5 w-5 animate-spin text-brand-primary" /> Loading audit history…
              </div>
            ) : logsQuery.isError ? (
              <div className="flex min-h-56 flex-col items-center justify-center text-center">
                <p role="alert" className="text-sm font-semibold text-red-600">Unable to load this task’s audit history.</p>
                <Button type="button" variant="outline" onClick={() => logsQuery.refetch()} className="mt-3 border-brand-border">Try again</Button>
              </div>
            ) : logsQuery.data?.length ? (
              <ol className="space-y-5 border-l-2 border-brand-primary/25 pl-5">
                {logsQuery.data.map((log) => (
                  <li key={log.id} className="relative">
                    <span className="absolute -left-[30px] top-1 flex h-4 w-4 items-center justify-center rounded-full bg-brand-primary ring-4 ring-brand-surface">
                      <CheckCircle2 className="h-3 w-3 text-white" />
                    </span>
                    <div className="rounded-xl border border-brand-border bg-brand-tertiary p-4">
                      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
                        <h2 className="font-bold text-brand-secondary">{log.event} <span className="text-brand-muted">· {log.status}</span></h2>
                        <time className="text-xs font-medium text-brand-muted">{formatIstDateTime(log.logged_at)} IST</time>
                      </div>
                      {log.remark && <p className="mt-3 text-sm leading-6 text-brand-secondary">{log.remark}</p>}
                      {log.details?.checklist && (
                        <details className="mt-3 text-sm text-brand-secondary">
                          <summary className="cursor-pointer font-semibold text-brand-primary">Checklist evidence</summary>
                          <ul className="mt-2 space-y-1 pl-5">
                            {log.details.checklist.map((item, index) => <li key={`${item.item}-${index}`} className="list-disc">{item.item}: {item.completed ? "Completed" : "Not completed"}</li>)}
                          </ul>
                        </details>
                      )}
                    </div>
                  </li>
                ))}
              </ol>
            ) : (
              <div className="flex min-h-56 flex-col items-center justify-center text-center">
                <ClipboardList className="mb-3 h-10 w-10 text-brand-muted" />
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
