import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Live Train Operations & Master Timetable Schedules",
  description:
    "Real-time Indian Railways tracking dashboard, active corridor speed metrics, delay propagation matrix, and master train schedules across all sections.",
  keywords: [
    "Indian Railways live train tracking",
    "railway delay matrix",
    "train timetable schedule",
    "Vande Bharat live status",
    "Rajdhani corridor timetable",
    "railway section tracking",
  ],
  alternates: {
    canonical: "/trains",
  },
  openGraph: {
    title: "Live Train Operations & Master Timetable | Sanket",
    description:
      "Real-time train tracking, corridor adherence, delay matrix, and master schedule navigator.",
    url: "/trains",
  },
  twitter: {
    title: "Live Train Operations & Master Timetable | Sanket",
    description:
      "Real-time train tracking, corridor adherence, delay matrix, and master schedule navigator.",
  },
};

export default function TrainsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
