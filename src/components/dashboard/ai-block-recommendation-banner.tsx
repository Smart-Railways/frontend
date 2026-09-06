"use client";

import React from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  RefreshCw,
  Cpu,
} from "lucide-react";
import { useBlockRecommendation, useUpdateBlockWindow } from "@/hooks";

interface Props {
  blockWindowId: number;
  taskId?: string;
  onSlotUpdated?: () => void;
}

/**
 * Decision-score badge colour follows guide §6:
 *   0.75–1.00 → Crimson (critical priority)
 *   0.40–0.74 → Amber  (recommended)
 *   0.00–0.39 → Emerald (routine)
 */
function ScoreBadge({ score }: { score: number }) {
  const pct = Math.round(score * 100);
  let cls = "";
  let label = "";
  if (score >= 0.75) {
    cls = "bg-red-100 text-red-700 border-red-200";
    label = "Critical Priority";
  } else if (score >= 0.4) {
    cls = "bg-amber-100 text-amber-700 border-amber-200";
    label = "Recommended Window";
  } else {
    cls = "bg-emerald-100 text-emerald-700 border-emerald-200";
    label = "Routine Maintenance";
  }

  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-[11px] font-semibold ${cls}`}
    >
      <Cpu className="w-3 h-3" />
      AI Score {pct}% · {label}
    </span>
  );
}

export function AIBlockRecommendationBanner({
  blockWindowId,
  taskId,
  onSlotUpdated,
}: Props) {
  const { data: recommendation, isLoading, error } = useBlockRecommendation(blockWindowId, taskId);
  const updateMutation = useUpdateBlockWindow();

  const handleAccept = async () => {
    if (!recommendation?.suggested_put_payload) return;
    try {
      await updateMutation.mutateAsync({
        id: blockWindowId,
        data: recommendation.suggested_put_payload,
      });
      onSlotUpdated?.();
    } catch {
      // error surfaced via updateMutation.isError
    }
  };

  // ── Loading ──────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="p-3.5 bg-brand-tertiary border border-brand-border rounded-xl flex items-center gap-2.5 animate-pulse text-brand-muted text-xs">
        <RefreshCw className="w-4 h-4 animate-spin shrink-0" />
        <span>🤖 Analysing corridor traffic via CP-SAT constraint solver…</span>
      </div>
    );
  }

  // ── Error / no data ──────────────────────────────────────────
  if (error || !recommendation) return null;

  const { current_slot, has_better_slot, recommendation_reason, recommended_slot } = recommendation;

  // ── All-clear: no better slot ────────────────────────────────
  if (!has_better_slot) {
    return (
      <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-3">
        <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
        <div>
          <p className="text-xs font-semibold text-emerald-800">Optimal Slot Confirmed</p>
          <p className="text-[11px] text-emerald-700 mt-0.5 leading-snug">{recommendation_reason}</p>
        </div>
      </div>
    );
  }

  // ── Conflict or sub-optimal: show recommendation ─────────────
  const hasConflict = current_slot.has_conflict;

  return (
    <div
      className={`p-4 rounded-xl border space-y-3 ${
        hasConflict
          ? "bg-red-50 border-red-200"
          : "bg-amber-50 border-amber-200"
      }`}
    >

      {/* Reason text */}
      <p className={`text-xs leading-snug ${hasConflict ? "text-red-800" : "text-amber-800"}`}>
        {recommendation_reason}
      </p>

      {/* Conflicting trains list */}
      {hasConflict && current_slot.conflicts.length > 0 && (
        <div className="flex flex-col gap-1">
          {current_slot.conflicts.map((c) => (
            <div
              key={c.train_number}
              className="flex items-center gap-1.5 text-[11px] text-red-700 bg-red-100/60 border border-red-200 rounded-lg px-2.5 py-1"
            >
              <span className="font-bold">🚄 {c.train_number}</span>
              <span className="text-red-600 truncate">{c.train_name}</span>
              <span className="ml-auto font-mono text-red-500 shrink-0">
                {c.entry_time.slice(11, 16)} – {c.exit_time.slice(11, 16)}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Slot comparison */}
      {recommended_slot && (
        <div className="grid grid-cols-2 gap-3 pt-3 border-t border-brand-border">
          <div>
            <span className="text-[10px] font-semibold text-brand-muted block mb-0.5">
              Current Slot
            </span>
            <span className="font-mono text-xs text-brand-secondary font-semibold">
              {current_slot.start_time.slice(11, 16)} – {current_slot.end_time.slice(11, 16)}
            </span>
          </div>
          <div>
            <span className="text-[10px] font-semibold text-emerald-600 block mb-0.5">
              <Sparkles className="w-3 h-3 inline mr-0.5" />
              AI Recommended
            </span>
            <span className="font-mono text-xs text-emerald-700 font-bold">
              {recommended_slot.start.slice(11, 16)} – {recommended_slot.end.slice(11, 16)}
            </span>
            <span className="text-[10px] text-brand-muted ml-1.5">
              ({recommended_slot.duration_minutes} min)
            </span>
          </div>
        </div>
      )}

      {/* Accept button */}
      {recommendation.suggested_put_payload && (
        <div className="flex justify-end pt-1">
          <button
            onClick={handleAccept}
            disabled={updateMutation.isPending}
            className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shadow-sm"
          >
            {updateMutation.isPending ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Updating Slot…</span>
              </>
            ) : (
              <>
                <ArrowRight className="w-3.5 h-3.5" />
                <span>⚡ Accept AI Slot</span>
              </>
            )}
          </button>
        </div>
      )}

      {/* Mutation error */}
      {updateMutation.isError && (
        <p className="text-[11px] text-red-600 mt-1">
          {updateMutation.error instanceof Error
            ? updateMutation.error.message
            : "Failed to update slot"}
        </p>
      )}
    </div>
  );
}
