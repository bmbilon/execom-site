"use client"

import { StickyToc } from "@/components/marketing/sticky-toc"
import { AccordionSection } from "@/components/marketing/accordion-section"
import { CtaPanel } from "@/components/marketing/cta-panel"
import { StatCallout, PullQuote } from "@/components/marketing/stat-callout"

const tocItems = [
  { id: "overview", label: "Overview" },
  { id: "equity-cost", label: "The Equity Cost" },
  { id: "why-now", label: "Why It Matters Now" },
  { id: "canada-factor", label: "The Canada Factor" },
  { id: "capital-types", label: "Capital Types" },
  { id: "decision-framework", label: "Decision Framework" },
  { id: "hybrid-stack", label: "Hybrid Capital Stack" },
  { id: "myths", label: "Myths vs Reality" },
  { id: "founder-concerns", label: "Founder Concerns" },
  { id: "faq", label: "FAQ" },
  { id: "assessment", label: "Assessment" },
]

export function NonDilutiveContent() {
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
                Non-dilutive capital is not one instrument. It is a family of tools — SR&ED
                tax credits, revenue-based financing, venture debt, government funding,
                IP-backed lending, strategic partnerships, customer financing, and advance
                purchase agreements — each with different cost structures, speed, flexibility,
                and strategic implications.
              </p>
              <p>
                Founders should evaluate capital by five dimensions: cost, speed, flexibility,
                dilution, and strategic fit. The right answer depends on revenue stage, capital
                intensity, IP intensity, and control priorities. There is no universal
                recommendation, only better sequencing.
              </p>
              <p>
                For many Canadian founders, the smartest non-dilutive stack starts with SR&ED —
                not grants, not RBF, not venture debt. SR&ED rewards work already being done.
                Everything else layers on from there.
              </p>

              <div className="mt-10">
                <StatCallout
                  items={[
                    {
                      label: "Ownership",
                      description:
                        "Every equity dollar raised permanently reduces founder ownership. Non-dilutive capital lets you grow without giving up the thing that matters most at exit.",
                    },
                    {
                      label: "Flexibility",
                      description:
                        "Equity investors bring governance requirements, board expectations, and growth timelines. Non-dilutive tools let founders retain full operational latitude.",
                    },
                    {
                      label: "Timing",
                      description:
                        "Capital taken too early, at too low a valuation, is the most expensive capital a founder will ever raise. Sequencing determines whether equity is strategic or destructive.",
                    },
                    {
                      label: "Leverage",
                      description:
                        "Founders who arrive at the equity table with revenue, traction, and a clean cap table negotiate from strength. Non-dilutive capital creates that leverage.",
                    },
                  ]}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── THE EQUITY COST ── */}
      <section id="equity-cost" className="bg-[#0d1b2a] py-20 md:py-28">
        <div className="max-w-[1200px] mx-auto px-8">
          <div className="flex gap-16">
            <div className="w-48 flex-shrink-0 hidden lg:block" />
            <div className="flex-1 min-w-0 max-w-content">
              <p className="section-label-light">The Equity Cost</p>
              <h2 className="text-[1.75rem] md:text-[2rem] font-serif text-white leading-tight mb-6">
                The equity cost most founders do not model properly.
              </h2>
              <p className="text-body text-white/60 mb-8">
                Founder ownership erodes much faster than most people realize. The steepest
                dilution usually happens before Series A — when the company is worth the
                least and the equity is the most expensive to give away. The real cost of
                that equity only becomes fully visible later, when the company is worth
                dramatically more.
              </p>

              {/* Dilution table */}
              <div className="overflow-x-auto mb-10">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/10">
                      <th className="text-left py-3 pr-6 text-teal uppercase tracking-widest text-[11px] font-semibold">
                        Round
                      </th>
                      <th className="text-left py-3 pr-6 text-teal uppercase tracking-widest text-[11px] font-semibold">
                        Median Dilution
                      </th>
                      <th className="text-left py-3 text-teal uppercase tracking-widest text-[11px] font-semibold">
                        Founder Ownership After
                      </th>
                    </tr>
                  </thead>
                  <tbody className="text-white/60">
                    <tr className="border-b border-white/5">
                      <td className="py-3 pr-6 text-white/80 font-medium">Seed</td>
                      <td className="py-3 pr-6">~20%</td>
                      <td className="py-3">~56% (founding team)</td>
                    </tr>
                    <tr className="border-b border-white/5">
                      <td className="py-3 pr-6 text-white/80 font-medium">Series A</td>
                      <td className="py-3 pr-6">~20%</td>
                      <td className="py-3">~36%</td>
                    </tr>
                    <tr className="border-b border-white/5">
                      <td className="py-3 pr-6 text-white/80 font-medium">Series B</td>
                      <td className="py-3 pr-6">~17%</td>
                      <td className="py-3">~23%</td>
                    </tr>
                    <tr>
                      <td className="py-3 pr-6 text-white/80 font-medium">Series C+</td>
                      <td className="py-3 pr-6">~10–15%</td>
                      <td className="py-3">Investors own majority</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <PullQuote variant="dark">
                Dilution is easy to ignore when the round closes. It gets expensive when the
                company works.
              </PullQuote>

              <p className="text-body text-white/50 mt-8">
                Capital efficiency has become a signal of quality. Investors who see a
                clean non-dilutive capital history now interpret it as evidence of
                disciplined capital allocation — not inability to raise equity.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── WHY IT MATTERS NOW ── */}
      <section id="why-now" className="bg-bg py-20 md:py-28">
        <div className="max-w-[1200px] mx-auto px-8">
          <div className="flex gap-16">
            <div className="w-48 flex-shrink-0 hidden lg:block" />
            <div className="flex-1 min-w-0 max-w-content">
              <p className="section-label">Why It Matters Now</p>
              <h2 className="text-[1.75rem] md:text-[2rem] font-serif text-fg leading-tight mb-4">
                Why non-dilutive capital matters more now.
              </h2>
              <p className="text-body text-fg/60 mb-8">
                The venture capital market has consolidated around fewer, bigger bets.
                For founders outside the AI megaround narrative, the practical funding
                landscape has materially narrowed. Non-dilutive alternatives have stepped
                into that gap.
              </p>
              <AccordionSection
                variant="light"
                items={[
                  {
                    title: "VC has consolidated around fewer companies",
                    content: (
                      <p>
                        Global VC fundraising fell to its lowest level in a decade in 2025.
                        First-time VC managers — historically the ones backing the earliest
                        startups — saw fundraising collapse. Meanwhile, deal value surged
                        past half a trillion dollars, but deal count fell sharply. More money
                        is going to fewer companies. For founders building outside the
                        dominant narrative, the competitive landscape for equity funding looks
                        nothing like the headlines suggest.
                      </p>
                    ),
                  },
                  {
                    title: "Early-stage capital is harder to access",
                    content: (
                      <p>
                        The median time between rounds has stretched significantly. Seed to
                        Series A now takes over two years on average. The full fundraising
                        process — from first outreach to close — realistically takes five to
                        ten months. If you have 18 months of runway, you actually have roughly
                        nine months to build traction before you need to restart the raise.
                        Non-dilutive capital extends that window.
                      </p>
                    ),
                  },
                  {
                    title: "More founders are optimizing for efficiency",
                    content: (
                      <p>
                        The era of growth-at-all-costs has given way to a clear market
                        preference for capital efficiency. Startups are expected to prove
                        sustainable traction and access the right type of capital for each
                        stage — not just the most visible type. The founders who are
                        winning capital now are the ones who can demonstrate disciplined
                        capital allocation, not just ambitious burn rates.
                      </p>
                    ),
                  },
                  {
                    title: "The best founders now sequence capital instead of defaulting to equity",
                    content: (
                      <p>
                        The most sophisticated founders do not choose between dilutive and
                        non-dilutive. They sequence them. Non-dilutive capital funds the
                        early stages. Revenue-linked instruments fund growth. Equity enters
                        later, at a higher valuation, when the network and scale of capital
                        genuinely cannot be replicated any other way. This is not theory.
                        It is the emerging standard among capital-efficient founders.
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
          headline="The right capital at the right time changes everything."
          body="Most founders default to equity because it is familiar. execom helps founders evaluate every layer of the capital stack before dilution, bad terms, or unnecessary dependence become permanent."
          primaryLabel="Assess Capital Stack"
          secondaryLabel="Talk With Execom"
          variant="light"
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
              <p className="text-[1.1rem] text-white/50 mb-4">
                Why non-dilutive capital matters even more for Canadian founders.
              </p>
              <p className="text-body text-white/60 mb-10">
                Canadian founders operate in a structurally tighter capital environment:
                smaller venture pools, slower fundraising, smaller domestic markets, and
                more pressure to extend runway before institutional capital shows up.
                That makes non-dilutive capital more than optional. It becomes a core
                strategic layer. The mistake is not underusing it. The mistake is pursuing
                the wrong forms in the wrong order.
              </p>

              <AccordionSection
                variant="dark"
                items={[
                  {
                    title: "Canada makes runway more precious",
                    content: (
                      <div className="space-y-3">
                        <p>
                          Canadian venture rounds are smaller. Fundraising cycles are longer.
                          The domestic market is roughly one-tenth the size of the US market,
                          which means time-to-proof takes longer and revenue scales more slowly
                          in the early stages.
                        </p>
                        <p>
                          Every month of additional runway matters more in Canada than it does
                          in a market where a Series A can close in six weeks. Non-dilutive
                          capital is how Canadian founders buy the time they need to reach the
                          milestones that make equity fundraising worthwhile.
                        </p>
                      </div>
                    ),
                  },
                  {
                    title: "SR&ED is the workhorse, not the side note",
                    content: (
                      <div className="space-y-3">
                        <p>
                          For many Canadian innovation companies, SR&ED is the highest-priority
                          non-dilutive capital source. It aligns with actual technical work and
                          rewards spend already happening — salaries, contractors, materials,
                          cloud infrastructure.
                        </p>
                        <p>
                          Unlike grants, SR&ED does not require a competitive application. Unlike
                          RBF, it does not require revenue. Unlike venture debt, it does not
                          require an equity round. For companies doing genuine R&D, SR&ED is
                          the most reliable, highest-priority non-dilutive capital available in
                          Canada. The fact that most founders underutilize it is a structural
                          problem, not a signal that it does not matter.
                        </p>
                      </div>
                    ),
                  },
                  {
                    title: "Grants are often over-romanticized",
                    content: (
                      <div className="space-y-3">
                        <p>
                          Traditional grants can matter. But many founders waste months chasing
                          low-probability, high-friction programs before optimizing the more
                          reliable layers first. Grant applications are competitive, slow, and
                          come with compliance overhead that can distract small teams from
                          building.
                        </p>
                        <p>
                          The smarter approach: optimize SR&ED first, then evaluate whether
                          targeted grant programs genuinely fit — not the other way around.
                          Grants should be a deliberate addition to the capital stack, not the
                          starting point.
                        </p>
                      </div>
                    ),
                  },
                  {
                    title: "Canada rewards sharper capital sequencing",
                    content: (
                      <div className="space-y-3">
                        <p>
                          Canadian founders who think in terms of sequencing outperform those
                          who default to a single capital source. The practical order for most
                          innovation companies:
                        </p>
                        <p className="text-white/70 font-medium">
                          SR&ED first. Practical support second. Revenue-linked capital once
                          available. Equity later — and at a stronger position.
                        </p>
                        <p>
                          This sequence is not theoretical. It reflects how the most
                          capital-efficient Canadian companies actually build their funding
                          stacks, and it is the framework execom uses with every founder
                          engagement.
                        </p>
                      </div>
                    ),
                  },
                  {
                    title: "Why execom exists",
                    content: (
                      <p>
                        execom helps founders design capital stacks that fit Canadian reality
                        instead of imported Silicon Valley mythology. That means starting
                        with the non-dilutive instruments that are most accessible and most
                        aligned with the actual work being done — then layering on additional
                        capital only when the strategic case is clear. The goal is not to avoid
                        equity. The goal is to take it from a position of strength.
                      </p>
                    ),
                  },
                ]}
              />

              <PullQuote variant="dark">
                In Canada, non-dilutive capital is not a side strategy. It is often the
                difference between leverage and desperation.
              </PullQuote>
            </div>
          </div>
        </div>
      </section>

      {/* ── CAPITAL TYPES ── */}
      <section id="capital-types" className="bg-bg py-20 md:py-28">
        <div className="max-w-[1200px] mx-auto px-8">
          <div className="flex gap-16">
            <div className="w-48 flex-shrink-0 hidden lg:block" />
            <div className="flex-1 min-w-0 max-w-content">
              <p className="section-label">Capital Types</p>
              <h2 className="text-[1.75rem] md:text-[2rem] font-serif text-fg leading-tight mb-4">
                The major forms of non-dilutive capital.
              </h2>
              <p className="text-body text-fg/60 mb-8">
                Each instrument has different cost structures, eligibility requirements,
                strategic implications, and risks. The question is never "which is best"
                but "which fits this company at this stage."
              </p>
              <AccordionSection
                variant="light"
                items={[
                  {
                    title: "Revenue-based financing",
                    content: (
                      <div className="space-y-4">
                        <p>
                          <strong className="text-fg/80">How it works:</strong> A lender
                          provides upfront capital in exchange for a fixed percentage of monthly
                          revenue until a repayment cap — typically 1.2–1.5x the principal — is
                          reached. Repayments flex with revenue, so there are no fixed monthly
                          obligations.
                        </p>
                        <p>
                          <strong className="text-fg/80">Best for:</strong> SaaS, subscription
                          businesses, and e-commerce companies with recurring, predictable revenue.
                          Generally requires at least $10K/month in recurring revenue.
                        </p>
                        <p>
                          <strong className="text-fg/80">Advantages:</strong> No equity loss, no
                          board seats, funding decisions in 24–48 hours, repayments flex with
                          revenue cycles.
                        </p>
                        <p>
                          <strong className="text-fg/80">Risks:</strong> Reduces monthly cash
                          available for growth. Effective APR can be high if repaid quickly.
                          Pre-revenue startups are ineligible.
                        </p>
                        <p>
                          <strong className="text-fg/80">When it is smarter than equity:</strong> When
                          you have predictable revenue and need growth capital without a new
                          valuation event. RBF lets you scale on your own terms.
                        </p>
                        <p>
                          <strong className="text-fg/80">Where founders misuse it:</strong> Taking
                          RBF when revenue is too lumpy or margins are too thin. The flexible
                          repayment structure only works if there is consistent revenue to flex with.
                        </p>
                      </div>
                    ),
                  },
                  {
                    title: "Venture debt",
                    content: (
                      <div className="space-y-4">
                        <p>
                          <strong className="text-fg/80">How it works:</strong> Loans extended to
                          startups with strong fundamentals, typically structured as term loans
                          or revolving lines. Most deals include warrants giving the lender the
                          right to purchase a small equity stake — typically 1–2% — at the last
                          round price.
                        </p>
                        <p>
                          <strong className="text-fg/80">Best for:</strong> Startups at or near
                          profitability, companies bridging between equity rounds, and founders
                          who want to extend runway without triggering a new dilutive round.
                        </p>
                        <p>
                          <strong className="text-fg/80">Advantages:</strong> Significantly less
                          dilutive than equity. Extends runway without a new valuation event.
                          Preserves negotiating leverage for the next equity round.
                        </p>
                        <p>
                          <strong className="text-fg/80">Risks:</strong> Still includes some
                          dilution via warrants. Requires repayment regardless of business
                          performance. Covenants can restrict operating flexibility. Interest
                          rates typically run 8–15% annually.
                        </p>
                        <p>
                          <strong className="text-fg/80">When it is smarter than equity:</strong> When
                          you are 12–18 months from a much higher valuation and need bridge
                          capital. The 1–2% warrant dilution is dramatically cheaper than a
                          20%+ equity round at today&apos;s valuation.
                        </p>
                        <p>
                          <strong className="text-fg/80">Where founders misuse it:</strong> Taking
                          venture debt without a clear path to repayment. Debt does not disappear
                          if the business stalls. Founders who use it to delay hard decisions
                          about the business often end up in worse positions.
                        </p>
                      </div>
                    ),
                  },
                  {
                    title: "Government funding (grants, R&D tax credits, SR&ED)",
                    content: (
                      <div className="space-y-4">
                        <p>
                          <strong className="text-fg/80">How it works:</strong> Federal and
                          provincial/state agencies offer grants and tax credits to fund R&D
                          and innovation. In Canada, SR&ED provides refundable tax credits for
                          qualifying R&D expenditures. Grants like IRAP, SBIR/STTR, and sector-
                          specific programs provide direct non-repayable funding.
                        </p>
                        <p>
                          <strong className="text-fg/80">Best for:</strong> Research-intensive
                          startups, deep-tech, biotech, cleantech, and companies with genuine
                          technological uncertainty in their development work.
                        </p>
                        <p>
                          <strong className="text-fg/80">Advantages:</strong> Truly non-dilutive —
                          no repayment, no equity. Adds credibility with future investors. SR&ED
                          specifically rewards work already being done. R&D tax credits can be
                          used annually.
                        </p>
                        <p>
                          <strong className="text-fg/80">Risks:</strong> Grants are competitive
                          and slow. Compliance and reporting requirements can burden small teams.
                          Restricted use of funds — cannot cover general operations.
                        </p>
                        <p>
                          <strong className="text-fg/80">When it is smarter than equity:</strong> Almost
                          always, for qualifying companies. SR&ED should be the first layer of
                          the capital stack for any Canadian company doing genuine R&D. Grants
                          should be evaluated selectively based on fit, not pursued broadly.
                        </p>
                        <p>
                          <strong className="text-fg/80">Where founders misuse it:</strong> Chasing
                          every available grant program instead of optimizing SR&ED first. The
                          time cost of low-probability grant applications often exceeds the
                          expected value. Focus on high-probability, high-alignment programs.
                        </p>
                      </div>
                    ),
                  },
                  {
                    title: "IP-backed lending",
                    content: (
                      <div className="space-y-4">
                        <p>
                          <strong className="text-fg/80">How it works:</strong> Patents, trademarks,
                          copyrights, and proprietary software are used as collateral to secure
                          loans. The lender evaluates IP value using discounted cash flow analysis,
                          comparable licensing rates, or royalty forecasts.
                        </p>
                        <p>
                          <strong className="text-fg/80">Best for:</strong> Companies with strong
                          patent portfolios, validated software IP, or proprietary processes —
                          especially those with minimal physical assets but substantial R&D value.
                        </p>
                        <p>
                          <strong className="text-fg/80">Advantages:</strong> Monetizes assets that
                          previously could not serve as collateral. No equity dilution. Strengthens
                          IP protection incentives. Increasingly accessible as traditional banks
                          enter the space.
                        </p>
                        <p>
                          <strong className="text-fg/80">Risks:</strong> IP valuation is complex
                          and subjective. The lender may have rights to IP if you default. Still
                          an emerging market with limited lender options. Most accessible for
                          companies with formally registered, defensible patents.
                        </p>
                        <p>
                          <strong className="text-fg/80">When it is smarter than equity:</strong> When
                          your IP portfolio is your primary asset and you need capital without
                          diluting the very ownership that makes the IP valuable.
                        </p>
                        <p>
                          <strong className="text-fg/80">Where founders misuse it:</strong> Assuming
                          unregistered or undefended IP qualifies. Lenders require formal,
                          defensible IP with clear valuation frameworks.
                        </p>
                      </div>
                    ),
                  },
                  {
                    title: "Strategic partnerships",
                    content: (
                      <div className="space-y-4">
                        <p>
                          <strong className="text-fg/80">How it works:</strong> Co-development
                          agreements, licensing deals, distribution partnerships, and joint
                          ventures provide capital, resources, or revenue without equity exchange.
                          A corporate partner may fund R&D in exchange for exclusive access rights,
                          licensing fees, or preferred pricing.
                        </p>
                        <p>
                          <strong className="text-fg/80">Best for:</strong> Companies with
                          proprietary technology, unique IP, or distribution advantages that
                          large corporations want to access.
                        </p>
                        <p>
                          <strong className="text-fg/80">Advantages:</strong> Can provide capital
                          plus market access. Validates technology and de-risks future VC raises.
                          No repayment obligations if structured as licensing. Opens customer
                          distribution channels.
                        </p>
                        <p>
                          <strong className="text-fg/80">Risks:</strong> May restrict ability to
                          partner with competitors. Negotiation complexity and long lead times.
                          Overdependence on one corporate partner. IP ownership and licensing
                          terms require careful legal structuring.
                        </p>
                        <p>
                          <strong className="text-fg/80">When it is smarter than equity:</strong> When
                          you need distribution, validation, and capital simultaneously. A
                          strategic partner who funds development and provides market access is
                          often worth more than an equity round that provides only cash.
                        </p>
                        <p>
                          <strong className="text-fg/80">Where founders misuse it:</strong> Giving
                          away exclusivity too broadly or too early. Strategic partnerships should
                          enhance your negotiating position, not lock you into a single channel.
                        </p>
                      </div>
                    ),
                  },
                  {
                    title: "Customer financing (PO & invoice financing)",
                    content: (
                      <div className="space-y-4">
                        <p>
                          <strong className="text-fg/80">How it works:</strong> Purchase order
                          financing lets a third-party lender pay your suppliers directly to
                          fulfill a confirmed customer order. Approval is based on the
                          customer&apos;s creditworthiness, not yours. Invoice factoring operates
                          post-delivery: selling accounts receivable at a discount — typically
                          receiving 80–95% upfront — to a factoring company.
                        </p>
                        <p>
                          <strong className="text-fg/80">Best for:</strong> Product-based startups,
                          manufacturers, distributors, and importers/exporters fulfilling large
                          confirmed orders.
                        </p>
                        <p>
                          <strong className="text-fg/80">Advantages:</strong> No equity dilution.
                          No business credit history required. Funding based on customer strength.
                          Can fund 100% of inventory costs. Fast approval.
                        </p>
                        <p>
                          <strong className="text-fg/80">Risks:</strong> Fees (typically 1–5% per
                          30 days) add up on long receivable cycles. Only available for confirmed
                          purchase orders. Customer quality is critical — weak customers
                          disqualify deals.
                        </p>
                        <p>
                          <strong className="text-fg/80">When it is smarter than equity:</strong> When
                          you have confirmed orders but not the cash to fulfill them. This is
                          working capital, not growth capital — and it should be treated that way.
                        </p>
                        <p>
                          <strong className="text-fg/80">Where founders misuse it:</strong> Using
                          PO financing as a crutch for chronic cash flow problems. If your
                          margins cannot absorb the fees, the business model needs work — not
                          more financing.
                        </p>
                      </div>
                    ),
                  },
                  {
                    title: "Advance purchase agreements (pre-sales)",
                    content: (
                      <div className="space-y-4">
                        <p>
                          <strong className="text-fg/80">How it works:</strong> Customers or
                          partners commit to purchasing a product or service before it is built or
                          shipped, providing upfront cash that funds development without any
                          equity exchange. Can range from crowdfunding pre-orders to structured
                          corporate offtake agreements.
                        </p>
                        <p>
                          <strong className="text-fg/80">Best for:</strong> Hardware startups,
                          consumer products, and any company where customer validation aligns
                          with funding needs. Climate tech companies have seen significant
                          traction with advance purchase commitments from large corporates.
                        </p>
                        <p>
                          <strong className="text-fg/80">Advantages:</strong> Truly non-dilutive —
                          no debt, no equity. Provides market validation alongside capital. Aligns
                          incentives with actual customer demand. Can be structured as long-term
                          offtake agreements.
                        </p>
                        <p>
                          <strong className="text-fg/80">Risks:</strong> Delivery failure damages
                          customer relationships. Requires trusted credibility. Revenue
                          recognition complexity. Limited scalability for capital-intensive
                          development.
                        </p>
                        <p>
                          <strong className="text-fg/80">When it is smarter than equity:</strong> When
                          you can validate demand and fund production simultaneously. Pre-sales
                          prove market appetite in a way that no pitch deck can.
                        </p>
                        <p>
                          <strong className="text-fg/80">Where founders misuse it:</strong> Over-
                          promising delivery timelines to secure upfront cash. Pre-sales create
                          obligations. If you cannot deliver, you lose the customers and the
                          credibility.
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

      {/* ── DECISION FRAMEWORK ── */}
      <section id="decision-framework" className="bg-[#0d1b2a] py-20 md:py-28">
        <div className="max-w-[1200px] mx-auto px-8">
          <div className="flex gap-16">
            <div className="w-48 flex-shrink-0 hidden lg:block" />
            <div className="flex-1 min-w-0 max-w-content">
              <p className="section-label-light">Decision Framework</p>
              <h2 className="text-[1.75rem] md:text-[2rem] font-serif text-white leading-tight mb-4">
                How founders should decide.
              </h2>
              <p className="text-body text-white/60 mb-8">
                The right capital instrument depends on five variables. Most founders
                misjudge at least one of them — and that misjudgment determines whether
                their capital stack strengthens or constrains the business.
              </p>
              <AccordionSection
                variant="dark"
                items={[
                  {
                    title: "Revenue stage",
                    content: (
                      <div className="space-y-3">
                        <p>
                          Pre-revenue startups have few non-dilutive options beyond grants,
                          SR&ED, and pre-sales. Once a company crosses roughly $10K/month
                          recurring revenue, RBF and some venture debt become accessible.
                          Post-Series A traction unlocks IP-backed lending and corporate
                          partnerships.
                        </p>
                        <p>
                          <strong className="text-white/70">Where founders misjudge:</strong> Assuming
                          pre-revenue means no non-dilutive options. SR&ED, grants, and pre-
                          sales can collectively fund substantial early development.
                        </p>
                      </div>
                    ),
                  },
                  {
                    title: "Capital intensity",
                    content: (
                      <div className="space-y-3">
                        <p>
                          If a company needs $50M+ fast, equity often remains the only practical
                          path. Non-dilutive options individually cap out at lower amounts —
                          though stacking government funding, RBF, cloud credits, and R&D tax
                          credits can collectively exceed seven figures at zero dilution for
                          qualified startups.
                        </p>
                        <p>
                          <strong className="text-white/70">Where founders misjudge:</strong> Thinking
                          they need massive capital when a more efficient approach would require
                          far less. The capital intensity assumption often reflects the plan, not
                          the business.
                        </p>
                      </div>
                    ),
                  },
                  {
                    title: "Revenue predictability",
                    content: (
                      <div className="space-y-3">
                        <p>
                          Predictable recurring revenue — SaaS, subscriptions — is ideal for RBF.
                          Variable or lumpy revenue suits grants, PO financing, or venture debt
                          better. The mismatch between revenue pattern and capital instrument is
                          one of the most common mistakes founders make.
                        </p>
                        <p>
                          <strong className="text-white/70">Where founders misjudge:</strong> Assuming
                          RBF works for any business with revenue. It works specifically for
                          businesses with consistent, recurring revenue. Seasonal or project-based
                          revenue requires different instruments.
                        </p>
                      </div>
                    ),
                  },
                  {
                    title: "IP intensity",
                    content: (
                      <div className="space-y-3">
                        <p>
                          Strong, registered patent portfolios unlock IP-backed lending and
                          strengthen grant applications. Companies without defensible IP have
                          fewer non-dilutive options in the knowledge economy. The value of IP
                          as collateral is growing as traditional banks enter the space.
                        </p>
                        <p>
                          <strong className="text-white/70">Where founders misjudge:</strong> Treating
                          IP as a legal formality rather than a financial asset. Unregistered IP
                          has no collateral value and weakens every capital conversation.
                        </p>
                      </div>
                    ),
                  },
                  {
                    title: "Control priority",
                    content: (
                      <div className="space-y-3">
                        <p>
                          If maintaining full operational control is paramount — because the cap
                          table is already complex, or the founder is building toward a specific
                          acquisition — prioritize grants, RBF, and SR&ED over venture debt
                          (which carries covenants) or corporate partnerships (which carry
                          exclusivity risks).
                        </p>
                        <p>
                          <strong className="text-white/70">Where founders misjudge:</strong> Thinking
                          equity is the only capital source that affects control. Venture debt
                          covenants, partnership exclusivity clauses, and grant compliance
                          requirements all constrain operational freedom in different ways.
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

      {/* ── HYBRID CAPITAL STACK ── */}
      <section id="hybrid-stack" className="bg-bg py-20 md:py-28">
        <div className="max-w-[1200px] mx-auto px-8">
          <div className="flex gap-16">
            <div className="w-48 flex-shrink-0 hidden lg:block" />
            <div className="flex-1 min-w-0 max-w-content">
              <p className="section-label">Hybrid Capital Stack</p>
              <h2 className="text-[1.75rem] md:text-[2rem] font-serif text-fg leading-tight mb-2">
                The smartest founders sequence capital.
              </h2>
              <p className="text-body text-fg/60 mb-10">
                The sharpest strategy is usually not equity or non-dilutive. It is sequencing.
              </p>

              {/* Staged flow */}
              <div className="space-y-6 mb-10">
                {[
                  {
                    stage: "01",
                    title: "Early Stage",
                    description:
                      "SR&ED tax credits, R&D grants where justified, pre-sales, strategic support, and cloud credits. The goal is to fund initial IP development and early product work without touching the cap table. For Canadian companies, SR&ED should be the first instrument evaluated — it rewards spend already happening.",
                  },
                  {
                    stage: "02",
                    title: "Early Traction",
                    description:
                      "Revenue-based financing and other low-dilution working capital. Once recurring revenue exists, RBF lets founders fund sales and marketing without equity. The repayment flexes with revenue, preserving cash during slower months and accelerating paydown during strong ones.",
                  },
                  {
                    stage: "03",
                    title: "Growth Stage",
                    description:
                      "Venture debt and structured credit facilities. Extend runway between equity rounds, fund expansion, or bridge to profitability. The 1–2% warrant dilution is dramatically cheaper than a full equity round at the current valuation.",
                  },
                  {
                    stage: "04",
                    title: "Selective Equity",
                    description:
                      "A strategic VC round at a higher valuation, taken only when the network, credibility, or scale of capital genuinely cannot be replicated non-dilutively. The founder arrives at this stage with more traction, a cleaner cap table, and stronger negotiating leverage than founders who defaulted to equity from day one.",
                  },
                ].map((item) => (
                  <div
                    key={item.stage}
                    className="flex gap-6 p-6 border border-border bg-white/60 rounded-sm"
                  >
                    <div className="flex-shrink-0">
                      <span className="text-[2rem] font-serif font-medium text-blue/30">
                        {item.stage}
                      </span>
                    </div>
                    <div>
                      <h3 className="text-[1rem] font-semibold text-fg mb-2">
                        {item.title}
                      </h3>
                      <p className="text-sm leading-relaxed text-fg/60">
                        {item.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <PullQuote variant="light">
                The best founders do not avoid equity at all costs. They avoid taking it
                too early, too cheaply, and for the wrong reasons.
              </PullQuote>
            </div>
          </div>
        </div>
      </section>

      {/* ── MYTHS VS REALITY ── */}
      <section id="myths" className="bg-[#0d1b2a] py-20 md:py-28">
        <div className="max-w-[1200px] mx-auto px-8">
          <div className="flex gap-16">
            <div className="w-48 flex-shrink-0 hidden lg:block" />
            <div className="flex-1 min-w-0 max-w-content">
              <p className="section-label-light">Myths vs Reality</p>
              <p className="text-body text-white/60 mb-8">
                Every form of capital has terms. The question is never whether strings are
                attached — it is whether the terms align with the business.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  {
                    myth: "You need VC to build a category-defining company.",
                    reality:
                      "Mailchimp was acquired for $12 billion without ever taking venture capital. Basecamp has been profitable since 1999 with complete strategic independence. Venture scale is one path, not the only path.",
                  },
                  {
                    myth: "Non-dilutive capital only works for small amounts.",
                    reality:
                      "Stacking government funding, RBF, cloud credits, and R&D tax credits can collectively exceed seven figures at zero dilution. The SBIR/STTR program alone has awarded billions in a single fiscal year.",
                  },
                  {
                    myth: "Venture debt is basically non-dilutive.",
                    reality:
                      "Venture debt includes warrants — typically translating to a 1–2% equity stake for the lender. Far less than an equity round, but not zero. Negotiate warrant coverage down with strong financials or competing term sheets.",
                  },
                  {
                    myth: "Grants are too slow and competitive to matter.",
                    reality:
                      "For deep-tech founders, grants force rigorous problem formulation before capital deployment. The timeline is a feature, not a bug. The key is selectivity — pursue high-fit programs, not every available program.",
                  },
                  {
                    myth: "RBF costs less than equity.",
                    reality:
                      "Whether RBF or equity is cheaper depends entirely on exit valuation. If the company exits at 10x revenue, the equity given up in a seed round is worth far more than the 6–12% fee on an RBF facility. Dilution's true cost is revealed only at exit.",
                  },
                  {
                    myth: "Non-dilutive capital means no strings attached.",
                    reality:
                      "Loans require repayment. Grants have compliance requirements. Partnerships include exclusivity provisions. RBF reduces monthly cash. Every capital source has terms — the right question is which terms align best.",
                  },
                ].map((item, i) => (
                  <div
                    key={i}
                    className="p-6 border border-white/10 bg-white/[0.03] rounded-sm"
                  >
                    <p className="text-[0.95rem] font-serif font-medium text-teal mb-3">
                      &ldquo;{item.myth}&rdquo;
                    </p>
                    <p className="text-sm leading-relaxed text-white/50">
                      {item.reality}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FOUNDER CONCERNS ── */}
      <section id="founder-concerns" className="bg-bg py-20 md:py-28">
        <div className="max-w-[1200px] mx-auto px-8">
          <div className="flex gap-16">
            <div className="w-48 flex-shrink-0 hidden lg:block" />
            <div className="flex-1 min-w-0 max-w-content">
              <p className="section-label">Founder Concerns</p>
              <h2 className="text-[1.75rem] md:text-[2rem] font-serif text-fg leading-tight mb-4">
                Urgent founder concerns.
              </h2>
              <p className="text-body text-fg/60 mb-8">
                The questions founders actually ask when evaluating non-dilutive capital.
              </p>
              <AccordionSection
                variant="light"
                items={[
                  {
                    title: "I'm pre-revenue. What can I access?",
                    content: (
                      <p>
                        SR&ED tax credits (offsetting payroll taxes), R&D grants, advance
                        purchase agreements, and strategic partnerships. Pre-revenue status
                        focuses your options on the grant and government side rather than
                        revenue-linked instruments — but it does not disqualify you from
                        meaningful non-dilutive capital. For Canadian companies doing genuine
                        R&D, SR&ED is accessible from day one.
                      </p>
                    ),
                  },
                  {
                    title: "Will non-dilutive capital hurt future VC fundraising?",
                    content: (
                      <p>
                        Generally the opposite. Using non-dilutive capital to reach key
                        milestones before raising equity provides more traction, a cleaner
                        cap table, and stronger negotiating leverage. The result is typically
                        a higher valuation when equity is eventually raised. Investors who
                        see disciplined capital allocation interpret it as a signal of quality.
                      </p>
                    ),
                  },
                  {
                    title: "Our revenue is lumpy. Does RBF still work?",
                    content: (
                      <p>
                        Lumpy or seasonal revenue is a mismatch for standard RBF, which
                        assumes consistent monthly revenue. Venture debt or invoice factoring
                        may be better suited. Some RBF providers now offer seasonal adjustments,
                        but this should be confirmed directly with lenders before committing.
                      </p>
                    ),
                  },
                  {
                    title: "Is IP-backed lending real?",
                    content: (
                      <p>
                        Real and growing. Traditional banks are entering the space with formal
                        IP-backed loan programs. The global IP finance market is projected to
                        nearly double by 2033. It remains most accessible for companies with
                        formally registered, defensible patents in markets with established IP
                        valuation frameworks — biotech, software, and medtech being the
                        strongest examples.
                      </p>
                    ),
                  },
                  {
                    title: "When should we choose debt over equity?",
                    content: (
                      <p>
                        When you have a clear path to repayment and the cost of equity —
                        measured in ownership, control, and future leverage — exceeds the cost
                        of debt. The most common scenario: you are 12–18 months from a
                        significantly higher valuation and need bridge capital. The 1–2%
                        warrant dilution on venture debt is dramatically cheaper than a
                        20%+ equity round at today&apos;s price.
                      </p>
                    ),
                  },
                  {
                    title: "What should Canadian founders prioritize first?",
                    content: (
                      <p>
                        SR&ED. For any Canadian company doing genuine R&D, SR&ED is the
                        highest-priority non-dilutive capital source. It rewards work already
                        being done. It does not require a competitive application. It does
                        not require revenue. Optimize SR&ED first, then evaluate grants
                        selectively, then layer on revenue-linked instruments as they become
                        available. Equity comes last — and at a stronger position.
                      </p>
                    ),
                  },
                ]}
              />
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
                    title: "What counts as non-dilutive capital?",
                    content: (
                      <p>
                        Any capital that does not require giving up equity in exchange for
                        funding. This includes revenue-based financing, venture debt (though
                        warrants create minor dilution), government grants, SR&ED tax credits,
                        IP-backed lending, strategic partnerships, customer financing, and
                        advance purchase agreements. The spectrum ranges from truly zero-dilution
                        (grants, pre-sales) to nearly zero-dilution (venture debt with warrants).
                      </p>
                    ),
                  },
                  {
                    title: "Is non-dilutive funding always better than equity?",
                    content: (
                      <p>
                        No. When a company needs massive capital fast, when the business
                        requires network effects that only top-tier VCs can unlock, or when a
                        winner-take-all market means speed of capital deployment determines the
                        outcome, equity may be the right choice. The point is not to avoid
                        equity. The point is to avoid taking it too early, at too low a
                        valuation, and for the wrong reasons.
                      </p>
                    ),
                  },
                  {
                    title: "What should Canadian startups prioritize first?",
                    content: (
                      <p>
                        SR&ED for any company doing qualifying R&D work. It is the most
                        reliable, most accessible, and most aligned non-dilutive capital source
                        available in Canada. From there: selective grants where fit is strong,
                        revenue-linked instruments once recurring revenue exists, and equity
                        only when the strategic case is clear.
                      </p>
                    ),
                  },
                  {
                    title: "Is SR&ED more important than grants?",
                    content: (
                      <p>
                        For most Canadian innovation companies, yes. SR&ED rewards work
                        already being done and does not require a competitive application.
                        Grants are valuable when the fit is strong, but the time cost of
                        pursuing low-probability programs often exceeds the expected value.
                        SR&ED first. Grants selectively.
                      </p>
                    ),
                  },
                  {
                    title: "When does revenue-based financing make sense?",
                    content: (
                      <p>
                        When you have consistent, recurring revenue of at least $10K/month and
                        need growth capital without a new valuation event. RBF works best for
                        SaaS, subscription, and e-commerce businesses with predictable revenue
                        patterns. It does not work well for pre-revenue companies, project-based
                        businesses, or companies with highly seasonal revenue.
                      </p>
                    ),
                  },
                  {
                    title: "When is venture debt dangerous?",
                    content: (
                      <p>
                        When there is no clear path to repayment. Venture debt does not
                        disappear if the business stalls. Founders who use it to delay hard
                        decisions — rather than to bridge toward a specific milestone — often
                        end up in worse positions. Covenants can restrict operating flexibility,
                        and in a downturn, debt obligations compound pressure on the business.
                      </p>
                    ),
                  },
                  {
                    title: "Can non-dilutive capital replace VC entirely?",
                    content: (
                      <p>
                        In some cases, yes. Companies have been built to significant scale and
                        acquired for billions without ever taking venture capital. But for
                        companies in winner-take-all markets or those requiring massive capital
                        deployment, a disciplined mix — with non-dilutive tools used to
                        maximize the valuation at which equity is taken — is typically the
                        sharpest strategy.
                      </p>
                    ),
                  },
                  {
                    title: "What is the smartest capital stack for an early-stage company?",
                    content: (
                      <p>
                        SR&ED and R&D tax credits to fund initial development. Grants where the
                        fit is strong. Pre-sales or strategic partnerships if applicable. RBF
                        once recurring revenue exists. Venture debt to bridge between stages.
                        Equity last — at a higher valuation, with a cleaner cap table, and
                        stronger negotiating leverage than founders who raised equity first.
                      </p>
                    ),
                  },
                ]}
              />
            </div>
          </div>
        </div>
      </section>

      {/* ── ASSESSMENT ── */}
      <section id="assessment" className="bg-bg py-20 md:py-28">
        <CtaPanel
          headline="Do not default to dilution."
          body="The right capital stack can extend runway, preserve ownership, and improve every future financing decision. execom helps founders pressure-test which capital belongs now, which should wait, and which should be avoided entirely."
          primaryLabel="Assess Capital Stack"
          primaryHref="/engage"
          secondaryLabel="Engage Execom"
          secondaryHref="/engage"
          variant="light"
        />
      </section>
    </>
  )
}
