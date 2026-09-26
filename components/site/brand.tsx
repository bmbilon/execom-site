import { Fragment, type ReactNode } from "react"

/**
 * The brand name is always lowercase, even inside uppercase labels
 * (eyebrows, table headers). Wraps each "execom" so text-transform
 * cannot capitalise it.
 */
export function brandCase(text: string): ReactNode {
  if (!/execom/i.test(text)) return text
  const parts = text.split(/(execom)/i)
  return parts.map((p, i) =>
    /^execom$/i.test(p) ? (
      <span key={i} className="normal-case">
        execom
      </span>
    ) : (
      <Fragment key={i}>{p}</Fragment>
    ),
  )
}
