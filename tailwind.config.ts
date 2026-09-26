import type { Config } from "tailwindcss"

// Legacy palette tokens resolve through CSS variables so the marketing
// site (scoped under `.site`) can remap them to the dark system while the
// portal keeps its original light values from :root in globals.css.
const channel = (name: string) => `rgb(var(${name}) / <alpha-value>)`

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/site/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: channel("--c-bg"),
        fg: channel("--c-fg"),
        muted: channel("--c-muted"),
        subtle: channel("--c-subtle"),
        border: channel("--c-border"),
        teal: "#50C4D2",
        "teal-dark": "#3da8b5",
        blue: channel("--c-blue"),
        "blue-dark": "#144D75",
        gold: "#FFC342",
        cream: "#FFE3B3",
        "surface-raised": channel("--c-surface-raised"),

        // Dark premium system (marketing site)
        ink: {
          950: "#04090F",
          900: "#07111B",
          850: "#0A1724",
          800: "#0E1F31",
          700: "#14293F",
        },
        snow: "#EDF2F7",
        haze: "#A7B6C6",
        fog: "#6F8499",
        cyan: {
          200: "#BDEFF4",
          300: "#8BDCE6",
          400: "#6FD2DE",
          500: "#50C4D2",
          600: "#36A7B6",
        },
        navy: {
          DEFAULT: "#195E8E",
          400: "#2B7DB8",
          300: "#4F9BD0",
        },
      },
      fontFamily: {
        serif: ["Playfair Display", "Georgia", "serif"],
        sans: ["Inter", "system-ui", "-apple-system", "sans-serif"],
        mono: ["JetBrains Mono", "Menlo", "monospace"],
        // Loaded only by the marketing layout (next/font/local, self-hosted).
        display: ["var(--font-newsreader)", "Georgia", "serif"],
      },
      maxWidth: {
        content: "720px",
        wide: "960px",
        site: "1200px",
      },
      fontSize: {
        hero: ["1.75rem", { lineHeight: "1.35", letterSpacing: "-0.01em" }],
        body: ["1.0625rem", { lineHeight: "1.75" }],
        sm: ["0.9375rem", { lineHeight: "1.65" }],
        nav: ["0.75rem", { lineHeight: "1", letterSpacing: "0.08em" }],
        caption: ["0.6875rem", { lineHeight: "1", letterSpacing: "0.06em" }],
      },
      transitionTimingFunction: {
        premium: "cubic-bezier(.2,.7,.2,1)",
      },
    },
  },
  plugins: [],
}

export default config
