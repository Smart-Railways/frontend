import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Valley Sans", "Inter", "sans-serif"],
        heading: ["Valley Sans", "Inter", "sans-serif"],
      },
      colors: {
        "card-primary": "#072ac8",
        "brand-primary": "#072ac8",
        "brand-card": "#0d1527",
        "brand-cockpit": "#080c15",
        "brand-sidebar": "#070b13",
        "brand-border": "#172642",
        "brand-accent": "#16284a",
        //here
        brand: {
          DEFAULT: "#072ac8",
          primary: "#072ac8",
          card: "#0d1527",
          cardHover: "#121d36",
          cockpit: "#072ac8",
          sidebar: "#070b13",
          border: "#172642",
          borderHover: "#233963",
          accent: "#16284a",
          signal: "#10b981",
          amber: "#f59e0b",
          critical: "#ef4444",
        },
        card: {
          primary: "#072ac8",
        },
        // --- AutoBlockPlanner AI Color Palette ---
        // Primary — AI Signal Green (Operational, Optimized, Safe, Live)
        signal: {
          green: {
            50: "#ecfdf5",
            100: "#d1fae5",
            200: "#a7f3d0",
            300: "#6ee7b7",
            400: "#34d399",
            500: "#10b981", // Base Signal Green
            600: "#059669",
            700: "#047857",
            800: "#065f46",
            900: "#064e3b",
            950: "#022c22",
            glow: "#00e676", // Neon AI Glow
          },
        },
        // Secondary — Railway Blue (Northern Zone, Mission Control, Deep Navy & Royal Blue)
        railway: {
          50: "#eff6ff",
          100: "#dbeafe",
          200: "#bfdbfe",
          300: "#93c5fd",
          400: "#60a5fa",
          500: "#3b82f6", // Bright Blue
          600: "#2563eb", // Indian Railways Blue
          700: "#1d4ed8",
          800: "#1e40af",
          900: "#1e3a8a",
          950: "#0a192f", // Deep Navy
          // Dashboard Dark Background & Surface Gradients
          dark: {
            bg: "#080c15",       // Deepest cockpit background
            card: "#0d1527",     // Card & container surface
            cardHover: "#121d36",// Card hover surface
            sidebar: "#070b13",  // Sidebar darker panel
            border: "#172642",   // Subtle blue-tinted border
            borderHover: "#233963",
            accent: "#16284a",   // Active navigation background
          },
        },
        // Tertiary — Maintenance Amber (Planned Maintenance, Medium Disruption, Attention)
        maintenance: {
          amber: {
            50: "#fffbeb",
            100: "#fef3c7",
            200: "#fde68a",
            300: "#fcd34d",
            400: "#fbbf24",
            500: "#f59e0b", // Base Amber
            600: "#d97706",
            700: "#b45309",
            800: "#92400e",
            900: "#78350f",
            950: "#451a03",
            glow: "#ffb703",
          },
        },
        // Accent — Critical Signal Red (High Impact, Conflicts, Emergency Alerts)
        critical: {
          red: {
            50: "#fef2f2",
            100: "#fee2e2",
            200: "#fecaca",
            300: "#fca5a5",
            400: "#f87171",
            500: "#ef4444", // Base Critical Red
            600: "#dc2626",
            700: "#b91c1c",
            800: "#991b1b",
            900: "#7f1d1d",
            950: "#450a0a",
            // glow: "#ff334b",
          },
        },
      },
      boxShadow: {
        "signal-glow": "0 0 15px -3px rgba(16, 185, 129, 0.4)",
        "amber-glow": "0 0 15px -3px rgba(245, 158, 11, 0.4)",
        "critical-glow": "0 0 15px -3px rgba(239, 68, 68, 0.4)",
        "blue-glow": "0 0 20px -3px rgba(37, 99, 235, 0.35)",
        "card-subtle": "0 4px 20px -2px rgba(0, 0, 0, 0.5)",
      },
      animation: {
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "signal-pulse": "signalPulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
      },
      keyframes: {
        signalPulse: {
          "0%, 100%": { opacity: "1", transform: "scale(1)" },
          "50%": { opacity: "0.4", transform: "scale(1.08)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
