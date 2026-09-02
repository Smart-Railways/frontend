import React from "react";
import { Train, TriangleAlert, Brain, Clock, ShieldCheck } from "lucide-react";
import { MetricCardData } from "@/types/dashboard";
import { Sparkline } from "../shared/sparkline";

interface MetricCardProps {
  data: MetricCardData;
}

const ICON_MAP = {
  train: Train,
  alert: TriangleAlert,
  brain: Brain,
  clock: Clock,
  shield: ShieldCheck,
};

const COLOR_STYLES = {
  "signal-green": {
    iconBg: "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30",
    glow: "hover:border-emerald-500/40 hover:shadow-[0_0_15px_-3px_rgba(16,185,129,0.2)]",
  },
  "critical-red": {
    iconBg: "bg-red-500/10 text-red-400 border border-red-500/30",
    glow: "hover:border-red-500/40 hover:shadow-[0_0_15px_-3px_rgba(239,68,68,0.2)]",
  },
  "railway-blue": {
    iconBg: "bg-blue-500/10 text-blue-400 border border-blue-500/30",
    glow: "hover:border-blue-500/40 hover:shadow-[0_0_15px_-3px_rgba(59,130,246,0.2)]",
  },
  "maintenance-amber": {
    iconBg: "bg-amber-500/10 text-amber-400 border border-amber-500/30",
    glow: "hover:border-amber-500/40 hover:shadow-[0_0_15px_-3px_rgba(245,158,11,0.2)]",
  },
};

export function MetricCard({ data }: MetricCardProps) {
  const Icon = ICON_MAP[data.iconName] || Train;
  const style = COLOR_STYLES[data.accentColor];

  return (
    <div
      className={`rounded-xl bg-[#0d1527] border border-[#172642] p-4 flex flex-col justify-between transition-all duration-200 ${style.glow}`}
    >
      {/* Top row: Icon & Title */}
      <div className="flex items-center gap-3">
        <div
          className={`w-9 h-9 rounded-xl flex items-center justify-center ${style.iconBg}`}
        >
          <Icon className="w-5 h-5" />
        </div>
        <div className="flex flex-col">
          <span className="text-xs font-medium text-slate-400">
            {data.title}
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-bold text-white tracking-tight">
              {data.value}
            </span>
          </div>
        </div>
      </div>

      {/* Bottom row: Subtitle & Sparkline */}
      <div className="flex items-center justify-between mt-3 pt-2 border-t border-[#172642]/40">
        <span className="text-[11px] text-slate-400 font-medium">
          {data.subtitle}
        </span>
        <Sparkline
          data={data.sparklineData}
          color={data.accentColor}
          width={65}
          height={20}
        />
      </div>
    </div>
  );
}
