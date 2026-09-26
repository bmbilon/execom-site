import Link from "next/link"
import type { ReactNode } from "react"
import { ArrowRight, ChevronRight } from "lucide-react"
import { findPage, groupForHref, RELATED } from "@/lib/site/nav"
import { accentTitle, keepRanges, rich } from "./Rich"
import { brandCase } from "./brand"

export type Cta = { label: string; href: string }

/* ------------------------------------------------------------------ */
/* Breadcrumbs                                                         */
/* ------------------------------------------------------------------ */
export function Breadcrumbs({ href, label }: { href: string; label: string }) {
  const group = groupForHref(href)
  const showGroup = group && group.label.toLowerCase() !== label.toLowerCase()
  const trail = [{ label: "execom", href: "/" }, ...(showGroup ? [{ label: group!.label }] : []), { label }]
  return (
    <nav aria-label="Breadcrumb" className="mb-8">
      <ol className="flex flex-wrap items-center gap-1.5 text-[12.5px] text-fog">
        {trail.map((c, i) => (
          <li key={i} className="flex items-center gap-1.5">
            {i > 0 && <ChevronRight className="h-3 w-3 opacity-60" aria-hidden />}
            {"href" in c && c.href ? (
              <Link href={c.href} className="hover:text-snow transition-colors">
                {c.label}
              </Link>
            ) : (
              <span aria-current={i === trail.length - 1 ? "page" : undefined} className={i === trail.length - 1 ? "text-haze" : ""}>
                {c.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  )
}

/* ------------------------------------------------------------------ */
/* Buttons                                                             */
/* ------------------------------------------------------------------ */
export function Actions({ primary, secondary, className = "" }: { primary?: Cta; secondary?: Cta; className?: string }) {
  if (!primary && !secondary) return null
  return (
    <div className={`flex flex-col gap-3 sm:flex-row sm:items-center ${className}`}>
      {primary && (
        <Link href={primary.href} className="s-btn s-btn-primary s-btn-lg">
          {primary.label}
          <ArrowRight className="s-arrow h-4 w-4" aria-hidden />
        </Link>
      )}
      {secondary && (
        <Link href={secondary.href} className="s-btn s-btn-glass s-btn-lg">
          {secondary.label}
        </Link>
      )}
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* Page hero                                                           */
/* ------------------------------------------------------------------ */
export function PageHero({
  href,
  crumb,
  eyebrow,
  title,
  lede,
  primary,
  secondary,
  aside,
  children,
}: {
  href?: string
  crumb?: string
  eyebrow?: string
  title: string
  lede?: string
  primary?: Cta
  secondary?: Cta
  aside?: ReactNode
  children?: ReactNode
}) {
  return (
    <section className="relative -mt-[var(--header-h)] overflow-hidden pt-[calc(var(--header-h)+56px)] pb-20 md:pt-[calc(var(--header-h)+84px)] md:pb-28">
      <div className="s-atmo" aria-hidden />
      <div className="s-horizon" aria-hidden />
      <div className="s-container relative">
        <div className={aside ? "grid gap-14 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)] lg:items-center lg:gap-16" : ""}>
          <div className={aside ? "" : "max-w-[860px]"}>
            {href && crumb && <Breadcrumbs href={href} label={crumb} />}
            {eyebrow && <p className="s-eyebrow s-eyebrow-dot mb-6">{brandCase(eyebrow)}</p>}
            <h1 className="s-display s-display-lg s-gradient-text max-w-[18ch]">{accentTitle(title)}</h1>
            {lede && <p className="s-lede mt-7 max-w-[56ch]">{rich(lede)}</p>}
            <Actions primary={primary} secondary={secondary} className="mt-10" />
            {children}
          </div>
          {aside && <div className="relative">{aside}</div>}
        </div>
      </div>
    </section>
  )
}

/** "In brief" card used as a hero aside on long pages. */
export function InBrief({ points, title = "In brief" }: { points: string[]; title?: string }) {
  return (
    <div className="s-edge p-7 md:p-8">
      <p className="s-eyebrow">{title}</p>
      <ol className="mt-6 grid gap-5">
        {points.map((p, i) => (
          <li key={i} className="grid grid-cols-[28px_1fr] gap-3">
            <span className="s-mono pt-[3px] text-[11px] text-cyan-300">{String(i + 1).padStart(2, "0")}</span>
            <span className="text-[15px] leading-relaxed text-snow/90">{rich(p, `b${i}`)}</span>
          </li>
        ))}
      </ol>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* Section header                                                      */
/* ------------------------------------------------------------------ */
export function SectionHeader({
  eyebrow,
  title,
  lede,
  align = "left",
  className = "",
  action,
}: {
  eyebrow?: string
  title: string
  lede?: string
  align?: "left" | "center"
  className?: string
  action?: ReactNode
}) {
  const center = align === "center"
  return (
    <div
      className={`${center ? "mx-auto text-center max-w-[760px]" : "max-w-[760px]"} ${className}`}
      data-reveal
    >
      {eyebrow && <p className={`s-eyebrow mb-5 ${center ? "justify-center" : ""}`}>{brandCase(eyebrow)}</p>}
      <h2 className="s-h2">{accentTitle(title)}</h2>
      {lede && <p className={`s-lede mt-5 ${center ? "mx-auto" : ""} max-w-[60ch]`}>{rich(lede)}</p>}
      {action && <div className={`mt-7 ${center ? "flex justify-center" : ""}`}>{action}</div>}
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* Closing call to action                                              */
/* ------------------------------------------------------------------ */
export function CtaBand({
  id,
  title,
  body,
  primary,
  secondary,
}: {
  id?: string
  title: string
  body?: string
  primary: Cta
  secondary?: Cta
}) {
  return (
    <section className="s-section-tight s-anchor" id={id}>
      <div className="s-container">
        <div className="s-edge s-spot relative overflow-hidden px-6 py-16 text-center md:px-16 md:py-20" data-reveal>
          <div
            className="s-glow left-1/2 top-0 h-[260px] w-[620px] -translate-x-1/2 -translate-y-1/2 bg-[rgba(25,94,142,0.55)]"
            aria-hidden
          />
          <div
            className="s-glow left-[18%] bottom-[-120px] h-[200px] w-[340px] bg-[rgba(80,196,210,0.14)]"
            aria-hidden
          />
          <div className="relative mx-auto max-w-[720px]">
            <h2 className="s-h2 s-gradient-text">{accentTitle(title)}</h2>
            {body && <p className="s-lede mx-auto mt-5 max-w-[54ch]">{rich(body)}</p>}
            <Actions primary={primary} secondary={secondary} className="mt-10 justify-center sm:justify-center" />
          </div>
        </div>
      </div>
    </section>
  )
}

/* ------------------------------------------------------------------ */
/* Where to next                                                       */
/* ------------------------------------------------------------------ */
export function NextSteps({ from, hrefs, title = "Where to next" }: { from?: string; hrefs?: string[]; title?: string }) {
  const list = (hrefs ?? (from ? RELATED[from] : []) ?? []).map((h) => findPage(h)).filter(Boolean)
  if (list.length === 0) return null
  return (
    <section className="s-section-tight pt-4">
      <div className="s-container">
        <div className="mb-8 flex items-end justify-between gap-6" data-reveal>
          <div>
            <p className="s-eyebrow mb-4">Keep going</p>
            <h2 className="font-display text-[1.9rem] leading-[1.1] tracking-[-0.015em] text-snow md:text-[2.2rem]">{title}</h2>
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {list.map((p, i) => {
            const group = groupForHref(p!.href!)
            return (
              <Link
                key={p!.href}
                href={p!.href!}
                className="s-edge s-spot s-card-link group flex min-h-[190px] flex-col justify-between p-6"
                data-reveal
                style={{ ["--d" as string]: `${i * 70}ms` }}
              >
                <div>
                  <p className="s-mono text-[10.5px] uppercase tracking-[0.14em] text-fog">{group?.label ?? "Company"}</p>
                  <p className="mt-3 text-[1.2rem] font-semibold tracking-[-0.012em] text-snow">{p!.label}</p>
                  <p className="mt-2 text-[14px] leading-relaxed text-haze">{keepRanges(p!.description)}</p>
                </div>
                <span className="s-link mt-6 text-[13.5px]">
                  Open
                  <ArrowRight className="h-3.5 w-3.5" aria-hidden />
                </span>
              </Link>
            )
          })}
        </div>
      </div>
    </section>
  )
}
