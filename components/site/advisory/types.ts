// Content model for long-form advisory pages.
//
// Strings support light inline markup (see components/site/Rich.tsx):
//   **bold**   *italic*   [label](/href)
// Titles support *accent* for the cyan italic phrase.
//
// Visibility rule ("cut + layer"): a chapter's title and summary are always
// visible. Everything inside a `detail` block, and every accordion body,
// is collapsed by default but stays in the DOM for search engines.

import type { ReactNode } from "react"

export type Cta = { label: string; href: string }

export type Block =
  | { kind: "prose"; paras: string[] }
  | { kind: "lead"; text: string }
  | { kind: "points"; items: { label: string; text: string }[]; style?: "tabs" | "grid" }
  | {
      kind: "matrix"
      columns: { label: string; highlight?: boolean }[]
      rows: { label: string; values: string[] }[]
      note?: string
      /** Optional header for the row-label column (hidden when omitted) */
      rowHeader?: string
    }
  | { kind: "accordion"; items: { title: string; body: string[] }[]; numbered?: boolean }
  | { kind: "quote"; text: string }
  | { kind: "callout"; title?: string; text: string }
  | { kind: "list"; items: string[]; numbered?: boolean }
  | { kind: "steps"; items: { title: string; text: string; meta?: string }[] }
  | { kind: "cards"; items: { title: string; text: string }[]; columns?: 2 | 3 }
  | { kind: "detail"; label: string; blocks: Block[] }
  /** Escape hatch for hand-built pages (service pages, about) */
  | { kind: "node"; node: ReactNode; words?: number }

export type Chapter = {
  id: string
  /** Short label for the sticky chapter bar */
  nav: string
  /** Optional small label above the title, e.g. "Signature section" */
  eyebrow?: string
  title: string
  /** One or two sentences. Always visible. */
  summary: string
  blocks: Block[]
  /** "feature" renders the chapter on a lit panel to break rhythm */
  tone?: "default" | "feature"
}

export type AdvisoryPageData = {
  href: string
  crumb: string
  hero: {
    eyebrow: string
    title: string
    lede: string
    primary: Cta
    secondary?: Cta
    /** Three short takeaways shown in the hero "In brief" card (omit when the page passes its own hero aside) */
    takeaways?: string[]
  }
  chapters: Chapter[]
  faq?: { q: string; a: string[] }[]
  midCta?: { after: string; title: string; body?: string; primary: Cta; secondary?: Cta }
  closing: { title: string; body?: string; primary: Cta; secondary?: Cta }
  related?: string[]
}
