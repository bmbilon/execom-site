import type { Config } from "tailwindcss"

const config: Config = {
  content: ["./app/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: "#fafaf7",
        fg: "#111111",
        muted: "#6b6b6b",
        border: "#e0e0dc",
      },
      fontFamily: {
        sans: [
          "Inter",
          "system-ui",
          "-apple-system",
          "Segoe UI",
          "Roboto",
          "Helvetica Neue",
          "Arial",
          "sans-serif",
        ],
      },
      maxWidth: {
        content: "640px",
      },
      fontSize: {
        body: ["1.0625rem", { lineHeight: "1.75" }],
        nav: ["0.8125rem", { lineHeight: "1", letterSpacing: "0.05em" }],
      },
    },
  },
  plugins: [],
}

export default config
