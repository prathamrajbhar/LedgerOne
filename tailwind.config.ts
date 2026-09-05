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
      colors: {
        border: "hsl(var(--border))",
        "border-strong": "hsl(var(--border-strong))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        navy: {
          DEFAULT: "#16324F",
          dark: "#0F2338",
          light: "#EBF3F9",
          foreground: "#FFFFFF",
        },
        teal: {
          DEFAULT: "#167C80",
          dark: "#115F62",
          light: "#E3F3F3",
          foreground: "#FFFFFF",
        },
        "surface-subtle": "#F8FAFC",
        surface: {
          DEFAULT: "#FFFFFF",
          subtle: "#F8FAFC",
          foreground: "#1E293B",
        },
        "primary-light": "#EEF5FA",
        primary: {
          DEFAULT: "#16324F",
          foreground: "#FFFFFF",
          light: "#EEF5FA",
        },
        secondary: {
          DEFAULT: "#167C80",
          foreground: "#FFFFFF",
          light: "#E3F3F3",
        },
        destructive: {
          DEFAULT: "#DC2626",
          foreground: "#FFFFFF",
          light: "#FEE2E2",
        },
        muted: {
          DEFAULT: "#F1F5F9",
          foreground: "#64748B",
        },
        accent: {
          DEFAULT: "#167C80",
          foreground: "#FFFFFF",
          light: "#E3F3F3",
        },
        popover: {
          DEFAULT: "#FFFFFF",
          foreground: "#1E293B",
        },
        card: {
          DEFAULT: "#FFFFFF",
          foreground: "#1E293B",
        },
      },
      fontFamily: {
        sans: ["var(--font-open-sans)", "system-ui", "-apple-system", "sans-serif"],
        mono: ["ui-monospace", "SFMono-Regular", "Menlo", "Monaco", "Consolas", "monospace"],
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      boxShadow: {
        xs: "0 1px 2px 0 rgba(16, 24, 40, 0.05)",
        sm: "0 1px 3px 0 rgba(16, 24, 40, 0.08), 0 1px 2px 0 rgba(16, 24, 40, 0.04)",
        md: "0 4px 6px -1px rgba(16, 24, 40, 0.08), 0 2px 4px -2px rgba(16, 24, 40, 0.04)",
        card: "0 1px 3px rgba(0,0,0,0.05), 0 1px 2px rgba(0,0,0,0.03)",
        dropdown: "0 10px 25px -5px rgba(16, 35, 56, 0.12), 0 8px 10px -6px rgba(16, 35, 56, 0.08)",
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
