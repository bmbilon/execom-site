"use client"

import { StickyToc } from "@/components/marketing/sticky-toc"
import { AccordionSection } from "@/components/marketing/accordion-section"
import { CtaPanel } from "@/components/marketing/cta-panel"
import { StatCallout, PullQuote } from "@/components/marketing/stat-callout"
import { ComparisonMatrix } from "@/components/marketing/comparison-matrix"

const tocItems = [
  { id: "overview", label: "Overview" },
  { id: "founder-concerns", label: "Founder Concerns" },
  { id: "real-barriers", label: "The Real Barriers" },
  { id: "canada-factor", label: "The Canada Factor" },
  { id: "entry-models", label: "Entry Models" },
  { id: "canada-vs-us", label: "Canada vs US" },
  { id: "decision-frameworks", label: "Decision Frameworks" },
  { id: "common-mistakes", label: "Common Mistakes" },
  { id: "faq", label: "FAQ" },
  { id: "assessment", label: "Assessment" },
]

export function MarketEntryContent() {
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
                Market entry is not just a sales problem. It is a sequencing problem
                involving legal structure, channel strategy, capital allocation,
                localization, and market psychology. Companies that enter too hard, too fast,
                or with the wrong structure do not fail because the product was wrong. They
                fail because the route into the market was weak.
              </p>
              <p>
                The right entry model depends on how much control the company needs, how
                much capital is available, how complex the regulatory environment is, and
                whether the company is prepared to sustain the investment through the
                inevitable period when costs are high and revenue has not yet arrived.
              </p>

              <div className="mt-10">
                <StatCallout
                  items={[
                    {
                      label: "Timing",
                      description:
                        "Entering too early burns capital. Entering too late cedes the market. The window is narrower than founders think, and the sequencing matters more than the speed.",
                    },
                    {
                      label: "Control",
                      description:
                        "Partnerships compress time to revenue but reduce control. Subsidiaries give full control but require real budget and a multi-year commitment. The tradeoff is structural.",
                    },
                    {
                      label: "Channel",
                      description:
                        "Distribution in North America is concentrated and relationship-driven. A signed agreement is not distribution. An activated partner with aligned incentives is.",
                    },
                    {
                      label: "Runway",
                      description:
                        "Most founders underestimate expansion cost by two to three times. If the capital cannot sustain 18 months of operations without new-market revenue, the company is not ready.",
                    },
                  ]}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FOUNDER CONCERNS ── */}
      <section id="founder-concerns" className="bg-[#0d1b2a] py-20 md:py-28">
        <div className="max-w-[1200px] mx-auto px-8">
          <div className="flex gap-16">
            <div className="w-48 flex-shrink-0 hidden lg:block" />
            <div className="flex-1 min-w-0 max-w-content">
              <p className="section-label-light">Founder Concerns</p>
              <h2 className="text-[1.5rem] md:text-[1.75rem] font-serif text-white leading-tight mb-8">
                What founders actually worry about
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  "Do we need a local entity before we start selling?",
                  "Should we enter Canada or the US first?",
                  "How much runway do we really need?",
                  "How do we find channel partners that actually move product?",
                  "What can we test before committing to a subsidiary?",
                  "How different are buyers in this market, really?",
                ].map((q, i) => (
                  <div
                    key={i}
                    className="border border-white/10 bg-white/[0.03] rounded-sm p-5"
                  >
                    <p className="text-teal text-[13px] font-semibold uppercase tracking-wider mb-2">
                      {String(i + 1).padStart(2, "0")}
                    </p>
                    <p className="text-white/80 text-[0.95rem] leading-relaxed">
                      {q}
                    </p>
                  </div>
                ))}
              </div>

              <p className="text-sm text-white/40 mt-8">
                These are the questions that matter before committing capital. The answers
                depend on product, stage, market, and commercial model, not on generic
                playbooks.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── THE REAL BARRIERS ── */}
      <section id="real-barriers" className="bg-bg py-20 md:py-28">
        <div className="max-w-[1200px] mx-auto px-8">
          <div className="flex gap-16">
            <div className="w-48 flex-shrink-0 hidden lg:block" />
            <div className="flex-1 min-w-0 max-w-content">
              <p className="section-label">The Real Barriers</p>
              <p className="text-body text-fg/70 mb-8">
                The barriers that actually kill market entries are not the ones founders
                prepare for. They are structural, relationship-driven, and capital-intensive.
              </p>
              <AccordionSection
                items={[
                  {
                    title: "Regulatory and compliance friction",
                    content: (
                      <div className="space-y-3">
                        <p>
                          North America presents a layered regulatory environment. In Canada,
                          federal rules coexist with ten provincial regimes, each with varying
                          requirements for employment, data handling, consumer protection, and
                          licensing. In the US, the complexity multiplies across 50 states plus
                          federal jurisdiction.
                        </p>
                        <p>
                          Data privacy alone is a minefield: Canada&apos;s PIPEDA and Quebec&apos;s
                          Law 25 on one side, and a patchwork of state-level frameworks in the US
                          on the other. The critical error most companies make is treating
                          regulatory compliance as a post-entry task. It must be scoped before the
                          first commercial transaction.
                        </p>
                      </div>
                    ),
                  },
                  {
                    title: "Distribution access",
                    content: (
                      <p>
                        Distribution in North America is among the most relationship-driven and
                        channel-concentrated in the world. In retail, access to major chains
                        requires broker relationships and annual category review cycles. In
                        enterprise software, hyperscaler marketplaces have become de facto
                        gatekeepers. In professional services, panel membership and RFP
                        eligibility are mediated through networks built over years. A company
                        without existing channel relationships starts with a structural
                        disadvantage that takes time and capital to overcome.
                      </p>
                    ),
                  },
                  {
                    title: "Buyer and cultural differences",
                    content: (
                      <div className="space-y-3">
                        <p>
                          US buyers move quickly, reward directness, and expect clear
                          ROI-oriented pitches backed by social proof. Canadian buyers are more
                          relationship-oriented, consensus-driven, and risk-averse, multiple
                          stakeholders are involved earlier in the cycle, and the absence of
                          local references creates meaningful friction.
                        </p>
                        <p>
                          The gap between how international founders pitch and what North
                          American buyers expect to hear is one of the most underestimated
                          factors in expansion planning.
                        </p>
                      </div>
                    ),
                  },
                  {
                    title: "Partnership development",
                    content: (
                      <p>
                        Finding partners willing to sign an agreement is easy. Finding partners
                        who will actively sell is hard. The most documented failure mode in
                        market entry is the distributor commitment problem: a company recruits a
                        credible-looking partner, signs a formal agreement, then discovers 12–18
                        months later that the partner allocated minimal resources and managed the
                        relationship to preserve optionality rather than drive volume. Active
                        partner selection, performance covenants, joint business planning, and
                        co-selling investment are required, not optional.
                      </p>
                    ),
                  },
                  {
                    title: "Capital intensity and runway",
                    content: (
                      <div className="space-y-3">
                        <p>
                          The most consistent financial miscalculation in international expansion
                          is underestimating total cost by two to three times. A realistic cost
                          model for entering either Canada or the US includes entity formation,
                          local leadership hire, office presence, demand generation, compliance,
                          travel, and a working capital buffer covering months where costs are
                          high and revenue has not yet arrived.
                        </p>
                        <p>
                          Companies that do not budget for the valley of death, typically months
                          6–18 post-entry, frequently exit prematurely, having proven the
                          concept but run out of capital before capturing the returns.
                        </p>
                      </div>
                    ),
                  },
                ]}
              />

              <PullQuote>
                Most market entries do not die because the product is impossible. They die
                because the route into the market was weak.
              </PullQuote>
            </div>
          </div>
        </div>
      </section>

      {/* ── MID-PAGE CTA ── */}
      <section className="bg-[#0d1b2a]">
        <CtaPanel
          variant="dark"
          headline="Is your market entry sequenced correctly?"
          body="execom helps founders pressure-test the route before they commit capital."
          primaryLabel="Assess Market Readiness"
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
                Why Canada is both an opportunity and a structural constraint.
              </p>

              <div className="border border-white/10 bg-white/[0.03] rounded-sm p-8 mb-10">
                <p className="text-body text-white/70 leading-relaxed">
                  Canada can be an attractive first market in some cases, but founders
                  routinely misunderstand its scale and structural limits. It is easier to
                  enter than the United States in some respects, but it is not a substitute
                  for broader market strategy. For many venture-oriented companies, Canada
                  alone is too small, too regionally fragmented, and too slow-moving to
                  support the outcome they actually want.
                </p>
              </div>

              <AccordionSection
                variant="dark"
                items={[
                  {
                    title: "Canada is easier to enter, but smaller than founders think",
                    content: (
                      <p>
                        Lower competition and somewhat lower setup friction in some sectors
                        make Canada a softer landing. Government procurement is more accessible
                        to new entrants. Non-dilutive programs like SR&amp;ED provide meaningful
                        capital offsets. But the market ceiling is materially lower, 38 million
                        people, a smaller enterprise base, and a GDP roughly one-tenth of the
                        United States. Founders who treat Canada as a primary market when their
                        venture economics require US-scale revenue are building on a structural
                        mismatch.
                      </p>
                    ),
                  },
                  {
                    title: "Provincial fragmentation is real",
                    content: (
                      <p>
                        Canada is not one uniform market. Ontario, Quebec, Alberta, and British
                        Columbia differ materially in regulation, buyer behavior, language,
                        industry composition, and professional networks. Quebec operates under a
                        distinct civil law tradition, requires French in all commercial activity,
                        and has a meaningfully different startup and enterprise ecosystem.
                        Alberta&apos;s energy-driven economy creates different buyer priorities.
                        A market entry plan that treats Canada as a single entity will
                        misallocate resources.
                      </p>
                    ),
                  },
                  {
                    title: "Enterprise adoption is often slower",
                    content: (
                      <p>
                        Canadian buyers are more relationship-oriented, consensus-driven, and
                        risk-averse than US counterparts. Multiple stakeholders are involved
                        earlier in the purchasing cycle. International references without
                        Canadian customers create friction. The deal cycle typically runs longer
                        than founders expect, which stretches timelines and makes early
                        traction harder to demonstrate.
                      </p>
                    ),
                  },
                  {
                    title: "Canada is often a stepping stone, not the whole game",
                    content: (
                      <p>
                        For many ambitious companies, Canada works as a beachhead or proving
                        ground, a place to validate the product, build reference customers, and
                        develop local expertise before entering the US. That is a legitimate
                        strategy. The mistake is treating Canada as the destination when the
                        venture economics actually require US-scale growth.
                      </p>
                    ),
                  },
                  {
                    title: "Why execom exists",
                    content: (
                      <p>
                        execom helps founders decide whether Canada should be the first market,
                        a test market, a support market, or bypassed in favor of a US-first
                        strategy. The answer depends on product, stage, capital, and commercial
                        model, not on convenience or proximity.
                      </p>
                    ),
                  },
                ]}
              />

              <PullQuote variant="dark">
                Canada is not a bad market. It is a market founders misread constantly.
              </PullQuote>
            </div>
          </div>
        </div>
      </section>

      {/* ── ENTRY MODELS ── */}
      <section id="entry-models" className="bg-bg py-20 md:py-28">
        <div className="max-w-[1200px] mx-auto px-8">
          <div className="flex gap-16">
            <div className="w-48 flex-shrink-0 hidden lg:block" />
            <div className="flex-1 min-w-0 max-w-content">
              <p className="section-label">Entry Models</p>
              <p className="text-body text-fg/70 mb-8">
                Each model trades control for speed, or capital for reach. The right
                choice depends on where the company is, what it is selling, and how
                much commitment it is prepared to sustain.
              </p>
              <AccordionSection
                items={[
                  {
                    title: "Cross-border selling first",
                    content: (
                      <div className="space-y-3">
                        <p>
                          Selling across the border without a local entity, using existing
                          infrastructure, digital distribution, or a lightweight sales motion.
                          Works primarily for SaaS and digital products with low friction to
                          purchase.
                        </p>
                        <p>
                          <span className="font-medium text-fg/90">When it makes sense:</span>{" "}
                          Early validation, digital products, small contract values.{" "}
                          <span className="font-medium text-fg/90">Control:</span> Low.{" "}
                          <span className="font-medium text-fg/90">Capital burden:</span> Very
                          low.{" "}
                          <span className="font-medium text-fg/90">Common mistake:</span>{" "}
                          Assuming it scales. Enterprise buyers expect a local entity, local
                          support, and local compliance.
                        </p>
                      </div>
                    ),
                  },
                  {
                    title: "Local partnerships and channel alliances",
                    content: (
                      <div className="space-y-3">
                        <p>
                          A well-structured channel alliance with a credible local partner can
                          compress time to first revenue from 18+ months to 6–9 months by
                          leveraging the partner&apos;s existing customer trust, regulatory standing,
                          and distribution network.
                        </p>
                        <p>
                          <span className="font-medium text-fg/90">When it makes sense:</span>{" "}
                          B2B tech, regulated industries, limited capital.{" "}
                          <span className="font-medium text-fg/90">Control:</span> Medium.{" "}
                          <span className="font-medium text-fg/90">Capital burden:</span> Low to
                          medium.{" "}
                          <span className="font-medium text-fg/90">Common mistake:</span>{" "}
                          Confusing a signed agreement with an activated partner. The agreement
                          is the beginning of the work, not the end of it.
                        </p>
                      </div>
                    ),
                  },
                  {
                    title: "Licensing",
                    content: (
                      <div className="space-y-3">
                        <p>
                          Licensing technology, brand, or methodology to a local company that
                          handles all commercial activity. The licensor receives a royalty stream
                          without bearing the cost of local operations.
                        </p>
                        <p>
                          <span className="font-medium text-fg/90">When it makes sense:</span>{" "}
                          IP-rich products, regulated markets, companies seeking capital
                          efficiency.{" "}
                          <span className="font-medium text-fg/90">Control:</span> Low to
                          medium.{" "}
                          <span className="font-medium text-fg/90">Capital burden:</span> Low.{" "}
                          <span className="font-medium text-fg/90">Common mistake:</span>{" "}
                          Granting broad rights without performance covenants or adequate IP
                          protection.
                        </p>
                      </div>
                    ),
                  },
                  {
                    title: "Distribution agreements",
                    content: (
                      <div className="space-y-3">
                        <p>
                          Formal agreements where a local distributor purchases product at
                          wholesale and resells. Transfers logistics, warehousing, and customer
                          management to the distributor.
                        </p>
                        <p>
                          <span className="font-medium text-fg/90">When it makes sense:</span>{" "}
                          Physical products, hardware, consumer goods.{" "}
                          <span className="font-medium text-fg/90">Control:</span> Medium.{" "}
                          <span className="font-medium text-fg/90">Capital burden:</span> Low to
                          medium.{" "}
                          <span className="font-medium text-fg/90">Common mistake:</span>{" "}
                          Granting exclusivity without performance minimums. A signed
                          distributor is not distribution, it is a bet on someone else&apos;s
                          commitment.
                        </p>
                      </div>
                    ),
                  },
                  {
                    title: "Local subsidiary / direct presence",
                    content: (
                      <div className="space-y-3">
                        <p>
                          Establishing a wholly owned local entity provides maximum control over
                          commercial activity, hiring, pricing, and brand positioning. It is also
                          the structure that most enterprise buyers, investors, and government
                          procurement expect.
                        </p>
                        <p>
                          <span className="font-medium text-fg/90">When it makes sense:</span>{" "}
                          Enterprise sales, long-term commitment, regulated technology.{" "}
                          <span className="font-medium text-fg/90">Control:</span> Full.{" "}
                          <span className="font-medium text-fg/90">Capital burden:</span> High,
                          first-year costs typically range from $300K to $1.5M+.{" "}
                          <span className="font-medium text-fg/90">Common mistake:</span>{" "}
                          Treating it as a three-month experiment. A subsidiary requires a
                          minimum three-year commitment.
                        </p>
                      </div>
                    ),
                  },
                ]}
              />
            </div>
          </div>
        </div>
      </section>

      {/* ── CANADA VS US ── */}
      <section id="canada-vs-us" className="bg-[#0d1b2a] py-20 md:py-28">
        <div className="max-w-[1200px] mx-auto px-8">
          <div className="flex gap-16">
            <div className="w-48 flex-shrink-0 hidden lg:block" />
            <div className="flex-1 min-w-0 max-w-content">
              <p className="section-label-light">Canada vs US</p>
              <h2 className="text-[1.5rem] md:text-[1.75rem] font-serif text-white leading-tight mb-3">
                Canada or the United States first?
              </h2>
              <p className="text-[1.05rem] text-white/50 mb-10">
                Two adjacent markets. Very different realities.
              </p>

              <ComparisonMatrix
                variant="dark"
                columns={[
                  { label: "Canada" },
                  { label: "United States" },
                ]}
                rows={[
                  {
                    dimension: "Market Size",
                    values: [
                      "38M people, $2.2T GDP, meaningful but limited ceiling",
                      "335M people, $28T GDP, largest single-country opportunity for most categories",
                    ],
                  },
                  {
                    dimension: "Competition",
                    values: [
                      "Lower in most sectors, fewer incumbents, less saturated",
                      "Intense, deep incumbent presence, sophisticated buyers, crowded categories",
                    ],
                  },
                  {
                    dimension: "Cost to Enter",
                    values: [
                      "Moderate, lower setup costs, non-dilutive programs available",
                      "High, legal, talent, compliance, and market-building costs are substantial",
                    ],
                  },
                  {
                    dimension: "Regulatory",
                    values: [
                      "Federal + 10 provinces, manageable but fragmented, Quebec adds complexity",
                      "Federal + 50 states, deeply fragmented, state-level variation is extreme",
                    ],
                  },
                  {
                    dimension: "Sales Velocity",
                    values: [
                      "Slower, consensus-driven, risk-averse, relationship-oriented buyers",
                      "Faster, outcome-driven, ROI-focused, but cycles still run 6–18 months for enterprise",
                    ],
                  },
                  {
                    dimension: "Channel Dynamics",
                    values: [
                      "Concentrated, fewer channel partners, government procurement is accessible",
                      "Concentrated and competitive, hyperscaler marketplaces are increasingly required",
                    ],
                  },
                  {
                    dimension: "Capital Required",
                    values: [
                      "Lower, can test with lighter infrastructure, SR&ED offsets costs",
                      "Significant, minimum 18 months of funded runway, serious local hire required",
                    ],
                  },
                  {
                    dimension: "Best Fit For",
                    values: [
                      "Beachhead, validation, government, SR&ED-eligible companies",
                      "Scale, enterprise, venture-backed growth, long-term market commitment",
                    ],
                  },
                ]}
              />

              <div className="mt-10 space-y-4 text-body text-white/60">
                <p>
                  Canada may be the right first market for companies that need a
                  lower-cost proving ground, have government or regulated-sector fit, or
                  want to validate before committing US-level capital.
                </p>
                <p>
                  The US may be the only market that fits the intended scale for
                  venture-backed companies, enterprise SaaS, or products that require deep
                  market density to succeed.
                </p>
                <p>
                  The correct answer depends on product, stage, runway, and commercial
                  model, not on proximity or convenience.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── MID-PAGE CTA ── */}
      <section className="bg-bg">
        <CtaPanel
          headline="Canada first, US first, or both?"
          body="The sequencing decision is one of the highest-leverage choices a founder makes. execom helps founders get it right."
          primaryLabel="Assess Market Readiness"
          secondaryLabel="Talk With Execom"
        />
      </section>

      {/* ── DECISION FRAMEWORKS ── */}
      <section id="decision-frameworks" className="bg-[#0d1b2a] py-20 md:py-28">
        <div className="max-w-[1200px] mx-auto px-8">
          <div className="flex gap-16">
            <div className="w-48 flex-shrink-0 hidden lg:block" />
            <div className="flex-1 min-w-0 max-w-content">
              <p className="section-label-light">Decision Frameworks</p>
              <p className="text-body text-white/70 mb-8">
                Structured tools for making market entry decisions with discipline
                rather than narrative.
              </p>

              <AccordionSection
                variant="dark"
                items={[
                  {
                    title: "Market readiness checklist",
                    content: (
                      <div className="space-y-3">
                        <p>
                          Before committing capital, founders should be able to answer
                          affirmatively to all seven:
                        </p>
                        <ul className="space-y-2 text-white/60">
                          <li className="flex gap-3">
                            <span className="text-teal flex-shrink-0">01</span>
                            Product validated with discovery interviews in the specific target geography
                          </li>
                          <li className="flex gap-3">
                            <span className="text-teal flex-shrink-0">02</span>
                            Dedicated, ringfenced 18-month budget at zero new-market revenue
                          </li>
                          <li className="flex gap-3">
                            <span className="text-teal flex-shrink-0">03</span>
                            Local market leader identified, with existing relationships in the target segment
                          </li>
                          <li className="flex gap-3">
                            <span className="text-teal flex-shrink-0">04</span>
                            Legal counsel has completed compliance intake: employment, data, tax, licensing
                          </li>
                          <li className="flex gap-3">
                            <span className="text-teal flex-shrink-0">05</span>
                            Competitive differentiation articulated against local incumbents
                          </li>
                          <li className="flex gap-3">
                            <span className="text-teal flex-shrink-0">06</span>
                            Channel hypothesis defined with primary and backup strategy
                          </li>
                          <li className="flex gap-3">
                            <span className="text-teal flex-shrink-0">07</span>
                            Leadership committed to a minimum 3-year market development horizon
                          </li>
                        </ul>
                        <p className="text-white/40 text-sm mt-2">
                          A &ldquo;no&rdquo; on any of the first four is typically a hard blocker.
                        </p>
                      </div>
                    ),
                  },
                  {
                    title: "Entry mode selection",
                    content: (
                      <div className="space-y-3">
                        <p>
                          The right entry mode is a function of control requirements, capital
                          availability, speed to revenue, and risk tolerance:
                        </p>
                        <div className="overflow-x-auto mt-4">
                          <table className="w-full text-sm text-white/60">
                            <thead>
                              <tr className="border-b border-white/20 text-white/50 text-[11px] uppercase tracking-wider">
                                <th className="text-left py-2 pr-3">Mode</th>
                                <th className="text-left py-2 pr-3">Control</th>
                                <th className="text-left py-2 pr-3">Capital</th>
                                <th className="text-left py-2">Speed</th>
                              </tr>
                            </thead>
                            <tbody>
                              <tr className="border-b border-white/10">
                                <td className="py-2.5 pr-3 text-white/80">Cross-border</td>
                                <td className="py-2.5 pr-3">Low</td>
                                <td className="py-2.5 pr-3">Very low</td>
                                <td className="py-2.5">Fast</td>
                              </tr>
                              <tr className="border-b border-white/10">
                                <td className="py-2.5 pr-3 text-white/80">Licensing</td>
                                <td className="py-2.5 pr-3">Low–Med</td>
                                <td className="py-2.5 pr-3">Low</td>
                                <td className="py-2.5">Medium</td>
                              </tr>
                              <tr className="border-b border-white/10">
                                <td className="py-2.5 pr-3 text-white/80">Distribution</td>
                                <td className="py-2.5 pr-3">Medium</td>
                                <td className="py-2.5 pr-3">Low–Med</td>
                                <td className="py-2.5">Medium</td>
                              </tr>
                              <tr className="border-b border-white/10">
                                <td className="py-2.5 pr-3 text-white/80">Channel partner</td>
                                <td className="py-2.5 pr-3">Medium</td>
                                <td className="py-2.5 pr-3">Low–Med</td>
                                <td className="py-2.5">Med–Fast</td>
                              </tr>
                              <tr>
                                <td className="py-2.5 pr-3 text-white/80">Subsidiary</td>
                                <td className="py-2.5 pr-3">Full</td>
                                <td className="py-2.5 pr-3">High</td>
                                <td className="py-2.5">Slow then full</td>
                              </tr>
                            </tbody>
                          </table>
                        </div>
                      </div>
                    ),
                  },
                  {
                    title: "PESTEL / external environment",
                    content: (
                      <div className="space-y-3">
                        <p>
                          A practical PESTEL analysis for North American entry should cover:
                        </p>
                        <ul className="space-y-2 text-white/60">
                          <li>
                            <span className="text-white/80 font-medium">Political:</span>{" "}
                            Trade policy under CUSMA/USMCA, Buy American / Buy Canadian
                            procurement preferences, CFIUS implications for foreign investment,
                            current bilateral trade dynamics
                          </li>
                          <li>
                            <span className="text-white/80 font-medium">Economic:</span>{" "}
                            FX exposure, interest rate effects on spending, venture availability,
                            wage benchmarks by city
                          </li>
                          <li>
                            <span className="text-white/80 font-medium">Social:</span>{" "}
                            Regional identity differences, DEI expectations in procurement,
                            multicultural demographics affecting positioning
                          </li>
                          <li>
                            <span className="text-white/80 font-medium">Technological:</span>{" "}
                            Cloud-first expectations, SOC 2 as table stakes, AI adoption curves,
                            marketplace procurement norms
                          </li>
                          <li>
                            <span className="text-white/80 font-medium">Environmental:</span>{" "}
                            Carbon pricing, ESG reporting in procurement, California&apos;s
                            environmental regulations
                          </li>
                          <li>
                            <span className="text-white/80 font-medium">Legal:</span>{" "}
                            Data privacy patchwork, employment law variation, IP protection,
                            sector-specific licensing
                          </li>
                        </ul>
                      </div>
                    ),
                  },
                  {
                    title: "90-day entry sequencing",
                    content: (
                      <div className="space-y-4">
                        <div>
                          <p className="text-teal text-[13px] font-semibold uppercase tracking-wider mb-2">
                            Days 1–30: Intelligence &amp; Infrastructure
                          </p>
                          <p className="text-white/60">
                            Customer discovery interviews in the target market. Competitive
                            landscape mapping. Regulatory compliance intake with local counsel.
                            Entity formation initiation. Banking and payroll setup. Beachhead
                            geography selection. Local hire search initiated.
                          </p>
                        </div>
                        <div>
                          <p className="text-teal text-[13px] font-semibold uppercase tracking-wider mb-2">
                            Days 31–60: Pilot Validation
                          </p>
                          <p className="text-white/60">
                            First pilot customers or signed LOIs. Pricing model validation
                            against market norms. Channel partner shortlist and initial
                            conversations. Brand and messaging adaptation. Product localization
                            review. First local hire onboarded.
                          </p>
                        </div>
                        <div>
                          <p className="text-teal text-[13px] font-semibold uppercase tracking-wider mb-2">
                            Days 61–90: Commercial Launch
                          </p>
                          <p className="text-white/60">
                            First paid contracts executed. Distribution or channel agreement
                            signed. PR and ecosystem activation. Board update with market entry
                            proof points. Month 4–12 scale plan with specific KPIs and capital
                            allocation.
                          </p>
                        </div>
                      </div>
                    ),
                  },
                ]}
              />
            </div>
          </div>
        </div>
      </section>

      {/* ── COMMON MISTAKES ── */}
      <section id="common-mistakes" className="bg-bg py-20 md:py-28">
        <div className="max-w-[1200px] mx-auto px-8">
          <div className="flex gap-16">
            <div className="w-48 flex-shrink-0 hidden lg:block" />
            <div className="flex-1 min-w-0 max-w-content">
              <p className="section-label">Common Mistakes</p>
              <p className="text-body text-fg/60 mb-10">
                The patterns that cost founders the most in market entry, almost all of
                them avoidable.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  {
                    title: "Assuming no localization is needed",
                    desc: "Localization is not translation. It includes pricing models, compliance design, messaging emphasis, and the value proposition framing that resonates locally.",
                  },
                  {
                    title: "Managing the market remotely",
                    desc: "Remote management from headquarters is among the highest-probability failure configurations. Decision latency, cultural misreading, and relationship poverty compound quickly.",
                  },
                  {
                    title: "Underestimating sales-cycle length",
                    desc: "Enterprise cycles run 6–18 months. Government can take longer. Companies that model 60–90 day cycles based on home-market experience routinely exhaust runway before deals close.",
                  },
                  {
                    title: "Confusing a signed distributor with real distribution",
                    desc: "A signed agreement is psychological security, not market access. Distributors must be actively led, enabled, and held to performance covenants, or they will do nothing.",
                  },
                  {
                    title: "Ignoring province/state-level variation",
                    desc: "Canada is not one market. The US is fifty. Quebec and California each have regulatory environments that bear little resemblance to their neighbors.",
                  },
                  {
                    title: "Copying home-market pricing directly",
                    desc: "Pricing norms, billing cycles, and contract structures vary. What works in Europe or Asia may not survive contact with North American buyer expectations.",
                  },
                  {
                    title: "No dedicated expansion budget",
                    desc: "Funding market entry from general operating cash creates constant competition for resources. A ringfenced budget with an 18-month horizon is the minimum viable commitment.",
                  },
                  {
                    title: "Skipping local legal review",
                    desc: "Employment law, data privacy, tax nexus, and sector-specific licensing vary dramatically. Every commercial transaction before compliance is scoped is a liability.",
                  },
                ].map((item, i) => (
                  <div
                    key={i}
                    className="border border-border bg-white/60 rounded-sm p-5"
                  >
                    <p className="text-blue text-[13px] font-semibold uppercase tracking-wider mb-2">
                      {String(i + 1).padStart(2, "0")}
                    </p>
                    <p className="text-fg font-medium text-[0.95rem] mb-2">
                      {item.title}
                    </p>
                    <p className="text-fg/50 text-sm leading-relaxed">
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
      <section id="faq" className="bg-[#0d1b2a] py-20 md:py-28">
        <div className="max-w-[1200px] mx-auto px-8">
          <div className="flex gap-16">
            <div className="w-48 flex-shrink-0 hidden lg:block" />
            <div className="flex-1 min-w-0 max-w-content">
              <p className="section-label-light">FAQ</p>
              <AccordionSection
                variant="dark"
                items={[
                  {
                    title: "Do we need a local entity before we start selling?",
                    content: (
                      <p>
                        Not always. Cross-border selling and partnerships can work for early
                        validation. But enterprise buyers, government procurement, and most
                        investors expect a local entity. If the company is serious about the
                        market, entity formation is not optional, it is a question of timing.
                      </p>
                    ),
                  },
                  {
                    title: "Should we enter Canada or the US first?",
                    content: (
                      <p>
                        It depends on product, stage, and capital. Canada is lower-cost, less
                        competitive, and more accessible for government business. The US is the
                        larger opportunity and the only viable primary market for most
                        venture-scale companies. Some companies should use Canada as a proving
                        ground. Others should go directly to the US. The wrong answer is both
                        at once with insufficient resources.
                      </p>
                    ),
                  },
                  {
                    title: "What is the safest way to test a market?",
                    content: (
                      <p>
                        Customer discovery interviews, product-led growth, marketplace listings,
                        or a structured channel partnership. All of these allow the company to
                        validate demand before committing to local infrastructure. The test
                        should answer a specific commercial question, not just generate activity.
                      </p>
                    ),
                  },
                  {
                    title: "How much runway should we assume?",
                    content: (
                      <p>
                        Eighteen months of funded operations at zero new-market revenue. That
                        is the minimum. B2B enterprise sales cycles, partner activation
                        timelines, and regulatory setup mean that revenue rarely arrives in the
                        first year. Companies that budget for twelve months are almost always
                        underfunded.
                      </p>
                    ),
                  },
                  {
                    title: "Are distributors worth it?",
                    content: (
                      <p>
                        They can be, but only with rigorous selection, performance covenants,
                        joint business planning, and active co-selling investment. A passive
                        distributor agreement without accountability is the single
                        most-documented failure mode in international market entry.
                      </p>
                    ),
                  },
                  {
                    title: "When should we open a subsidiary?",
                    content: (
                      <p>
                        When the market has been validated, the company has reference customers
                        or strong pipeline, and the leadership is committed to a minimum
                        three-year horizon. Opening a subsidiary as the first move, before
                        product-market fit is confirmed locally, is the most capital-intensive
                        way to learn what a lighter approach could have revealed for a fraction
                        of the cost.
                      </p>
                    ),
                  },
                  {
                    title: "What do founders usually underestimate most?",
                    content: (
                      <p>
                        Three things: the total cost of market establishment, the length of
                        enterprise sales cycles, and the time required to activate channel
                        partners. Each one is typically underestimated by a factor of two.
                        Together, they account for most premature exits from otherwise viable
                        markets.
                      </p>
                    ),
                  },
                  {
                    title: "How do we know if we are actually ready?",
                    content: (
                      <p>
                        If the company can answer yes to the market readiness checklist, validated
                        product interest, ringfenced budget, local leadership, regulatory
                        intake, clear competitive position, defined channel strategy, and
                        genuine multi-year commitment, it is ready. If any of the first four
                        are missing, it is not.
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
          headline="Do not enter a market on narrative alone."
          body="A new market can multiply the business, or quietly drain time and capital for eighteen months. execom helps founders pressure-test the route before they commit."
          primaryLabel="Assess Market Readiness"
          primaryHref="/engage"
          secondaryLabel="Engage Execom"
          secondaryHref="/engage"
        />
      </section>
    </>
  )
}
