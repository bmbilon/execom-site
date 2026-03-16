"use client"

import { StickyToc } from "@/components/marketing/sticky-toc"
import { AccordionSection } from "@/components/marketing/accordion-section"
import { CtaPanel } from "@/components/marketing/cta-panel"
import { StatCallout, PullQuote } from "@/components/marketing/stat-callout"
import { ComparisonMatrix } from "@/components/marketing/comparison-matrix"

const tocItems = [
  { id: "overview", label: "Overview" },
  { id: "what-matters", label: "What Actually Matters" },
  { id: "canada-factor", label: "The Canada Factor" },
  { id: "grant-reality", label: "Grant Reality" },
  { id: "sred-first", label: "SR&ED First" },
  { id: "practical-programs", label: "IRAP & Practical Programs" },
  { id: "when-grants-work", label: "When Grants Make Sense" },
  { id: "hidden-costs", label: "Hidden Costs" },
  { id: "founder-mistakes", label: "Founder Mistakes" },
  { id: "faq", label: "FAQ" },
  { id: "assessment", label: "Assessment" },
]

export function GrantsContent() {
  return (
    <>
      {/* ── OVERVIEW ── */}
      <section id="overview" className="bg-bg py-20 md:py-28">
        <div className="max-w-[1200px] mx-auto px-8">
          <div className="flex gap-16">
            <div className="w-48 flex-shrink-0">
              <StickyToc items={tocItems} />
            </div>
            <div className="flex-1 min-w-0 max-w-content space-y-6 text-body text-fg/80">
              <p className="section-label">Overview</p>
              <p>
                Grants are a tool, not a strategy. They are one component of a non-dilutive capital
                stack — and for most founders, they are not the component that should come first.
              </p>
              <p>
                Founders often chase grants for emotional reasons: validation, runway anxiety, the
                appeal of money that feels free. But non-dilutive capital should be evaluated like
                any other resource — by friction, odds, timing, and strategic alignment with work
                the company already needs to do.
              </p>
              <p>
                For Canadian founders in particular, SR&ED is often the highest-priority non-dilutive
                mechanism. It rewards work already underway, aligns with the company&apos;s actual
                technical roadmap, and does not require winning a competition.
              </p>

              <div className="mt-10">
                <StatCallout
                  items={[
                    {
                      label: "Odds",
                      description:
                        "Most competitive grant programs have low success rates. Founders routinely overestimate their chances and underestimate the pool of applicants.",
                    },
                    {
                      label: "Delay",
                      description:
                        "From application to decision to disbursement, grant timelines are almost always longer than founders expect. Months of work can yield nothing.",
                    },
                    {
                      label: "Compliance",
                      description:
                        "Winning a grant is not the end. Reporting, documentation, audits, and milestone tracking create ongoing administrative drag that persists long after the award.",
                    },
                    {
                      label: "Focus",
                      description:
                        "Every hour spent on a grant application is an hour not spent on product, customers, or revenue. The opportunity cost is real and usually underpriced.",
                    },
                  ]}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── WHAT ACTUALLY MATTERS ── */}
      <section id="what-matters" className="bg-[#0d1b2a] py-20 md:py-28">
        <div className="max-w-[1200px] mx-auto px-8">
          <div className="flex gap-16">
            <div className="w-48 flex-shrink-0 hidden lg:block" />
            <div className="flex-1 min-w-0 max-w-content">
              <p className="section-label-light">What Actually Matters</p>
              <p className="text-[1.1rem] text-white/50 mb-4">
                Not all non-dilutive funding is created equal.
              </p>
              <p className="text-body text-white/70 mb-10">
                Founders should prioritize capital sources by reliability, speed, alignment with
                actual roadmap, administrative burden, and probability-adjusted value. When you
                apply those filters honestly, the hierarchy becomes clear.
              </p>

              <ComparisonMatrix
                variant="dark"
                columns={[
                  { label: "SR&ED", highlight: true },
                  { label: "IRAP / R&D Support" },
                  { label: "Traditional Grants" },
                ]}
                rows={[
                  {
                    dimension: "Speed",
                    values: [
                      "Filed with tax return; refunds within weeks to months",
                      "Application-based; moderate review cycles",
                      "Slow — months from application to decision, often longer to disbursement",
                    ],
                  },
                  {
                    dimension: "Certainty",
                    values: [
                      "High — based on qualifying work already done",
                      "Moderate — competitive but with clearer criteria",
                      "Low — competitive, subjective, and often unpredictable",
                    ],
                  },
                  {
                    dimension: "Admin Burden",
                    values: [
                      "Documentation of technical work; manageable with proper systems",
                      "Milestone reporting and financial tracking",
                      "Heavy — proposals, budgets, reports, audits, compliance reviews",
                    ],
                  },
                  {
                    dimension: "Dependence Risk",
                    values: [
                      "Low — rewards past work, not future promises",
                      "Low to moderate — tied to specific projects",
                      "High — builds expectation of continued grant reliance",
                    ],
                  },
                  {
                    dimension: "Founder Distraction",
                    values: [
                      "Minimal if properly structured",
                      "Moderate — application and reporting overhead",
                      "Significant — can consume weeks of founder time per application",
                    ],
                  },
                  {
                    dimension: "Strategic Fit",
                    values: [
                      "Directly aligned with R&D the company is already doing",
                      "Usually aligned with technical roadmap",
                      "Often requires contorting roadmap to match grant criteria",
                    ],
                  },
                ]}
              />

              <p className="text-sm text-white/40 mt-6 italic">
                SR&ED and pragmatic low-friction programs come first. Traditional grants are
                conditional and secondary.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── MID-PAGE CTA ── */}
      <section className="bg-bg">
        <CtaPanel
          headline="Know which non-dilutive capital actually deserves your attention."
          body="execom helps founders prioritize the funding mechanisms that fit — and stop wasting time on the ones that do not."
          primaryLabel="Assess Non-Dilutive Strategy"
          secondaryLabel="Talk With Execom"
        />
      </section>

      {/* ── THE CANADA FACTOR ── */}
      <section id="canada-factor" className="bg-[#0d1b2a] py-20 md:py-28 relative">
        <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-teal/40 via-teal/20 to-transparent" />

        <div className="max-w-[1200px] mx-auto px-8">
          <div className="flex gap-16">
            <div className="w-48 flex-shrink-0 hidden lg:block" />
            <div className="flex-1 min-w-0 max-w-content">
              <p className="text-teal text-nav uppercase tracking-widest mb-3">
                Signature Section
              </p>
              <h2 className="text-[2rem] md:text-[2.5rem] font-serif text-white leading-tight mb-4">
                The Canada Factor
              </h2>
              <p className="text-[1.1rem] text-white/50 mb-8">
                Why Canadian founders get pushed toward grants — and why that often becomes a trap.
              </p>

              <div className="border border-white/10 bg-white/[0.03] rounded-sm p-8 mb-10">
                <p className="text-body text-white/70 leading-relaxed">
                  Canada&apos;s capital environment pushes founders toward non-dilutive funding earlier
                  than in the United States. That part is rational. The problem is that many founders
                  then over-rotate into slow, competitive grant programs instead of focusing on the
                  highest-leverage options first. In Canada, the right answer is often not &ldquo;more
                  grants.&rdquo; It is sharper prioritization: SR&amp;ED first, practical support second,
                  grant-chasing only when tightly justified.
                </p>
              </div>

              <AccordionSection
                variant="dark"
                items={[
                  {
                    title: "Canada makes founders capital-hungry",
                    content: (
                      <p>
                        Canada has smaller capital pools, slower fundraising cycles, smaller check
                        sizes, and fewer acquirers. This makes founders understandably hungry for
                        non-dilutive money. The instinct is correct — reducing dilution is smart.
                        The mistake is letting that hunger drive founders toward whichever programs
                        appear most available rather than which ones are actually highest-leverage.
                      </p>
                    ),
                  },
                  {
                    title: "Grants become a psychological crutch",
                    content: (
                      <p>
                        When capital is scarce, founders start seeing grants as salvation. Applications
                        feel productive — they involve strategy, writing, financial modeling, timelines.
                        But activity is not progress. A grant application that takes three weeks and
                        has a low acceptance rate is not a capital strategy. It is busywork with a
                        lottery ticket attached. Founders who replace traction-building with
                        grant-chasing rarely come out ahead.
                      </p>
                    ),
                  },
                  {
                    title: "The small-market / slow-adoption problem",
                    content: (
                      <p>
                        Canadian enterprise adoption is slower and the domestic market is smaller.
                        This means founders already face longer timelines to prove traction and
                        generate revenue. A grant process — with its own months-long cycle — layered
                        on top of an already slow market creates compounding delay. Time spent waiting
                        on grant decisions is time not spent converting customers or demonstrating
                        the growth that investors and partners actually care about.
                      </p>
                    ),
                  },
                  {
                    title: "Why SR&ED matters more in Canada",
                    content: (
                      <p>
                        For many Canadian innovation companies, SR&amp;ED is the real workhorse of
                        non-dilutive capital. It aligns with actual R&amp;D spend, rewards work already
                        being done, and operates on a fundamentally different model than competitive
                        grants. SR&amp;ED does not require winning a pitch competition or aligning your
                        roadmap with someone else&apos;s priorities. It is usually more strategically
                        important — and more financially significant — than spending months chasing
                        uncertain grants. Most founders underuse it.
                      </p>
                    ),
                  },
                  {
                    title: "Why execom exists",
                    content: (
                      <p>
                        execom exists to help founders prioritize the right non-dilutive capital,
                        structure SR&amp;ED claims properly, avoid grant-chasing as a substitute for
                        strategy, and use funding as leverage rather than as a crutch. The Canadian
                        ecosystem does not need more grant directories. It needs better judgment
                        about what is actually worth pursuing.
                      </p>
                    ),
                  },
                ]}
              />

              <PullQuote variant="dark">
                Canadian founders do not need more funding folklore. They need a hierarchy of what
                is actually worth pursuing.
              </PullQuote>
            </div>
          </div>
        </div>
      </section>

      {/* ── GRANT REALITY ── */}
      <section id="grant-reality" className="bg-bg py-20 md:py-28">
        <div className="max-w-[1200px] mx-auto px-8">
          <div className="flex gap-16">
            <div className="w-48 flex-shrink-0 hidden lg:block" />
            <div className="flex-1 min-w-0 max-w-content">
              <p className="section-label">Grant Reality</p>
              <p className="text-body text-fg/70 mb-8">
                The honest version of how grant programs work for most founders.
              </p>
              <AccordionSection
                items={[
                  {
                    title: "Grants are not free money",
                    content: (
                      <p>
                        Every grant has a cost: the time to apply, the constraints on how funds are
                        used, the compliance obligations that follow, and the opportunity cost of
                        what the founder could have been doing instead. The nominal dollar amount
                        is almost never the real value once friction is accounted for. Founders who
                        think of grants as free money are miscalculating the cost of their own time.
                      </p>
                    ),
                  },
                  {
                    title: "Low odds are the norm",
                    content: (
                      <p>
                        Most competitive grant programs have acceptance rates that would discourage
                        founders if they saw the numbers clearly. Rejection is normal, not exceptional.
                        Founders routinely overestimate their chances because the application process
                        feels serious and professional — but feeling competitive and being competitive
                        are different things. Expecting to win a grant is not a capital strategy.
                      </p>
                    ),
                  },
                  {
                    title: "Timelines are usually worse than founders expect",
                    content: (
                      <p>
                        From application to decision, weeks become months. From decision to
                        disbursement, more months pass. Many grant programs operate on reimbursement
                        models, meaning the company must spend the money first and recover it later —
                        sometimes much later. Founders who factor grant funds into near-term cash
                        flow projections are building on assumptions that frequently collapse.
                      </p>
                    ),
                  },
                  {
                    title: "Compliance survives long after the award",
                    content: (
                      <p>
                        Winning a grant starts a reporting relationship. Milestone tracking, financial
                        documentation, progress reports, and potential audits create an administrative
                        tail that extends well beyond the initial award. This overhead is real, ongoing,
                        and almost always underestimated at application time.
                      </p>
                    ),
                  },
                  {
                    title: "Never build the business assuming grant cash arrives",
                    content: (
                      <p>
                        A business model that depends on grant funding to stay viable is not a
                        business model. Grants should supplement a company that is already functional
                        without them. If removing the grant from the financial model causes the
                        company to fail, the problem is not the grant — it is the business.
                      </p>
                    ),
                  },
                ]}
              />
            </div>
          </div>
        </div>
      </section>

      {/* ── SR&ED FIRST ── */}
      <section id="sred-first" className="bg-[#0d1b2a] py-20 md:py-28 relative">
        {/* Stronger visual treatment for this section */}
        <div className="absolute top-0 right-0 w-1/4 h-full bg-gradient-to-l from-[#195E8E]/10 to-transparent" />

        <div className="max-w-[1200px] mx-auto px-8 relative">
          <div className="flex gap-16">
            <div className="w-48 flex-shrink-0 hidden lg:block" />
            <div className="flex-1 min-w-0 max-w-content">
              <p className="section-label-light">SR&amp;ED First</p>
              <h2 className="text-[1.75rem] md:text-[2rem] font-serif text-white leading-tight mb-3">
                Start with SR&amp;ED.
              </h2>
              <p className="text-[1.05rem] text-white/50 mb-8">
                For many Canadian founders, this is the non-dilutive priority that matters most.
              </p>

              <AccordionSection
                variant="dark"
                items={[
                  {
                    title: "Why SR&ED usually comes first",
                    content: (
                      <p>
                        SR&amp;ED is not speculative. It is based on qualifying technical work your
                        company has already done. It does not require a pitch, a competition, or
                        contorting your roadmap. It aligns with actual R&amp;D spend and rewards
                        genuine innovation work. For many Canadian innovation companies, SR&amp;ED
                        represents the largest single source of non-dilutive capital available —
                        and it is routinely underleveraged.
                      </p>
                    ),
                  },
                  {
                    title: "Retroactive recovery vs speculative applications",
                    content: (
                      <p>
                        The fundamental difference between SR&amp;ED and traditional grants is the
                        direction of the bet. SR&amp;ED recovers money on work already performed.
                        Grants ask you to predict and promise work that may or may not unfold as
                        proposed. One is grounded. The other is speculative. Founders should exhaust
                        the grounded option before investing heavily in the speculative one.
                      </p>
                    ),
                  },
                  {
                    title: "Why founders underuse it",
                    content: (
                      <p>
                        Many founders think SR&amp;ED is only for large companies, requires complex
                        filings they cannot handle, or produces insignificant returns. None of this
                        is accurate. Early-stage companies with genuine technical work often qualify
                        for meaningful claims. The problem is usually not eligibility — it is
                        awareness, documentation habits, and the quality of advisory support.
                      </p>
                    ),
                  },
                  {
                    title: "How it fits into a real capital stack",
                    content: (
                      <p>
                        SR&amp;ED should be the foundation layer of a non-dilutive capital strategy.
                        It provides a reliable, recurring source of capital that strengthens the
                        company&apos;s position before layering on other instruments — whether that is
                        IRAP, selective grants, revenue-based financing, or equity. Every other
                        non-dilutive decision should be made after SR&amp;ED is properly structured.
                      </p>
                    ),
                  },
                ]}
              />

              <PullQuote variant="dark">
                If your company is doing qualifying technical work in Canada, ignoring SR&amp;ED
                while chasing grants is usually backwards.
              </PullQuote>
            </div>
          </div>
        </div>
      </section>

      {/* ── MID-PAGE CTA ── */}
      <section className="bg-bg">
        <CtaPanel
          headline="Is your SR&ED structured correctly?"
          body="Most founders leave money on the table. execom helps structure SR&ED claims before layering on other non-dilutive capital."
          primaryLabel="Assess Non-Dilutive Strategy"
          secondaryLabel="Talk With Execom"
        />
      </section>

      {/* ── IRAP & PRACTICAL PROGRAMS ── */}
      <section id="practical-programs" className="bg-[#0d1b2a] py-20 md:py-28">
        <div className="max-w-[1200px] mx-auto px-8">
          <div className="flex gap-16">
            <div className="w-48 flex-shrink-0 hidden lg:block" />
            <div className="flex-1 min-w-0 max-w-content">
              <p className="section-label-light">IRAP &amp; Practical Programs</p>
              <h2 className="text-[1.5rem] md:text-[1.75rem] font-serif text-white leading-tight mb-3">
                Practical programs worth evaluating.
              </h2>
              <p className="text-body text-white/70 mb-8">
                This is not a directory. It is a short list of program categories that — under the
                right conditions — can be worth the founder&apos;s time. The filter is simple: does it
                fund work you were already doing, at an acceptable administrative cost, without
                pulling the company off course?
              </p>
              <AccordionSection
                variant="dark"
                items={[
                  {
                    title: "IRAP",
                    content: (
                      <p>
                        The National Research Council&apos;s Industrial Research Assistance Program
                        provides advisory services and funding for R&amp;D projects. For early-stage
                        companies, IRAP can be a meaningful complement to SR&amp;ED — covering
                        project-specific costs with a relatively clear application process and
                        assigned advisors. It works best when the project scope is well-defined and
                        the company already has technical capacity to execute.
                      </p>
                    ),
                  },
                  {
                    title: "Selective provincial support",
                    content: (
                      <p>
                        Several provinces offer innovation support that, for the right company, can
                        be worth pursuing. Alberta Innovates, Ontario&apos;s programs, and similar
                        provincial instruments have varying relevance depending on geography, sector,
                        and stage. The key is selectivity — not applying to everything available, but
                        targeting the programs that genuinely fit.
                      </p>
                    ),
                  },
                  {
                    title: "Export support where directly relevant",
                    content: (
                      <p>
                        For companies already planning cross-border or international go-to-market,
                        certain trade and export support programs can reduce the cost of market entry.
                        These make sense when the company is already committed to the expansion — not
                        when the grant is the reason for expanding.
                      </p>
                    ),
                  },
                  {
                    title: "Tightly aligned R&D support",
                    content: (
                      <p>
                        Programs that fund specific technical development — not general operations —
                        can be useful when the project already exists on the roadmap. The test is
                        simple: would you do this work without the funding? If yes, the program is
                        an accelerant. If no, the program is pulling you off course.
                      </p>
                    ),
                  },
                  {
                    title: "Programs that stack with SR&ED",
                    content: (
                      <p>
                        Some non-dilutive programs can be combined with SR&amp;ED claims, effectively
                        increasing the total recovery on qualifying work. Understanding how
                        instruments interact — what stacks, what offsets, and what creates audit
                        complexity — is part of structuring a non-dilutive capital strategy properly
                        rather than treating each program in isolation.
                      </p>
                    ),
                  },
                ]}
              />
            </div>
          </div>
        </div>
      </section>

      {/* ── WHEN GRANTS MAKE SENSE ── */}
      <section id="when-grants-work" className="bg-bg py-20 md:py-28">
        <div className="max-w-[1200px] mx-auto px-8">
          <div className="flex gap-16">
            <div className="w-48 flex-shrink-0 hidden lg:block" />
            <div className="flex-1 min-w-0 max-w-content">
              <p className="section-label">When Grants Make Sense</p>
              <p className="text-body text-fg/70 mb-8">
                Grants are not always wrong. There are specific conditions under which they are
                worth pursuing. The page would be dishonest if it said otherwise.
              </p>
              <AccordionSection
                items={[
                  {
                    title: "Deep tech / hard science / long technical-risk cycles",
                    content: (
                      <p>
                        Companies with genuinely long development timelines — biotech, advanced
                        materials, hardware with multi-year R&amp;D cycles — often have a stronger
                        case for grant funding. The timeline mismatch between venture capital
                        expectations and deep-tech reality means non-dilutive capital can be
                        structurally important, not just convenient.
                      </p>
                    ),
                  },
                  {
                    title: "Government-as-customer situations",
                    content: (
                      <p>
                        When the grant-giving body is also a potential customer or procurement
                        partner, the relationship has value beyond the dollars. Defence, health,
                        infrastructure, and public safety verticals sometimes offer grants that
                        double as market validation and customer development.
                      </p>
                    ),
                  },
                  {
                    title: "Projects already aligned with grant criteria",
                    content: (
                      <p>
                        If the company was going to do the work anyway, and the grant criteria
                        happen to match, the marginal cost of applying is lower and the strategic
                        distortion is minimal. This is the cleanest use case — the grant accelerates
                        existing motion rather than creating new motion for its own sake.
                      </p>
                    ),
                  },
                  {
                    title: "Teams with enough runway and admin capacity",
                    content: (
                      <p>
                        A two-person team burning through its last six months of runway should not
                        be writing grant applications. A team with 18 months of runway, a dedicated
                        operations person, and a clear project scope is in a different position.
                        Grants require organizational capacity that early-stage founders rarely have.
                      </p>
                    ),
                  },
                  {
                    title: "Grants as acceleration, not foundation",
                    content: (
                      <p>
                        The clearest signal that a grant is worth pursuing: removing it from the plan
                        would not change the company&apos;s direction. It would only change the speed.
                        If the grant is the reason the project exists, that is a dependency. If the
                        grant makes an existing project faster, that is leverage.
                      </p>
                    ),
                  },
                ]}
              />

              <PullQuote>
                Grants are best used as accelerants for motion that already exists, not as
                substitutes for motion.
              </PullQuote>
            </div>
          </div>
        </div>
      </section>

      {/* ── HIDDEN COSTS ── */}
      <section id="hidden-costs" className="bg-[#0d1b2a] py-20 md:py-28">
        <div className="max-w-[1200px] mx-auto px-8">
          <div className="flex gap-16">
            <div className="w-48 flex-shrink-0 hidden lg:block" />
            <div className="flex-1 min-w-0 max-w-content">
              <p className="section-label-light">Hidden Costs</p>
              <p className="text-body text-white/60 mb-8">
                The real price of &ldquo;free money.&rdquo;
              </p>
              <AccordionSection
                variant="dark"
                items={[
                  {
                    title: "Founder time cost",
                    content: (
                      <p>
                        A serious grant application is not a weekend project. Research, writing,
                        financial projections, technical narratives, letters of support, and
                        revisions can easily consume two to four weeks of focused founder time.
                        Multiply that by several applications per year and the time cost becomes a
                        meaningful percentage of the founder&apos;s productive capacity — time that
                        was not spent on product, customers, or revenue.
                      </p>
                    ),
                  },
                  {
                    title: "Reporting and compliance burden",
                    content: (
                      <p>
                        Grant recipients enter a reporting relationship that typically requires
                        quarterly or semi-annual progress reports, financial reconciliation,
                        milestone documentation, and sometimes formal audits. This is not optional.
                        Non-compliance can trigger clawback provisions. The administrative overhead
                        is persistent and cumulative.
                      </p>
                    ),
                  },
                  {
                    title: "Reimbursement lag and cash flow risk",
                    content: (
                      <p>
                        Many grant programs operate on a reimbursement basis: spend first, submit
                        documentation, wait for review, then receive funds. Delays of months are
                        common. Founders who factor grant reimbursements into near-term cash flow
                        projections are building on timing assumptions that frequently slip — and
                        when they slip, the company absorbs the gap.
                      </p>
                    ),
                  },
                  {
                    title: "Audit / documentation exposure",
                    content: (
                      <p>
                        Grant-funded activities may be subject to audit, sometimes years after the
                        project ends. Inadequate documentation at the time of spending can create
                        retroactive compliance problems. This is especially risky for early-stage
                        companies that do not yet have robust financial and project-tracking systems.
                      </p>
                    ),
                  },
                  {
                    title: "The distraction tax",
                    content: (
                      <p>
                        Beyond the measurable time costs, grant-chasing creates a subtler problem:
                        it shifts the founder&apos;s attention from building a business to performing
                        for a funding body. Roadmaps start bending toward grant criteria. Language
                        gets optimized for reviewers instead of customers. The company slowly
                        orients around external validation rather than market traction. This is
                        the most expensive hidden cost — and the hardest to see from inside.
                      </p>
                    ),
                  },
                ]}
              />
            </div>
          </div>
        </div>
      </section>

      {/* ── MID-PAGE CTA ── */}
      <section className="bg-bg">
        <CtaPanel
          headline="Stop chasing. Start prioritizing."
          body="execom helps founders build a non-dilutive capital strategy that starts with what works and treats grants as conditional."
          primaryLabel="Assess Non-Dilutive Strategy"
          secondaryLabel="Talk With Execom"
        />
      </section>

      {/* ── FOUNDER MISTAKES ── */}
      <section id="founder-mistakes" className="bg-[#0d1b2a] py-20 md:py-28">
        <div className="max-w-[1200px] mx-auto px-8">
          <div className="flex gap-16">
            <div className="w-48 flex-shrink-0 hidden lg:block" />
            <div className="flex-1 min-w-0 max-w-content">
              <p className="section-label-light">Founder Mistakes</p>
              <p className="text-body text-white/60 mb-10">
                The patterns that cost founders the most when it comes to non-dilutive capital.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  {
                    title: "Treating grants as strategy",
                    desc: "Grants are a tool. When they become the plan, the company is building on someone else's timeline, criteria, and approval process.",
                  },
                  {
                    title: "Ignoring SR&ED",
                    desc: "The highest-leverage non-dilutive capital for most Canadian innovation companies. Underusing it while chasing grants is usually backwards.",
                  },
                  {
                    title: "Applying before checking fit",
                    desc: "Submitting applications to programs that do not match the company's stage, sector, or activities wastes time and builds false hope.",
                  },
                  {
                    title: "Designing roadmap around the grant",
                    desc: "When the grant criteria start shaping what the company builds, the company has lost strategic autonomy for conditional money.",
                  },
                  {
                    title: "Underestimating founder time cost",
                    desc: "Multiple grant applications per year can consume a meaningful share of the founder's productive capacity. That time had a value.",
                  },
                  {
                    title: "Assuming reimbursement timing",
                    desc: "Building cash flow projections around expected grant disbursements is a structural risk. Delays are normal, not exceptional.",
                  },
                  {
                    title: "Failing to build documentation early",
                    desc: "Poor records at the time of spending create compliance problems months or years later — for both grants and SR&ED.",
                  },
                  {
                    title: "Depending on grants to validate",
                    desc: "Winning a grant is not market validation. Customers paying for your product is validation. Do not confuse the two.",
                  },
                ].map((item, i) => (
                  <div
                    key={i}
                    className="border border-white/10 bg-white/[0.03] rounded-sm p-5"
                  >
                    <p className="text-teal text-[13px] font-semibold uppercase tracking-wider mb-2">
                      {String(i + 1).padStart(2, "0")}
                    </p>
                    <p className="text-white/90 font-medium text-[0.95rem] mb-2">
                      {item.title}
                    </p>
                    <p className="text-white/50 text-sm leading-relaxed">
                      {item.desc}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section id="faq" className="bg-bg py-20 md:py-28">
        <div className="max-w-[1200px] mx-auto px-8">
          <div className="flex gap-16">
            <div className="w-48 flex-shrink-0 hidden lg:block" />
            <div className="flex-1 min-w-0 max-w-content">
              <p className="section-label">FAQ</p>
              <AccordionSection
                items={[
                  {
                    title: "Are grants worth it for startups?",
                    content: (
                      <p>
                        Sometimes — but far less often than founders assume. Grants are worth it
                        when the project already fits, the company can absorb the timeline and
                        compliance burden, and the grant supplements work that would happen anyway.
                        For most early-stage startups, other non-dilutive instruments should come
                        first.
                      </p>
                    ),
                  },
                  {
                    title: "What should Canadian founders prioritize first?",
                    content: (
                      <p>
                        SR&amp;ED. For companies doing qualifying technical work, it is usually the
                        highest-leverage, most reliable, and least distracting source of non-dilutive
                        capital. After SR&amp;ED is properly structured, evaluate IRAP and selective
                        practical programs. Competitive grants come last — and only when tightly
                        aligned.
                      </p>
                    ),
                  },
                  {
                    title: "Is SR&ED more important than grants?",
                    content: (
                      <p>
                        For most qualifying Canadian companies, yes. SR&amp;ED rewards work already
                        done, operates on a more predictable timeline, and does not require winning
                        a competition. It should typically be optimized before serious grant-chasing
                        begins.
                      </p>
                    ),
                  },
                  {
                    title: "What is the difference between SR&ED and IRAP?",
                    content: (
                      <p>
                        SR&amp;ED is a federal tax incentive that provides refundable credits for
                        qualifying R&amp;D expenditures — it is retroactive and based on work already
                        performed. IRAP is a project-based funding program through the National
                        Research Council that provides advisory and financial support for specific
                        R&amp;D projects — it is prospective and requires an application. They can
                        complement each other but operate on different models.
                      </p>
                    ),
                  },
                  {
                    title: "When do grants actually make sense?",
                    content: (
                      <p>
                        Deep tech with long development cycles, government-as-customer situations,
                        projects already aligned with grant criteria, and teams with enough runway
                        and administrative capacity to absorb the process. The test: would you do
                        this work without the grant? If yes, apply. If no, reconsider.
                      </p>
                    ),
                  },
                  {
                    title: "Can grants hurt more than they help?",
                    content: (
                      <p>
                        Yes. When grants consume disproportionate founder time, distort the roadmap,
                        create dependency, or delay traction-building activities, the net effect is
                        negative. The dollar amount of the grant can be smaller than the opportunity
                        cost of pursuing it.
                      </p>
                    ),
                  },
                  {
                    title: "What should I do before applying?",
                    content: (
                      <p>
                        Ensure SR&amp;ED is structured. Confirm the grant criteria genuinely match
                        your current work. Estimate the realistic time cost of the application.
                        Check whether the program operates on reimbursement and model the cash flow
                        impact. Ask honestly: is this the best use of the next three weeks of my
                        time?
                      </p>
                    ),
                  },
                  {
                    title: "Can I build a business around grants?",
                    content: (
                      <p>
                        No. A business that depends on winning grants to stay viable is not a
                        business — it is a grant-dependent organization. Grants should supplement
                        a company that is already functional without them. If the grant disappears
                        and the company fails, the problem was never the grant.
                      </p>
                    ),
                  },
                ]}
              />
            </div>
          </div>
        </div>
      </section>

      {/* ── ASSESSMENT / FINAL CTA ── */}
      <section id="assessment" className="bg-[#0d1b2a] py-20 md:py-28">
        <CtaPanel
          variant="dark"
          headline="Do not confuse non-dilutive funding with easy money."
          body="The right funding can extend runway and strengthen your position. The wrong pursuit can drain attention, delay traction, and create false confidence. execom helps founders focus on the non-dilutive capital that actually matters."
          primaryLabel="Assess Non-Dilutive Strategy"
          primaryHref="/engage"
          secondaryLabel="Engage Execom"
          secondaryHref="/engage"
        />
      </section>
    </>
  )
}
