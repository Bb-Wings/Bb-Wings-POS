/**
 * @fileoverview Tailwind CSS Configuration — BB Wings Management System
 * @description Configuración completa del sistema de diseño con paleta de colores
 * corporativa, tipografías premium y utilidades personalizadas.
 * @version 1.0.0
 */

import type { Config } from "tailwindcss";

const config: Config = {
  // ─── Dark Mode Strategy ───────────────────────────────────────────────────
  darkMode: "class",

  // ─── Content Paths ────────────────────────────────────────────────────────
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],

  theme: {
    extend: {
      // ─── Color Palette — BB Wings Corporate Identity ───────────────────
      colors: {
        // Primary — Brand Red
        primary: {
          DEFAULT: "#D61F2C",
          50:  "#fef2f2",
          100: "#fee2e2",
          200: "#fecaca",
          300: "#fca5a5",
          400: "#f87171",
          500: "#D61F2C",
          600: "#c01a26",
          700: "#a01520",
          800: "#7f101a",
          900: "#5e0c13",
          950: "#3d0809",
        },

        // Secondary — Brand Gold/Yellow
        secondary: {
          DEFAULT: "#F4B400",
          50:  "#fffbeb",
          100: "#fef3c7",
          200: "#fde68a",
          300: "#fcd34d",
          400: "#fbbf24",
          500: "#F4B400",
          600: "#d97706",
          700: "#b45309",
          800: "#92400e",
          900: "#78350f",
          950: "#451a03",
        },

        // Dark — App Backgrounds
        dark: {
          DEFAULT: "#101010",
          50:  "#f5f5f5",
          100: "#e5e5e5",
          200: "#d4d4d4",
          300: "#a3a3a3",
          400: "#737373",
          500: "#525252",
          600: "#404040",
          700: "#2d2d2d",
          800: "#1e1e1e",
          900: "#171717",
          950: "#101010",
        },

        // Card — Surface backgrounds
        card: {
          DEFAULT: "#1E1E1E",
          hover: "#252525",
          active: "#2a2a2a",
          border: "#2f2f2f",
        },

        // Gray — Text & UI Elements
        gray: {
          DEFAULT: "#E6E6E6",
          muted: "#9ca3af",
          subtle: "#6b7280",
        },

        // Semantic Colors
        success: {
          DEFAULT: "#2ECC71",
          light: "#d1fae5",
          dark: "#065f46",
        },
        warning: {
          DEFAULT: "#FF6F00",
          light: "#fef3c7",
          dark: "#92400e",
        },
        danger: {
          DEFAULT: "#C62828",
          light: "#fee2e2",
          dark: "#7f1d1d",
        },

        // Background aliases
        bg: {
          primary: "#101010",
          secondary: "#1E1E1E",
          tertiary: "#252525",
        },
      },

      // ─── Typography ─────────────────────────────────────────────────────
      fontFamily: {
        display:   ["Bebas Neue", "sans-serif"],       // Headings grandes
        heading:   ["Oswald", "sans-serif"],            // Subtítulos
        body:      ["Poppins", "sans-serif"],           // Cuerpo de texto
        ui:        ["Montserrat", "sans-serif"],        // UI elements
        mono:      ["JetBrains Mono", "monospace"],    // Código
      },

      fontSize: {
        "2xs": ["0.625rem", { lineHeight: "0.875rem" }],
        xs:    ["0.75rem",  { lineHeight: "1rem" }],
        sm:    ["0.875rem", { lineHeight: "1.25rem" }],
        base:  ["1rem",     { lineHeight: "1.5rem" }],
        lg:    ["1.125rem", { lineHeight: "1.75rem" }],
        xl:    ["1.25rem",  { lineHeight: "1.75rem" }],
        "2xl": ["1.5rem",   { lineHeight: "2rem" }],
        "3xl": ["1.875rem", { lineHeight: "2.25rem" }],
        "4xl": ["2.25rem",  { lineHeight: "2.5rem" }],
        "5xl": ["3rem",     { lineHeight: "1" }],
        "6xl": ["3.75rem",  { lineHeight: "1" }],
        "7xl": ["4.5rem",   { lineHeight: "1" }],
        "8xl": ["6rem",     { lineHeight: "1" }],
        "9xl": ["8rem",     { lineHeight: "1" }],
      },

      // ─── Spacing & Sizing ────────────────────────────────────────────────
      spacing: {
        "18": "4.5rem",
        "88": "22rem",
        "112": "28rem",
        "128": "32rem",
      },

      // ─── Border Radius ───────────────────────────────────────────────────
      borderRadius: {
        "4xl": "2rem",
        "5xl": "2.5rem",
      },

      // ─── Shadows — Glassmorphism & Glow Effects ──────────────────────────
      boxShadow: {
        "glow-primary":   "0 0 20px rgba(214, 31, 44, 0.4)",
        "glow-secondary": "0 0 20px rgba(244, 180, 0, 0.4)",
        "glow-sm":        "0 0 10px rgba(214, 31, 44, 0.25)",
        "card":           "0 4px 24px rgba(0, 0, 0, 0.4)",
        "card-hover":     "0 8px 32px rgba(0, 0, 0, 0.6)",
        "glass":          "0 8px 32px rgba(0, 0, 0, 0.3)",
        "inset-card":     "inset 0 1px 0 rgba(255,255,255,0.05)",
      },

      // ─── Backdrop Blur ───────────────────────────────────────────────────
      backdropBlur: {
        xs: "2px",
      },

      // ─── Animations ──────────────────────────────────────────────────────
      keyframes: {
        "fade-in": {
          "0%":   { opacity: "0" },
          "100%": { opacity: "1" },
        },
        "fade-in-up": {
          "0%":   { opacity: "0", transform: "translateY(16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in-down": {
          "0%":   { opacity: "0", transform: "translateY(-16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "slide-in-right": {
          "0%":   { transform: "translateX(100%)" },
          "100%": { transform: "translateX(0)" },
        },
        "slide-in-left": {
          "0%":   { transform: "translateX(-100%)" },
          "100%": { transform: "translateX(0)" },
        },
        "scale-in": {
          "0%":   { opacity: "0", transform: "scale(0.95)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        "pulse-glow": {
          "0%, 100%": { boxShadow: "0 0 10px rgba(214, 31, 44, 0.3)" },
          "50%":      { boxShadow: "0 0 25px rgba(214, 31, 44, 0.7)" },
        },
        "shimmer": {
          "0%":   { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        "spin-slow": {
          "0%":   { transform: "rotate(0deg)" },
          "100%": { transform: "rotate(360deg)" },
        },
        "bounce-subtle": {
          "0%, 100%": { transform: "translateY(0)" },
          "50%":      { transform: "translateY(-4px)" },
        },
      },

      animation: {
        "fade-in":        "fade-in 0.3s ease-in-out",
        "fade-in-up":     "fade-in-up 0.4s ease-out",
        "fade-in-down":   "fade-in-down 0.4s ease-out",
        "slide-in-right": "slide-in-right 0.35s ease-out",
        "slide-in-left":  "slide-in-left 0.35s ease-out",
        "scale-in":       "scale-in 0.25s ease-out",
        "pulse-glow":     "pulse-glow 2s ease-in-out infinite",
        "shimmer":        "shimmer 2s linear infinite",
        "spin-slow":      "spin-slow 3s linear infinite",
        "bounce-subtle":  "bounce-subtle 2s ease-in-out infinite",
      },

      // ─── Transitions ─────────────────────────────────────────────────────
      transitionDuration: {
        "250": "250ms",
        "350": "350ms",
        "400": "400ms",
      },

      // ─── Z-Index ─────────────────────────────────────────────────────────
      zIndex: {
        "60":  "60",
        "70":  "70",
        "80":  "80",
        "90":  "90",
        "100": "100",
      },
    },
  },

  plugins: [],
};

export default config;
