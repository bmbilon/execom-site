"use client"

import { useRouter } from "next/navigation"
import { useEffect, useMemo, useRef, useState } from "react"
import { ArrowRight, CornerDownLeft, FileText, Hash, Search, Zap } from "lucide-react"
import { normalizeSearch } from "@/lib/site/searchText"
import type { SearchEntry } from "@/lib/site/nav"

type Kind = "service" | "page" | "section" | "action"
export type PaletteEntry = SearchEntry & { kind: Kind }

function score(entry: PaletteEntry, tokens: string[]): number {
  if (tokens.length === 0) return entry.kind === "action" ? 4 : entry.kind === "service" ? 3 : entry.kind === "page" ? 2 : 0
  const title = normalizeSearch(entry.title)
  const hay = normalizeSearch(`${title} ${entry.section ?? ""} ${entry.group ?? ""} ${entry.hint ?? ""} ${entry.keywords ?? ""}`)
  let s = 0
  for (const t of tokens) {
    if (!hay.includes(t)) return -1
    if (title.startsWith(t)) s += 6
    else if (title.includes(t)) s += 4
    else if ((entry.section ?? "").toLowerCase().includes(t)) s += 3
    else s += 1
  }
  if (entry.kind === "page" || entry.kind === "service") s += 1.5
  return s
}

const GROUP_LABEL: Record<Kind, string> = {
  action: "Actions",
  service: "Services",
  page: "Pages",
  section: "Sections",
}

export function CommandPalette({
  open,
  onClose,
  entries,
}: {
  open: boolean
  onClose: () => void
  entries: PaletteEntry[]
}) {
  const router = useRouter()
  const [query, setQuery] = useState("")
  const [active, setActive] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLDivElement>(null)
  const returnFocus = useRef<HTMLElement | null>(null)

  const results = useMemo(() => {
    const tokens = normalizeSearch(query).split(/\s+/).filter(Boolean)
    const scored = entries
      .map((e) => ({ e, s: score(e, tokens) }))
      .filter((x) => x.s >= (tokens.length ? 0 : 1))
      .sort((a, b) => b.s - a.s)
      .slice(0, tokens.length ? 24 : 18)
      .map((x) => x.e)
    // Keep matching services together, ahead of supporting pages and sections.
    const order: Kind[] = tokens.length ? ["service", "page", "section", "action"] : ["action", "service", "page", "section"]
    return order.flatMap((k) => scored.filter((e) => e.kind === k))
  }, [entries, query])

  useEffect(() => {
    if (open) {
      returnFocus.current = document.activeElement as HTMLElement | null
      setQuery("")
      setActive(0)
      requestAnimationFrame(() => inputRef.current?.focus())
      const prev = document.body.style.overflow
      document.body.style.overflow = "hidden"
      return () => {
        document.body.style.overflow = prev
        returnFocus.current?.focus?.()
      }
    }
  }, [open])

  useEffect(() => setActive(0), [query])

  useEffect(() => {
    const el = listRef.current?.querySelector<HTMLElement>(`[data-index="${active}"]`)
    el?.scrollIntoView({ block: "nearest" })
  }, [active])

  if (!open) return null

  const go = (entry: PaletteEntry | undefined) => {
    if (!entry) return
    onClose()
    router.push(entry.href)
  }

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault()
      setActive((i) => Math.min(i + 1, results.length - 1))
    } else if (e.key === "ArrowUp") {
      e.preventDefault()
      setActive((i) => Math.max(i - 1, 0))
    } else if (e.key === "Enter") {
      e.preventDefault()
      go(results[active])
    } else if (e.key === "Escape") {
      e.preventDefault()
      onClose()
    } else if (e.key === "Tab") {
      e.preventDefault()
    }
  }

  let lastKind: Kind | null = null

  return (
    <>
      <div className="s-cmdk-backdrop" onClick={onClose} aria-hidden />
      <div className="s-cmdk" role="dialog" aria-modal="true" aria-label="Search execom" onKeyDown={onKeyDown}>
        <div className="relative">
          <Search className="absolute left-[18px] top-1/2 -translate-y-1/2 h-[18px] w-[18px] text-fog" strokeWidth={1.75} aria-hidden />
          <input
            ref={inputRef}
            className="s-cmdk-input"
            placeholder="Search services, projects, and pages"
            aria-label="Search services, projects, and pages"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            role="combobox"
            aria-expanded="true"
            aria-controls="s-cmdk-list"
            aria-activedescendant={results[active] ? `s-cmdk-opt-${active}` : undefined}
            autoComplete="off"
            spellCheck={false}
          />
        </div>
        <div className="s-cmdk-list" id="s-cmdk-list" role="listbox" ref={listRef}>
          {results.length === 0 && (
            <p className="px-4 py-10 text-center text-[14px] text-fog">
              No matches. Try &ldquo;SR&amp;ED&rdquo;, &ldquo;grants&rdquo;, or &ldquo;portal&rdquo;.
            </p>
          )}
          {results.map((entry, i) => {
            const header = entry.kind !== lastKind ? GROUP_LABEL[entry.kind] : null
            lastKind = entry.kind
            const Icon = entry.kind === "action" ? Zap : entry.kind === "section" ? Hash : FileText
            return (
              <div key={`${entry.kind}-${entry.href}-${i}`}>
                {header && <div className="s-cmdk-group">{header}</div>}
                <button
                  type="button"
                  id={`s-cmdk-opt-${i}`}
                  data-index={i}
                  role="option"
                  aria-selected={i === active}
                  className="s-cmdk-item"
                  onMouseMove={() => setActive(i)}
                  onClick={() => go(entry)}
                >
                  <Icon className="h-4 w-4 shrink-0 text-fog" strokeWidth={1.75} aria-hidden />
                  <span className="truncate">
                    {entry.section ? (
                      <>
                        <span className="text-fog">{entry.title}</span>
                        <span className="mx-1.5 text-fog/60">/</span>
                        <span>{entry.section}</span>
                      </>
                    ) : (
                      entry.title
                    )}
                  </span>
                  {entry.hint && <span className="hint">{entry.hint}</span>}
                  {i === active && <ArrowRight className="h-3.5 w-3.5 shrink-0 text-cyan-300" aria-hidden />}
                </button>
              </div>
            )
          })}
        </div>
        <div className="flex items-center gap-4 border-t border-white/[0.07] px-4 py-2.5 text-[12px] text-fog">
          <span className="inline-flex items-center gap-1.5">
            <span className="s-kbd">↑</span>
            <span className="s-kbd">↓</span> to move
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="s-kbd">
              <CornerDownLeft className="h-3 w-3" aria-hidden />
            </span>
            to open
          </span>
          <span className="ml-auto inline-flex items-center gap-1.5">
            <span className="s-kbd">esc</span> to close
          </span>
        </div>
      </div>
    </>
  )
}
