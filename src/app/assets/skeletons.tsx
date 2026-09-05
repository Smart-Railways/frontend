"use client";

import React from "react";
import { Skeleton } from "@/components/ui/skeleton";

export function AssetsPageSkeleton() {
  return (
    <div className="min-h-screen bg-brand-tertiary text-brand-secondary flex flex-col font-sans">
      <div className="flex-1 flex pl-0 lg:pl-64 pt-14 lg:pt-0">
        <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-7 flex flex-col space-y-5 max-w-[1600px] mx-auto w-full">

          {/* Header */}
          <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-brand-border/80">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2.5">
                <Skeleton className="w-8 h-8 rounded-full" />
                <Skeleton className="h-7 w-72" />
              </div>
              <Skeleton className="h-3 w-96" />
            </div>
            <div className="flex items-center gap-3">
              <Skeleton className="h-8 w-32 rounded-xl" />
              <Skeleton className="h-8 w-28 rounded-xl" />
              <Skeleton className="h-8 w-36 rounded-xl" />
            </div>
          </header>

          {/* KPI Cards */}
          <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {["Total Assets", "High Risk Assets", "S&T Division", "Civil Engineering", "Traction / OHE"].map((label) => (
              <div key={label} className="p-4 rounded-2xl bg-brand-surface border border-brand-border shadow-sm flex items-start gap-3.5">
                <Skeleton className="w-9 h-9 rounded-full shrink-0" />
                <div className="space-y-1.5">
                  <Skeleton className="h-3 w-20" />
                  <Skeleton className="h-8 w-12" />
                  <Skeleton className="h-2.5 w-24" />
                </div>
              </div>
            ))}
          </section>

          {/* Filter Controls */}
          <section className="p-4 sm:p-5 rounded-2xl bg-brand-surface border border-brand-border shadow-sm space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
              <div className="md:col-span-4"><Skeleton className="h-9 w-full rounded-xl" /></div>
              <div className="md:col-span-4"><Skeleton className="h-9 w-full rounded-xl" /></div>
              <div className="md:col-span-4"><Skeleton className="h-9 w-full rounded-xl" /></div>
            </div>
            <div className="flex items-center gap-2 pt-3 border-t border-brand-border/60">
              <Skeleton className="h-3 w-16" />
              {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-6 w-20 rounded-lg" />)}
              <div className="ml-auto flex items-center gap-2">
                <Skeleton className="h-3 w-16" />
                <Skeleton className="h-7 w-28 rounded-xl" />
              </div>
            </div>
          </section>

          {/* Table Section */}
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
              <table className="w-full text-center text-xs">
                <thead className="bg-brand-surface border-b border-brand-border">
                  <tr>
                    {["ID", "Asset Title", "Category", "Section", "Risk Level", "Setup Date", "Actions"].map((h) => (
                      <th key={h} className="py-3 px-4 text-center"><Skeleton className="h-3 w-16 mx-auto" /></th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-brand-border/60">
                  {Array.from({ length: 6 }).map((_, idx) => (
                    <tr key={idx}>
                      <td className="py-3.5 px-4"><Skeleton className="h-4 w-8 mx-auto" /></td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center justify-center gap-2.5">
                          <Skeleton className="w-8 h-8 rounded-lg shrink-0" />
                          <div className="space-y-1.5">
                            <Skeleton className="h-4 w-36" />
                            <Skeleton className="h-2.5 w-16" />
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4"><Skeleton className="h-5 w-20 mx-auto rounded-md" /></td>
                      <td className="py-3.5 px-4"><Skeleton className="h-4 w-28 mx-auto" /></td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center justify-center gap-2">
                          <Skeleton className="h-5 w-14 rounded-md" />
                          <Skeleton className="h-3 w-12" />
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center justify-center gap-1.5">
                          <Skeleton className="w-3.5 h-3.5 rounded-full" />
                          <Skeleton className="h-3.5 w-20" />
                        </div>
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
          </section>

        </main>
      </div>
    </div>
  );
}
