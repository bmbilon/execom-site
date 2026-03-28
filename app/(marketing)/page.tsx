import Link from "next/link"
import dynamic from "next/dynamic"
import {
  Zap,
  FileText,
  Shield,
  BarChart3,
  Building2,
  Landmark,
  ArrowRight,
} from "lucide-react"

const ExecomCalculator = dynamic(
  () => import("@/components/calculator/ExecomCalculator"),
  { ssr: false }
)

/* ────────────────────────────────────────────
   Partner logo marquee (unchanged)
   ──────────────────────────────────────────── */

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
  { name: "SIF", file: "/logos/sif.png" },
]

function LogoMarquee() {
  const logos = [...PARTNER_LOGOS, ...PARTNER_LOGOS]
  return (
    <section className="bg-white border-y border-border py-10 overflow-hidden">
      <div className="marquee-track">
        {logos.map((logo, i) => (
          <div
            key={i}
            className="flex-shrink-0 px-10 md:px-14 flex items-center justify-center"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={logo.file}
              alt={logo.name}
              height={48}
              className="h-6 md:h-8 w-auto max-w-[160px] object-contain opacity-70 hover:opacity-100 transition-opacity duration-300"
            />
          </div>
        ))}
      </div>
    </section>
  )
}

/* ────────────────────────────────────────────
   Capability data
   ──────────────────────────────────────────── */

const CAPABILITIES = [
  {
    icon: Building2,
    title: "Incorporation & Setup",
    description:
      "Federal and provincial incorporations, articles, initial resolutions, and registered-agent setup — filed through a structured intake, not a billable-hour conversation.",
    href: "/engage",
  },
  {
    icon: Shield,
    title: "Trademark Filing",
    description:
      "Canadian and US trademark applications prepared and filed through a guided workflow. Classification, search, and submission without the typical per-mark markup.",
    href: "/engage",
  },
  {
    icon: FileText,
    title: "Corporate Documents & Agreements",
    description:
      "Shareholder agreements, IP assignments, NDAs, employment templates, board resolutions, and other repeatable corporate documents generated through structured inputs and ready for execution.",
    href: "/engage",
  },
  {
    icon: BarChart3,
    title: "Cap Tables & Corporate Records",
    description:
      "Clean cap tables, share ledgers, and corporate minute books maintained through portal workflows instead of scattered spreadsheets and lawyer invoices.",
    href: "/engage",
  },
  {
    icon: Zap,
    title: "SR&ED Claims",
    description:
      "Canada's largest non-dilutive capital program, accessible at 5% — not 15–30%. Prepare claims in the format CRA expects, directly in the execom portal.",
    href: "/sred",
  },
  {
    icon: Landmark,
    title: "Capital & Growth Strategy",
    description:
      "Non-dilutive capital triage, grant skepticism, VC / angel readiness, market entry planning, and distribution access — strategic judgment where it matters.",
    href: "/engage",
  },
]

/* ────────────────────────────────────────────
   Why founders use execom
   ──────────────────────────────────────────── */

const WHY_ITEMS = [
  {
    label: "Lower cost on repeatable work",
    detail:
      "Incorporations, filings, and standard documents should not cost what bespoke advisory costs. execom prices repeatable execution like repeatable execution.",
  },
  {
    label: "Speed advantage",
    detail:
      "Structured intake and portal-based workflows compress turnaround from weeks to days. No scheduling. No back-and-forth email chains.",
  },
  {
    label: "Less coordination overhead",
    detail:
      "One portal, one intake, one record system. No juggling between a lawyer, an accountant, a consultant, and three shared drives.",
  },
  {
    label: "Strategic judgment where needed",
    detail:
      "Not every task needs an expert. But some do. execom applies human judgment selectively — on the decisions that actually require it.",
  },
]

/* ────────────────────────────────────────────
   Homepage
   ──────────────────────────────────────────── */

