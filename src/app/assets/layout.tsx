import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Railway Infrastructure & Asset Registry",
  description:
    "Comprehensive asset inventory, track circuits, signal and telecom monitoring, risk level scoring, and lifecycle commission tracking for Indian Railway divisions.",
  keywords: [
    "railway asset management",
    "track circuit monitoring",
    "signal and telecom SNT asset",
    "railway risk level assessment",
    "railway infrastructure inventory",
  ],
  alternates: {
    canonical: "/assets",
  },
  openGraph: {
    title: "Railway Infrastructure & Asset Registry | Sanket",
    description:
      "Railway corridor equipment registry, risk indices, and division maintenance logs.",
    url: "/assets",
  },
  twitter: {
    title: "Railway Infrastructure & Asset Registry | Sanket",
    description:
      "Railway corridor equipment registry, risk indices, and division maintenance logs.",
  },
};

export default function AssetsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
