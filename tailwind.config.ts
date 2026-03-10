import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      fontFamily: {
        sans: ['"DM Sans"', "ui-sans-serif", "system-ui", "sans-serif"],
        serif: ['"Playfair Display"', "Georgia", "ui-serif", "serif"],
      },
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        // PlotKeeper deep garden greens — centred on #2D5016
        garden: {
          50:  "#EFF6E8",
          100: "#D4E8BE",
          200: "#B5D694",
          300: "#8DBD63",
          400: "#66A036",
          500: "#4A7D22",
          600: "#3A6118",
          700: "#2D5016",
          800: "#1E380E",
          900: "#0F1E07",
        },
        // Earthy terracotta — centred on #C4622D
        terracotta: {
          50:  "#FDF3EE",
          100: "#FADDCC",
          200: "#F5BB9A",
          300: "#EE9265",
          400: "#DC7040",
          500: "#C4622D",
          600: "#A4501F",
          700: "#7E3C16",
          800: "#5C2B0E",
          900: "#3A1A08",
        },
        // Linen — neutral warm for borders, backgrounds
        linen: {
          50:  "#FDFAF7",
          100: "#F7F3EE",
          200: "#EEE5D9",
          300: "#E8DDD0",
          400: "#D4C5B0",
          500: "#BEA98E",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      boxShadow: {
        warm: "0 2px 12px rgba(0,0,0,0.06)",
        "warm-lg": "0 4px 20px rgba(0,0,0,0.09)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
