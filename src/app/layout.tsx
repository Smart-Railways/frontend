import type { Metadata, Viewport } from "next";
import QueryProvider from "@/providers/query-provider";
import "./globals.css";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://sanket-railways.in";

export const viewport: Viewport = {
  themeColor: "#2563EB",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Sanket | Intelligent Railway Traffic & Block Optimization",
    template: "%s | Sanket",
  },
  description:
    "Next-generation intelligent Indian Railways corridor optimization, live train tracking, predictive maintenance scheduling, and block window conflict resolution platform.",
  applicationName: "Sanket",
  category: "Transportation",
  keywords: [
    "Indian Railways",
    "railway corridor optimization",
    "live train tracking",
    "block window scheduling",
    "predictive railway maintenance",
    "train timetable matrix",
    "railway delay optimization",
    "railway asset health index",
    "Smart India Hackathon Railways",
    "Sanket railway dashboard",
  ],
  authors: [{ name: "Sanket Development Team" }],
  creator: "Indian Railways Operations & Corridor Intelligence",
  publisher: "Sanket",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: siteUrl,
    title: "Sanket | Intelligent Railway Traffic & Block Optimization",
    description:
      "Real-time train dispatch tracking, dynamic corridor slot optimization, and automated railway maintenance block allocation.",
    siteName: "Sanket",
  },
  twitter: {
    card: "summary_large_image",
    title: "Sanket | Intelligent Railway Traffic & Block Optimization",
    description:
      "Real-time train dispatch tracking, dynamic corridor slot optimization, and automated railway maintenance block allocation.",
    creator: "@sanket_railways",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/icon.png", sizes: "512x512", type: "image/png" },
    ],
    shortcut: "/favicon.ico",
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "Sanket",
  alternateName: "संकेत - Intelligent Railway Operations",
  applicationCategory: "TransportationApplication",
  operatingSystem: "All",
  url: siteUrl,
  description:
    "Next-generation intelligent Indian Railways corridor optimization, real-time train tracking, predictive maintenance scheduling, and block window conflict resolution platform.",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "INR",
  },
  featureList: [
    "Real-time Indian Railways Train Operations Tracking",
    "Master Timetable & Running Days Synchronization",
    "Corridor Section Maintenance Block Window Scheduling",
    "Automated Feasible Maintenance Window Discovery",
    "Railway Asset Health & Risk Assessment Registry",
  ],
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
        <link
          href="https://fonts.googleapis.com/css2?family=Valley+Sans:ital,wght@0,300..800;1,300..800&display=swap"
          rel="stylesheet"
        />
        <link href="https://fonts.cdnfonts.com/css/valley-sans" rel="stylesheet" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="192x192" href="/icon-192.png" />
        <link rel="icon" type="image/png" sizes="512x512" href="/icon-512.png" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="min-h-screen font-sans antialiased bg-brand-tertiary text-brand-secondary">
        <QueryProvider>{children}</QueryProvider>
      </body>
    </html>
  );
}
