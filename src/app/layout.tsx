import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import QueryProvider from "@/providers/query-provider";
import "./globals.css";

export const metadata: Metadata = {
  title: "AutoBlockPlanner AI — Indian Railways",
  description: "Intelligent Railway Block Scheduling & Corridor Optimization Dashboard",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-[#080c15] text-slate-100 antialiased selection:bg-emerald-500/30 selection:text-emerald-200">
        <QueryProvider>{children}</QueryProvider>
      </body>
    </html>
  );
}
