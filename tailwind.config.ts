import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        // Variables CSS (ver globals.css): permiten el toggle de tema
        // claro/oscuro sin tocar las ~100+ clases `bg-base-*`/`text-base-*`
        // ya usadas en todo el sitio. <alpha-value> preserva modificadores
        // de opacidad como `bg-base-dark/95`.
        base: {
          black: "rgb(var(--color-base-black) / <alpha-value>)",
          dark: "rgb(var(--color-base-dark) / <alpha-value>)",
          surface: "rgb(var(--color-base-surface) / <alpha-value>)",
          border: "rgb(var(--color-base-border) / <alpha-value>)",
          muted: "rgb(var(--color-base-muted) / <alpha-value>)",
          white: "rgb(var(--color-base-white) / <alpha-value>)",
        },
        brand: {
          orange: "#FF6A00",
          "orange-dark": "#E05A00",
          "orange-light": "#FF8A33",
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
      },
      borderRadius: {
        xl: "0.875rem",
        "2xl": "1.25rem",
      },
      boxShadow: {
        card: "0 4px 24px -8px rgba(0,0,0,0.45)",
        "card-hover": "0 8px 32px -8px rgba(255,106,0,0.25)",
      },
      transitionTimingFunction: {
        smooth: "cubic-bezier(0.4, 0, 0.2, 1)",
      },
      keyframes: {
        "fade-in-up": {
          "0%": { opacity: "0", transform: "translateY(16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        "float-slow": {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-12px)" },
        },
        "pulse-ring": {
          "0%": { boxShadow: "0 0 0 0 rgba(37,211,102,0.45)" },
          "70%": { boxShadow: "0 0 0 12px rgba(37,211,102,0)" },
          "100%": { boxShadow: "0 0 0 0 rgba(37,211,102,0)" },
        },
        "bump": {
          "0%, 100%": { transform: "scale(1)" },
          "35%": { transform: "scale(1.35)" },
          "60%": { transform: "scale(0.95)" },
        },
      },
      animation: {
        "fade-in-up": "fade-in-up 0.6s cubic-bezier(0.4,0,0.2,1) both",
        "fade-in": "fade-in 0.6s ease-out both",
        "float-slow": "float-slow 6s ease-in-out infinite",
        "pulse-ring": "pulse-ring 2.5s cubic-bezier(0.4,0,0.6,1) infinite",
        bump: "bump 0.4s cubic-bezier(0.4,0,0.2,1)",
      },
    },
  },
  plugins: [],
};

export default config;
