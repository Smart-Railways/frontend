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
            {["Total Tasks", "Pending Execution", "Scheduled Blocks", "Critical Priority", "Total Block Time"].map((label) => (
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
          <section className="p-4 sm:p-5 rounded-2xl bg-brand-surface border border-brand-border shadow-sm space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 items-center">
              <div className="lg:col-span-4"><Skeleton className="h-9 w-full rounded-xl" /></div>
              <div className="lg:col-span-3"><Skeleton className="h-9 w-full rounded-xl" /></div>
              <div className="lg:col-span-2"><Skeleton className="h-9 w-full rounded-xl" /></div>
              <div className="lg:col-span-2"><Skeleton className="h-9 w-full rounded-xl" /></div>
              <div className="lg:col-span-1 flex justify-end gap-1.5">
                <Skeleton className="w-9 h-9 rounded-xl" />
                <Skeleton className="w-9 h-9 rounded-xl" />
              </div>
            </div>
            <div className="flex items-center gap-2 pt-3 border-t border-brand-border/60">
              <Skeleton className="h-3 w-16" />
              {[1, 2, 3, 4, 5].map((i) => <Skeleton key={i} className="h-6 w-20 rounded-lg" />)}
            </div>
          </section>

          {/* Table */}
          <section className="rounded-2xl bg-brand-surface border border-brand-border shadow-sm overflow-hidden">
            <div className="p-4 border-b border-brand-border flex items-center justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Skeleton className="h-5 w-48" />
                  <Skeleton className="h-5 w-16 rounded-full" />
                </div>
                <Skeleton className="h-3 w-64" />
              </div>
              <Skeleton className="h-5 w-36 rounded" />
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-brand-surface border-b border-brand-border">
                  <tr>
                    {["ID", "Task Code", "Asset", "Corridor", "Urgency", "Status", "Risk", "Deadline", "Duration", "Actions"].map((h) => (
                      <th key={h} className="py-3 px-3"><Skeleton className="h-3 w-14" /></th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-brand-border/60">
                  {Array.from({ length: 7 }).map((_, idx) => (
                    <tr key={idx}>
                      <td className="py-3 px-3"><Skeleton className="h-4 w-6" /></td>
                      <td className="py-3 px-3"><Skeleton className="h-5 w-20 rounded-md" /></td>
                      <td className="py-3 px-3">
                        <div className="space-y-1">
                          <Skeleton className="h-4 w-32" />
                          <Skeleton className="h-2.5 w-16" />
                        </div>
                      </td>
                      <td className="py-3 px-3"><Skeleton className="h-4 w-28" /></td>
                      <td className="py-3 px-3"><Skeleton className="h-5 w-20 rounded-full" /></td>
                      <td className="py-3 px-3"><Skeleton className="h-5 w-24 rounded-full" /></td>
                      <td className="py-3 px-3"><Skeleton className="h-4 w-10" /></td>
                      <td className="py-3 px-3"><Skeleton className="h-4 w-20" /></td>
                      <td className="py-3 px-3"><Skeleton className="h-4 w-12" /></td>
                      <td className="py-3 px-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Skeleton className="w-7 h-7 rounded-lg" />
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
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-center text-xs">
        <thead className="bg-brand-surface text-brand-muted font-semibold border-b border-brand-border text-xs">
          <tr>
            <th className="py-3 px-4 text-center font-semibold">Task Code</th>
            <th className="py-3 px-4 text-center font-semibold">Target Asset</th>
            <th className="py-3 px-4 text-center font-semibold">Corridor / Section</th>
            <th className="py-3 px-4 text-center font-semibold">Urgency</th>
            <th className="py-3 px-4 text-center font-semibold">Block Window</th>
            <th className="py-3 px-4 text-center font-semibold">Duration</th>
            <th className="py-3 px-4 text-center font-semibold">Deadline</th>
            <th className="py-3 px-4 text-center font-semibold">Status</th>
            <th className="py-3 px-4 text-center font-semibold">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-brand-border/60">
          {Array.from({ length: 5 }).map((_, idx) => (
            <tr key={idx} className="hover:bg-brand-tertiary/40 transition-colors">
              <td className="py-3.5 px-4 text-center font-mono font-semibold">
                <Skeleton className="h-4 w-20 mx-auto" />
              </td>
              <td className="py-3.5 px-4 text-center">
                <div className="space-y-1.5 flex flex-col items-center">
                  <Skeleton className="h-4 w-36" />
                  <Skeleton className="h-2.5 w-24" />
                </div>
              </td>
              <td className="py-3.5 px-4 text-center">
                <div className="flex items-center justify-center gap-1.5">
                  <Skeleton className="w-3.5 h-3.5 rounded shrink-0" />
                  <Skeleton className="h-4 w-28" />
                </div>
              </td>
              <td className="py-3.5 px-4 text-center">
                <Skeleton className="h-5 w-20 rounded-md mx-auto" />
              </td>
              <td className="py-3.5 px-4 text-center font-mono">
                <Skeleton className="h-4 w-12 mx-auto" />
              </td>
              <td className="py-3.5 px-4 text-center font-mono">
                <Skeleton className="h-4 w-16 mx-auto" />
              </td>
              <td className="py-3.5 px-4 text-center font-mono">
                <div className="flex items-center justify-center gap-1.5">
                  <Skeleton className="w-3.5 h-3.5 rounded-full shrink-0" />
                  <Skeleton className="h-3.5 w-20 rounded" />
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
