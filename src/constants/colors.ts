/**
 * AutoBlockPlanner AI Dashboard - Color Palette Design System
 * 
 * Primary: AI Signal Green (Operational, Optimized, Safe, Live)
 * Secondary: Railway Blue (Indian Railways, Mission Control, Cockpit Slate)
 * Tertiary: Maintenance Amber (Planned Maintenance, Congestion, Warnings)
 * Accent: Critical Signal Red (Emergency Alerts, Collisions, Track Conflicts)
 */

export const PALETTE = {
  // Primary — AI Signal Green
  signalGreen: {
    DEFAULT: "#10B981",
    glow: "#00E676",
    light: "#34D399",
    dark: "#059669",
    bgMuted: "rgba(16, 185, 129, 0.12)",
    border: "rgba(16, 185, 129, 0.3)",
  },

  // Secondary — Railway Blue
  railwayBlue: {
    DEFAULT: "#2563EB",
    brand: "#1D4ED8",
    sky: "#38BDF8",
    cyan: "#06B6D4",
    // Mission control dark surfaces
    cockpitBg: "#080C15",
    cardBg: "#0D1527",
    cardHover: "#121D36",
    sidebarBg: "#070B13",
    border: "#172642",
    borderGlow: "rgba(37, 99, 235, 0.35)",
  },

  // Tertiary — Maintenance Amber
  maintenanceAmber: {
    DEFAULT: "#F59E0B",
    glow: "#FFB703",
    light: "#FBBF24",
    dark: "#D97706",
    bgMuted: "rgba(245, 158, 11, 0.12)",
    border: "rgba(245, 158, 11, 0.35)",
  },

  // Accent — Critical Signal Red
  criticalRed: {
    DEFAULT: "#EF4444",
    glow: "#FF334B",
    light: "#F87171",
    dark: "#DC2626",
    bgMuted: "rgba(239, 68, 68, 0.14)",
    border: "rgba(239, 68, 68, 0.4)",
  },

  // Dark Dashboard Neutrals
  neutral: {
    textPrimary: "#F8FAFC",
    textSecondary: "#94A3B8",
    textMuted: "#64748B",
    divider: "#1E293B",
  },
} as const;
