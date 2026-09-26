import type { Metadata } from "next"
import Link from "next/link"
import { ArrowDown, ArrowRight } from "lucide-react"
import { NAV_GROUPS } from "@/lib/site/nav"
import { Actions, CtaBand, SectionHeader } from "@/components/site/Primitives"
import { Disclosure } from "@/components/site/Interactive"
import { PortalPreview } from "@/components/site/home/PortalPreview"
import {
  CalculatorPanel,
  CapabilityExplorer,
  OperatorModel,
  type Capability,
  type Stage,
} from "@/components/site/home/HomeInteractive"

export const metadata: Metadata = {
  title: "execom | The execution engine for starting a business",
  description:
    "execom delivers incorporated, compliant, market-ready businesses in days: incorporation, trademarks, corporate records, SR&ED claims at 5%, and capital strategy through one portal.",
}

/* ------------------------------------------------------------------ */
/* Content                                                             */
/* ------------------------------------------------------------------ */

const STATS = [
  {
    value: "$40,000+",
    label: "Typical combined fees for lawyers, accountants, consultants, and filings to structure a new business properly.",
  },
  {
    value: "3–6 months",
    label: "Average time to coordinate incorporation, tax structure, compliance setup, and operational readiness.",
  },
  {
    value: "4–7 firms",
    label: "Separate providers most businesses coordinate across legal, accounting, tax, and advisory work.",
  },
]

const STEPS = [
  {
    title: "Structured intake",
    text: "One intake captures what the work needs. No scheduling, no back-and-forth email chains.",
  },
  {
    title: "Guided workflows",
    text: "Filings, agreements, and records move through defined steps inside the portal.",
  },
  {
    title: "Repeatable outputs",
    text: "Documents ready for execution, kept in one record system instead of three shared drives.",
  },
]

const OUTCOMES = [
  { title: "Days, not weeks", text: "Portal workflows compress turnaround." },
  { title: "Lower cost by design", text: "Repeatable work, priced as repeatable work." },
  { title: "Less coordination", text: "One portal, one intake, one record system." },
  { title: "Judgment where needed", text: "Expert input on the decisions that require it." },
]

const CAPABILITIES: Capability[] = [
  {
    title: "Incorporation & Setup",
    description:
      "Federal and provincial incorporations, articles, initial resolutions, and registered-agent setup, filed through a structured intake instead of a billable-hour conversation.",
    includes: ["Federal or provincial", "Articles", "Initial resolutions", "Registered agent"],
    cta: { label: "Start company setup", href: "/portal/company-setup" },
  },
  {
    title: "Trademark Filing",
    description:
      "Canadian and US trademark applications prepared and filed through a guided workflow. Classification, search, and submission without the typical per-mark markup.",
    includes: ["Canada (CIPO)", "United States (USPTO)", "Classification", "Search", "Submission"],
    cta: { label: "File through the portal", href: "/portal/login" },
  },
  {
    title: "Corporate Documents & Agreements",
    description:
      "Shareholder agreements, IP assignments, NDAs, employment templates, board resolutions, and other repeatable corporate documents, generated through structured inputs and ready for execution.",
    includes: ["Shareholder agreements", "IP assignments", "NDAs", "Employment templates", "Board resolutions"],
    cta: { label: "Talk with execom", href: "/engage" },
  },
  {
    title: "Cap Tables & Corporate Records",
    description:
      "Clean cap tables, share ledgers, and corporate minute books maintained through portal workflows instead of scattered spreadsheets and lawyer invoices.",
    includes: ["Cap table", "Share ledger", "Minute book"],
    cta: { label: "Talk with execom", href: "/engage" },
  },
  {
    title: "SR&ED Claims",
    description:
      "Canada's largest non-dilutive capital program, accessible at 5%, not 15–30%. Prepare claims in the format CRA expects, directly in the execom portal.",
    includes: ["Project write-ups", "Cost classification", "Federal and provincial", "Export for filing"],
    cta: { label: "Explore SR&ED", href: "/sred" },
  },
  {
    title: "Capital & Growth Strategy",
    description:
      "Non-dilutive capital triage, grant skepticism, VC and angel readiness, market entry planning, and distribution access. Strategic judgment where it matters.",
    includes: ["Non-dilutive capital", "Grants", "VC and angel readiness", "Market entry", "Distribution"],
    cta: { label: "See the practice areas", href: "#practice-areas" },
  },
]

