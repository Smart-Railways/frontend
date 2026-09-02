import React from "react";
import { METRICS_DATA } from "@/data/mock-dashboard-data";
import { MetricCard } from "./metric-card";

export function MetricsGrid() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
      {METRICS_DATA.map((metric) => (
        <MetricCard key={metric.id} data={metric} />
      ))}
    </div>
  );
}
