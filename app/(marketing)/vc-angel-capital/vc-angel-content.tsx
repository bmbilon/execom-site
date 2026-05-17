"use client"

import { StickyToc } from "@/components/marketing/sticky-toc"
import { AccordionSection } from "@/components/marketing/accordion-section"
import { CtaPanel } from "@/components/marketing/cta-panel"
import { StatCallout, PullQuote } from "@/components/marketing/stat-callout"

const tocItems = [
  { id: "overview", label: "Overview" },
  { id: "market-now", label: "The Market Now" },
  { id: "canada-factor", label: "The Canada Factor" },
  { id: "raise-or-not", label: "Raise or Not" },
  { id: "angels-vs-vc", label: "Angels vs VC" },
  { id: "safe-vs-priced", label: "SAFE vs Priced" },
  { id: "term-sheets", label: "Term Sheets" },
  { id: "founder-mistakes", label: "Founder Mistakes" },
  { id: "equity-benchmarks", label: "Equity Benchmarks" },
  { id: "faq", label: "Founder FAQ" },
  { id: "assessment", label: "Assessment" },
]

export function VCAngelContent() {
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
                Venture capital is one financing tool among several. It is not the default path,
                and it is not a signal of legitimacy. A viable company is not automatically a viable
                venture outcome, and the difference between those two things is where most capital
                strategy mistakes begin.
              </p>
              <p>
                Founders should understand the math before they raise: what they will give up,
                what they will be expected to deliver, and whether the structure of venture capital
                actually fits the trajectory of their business.
              </p>

              <div className="mt-10">
                <StatCallout
                  items={[
                    {
                      label: "Speed",
                      description:
                        "Venture capital accelerates growth, but it also accelerates the timeline within which you must deliver returns. Speed is a commitment, not a gift.",
                    },
                    {
                      label: "Dilution",
                      description:
                        "Every round reduces founder ownership. Early-stage equity is the most expensive capital you will ever issue. The math compounds quietly.",
                    },
                    {
                      label: "Control",
                      description:
                        "Board seats, protective provisions, and veto rights are contractual. Once signed, they do not get renegotiated without leverage you may not have.",
                    },
                  ]}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── THE MARKET NOW ── */}
      <section id="market-now" className="bg-[#0d1b2a] py-20 md:py-28">
        <div className="max-w-[1200px] mx-auto px-8">
          <div className="flex gap-16">
            <div className="w-48 flex-shrink-0 hidden lg:block" />
            <div className="flex-1 min-w-0 max-w-content">
              <p className="section-label-light">The Market Now</p>
              <p className="text-body text-white/70 mb-8">
                The venture capital market has changed structurally. Headline numbers obscure the
                reality most founders face. Understanding the current environment is prerequisite
                to making sound capital decisions.
              </p>
              <AccordionSection
                variant="dark"
                items={[
                  {
                    title: "The funding environment changed",
                    content: (
                      <p>
                        The comfortable 18-month fundraising cadence of 2019–2021 is gone. Capital
                        is concentrating into fewer companies, and the majority of venture dollars
                        now flow into AI-centric firms. For founders outside that lane, the
                        competitive landscape for funding looks nothing like the headlines suggest.
                        Deal counts have dropped even as total dollar volume rose, meaning more
                        capital flows into fewer companies at larger check sizes.
                      </p>
                    ),
                  },
                  {
                    title: "AI gets the headlines, not everyone gets the capital",
                    content: (
                      <p>
                        The majority of global venture investment is now concentrated in
                        AI-centric companies. Non-AI founders are competing for the remainder in a
                        materially more selective environment. This is not speculation, it is the
                        structural reality of how capital is being deployed. If your company is not
                        AI-native, your fundraising playbook needs to reflect a different market.
                      </p>
                    ),
                  },
                  {
                    title: "Fundraising takes longer now",
                    content: (
                      <p>
                        The median time between rounds has stretched significantly. Seed to Series
                        A now takes over two years on average. The full fundraising process, from
                        first outreach to close, realistically takes five to ten months. Founders
                        must plan accordingly: if you have 18 months of runway, you actually have
                        roughly nine months to build traction before you need to restart the raise.
                      </p>
                    ),
                  },
                  {
                    title: "Down rounds are no longer rare",
                    content: (
                      <p>
                        Down rounds now represent a meaningful percentage of deals at every stage,
                        and the frequency increases significantly at later stages. Founders who raised
                        at peak valuations face a reckoning. Software revenue multiples have
                        compressed substantially from their 2021 levels, and fintech companies are
                        seeing even steeper corrections. The valuation environment has reset.
                      </p>
                    ),
                  },
                  {
                    title: "Fewer companies are getting funded",
                    content: (
                      <p>
                        Only a very small percentage of startups ever close venture capital funding.
                        Among those that raise seed rounds, a minority achieve a Series A within two
                        years. The funnel is narrower than most founders realize, and planning a
                        business that depends on the next round closing is a structural risk that
                        should be modeled, not assumed away.
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
          headline="Not sure if venture capital fits your trajectory?"
          body="execom helps founders evaluate capital strategy before decisions become irreversible."
          primaryLabel="Assess Your Capital Strategy"
          secondaryLabel="Talk With Execom"
        />
      </section>

      {/* ── THE CANADA FACTOR ── */}
      <section id="canada-factor" className="bg-[#0d1b2a] py-20 md:py-28 relative">
        {/* Distinctive treatment: subtle left border accent */}
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
                Why building and financing companies in Canada is structurally harder.
              </p>

              <div className="stage-card p-8 mb-10">
                <p className="relative text-body text-white/70 leading-relaxed">
                  Canada produces exceptional founders, but the environment is materially more
                  constrained than the United States. Capital is scarcer, check sizes are smaller,
                  enterprise adoption is slower, and growth-stage funding often comes from outside
                  the country. This does not make success impossible. It means founders need better
                  strategy earlier.
                </p>
              </div>

              <AccordionSection
                variant="dark"
                items={[
                  {
                    title: "Smaller pools of capital",
                    content: (
                      <p>
                        Canadian founders compete in a shallower capital pool with fewer active
                        firms, smaller checks, fewer competing term sheets, and more concentration.
                        The majority of domestic venture capital is captured by a small number of
                        large funds, leaving less available for new investments. The result is less
                        leverage for founders and a slower, more constrained process.
                      </p>
                    ),
                  },
                  {
                    title: "Slower, more conservative investor behavior",
                    content: (
                      <p>
                        The traction trap is real: Canadian founders are expected to show more proof
                        before investment, but they often need capital to create that proof. Decision
                        cycles are slower, risk tolerance is lower, and the bar for conviction is
                        higher than what most founders encounter in comparable US ecosystems. Angels
                        typically write smaller checks with stricter terms.
                      </p>
                    ),
                  },
                  {
                    title: "The small domestic market problem",
                    content: (
                      <p>
                        Canada&apos;s domestic market is not large enough for many venture outcomes on
                        its own. Enterprise technology adoption is slower, and the addressable
                        customer base for B2B startups is significantly smaller than the US
                        equivalent. Many founders must think cross-border much earlier than they
                        expect, which changes go-to-market strategy, pricing, and team composition.
                      </p>
                    ),
                  },
                  {
                    title: "Growth capital usually comes from elsewhere",
                    content: (
                      <p>
                        As companies mature, the domestic capital gap grows acute. Larger rounds
                        increasingly require US participation, which changes the game: longer
                        fundraising cycles, different governance expectations, and often relocation
                        pressure. A significant share of venture capital deployed in Canada now
                        originates from US-based investors, creating dependency on foreign capital
                        with its own set of terms and timelines.
                      </p>
                    ),
                  },
                  {
                    title: "Why execom exists",
                    content: (
                      <p>
                        execom exists to help founders overcome these structural constraints through
                        better capital strategy, non-dilutive funding guidance, market entry planning,
                        and sharper commercial positioning. The Canadian ecosystem does not need more
                        cheerleading. It needs better tools, clearer information, and advisory that
                        treats founders as capable adults navigating a difficult system.
                      </p>
                    ),
                  },
                ]}
              />

              <PullQuote variant="dark">
                Canadian founders do not fail because they are weaker. They fail because the system
                gives them less room for error.
              </PullQuote>
            </div>
          </div>
        </div>
      </section>

      {/* ── RAISE OR NOT ── */}
      <section id="raise-or-not" className="bg-bg py-20 md:py-28">
        <div className="max-w-[1200px] mx-auto px-8">
          <div className="flex gap-16">
            <div className="w-48 flex-shrink-0 hidden lg:block" />
            <div className="flex-1 min-w-0 max-w-content">
              <p className="section-label">Raise or Not</p>
              <p className="text-body text-fg/70 mb-8">
                The decision to raise is not about pride or ideology. It is about math, timing,
                and whether the structure of venture capital actually fits what you are building.
              </p>
              <AccordionSection
                items={[
                  {
                    title: "Bootstrap vs raise",
                    content: (
                      <div className="space-y-3">
                        <p>
                          The core diagnostic question: does your venture both need outside capital
                          and have the capacity to deliver the expected return? If yes, raise. If no,
                          bootstrap. If you do not know, you are not ready for either.
                        </p>
                        <p>
                          Bootstrap signals include a path to profitability within 6–12 months,
                          strong gross margins, sustainable unit economics, and markets that value
                          reliability over speed. Venture signals include winner-take-all dynamics,
                          network effects that require speed to capture, and capital-intensive
                          product development.
                        </p>
                      </div>
                    ),
                  },
                  {
                    title: "When venture capital actually makes sense",
                    content: (
                      <p>
                        VC makes sense when the opportunity is large enough, time-sensitive enough,
                        and capital-intensive enough that external funding creates a structural
                        advantage. Winner-take-all markets, network effects, and genuine
                        capital-intensity are the clearest signals. If the business can reach
                        profitability without dilution, the burden of proof falls on raising, not
                        on bootstrapping.
                      </p>
                    ),
                  },
                  {
                    title: "When it is a mistake",
                    content: (
                      <p>
                        VC is a mistake when founders raise because it feels like progress rather
                        than because the business requires it. Companies that can reach profitability
                        within 12–18 months, serve markets that do not reward blitzscaling, or
                        target exit outcomes below what fund math requires are structurally
                        mismatched with venture capital. The wrong capital at the wrong valuation
                        creates compounding problems that are expensive to unwind.
                      </p>
                    ),
                  },
                  {
                    title: "The hybrid path",
                    content: (
                      <p>
                        The hybrid path, bootstrapping to traction, then raising from strength,
                        delivers compounding advantages: higher valuations, less dilution, and proof
                        of execution that dramatically lowers investor risk. A founder raising a seed
                        round with meaningful revenue can command significantly better terms than
                        one raising on a pitch deck alone. Use traction before fundraising to
                        improve terms and preserve ownership.
                      </p>
                    ),
                  },
                ]}
              />
            </div>
          </div>
        </div>
      </section>

      {/* ── ANGELS VS VC ── */}
      <section id="angels-vs-vc" className="bg-[#0d1b2a] py-20 md:py-28">
        <div className="max-w-[1200px] mx-auto px-8">
          <div className="flex gap-16">
            <div className="w-48 flex-shrink-0 hidden lg:block" />
            <div className="flex-1 min-w-0 max-w-content">
              <p className="section-label-light">Angels vs VC</p>
              <p className="text-body text-white/70 mb-8">
                Angels and institutional VCs differ across dimensions that reshape the founder
                experience. Neither is inherently superior, the choice depends on stage, governance
                tolerance, and follow-on requirements.
              </p>
              <AccordionSection
                variant="dark"
                items={[
                  {
                    title: "What angels are good for",
                    content: (
                      <p>
                        Angels close faster, typically in weeks rather than months. They take
                        minority stakes with flexible involvement. Return expectations are lower,
                        targeting three to ten times return rather than the ten to fifteen times
                        required by institutional funds. This math means a moderate exit can be a
                        success for an angel but a failure in VC terms. Angels are best suited for
                        early conviction capital, speed, and relationships.
                      </p>
                    ),
                  },
                  {
                    title: "What institutional VC changes",
                    content: (
                      <p>
                        Institutional VC introduces structured governance: board seats, approval
                        requirements on strategic pivots, senior hires, and future raises. The fund
                        model drives behavior, every investment must be evaluated against portfolio
                        return expectations. This creates alignment when the business is on a venture
                        trajectory, and tension when it is not.
                      </p>
                    ),
                  },
                  {
                    title: "Speed vs governance",
                    content: (
                      <p>
                        Angel rounds close in weeks. Institutional pre-seed and seed rounds take
                        months. The difference is not just time, it reflects the depth of diligence,
                        the number of approvals required, and the governance framework that comes
                        attached to the capital. Founders should choose based on what their company
                        needs, not what feels most flattering.
                      </p>
                    ),
                  },
                  {
                    title: "Follow-on capacity",
                    content: (
                      <p>
                        Most angels cannot lead future rounds or provide the institutional
                        credibility that later-stage investors look for when evaluating a company.
                        VCs can. If your capital strategy depends on signaling strength for future
                        rounds, the source of your early capital matters beyond the dollar amount.
                      </p>
                    ),
                  },
                ]}
              />
            </div>
          </div>
        </div>
      </section>

      {/* ── SAFE VS PRICED ── */}
      <section id="safe-vs-priced" className="bg-bg py-20 md:py-28">
        <div className="max-w-[1200px] mx-auto px-8">
          <div className="flex gap-16">
            <div className="w-48 flex-shrink-0 hidden lg:block" />
            <div className="flex-1 min-w-0 max-w-content">
              <p className="section-label">SAFE vs Priced</p>
              <p className="text-body text-fg/70 mb-8">
                SAFEs are fast and cheap. They are also where hidden dilution compounds. One SAFE
                is a tool. Multiple SAFEs with different terms is a deferred problem.
              </p>
              <AccordionSection
                items={[
                  {
                    title: "Why founders like SAFEs",
                    content: (
                      <p>
                        SAFEs close in days rather than weeks. Legal costs are a fraction of a priced
                        round. There are no board seats, minimal investor rights, and no immediate
                        valuation negotiation. For early-stage companies moving fast with high
                        conviction investors, SAFEs eliminate friction. The majority of pre-seed
                        instruments now use the post-money SAFE format.
                      </p>
                    ),
                  },
                  {
                    title: "Where SAFEs become dangerous",
                    content: (
                      <p>
                        Post-money SAFEs give each investor a fixed percentage of the company, and
                        all dilution from subsequent SAFEs comes exclusively from founders and
                        existing shareholders, not from the new investors. Stacking multiple SAFEs
                        with different caps pushes compounding dilution onto founders that only
                        becomes visible when all instruments convert simultaneously at the next
                        priced round. By that point, the damage is structural and irreversible.
                      </p>
                    ),
                  },
                  {
                    title: "When priced rounds are cleaner",
                    content: (
                      <p>
                        Priced rounds take longer and cost more in legal fees, but they deliver
                        immediate cap table clarity. Everyone knows exactly what they own. There is
                        no deferred dilution, no stacking risk, and no surprise conversion math at
                        Series A. For larger raises or rounds with multiple investors, the upfront
                        cost of a priced round often pays for itself in avoided dilution.
                      </p>
                    ),
                  },
                  {
                    title: "How hidden dilution happens",
                    content: (
                      <p>
                        A founder raises three SAFEs at different valuation caps. Each one feels
                        reasonable in isolation. When Series A closes and all instruments convert
                        simultaneously, the combined dilution can exceed what a single priced round
                        would have produced, sometimes significantly. The problem is not any
                        individual SAFE. It is the failure to model the cumulative effect of
                        stacking them.
                      </p>
                    ),
                  },
                ]}
              />
            </div>
          </div>
        </div>
      </section>

      {/* ── TERM SHEETS ── */}
      <section id="term-sheets" className="bg-[#0d1b2a] py-20 md:py-28">
        <div className="max-w-[1200px] mx-auto px-8">
          <div className="flex gap-16">
            <div className="w-48 flex-shrink-0 hidden lg:block" />
            <div className="flex-1 min-w-0 max-w-content">
              <p className="section-label-light">Term Sheets</p>
              <p className="text-body text-white/70 mb-8">
                The term sheet is where the real negotiation happens. Founders who understand every
                clause negotiate better. Founders who do not lose control they never knew they had.
              </p>
              <AccordionSection
                variant="dark"
                items={[
                  {
                    title: "Liquidation preference",
                    content: (
                      <p>
                        The liquidation preference determines who gets paid first and how much in an
                        exit. A 1x non-participating preference means investors recover their
                        investment before common shareholders receive anything. A participating
                        preference lets investors recover their investment and share in remaining
                        proceeds, effectively taking from founders twice. Stacked preferences
                        across multiple rounds create a waterfall where later investors get paid
                        first, and founders and employees may receive nothing in moderate exits.
                      </p>
                    ),
                  },
                  {
                    title: "Anti-dilution",
                    content: (
                      <p>
                        Anti-dilution provisions protect investors in down rounds by adjusting their
                        conversion ratios upward, effectively reducing the founder&apos;s percentage to
                        compensate. Full ratchet resets entirely to the new lower price and is the
                        most punishing. Broad-based weighted average blends old and new prices and
                        is the founder-friendly version to negotiate for.
                      </p>
                    ),
                  },
                  {
                    title: "Board control",
                    content: (
                      <p>
                        Board composition rights, veto lists over strategic decisions, hiring and
                        firing approvals, and budget caps collectively replace founder autonomy with
                        board consensus. Control is not lost in boardrooms. It is contracted away in
                        term sheets. The erosion starts early and compounds quietly through
                        successive rounds.
                      </p>
                    ),
                  },
                  {
                    title: "Protective provisions",
                    content: (
                      <p>
                        Protective provisions appear in the vast majority of venture deals and
                        effectively give investors veto power over major decisions: future
                        fundraising, acquisitions, changes to the charter, executive compensation,
                        and more. The headline economics of a round may look standard. The
                        governance terms are where alignment diverges.
                      </p>
                    ),
                  },
                  {
                    title: "Option pool shuffles",
                    content: (
                      <p>
                        Investors frequently require an expanded employee stock option pool to be
                        carved out before the investment, meaning the dilution comes from the
                        pre-money capitalization, not post-money. This effectively reduces the
                        founder&apos;s pre-money stake before the round is even calculated, making the
                        headline valuation less meaningful than it appears.
                      </p>
                    ),
                  },
                ]}
              />
              <PullQuote variant="dark">
                Founders usually think they lose control in the boardroom. Most of the time, they
                lose it in the term sheet.
              </PullQuote>
            </div>
          </div>
        </div>
      </section>

      {/* ── MID-PAGE CTA ── */}
      <section className="bg-bg">
        <CtaPanel
          headline="Understand the terms before you sign them."
          body="execom helps founders evaluate term sheets, model dilution, and negotiate from a position of clarity."
          primaryLabel="Assess Your Capital Strategy"
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
                These are the patterns that cost founders the most, not because they are
                catastrophic individually, but because they compound.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  {
                    title: "Raising too early",
                    desc: "Before validated demand or warm investor relationships. A missed first impression in a small VC community is difficult to recover.",
                  },
                  {
                    title: "Chasing validation instead of fit",
                    desc: "Capital is an accelerant, not proof of concept. Fundraising success does not equal product-market fit.",
                  },
                  {
                    title: "Unrealistic valuation expectations",
                    desc: "Overpricing creates a down-round trap. Anti-dilution provisions activate, cap tables get complicated, and future investors see a red flag.",
                  },
                  {
                    title: "Misaligned investors",
                    desc: "A VC whose fund math requires a large exit cannot be a good partner for a founder building a moderately-sized sustainable business.",
                  },
                  {
                    title: "Not modeling dilution",
                    desc: "Stacking SAFEs or ignoring option pool carve-outs creates deferred damage that only becomes visible when it is too late to fix.",
                  },
                  {
                    title: "Ignoring non-dilutive capital",
                    desc: "SR&ED, IRAP, grants, and revenue-based financing can fund significant milestones without giving up equity. Most founders underuse them.",
                  },
                  {
                    title: "Not knowing the numbers cold",
                    desc: "Guessing on CAC, LTV, burn rate, or conversion metrics signals operational immaturity. Not knowing your numbers ends conversations fast.",
                  },
                  {
                    title: "Assuming all capital is good capital",
                    desc: "The wrong capital at the wrong valuation from the wrong investor with the wrong terms is actively harmful. Not all money helps.",
                  },
                ].map((item, i) => (
                  <div key={i} className="stage-card p-5">
                    <p className="relative text-teal text-[13px] font-semibold uppercase tracking-wider mb-2">
                      {String(i + 1).padStart(2, "0")}
                    </p>
                    <p className="relative text-white/90 font-medium text-[0.95rem] mb-2">
                      {item.title}
                    </p>
                    <p className="relative text-white/50 text-sm leading-relaxed">
                      {item.desc}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── RELATED READING ── */}
      <section className="bg-surface-raised py-12 md:py-14 border-y border-border">
        <div className="max-w-[1200px] mx-auto px-8">
          <div className="flex gap-16">
            <div className="w-48 flex-shrink-0 hidden lg:block" />
            <div className="flex-1 min-w-0 max-w-content flex items-center gap-4">
              <p className="text-sm text-fg/60">Related reading:</p>
              <a
                href="/accelerators-incubators"
                className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-blue border border-border hover:border-blue hover:bg-blue/5 transition-all duration-200 rounded-sm"
              >
                Most founders do not need an accelerator →
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ── EQUITY BENCHMARKS ── */}
      <section id="equity-benchmarks" className="bg-bg py-20 md:py-28">
        <div className="max-w-[1200px] mx-auto px-8">
          <div className="flex gap-16">
            <div className="w-48 flex-shrink-0 hidden lg:block" />
            <div className="flex-1 min-w-0 max-w-content">
              <p className="section-label">Equity Benchmarks</p>
              <p className="text-body text-fg/70 mb-8">
                Founder equity erodes predictably across rounds. These are directional ranges based
                on current market patterns, not prescriptive targets.
              </p>

              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b-2 border-border">
                      <th className="text-left py-3 pr-4 text-nav uppercase tracking-widest text-blue font-semibold">
                        Stage
                      </th>
                      <th className="text-left py-3 pr-4 text-nav uppercase tracking-widest text-blue font-semibold">
                        Typical Investor Take
                      </th>
                      <th className="text-left py-3 pr-4 text-nav uppercase tracking-widest text-blue font-semibold">
                        Founder Retention
                      </th>
                      <th className="text-left py-3 text-nav uppercase tracking-widest text-blue font-semibold">
                        Strategic Implication
                      </th>
                    </tr>
                  </thead>
                  <tbody className="text-fg/70">
                    <tr className="border-b border-border">
                      <td className="py-4 pr-4 font-medium text-fg">Pre-seed</td>
                      <td className="py-4 pr-4">5–15%</td>
                      <td className="py-4 pr-4">80–90%</td>
                      <td className="py-4">
                        Starting below 80% creates compounding problems by Series A
                      </td>
                    </tr>
                    <tr className="border-b border-border">
                      <td className="py-4 pr-4 font-medium text-fg">Seed</td>
                      <td className="py-4 pr-4">10–25%</td>
                      <td className="py-4 pr-4">60–80%</td>
                      <td className="py-4">
                        The most expensive equity you will issue, protect it
                      </td>
                    </tr>
                    <tr className="border-b border-border">
                      <td className="py-4 pr-4 font-medium text-fg">Series A</td>
                      <td className="py-4 pr-4">15–25%</td>
                      <td className="py-4 pr-4">37–65%</td>
                      <td className="py-4">
                        Median founding team holds roughly 37% after Series A
                      </td>
                    </tr>
                    <tr>
                      <td className="py-4 pr-4 font-medium text-fg">Series B+</td>
                      <td className="py-4 pr-4">10–20%</td>
                      <td className="py-4 pr-4">25–50%</td>
                      <td className="py-4">
                        Control depends on voting rights and provisions, not just percentage
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FOUNDER FAQ ── */}
      <section id="faq" className="bg-[#0d1b2a] py-20 md:py-28">
        <div className="max-w-[1200px] mx-auto px-8">
          <div className="flex gap-16">
            <div className="w-48 flex-shrink-0 hidden lg:block" />
            <div className="flex-1 min-w-0 max-w-content">
              <p className="section-label-light">Founder FAQ</p>
              <AccordionSection
                variant="dark"
                items={[
                  {
                    title: "Should I raise VC?",
                    content: (
                      <p>
                        Only if your business both needs outside capital to capture a
                        time-sensitive opportunity and has the trajectory to deliver the returns
                        venture funds require. If you can reach profitability without dilution,
                        or if your likely exit size does not match VC fund math, venture capital
                        may not be the right structure, even if you could raise it.
                      </p>
                    ),
                  },
                  {
                    title: "How long does fundraising usually take?",
                    content: (
                      <p>
                        The full process from first outreach to close typically takes five to ten
                        months. Most founders underestimate the timeline. If you have 18 months of
                        runway, you should assume roughly half of that will be consumed by the
                        fundraising process itself.
                      </p>
                    ),
                  },
                  {
                    title: "How much equity should founders keep?",
                    content: (
                      <p>
                        There is no single correct number, but the math is directional. Starting
                        below 80% at pre-seed creates compounding problems. The median founding
                        team retains roughly 37% by Series A. Equity percentage is only half the
                        story, voting rights, board composition, and protective provisions
                        determine actual control.
                      </p>
                    ),
                  },
                  {
                    title: "Are angels better than VCs?",
                    content: (
                      <p>
                        Neither is inherently better. Angels are faster, require less governance,
                        and accept lower return multiples. VCs provide institutional credibility,
                        follow-on capacity, and access to networks. The choice depends on your
                        stage, your tolerance for governance, and whether your business needs
                        institutional backing for future rounds.
                      </p>
                    ),
                  },
                  {
                    title: "What is the real risk of SAFEs?",
                    content: (
                      <p>
                        One SAFE is a useful tool. Stacking multiple SAFEs with different valuation
                        caps pushes compounding dilution onto founders that only becomes visible
                        when all instruments convert simultaneously. The risk is not any individual
                        SAFE, it is the failure to model cumulative dilution before it is locked in.
                      </p>
                    ),
                  },
                  {
                    title: "Is venture capital even a fit for Canadian founders?",
                    content: (
                      <p>
                        It can be, but the environment is structurally more constrained. Capital
                        pools are smaller, investor behavior is more conservative, the domestic
                        market is limited, and growth-stage funding often requires US participation.
                        Canadian founders who know these dynamics can sequence their strategy
                        accordingly, but the playbook is different.
                      </p>
                    ),
                  },
                  {
                    title: "What should I do before taking investor meetings?",
                    content: (
                      <p>
                        Know your unit economics cold. Model your cap table through Series B
                        including SAFE conversions. Understand the fund size and return requirements
                        of the investors you are targeting. Explore non-dilutive options first.
                        Talk to founders who have taken money from investors you are considering,
                        and ask hard questions about governance and support.
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
      <section id="assessment" className="bg-bg py-20 md:py-28">
        <CtaPanel
          headline="Before you raise, know what game you are entering."
          body="The wrong capital at the wrong time can cost years. execom helps founders pressure-test their capital strategy before term sheets, dilution, and investor dynamics lock in."
          primaryLabel="Assess Your Capital Strategy"
          primaryHref="/engage"
          secondaryLabel="Engage Execom"
          secondaryHref="/engage"
        />
      </section>
    </>
  )
}
