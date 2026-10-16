import type { Metadata } from "next"
import { ArrowRight } from "lucide-react"
import { NextSteps, PageHero, SectionHeader } from "@/components/site/Primitives"
import { Accordion, ChapterBar, Disclosure, Matrix } from "@/components/site/Interactive"
import { DecisionForm } from "@/components/site/engage/DecisionForm"
import { RoiModel } from "@/components/site/software-independence/RoiModel"
import { accentTitle, keepRanges } from "@/components/site/Rich"
import {
  CASES,
  CONDITIONS,
  CONTROLS,
  CURATIVE,
  FAQ,
  FIT_PROFILE,
  GAINSHARE_RULES,
  MARKET_SIGNAL,
  OUTCOMES,
  PHASES,
  SCORECARD,
  SOURCES,
  STRONG_SIGNALS,
  TIERS,
  WEAK_SIGNALS,
  type PublicCase,
} from "@/lib/site/softwareIndependence"

const HREF = "/software-independence"

export const metadata: Metadata = {
  title: "Software Independence | execom",
  description:
    "Before the next six-figure software renewal: execom audits the platform, models three-year build-versus-buy economics, and replaces only the workflows worth owning. Blueprint from US$25,000 in 4–6 weeks.",
  alternates: { canonical: HREF },
}

const CHAPTERS = [
  { id: "cases", nav: "Who did it" },
  { id: "roi", nav: "ROI model" },
  { id: "method", nav: "How it works" },
  { id: "pricing", nav: "Pricing" },
  { id: "fit", nav: "Fit" },
  { id: "faq", nav: "Questions" },
  { id: "start", nav: "Start" },
]

const SPECS = [
  { label: "Blueprint, USD", value: "From $25,000" },
  { label: "Time to a decision", value: "4–6 weeks" },
  { label: "Possible answers", value: "Keep, renegotiate, consolidate, replace" },
  { label: "Best first target", value: "One platform over $150k a year" },
]

const BRING = [
  "The platform and the modules you pay for",
  "Annual cost and the renewal date",
  "Licensed users against active users, roughly",
  "Who administers it, and what that costs",
  "Where the real process runs today",
]

const FAQ_JSON_LD = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: FAQ.map((f) => ({
    "@type": "Question",
    name: f.q,
    acceptedAnswer: { "@type": "Answer", text: f.a },
  })),
}

/** Superscript links to the numbered sources at the foot of the page. */
function Src({ n }: { n: number[] }) {
  return (
    <sup className="ml-0.5 whitespace-nowrap font-sans text-[11px] font-normal not-italic tracking-normal">
      {n.map((s, i) => (
        <span key={s}>
          {i > 0 && <span className="text-fog">,</span>}
          <a href="#sources" className="text-cyan-300 hover:text-cyan-200" aria-label={`Source ${s}`}>
            {s}
          </a>
        </span>
      ))}
    </sup>
  )
}

function SignalCard() {
  return (
    <div className="s-edge relative overflow-hidden p-7 md:p-8">
      <div className="s-glow right-[-70px] top-[-90px] h-[220px] w-[320px] bg-[rgba(25,94,142,0.5)]" aria-hidden />
      <div className="relative">
        <p className="s-eyebrow">The signal</p>
        <p className="s-num mt-6 font-display text-[3.1rem] leading-none tracking-[-0.025em] text-snow">$600,000</p>
        <p className="s-mono mt-3 text-[10.5px] uppercase tracking-[0.14em] text-fog">A year, cancelled</p>
        <p className="mt-5 text-[15px] leading-relaxed text-snow/90">
          Curative&apos;s Salesforce CRM contract. The health insurer replaced it with a CRM it built in about two months
          with AI-assisted coding, and now runs its agents inside it.
          <Src n={[1, 2]} />
        </p>
        <dl className="mt-6 grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-white/[0.08] bg-white/[0.08]">
          <div className="bg-ink-900 p-4">
            <dt className="s-mono text-[10px] uppercase tracking-[0.14em] text-fog">Build time</dt>
            <dd className="s-num mt-1.5 text-[1.05rem] font-semibold text-snow">~2 months</dd>
          </div>
          <div className="bg-ink-900 p-4">
            <dt className="s-mono text-[10px] uppercase tracking-[0.14em] text-fog">SaaS cut targeted</dt>
            <dd className="s-num mt-1.5 text-[1.05rem] font-semibold text-snow">~80%</dd>
          </div>
        </dl>
        <a href="#cases" className="s-link mt-6 text-[13.5px]">
          Read the cases
          <ArrowRight className="h-3.5 w-3.5" aria-hidden />
        </a>
      </div>
    </div>
  )
}

