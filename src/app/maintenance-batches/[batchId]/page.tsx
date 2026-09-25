"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { AlertTriangle, ArrowLeft, CalendarClock, Clock, Wrench } from "lucide-react";
import { useMaintenanceBatch } from "@/hooks";

function formatDateTime(value: string) {
  const date = new Date(value.replace(" ", "T"));
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export default function MaintenanceBatchDetailPage() {
  const params = useParams<{ batchId: string }>();
  const batch = useMaintenanceBatch(params.batchId);

  if (batch.isLoading) {
    return <main className="mx-auto max-w-5xl p-6 text-brand-muted">Loading maintenance batch…</main>;
  }

  if (batch.isError || !batch.data) {
    return (
      <main className="mx-auto max-w-5xl p-6">
        <Link className="inline-flex items-center gap-2 text-sm font-semibold text-brand-primary" href="/maintenance">
          <ArrowLeft className="size-4" /> Maintenance tasks
        </Link>
        <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-5 text-red-800">
          <AlertTriangle className="mr-2 inline size-5" />
          {batch.error instanceof Error ? batch.error.message : "This maintenance batch could not be loaded."}
        </div>
      </main>
    );
  }

  const data = batch.data;
  return (
    <main className="mx-auto min-h-screen max-w-5xl p-4 sm:p-6">
      <Link className="inline-flex items-center gap-2 text-sm font-semibold text-brand-primary" href="/maintenance">
        <ArrowLeft className="size-4" /> Maintenance tasks
      </Link>

      <header className="mt-5 flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-brand-muted">Maintenance batch #{data.id}</p>
          <h1 className="mt-1 text-2xl font-extrabold text-brand-secondary">{data.section_name}</h1>
        </div>
        <span className="rounded-full bg-brand-primary/10 px-3 py-1 text-xs font-bold text-brand-primary">{data.status}</span>
      </header>

      <section className="mt-6 rounded-2xl border border-brand-border bg-brand-surface p-5 shadow-sm">
        <div className="flex items-center gap-2 text-sm font-bold text-brand-secondary"><CalendarClock className="size-5 text-brand-primary" /> Shared block window</div>
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          <div><p className="text-xs font-semibold text-brand-muted">Start</p><p className="mt-1 font-medium">{formatDateTime(data.block_window.start_time)}</p></div>
          <div><p className="text-xs font-semibold text-brand-muted">End</p><p className="mt-1 font-medium">{formatDateTime(data.block_window.end_time)}</p></div>
          <div><p className="text-xs font-semibold text-brand-muted">Duration</p><p className="mt-1 inline-flex items-center gap-1 font-medium"><Clock className="size-4" /> {data.duration_minutes} minutes</p></div>
        </div>
      </section>

      <section className="mt-6">
        <h2 className="text-lg font-extrabold text-brand-secondary">Linked tasks ({data.tasks.length})</h2>
        <div className="mt-3 space-y-3">
          {data.tasks.map((task) => (
            <Link key={task.id} href={`/maintenance-tasks/${encodeURIComponent(task.task_id)}`} className="block rounded-xl border border-brand-border bg-brand-surface p-4 transition hover:border-brand-primary/50 hover:shadow-sm">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div><p className="inline-flex items-center gap-2 font-bold text-brand-secondary"><Wrench className="size-4 text-brand-primary" /> {task.task_id}</p><p className="mt-1 text-sm text-brand-muted">{task.asset_name} · {task.description}</p></div>
                <span className="rounded-full bg-brand-tertiary px-2.5 py-1 text-xs font-bold text-brand-secondary">{task.status}</span>
              </div>
              <p className="mt-3 text-xs text-brand-muted">Due {task.due_date} · {task.duration_minutes} minutes · {task.priority}</p>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
