import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        // Mappa 1:1 le CSS variables del prototipo HTML
        "bg-dark": "#0D0F14",
        "bg-panel": "#151923",
        "bg-panel-2": "#1F2330",
        "bg-light": "#F7F5F0",
        "bg-light-2": "#FFFFFF",
        border: {
          DEFAULT: "#2A2F3D",
          light: "#E3E5EC",
        },
        text: {
          DEFAULT: "#F2F3F7",
          dim: "#8A91A3",
          dark: "#1F2330",
          "dark-dim": "#5A6070",
        },
        brand: {
          red: "#C8102E",
          "red-hot": "#E11D3C",
          blue: "#1E3A8A",
          "blue-hi": "#3B5FD9",
        },
        warn: "#F59E0B",
        ok: "#10B981",
        danger: "#EF4444",
        green: {
          DEFAULT: "#22C55E",
          dark: "#16A34A",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        cond: ["'Barlow Condensed'", "sans-serif"],
        mono: ["'JetBrains Mono'", "monospace"],
      },
      letterSpacing: {
        cond: "0.01em",
        wider2: "0.08em",
        widest2: "0.14em",
      },
      borderRadius: {
        none: "0",
        sm: "2px",
        DEFAULT: "4px",
      },
      boxShadow: {
        card: "0 1px 0 0 rgba(0,0,0,0.04)",
        live: "0 0 0 0 rgba(225,29,60,0.7)",
      },
      keyframes: {
        pulse: {
          "0%": { boxShadow: "0 0 0 0 rgba(225,29,60,0.7)" },
          "70%": { boxShadow: "0 0 0 10px rgba(225,29,60,0)" },
          "100%": { boxShadow: "0 0 0 0 rgba(225,29,60,0)" },
        },
      },
      animation: {
        "pulse-live": "pulse 1.5s infinite",
      },
    },
  },
  plugins: [],
};

export default config;
