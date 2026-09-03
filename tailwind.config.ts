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
        sans: ["'Valley Sans'", "Inter", "-apple-system", "BlinkMacSystemFont", "'Segoe UI'", "Roboto", "sans-serif"],
        heading: ["'Valley Sans'", "Inter", "-apple-system", "sans-serif"],
      },
      colors: {
        // --- Core Brand Palette ---
        brand: {
          DEFAULT: "#2563EB",
          primary: "#2563EB",     // Royal Blue: Main actions, active states, route, links
          secondary: "#171A1F",   // Charcoal: Sidebar, headings, dark UI elements
          tertiary: "#F8F5EE",    // Cream: Main background
          surface: "#FFFDF9",     // Warm White: Cards, panels, inputs
          border: "#E7E2D8",      // Soft Beige: Borders/dividers
          muted: "#64748B",       // Slate Gray: Secondary text
          blueLight: "#DBEAFE",   // Pale Blue: Selected/hover backgrounds
        },
        // Direct hyphenated utility aliases
        "brand-primary": "#2563EB",
        "brand-secondary": "#171A1F",
        "brand-tertiary": "#F8F5EE",
        "brand-surface": "#FFFDF9",
        "brand-border": "#E7E2D8",
        "brand-muted": "#64748B",
        "brand-blue-light": "#DBEAFE",
        "brand-pale-blue": "#DBEAFE",

        // Semantic named color tokens
        royalBlue: "#2563EB",
        charcoal: "#171A1F",
        cream: "#F8F5EE",
        warmWhite: "#FFFDF9",
        softBeige: "#E7E2D8",
        slateGray: "#64748B",
        paleBlue: "#DBEAFE",
      },
    },
  },
  plugins: [],
};

export default config;