const STAGES: Stage[] = [
  {
    title: "Employment",
    income: "Salary",
    description: "Time traded for wages. Employer owns the upside. Career security depends on external decisions.",
    outcome:
      "Retirement security tied to salary continuity and savings discipline. Wealth accumulation constrained by employer compensation structure and market exposure through managed accounts.",
  },
  {
    title: "Independent Operator",
    income: "Expertise",
    description: "Consulting, contracting, advisory. Immediate revenue and ownership of income, but it still scales with hours.",
    outcome:
      "Higher income ceiling with direct control over pricing and client selection. Stronger capacity to fund retirement accounts and build personal reserves, but income stops when work stops.",
  },
  {
    title: "Leveraged Business",
    income: "Systems",
    description: "Standardized offerings, team leverage, recurring contracts. Income begins separating from the owner's time.",
    outcome:
      "Wealth accumulates through systems, team leverage, and recurring revenue. The business generates value beyond the operator's individual output, creating a sellable or transferable asset.",
  },
  {
    title: "Asset Company",
    income: "Products",
    description: "Software, digital products, IP licensing, subscriptions. Revenue scales independently of hours worked.",
    outcome:
      "Durable wealth from products, intellectual property, or distribution that compounds independently. Revenue persists without proportional time input, producing long-term financial stability across market cycles.",
  },
]

const PARTNER_LOGOS = [
  { name: "Platform Calgary", file: "/logos/platform-calgary.jpg" },
  { name: "Innovate Calgary", file: "/logos/innovate-calgary.png" },
  { name: "McGill University", file: "/logos/mcgill.png" },
  { name: "Council of Canadian Innovators", file: "/logos/cci.png" },
  { name: "Innovation Asset Collective", file: "/logos/iac.png" },
  { name: "BlueIron", file: "/logos/blueiron.png" },
  { name: "Matregenix", file: "/logos/matregenix.png" },
  { name: "Max Planck Institute", file: "/logos/max-planck.png" },
  { name: "University of Calgary Hunter Hub", file: "/logos/ucalgary-hunter-hub.jpg" },
  { name: "IP Institute of Canada", file: "/logos/ipic.jpg" },
  { name: "UCeed", file: "/logos/uceed.jpg" },
  { name: "Alberta Innovates", file: "/logos/alberta-innovates.png" },
  { name: "NRC", file: "/logos/nrc.png" },
  { name: "IRAP", file: "/logos/irap.jpg" },
  { name: "BDC", file: "/logos/bdc.jpg" },
  { name: "EDC", file: "/logos/edc.png" },
  { name: "ACOA", file: "/logos/acoa.png" },
  { name: "Futurpreneur", file: "/logos/futurpreneur.png" },
  { name: "ERA", file: "/logos/era.png" },
  { name: "Innovate BC", file: "/logos/innovate-bc.png" },
  { name: "CFIN", file: "/logos/cfin.png" },
  // SIF (/logos/sif.png) is a promotional banner rather than a logo mark, so it is left out of the strip.
]

/* ------------------------------------------------------------------ */
/* Sections                                                            */
/* ------------------------------------------------------------------ */

function Hero() {
  return (
    <section className="relative -mt-[var(--header-h)] overflow-hidden pt-[calc(var(--header-h)+48px)] pb-24 md:pt-[calc(var(--header-h)+80px)] md:pb-32">
      <div className="s-atmo" aria-hidden />
      <div className="s-horizon" aria-hidden />
      <div className="s-container relative grid items-center gap-16 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] lg:gap-10">
        <div>
          <p className="s-eyebrow s-eyebrow-dot mb-7">Incorporation · Trademarks · SR&amp;ED · Capital</p>
          <h1 className="s-display s-display-xl s-gradient-text max-w-[15ch]">
            The <span className="s-accent">execution engine</span> for starting a business.
          </h1>
          <p className="s-lede mt-7 max-w-[50ch]">
            execom delivers incorporated, compliant, market-ready businesses in days, without assembling a stack of lawyers,
            accountants, and consultants.
          </p>
          <Actions
            primary={{ label: "Access the portal", href: "/portal/login" }}
            secondary={{ label: "Talk with execom", href: "/engage" }}
            className="mt-10"
          />
          <a href="#startup-cost-calculator" className="s-link mt-7 text-[14px]">
            Estimate my startup cost
            <ArrowDown className="h-3.5 w-3.5 !transform-none" aria-hidden />
          </a>
        </div>
        <PortalPreview />
      </div>
    </section>
  )
}

