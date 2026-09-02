"use client";

import React, { useState, useEffect } from "react";
import { Clock } from "lucide-react";
import { cn } from "@/lib/utils";

interface LiveClockProps {
  className?: string;
  showIcon?: boolean;
  format12Hour?: boolean;
}

export function LiveClock({ className, showIcon = true, format12Hour = true }: LiveClockProps) {
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    setNow(new Date());
    const timer = setInterval(() => {
      setNow(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  if (!now) {
    return (
      <div className={cn("flex items-center gap-2 text-xs font-semibold text-slate-300 bg-[#0d1527] px-3.5 py-1.5 rounded-xl border border-[#172642]", className)}>
        {showIcon && <Clock className="w-3.5 h-3.5 text-blue-400 shrink-0" />}
        <span className="opacity-60">-- --- ----</span>
        <span className="text-slate-600">|</span>
        <span className="text-blue-400 font-mono opacity-60">--:--:-- --</span>
      </div>
    );
  }

  const dateStr = now.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  const timeStr = now.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: format12Hour,
  });

  return (
    <div className={cn("flex items-center gap-2 text-xs font-semibold text-slate-300 bg-[#0d1527] px-3.5 py-1.5 rounded-xl border border-[#172642]", className)}>
      {showIcon && <Clock className="w-3.5 h-3.5 text-blue-400 shrink-0" />}
      <span>{dateStr}</span>
      <span className="text-slate-600">|</span>
      <span className="text-blue-400 font-mono">{timeStr}</span>
    </div>
  );
}
