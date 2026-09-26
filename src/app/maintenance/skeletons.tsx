"use client";

import React from "react";
import { Skeleton } from "@/components/ui/skeleton";

export function MaintenancePageSkeleton() {
  return (
    <div className="min-h-screen bg-brand-tertiary text-brand-secondary flex flex-col font-sans">
      <div className="flex-1 flex pl-0 lg:pl-64 pt-14 lg:pt-0">
        <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-7 flex flex-col space-y-5 max-w-[1600px] mx-auto w-full">

          {/* Header */}
          <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-brand-border/80">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2.5">
                <Skeleton className="w-8 h-8 rounded-full" />
                <Skeleton className="h-7 w-80" />
              </div>
              <Skeleton className="h-3 w-96" />
            </div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <Skeleton className="h-8 w-32 rounded-xl" />
              <Skeleton className="h-8 w-32 rounded-xl" />
              <Skeleton className="h-8 w-32 rounded-xl" />
              <Skeleton className="h-8 w-24 rounded-xl" />
              <Skeleton className="h-8 w-36 rounded-xl" />
            </div>
          </header>

          {/* KPI Cards */}
          <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {["Total Tasks", "Completed Maintenance", "Scheduled Blocks", "Critical Priority", "Total Block Time"].map((label) => (
              <div key={label} className="p-4 rounded-2xl bg-brand-surface border border-brand-border shadow-sm flex items-start gap-3.5">
                <Skeleton className="w-9 h-9 rounded-full shrink-0" />
                <div className="space-y-1.5">
                  <Skeleton className="h-3 w-24" />
                  <Skeleton className="h-8 w-14" />
                  <Skeleton className="h-2.5 w-28" />
                </div>
              </div>
            ))}
          </section>

          {/* Filter Bar */}
          <section className="p-4 sm:p-5 rounded-2xl bg-brand-surface border border-brand-border shadow-sm">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 items-center">
              <div className="lg:col-span-3"><Skeleton className="h-9 w-full rounded-xl" /></div>
              <div className="lg:col-span-3"><Skeleton className="h-9 w-full rounded-xl" /></div>
              <div className="lg:col-span-3"><Skeleton className="h-9 w-full rounded-xl" /></div>
              <div className="lg:col-span-3"><Skeleton className="h-9 w-full rounded-xl" /></div>
            </div>
          </section>

          {/* Table */}
          <section className="rounded-2xl bg-brand-surface border border-brand-border shadow-sm overflow-hidden pb-4">
            <div className="p-4 border-b border-brand-border flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Skeleton className="h-5 w-48" />
                  <Skeleton className="h-5 w-16 rounded-full" />
                </div>
                <Skeleton className="h-3 w-64" />
              </div>
              <div className="flex items-center gap-2">
                <Skeleton className="h-8 w-24 rounded-xl" />
                <Skeleton className="h-8 w-32 rounded-xl" />
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-center text-xs">
                <thead className="bg-brand-surface border-b border-brand-border">
                  <tr>
                    {["Criticality", "Task Code", "Target Asset", "Corridor", "Block Window", "Status", "Actions"].map((h) => (
                      <th key={h} className="py-3 px-4 text-center"><Skeleton className="h-3 w-16 mx-auto" /></th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-brand-border/60">
                  {Array.from({ length: 5 }).map((_, idx) => (
                    <tr key={idx}>
                      <td className="py-3.5 px-4"><Skeleton className="h-4 w-16 mx-auto" /></td>
                      <td className="py-3.5 px-4">
                        <div className="space-y-1 flex flex-col items-center">
                          <Skeleton className="h-4 w-20" />
                          <Skeleton className="h-3 w-16" />
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="space-y-1.5 flex flex-col items-center">
                          <Skeleton className="h-4 w-32" />
                          <Skeleton className="h-3 w-20" />
                        </div>
                      </td>
                      <td className="py-3.5 px-4"><Skeleton className="h-4 w-28 mx-auto" /></td>
                      <td className="py-3.5 px-4">
                        <div className="space-y-1 flex flex-col items-center">
                          <Skeleton className="h-4 w-24" />
                          <Skeleton className="h-3 w-16" />
                        </div>
                      </td>
                      <td className="py-3.5 px-4"><Skeleton className="h-5 w-20 rounded-md mx-auto" /></td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center justify-center gap-1.5">
                          <Skeleton className="w-7 h-7 rounded-lg" />
                          <Skeleton className="w-7 h-7 rounded-lg" />
                          <Skeleton className="w-7 h-7 rounded-lg" />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

        </main>
      </div>
    </div>
  );
}

export function MaintenanceTasksTableSkeleton() {
  const columns = [
    "Criticality",
    "Task Code",
    "Target Asset",
    "Corridor",
    "Block Window",
    "Status",
    "Actions",
  ];

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-center text-xs">
        <thead className="bg-brand-surface text-brand-muted font-semibold border-b border-brand-border text-xs">
          <tr>
            {columns.map((column) => (
              <th key={column} className="py-3 px-4 text-center font-semibold">
                {column}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-brand-border/60">
          {Array.from({ length: 5 }).map((_, idx) => (
            <tr key={idx} className="hover:bg-brand-tertiary/40 transition-colors">
              <td className="py-3.5 px-4 text-center">
                <Skeleton className="h-4 w-16 mx-auto" />
              </td>
              <td className="py-3.5 px-4 text-center">
                <div className="space-y-1 flex flex-col items-center">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-3 w-16" />
                </div>
              </td>
              <td className="py-3.5 px-4 text-center">
                <div className="space-y-1.5 flex flex-col items-center">
                  <Skeleton className="h-4 w-36" />
                  <Skeleton className="h-2.5 w-24" />
                </div>
              </td>
              <td className="py-3.5 px-4 text-center">
                <Skeleton className="h-4 w-28 mx-auto" />
              </td>
              <td className="py-3.5 px-4 text-center">
                <div className="space-y-1 flex flex-col items-center">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-3 w-16" />
                </div>
              </td>
              <td className="py-3.5 px-4 text-center">
                <Skeleton className="h-5 w-20 rounded-md mx-auto" />
              </td>
              <td className="py-3.5 px-4 text-center">
                <div className="flex items-center justify-center gap-1.5">
                  <Skeleton className="w-7 h-7 rounded-lg" />
                  <Skeleton className="w-7 h-7 rounded-lg" />
                  <Skeleton className="w-7 h-7 rounded-lg" />
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
