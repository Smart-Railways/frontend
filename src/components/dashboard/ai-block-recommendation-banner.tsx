"use client";

import { useState } from "react";
import { AlertTriangle, CheckCircle2, Cpu, RefreshCw, Sparkles, X } from "lucide-react";
import { useApplyBlockRecommendation, useBlockRecommendation, useUpdateBlockWindow } from "@/hooks";
import { FeasibleWindowSlot } from "@/types";

interface Props {
  blockWindowId: number;
  taskId?: string;
  onSlotUpdated?: () => void;
}

function time(value?: string | null) {
  return value?.match(/[T ](\d{2}:\d{2})/)?.[1] ?? value?.match(/^(\d{2}:\d{2})/)?.[1] ?? "--:--";
}

function dateLabel(value?: string | null) {
  const match = value?.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!match) return value || "—";
  return new Intl.DateTimeFormat("en-IN", {
    timeZone: "UTC",
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3]))));
}

function score(score?: number | null) {
  const percent = Math.round((score ?? 0) * 100);
  if (percent >= 75) return { percent, label: "High suitability", tone: "bg-emerald-50 text-emerald-700 border-emerald-200" };
  if (percent >= 40) return { percent, label: "Moderate suitability", tone: "bg-amber-50 text-amber-700 border-amber-200" };
  return { percent, label: "Low suitability", tone: "bg-red-50 text-red-700 border-red-200" };
}

function algorithm(value?: string | null) {
  if (value === "Embedded Railway-AI CP-SAT" || value === "CP-SAT Constraint Solver") return "AI optimized";
  if (value === "Database Timestamp Gap") return "Schedule-based fallback";
  return value || "Recommendation engine";
}

