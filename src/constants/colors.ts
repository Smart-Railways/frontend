/**
 * AutoBlockPlanner AI Dashboard - Color Tokens
 * 
 * Note: Colors are fully integrated into tailwind.config.ts & globals.css!
 * Use Tailwind classes directly:
 *   - bg-brand-primary, bg-brand-card, bg-brand-cockpit, bg-brand-sidebar
 *   - border-brand-border, bg-brand-accent, bg-brand-signal, etc.
 */

export const PALETTE = {
  brandPrimary: "#072ac8",
  brandCard: "#0d1527",
  brandCockpit: "#080c15",
  brandSidebar: "#070b13",
  brandBorder: "#172642",
  brandAccent: "#16284a",
  signalGreen: {
    DEFAULT: "#10B981",
    glow: "#00E676",
    light: "#34D399",
    dark: "#059669",
  },
  railwayBlue: {
    DEFAULT: "#2563EB",
    brand: "#1D4ED8",
    cardPrimary: "#072ac8",
  },
  maintenanceAmber: {
    DEFAULT: "#F59E0B",
    glow: "#FFB703",
  },
  criticalRed: {
    DEFAULT: "#EF4444",
    glow: "#FF334B",
  },
} as const;

export default PALETTE;
