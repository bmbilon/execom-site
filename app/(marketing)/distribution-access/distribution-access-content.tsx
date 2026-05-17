"use client"

import { StickyToc } from "@/components/marketing/sticky-toc"
import { AccordionSection } from "@/components/marketing/accordion-section"
import { CtaPanel } from "@/components/marketing/cta-panel"
import { StatCallout, PullQuote } from "@/components/marketing/stat-callout"

const tocItems = [
  { id: "overview", label: "Overview" },
  { id: "why-hard", label: "Why Distribution Is Hard" },
  { id: "canada-factor", label: "The Canada Factor" },
  { id: "channel-types", label: "Channel Types" },
  { id: "sequencing", label: "Distribution Sequencing" },
  { id: "gtm-motion", label: "GTM Motion" },
  { id: "what-they-want", label: "Investors & Partners" },
  { id: "hot-issues", label: "Hot Issues" },
  { id: "common-mistakes", label: "Common Mistakes" },
  { id: "faq", label: "FAQ" },
  { id: "assessment", label: "Assessment" },
]

export function DistributionAccessContent() {
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
                Distribution is not just a sales or marketing issue. It is a core
                commercial system involving access, channel economics, relationship
                leverage, and capital timing. Founders routinely overestimate how quickly
                channels open and underestimate how much infrastructure they require.
              </p>
              <p>
                The right distribution model depends on product type, average contract
                value, margins, capital constraints, and buyer behavior. Get it wrong and
                a great product sits in a warehouse or a demo queue, burning cash while
                access to buyers never becomes real.
              </p>

              <div className="mt-10">
                <StatCallout
                  items={[
                    {
                      label: "Access",
                      description:
                        "Shelf space is zero-sum. Enterprise trust takes years. Distribution is about earning a position that someone else currently holds, and defending it.",
                    },
                    {
                      label: "Margin",
                      description:
                        "Every layer in the distribution chain takes a cut. Slotting fees, distributor discounts, referral commissions, and marketplace fees can consume 30–60% of revenue before the company sees a dollar.",
                    },
                    {
                      label: "Control",
                      description:
                        "Direct channels give data and brand control. Intermediaries give reach. The tradeoff is structural, and choosing wrong is expensive to reverse.",
                    },
                    {
                      label: "Timing",
                      description:
                        "Distribution relationships take 6–18 months to activate. Founders who start conversations when they need revenue are already too late.",
                    },
                  ]}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── WHY DISTRIBUTION IS HARD ── */}
      <section id="why-hard" className="bg-[#0d1b2a] py-20 md:py-28">
        <div className="max-w-[1200px] mx-auto px-8">
          <div className="flex gap-16">
            <div className="w-48 flex-shrink-0 hidden lg:block" />
            <div className="flex-1 min-w-0 max-w-content">
              <p className="section-label-light">Why Distribution Is Hard</p>
              <p className="text-body text-white/70 mb-8">
                The barriers that actually kill companies are not product problems. They
                are access problems, capital problems, and relationship problems.
              </p>
              <AccordionSection
                variant="dark"
                items={[
                  {
                    title: "Shelf space is zero-sum",
                    content: (
                      <p>
                        Retail shelf space has remained largely static while new product
                        introductions have accelerated. Retailers use slotting fees as both a
                        gatekeeping mechanism and a profit center, fees that can be substantial
                        for a national rollout. The asymmetry is sharp: the retailer gets paid
                        whether your product sells or not. Getting listed is not distribution.
                        Staying listed, with enough velocity to justify the space, is.
                      </p>
                    ),
                  },
                  {
                    title: "Capital is front-loaded",
                    content: (
                      <p>
                        For product companies, the cash flow problem is structural. Manufacturing,
                        packaging, slotting fees, promotional spend, and shipping all happen
                        before a single dollar of sell-through revenue. Payment terms of 30–90
                        days mean the company funds the entire channel before it gets paid back.
                        Brands that skip capital preparation get listed, underperform, and get
                        delisted, with no refund on the investment.
                      </p>
                    ),
                  },
                  {
                    title: "Enterprise cycles are long and opaque",
                    content: (
                      <p>
                        B2B enterprise sales cycles routinely stretch six months to a year or
                        more. Legal reviews, procurement workflows, and committee-based decisions
                        add layers of delay. The harder truth: the majority of enterprise buyers
                        have already short-listed vendors before the research process begins.
                        Brand and reputation need to exist before the sales conversation starts,
                        which means distribution preparation begins long before the first meeting.
                      </p>
                    ),
                  },
                  {
                    title: "Channel conflict destroys trust",
                    content: (
                      <p>
                        Once you establish multiple distribution channels, they begin to compete
                        with each other. Selling direct while a distributor sells the same
                        product to the same buyers at the same price creates an adversarial
                        relationship with a partner you need. Pricing inconsistencies across
                        platforms erode partner confidence. Channel conflict is quiet, cumulative,
                        and usually noticed only after the damage is done.
                      </p>
                    ),
                  },
                  {
                    title: "Product quality does not create inevitability",
                    content: (
                      <p>
                        The most persistent founder mistake is confusing product quality with
                        distribution inevitability. Of companies that did have a real product,
                        failure was almost always a distribution problem, not a product one.
                        Early-stage go-to-market strategies often fail because they adopt
                        frameworks designed for growth-stage companies: hiring sales teams before
                        validating the motion, spreading resources across too many channels, and
                        scaling assumptions instead of truths.
                      </p>
                    ),
                  },
                ]}
              />

              <PullQuote variant="dark">
                Most companies do not lose because the product was impossible. They lose
                because access to buyers never became real.
              </PullQuote>
            </div>
          </div>
        </div>
      </section>

      {/* ── MID-PAGE CTA ── */}
      <section className="bg-bg">
        <CtaPanel
          headline="Is your route to market actually open?"
          body="execom helps founders audit distribution strategy before scaling makes mistakes expensive."
          primaryLabel="Assess Distribution Strategy"
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
                Why distribution in Canada is both more accessible and more constrained
                than founders think.
              </p>

              <div className="border border-white/10 bg-white/[0.03] rounded-sm p-8 mb-10">
                <p className="text-body text-white/70 leading-relaxed">
                  Canada can be a workable proving ground for some companies, but founders
                  often misread how distribution actually works here. The market is smaller,
                  relationships matter disproportionately, regional variation is real, and
                  national scale is much harder than outsiders assume. A company can get into
                  Canada without actually building meaningful distribution inside Canada.
                </p>
              </div>

              <AccordionSection
                variant="dark"
                items={[
                  {
                    title: "Smaller market, tighter networks",
                    content: (
                      <p>
                        Canada can be easier to navigate in some categories because the ecosystem
                        is smaller, fewer gatekeepers, more concentrated decision-making, and
                        shorter paths to key buyers. But that also means relationships matter
                        disproportionately. The buyer at a major Canadian retailer or the
                        procurement lead at a crown corporation has outsized influence. Burning a
                        relationship in a small network is harder to recover from than in the US.
                      </p>
                    ),
                  },
                  {
                    title: "Regional fragmentation is real",
                    content: (
                      <p>
                        Success in Ontario does not mean success in Quebec, Alberta, or BC. Buyer
                        behavior, language requirements, regulatory regimes, and professional
                        networks differ materially. Quebec operates under a distinct civil law
                        tradition and requires French in all commercial activity. A distribution
                        strategy that works in Toronto may need to be substantially rebuilt for
                        Montreal or Calgary.
                      </p>
                    ),
                  },
                  {
                    title: "Slower enterprise and retail motion",
                    content: (
                      <p>
                        Canadian buyers and institutions often move more cautiously than their US
                        counterparts. Enterprise purchasing is more consensus-driven, and retail
                        category reviews can run on longer cycles. This stretches sell-through
                        timelines, delays reorder signals, and makes early traction harder to
                        demonstrate, which matters when distributors and investors are watching
                        velocity.
                      </p>
                    ),
                  },
                  {
                    title: "Canada is rarely enough on its own",
                    content: (
                      <p>
                        For many ambitious companies, Canada can validate a model, support a
                        channel layer, or serve as a proving ground, but it rarely provides
                        enough scale by itself to justify the full outcome founders want. The
                        domestic addressable market in most categories is a fraction of the US
                        equivalent. Founders who treat Canadian distribution as the endgame
                        rather than a stepping stone often discover the ceiling too late.
                      </p>
                    ),
                  },
                  {
                    title: "Why execom exists",
                    content: (
                      <p>
                        execom helps founders determine whether Canada should be a validation
                        market, a strategic channel layer, a secondary geography, or part of a
                        broader North American distribution rollout. The answer depends on product
                        type, margin structure, buyer behavior, and the company&apos;s actual scale
                        ambitions, not on convenience.
                      </p>
                    ),
                  },
                ]}
              />

              <PullQuote variant="dark">
                Canada is not a shortcut to distribution. It is a distinct market with less
                room for error.
              </PullQuote>
            </div>
          </div>
        </div>
      </section>

      {/* ── CHANNEL TYPES ── */}
      <section id="channel-types" className="bg-bg py-20 md:py-28">
        <div className="max-w-[1200px] mx-auto px-8">
          <div className="flex gap-16">
            <div className="w-48 flex-shrink-0 hidden lg:block" />
            <div className="flex-1 min-w-0 max-w-content">
              <p className="section-label">Channel Types</p>
              <p className="text-body text-fg/70 mb-8">
                Each channel type has different economics, timelines, control tradeoffs,
                and failure modes. Founders need to understand what they are actually
                buying into, not just what the channel promises.
              </p>
              <AccordionSection
                items={[
                  {
                    title: "Retail distribution",
                    content: (
                      <div className="space-y-3">
                        <p>
                          Placement in physical or online retail stores. Access requires pitching
                          category buyers, passing vendor compliance, and agreeing to slotting
                          fees, promotional co-op spending, and performance minimums. The timeline
                          from first buyer conversation to shelf is typically 6–18 months for a
                          national retailer.
                        </p>
                        <p>
                          <span className="font-medium text-fg/90">Margin:</span> Low to medium
                          (30–50% after distributor fees and slotting).{" "}
                          <span className="font-medium text-fg/90">Speed:</span> 6–18 months.{" "}
                          <span className="font-medium text-fg/90">Control:</span> Low, the
                          retailer owns the shelf and the customer.{" "}
                          <span className="font-medium text-fg/90">Common mistake:</span>{" "}
                          Launching nationally before proving velocity regionally. Start with
                          specialty and regional chains that move faster and require less capital.
                        </p>
                      </div>
                    ),
                  },
                  {
                    title: "Enterprise sales",
                    content: (
                      <div className="space-y-3">
                        <p>
                          Direct sales to business customers, corporations, governments,
                          institutions. Involves long, multi-stakeholder decision processes with
                          legal, procurement, and security reviews. The highest-value lever is
                          warm introductions and proof-of-concept pilots.
                        </p>
                        <p>
                          <span className="font-medium text-fg/90">Margin:</span> High (70–90%).{" "}
                          <span className="font-medium text-fg/90">Speed:</span> 6–18+ months
                          per deal.{" "}
                          <span className="font-medium text-fg/90">Control:</span> High, direct
                          relationship and data.{" "}
                          <span className="font-medium text-fg/90">Common mistake:</span>{" "}
                          Delegating sales before founding team has closed 10–20 deals and
                          documented a repeatable process.
                        </p>
                      </div>
                    ),
                  },
                  {
                    title: "Channel partners",
                    content: (
                      <div className="space-y-3">
                        <p>
                          Third-party companies that sell, implement, or refer your product in
                          exchange for commission or revenue share. Includes resellers, VARs,
                          referral partners, and technology integration partners. Revenue share
                          typically runs 10–25% of MRR for embedded partners.
                        </p>
                        <p>
                          <span className="font-medium text-fg/90">Margin:</span> Medium
                          (50–70%).{" "}
                          <span className="font-medium text-fg/90">Speed:</span> 3–12 months to
                          first revenue.{" "}
                          <span className="font-medium text-fg/90">Control:</span> Medium, shared
                          customer relationship.{" "}
                          <span className="font-medium text-fg/90">Common mistake:</span>{" "}
                          Building a wide, low-commitment partner network instead of a small
                          number of high-commitment partners with genuine economics.
                        </p>
                      </div>
                    ),
                  },
                  {
                    title: "Distributors",
                    content: (
                      <div className="space-y-3">
                        <p>
                          Companies that hold inventory and sell to retailers or end customers on
                          your behalf. They dramatically lower go-to-market complexity, but at
                          the cost of margin, visibility, and customer data. You often do not know
                          which end customers are buying your product.
                        </p>
                        <p>
                          <span className="font-medium text-fg/90">Margin:</span> Low to medium
                          (40–60% off MSRP for consumer goods).{" "}
                          <span className="font-medium text-fg/90">Speed:</span> 6–18 months.{" "}
                          <span className="font-medium text-fg/90">Control:</span> Low, the
                          distributor controls placement, pricing, and sell-through.{" "}
                          <span className="font-medium text-fg/90">Common mistake:</span>{" "}
                          Granting exclusivity without performance minimums. Distributors that
                          hold your product without actively selling it are a liability, not an
                          asset.
                        </p>
                      </div>
                    ),
                  },
                  {
                    title: "Marketplaces",
                    content: (
                      <div className="space-y-3">
                        <p>
                          Third-party platforms, Amazon, Walmart Marketplace, app stores,
                          Salesforce AppExchange, and industry-specific B2B marketplaces.
                          Immediate access to massive traffic and built-in trust, but with loss of
                          customer data, pricing pressure, and fee stacking.
                        </p>
                        <p>
                          <span className="font-medium text-fg/90">Margin:</span> Medium
                          (55–75% after fees).{" "}
                          <span className="font-medium text-fg/90">Speed:</span> Days to weeks.{" "}
                          <span className="font-medium text-fg/90">Control:</span> Very low,
                          algorithm dependency, brand dilution risk.{" "}
                          <span className="font-medium text-fg/90">Common mistake:</span>{" "}
                          Making a marketplace the sole distribution channel. Use it for discovery
                          and demand validation, then build direct channels to protect margins
                          and customer relationships.
                        </p>
                      </div>
                    ),
                  },
                  {
                    title: "Strategic alliances",
                    content: (
                      <div className="space-y-3">
                        <p>
                          Partnerships that provide distribution leverage through embedded access,
                          co-selling, or shared customer relationships. Not a reseller program, a
                          structural business arrangement. Technology embedding, co-selling
                          agreements, OEM / white-label arrangements, and referral agreements with
                          professional service firms all qualify.
                        </p>
                        <p>
                          <span className="font-medium text-fg/90">Margin:</span> Variable.{" "}
                          <span className="font-medium text-fg/90">Speed:</span> 6–24 months.{" "}
                          <span className="font-medium text-fg/90">Control:</span> Shared,
                          depends on structure.{" "}
                          <span className="font-medium text-fg/90">Common mistake:</span>{" "}
                          Confusing a co-marketing arrangement with a strategic alliance. A real
                          alliance creates mutual dependency that makes separation costly. If
                          either side can walk away easily, it is not an alliance.
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

      {/* ── DISTRIBUTION SEQUENCING ── */}
      <section id="sequencing" className="bg-[#0d1b2a] py-20 md:py-28">
        <div className="max-w-[1200px] mx-auto px-8">
          <div className="flex gap-16">
            <div className="w-48 flex-shrink-0 hidden lg:block" />
            <div className="flex-1 min-w-0 max-w-content">
              <p className="section-label-light">Distribution Sequencing</p>
              <h2 className="text-[1.5rem] md:text-[1.75rem] font-serif text-white leading-tight mb-3">
                Sequence channels before you scale them.
              </h2>
              <p className="text-body text-white/60 mb-10">
                Most failures happen when founders jump from proving demand to scaling
                multiple channels without documenting a repeatable motion.
              </p>

              <div className="space-y-6">
                {[
                  {
                    stage: "01",
                    title: "Validation",
                    desc: "Prove demand exists, not reach. Sell direct, founder-led. Track conversion, reorder rate, CAC, LTV. Do not invest in channel programs yet. The signal: unsolicited inbound from buyers who found you organically.",
                  },
                  {
                    stage: "02",
                    title: "Repeatability",
                    desc: "Identify one channel that works and build a repeatable playbook. Formalize the sales process. Document the script, objection handling, and onboarding. Begin pilot partner conversations. The signal: deals closing through the same sequence without founder involvement.",
                  },
                  {
                    stage: "03",
                    title: "Expansion",
                    desc: "Add a second channel systematically without breaking the one that works. Hire a distribution or channel leader. Implement CRM and channel management infrastructure. The signal: inbound from distributors or retailers asking you to work with them.",
                  },
                  {
                    stage: "04",
                    title: "Scale",
                    desc: "Build distribution defensibility. Negotiate exclusivity or preferred placement. Develop tiered partner programs. Launch international distribution selectively. The moat is in the channel relationships, not just the product.",
                  },
                ].map((item) => (
                  <div
                    key={item.stage}
                    className="border border-white/10 bg-white/[0.03] rounded-sm p-6"
                  >
                    <div className="flex gap-4 items-start">
                      <span className="text-teal text-[1.5rem] font-serif leading-none mt-0.5">
                        {item.stage}
                      </span>
                      <div>
                        <p className="text-white/90 font-medium text-[1rem] mb-2">
                          {item.title}
                        </p>
                        <p className="text-white/50 text-sm leading-relaxed">
                          {item.desc}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <PullQuote variant="dark">
                Founders do not usually fail because they picked the wrong channel first.
                They fail because they scaled before they had a playbook.
              </PullQuote>
            </div>
          </div>
        </div>
      </section>

      {/* ── GTM MOTION ── */}
      <section id="gtm-motion" className="bg-bg py-20 md:py-28">
        <div className="max-w-[1200px] mx-auto px-8">
          <div className="flex gap-16">
            <div className="w-48 flex-shrink-0 hidden lg:block" />
            <div className="flex-1 min-w-0 max-w-content">
              <p className="section-label">GTM Motion</p>
              <h2 className="text-[1.5rem] md:text-[1.75rem] font-serif text-fg leading-tight mb-3">
                Choose the right motion, not just the right channel.
              </h2>
              <p className="text-body text-fg/70 mb-8">
                Distribution strategy and sales motion are linked, not separate decisions.
                The motion determines how buyers encounter the product, how deals close,
                and what the economics look like at scale.
              </p>
              <AccordionSection
                items={[
                  {
                    title: "Product-led growth",
                    content: (
                      <div className="space-y-3">
                        <p>
                          The product drives acquisition, free trials, freemium, self-serve
                          onboarding. Works best for software with low average contract values,
                          natural virality, and end-user-initiated purchasing. Gross margins run
                          80–90%.
                        </p>
                        <p>
                          <span className="font-medium text-fg/90">Best fit:</span> ACV under
                          $10K, broad user applicability, low friction to try.{" "}
                          <span className="font-medium text-fg/90">What founders
                          misunderstand:</span> PLG still requires investment in onboarding,
                          activation, and conversion. A free tier without a clear upgrade path is
                          a cost center, not a growth engine.{" "}
                          <span className="font-medium text-fg/90">When it breaks:</span>{" "}
                          Complex products, regulated industries, buyers who do not self-serve.
                        </p>
                      </div>
                    ),
                  },
                  {
                    title: "Sales-led growth",
                    content: (
                      <div className="space-y-3">
                        <p>
                          A human sales team drives acquisition through outbound, demos, and
                          negotiated contracts. Required for enterprise software, complex
                          hardware, regulated industries, and high average contract values. Gross
                          margins run 65–80%.
                        </p>
                        <p>
                          <span className="font-medium text-fg/90">Best fit:</span> ACV above
                          $30K, complex buying processes, relationship-based selling.{" "}
                          <span className="font-medium text-fg/90">What founders
                          misunderstand:</span> Sales-led does not mean hiring a VP of Sales.
                          Founders must close the first 10–20 deals personally to build the
                          playbook.{" "}
                          <span className="font-medium text-fg/90">When it breaks:</span> Low
                          ACV, high-volume products, or markets where buyers expect self-serve.
                        </p>
                      </div>
                    ),
                  },
                  {
                    title: "Hybrid motion",
                    content: (
                      <div className="space-y-3">
                        <p>
                          The highest-performing model for mid-market companies. Self-serve
                          captures SMB and mid-market while a focused sales team handles
                          enterprise expansion from existing product users. Land-and-expand
                          compresses enterprise sales cycles and dramatically reduces acquisition
                          cost.
                        </p>
                        <p>
                          <span className="font-medium text-fg/90">Best fit:</span> Products
                          with both self-serve and enterprise use cases.{" "}
                          <span className="font-medium text-fg/90">What founders
                          misunderstand:</span> Hybrid requires two different operational systems,
                          self-serve infrastructure and a sales team, running simultaneously.
                          It is not simpler. It is more powerful when done well, and more
                          expensive when done poorly.{" "}
                          <span className="font-medium text-fg/90">When it breaks:</span> When
                          the company does not have the resources to invest in both motions
                          properly.
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

      {/* ── WHAT INVESTORS & PARTNERS LOOK FOR ── */}
      <section id="what-they-want" className="bg-[#0d1b2a] py-20 md:py-28">
        <div className="max-w-[1200px] mx-auto px-8">
          <div className="flex gap-16">
            <div className="w-48 flex-shrink-0 hidden lg:block" />
            <div className="flex-1 min-w-0 max-w-content">
              <p className="section-label-light">What Investors &amp; Partners Look For</p>
              <p className="text-body text-white/70 mb-8">
                Understanding what external gatekeepers are actually evaluating changes
                how founders prepare.
              </p>
              <AccordionSection
                variant="dark"
                items={[
                  {
                    title: "What investors need to see",
                    content: (
                      <div className="space-y-2">
                        <p>
                          Quantitative evidence of demand, not projections, but actual data:
                          reorder rates, organic inbound, signed LOIs. Channel-level unit
                          economics, CAC, LTV, payback, and gross margin by channel, not
                          blended. Retention as the primary signal, investors weight retention
                          more heavily than acquisition. A clear path to profitability. And
                          crucially: evidence that the founding team personally cracked at least
                          one route to market with a documented playbook.
                        </p>
                      </div>
                    ),
                  },
                  {
                    title: "What retail buyers need to see",
                    content: (
                      <p>
                        Velocity data from existing channels, even DTC conversion rates or
                        regional store sell-through. Marketing investment commitment, retailers
                        want to know you will drive consumers to their shelf. Packaging
                        compliance. Margins that work for both sides. And reorder history,
                        evidence that consumers come back.
                      </p>
                    ),
                  },
                  {
                    title: "What channel partners need to see",
                    content: (
                      <p>
                        Whether a partner can build a profitable practice around your product.
                        Model their P&amp;L, not just yours. Sales enablement, training,
                        collateral, certification, deal support. Enough addressable opportunity
                        in their territory. And a reliable supply and product roadmap, partners
                        burn their customer relationships recommending products, and they never
                        recommend you again if you cannot deliver.
                      </p>
                    ),
                  },
                  {
                    title: "What distributors need to see",
                    content: (
                      <p>
                        Existing pull. Distributors are not marketing companies, they move
                        products that already have demand. Show them sell-through data, not
                        potential. Margin structure with enough room for distributor, retailer,
                        and your own margin to coexist. Operational readiness, EDI capability,
                        fill rates, compliance, minimum order quantities.
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
          headline="Can your distribution economics survive contact with reality?"
          body="execom helps founders model channel economics, structure partner agreements, and sequence distribution before scale makes mistakes expensive."
          primaryLabel="Assess Distribution Strategy"
          secondaryLabel="Talk With Execom"
        />
      </section>

      {/* ── HOT ISSUES ── */}
      <section id="hot-issues" className="bg-[#0d1b2a] py-20 md:py-28">
        <div className="max-w-[1200px] mx-auto px-8">
          <div className="flex gap-16">
            <div className="w-48 flex-shrink-0 hidden lg:block" />
            <div className="flex-1 min-w-0 max-w-content">
              <p className="section-label-light">Hot Issues</p>
              <p className="text-body text-white/60 mb-8">
                Current dynamics shaping distribution strategy right now.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  {
                    title: "The Amazon trap",
                    desc: "Revenue concentrates among established sellers. New registrations are at a decade low in some categories. Amazon remains a critical discovery channel, but a dangerous dependency. Brands that build exclusively through Amazon often find themselves unable to maintain margins or survive algorithm changes.",
                  },
                  {
                    title: "AI and supply chain disruption",
                    desc: "Geopolitical tensions, tariffs, and supply chain restructuring are forcing brands to diversify manufacturing and logistics. Retailers increasingly require supply chain transparency and domestic sourcing options as preconditions for listing.",
                  },
                  {
                    title: "Slotting fee pressure",
                    desc: "As retailers expand private-label products, shelf space for third-party brands is shrinking and slotting fees are increasing. Retailers that do not charge slotting fees are often more open to emerging brands with authentic velocity stories.",
                  },
                  {
                    title: "PLG entering enterprise",
                    desc: "Product-led growth is crossing into enterprise. Self-serve onboarding lands individual users inside large organizations, then converts into company-wide contracts through land-and-expand. This compresses enterprise sales cycles and reduces acquisition cost.",
                  },
                  {
                    title: "Channel programs as table stakes",
                    desc: "For B2B technology, a structured channel partner program is no longer optional. Enterprise buyers increasingly purchase through known intermediaries. Companies without partner programs are invisible in large portions of the market.",
                  },
                ].map((item, i) => (
                  <div
                    key={i}
                    className="border border-white/10 bg-white/[0.03] rounded-sm p-5"
                  >
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

      {/* ── COMMON MISTAKES ── */}
      <section id="common-mistakes" className="bg-bg py-20 md:py-28">
        <div className="max-w-[1200px] mx-auto px-8">
          <div className="flex gap-16">
            <div className="w-48 flex-shrink-0 hidden lg:block" />
            <div className="flex-1 min-w-0 max-w-content">
              <p className="section-label">Common Mistakes</p>
              <p className="text-body text-fg/60 mb-10">
                The patterns that cost founders the most in distribution, almost all of
                them avoidable, almost all of them common.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  {
                    title: "Treating GTM as a marketing function",
                    desc: "Go-to-market is not a campaign. It is a company strategy that spans product, sales, marketing, and distribution. Delegating it to a marketing hire before establishing a repeatable motion scales confusion.",
                  },
                  {
                    title: "Targeting everyone",
                    desc: "Broad targeting produces messaging that resonates with no one. Narrow your ICP until it feels uncomfortably specific. Win that segment first, then expand.",
                  },
                  {
                    title: "Scaling channels before proving one",
                    desc: "Hiring a sales team or committing to a national launch before a repeatable acquisition model exists accelerates burn, not revenue. Most premature scaling starts here.",
                  },
                  {
                    title: "Single-channel dependency",
                    desc: "Relying on one channel, Amazon, one enterprise customer, one retail banner, creates existential risk. Algorithm changes, buyer turnover, or a contract termination can destroy revenue overnight.",
                  },
                  {
                    title: "Ignoring channel-level economics",
                    desc: "Different channels produce wildly different unit economics. Without channel-level CAC, LTV, and margin modeled in advance, founders consistently undercapitalize the channels that look most attractive.",
                  },
                  {
                    title: "Copying later-stage competitors",
                    desc: "A Series D company's partner programs and retail relationships were built over years. You do not have their brand, infrastructure, or runway. Validate your own motion.",
                  },
                  {
                    title: "Engaging buyers too late",
                    desc: "Major retail buyers have category planning cycles 12–18 months out. Enterprise buyers short-list vendors they already know. Starting conversations when you need revenue means you are already too late.",
                  },
                  {
                    title: "Assuming partners will figure it out",
                    desc: "Signing a distributor or channel partner is not the end of the work. It is the beginning. Active enablement, joint business planning, and performance accountability are required, not optional.",
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
                    title: "Should I use a distributor or go direct?",
                    content: (
                      <p>
                        Going direct produces higher margins and better data but requires
                        operational capability. A distributor reduces complexity at the cost of
                        margin and visibility. Start direct with regional accounts to build data
                        and capability, then evaluate distributors for national scale.
                      </p>
                    ),
                  },
                  {
                    title: "How do I get a meeting with a retail buyer?",
                    content: (
                      <p>
                        Trade shows are the highest-density environment for buyer meetings.
                        Brokers with standing buyer relationships are the second path. A warm
                        introduction from a brand the buyer already respects is worth more than
                        any pitch deck. Cold outreach to retail buyers almost never works.
                      </p>
                    ),
                  },
                  {
                    title: "When am I ready for enterprise sales?",
                    content: (
                      <p>
                        When you have documented case studies with quantified outcomes, can
                        explain your security posture and integration architecture, have a
                        repeatable demo that converts, and have priced appropriately for the
                        value delivered. Enterprise buyers are suspicious of prices that seem
                        too cheap.
                      </p>
                    ),
                  },
                  {
                    title: "Is Amazon worth it?",
                    content: (
                      <p>
                        Amazon is a discovery engine, not a brand-building engine. It is worth
                        it if your category has active Amazon search behavior, you can maintain
                        margins after fees, and you have a strategy to convert marketplace
                        buyers into direct customers. It is not worth it if your product
                        requires explanation, storytelling, or relationship-based selling. Never
                        make it your sole channel.
                      </p>
                    ),
                  },
                  {
                    title: "How do I protect my brand across channels?",
                    content: (
                      <p>
                        Implement minimum advertised price policy before entering retail. Vary
                        SKU mix by channel with exclusive configurations for direct. Build
                        brand equity through content and community so consumers seek you out
                        specifically, reducing dependence on retailer presentation.
                      </p>
                    ),
                  },
                  {
                    title: "How do I keep distributors from deprioritizing me?",
                    content: (
                      <p>
                        Distributors prioritize products that sell fastest and require least
                        effort. Your job is to generate consumer pull that makes your product
                        easy for their sales reps to lead with. Build direct relationships with
                        the reps, not just the executive team, and make it financially
                        worthwhile for them through incentives and co-selling support.
                      </p>
                    ),
                  },
                  {
                    title: "When should I hire a VP of Sales or Head of Distribution?",
                    content: (
                      <p>
                        After you have closed 10–20 deals and documented a repeatable process.
                        Hire someone to run the playbook, not to discover it. The number one
                        reason VP of Sales hires fail at early-stage companies is that founders
                        hand over a broken or unproven motion and expect the new hire to fix it
                        while hitting targets.
                      </p>
                    ),
                  },
                  {
                    title: "How many channels should we run at once?",
                    content: (
                      <p>
                        At early stage, one. Prove it works, document the playbook, then add a
                        second with dedicated resources. Running three or more channels before
                        any of them is repeatable spreads resources too thin and prevents the
                        company from learning what actually works. A healthy mature distribution
                        mix involves at least two independent channels each generating
                        meaningful revenue.
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
          headline="Distribution is not the last chapter of go-to-market. It is the plan."
          body="The wrong route to market wastes time, capital, and momentum. execom helps founders pressure-test channels, economics, sequencing, and partner strategy before scale makes mistakes expensive."
          primaryLabel="Assess Distribution Strategy"
          primaryHref="/engage"
          secondaryLabel="Engage Execom"
          secondaryHref="/engage"
        />
      </section>
    </>
  )
}
