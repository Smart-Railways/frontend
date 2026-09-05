"use client";

import React from "react";
import { Skeleton } from "@/components/ui/skeleton";

export function TrainsPageSkeleton() {
  return (
    <div className="min-h-screen bg-brand-tertiary text-brand-secondary flex flex-col font-sans">
      {/* Sidebar placeholder */}
      <div className="flex-1 flex pl-0 lg:pl-64 pt-14 lg:pt-0">
        <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-7 flex flex-col space-y-6 max-w-[1680px] mx-auto w-full">

          {/* ---- Header ---- */}
          <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-brand-border/80">
            <div className="flex items-center gap-2.5">
              <Skeleton className="w-8 h-8 rounded-xl" />
              <Skeleton className="h-7 w-56" />
            </div>
            <div className="flex items-center gap-2.5">
              <Skeleton className="w-8 h-8 rounded-xl" />
              <Skeleton className="h-8 w-36 rounded-xl" />
            </div>
          </header>

          {/* ---- View-mode tab bar skeleton ---- */}
          <div className="flex items-center gap-2">
            <Skeleton className="h-8 w-24 rounded-xl" />
            <Skeleton className="h-8 w-32 rounded-xl" />
            <Skeleton className="h-8 w-24 rounded-xl" />
          </div>

          {/* ---- Section 1: Tracked Trains Operations ---- */}
          <section className="rounded-2xl bg-brand-surface border border-brand-border shadow-sm overflow-hidden space-y-4 p-4 sm:p-5">
            {/* Section header */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-3 border-b border-brand-border/80">
              <Skeleton className="h-6 w-52" />
              <Skeleton className="h-5 w-72 rounded-lg" />
            </div>

            {/* Controls card */}
            <div className="p-4 rounded-xl bg-brand-tertiary/70 border border-brand-border/70 space-y-3.5">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
                <div className="md:col-span-4 space-y-1">
                  <Skeleton className="h-3 w-24" />
                  <Skeleton className="h-8 w-full rounded-xl" />
                </div>
                <div className="md:col-span-6 space-y-1">
                  <Skeleton className="h-3 w-32" />
                  <Skeleton className="h-8 w-full rounded-xl" />
                </div>
                <div className="md:col-span-2">
                  <Skeleton className="h-8 w-full rounded-xl" />
                </div>
              </div>
              {/* Status bar */}
              <div className="flex items-center justify-between gap-3 pt-3 border-t border-brand-border/60">
                <div className="flex items-center gap-2">
                  <Skeleton className="h-3 w-20" />
                  <Skeleton className="h-3 w-28" />
                  <Skeleton className="h-5 w-24 rounded-lg" />
                </div>
                <Skeleton className="h-5 w-28 rounded-full" />
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto border border-brand-border/80 rounded-xl">
              <table className="w-full text-left text-xs">
                <thead className="bg-brand-surface border-b border-brand-border">
                  <tr>
                    {["Train No. & Name","Type & Priority","Section","Window","Actuals","Delay Matrix (IST)","Actions"].map((h) => (
                      <th key={h} className="py-3 px-4"><Skeleton className="h-3 w-20" /></th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-brand-border/60">
                  {Array.from({ length: 6 }).map((_, idx) => (
                    <tr key={idx} className="hover:bg-brand-tertiary/40">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2.5">
                          <Skeleton className="w-1.5 h-8 rounded-full shrink-0" />
                          <div className="space-y-1.5">
                            <Skeleton className="h-4 w-16" />
                            <Skeleton className="h-3 w-28" />
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4"><Skeleton className="h-4 w-12" /></td>
                      <td className="py-3 px-4"><Skeleton className="h-4 w-28" /></td>
                      <td className="py-3 px-4"><Skeleton className="h-4 w-24" /></td>
                      <td className="py-3 px-4"><Skeleton className="h-4 w-24" /></td>
                      <td className="py-3 px-4"><Skeleton className="h-6 w-20 rounded-full" /></td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end">
                          <Skeleton className="w-7 h-7 rounded-lg" />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination stub */}
            <div className="flex items-center justify-between pt-2">
              <Skeleton className="h-5 w-44" />
              <div className="flex items-center gap-1">
                <Skeleton className="w-7 h-7 rounded-lg" />
                <Skeleton className="w-7 h-7 rounded-lg" />
                <Skeleton className="w-7 h-7 rounded-lg" />
              </div>
            </div>
          </section>

          {/* ---- Section 2: Master Timetable Schedules ---- */}
          <section className="rounded-2xl bg-brand-surface border border-brand-border shadow-sm overflow-hidden space-y-4 p-4 sm:p-5">
            {/* Section header */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-3 border-b border-brand-border/80">
              <div className="space-y-1.5">
                <Skeleton className="h-6 w-60" />
                <Skeleton className="h-3 w-72" />
              </div>
            </div>

            {/* Controls card */}
            <div className="p-4 rounded-xl bg-brand-tertiary/70 border border-brand-border/70 space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
                <div className="md:col-span-6 space-y-1">
                  <Skeleton className="h-3 w-40" />
                  <Skeleton className="h-8 w-full rounded-xl" />
                </div>
                <div className="md:col-span-6 space-y-1">
                  <Skeleton className="h-3 w-36" />
                  <Skeleton className="h-8 w-full rounded-xl" />
                </div>
              </div>
              {/* Filter chips */}
              <div className="flex items-center gap-1.5 pt-2 border-t border-brand-border/60">
                <Skeleton className="h-8 w-40 rounded-xl" />
                {["All","Rajdhani","VB","Shatabdi","Express"].map((l) => (
                  <Skeleton key={l} className="h-6 w-16 rounded-lg" />
                ))}
              </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {["Total Schedules","Runs Today","High Priority"].map((label) => (
                <div key={label} className="p-3.5 rounded-xl bg-brand-surface border border-brand-border shadow-2xs flex items-center gap-3">
                  <Skeleton className="w-8 h-8 rounded-lg shrink-0" />
                  <div className="space-y-1.5">
                    <Skeleton className="h-3 w-24" />
                    <Skeleton className="h-7 w-12" />
                  </div>
                </div>
              ))}
            </div>

            {/* Table */}
            <div className="overflow-x-auto border border-brand-border/80 rounded-xl">
              <table className="w-full text-left text-xs">
                <thead className="bg-brand-surface border-b border-brand-border">
                  <tr>
                    {["Train No. & Name","Priority & Type","Section / Corridor","Scheduled Entry (IST)","Scheduled Exit (IST)","Transit Duration","Actions"].map((h) => (
                      <th key={h} className="py-3 px-4"><Skeleton className="h-3 w-20" /></th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-brand-border/60">
                  {Array.from({ length: 6 }).map((_, idx) => (
                    <tr key={idx}>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2.5">
                          <Skeleton className="w-1.5 h-8 rounded-full shrink-0" />
                          <div className="space-y-1.5">
                            <Skeleton className="h-4 w-16" />
                            <Skeleton className="h-3 w-28" />
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4"><Skeleton className="h-4 w-12" /></td>
                      <td className="py-3 px-4"><Skeleton className="h-4 w-28" /></td>
                      <td className="py-3 px-4"><Skeleton className="h-4 w-14" /></td>
                      <td className="py-3 px-4"><Skeleton className="h-4 w-14" /></td>
                      <td className="py-3 px-4"><Skeleton className="h-4 w-14" /></td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end">
                          <Skeleton className="w-7 h-7 rounded-lg" />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination stub */}
            <div className="flex items-center justify-between pt-2">
              <Skeleton className="h-5 w-48" />
              <div className="flex items-center gap-1">
                <Skeleton className="w-7 h-7 rounded-lg" />
                <Skeleton className="w-7 h-7 rounded-lg" />
                <Skeleton className="w-7 h-7 rounded-lg" />
              </div>
            </div>
          </section>

        </main>
      </div>
    </div>
  );
}

export function TrackedTrainsTableSkeleton({ count = 5 }: { count?: number }) {
  return (
    <>
      {Array.from({ length: count }).map((_, idx) => (
        <tr key={idx} className="hover:bg-brand-tertiary/40 transition-colors">
          <td className="py-3 px-4">
            <div className="flex items-center gap-2.5">
              <Skeleton className="w-1.5 h-8 rounded-full shrink-0" />
              <div className="space-y-1.5">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-3 w-28" />
              </div>
            </div>
          </td>
          <td className="py-3 px-4">
            <div className="flex items-center gap-2">
              <Skeleton className="h-5 w-16 rounded-md" />
              <Skeleton className="h-4 w-8" />
            </div>
          </td>
          <td className="py-3 px-4">
            <Skeleton className="h-4 w-28" />
          </td>
          <td className="py-3 px-4 font-mono">
            <Skeleton className="h-4 w-24" />
          </td>
          <td className="py-3 px-4 font-mono">
            <Skeleton className="h-4 w-24" />
          </td>
          <td className="py-3 px-4 text-center">
            <Skeleton className="h-6 w-24 rounded-full mx-auto" />
          </td>
          <td className="py-3 px-4 text-right">
            <div className="flex items-center justify-end gap-2">
              <Skeleton className="w-2.5 h-6 rounded-xs" />
              <Skeleton className="w-7 h-7 rounded-lg" />
            </div>
          </td>
        </tr>
      ))}
    </>
  );
}

export function MasterSchedulesTableSkeleton({ count = 5 }: { count?: number }) {
  return (
    <>
      {Array.from({ length: count }).map((_, idx) => (
        <tr key={idx} className="hover:bg-brand-tertiary/40 transition-colors">
          <td className="py-3 px-4">
            <div className="flex items-center gap-2.5">
              <Skeleton className="w-1.5 h-8 rounded-full shrink-0" />
              <div className="space-y-1.5">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-3 w-28" />
              </div>
            </div>
          </td>
          <td className="py-3 px-4">
            <div className="flex items-center gap-2">
              <Skeleton className="h-5 w-16 rounded-md" />
              <Skeleton className="h-4 w-8" />
            </div>
          </td>
          <td className="py-3 px-4">
            <Skeleton className="h-4 w-28" />
          </td>
          <td className="py-3 px-4 font-mono text-center">
            <Skeleton className="h-4 w-14 mx-auto" />
          </td>
          <td className="py-3 px-4 font-mono text-center">
            <Skeleton className="h-4 w-14 mx-auto" />
          </td>
          <td className="py-3 px-4 font-mono text-center">
            <Skeleton className="h-4 w-14 mx-auto" />
          </td>
          <td className="py-3 px-4 text-right">
            <div className="flex items-center justify-end gap-2">
              <Skeleton className="w-7 h-7 rounded-lg" />
            </div>
          </td>
        </tr>
      ))}
    </>
  );
}
