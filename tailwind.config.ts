import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./data/**/*.{ts,tsx}",
    "./hooks/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
    "./styles/**/*.css",
    "./types/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        obsidian: "#050504",
        graphite: "#16130f",
        champagne: "#c99732",
        porcelain: "#100e0b",
        pearl: "#090807",
        velvet: "#d8ae52",
        smoke: "#aaa094",
        gold: "#c99732",
        "gold-light": "#d8ae52",
        ivory: "#f4efe4",
        "warm-gray": "#aaa094",
        "black-warm": "#0c0a08",
      },
      fontFamily: {
        serif: ["var(--font-serif)", "Georgia", "serif"],
        sans: ["var(--font-sans)", "Segoe UI", "sans-serif"],
      },
      boxShadow: {
        premium: "0 24px 80px rgba(0, 0, 0, 0.34)",
      },
    },
  },
  plugins: [],
};

export default config;
