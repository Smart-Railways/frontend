import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Maintenance Tasks & Corridor Block Scheduling",
  description:
    "Predictive railway track and overhead equipment (OHE) maintenance scheduler, conflict detection, feasible window optimization, and block dispatch automation.",
  keywords: [
    "railway maintenance planning",
    "track block scheduling",
    "corridor block window",
    "OHE traction maintenance",
    "railway conflict resolution",
    "preventive railway asset maintenance",
  ],
  alternates: {
    canonical: "/maintenance",
  },
  openGraph: {
    title: "Maintenance Tasks & Corridor Block Scheduling | Sanket",
    description:
      "Automated railway maintenance scheduling, block conflict detection, and corridor capacity planning.",
    url: "/maintenance",
  },
  twitter: {
    title: "Maintenance Tasks & Corridor Block Scheduling | Sanket",
    description:
      "Automated railway maintenance scheduling, block conflict detection, and corridor capacity planning.",
  },
};

export default function MaintenanceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
