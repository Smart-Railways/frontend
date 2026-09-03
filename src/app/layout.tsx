import type { Metadata } from "next";
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
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Valley+Sans:ital,wght@0,300..800;1,300..800&display=swap" rel="stylesheet" />
        <link href="https://fonts.cdnfonts.com/css/valley-sans" rel="stylesheet" />
      </head>
      <body className="min-h-screen font-sans antialiased bg-brand-tertiary text-brand-secondary">
        <QueryProvider>{children}</QueryProvider>
      </body>
    </html>
  );
}