function StatsBand() {
  return (
    <section className="s-section-tight pt-6">
      <div className="s-container">
        <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end" data-reveal>
          <div>
            <p className="s-eyebrow mb-4">The conventional path</p>
            <h2 className="s-h2 max-w-[22ch]">What it takes to start a properly structured business.</h2>
          </div>
          <a href="#startup-cost-calculator" className="s-btn s-btn-glass shrink-0">
            Run your numbers
            <ArrowDown className="h-4 w-4" aria-hidden />
          </a>
        </div>
        <div className="grid overflow-hidden rounded-[20px] border border-white/[0.08] md:grid-cols-3" data-reveal>
          {STATS.map((s, i) => (
            <div
              key={s.value}
              className={`relative bg-white/[0.02] p-7 md:p-9 ${i > 0 ? "border-t border-white/[0.08] md:border-l md:border-t-0" : ""}`}
            >
              <p className="font-display text-[3rem] leading-none tracking-[-0.03em] text-snow md:text-[3.6rem] s-num">{s.value}</p>
              <p className="mt-4 max-w-[34ch] text-[14.5px] leading-relaxed text-haze">{s.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function CalculatorSection() {
  return (
    <section className="s-section-tight pt-4" aria-labelledby="calc-title">
      <div className="s-container">
        <h2 id="calc-title" className="sr-only">
          Startup cost calculator
        </h2>
        <CalculatorPanel />
      </div>
    </section>
  )
}

function HowItWorks() {
  return (
    <section className="s-section relative overflow-hidden">
      <div className="s-glow left-1/2 top-24 h-[360px] w-[760px] -translate-x-1/2 bg-[rgba(25,94,142,0.22)]" aria-hidden />
      <div className="s-container relative">
        <SectionHeader
          eyebrow="The operating layer"
          title="Intake to execution, *in one system*."
          lede="Routine company-building work moves through structured intake and guided workflows. Expert review is applied where it changes the outcome, not everywhere by default."
        />

        <ol className="relative mt-16 grid gap-4 md:grid-cols-3">
          <div
            className="absolute left-[16.6%] right-[16.6%] top-[27px] hidden h-px bg-gradient-to-r from-cyan-500/50 via-navy-300/40 to-cyan-500/50 md:block"
            aria-hidden
          />
          {STEPS.map((s, i) => (
            <li key={s.title} className="relative flex flex-col items-start md:items-center md:text-center" data-reveal style={{ ["--d" as string]: `${i * 90}ms` }}>
              <span className="relative z-[1] flex h-14 w-14 items-center justify-center rounded-2xl border border-white/[0.12] bg-ink-850 s-mono text-[13px] text-cyan-300 shadow-[0_0_0_6px_rgba(7,17,27,1),0_0_30px_rgba(80,196,210,0.18)]">
                {String(i + 1).padStart(2, "0")}
              </span>
              <p className="mt-6 text-[1.2rem] font-semibold tracking-[-0.012em] text-snow">{s.title}</p>
              <p className="mt-2 max-w-[34ch] text-[15px] leading-relaxed text-haze">{s.text}</p>
            </li>
          ))}
        </ol>

        <div className="mt-16 grid gap-px overflow-hidden rounded-[18px] border border-white/[0.08] bg-white/[0.08] sm:grid-cols-2 lg:grid-cols-4" data-reveal>
          {OUTCOMES.map((o) => (
            <div key={o.title} className="bg-ink-900 p-6">
              <p className="flex items-center gap-2.5 text-[15px] font-semibold text-snow">
                <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(80,196,210,0.8)]" aria-hidden />
                {o.title}
              </p>
              <p className="mt-2 text-[14px] leading-relaxed text-haze">{o.text}</p>
            </div>
          ))}
        </div>

        <div className="mt-10" data-reveal>
          <Disclosure label="Why repeatable work should not be priced like advisory" meta="2 min read" id="the-problem">
            <div className="grid gap-10 border-l border-white/[0.08] pl-5 md:grid-cols-2 md:pl-7">
              <div className="s-body">
                <p className="s-eyebrow mb-4">The problem</p>
                <p>
                  The company-building process is full of repeatable work that is still priced and delivered like bespoke professional
                  services. Incorporations, standard agreements, filings, cap-table maintenance, and routine corporate records do not
                  require the same judgment and cost structure as complex M&amp;A or litigation. Yet business owners keep paying as if
                  they do.
                </p>
                <p>
                  The result is slow execution, fragmented records, and spend that scales with activity instead of value. Business
                  owners wait days for work that should take hours, and pay premium hourly rates for tasks that should already be
                  systematized.
                </p>
              </div>
              <div className="s-body">
                <p className="s-eyebrow mb-4">The business operating layer</p>
                <p>
                  execom is not a law firm. It is not a template marketplace. It is a structured execution layer that sits between the
                  business owner and the high-friction administrative work that typically requires expensive intermediaries and weeks of
                  back-and-forth.
                </p>
                <p>
                  The portal handles structured intake, guided workflows, and repeatable outputs for the work that should never have
                  been bespoke in the first place. Expert review is applied selectively, where it changes outcomes, not everywhere by
                  default.
                </p>
                <p>
                  Most tasks that traditionally require scheduling calls, exchanging drafts, and waiting on billable-hour workflows can
                  instead move from intake to execution inside a single structured system.
                </p>
              </div>
            </div>
          </Disclosure>
        </div>
      </div>
    </section>
  )
}

function Capabilities() {
  return (
    <section className="s-section s-anchor pt-8" id="capabilities">
      <div className="s-container">
        <SectionHeader
          eyebrow="What execom covers"
          title="Structured execution for the work every new company faces."
          lede="From initial setup through ongoing corporate maintenance and capital strategy."
          className="mb-12"
        />
        <CapabilityExplorer items={CAPABILITIES} />
      </div>
    </section>
  )
}

function OperatorSection() {
  return (
    <section className="s-section s-anchor relative overflow-hidden" id="operator-model">
      <div className="pointer-events-none absolute inset-x-0 inset-y-10 md:inset-x-6" aria-hidden>
        <div className="absolute inset-0 rounded-[32px] border border-white/[0.06] bg-[linear-gradient(180deg,rgba(25,94,142,0.18),rgba(7,17,27,0)_75%)]" />
        <div className="s-glow left-[10%] top-[-40px] h-[240px] w-[480px] bg-[rgba(80,196,210,0.10)]" />
      </div>
      <div className="s-container relative">
        <SectionHeader
          eyebrow="The operator model"
          title="From salary to *asset company*."
          lede="Services monetize expertise immediately but scale with hours. The goal is a company that generates assets."
          className="mb-14"
        />
        <OperatorModel stages={STAGES} />
        <p className="mt-8 max-w-[70ch] text-[14.5px] leading-relaxed text-fog" data-reveal>
          execom provides the execution infrastructure to move through these stages quickly, without burning capital on fragmented
          professional services.
        </p>
      </div>
    </section>
  )
}

function PracticeAreas() {
  return (
    <section className="s-section s-anchor" id="practice-areas">
      <div className="s-container">
        <SectionHeader
          eyebrow="Beyond execution"
          title="Strategy for the decisions that carry weight."
          lede="Incorporation type, trademark timing, and cap table structure carry strategic weight templates cannot resolve. execom also advises on capital, market entry, and distribution."
          className="mb-12"
        />
        <div className="grid gap-4 md:grid-cols-2">
          {NAV_GROUPS.map((g, gi) => (
            <div key={g.key} className="s-edge s-spot flex flex-col p-7 md:p-8" data-reveal style={{ ["--d" as string]: `${(gi % 2) * 80}ms` }}>
              <p className="s-eyebrow">{g.label}</p>
              <p className="mt-4 font-display text-[1.6rem] leading-[1.15] tracking-[-0.014em] text-snow">{g.thesis}</p>
              <ul className="mt-6 grid gap-0.5 border-t border-white/[0.07] pt-3">
                {g.items.map((it) => (
                  <li key={it.label}>
                    {it.href && !it.soon ? (
                      <Link
                        href={it.href}
                        className="group flex items-center justify-between gap-4 rounded-lg px-2 py-2.5 text-[15px] text-snow/90 transition-colors hover:bg-white/[0.04] hover:text-white"
                      >
                        {it.label}
                        <ArrowRight className="h-4 w-4 text-fog transition-transform duration-200 group-hover:translate-x-0.5 group-hover:text-cyan-300" aria-hidden />
                      </Link>
                    ) : (
                      <div className="flex items-center justify-between gap-4 px-2 py-2.5 text-[15px] text-fog">
                        {it.label}
                        <span className="s-tag">Soon</span>
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function LogoStrip() {
  const logos = [...PARTNER_LOGOS, ...PARTNER_LOGOS]
  return (
    <section className="border-y border-white/[0.06] py-10" aria-label="Organizations">
      <div className="s-marquee overflow-hidden">
        <div className="s-marquee-track">
          {logos.map((logo, i) => (
            <div key={i} className="flex shrink-0 items-center px-9 md:px-12" aria-hidden={i >= PARTNER_LOGOS.length}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={logo.file} alt={i < PARTNER_LOGOS.length ? logo.name : ""} className="s-logo" loading="lazy" />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default function Home() {
  return (
    <>
      <Hero />
      <StatsBand />
      <CalculatorSection />
      <HowItWorks />
      <Capabilities />
      <OperatorSection />
      <PracticeAreas />
      <LogoStrip />
      <CtaBand
        title="If you are still paying premium rates for repeatable company-building work, *the process is the problem*."
        body="Portal execution for routine work. Strategic judgment for the decisions that require it."
        primary={{ label: "Access the portal", href: "/portal/login" }}
        secondary={{ label: "Talk with execom", href: "/engage" }}
      />
    </>
  )
}