function CaseCard({ c, i }: { c: PublicCase; i: number }) {
  return (
    <article
      className="s-edge s-spot flex flex-col p-6 md:p-7"
      data-reveal
      style={{ ["--d" as string]: `${(i % 3) * 70}ms` }}
      aria-labelledby={`case-${i}`}
    >
      <p className="s-mono text-[10.5px] uppercase tracking-[0.14em] text-fog">{c.context}</p>
      <h3 id={`case-${i}`} className="mt-3 text-[1.25rem] font-semibold tracking-[-0.012em] text-snow">
        {c.name}
        <Src n={c.sources} />
      </h3>
      <p className="mt-4 text-[14px] leading-relaxed text-snow/90">
        <span className="s-mono mr-2 text-[10px] uppercase tracking-[0.14em] text-cyan-300">{c.replacedLabel ?? "Replaced"}</span>
        {c.replaced}
      </p>
      <p className="mt-2 text-[14px] leading-relaxed text-haze">{c.built}</p>
      <div className="mt-6 grid gap-4 border-t border-white/[0.07] pt-5">
        {c.stats.map((s) => (
          <div key={s.label}>
            <p className="s-num font-display text-[1.75rem] leading-none tracking-[-0.02em] text-snow">{keepRanges(s.value)}</p>
            <p className="mt-1.5 text-[13px] leading-snug text-haze">{s.label}</p>
          </div>
        ))}
      </div>
      {c.quote && (
        <blockquote className="mt-auto pt-6">
          <p className="border-l border-cyan-500/40 pl-4 text-[14px] italic leading-relaxed text-snow/85">
            &ldquo;{c.quote.text}&rdquo;
          </p>
          <footer className="mt-2 pl-4 text-[12px] text-fog">{c.quote.by}</footer>
        </blockquote>
      )}
    </article>
  )
}

