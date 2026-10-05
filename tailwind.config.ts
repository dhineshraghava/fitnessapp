import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        base: {
          950: "#070B14",
          900: "#0B1120",
          850: "#101828",
          800: "#151E32",
          700: "#1E2A45",
        },
        neon: {
          green: "#22FF88",
          lime: "#A3FF12",
          cyan: "#22D3EE",
          violet: "#8B5CF6",
        },
      },
      fontFamily: {
        display: ["var(--font-display)", "system-ui", "sans-serif"],
      },
      boxShadow: {
        glow: "0 0 24px rgba(34,255,136,0.25)",
        card: "0 8px 32px rgba(0,0,0,0.45)",
      },
      borderRadius: {
        "2xl": "1rem",
        "3xl": "1.5rem",
      },
    },
  },
  plugins: [],
};

export default config;