export default function Home() {
  return (
    <>
      {/* ── 1. HERO ── */}
      <section className="relative bg-[#0d1b2a] hero-pattern overflow-hidden">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-[#195E8E]/20 to-transparent" />
        <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-teal/40 via-teal/10 to-transparent" />

        <div className="relative max-w-[1200px] mx-auto px-8 py-28 md:py-36">
          <div className="max-w-[680px]">
            <h1 className="text-[2.5rem] md:text-[3.25rem] leading-[1.15] font-serif text-white mb-8">
              Founders shouldn&apos;t have to build companies through
              professional-service bottlenecks.
            </h1>
            <p className="text-xl md:text-2xl text-white/70 leading-relaxed mb-6">
              execom combines portal-based workflows, structured execution, and
              selective expert judgment so founders can move faster on corporate
              setup, capital &amp; funding related activities, and market entry
              without the typical cost and delay.
            </p>
            <p className="text-body text-white/40 italic">
              The efficiency engine for entrepreneurs.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row gap-4">
              <Link
                href="/portal/login"
                className="inline-flex items-center justify-center px-7 py-3 text-[13px] font-semibold uppercase tracking-widest bg-teal text-[#0d1b2a] hover:bg-teal-dark transition-colors duration-200 rounded-sm"
              >
                Access the Portal
              </Link>
              <Link
                href="/engage"
                className="inline-flex items-center justify-center px-7 py-3 text-[13px] font-semibold uppercase tracking-widest border border-white/20 text-white/70 hover:border-teal hover:text-teal transition-colors duration-200 rounded-sm"
              >
                Talk With execom
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── PARTNER LOGOS ── */}
      <LogoMarquee />

      {/* ── 2. CREDIBILITY / FRAMING ── */}
      <section className="bg-bg py-20 md:py-28">
        <div className="max-w-content mx-auto px-8 space-y-6 text-body text-fg/80">
          <p className="section-label">The problem</p>
          <p>
            The company-building process is full of repeatable work that is
            still priced and delivered like bespoke professional services.
            Incorporations, standard agreements, filings, cap-table
            maintenance, and routine corporate records do not require the same
            judgment and cost structure as complex M&A or litigation — yet
            founders keep paying as if they do.
          </p>
          <p>
            The result is slow execution, fragmented records, and spend that
            scales with activity instead of value. Founders wait days for work
            that should take hours, and pay premium hourly rates for tasks that
            should already be systematized.
          </p>
          <p className="text-fg font-semibold text-lg">
            execom exists to compress that waste.
          </p>
        </div>
      </section>

      {/* ── THE OPERATOR MODEL ── */}
      <section className="bg-[#0d1b2a] py-20 md:py-28 relative">
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-teal/30 via-teal/10 to-transparent" />
        <div className="max-w-[1000px] mx-auto px-8">
          <p className="section-label-light">The Operator Model</p>
          <p className="text-body text-white/50 mb-12 max-w-content">
            Most professionals leaving employment start with services because
            expertise monetizes immediately. But services have a structural
            ceiling: they scale with time. The goal is not simply independence —
            it is building an asset-generating company.
          </p>

          {/* Diagram — 4 stages */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-0 mb-10">
            {[
              {
                stage: "01",
                title: "Employment",
                income: "Salary",
                desc: "Time traded for wages. Employer owns the upside. Career security dependent on external decisions.",
              },
              {
                stage: "02",
                title: "Independent Operator",
                income: "Expertise",
                desc: "Consulting, contracting, advisory. Immediate revenue and ownership of income — but it still scales with hours.",
              },
              {
                stage: "03",
                title: "Leveraged Business",
                income: "Systems",
                desc: "Standardized offerings, team leverage, recurring contracts. Income begins separating from the founder\u2019s time.",
              },
              {
                stage: "04",
                title: "Asset Company",
                income: "Products",
                desc: "Software, digital products, IP licensing, subscriptions. Revenue scales independently of hours worked.",
              },
            ].map((item, i) => (
              <div key={item.stage} className="relative flex flex-col">
                {/* Connector line (not on first) */}
                {i > 0 && (
                  <div className="hidden md:block absolute top-8 -left-px w-px h-[calc(100%-2rem)] bg-white/10" />
                )}
                {/* Arrow between stages on desktop */}
                {i > 0 && (
                  <div className="hidden md:flex absolute -left-2.5 top-[1.85rem] w-5 h-5 items-center justify-center">
                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none" className="text-teal/60">
                      <path d="M0 5h8M5 2l3 3-3 3" stroke="currentColor" strokeWidth="1" />
                    </svg>
                  </div>
                )}
                {/* Mobile arrow */}
                {i > 0 && (
                  <div className="md:hidden flex justify-center py-3">
                    <svg width="10" height="14" viewBox="0 0 10 14" fill="none" className="text-teal/40">
                      <path d="M5 0v10M2 7l3 3 3-3" stroke="currentColor" strokeWidth="1" />
                    </svg>
                  </div>
                )}
                <div className="border border-white/10 bg-white/[0.03] p-5 md:p-6 flex-1">
                  <p className="text-[11px] font-semibold uppercase tracking-widest text-teal/60 mb-2">
                    {item.stage}
                  </p>
                  <p className="text-[1.05rem] font-serif font-medium text-white mb-1">
                    {item.title}
                  </p>
                  <p className="text-[11px] uppercase tracking-widest text-teal mb-3">
                    Income: {item.income}
                  </p>
                  <p className="text-sm text-white/50 leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Economic outcomes row */}
          <div className="mb-10">
            <p className="text-[11px] font-semibold uppercase tracking-widest text-white/30 mb-4">
              Typical Economic Outcome
            </p>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-0">
              {[
                "Retirement security tied to salary continuity and savings discipline. Wealth accumulation constrained by employer compensation structure and market exposure through managed accounts.",
                "Higher income ceiling with direct control over pricing and client selection. Stronger capacity to fund retirement accounts and build personal reserves — but income stops when work stops.",
                "Wealth accumulates through systems, team leverage, and recurring revenue. The business generates value beyond the operator\u2019s individual output, creating a sellable or transferable asset.",
                "Durable wealth from products, intellectual property, or distribution that compounds independently. Revenue persists without proportional time input, producing long-term financial stability across market cycles.",
              ].map((outcome, i) => (
                <div
                  key={i}
                  className="border border-white/[0.06] bg-white/[0.015] p-4 md:p-5"
                >
                  <p className="text-[13px] text-white/40 leading-relaxed">
                    {outcome}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* execom bar */}
          <div className="border border-teal/30 bg-teal/[0.06] px-6 py-4 text-center">
            <p className="text-sm text-teal font-medium tracking-wide">
              execom provides the execution infrastructure to move through these
              stages quickly — without burning capital on fragmented professional
              services.
            </p>
          </div>
        </div>
      </section>

      {/* ── 3. CAPABILITY GRID ── */}
      <section className="bg-surface-raised py-20 md:py-28">
        <div className="max-w-[1000px] mx-auto px-8">
          <p className="section-label">What execom covers</p>
          <p className="text-body text-fg/70 mb-10 max-w-content">
            Structured execution across the workflows founders encounter most
            — from initial setup through ongoing corporate maintenance and
            capital strategy.
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {CAPABILITIES.map((cap) => (
              <Link
                key={cap.title}
                href={cap.href}
                className="group bg-white/80 border border-border p-6 hover:border-teal/40 hover:shadow-sm transition-all duration-300"
              >
                <cap.icon
                  className="w-5 h-5 text-blue mb-4 group-hover:text-teal transition-colors"
                  strokeWidth={1.5}
                />
                <h3 className="text-[1rem] font-serif font-medium text-fg mb-2">
                  {cap.title}
                </h3>
                <p className="text-sm text-fg/60 leading-relaxed">
                  {cap.description}
                </p>
                <span className="inline-flex items-center gap-1 mt-4 text-sm text-blue group-hover:text-teal transition-colors">
                  Learn more{" "}
                  <ArrowRight className="w-3.5 h-3.5" strokeWidth={2} />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── 4. PORTAL / WORKFLOW SECTION ── */}
      <section className="bg-[#0d1b2a] py-20 md:py-28">
        <div className="max-w-content mx-auto px-8">
          <p className="section-label-light">The founder operating layer</p>
          <div className="space-y-6 text-body text-white/70">
            <p>
              execom is not a law firm. It is not a template marketplace. It is
              a structured execution layer that sits between the founder and the
              high-friction administrative work that typically requires
              expensive intermediaries and weeks of back-and-forth.
            </p>
            <p>
              The portal handles structured intake, guided workflows, and
              repeatable outputs for the work that should never have been
              bespoke in the first place. Expert review is applied selectively —
              where it changes outcomes, not everywhere by default.
            </p>
            <p>
              Most tasks that traditionally require scheduling calls, exchanging
              drafts, and waiting on billable-hour workflows can instead move
              from intake to execution inside a single structured system.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-12">
            {[
              "Structured intake",
              "Guided workflows",
              "Repeatable outputs",
              "Days, not weeks",
              "Lower cost by design",
              "Expert input where it matters",
            ].map((item) => (
              <div
                key={item}
                className="border border-white/10 bg-white/[0.03] p-4 rounded-sm"
              >
                <p className="text-sm text-teal font-medium">{item}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 5. WHY FOUNDERS USE EXECOM ── */}
      <section className="bg-bg py-20 md:py-28">
        <div className="max-w-[1000px] mx-auto px-8">
          <p className="section-label">Why founders use execom</p>
          <div className="grid md:grid-cols-2 gap-5 mt-2">
            {WHY_ITEMS.map((item) => (
              <div
                key={item.label}
                className="bg-white/80 border border-border p-6 hover:border-teal/40 transition-all duration-300"
              >
                <p className="text-[1.05rem] font-serif font-medium text-blue mb-2">
                  {item.label}
                </p>
                <p className="text-sm text-fg/60 leading-relaxed">
                  {item.detail}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CALCULATOR ── */}
      <section id="calculator" className="bg-[#0d1b2a] py-20 md:py-28">
        <div className="max-w-[1200px] mx-auto px-8">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-teal/60 mb-4">
            Transition calculator
          </p>
          <p className="text-body text-white/50 mb-10 max-w-content">
            See what the fragmented founder path actually costs — and what
            changes when execution is integrated from day one.
          </p>
          <ExecomCalculator />
        </div>
      </section>

      {/* ── 6. STRATEGIC LAYER ── */}
      <section className="bg-surface-raised py-20 md:py-28">
        <div className="max-w-content mx-auto px-8 space-y-6 text-body text-fg/80">
          <p className="section-label">Beyond execution</p>
          <p>
            Most founders do not just need execution. They need the right
            execution order. The decision to incorporate federally or
            provincially, the timing of a trademark filing, and the structure
            of a cap table all carry strategic weight that templates alone
            cannot resolve.
          </p>
          <p>
            execom also helps founders navigate non-dilutive capital, grants
            triage, VC and angel readiness, market entry, and distribution
            access — the strategic questions that determine whether execution
            creates value or just creates activity.
          </p>
          <div className="flex flex-wrap gap-3 mt-8">
            {[
              { label: "Non-Dilutive Capital", href: "/non-dilutive-capital" },
              { label: "Grants", href: "/grants" },
              { label: "VC / Angel Capital", href: "/vc-angel-capital" },
              { label: "Market Entry", href: "/market-entry" },
              { label: "Distribution Access", href: "/distribution-access" },
              { label: "Accelerators & Incubators", href: "/accelerators-incubators" },
            ].map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-blue border border-border hover:border-blue hover:bg-blue/5 transition-all duration-200 rounded-sm"
              >
                {link.label}
                <ArrowRight className="w-3 h-3" strokeWidth={2} />
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── 7. CLOSING CTA ── */}
      <section className="bg-[#0d1b2a] py-20 md:py-24">
        <div className="max-w-content mx-auto px-8 text-center">
          <h2 className="text-[1.5rem] md:text-[1.75rem] font-serif text-white leading-snug mb-6">
            If you are still paying premium rates for repeatable
            company-building work, the process is the problem.
          </h2>
          <p className="text-body text-white/50 mb-10 max-w-[540px] mx-auto">
            execom gives founders a faster structure — portal-based execution
            for routine work, strategic judgment for the decisions that
            require it.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/portal/login"
              className="inline-flex items-center px-7 py-3 text-[13px] font-semibold uppercase tracking-widest bg-teal text-[#0d1b2a] hover:bg-teal-dark transition-colors duration-200 rounded-sm"
            >
              Access the Portal
            </Link>
            <Link
              href="/engage"
              className="inline-flex items-center px-7 py-3 text-[13px] font-semibold uppercase tracking-widest border border-white/20 text-white/70 hover:border-teal hover:text-teal transition-colors duration-200 rounded-sm"
            >
              Talk With execom
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