export default function SoftwareIndependencePage() {
  return (
    <>
      <PageHero
        href={HREF}
        crumb="Software independence"
        eyebrow="execom Software Independence"
        title="Keep it, cut it, or *own it*."
        lede="Before the next six-figure renewal, execom audits the platform, proves whether to keep, renegotiate or replace it, and builds the AI-native system where the numbers hold. A decision and a working proof in 4–6 weeks."
        primary={{ label: "Model your renewal", href: "#roi" }}
        secondary={{ label: "See pricing", href: "#pricing" }}
        aside={<SignalCard />}
      >
        <p className="s-mono mt-7 text-[11px] uppercase tracking-[0.14em] text-fog">
          Blueprint from US$25,000 <span className="px-1.5 text-white/20">/</span> No cancellation before parallel run
        </p>
      </PageHero>

      <ChapterBar chapters={CHAPTERS} label="Software independence" />

      {/* At a glance */}
      <section className="pt-10 md:pt-14" aria-label="At a glance">
        <div className="s-container">
          <dl
            className="grid grid-cols-2 gap-px overflow-hidden rounded-[20px] border border-white/[0.08] bg-white/[0.08] md:grid-cols-4"
            data-reveal
          >
            {SPECS.map((s) => (
              <div key={s.label} className="bg-ink-900 p-5 md:p-7">
                <dt className="s-mono text-[10.5px] uppercase tracking-[0.14em] text-fog">{s.label}</dt>
                <dd className="mt-2.5 font-display text-[1.15rem] leading-snug tracking-[-0.01em] text-snow md:text-[1.4rem]">
                  {keepRanges(s.value)}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* Cases */}
      <section id="cases" className="s-anchor s-section relative overflow-hidden overflow-clip">
        <div className="s-glow left-1/2 top-40 h-[380px] w-[820px] -translate-x-1/2 bg-[rgba(25,94,142,0.18)]" aria-hidden />
        <div className="s-container relative">
          <SectionHeader
            eyebrow="Who did it"
            title="Six companies that *built instead of renting*."
            lede="From a 45-person startup to a 75,000-person pharma company, each decided a workflow was worth owning and built it. Figures are as publicly reported."
          />

          {/* Curative, featured */}
          <article className="s-edge s-spot relative mt-14 overflow-hidden p-6 md:p-9" data-reveal aria-labelledby="case-curative">
            <div className="s-glow left-[-80px] top-[-120px] h-[260px] w-[420px] bg-[rgba(80,196,210,0.12)]" aria-hidden />
            <div className="relative grid gap-8 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-12">
              <div>
                <div className="flex flex-wrap items-center gap-3">
                  <span className="s-tag s-tag-cyan">The case that started it</span>
                  <span className="s-mono text-[10.5px] uppercase tracking-[0.14em] text-fog">{CURATIVE.context}</span>
                </div>
                <h3 id="case-curative" className="mt-5 font-display text-[2.2rem] leading-none tracking-[-0.02em] text-snow">
                  {CURATIVE.name}
                  <Src n={CURATIVE.sources} />
                </h3>
                <p className="mt-5 text-[15px] leading-relaxed text-snow/90">
                  <span className="s-mono mr-2 text-[10px] uppercase tracking-[0.14em] text-cyan-300">Replaced</span>
                  {CURATIVE.replaced}
                </p>
                <p className="mt-2 text-[15px] leading-relaxed text-haze">{CURATIVE.built}</p>
              </div>
              <div className="grid gap-px self-start overflow-hidden rounded-[16px] border border-white/[0.08] bg-white/[0.08] sm:grid-cols-3">
                {CURATIVE.stats.map((s) => (
                  <div key={s.label} className="bg-ink-900 p-5">
                    <p className="s-num font-display text-[1.6rem] leading-[1.1] tracking-[-0.02em] text-snow md:text-[1.75rem]">
                      {keepRanges(s.value)}
                    </p>
                    <p className="mt-2 text-[13px] leading-snug text-haze">{s.label}</p>
                  </div>
                ))}
              </div>
            </div>
            {CURATIVE.note && (
              <p className="relative mt-8 max-w-[90ch] border-t border-white/[0.07] pt-6 text-[14px] leading-relaxed text-haze">
                {CURATIVE.note}
              </p>
            )}
          </article>

          <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {CASES.map((c, i) => (
              <CaseCard key={c.name} c={c} i={i} />
            ))}
            <div className="s-glass flex flex-col p-6 md:p-7" data-reveal style={{ ["--d" as string]: "140ms" }}>
              <p className="s-mono text-[10.5px] uppercase tracking-[0.14em] text-fog">Across the market</p>
              <div className="mt-5 grid gap-6">
                {MARKET_SIGNAL.stats.map((s) => (
                  <div key={s.value}>
                    <p className="s-num font-display text-[2.6rem] leading-none tracking-[-0.025em] text-cyan-200">{s.value}</p>
                    <p className="mt-2 text-[14px] leading-snug text-snow/90">{s.label}</p>
                  </div>
                ))}
              </div>
              <p className="mt-auto pt-6 text-[12.5px] leading-relaxed text-fog">
                {MARKET_SIGNAL.note}
                <Src n={[MARKET_SIGNAL.source]} />
              </p>
            </div>
          </div>

          {/* What they have in common */}
          <div className="mt-16 border-t border-white/[0.07] pt-12" data-reveal>
            <h3 className="font-display text-[1.7rem] leading-tight tracking-[-0.015em] text-snow">What they have in common</h3>
            <ol className="mt-8 grid gap-8 md:grid-cols-3 md:gap-6">
              {CONDITIONS.map((c, i) => (
                <li key={c.title} className="grid grid-cols-[36px_minmax(0,1fr)] gap-3">
                  <span className="s-mono pt-[3px] text-[11px] text-cyan-300">{String(i + 1).padStart(2, "0")}</span>
                  <div>
                    <p className="text-[1.05rem] font-semibold tracking-[-0.01em] text-snow">{c.title}</p>
                    <p className="mt-1.5 text-[14.5px] leading-relaxed text-haze">{c.text}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      {/* ROI model */}
      <section id="roi" className="s-anchor s-section-tight">
        <div className="s-container">
          <SectionHeader
            eyebrow="ROI model"
            title="Three years of rent against *three years of owning*."
            lede="Move the sliders to your platform. The model opens on an illustrative case: a $600,000-a-year platform, a $250,000 build and $180,000 a year to run the replacement. Ownership is costed in, never assumed free."
            className="mb-12"
          />
          <RoiModel />
        </div>
      </section>

      {/* Method */}
      <section id="method" className="s-anchor s-section relative overflow-hidden overflow-clip">
        <div className="s-container relative">
          <SectionHeader
            eyebrow="How it works"
            title="Four possible answers. *One evidence base*."
            lede="The Blueprint finds the best economically justified path, and that includes keeping the incumbent when replacement is not the prudent call. The software is replaced only when the economics, the controls and the operating owner are all in place."
          />
          <div className="mt-12 grid gap-3 sm:grid-cols-2 lg:grid-cols-4" data-reveal>
            {OUTCOMES.map((o, i) => (
              <div key={o.title} className={`p-5 ${i === OUTCOMES.length - 1 ? "s-edge rbe-pick" : "s-glass"}`}>
                <p className="s-mono text-[10.5px] uppercase tracking-[0.14em] text-cyan-300">{String(i + 1).padStart(2, "0")}</p>
                <p className="mt-3 text-[1.05rem] font-semibold tracking-[-0.01em] text-snow">{o.title}</p>
                <p className="mt-1.5 text-[14px] leading-relaxed text-haze">{o.text}</p>
              </div>
            ))}
          </div>

          <ol className="mt-16 grid gap-x-8 gap-y-10 md:grid-cols-2 lg:grid-cols-3">
            {PHASES.map((p, i) => (
              <li
                key={p.title}
                className="grid grid-cols-[48px_minmax(0,1fr)] gap-x-4"
                data-reveal
                style={{ ["--d" as string]: `${(i % 3) * 80}ms` }}
              >
                <span className="s-mono flex h-12 w-12 items-center justify-center rounded-2xl border border-white/[0.12] bg-ink-850 text-[13px] text-cyan-300 shadow-[0_0_30px_rgba(80,196,210,0.14)]">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div className="pt-1">
                  <p className="text-[1.08rem] font-semibold tracking-[-0.012em] text-snow">{p.title}</p>
                  <p className="mt-1.5 text-[14.5px] leading-relaxed text-haze">{keepRanges(p.text)}</p>
                </div>
              </li>
            ))}
          </ol>

          <div className="mt-14 max-w-[880px]" data-reveal>
            <Disclosure id="controls" label="The control baseline every replacement ships with" openLabel="Hide the control baseline" meta={`${CONTROLS.length} controls`}>
              <ul className="rbe-list max-w-[72ch] text-[14.5px]">
                {CONTROLS.map((c) => (
                  <li key={c}>{c}</li>
                ))}
              </ul>
            </Disclosure>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="s-anchor s-section relative overflow-hidden overflow-clip">
        <div className="s-glow left-1/2 top-40 h-[420px] w-[900px] -translate-x-1/2 bg-[rgba(25,94,142,0.2)]" aria-hidden />
        <div className="s-container relative">
          <SectionHeader
            eyebrow="Pricing"
            title="Three ways in. *Start with the decision*."
            lede="Every engagement runs on the same evidence. Choose by how much of the build and the operation you want execom to carry."
          />
          <div className="mt-12 grid gap-4 lg:grid-cols-3">
            {TIERS.map((t, i) => (
              <article
                key={t.id}
                className={`s-edge s-spot flex flex-col p-6 md:p-7${t.pick ? " rbe-pick" : ""}`}
                data-reveal
                style={{ ["--d" as string]: `${i * 70}ms` }}
                aria-labelledby={`tier-${t.id}`}
              >
                <div className="flex h-[22px] items-center justify-between gap-2">
                  <span className="s-mono text-[10.5px] uppercase tracking-[0.14em] text-fog">Tier {t.n}</span>
                  {t.pick && <span className="s-tag s-tag-cyan">Start here</span>}
                </div>
                <h3 id={`tier-${t.id}`} className="mt-4 font-display text-[1.85rem] leading-none tracking-[-0.015em] text-snow">
                  {t.name}
                </h3>
                <p className="mt-3 text-[13.5px] leading-snug text-haze lg:min-h-[2.8em]">{t.forWho}</p>

                <div className="mt-6 border-t border-white/[0.07] pt-5">
                  <p className="s-num font-display text-[2rem] leading-none tracking-[-0.025em] text-snow xl:text-[2.2rem]">
                    {keepRanges(t.fee)}
                  </p>
                  <p className="s-mono mt-2.5 text-[10.5px] uppercase tracking-[0.12em] text-fog">USD · {t.feeNote}</p>
                  {t.recurring && <p className="s-num mt-2.5 text-[13.5px] text-haze">+ {keepRanges(t.recurring)}</p>}
                  <p className="mt-4 inline-flex items-center gap-2 rounded-full border border-white/[0.1] px-3 py-1 text-[12.5px] text-snow/90">
                    <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(80,196,210,0.7)]" aria-hidden />
                    {keepRanges(t.duration)}
                  </p>
                </div>

                <p className="mt-6 text-[15px] leading-relaxed text-snow">{t.promise}</p>
                <ul className="rbe-list mt-4">
                  {t.includes.map((h) => (
                    <li key={h}>{h}</li>
                  ))}
                </ul>

                <dl className="mt-6 grid gap-3 border-t border-white/[0.07] pt-5 text-[13px] leading-snug">
                  <div>
                    <dt className="s-mono text-[10px] uppercase tracking-[0.14em] text-fog">You supply</dt>
                    <dd className="mt-1 text-haze">{t.youSupply}</dd>
                  </div>
                  <div>
                    <dt className="s-mono text-[10px] uppercase tracking-[0.14em] text-fog">We commit to</dt>
                    <dd className="mt-1 text-haze">{t.commitment}</dd>
                  </div>
                  <div>
                    <dt className="s-mono text-[10px] uppercase tracking-[0.14em] text-fog">Optional success fee</dt>
                    <dd className="mt-1 text-haze">{keepRanges(t.successFee)}</dd>
                  </div>
                </dl>

                <div className="mt-auto pt-7">
                  <a href="#start" className={`s-btn w-full ${t.pick ? "s-btn-primary" : "s-btn-glass"}`}>
                    {t.pick ? "Start with a Blueprint" : `Scope ${t.name === "Co-Build" ? "a Co-Build" : "a replacement"}`}
                    <ArrowRight className="s-arrow h-4 w-4" aria-hidden />
                  </a>
                </div>
              </article>
            ))}
          </div>

          <p className="mt-6 max-w-[96ch] text-[13px] leading-relaxed text-fog">
            Prices in US dollars, before tax. Fixed fees are set after intake and depend on workflow count, integrations, record
            volume, data sensitivity, users, availability requirements and migration complexity. Move to Co-Build or Managed
            Replacement within 60 days of a Blueprint and up to $15,000 of the Blueprint fee is credited toward implementation.
            Commitments are to milestones and service levels; success fees are paid only on verified savings.
          </p>

          <div className="mt-10 max-w-[880px]" data-reveal>
            <Disclosure id="success-fee" label="How the optional success fee is counted" openLabel="Hide the success fee rules" meta={`${GAINSHARE_RULES.length} rules`}>
              <ol className="grid max-w-[76ch] border-t border-white/[0.07]">
                {GAINSHARE_RULES.map((g, i) => (
                  <li key={g} className="grid grid-cols-[40px_1fr] gap-2 border-b border-white/[0.07] py-4 text-[15px] leading-relaxed text-snow/90">
                    <span className="s-mono pt-[3px] text-[11px] text-cyan-300">{String(i + 1).padStart(2, "0")}</span>
                    <span>{g}</span>
                  </li>
                ))}
              </ol>
            </Disclosure>
          </div>
        </div>
      </section>

      {/* Fit */}
      <section id="fit" className="s-anchor s-section-tight">
        <div className="s-container">
          <SectionHeader
            eyebrow="Fit"
            title="Where the economics *usually hold*."
            lede="The strongest first targets are mid-market companies with one expensive, under-used workflow platform and a renewal inside the next year."
          />
          <dl
            className="mt-12 grid grid-cols-2 gap-px overflow-hidden rounded-[20px] border border-white/[0.08] bg-white/[0.08] md:grid-cols-4"
            data-reveal
          >
            {FIT_PROFILE.map((s) => (
              <div key={s.label} className="bg-ink-900 p-5 md:p-6">
                <dt className="s-mono text-[10.5px] uppercase tracking-[0.14em] text-fog">{s.label}</dt>
                <dd className="s-num mt-2.5 font-display text-[1.2rem] leading-snug tracking-[-0.01em] text-snow md:text-[1.4rem]">
                  {keepRanges(s.value)}
                </dd>
              </div>
            ))}
          </dl>
          <div className="mt-6 grid gap-4 lg:grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)]">
            <div className="s-edge p-6 md:p-8" data-reveal>
              <p className="s-eyebrow">Signals a replacement may pay</p>
              <ul className="rbe-list mt-6 text-[14.5px]">
                {STRONG_SIGNALS.map((s) => (
                  <li key={s}>{s}</li>
                ))}
              </ul>
            </div>
            <div className="s-glass p-6 md:p-8" data-reveal style={{ ["--d" as string]: "80ms" }}>
              <p className="s-eyebrow s-eyebrow-muted">Signals to keep renting</p>
              <ul className="mt-6 grid gap-[9px] text-[14.5px] leading-[1.5] text-haze">
                {WEAK_SIGNALS.map((s) => (
                  <li key={s} className="flex gap-3">
                    <span className="mt-[0.75em] h-px w-2 shrink-0 bg-white/30" aria-hidden />
                    {s}
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <div className="mt-10 max-w-[1000px]" data-reveal>
            <Disclosure id="scorecard" label="The qualification scorecard" openLabel="Hide the scorecard" meta={`${SCORECARD.length} dimensions`}>
              <Matrix
                rowHeader="Dimension"
                columns={[{ label: "0 points" }, { label: "5 points", highlight: true }]}
                rows={SCORECARD.map((s) => ({ label: s.label, values: [s.low, s.high] }))}
              />
              <p className="mt-4 max-w-[80ch] text-[13.5px] leading-relaxed text-fog">
                Score each dimension from 0 to 5. A total of 28 out of 40, with no zero on risk or executive ownership, advances
                to a paid Blueprint. A lower score still points to renegotiation, consolidation or optimization.
              </p>
            </Disclosure>
          </div>
        </div>
      </section>

      <div className="s-container" aria-hidden>
        <div className="s-divider" />
      </div>

      {/* Questions */}
      <section id="faq" className="s-anchor s-section-tight" aria-labelledby="faq-title">
        <div className="s-container grid gap-10 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-16">
          <header className="self-start lg:sticky lg:top-[152px]" data-reveal>
            <p className="s-eyebrow">Questions</p>
            <h2 id="faq-title" className="s-h2 mt-5">
              {accentTitle("The objections, *answered*.")}
            </h2>
            <p className="s-lede mt-5 max-w-[46ch]">What finance, IT and security ask before a platform comes out.</p>
          </header>
          <div className="min-w-0" data-reveal>
            <Accordion items={FAQ.map((f) => ({ title: f.q, content: <p>{f.a}</p> }))} />
          </div>
        </div>
      </section>

      {/* Start */}
      <section id="start" className="s-anchor s-section-tight">
        <div className="s-container">
          <div className="s-edge s-spot relative overflow-hidden px-6 py-12 md:px-12 md:py-16" data-reveal>
            <div className="s-glow left-[30%] top-0 h-[260px] w-[620px] -translate-x-1/2 -translate-y-1/2 bg-[rgba(25,94,142,0.55)]" aria-hidden />
            <div className="relative grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] lg:gap-14">
              <div>
                <p className="s-eyebrow">Start</p>
                <h2 className="s-h2 s-gradient-text mt-5">{accentTitle("Bring the invoice and the *renewal date*.")}</h2>
                <p className="s-lede mt-5 max-w-[48ch]">
                  A Blueprint starts with one platform. Tell us which one and what it costs. The reply is a scope and a fixed fee.
                </p>
                <p className="s-mono mt-8 text-[10.5px] uppercase tracking-[0.14em] text-fog">What to bring</p>
                <ul className="rbe-list mt-4 text-[14.5px]">
                  {BRING.map((b) => (
                    <li key={b}>{b}</li>
                  ))}
                </ul>
              </div>
              <div className="min-w-0 self-start">
                <DecisionForm
                  subject="Software independence: Blueprint inquiry"
                  label="Which platform, and when does it renew?"
                  placeholder="Platform and modules, annual cost, renewal date, roughly how many licensed users are active."
                  note="Opens your email with the message ready to send. The reply is a scope and a fixed Blueprint fee."
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      <NextSteps from={HREF} />

      {/* Disclosures and sources */}
      <section className="pb-16 pt-4" aria-label="Disclosures">
        <div className="s-container">
          <div className="grid max-w-[95ch] gap-3 border-t border-white/[0.07] pt-8 text-[12.5px] leading-relaxed text-fog">
            <p>
              <span className="text-haze">Public cases.</span> The companies named on this page are not execom clients and are not
              affiliated with execom Inc. Figures are as reported by the companies or the press and have not been independently
              verified by execom. Product and company names are trademarks of their owners.
            </p>
            <p>
              <span className="text-haze">Model.</span> The ROI model is illustrative and is not a quote, a forecast or financial
              advice. Engagement fees are in US dollars, before tax.
            </p>
            <div id="sources" className="s-anchor">
              <p className="text-haze">Sources</p>
              <ol className="mt-2 grid gap-1.5">
                {SOURCES.map((s) => (
                  <li key={s.n} className="grid grid-cols-[22px_minmax(0,1fr)]">
                    <span className="s-mono">{s.n}.</span>
                    <a href={s.href} target="_blank" rel="noreferrer" className="break-words hover:text-haze">
                      {s.label}
                    </a>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </div>
      </section>

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(FAQ_JSON_LD) }} />
    </>
  )
}
