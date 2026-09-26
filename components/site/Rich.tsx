import Link from "next/link"
import { Fragment, type ReactNode } from "react"

/**
 * Tiny inline formatter for content strings.
 *   **bold**   *italic*   [label](/href)
 * Keeps page content as plain data while allowing light emphasis.
 */
const TOKEN = /(\*\*[^*]+\*\*|\*[^*]+\*|\[[^\]]+\]\([^)]+\))/g

/** Keep numeric ranges like 15–30% on one line (word joiners around the en dash). */
export function keepRanges(text: string): string {
  return text.replace(/(\d)–(\$?\d)/g, "$1\u2060–\u2060$2")
}

export function rich(text: string, keyPrefix = "r"): ReactNode {
  if (!text) return null
  const parts = keepRanges(text).split(TOKEN).filter((p) => p !== "")
  return parts.map((part, i) => {
    const key = `${keyPrefix}-${i}`
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={key}>{part.slice(2, -2)}</strong>
    }
    if (part.startsWith("*") && part.endsWith("*") && part.length > 2) {
      return <em key={key}>{part.slice(1, -1)}</em>
    }
    const link = /^\[([^\]]+)\]\(([^)]+)\)$/.exec(part)
    if (link) {
      const [, label, href] = link
      if (href.startsWith("http")) {
        return (
          <a key={key} href={href} target="_blank" rel="noreferrer">
            {label}
          </a>
        )
      }
      return (
        <Link key={key} href={href}>
          {label}
        </Link>
      )
    }
    return <Fragment key={key}>{part}</Fragment>
  })
}

/** Headline helper: *phrase* renders as the cyan italic accent. */
export function accentTitle(text: string): ReactNode {
  const parts = text.split(/(\*[^*]+\*)/g).filter(Boolean)
  return parts.map((p, i) =>
    p.startsWith("*") && p.endsWith("*") ? (
      <span key={i} className="s-accent">
        {p.slice(1, -1)}
      </span>
    ) : (
      <Fragment key={i}>{p}</Fragment>
    ),
  )
}

export function Paras({ paras, className = "s-body" }: { paras: string[]; className?: string }) {
  return (
    <div className={className}>
      {paras.map((p, i) => (
        <p key={i}>{rich(p, `p${i}`)}</p>
      ))}
    </div>
  )
}

export function plain(text: string) {
  return text.replace(/\*\*|\*/g, "").replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
}

export function wordCount(texts: string[]) {
  return texts.join(" ").split(/\s+/).filter(Boolean).length
}
