import React from "react";

interface SparklineProps {
  data: number[];
  color: "signal-green" | "critical-red" | "railway-blue" | "maintenance-amber";
  className?: string;
  width?: number;
  height?: number;
}

const COLOR_MAP = {
  "signal-green": {
    stroke: "#10b981",
    fill: "rgba(16, 185, 129, 0.15)",
  },
  "critical-red": {
    stroke: "#ef4444",
    fill: "rgba(239, 68, 68, 0.15)",
  },
  "railway-blue": {
    stroke: "#3b82f6",
    fill: "rgba(59, 130, 246, 0.15)",
  },
  "maintenance-amber": {
    stroke: "#f59e0b",
    fill: "rgba(245, 158, 11, 0.15)",
  },
};

export function Sparkline({
  data,
  color,
  className = "",
  width = 70,
  height = 24,
}: SparklineProps) {
  if (!data || data.length < 2) return null;

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;

  const padding = 2;
  const usableWidth = width - padding * 2;
  const usableHeight = height - padding * 2;

  const points = data.map((val, idx) => {
    const x = padding + (idx / (data.length - 1)) * usableWidth;
    const y = height - padding - ((val - min) / range) * usableHeight;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  });

  const pathD = `M ${points.join(" L ")}`;
  const areaD = `${pathD} L ${width - padding},${height} L ${padding},${height} Z`;

  const { stroke } = COLOR_MAP[color];

  return (
    <svg
      width={width}
      height={height}
      className={`overflow-visible ${className}`}
      viewBox={`0 0 ${width} ${height}`}
    >
      <defs>
        <linearGradient id={`grad-${color}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={stroke} stopOpacity="0.3" />
          <stop offset="100%" stopColor={stroke} stopOpacity="0.0" />
        </linearGradient>
      </defs>
      <path d={areaD} fill={`url(#grad-${color})`} />
      <path
        d={pathD}
        fill="none"
        stroke={stroke}
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
