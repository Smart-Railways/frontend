"use client";

import { VerticalNavbar } from "@/components/navigation/vertical-navbar";

export default function MaintenanceBatchesLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-brand-tertiary">
      <VerticalNavbar />
      <div className="pt-14 lg:pl-64 lg:pt-0">{children}</div>
    </div>
  );
}
