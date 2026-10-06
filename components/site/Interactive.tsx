"use client"

import { useCallback, useEffect, useId, useRef, useState, type ReactNode } from "react"
import { brandCase } from "./brand"

/* ------------------------------------------------------------------ */
/* Expand-all bus                                                      */
/* ------------------------------------------------------------------ */
export const EXPAND_EVENT = "site:expand"

export function broadcastExpand(open: boolean) {
  window.dispatchEvent(new CustomEvent(EXPAND_EVENT, { detail: { open } }))
}

function useExpandBus(onChange: (open: boolean) => void) {
  const cb = useRef(onChange)
  cb.current = onChange
  useEffect(() => {
    const handler = (e: Event) => cb.current(Boolean((e as CustomEvent).detail?.open))
    window.addEventListener(EXPAND_EVENT, handler)
    return () => window.removeEventListener(EXPAND_EVENT, handler)
  }, [])
}

/* ------------------------------------------------------------------ */
/* Disclosure: "Read the detail"                                       */
/* ------------------------------------------------------------------ */
export function Disclosure({
  label,
  openLabel = "Show less",
  meta,
  id,
  defaultOpen = false,
  children,
  className = "",
  triggerClassName = "",
  onOpen,
}: {
  label: string
  openLabel?: string
  meta?: string
  id?: string
  defaultOpen?: boolean
  children: ReactNode
  className?: string
  triggerClassName?: string
  onOpen?: () => void
}) {
  const [open, setOpen] = useState(defaultOpen)
  const panelId = useId()
  const onOpenRef = useRef(onOpen)
  onOpenRef.current = onOpen
  useExpandBus(setOpen)

  // Open when the URL hash targets this disclosure
  useEffect(() => {
    if (!id) return
    const check = () => {
      if (window.location.hash === `#${id}`) setOpen(true)
    }
    check()
    window.addEventListener("hashchange", check)
    return () => window.removeEventListener("hashchange", check)
  }, [id])

  useEffect(() => {
    if (open) onOpenRef.current?.()
  }, [open])

  return (
    <div id={id} className={`s-anchor ${className}`} data-open={open ? "true" : undefined}>
      <button
        type="button"
        className={`s-disc-trigger ${triggerClassName}`}
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((v) => !v)}
      >
        <span className="s-plus" aria-hidden />
        <span>{open ? openLabel : label}</span>
        {meta && !open && <span className="s-mono text-[10.5px] tracking-[0.1em] text-fog">{meta}</span>}
      </button>
      <div className="s-collapse" id={panelId} role="region">
        <div>
          <div className="pt-7">{children}</div>
        </div>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* Accordion                                                           */
/* ------------------------------------------------------------------ */
export type AccordionItem = { title: string; content: ReactNode }

export function Accordion({
  items,
  numbered = false,
  defaultOpen = [],
}: {
  items: AccordionItem[]
  numbered?: boolean
  defaultOpen?: number[]
}) {
  const [open, setOpen] = useState<Set<number>>(() => new Set(defaultOpen))
  const baseId = useId()
  useExpandBus((all) => setOpen(all ? new Set(items.map((_, i) => i)) : new Set()))

  const toggle = (i: number) =>
    setOpen((prev) => {
      const next = new Set(prev)
      if (next.has(i)) next.delete(i)
      else next.add(i)
      return next
    })

  return (
    <div className="s-acc">
      {items.map((item, i) => {
        const isOpen = open.has(i)
        return (
          <div
            key={i}
            className="s-acc-item"
            data-open={isOpen ? "true" : undefined}
            data-numbered={numbered ? "true" : undefined}
          >
            <button
              type="button"
              className="s-acc-head"
              aria-expanded={isOpen}
              aria-controls={`${baseId}-${i}`}
              onClick={() => toggle(i)}
            >
              {numbered && <span className="n">{String(i + 1).padStart(2, "0")}</span>}
              <span>{item.title}</span>
              <span className="s-plus" aria-hidden />
            </button>
            <div className="s-collapse" id={`${baseId}-${i}`} role="region">
              <div>
                <div className="s-acc-body s-body text-[15px]">{item.content}</div>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* Tabs (segmented control + panel)                                    */
/* ------------------------------------------------------------------ */
export function Tabs({
  items,
  className = "",
  panelClassName = "",
}: {
  items: { label: string; content: ReactNode }[]
  className?: string
  panelClassName?: string
}) {
  const [active, setActive] = useState(0)
  const baseId = useId()
  const refs = useRef<(HTMLButtonElement | null)[]>([])

  const onKey = (e: React.KeyboardEvent, i: number) => {
    let next = i
    if (e.key === "ArrowRight") next = (i + 1) % items.length
    else if (e.key === "ArrowLeft") next = (i - 1 + items.length) % items.length
    else if (e.key === "Home") next = 0
    else if (e.key === "End") next = items.length - 1
    else return
    e.preventDefault()
    setActive(next)
    refs.current[next]?.focus()
  }

  return (
    <div className={className}>
      <div className="s-seg" role="tablist">
        {items.map((it, i) => (
          <button
            key={it.label}
            ref={(el) => {
              refs.current[i] = el
            }}
            type="button"
            role="tab"
            id={`${baseId}-tab-${i}`}
            aria-selected={i === active}
            aria-controls={`${baseId}-panel-${i}`}
            tabIndex={i === active ? 0 : -1}
            onClick={() => setActive(i)}
            onKeyDown={(e) => onKey(e, i)}
          >
            {it.label}
          </button>
        ))}
      </div>
      {items.map((it, i) => (
        <div
          key={it.label}
          role="tabpanel"
          id={`${baseId}-panel-${i}`}
          aria-labelledby={`${baseId}-tab-${i}`}
          hidden={i !== active}
          className={`${panelClassName} ${i === active ? "s-fade-swap" : ""}`}
        >
          {it.content}
        </div>
      ))}
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* Comparison matrix                                                   */
/* ------------------------------------------------------------------ */
export function Matrix({
  columns,
  rows,
  rowHeader,
}: {
  columns: { label: string; highlight?: boolean }[]
  rows: { label: string; values: ReactNode[] }[]
  rowHeader?: string
}) {
  const initial = Math.max(0, columns.findIndex((c) => c.highlight))
  const [col, setCol] = useState(initial)
  return (
    <div>
      {/* Desktop table */}
      <div className="hidden md:block s-glass overflow-hidden rounded-[16px] p-2">
        <table className="s-table">
          <thead>
            <tr>
              <th scope="col" className="w-[18%]">
                {rowHeader ? brandCase(rowHeader) : <span className="sr-only">Dimension</span>}
              </th>
              {columns.map((c) => (
                <th key={c.label} scope="col" className={c.highlight ? "hl" : ""}>
                  {brandCase(c.label)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.label}>
                <td className="dim">{r.label}</td>
                {r.values.map((v, j) => (
                  <td key={j} className={columns[j]?.highlight ? "hl" : ""}>
                    {v}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile: pick a column, read its rows */}
      <div className="md:hidden">
        <div className="s-seg" role="tablist" aria-label="Compare">
          {columns.map((c, i) => (
            <button key={c.label} type="button" role="tab" aria-selected={i === col} onClick={() => setCol(i)}>
              {c.label}
            </button>
          ))}
        </div>
        <dl key={col} className="s-glass s-fade-swap mt-4 divide-y divide-white/[0.07] rounded-[16px] px-5">
          {rows.map((r) => (
            <div key={r.label} className="py-4">
              <dt className="s-mono text-[10.5px] uppercase tracking-[0.14em] text-fog">{r.label}</dt>
              <dd className="mt-1.5 text-[15px] leading-relaxed text-snow/90">{r.values[col]}</dd>
            </div>
          ))}
        </dl>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* Chapter bar: sticky in-page nav with scroll-spy + progress          */
/* ------------------------------------------------------------------ */
export function ChapterBar({
  chapters,
  label,
  expandable = true,
}: {
  chapters: { id: string; nav: string }[]
  label?: string
  expandable?: boolean
}) {
  const [active, setActive] = useState<string>(chapters[0]?.id ?? "")
  const [allOpen, setAllOpen] = useState(false)
  const barRef = useRef<HTMLDivElement>(null)
  const linksRef = useRef<HTMLDivElement>(null)

  useExpandBus(setAllOpen)

  // Scroll-spy: the chapter whose top most recently passed the bar wins
  useEffect(() => {
    const sections = chapters
      .map((c) => document.getElementById(c.id))
      .filter((el): el is HTMLElement => Boolean(el))
    if (sections.length === 0) return

    let frame = 0
    const update = () => {
      const offset = 150
      let current = sections[0].id
      for (const s of sections) {
        if (s.getBoundingClientRect().top - offset <= 0) current = s.id
      }
      setActive(current)

      const first = sections[0].getBoundingClientRect().top + window.scrollY
      const lastEl = sections[sections.length - 1]
      const end = lastEl.getBoundingClientRect().bottom + window.scrollY - window.innerHeight
      const p = Math.min(1, Math.max(0, (window.scrollY - first + offset) / Math.max(1, end - first + offset)))
      barRef.current?.style.setProperty("--p", p.toFixed(4))
    }
    const onScroll = () => {
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(update)
    }
    update()
    window.addEventListener("scroll", onScroll, { passive: true })
    window.addEventListener("resize", onScroll)
    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener("scroll", onScroll)
      window.removeEventListener("resize", onScroll)
    }
  }, [chapters])

  // Keep the active chip visible in the horizontal scroller
  useEffect(() => {
    const el = linksRef.current?.querySelector<HTMLElement>(`[data-id="${active}"]`)
    const box = linksRef.current
    if (!el || !box) return
    const left = el.offsetLeft - box.clientWidth / 2 + el.clientWidth / 2
    box.scrollTo({ left, behavior: "smooth" })
  }, [active])

  const jump = useCallback((id: string) => {
    const el = document.getElementById(id)
    if (!el) return
    const y = el.getBoundingClientRect().top + window.scrollY - 118
    window.scrollTo({ top: y, behavior: "smooth" })
    history.replaceState(null, "", `#${id}`)
  }, [])

  return (
    <div className="s-chapbar" ref={barRef}>
      <div className="s-container flex h-[52px] items-center gap-4">
        {label && (
          <span className="hidden xl:inline s-mono text-[10.5px] uppercase tracking-[0.14em] text-fog shrink-0">
            {label}
          </span>
        )}
        <div className="s-chapbar-links min-w-0 flex-1" ref={linksRef}>
          {chapters.map((c, i) => (
            <a
              key={c.id}
              href={`#${c.id}`}
              data-id={c.id}
              className="s-chapbar-link"
              aria-current={active === c.id ? "true" : undefined}
              onClick={(e) => {
                e.preventDefault()
                jump(c.id)
              }}
            >
              <span className="n">{String(i + 1).padStart(2, "0")}</span>
              {c.nav}
            </a>
          ))}
        </div>
        {expandable && (
          <button
            type="button"
            onClick={() => broadcastExpand(!allOpen)}
            className="hidden sm:inline-flex shrink-0 items-center gap-2 rounded-full border border-white/[0.12] px-3.5 h-8 text-[12.5px] text-haze transition-colors hover:border-cyan-500/50 hover:text-snow"
            aria-pressed={allOpen}
          >
            <span className="relative h-2 w-2">
              <span className={`absolute inset-0 rounded-full ${allOpen ? "bg-cyan-400 shadow-[0_0_8px_rgba(80,196,210,.8)]" : "bg-white/25"}`} />
            </span>
            {allOpen ? "Collapse all" : "Expand all"}
          </button>
        )}
      </div>
      <div className="s-progress" aria-hidden />
    </div>
  )
}
