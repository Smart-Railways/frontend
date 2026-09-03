"use client";

import React, { useState, useEffect } from "react";
import { Calendar } from "lucide-react";
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
      <div className={cn("flex items-center gap-2.5 text-xs font-medium bg-brand-surface px-3 py-1.5 rounded-xl border border-brand-border shadow-sm", className)}>
        {showIcon && <Calendar className="w-4 h-4 text-brand-secondary shrink-0" />}
        <span className="text-brand-secondary font-semibold">-- --- ----</span>
        <span className="text-brand-primary bg-brand-blue-light px-2 py-0.5 rounded-md font-mono text-xs font-bold border border-brand-primary/20">
          --:--:-- --
        </span>
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
    <div className={cn("flex items-center gap-2 text-xs bg-brand-surface p-2 rounded-xl border border-brand-border shadow-sm", className)}>
      {showIcon && <Calendar className="w-4 h-4 text-brand-secondary shrink-0" />}
      <span className="text-brand-secondary font-bold tracking-tight">{dateStr}</span>
      <span className="text-brand-surface bg-brand-secondary p-1 px-2 rounded-lg font-mono text-xs font-extrabold border border-brand-primary/20 tracking-wide">
        {timeStr}
      </span>
    </div>
  );
}
