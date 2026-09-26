import localFont from "next/font/local"
import { SiteHeader } from "@/components/site/SiteHeader"
import { SiteFooter } from "@/components/site/SiteFooter"
import { SiteEffects, REVEAL_BOOTSTRAP } from "@/components/site/SiteEffects"
import { buildSearchIndex } from "@/lib/site/search"

// Self-hosted variable fonts (preloaded, metric-matched fallbacks, no layout shift)
const sans = localFont({
  src: "../../node_modules/@fontsource-variable/inter/files/inter-latin-wght-normal.woff2",
  weight: "100 900",
  style: "normal",
  display: "swap",
  variable: "--font-inter",
  fallback: ["system-ui", "-apple-system", "Segoe UI", "sans-serif"],
})

const display = localFont({
  src: [
    {
      path: "../../node_modules/@fontsource-variable/newsreader/files/newsreader-latin-opsz-normal.woff2",
      weight: "200 800",
      style: "normal",
    },
    {
      path: "../../node_modules/@fontsource-variable/newsreader/files/newsreader-latin-opsz-italic.woff2",
      weight: "200 800",
      style: "italic",
    },
  ],
  display: "swap",
  variable: "--font-newsreader",
  fallback: ["Georgia", "Times New Roman", "serif"],
})

const mono = localFont({
  src: "../../node_modules/@fontsource-variable/jetbrains-mono/files/jetbrains-mono-latin-wght-normal.woff2",
  weight: "100 800",
  style: "normal",
  display: "swap",
  variable: "--font-jbmono",
  fallback: ["ui-monospace", "Menlo", "monospace"],
})

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  const searchEntries = buildSearchIndex()
  return (
    <div className={`site ${sans.variable} ${display.variable} ${mono.variable} flex min-h-screen flex-col`}>
      <script dangerouslySetInnerHTML={{ __html: REVEAL_BOOTSTRAP }} />
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[200] focus:rounded-lg focus:bg-ink-800 focus:px-4 focus:py-2 focus:text-snow"
      >
        Skip to content
      </a>
      <SiteHeader searchEntries={searchEntries} />
      <main id="main" className="flex-1">
        {children}
      </main>
      <SiteFooter />
      <SiteEffects />
    </div>
  )
}
