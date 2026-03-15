import type { Config } from "tailwindcss"

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: "#F7F6EE",
        fg: "#111111",
        muted: "#7a7a72",
        subtle: "#b8b8b0",
        border: "#E5E5E5",
        teal: "#50C4D2",
        "teal-dark": "#3da8b5",
        blue: "#195E8E",
        "blue-dark": "#144D75",
        gold: "#FFC342",
        cream: "#FFE3B3",
        "surface-raised": "#EFEFE8",
      },
      fontFamily: {
        serif: ["Playfair Display", "Georgia", "serif"],
        sans: ["Inter", "system-ui", "-apple-system", "sans-serif"],
        mono: ["JetBrains Mono", "Menlo", "monospace"],
      },
      maxWidth: {
        content: "720px",
        wide: "960px",
      },
      fontSize: {
        hero: ["1.75rem", { lineHeight: "1.35", letterSpacing: "-0.01em" }],
        body: ["1.0625rem", { lineHeight: "1.75" }],
        sm: ["0.9375rem", { lineHeight: "1.65" }],
        nav: ["0.75rem", { lineHeight: "1", letterSpacing: "0.08em" }],
        caption: ["0.6875rem", { lineHeight: "1", letterSpacing: "0.06em" }],
      },
    },
  },
  plugins: [],
}

export default config
