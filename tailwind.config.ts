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
        glow: "0 0 50px -12px rgba(255,106,0,0.35)",
        "glow-sm": "0 0 24px -8px rgba(255,106,0,0.4)",
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
        /* --- agregado para la transformación visual: microinteracciones ---- */
        "scale-in": {
          "0%": { opacity: "0", transform: "scale(0.92)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        "heart-pop": {
          "0%": { transform: "scale(1)" },
          "30%": { transform: "scale(1.35)" },
          "50%": { transform: "scale(0.9)" },
          "100%": { transform: "scale(1)" },
        },
        "slide-in-left": {
          "0%": { transform: "translateX(-100%)" },
          "100%": { transform: "translateX(0)" },
        },
        "slide-in-right": {
          "0%": { transform: "translateX(100%)" },
          "100%": { transform: "translateX(0)" },
        },
        "slide-up-sheet": {
          "0%": { transform: "translateY(100%)" },
          "100%": { transform: "translateY(0)" },
        },
        "fade-scale-in": {
          "0%": { opacity: "0", transform: "scale(0.98)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        "glow-breathe": {
          "0%, 100%": { opacity: "0.5" },
          "50%": { opacity: "1" },
        },
        /* --- agregado: marquee de marcas (home) y franja de "publicidad" --- */
        marquee: {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
        "float-y": {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-8px)" },
        },
      },
      animation: {
        "fade-in-up": "fade-in-up 0.6s cubic-bezier(0.4,0,0.2,1) both",
        "fade-in": "fade-in 0.6s ease-out both",
        "float-slow": "float-slow 6s ease-in-out infinite",
        "pulse-ring": "pulse-ring 2.5s cubic-bezier(0.4,0,0.6,1) infinite",
        bump: "bump 0.4s cubic-bezier(0.4,0,0.2,1)",
        /* --- agregado --- */
        "scale-in": "scale-in 0.35s cubic-bezier(0.4,0,0.2,1) both",
        "heart-pop": "heart-pop 0.4s cubic-bezier(0.4,0,0.2,1)",
        "slide-in-left": "slide-in-left 0.35s cubic-bezier(0.4,0,0.2,1) both",
        "slide-in-right": "slide-in-right 0.35s cubic-bezier(0.4,0,0.2,1) both",
        "slide-up-sheet": "slide-up-sheet 0.35s cubic-bezier(0.4,0,0.2,1) both",
        "fade-scale-in": "fade-scale-in 0.4s cubic-bezier(0.4,0,0.2,1) both",
        "glow-breathe": "glow-breathe 3.5s ease-in-out infinite",
        marquee: "marquee 28s linear infinite",
        "marquee-slow": "marquee 50s linear infinite",
        "float-y": "float-y 4s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