function SlotDetails({ slot }: { slot: FeasibleWindowSlot }) {
  const value = score(slot.decision_score);
  return <><p className="font-mono font-bold text-brand-secondary">{time(slot.start)} – {time(slot.end)} · {slot.duration_minutes} min</p><div className="mt-1 flex flex-wrap items-center gap-2"><span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-bold ${value.tone}`}><Cpu className="h-3 w-3" />{value.percent}% · {value.label}</span><span className="text-[10px] text-brand-muted">{algorithm(slot.algorithm)}</span></div></>;
}

export function AIBlockRecommendationBanner({ blockWindowId, taskId, onSlotUpdated }: Props) {
  const recommendation = useBlockRecommendation(blockWindowId, taskId);
  const apply = useApplyBlockRecommendation();
  const update = useUpdateBlockWindow();
  const [selected, setSelected] = useState<FeasibleWindowSlot | null>(null);
  const [applyBackendChoice, setApplyBackendChoice] = useState(false);

  const openConfirm = (slot: FeasibleWindowSlot, useBackendChoice: boolean) => {
    setSelected(slot);
    setApplyBackendChoice(useBackendChoice);
  };

  const confirm = async () => {
    const data = recommendation.data;
    if (!selected || !data) return;
    try {
      if (applyBackendChoice) {
        await apply.mutateAsync({ blockWindowId, taskId });
      } else {
        await update.mutateAsync({
          id: blockWindowId,
          data: { section: data.section.id, task_id: taskId, start_time: selected.start, end_time: selected.end, status: "RESERVED" },
        });
      }
      setSelected(null);
      await recommendation.refetch();
      onSlotUpdated?.();
    } catch {
      // The mutation error is rendered in the confirmation modal.
    }
  };

  if (recommendation.isLoading) return <div className="animate-pulse rounded-xl border border-brand-border bg-brand-tertiary p-4 text-xs text-brand-muted"><RefreshCw className="mr-2 inline h-4 w-4 animate-spin" />Loading block recommendation…</div>;
  if (recommendation.isError || !recommendation.data) return <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-xs text-red-800"><p>{recommendation.error instanceof Error ? recommendation.error.message : "Could not load the recommendation."}</p><button onClick={() => recommendation.refetch()} className="mt-2 font-bold underline cursor-pointer">Retry</button></div>;

  const data = recommendation.data;
  const recommended = data.recommended_slot;
  const alternatives = (data.windows ?? []).filter((slot) => slot.start !== recommended?.start || slot.end !== recommended?.end);
  const isUpdating = apply.isPending || update.isPending;
  const mutationError = apply.error instanceof Error ? apply.error.message : update.error instanceof Error ? update.error.message : null;

  return <div className="space-y-3 rounded-xl border border-brand-border bg-brand-surface p-4 text-xs shadow-sm">
    <div className="flex items-start justify-between gap-3"><div><p className="font-extrabold text-brand-secondary">Block recommendation</p><p className="mt-0.5 text-brand-muted">{data.section.name} · {data.section.source_code} → {data.section.destination_code}</p></div><button onClick={() => recommendation.refetch()} className="rounded-lg p-1 text-brand-muted hover:bg-brand-tertiary cursor-pointer" title="Refresh recommendation"><RefreshCw className="h-4 w-4" /></button></div>

    <section className={`rounded-xl border p-3 ${data.current_slot.has_conflict ? "border-red-200 bg-red-50" : "border-emerald-200 bg-emerald-50"}`}>
      <p className={`font-bold ${data.current_slot.has_conflict ? "text-red-800" : "text-emerald-800"}`}>{data.current_slot.has_conflict ? <AlertTriangle className="mr-1 inline h-4 w-4" /> : <CheckCircle2 className="mr-1 inline h-4 w-4" />}{data.current_slot.has_conflict ? `Train conflict detected (${data.current_slot.conflict_count})` : "Conflict free"}</p>
      <p className="mt-1 font-mono text-brand-secondary">Current: {time(data.current_slot.start_time)} – {time(data.current_slot.end_time)} · {data.current_slot.duration_minutes} min</p>
      {data.current_slot.has_conflict && data.current_slot.conflicts.length > 0 && <p className="mt-1 text-red-700">Conflicting trains: {data.current_slot.conflicts.map((train) => train.train_number).join(", ")}</p>}
    </section>

    {data.rescheduled_due_to_delay && <section className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-amber-900"><p className="font-extrabold"><AlertTriangle className="mr-1 inline h-4 w-4" />Deadline missed — recovery slot selected.</p><p className="mt-1">Missed deadline: <span className="font-semibold">{dateLabel(data.original_date)}</span></p><p className="mt-1">Recovery date: <span className="font-semibold">{dateLabel(data.date)}</span></p>{recommended && <div className="mt-2 border-t border-amber-200 pt-2"><p className="mb-1 font-bold">New proposed slot</p><SlotDetails slot={recommended} /></div>}</section>}

    {data.has_better_slot && recommended ? <section className="rounded-xl border border-brand-primary/25 bg-brand-blue-light/30 p-3"><p className="font-extrabold text-brand-primary"><Sparkles className="mr-1 inline h-3.5 w-3.5" />AI recommended</p><div className="mt-2"><SlotDetails slot={recommended} /></div><p className="mt-2 leading-relaxed text-brand-secondary">{recommended.recommendation_reason || data.recommendation_reason}</p><button onClick={() => openConfirm(recommended, true)} className="mt-3 rounded-lg bg-brand-primary px-3 py-2 font-bold text-white cursor-pointer">Apply recommendation</button></section> : <section className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 font-bold text-emerald-800">Current block window is already optimal.</section>}

    <section><p className="mb-2 font-bold text-brand-secondary">Alternative windows</p>{alternatives.length === 0 ? <p className="rounded-xl border border-brand-border bg-brand-tertiary p-3 text-brand-muted">No alternative windows are available.</p> : <div className="space-y-2">{alternatives.map((slot, index) => <button key={`${slot.start}-${slot.end}-${index}`} onClick={() => openConfirm(slot, false)} className="w-full rounded-xl border border-brand-border p-3 text-left hover:border-brand-primary/50 hover:bg-brand-tertiary cursor-pointer"><SlotDetails slot={slot} /></button>)}</div>}</section>

    {selected && <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/50 p-4"><div className="w-full max-w-md rounded-2xl bg-brand-surface p-5 shadow-2xl"><div className="flex items-start justify-between gap-3"><div><h3 className="font-extrabold text-brand-secondary">Confirm block-window change</h3><p className="mt-1 text-xs text-brand-muted">Review the selected maintenance window before applying it.</p></div><button onClick={() => setSelected(null)} disabled={isUpdating} className="text-brand-muted cursor-pointer"><X className="h-5 w-5" /></button></div><div className="mt-4 rounded-xl bg-brand-tertiary p-3"><SlotDetails slot={selected} /></div>{mutationError && <p className="mt-3 text-xs text-red-600">{mutationError}</p>}<div className="mt-5 flex justify-end gap-2"><button onClick={() => setSelected(null)} disabled={isUpdating} className="rounded-lg border border-brand-border px-3 py-2 font-bold text-brand-secondary cursor-pointer">Cancel</button><button onClick={confirm} disabled={isUpdating} className="rounded-lg bg-brand-primary px-3 py-2 font-bold text-white disabled:opacity-60 cursor-pointer">{isUpdating ? "Applying…" : "Confirm and apply"}</button></div></div></div>}
  </div>;
}
