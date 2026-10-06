"use client"

import dynamic from "next/dynamic"
import Link from "next/link"
import { useRef, useState } from "react"
import { ArrowRight, Calculator } from "lucide-react"
import { Accordion, Disclosure } from "../Interactive"
import { keepRanges } from "../Rich"

/* ------------------------------------------------------------------ */
/* Startup cost calculator, loaded only when opened                    */
/* ------------------------------------------------------------------ */
const ExecomCalculator = dynamic(() => import("@/components/calculator/ExecomCalculator"), {
  ssr: false,
  loading: () => (
    <div className="grid gap-4 py-2" aria-busy="true">
      {[0, 1, 2].map((i) => (
        <div key={i} className="grid grid-cols-2 gap-4">
          <div className="h-16 animate-pulse rounded-xl bg-white/[0.04]" />
          <div className="h-16 animate-pulse rounded-xl bg-white/[0.04]" />
        </div>
      ))}
    </div>
  ),
})

export function CalculatorPanel() {
  const [loaded, setLoaded] = useState(false)
  return (
    <div className="s-edge relative overflow-hidden p-6 md:p-10" data-reveal>
      <div className="s-glow right-[-80px] top-[-120px] h-[260px] w-[420px] bg-[rgba(25,94,142,0.45)]" aria-hidden />
      <div className="relative flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div className="flex items-start gap-4">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04]">
            <Calculator className="h-5 w-5 text-cyan-300" strokeWidth={1.6} aria-hidden />
          </span>
          <div>
            <p className="text-[1.15rem] font-semibold tracking-[-0.01em] text-snow">Startup cost calculator</p>
            <p className="mt-1 max-w-[52ch] text-[14.5px] leading-relaxed text-haze">
              Compare the conventional advisory path with execom, using province-level benchmarks. Results show without sign-up.
            </p>
          </div>
        </div>
      </div>
      <div className="relative mt-7">
        <Disclosure
          id="startup-cost-calculator"
          label="Open the calculator"
          openLabel="Hide the calculator"
          triggerClassName="h-11 px-5 text-[14.5px]"
          onOpen={() => setLoaded(true)}
        >
          <div className="rounded-2xl border border-white/[0.07] bg-ink-900/60 p-5 md:p-8">
            {loaded && <ExecomCalculator hideHeader />}
          </div>
        </Disclosure>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* Capability explorer: master/detail on desktop, stacked on mobile    */
/* ------------------------------------------------------------------ */
export type Capability = {
  title: string
  description: string
  includes: string[]
  cta: { label: string; href: string }
}

/** Set `reveal={false}` when the explorer sits inside a collapsed Disclosure, where scroll reveal would never fire. */
export function CapabilityExplorer({ items, reveal = true }: { items: Capability[]; reveal?: boolean }) {
  const revealAttr = reveal ? { "data-reveal": "" } : {}
  const [active, setActive] = useState(0)
  const refs = useRef<(HTMLButtonElement | null)[]>([])
  const cap = items[active]

  const onKey = (e: React.KeyboardEvent, i: number) => {
    let next = i
    if (e.key === "ArrowDown" || e.key === "ArrowRight") next = (i + 1) % items.length
    else if (e.key === "ArrowUp" || e.key === "ArrowLeft") next = (i - 1 + items.length) % items.length
    else return
    e.preventDefault()
    setActive(next)
    refs.current[next]?.focus()
  }

  return (
    <>
    {/* Mobile and tablet: expandable list */}
    <div className="lg:hidden" {...revealAttr}>
      <Accordion
        numbered
        items={items.map((c) => ({
          title: c.title,
          content: (
            <>
              <p>{keepRanges(c.description)}</p>
              <ul className="mt-4 flex flex-wrap gap-2">
                {c.includes.map((t) => (
                  <li key={t} className="rounded-full border border-white/[0.1] bg-white/[0.03] px-3 py-1 text-[12.5px] text-snow/85">
                    {t}
                  </li>
                ))}
              </ul>
              <Link href={c.cta.href} className="s-link mt-5 text-[14px]">
                {c.cta.label}
                <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
            </>
          ),
        }))}
      />
    </div>

    {/* Desktop: master / detail */}
    <div className="hidden gap-4 lg:grid lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-6" {...revealAttr}>
      <div role="tablist" aria-orientation="vertical" className="grid gap-1.5">
        {items.map((c, i) => {
          const on = i === active
          return (
            <button
              key={c.title}
              ref={(el) => {
                refs.current[i] = el
              }}
              type="button"
              role="tab"
              id={`cap-tab-${i}`}
              aria-selected={on}
              aria-controls="cap-panel"
              tabIndex={on ? 0 : -1}
              onClick={() => setActive(i)}
              onMouseEnter={() => setActive(i)}
              onKeyDown={(e) => onKey(e, i)}
              className={`group flex items-center gap-4 rounded-xl border px-4 py-3.5 text-left transition-all duration-200 ${
                on
                  ? "border-white/[0.12] bg-white/[0.05] shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]"
                  : "border-transparent hover:bg-white/[0.025]"
              }`}
            >
              <span className={`s-mono text-[11px] ${on ? "text-cyan-300" : "text-fog"}`}>{String(i + 1).padStart(2, "0")}</span>
              <span className={`text-[15.5px] font-medium tracking-[-0.008em] ${on ? "text-snow" : "text-haze"}`}>{c.title}</span>
              <ArrowRight
                className={`ml-auto h-4 w-4 transition-all duration-200 ${on ? "translate-x-0 text-cyan-300 opacity-100" : "-translate-x-1 opacity-0"}`}
                aria-hidden
              />
            </button>
          )
        })}
      </div>

      <div
        id="cap-panel"
        role="tabpanel"
        aria-labelledby={`cap-tab-${active}`}
        className="s-edge s-spot relative min-h-[340px] overflow-hidden p-7 md:p-10"
      >
        <div className="s-glow right-[-60px] top-[-80px] h-[220px] w-[320px] bg-[rgba(25,94,142,0.4)]" aria-hidden />
        <div key={active} className="s-fade-swap relative flex h-full flex-col">
          <p className="s-eyebrow">
            {String(active + 1).padStart(2, "0")} / {String(items.length).padStart(2, "0")}
          </p>
          <h3 className="mt-5 font-display text-[2rem] leading-[1.08] tracking-[-0.018em] text-snow md:text-[2.4rem]">{cap.title}</h3>
          <p className="mt-4 max-w-[56ch] text-[15.5px] leading-relaxed text-haze">{keepRanges(cap.description)}</p>
          <ul className="mt-6 flex flex-wrap gap-2">
            {cap.includes.map((t) => (
              <li key={t} className="rounded-full border border-white/[0.1] bg-white/[0.03] px-3 py-1 text-[12.5px] text-snow/85">
                {t}
              </li>
            ))}
          </ul>
          <div className="mt-auto pt-8">
            <Link href={cap.cta.href} className="s-link">
              {cap.cta.label}
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
          </div>
        </div>
      </div>
    </div>
    </>
  )
}

/* ------------------------------------------------------------------ */
/* Operator model: interactive four-stage stepper                      */
/* ------------------------------------------------------------------ */
export type Stage = { title: string; income: string; description: string; outcome: string }

export function OperatorModel({ stages }: { stages: Stage[] }) {
  const [active, setActive] = useState(0)
  const refs = useRef<(HTMLButtonElement | null)[]>([])
  const s = stages[active]
  const pct = (active / (stages.length - 1)) * 100

  const onKey = (e: React.KeyboardEvent, i: number) => {
    let next = i
    if (e.key === "ArrowRight") next = Math.min(stages.length - 1, i + 1)
    else if (e.key === "ArrowLeft") next = Math.max(0, i - 1)
    else return
    e.preventDefault()
    setActive(next)
    refs.current[next]?.focus()
  }

  return (
    <div data-reveal>
      {/* Track */}
      <div className="relative">
        <div className="absolute left-[12.5%] right-[12.5%] top-[22px] hidden h-px bg-white/10 md:block" aria-hidden>
          <div
            className="h-full origin-left bg-gradient-to-r from-navy-400 to-cyan-500 shadow-[0_0_10px_rgba(80,196,210,0.6)] transition-transform duration-500 ease-premium"
            style={{ transform: `scaleX(${pct / 100})` }}
          />
        </div>
        <div role="tablist" className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-0">
          {stages.map((st, i) => {
            const on = i === active
            const passed = i <= active
            return (
              <button
                key={st.title}
                ref={(el) => {
                  refs.current[i] = el
                }}
                type="button"
                role="tab"
                aria-selected={on}
                aria-controls="op-panel"
                tabIndex={on ? 0 : -1}
                onClick={() => setActive(i)}
                onKeyDown={(e) => onKey(e, i)}
                className={`group relative flex flex-col items-start gap-3 rounded-xl border p-4 text-left transition-colors md:items-center md:border-0 md:bg-transparent md:p-0 md:text-center ${
                  on ? "border-cyan-500/40 bg-cyan-500/[0.06]" : "border-white/[0.08] bg-white/[0.02]"
                }`}
              >
                <span
                  className={`relative z-[1] flex h-11 w-11 items-center justify-center rounded-full border s-mono text-[12px] transition-all duration-300 ${
                    on
                      ? "border-cyan-400/70 bg-ink-800 text-cyan-200 shadow-[0_0_0_6px_rgba(80,196,210,0.08),0_0_24px_rgba(80,196,210,0.45)]"
                      : passed
                        ? "border-cyan-500/40 bg-ink-850 text-cyan-300"
                        : "border-white/15 bg-ink-850 text-fog group-hover:border-white/30"
                  }`}
                >
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="md:mt-2">
                  <span className={`block text-[15px] font-semibold tracking-[-0.01em] ${on ? "text-snow" : "text-haze"}`}>{st.title}</span>
                  <span className="mt-1 block s-mono text-[10.5px] uppercase tracking-[0.14em] text-fog">Income: {st.income}</span>
                </span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Detail */}
      <div id="op-panel" role="tabpanel" className="s-edge mt-10 overflow-hidden">
        <div key={active} className="s-fade-swap grid md:grid-cols-2">
          <div className="p-7 md:p-9">
            <p className="s-eyebrow">How it works</p>
            <p className="mt-4 font-display text-[1.55rem] leading-[1.25] tracking-[-0.012em] text-snow">{s.description}</p>
          </div>
          <div className="border-t border-white/[0.07] p-7 md:border-l md:border-t-0 md:p-9">
            <p className="s-eyebrow s-eyebrow-muted">Typical economic outcome</p>
            <p className="mt-4 text-[15px] leading-relaxed text-haze">{s.outcome}</p>
            <div className="mt-6 flex gap-2">
              <button
                type="button"
                className="s-btn s-btn-glass s-btn-sm"
                onClick={() => setActive((a) => Math.max(0, a - 1))}
                disabled={active === 0}
                aria-label="Previous stage"
              >
                Previous
              </button>
              <button
                type="button"
                className="s-btn s-btn-glass s-btn-sm"
                onClick={() => setActive((a) => Math.min(stages.length - 1, a + 1))}
                disabled={active === stages.length - 1}
                aria-label="Next stage"
              >
                Next stage
                <ArrowRight className="s-arrow h-3.5 w-3.5" aria-hidden />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* Commercialization path: five-stage explorer                         */
/* ------------------------------------------------------------------ */
export type PathStage = {
  title: string
  headline: string
  description: string
  work: string[]
  gate: string
  tag?: string
  links: { label: string; href: string }[]
}

export type PathStart = { label: string; stage: number }

function StageLinks({ links }: { links: PathStage["links"] }) {
  return (
    <div className="flex flex-wrap gap-x-6 gap-y-2">
      {links.map((l) => (
        <Link key={l.href + l.label} href={l.href} className="s-link text-[14px]">
          {l.label}
          <ArrowRight className="h-4 w-4" aria-hidden />
        </Link>
      ))}
    </div>
  )
}

function Chips({ items }: { items: string[] }) {
  return (
    <ul className="flex flex-wrap gap-2">
      {items.map((t) => (
        <li key={t} className="rounded-full border border-white/[0.1] bg-white/[0.03] px-3 py-1 text-[12.5px] text-snow/85">
          {t}
        </li>
      ))}
    </ul>
  )
}

export function PathExplorer({ stages, starts }: { stages: PathStage[]; starts: PathStart[] }) {
  const [active, setActive] = useState(0)
  const refs = useRef<(HTMLButtonElement | null)[]>([])
  const s = stages[active]
  const last = stages.length - 1
  const pct = active / last
  const inset = `${50 / stages.length}%`

  const onKey = (e: React.KeyboardEvent, i: number) => {
    let next = i
    if (e.key === "ArrowRight") next = Math.min(last, i + 1)
    else if (e.key === "ArrowLeft") next = Math.max(0, i - 1)
    else return
    e.preventDefault()
    setActive(next)
    refs.current[next]?.focus()
  }

  return (
    <>
      {/* Mobile and tablet: expandable list */}
      <div className="lg:hidden" data-reveal>
        <Accordion
          numbered
          defaultOpen={[0]}
          items={stages.map((st) => ({
            title: st.title,
            content: (
              <>
                <p className="font-display text-[1.3rem] leading-[1.25] tracking-[-0.012em] text-snow">{st.headline}</p>
                <p className="mt-3">{keepRanges(st.description)}</p>
                <div className="mt-4">
                  <Chips items={st.work} />
                </div>
                <p className="mt-5 border-l border-cyan-500/40 pl-4 text-[14px] leading-relaxed text-snow/90">
                  <span className="s-mono mb-1 block text-[10.5px] uppercase tracking-[0.14em] text-cyan-300">Stage gate</span>
                  {st.gate}
                </p>
                <div className="mt-5">
                  <StageLinks links={st.links} />
                </div>
              </>
            ),
          }))}
        />
      </div>

      {/* Desktop: stepper with detail panel */}
      <div className="hidden lg:block" data-reveal>
        <div className="mb-10 flex flex-wrap items-center gap-2.5">
          <span className="s-mono mr-1 text-[10.5px] uppercase tracking-[0.14em] text-fog">Where are you now</span>
          {starts.map((st) => {
            const on = st.stage === active
            return (
              <button
                key={st.label}
                type="button"
                onClick={() => setActive(st.stage)}
                aria-pressed={on}
                className={`rounded-full border px-3.5 py-1.5 text-[13px] transition-colors duration-200 ${
                  on
                    ? "border-cyan-500/50 bg-cyan-500/[0.08] text-snow"
                    : "border-white/[0.1] bg-white/[0.02] text-haze hover:border-white/25 hover:text-snow"
                }`}
              >
                {st.label}
              </button>
            )
          })}
        </div>

        <div className="relative">
          <div className="absolute top-[22px] h-px bg-white/10" style={{ left: inset, right: inset }} aria-hidden>
            <div
              className="h-full origin-left bg-gradient-to-r from-navy-400 to-cyan-500 shadow-[0_0_10px_rgba(80,196,210,0.6)] transition-transform duration-500 ease-premium"
              style={{ transform: `scaleX(${pct})` }}
            />
          </div>
          <div role="tablist" aria-label="Commercialization path" className="grid" style={{ gridTemplateColumns: `repeat(${stages.length}, minmax(0, 1fr))` }}>
            {stages.map((st, i) => {
              const on = i === active
              const passed = i <= active
              return (
                <button
                  key={st.title}
                  ref={(el) => {
                    refs.current[i] = el
                  }}
                  type="button"
                  role="tab"
                  id={`path-tab-${i}`}
                  aria-selected={on}
                  aria-controls="path-panel"
                  tabIndex={on ? 0 : -1}
                  onClick={() => setActive(i)}
                  onKeyDown={(e) => onKey(e, i)}
                  className="group relative flex flex-col items-center gap-3 text-center"
                >
                  <span
                    className={`relative z-[1] flex h-11 w-11 items-center justify-center rounded-full border s-mono text-[12px] transition-all duration-300 ${
                      on
                        ? "border-cyan-400/70 bg-ink-800 text-cyan-200 shadow-[0_0_0_6px_rgba(80,196,210,0.08),0_0_24px_rgba(80,196,210,0.45)]"
                        : passed
                          ? "border-cyan-500/40 bg-ink-850 text-cyan-300"
                          : "border-white/15 bg-ink-850 text-fog group-hover:border-white/30"
                    }`}
                  >
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className={`text-[15px] font-semibold tracking-[-0.01em] transition-colors ${on ? "text-snow" : "text-haze group-hover:text-snow"}`}>
                    {st.title}
                  </span>
                </button>
              )
            })}
          </div>
        </div>

        <div id="path-panel" role="tabpanel" aria-labelledby={`path-tab-${active}`} className="s-edge s-spot relative mt-10 overflow-hidden">
          <div className="s-glow right-[-80px] top-[-100px] h-[240px] w-[380px] bg-[rgba(25,94,142,0.4)]" aria-hidden />
          <div key={active} className="s-fade-swap relative grid min-h-[380px] grid-cols-[minmax(0,7fr)_minmax(0,5fr)]">
            <div className="flex flex-col p-10">
              <div className="flex items-center gap-3">
                <p className="s-eyebrow">
                  Stage {String(active + 1).padStart(2, "0")} / {String(stages.length).padStart(2, "0")}
                </p>
                {s.tag && <span className="s-tag">{s.tag}</span>}
              </div>
              <h3 className="mt-5 max-w-[22ch] font-display text-[2.3rem] leading-[1.08] tracking-[-0.018em] text-snow">{s.headline}</h3>
              <p className="mt-4 max-w-[56ch] text-[15.5px] leading-relaxed text-haze">{keepRanges(s.description)}</p>
              <div className="mt-auto pt-8">
                <StageLinks links={s.links} />
              </div>
            </div>
            <div className="flex flex-col border-l border-white/[0.07] p-10">
              <p className="s-eyebrow s-eyebrow-muted">What gets done</p>
              <div className="mt-4">
                <Chips items={s.work} />
              </div>
              <div className="mt-7 rounded-xl border border-cyan-500/25 bg-cyan-500/[0.05] p-5">
                <p className="s-mono text-[10.5px] uppercase tracking-[0.14em] text-cyan-300">Stage gate</p>
                <p className="mt-2 text-[15px] leading-relaxed text-snow/90">{s.gate}</p>
              </div>
              <div className="mt-auto flex gap-2 pt-7">
                <button
                  type="button"
                  className="s-btn s-btn-glass s-btn-sm"
                  onClick={() => setActive((a) => Math.max(0, a - 1))}
                  disabled={active === 0}
                  aria-label="Previous stage"
                >
                  Previous
                </button>
                <button
                  type="button"
                  className="s-btn s-btn-glass s-btn-sm"
                  onClick={() => setActive((a) => Math.min(last, a + 1))}
                  disabled={active === last}
                  aria-label="Next stage"
                >
                  Next stage
                  <ArrowRight className="s-arrow h-3.5 w-3.5" aria-hidden />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
