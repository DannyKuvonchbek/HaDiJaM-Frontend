import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./lib/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        obsidian: "#0b0b0b",
        canvas: "#131313",
        surface: "#1c1b1b",
        gold: "#d4af37",
        champagne: "#e5c158",
        "silk-gold": "#f3e5ab",
        muted: "#bdb8af",
      },
      fontFamily: {
        serif: ["var(--font-playfair)", "Georgia", "serif"],
        sans: ["var(--font-jakarta)", "Arial", "sans-serif"],
      },
      boxShadow: {
        gold: "0 0 24px rgba(212, 175, 55, .14)",
        card: "0 18px 55px rgba(0, 0, 0, .35)",
      },
    },
  },
  plugins: [],
};

export default config;
