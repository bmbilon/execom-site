import type { AdvisoryPageData } from "@/components/site/advisory/types"

export const nonDilutive: AdvisoryPageData = {
  href: "/non-dilutive-capital",
  crumb: "Non-dilutive capital",
  hero: {
    eyebrow: "Non-dilutive capital",
    title: "Grow without giving up *unnecessary equity*.",
    lede: "execom helps founders build smarter capital stacks using SR&ED, revenue-based financing, venture debt, and other non-dilutive tools, before defaulting to equity.",
    primary: { label: "Assess capital stack", href: "/engage" },
    secondary: { label: "Start with SR&ED", href: "/sred" },
    takeaways: [
      "The most expensive capital is equity taken too early, at too low a valuation.",
      "For Canadian founders doing genuine R&D, the smartest stack usually **starts with SR&ED**.",
      "Sequence the capital stack. Raise equity later, **from a position of strength**.",
    ],
  },
  chapters: [
    {
      id: "overview",
      nav: "Overview",
      title: "The cost of capital is more than interest.",
      summary:
        "Non-dilutive capital is a family of tools. Judge each on cost, speed, flexibility, dilution, and strategic fit, then sequence them for your stage.",
      blocks: [
        {
          kind: "points",
          items: [
            {
              label: "Ownership",
              text: "Every equity dollar raised permanently reduces founder ownership. Non-dilutive capital lets you grow without giving up the thing that matters most at exit.",
            },
            {
              label: "Flexibility",
              text: "Equity investors bring governance requirements, board expectations, and growth timelines. Non-dilutive tools let founders retain full operational latitude.",
            },
            {
              label: "Timing",
              text: "Capital taken too early, at too low a valuation, is the most expensive capital a founder will ever raise. Sequencing determines whether equity is strategic or destructive.",
            },
            {
              label: "Leverage",
              text: "Founders who arrive at the equity table with revenue, traction, and a clean cap table negotiate from strength. Non-dilutive capital creates that leverage.",
            },
          ],
        },
        {
          kind: "detail",
          label: "Read the full overview",
          blocks: [
            {
              kind: "prose",
              paras: [
                "Non-dilutive capital is not one instrument. It is a family of tools, SR&ED tax credits, revenue-based financing, venture debt, government funding, IP-backed lending, strategic partnerships, customer financing, and advance purchase agreements, each with different cost structures, speed, flexibility, and strategic implications.",
                "Founders should evaluate capital by five dimensions: cost, speed, flexibility, dilution, and strategic fit. The right answer depends on revenue stage, capital intensity, IP intensity, and control priorities. There is no universal recommendation, only better sequencing.",
                "For many Canadian founders, the smartest non-dilutive stack starts with SR&ED, not grants, not RBF, not venture debt. SR&ED rewards work already being done. Everything else layers on from there.",
              ],
            },
          ],
        },
      ],
    },
    {
      id: "equity-cost",
      nav: "The equity cost",
      title: "The *equity cost* most founders do not model properly.",
      summary:
        "Founder ownership erodes faster than most people realize. The steepest dilution comes before Series A, and its real cost shows up later, when the company is worth far more.",
      blocks: [
        {
          kind: "matrix",
          rowHeader: "Round",
          columns: [{ label: "Median dilution" }, { label: "Founder ownership after", highlight: true }],
          rows: [
            { label: "Seed", values: ["~20%", "~56% (founding team)"] },
            { label: "Series A", values: ["~20%", "~36%"] },
            { label: "Series B", values: ["~17%", "~23%"] },
            { label: "Series C+", values: ["~10–15%", "Investors own majority"] },
          ],
        },
        {
          kind: "quote",
          text: "Dilution is easy to ignore when the round closes. It gets expensive when the company works.",
        },
        {
          kind: "detail",
          label: "Read the full argument",
          blocks: [
            {
              kind: "prose",
              paras: [
                "Founder ownership erodes much faster than most people realize. The steepest dilution usually happens before Series A, when the company is worth the least and the equity is the most expensive to give away. The real cost of that equity only becomes fully visible later, when the company is worth dramatically more.",
                "Capital efficiency has become a signal of quality. Investors who see a clean non-dilutive capital history now interpret it as evidence of disciplined capital allocation, not inability to raise equity.",
              ],
            },
          ],
        },
      ],
    },
    {
      id: "why-now",
      nav: "Why now",
      title: "Why non-dilutive capital matters more now.",
      summary:
        "Venture capital has consolidated around fewer, bigger bets. For founders outside the AI megaround narrative, the funding landscape has narrowed, and non-dilutive alternatives have stepped into the gap.",
      blocks: [
        {
          kind: "accordion",
          items: [
            {
              title: "VC has consolidated around fewer companies",
              body: [
                "Global VC fundraising fell to its lowest level in a decade in 2025. First-time VC managers, historically the ones backing the earliest startups, saw fundraising collapse. Meanwhile, deal value surged past half a trillion dollars, but deal count fell sharply. More money is going to fewer companies. For founders building outside the dominant narrative, the competitive landscape for equity funding looks nothing like the headlines suggest.",
              ],
            },
            {
              title: "Early-stage capital is harder to access",
              body: [
                "The median time between rounds has stretched significantly. Seed to Series A now takes over two years on average. The full fundraising process, from first outreach to close, realistically takes five to ten months. If you have 18 months of runway, you actually have roughly nine months to build traction before you need to restart the raise. Non-dilutive capital extends that window.",
              ],
            },
            {
              title: "More founders are optimizing for efficiency",
              body: [
                "The era of growth-at-all-costs has given way to a clear market preference for capital efficiency. Startups are expected to prove sustainable traction and access the right type of capital for each stage, not just the most visible type. The founders who are winning capital now are the ones who can demonstrate disciplined capital allocation, not just ambitious burn rates.",
              ],
            },
            {
              title: "The best founders now sequence capital instead of defaulting to equity",
              body: [
                "The most sophisticated founders do not choose between dilutive and non-dilutive. They sequence them. Non-dilutive capital funds the early stages. Revenue-linked instruments fund growth. Equity enters later, at a higher valuation, when the network and scale of capital genuinely cannot be replicated any other way. This is not theory. It is the emerging standard among capital-efficient founders.",
              ],
            },
          ],
        },
      ],
    },
    {
      id: "canada-factor",
      nav: "The Canada factor",
      eyebrow: "Signature section",
      tone: "feature",
      title: "The *Canada* factor.",
      summary:
        "Smaller venture pools, slower fundraising, and a smaller domestic market make non-dilutive capital a core strategic layer in Canada. The common mistake is pursuing the wrong forms in the wrong order.",
      blocks: [
        {
          kind: "quote",
          text: "In Canada, non-dilutive capital is not a side strategy. It is often the difference between leverage and desperation.",
        },
        {
          kind: "accordion",
          items: [
            {
              title: "Canada makes runway more precious",
              body: [
                "Canadian venture rounds are smaller. Fundraising cycles are longer. The domestic market is roughly one-tenth the size of the US market, which means time-to-proof takes longer and revenue scales more slowly in the early stages.",
                "Every month of additional runway matters more in Canada than it does in a market where a Series A can close in six weeks. Non-dilutive capital is how Canadian founders buy the time they need to reach the milestones that make equity fundraising worthwhile.",
              ],
            },
            {
              title: "SR&ED is the workhorse, not the side note",
              body: [
                "For many Canadian innovation companies, SR&ED is the highest-priority non-dilutive capital source. It aligns with actual technical work and rewards spend already happening, salaries, contractors, materials, cloud infrastructure.",
                "Unlike grants, SR&ED does not require a competitive application. Unlike RBF, it does not require revenue. Unlike venture debt, it does not require an equity round. For companies doing genuine R&D, SR&ED is the most reliable, highest-priority non-dilutive capital available in Canada. The fact that most founders underutilize it is a structural problem, not a signal that it does not matter.",
              ],
            },
            {
              title: "Grants are often over-romanticized",
              body: [
                "Traditional grants can matter. But many founders waste months chasing low-probability, high-friction programs before optimizing the more reliable layers first. Grant applications are competitive, slow, and come with compliance overhead that can distract small teams from building.",
                "The smarter approach: optimize SR&ED first, then evaluate whether targeted grant programs genuinely fit, not the other way around. Grants should be a deliberate addition to the capital stack, not the starting point.",
              ],
            },
            {
              title: "Canada rewards sharper capital sequencing",
              body: [
                "Canadian founders who think in terms of sequencing outperform those who default to a single capital source. The practical order for most innovation companies:",
                "**SR&ED first. Practical support second. Revenue-linked capital once available. Equity later, and at a stronger position.**",
                "This sequence is not theoretical. It reflects how the most capital-efficient Canadian companies actually build their funding stacks, and it is the framework execom uses with every founder engagement.",
              ],
            },
            {
              title: "Why execom exists",
              body: [
                "execom helps founders design capital stacks that fit Canadian reality instead of imported Silicon Valley mythology. That means starting with the non-dilutive instruments that are most accessible and most aligned with the actual work being done, then layering on additional capital only when the strategic case is clear. The goal is not to avoid equity. The goal is to take it from a position of strength.",
              ],
            },
          ],
        },
        {
          kind: "detail",
          label: "Read the full argument",
          blocks: [
            {
              kind: "prose",
              paras: [
                "Canadian founders operate in a structurally tighter capital environment: smaller venture pools, slower fundraising, smaller domestic markets, and more pressure to extend runway before institutional capital shows up. That makes non-dilutive capital more than optional. It becomes a core strategic layer. The mistake is not underusing it. The mistake is pursuing the wrong forms in the wrong order.",
              ],
            },
          ],
        },
      ],
    },
    {
      id: "capital-types",
      nav: "Capital types",
      title: "The major forms of non-dilutive capital.",
      summary:
        "Seven instruments, each with its own cost structure, eligibility requirements, strategic implications, and risks. The useful question is which one fits this company at this stage.",
      blocks: [
        {
          kind: "accordion",
          items: [
            {
              title: "Revenue-based financing",
              body: [
                "**How it works:** A lender provides upfront capital in exchange for a fixed percentage of monthly revenue until a repayment cap, typically 1.2–1.5x the principal, is reached. Repayments flex with revenue, so there are no fixed monthly obligations.",
                "**Best for:** SaaS, subscription businesses, and e-commerce companies with recurring, predictable revenue. Generally requires at least $10K/month in recurring revenue.",
                "**Advantages:** No equity loss, no board seats, funding decisions in 24–48 hours, repayments flex with revenue cycles.",
                "**Risks:** Reduces monthly cash available for growth. Effective APR can be high if repaid quickly. Pre-revenue startups are ineligible.",
                "**When it is smarter than equity:** When you have predictable revenue and need growth capital without a new valuation event. RBF lets you scale on your own terms.",
                "**Where founders misuse it:** Taking RBF when revenue is too lumpy or margins are too thin. The flexible repayment structure only works if there is consistent revenue to flex with.",
              ],
            },
            {
              title: "Venture debt",
              body: [
                "**How it works:** Loans extended to startups with strong fundamentals, typically structured as term loans or revolving lines. Most deals include warrants giving the lender the right to purchase a small equity stake, typically 1–2%, at the last round price.",
                "**Best for:** Startups at or near profitability, companies bridging between equity rounds, and founders who want to extend runway without triggering a new dilutive round.",
                "**Advantages:** Significantly less dilutive than equity. Extends runway without a new valuation event. Preserves negotiating leverage for the next equity round.",
                "**Risks:** Still includes some dilution via warrants. Requires repayment regardless of business performance. Covenants can restrict operating flexibility. Interest rates typically run 8–15% annually.",
                "**When it is smarter than equity:** When you are 12–18 months from a much higher valuation and need bridge capital. The 1–2% warrant dilution is dramatically cheaper than a 20%+ equity round at today's valuation.",
                "**Where founders misuse it:** Taking venture debt without a clear path to repayment. Debt does not disappear if the business stalls. Founders who use it to delay hard decisions about the business often end up in worse positions.",
              ],
            },
            {
              title: "Government funding (grants, R&D tax credits, SR&ED)",
              body: [
                "**How it works:** Federal and provincial/state agencies offer grants and tax credits to fund R&D and innovation. In Canada, SR&ED provides refundable tax credits for qualifying R&D expenditures. Grants like IRAP, SBIR/STTR, and sector-specific programs provide direct non-repayable funding.",
                "**Best for:** Research-intensive startups, deep-tech, biotech, cleantech, and companies with genuine technological uncertainty in their development work.",
                "**Advantages:** Truly non-dilutive, no repayment, no equity. Adds credibility with future investors. SR&ED specifically rewards work already being done. R&D tax credits can be used annually.",
                "**Risks:** Grants are competitive and slow. Compliance and reporting requirements can burden small teams. Restricted use of funds, cannot cover general operations.",
                "**When it is smarter than equity:** Almost always, for qualifying companies. SR&ED should be the first layer of the capital stack for any Canadian company doing genuine R&D. Grants should be evaluated selectively based on fit, not pursued broadly.",
                "**Where founders misuse it:** Chasing every available grant program instead of optimizing SR&ED first. The time cost of low-probability grant applications often exceeds the expected value. Focus on high-probability, high-alignment programs.",
              ],
            },
            {
              title: "IP-backed lending",
              body: [
                "**How it works:** Patents, trademarks, copyrights, and proprietary software are used as collateral to secure loans. The lender evaluates IP value using discounted cash flow analysis, comparable licensing rates, or royalty forecasts.",
                "**Best for:** Companies with strong patent portfolios, validated software IP, or proprietary processes, especially those with minimal physical assets but substantial R&D value.",
                "**Advantages:** Monetizes assets that previously could not serve as collateral. No equity dilution. Strengthens IP protection incentives. Increasingly accessible as traditional banks enter the space.",
                "**Risks:** IP valuation is complex and subjective. The lender may have rights to IP if you default. Still an emerging market with limited lender options. Most accessible for companies with formally registered, defensible patents.",
                "**When it is smarter than equity:** When your IP portfolio is your primary asset and you need capital without diluting the very ownership that makes the IP valuable.",
                "**Where founders misuse it:** Assuming unregistered or undefended IP qualifies. Lenders require formal, defensible IP with clear valuation frameworks.",
              ],
            },
            {
              title: "Strategic partnerships",
              body: [
                "**How it works:** Co-development agreements, licensing deals, distribution partnerships, and joint ventures provide capital, resources, or revenue without equity exchange. A corporate partner may fund R&D in exchange for exclusive access rights, licensing fees, or preferred pricing.",
                "**Best for:** Companies with proprietary technology, unique IP, or distribution advantages that large corporations want to access.",
                "**Advantages:** Can provide capital plus market access. Validates technology and de-risks future VC raises. No repayment obligations if structured as licensing. Opens customer distribution channels.",
                "**Risks:** May restrict ability to partner with competitors. Negotiation complexity and long lead times. Overdependence on one corporate partner. IP ownership and licensing terms require careful legal structuring.",
                "**When it is smarter than equity:** When you need distribution, validation, and capital simultaneously. A strategic partner who funds development and provides market access is often worth more than an equity round that provides only cash.",
                "**Where founders misuse it:** Giving away exclusivity too broadly or too early. Strategic partnerships should enhance your negotiating position, not lock you into a single channel.",
              ],
            },
            {
              title: "Customer financing (PO & invoice financing)",
              body: [
                "**How it works:** Purchase order financing lets a third-party lender pay your suppliers directly to fulfill a confirmed customer order. Approval is based on the customer's creditworthiness, not yours. Invoice factoring operates post-delivery: selling accounts receivable at a discount, typically receiving 80–95% upfront, to a factoring company.",
                "**Best for:** Product-based startups, manufacturers, distributors, and importers/exporters fulfilling large confirmed orders.",
                "**Advantages:** No equity dilution. No business credit history required. Funding based on customer strength. Can fund 100% of inventory costs. Fast approval.",
                "**Risks:** Fees (typically 1–5% per 30 days) add up on long receivable cycles. Only available for confirmed purchase orders. Customer quality is critical, weak customers disqualify deals.",
                "**When it is smarter than equity:** When you have confirmed orders but not the cash to fulfill them. This is working capital, not growth capital, and it should be treated that way.",
                "**Where founders misuse it:** Using PO financing as a crutch for chronic cash flow problems. If your margins cannot absorb the fees, the business model needs work, not more financing.",
              ],
            },
            {
              title: "Advance purchase agreements (pre-sales)",
              body: [
                "**How it works:** Customers or partners commit to purchasing a product or service before it is built or shipped, providing upfront cash that funds development without any equity exchange. Can range from crowdfunding pre-orders to structured corporate offtake agreements.",
                "**Best for:** Hardware startups, consumer products, and any company where customer validation aligns with funding needs. Climate tech companies have seen significant traction with advance purchase commitments from large corporates.",
                "**Advantages:** Truly non-dilutive, no debt, no equity. Provides market validation alongside capital. Aligns incentives with actual customer demand. Can be structured as long-term offtake agreements.",
                "**Risks:** Delivery failure damages customer relationships. Requires trusted credibility. Revenue recognition complexity. Limited scalability for capital-intensive development.",
                "**When it is smarter than equity:** When you can validate demand and fund production simultaneously. Pre-sales prove market appetite in a way that no pitch deck can.",
                "**Where founders misuse it:** Over-promising delivery timelines to secure upfront cash. Pre-sales create obligations. If you cannot deliver, you lose the customers and the credibility.",
              ],
            },
          ],
        },
      ],
    },
    {
      id: "decision-framework",
      nav: "Decision framework",
      title: "How founders should decide.",
      summary:
        "Five variables decide which instrument fits: revenue stage, capital intensity, revenue predictability, IP intensity, and control priority. Most founders misjudge at least one, and the stack ends up constraining the business.",
      blocks: [
        {
          kind: "accordion",
          items: [
            {
              title: "Revenue stage",
              body: [
                "Pre-revenue startups have few non-dilutive options beyond grants, SR&ED, and pre-sales. Once a company crosses roughly $10K/month recurring revenue, RBF and some venture debt become accessible. Post-Series A traction unlocks IP-backed lending and corporate partnerships.",
                "**Where founders misjudge:** Assuming pre-revenue means no non-dilutive options. SR&ED, grants, and pre-sales can collectively fund substantial early development.",
              ],
            },
            {
              title: "Capital intensity",
              body: [
                "If a company needs $50M+ fast, equity often remains the only practical path. Non-dilutive options individually cap out at lower amounts, though stacking government funding, RBF, cloud credits, and R&D tax credits can collectively exceed seven figures at zero dilution for qualified startups.",
                "**Where founders misjudge:** Thinking they need massive capital when a more efficient approach would require far less. The capital intensity assumption often reflects the plan, not the business.",
              ],
            },
            {
              title: "Revenue predictability",
              body: [
                "Predictable recurring revenue, SaaS, subscriptions, is ideal for RBF. Variable or lumpy revenue suits grants, PO financing, or venture debt better. The mismatch between revenue pattern and capital instrument is one of the most common mistakes founders make.",
                "**Where founders misjudge:** Assuming RBF works for any business with revenue. It works specifically for businesses with consistent, recurring revenue. Seasonal or project-based revenue requires different instruments.",
              ],
            },
            {
              title: "IP intensity",
              body: [
                "Strong, registered patent portfolios unlock IP-backed lending and strengthen grant applications. Companies without defensible IP have fewer non-dilutive options in the knowledge economy. The value of IP as collateral is growing as traditional banks enter the space.",
                "**Where founders misjudge:** Treating IP as a legal formality rather than a financial asset. Unregistered IP has no collateral value and weakens every capital conversation.",
              ],
            },
            {
              title: "Control priority",
              body: [
                "If maintaining full operational control is paramount, because the cap table is already complex, or the founder is building toward a specific acquisition, prioritize grants, RBF, and SR&ED over venture debt (which carries covenants) or corporate partnerships (which carry exclusivity risks).",
                "**Where founders misjudge:** Thinking equity is the only capital source that affects control. Venture debt covenants, partnership exclusivity clauses, and grant compliance requirements all constrain operational freedom in different ways.",
              ],
            },
          ],
        },
      ],
    },
    {
      id: "hybrid-stack",
      nav: "Hybrid stack",
      title: "The smartest founders *sequence* capital.",
      summary:
        "Each stage has a layer of capital that fits it. Equity comes last, at a higher valuation, when its network or scale cannot be replicated any other way.",
      blocks: [
        {
          kind: "steps",
          items: [
            {
              title: "Early stage",
              text: "SR&ED tax credits, R&D grants where justified, pre-sales, strategic support, and cloud credits. The goal is to fund initial IP development and early product work without touching the cap table. For Canadian companies, SR&ED should be the first instrument evaluated, it rewards spend already happening.",
            },
            {
              title: "Early traction",
              text: "Revenue-based financing and other low-dilution working capital. Once recurring revenue exists, RBF lets founders fund sales and marketing without equity. The repayment flexes with revenue, preserving cash during slower months and accelerating paydown during strong ones.",
            },
            {
              title: "Growth stage",
              text: "Venture debt and structured credit facilities. Extend runway between equity rounds, fund expansion, or bridge to profitability. The 1–2% warrant dilution is dramatically cheaper than a full equity round at the current valuation.",
            },
            {
              title: "Selective equity",
              text: "A strategic VC round at a higher valuation, taken only when the network, credibility, or scale of capital genuinely cannot be replicated non-dilutively. The founder arrives at this stage with more traction, a cleaner cap table, and stronger negotiating leverage than founders who defaulted to equity from day one.",
            },
          ],
        },
        {
          kind: "quote",
          text: "The best founders do not avoid equity at all costs. They avoid taking it too early, too cheaply, and for the wrong reasons.",
        },
      ],
    },
    {
      id: "myths",
      nav: "Myths vs reality",
      title: "Every form of capital has terms.",
      summary:
        "Loans require repayment, grants bring compliance, partnerships carry exclusivity. The question is whether those terms align with the business.",
      blocks: [
        {
          kind: "accordion",
          items: [
            {
              title: "“You need VC to build a category-defining company.”",
              body: [
                "Mailchimp was acquired for $12 billion without ever taking venture capital. Basecamp has been profitable since 1999 with complete strategic independence. Venture scale is one path, not the only path.",
              ],
            },
            {
              title: "“Non-dilutive capital only works for small amounts.”",
              body: [
                "Stacking government funding, RBF, cloud credits, and R&D tax credits can collectively exceed seven figures at zero dilution. The SBIR/STTR program alone has awarded billions in a single fiscal year.",
              ],
            },
            {
              title: "“Venture debt is basically non-dilutive.”",
              body: [
                "Venture debt includes warrants, typically translating to a 1–2% equity stake for the lender. Far less than an equity round, but not zero. Negotiate warrant coverage down with strong financials or competing term sheets.",
              ],
            },
            {
              title: "“Grants are too slow and competitive to matter.”",
              body: [
                "For deep-tech founders, grants force rigorous problem formulation before capital deployment. The timeline is a feature, not a bug. The key is selectivity, pursue high-fit programs, not every available program.",
              ],
            },
            {
              title: "“RBF costs less than equity.”",
              body: [
                "Whether RBF or equity is cheaper depends entirely on exit valuation. If the company exits at 10x revenue, the equity given up in a seed round is worth far more than the 6–12% fee on an RBF facility. Dilution's true cost is revealed only at exit.",
              ],
            },
            {
              title: "“Non-dilutive capital means no strings attached.”",
              body: [
                "Loans require repayment. Grants have compliance requirements. Partnerships include exclusivity provisions. RBF reduces monthly cash. Every capital source has terms, the right question is which terms align best.",
              ],
            },
          ],
        },
      ],
    },
    {
      id: "founder-concerns",
      nav: "Founder concerns",
      title: "Urgent founder concerns.",
      summary:
        "The questions founders actually ask about non-dilutive capital, from pre-revenue options and lumpy revenue to when debt beats equity.",
      blocks: [
        {
          kind: "accordion",
          items: [
            {
              title: "I'm pre-revenue. What can I access?",
              body: [
                "SR&ED tax credits (offsetting payroll taxes), R&D grants, advance purchase agreements, and strategic partnerships. Pre-revenue status focuses your options on the grant and government side rather than revenue-linked instruments, but it does not disqualify you from meaningful non-dilutive capital. For Canadian companies doing genuine R&D, SR&ED is accessible from day one.",
              ],
            },
            {
              title: "Will non-dilutive capital hurt future VC fundraising?",
              body: [
                "Generally the opposite. Using non-dilutive capital to reach key milestones before raising equity provides more traction, a cleaner cap table, and stronger negotiating leverage. The result is typically a higher valuation when equity is eventually raised. Investors who see disciplined capital allocation interpret it as a signal of quality.",
              ],
            },
            {
              title: "Our revenue is lumpy. Does RBF still work?",
              body: [
                "Lumpy or seasonal revenue is a mismatch for standard RBF, which assumes consistent monthly revenue. Venture debt or invoice factoring may be better suited. Some RBF providers now offer seasonal adjustments, but this should be confirmed directly with lenders before committing.",
              ],
            },
            {
              title: "Is IP-backed lending real?",
              body: [
                "Real and growing. Traditional banks are entering the space with formal IP-backed loan programs. The global IP finance market is projected to nearly double by 2033. It remains most accessible for companies with formally registered, defensible patents in markets with established IP valuation frameworks, biotech, software, and medtech being the strongest examples.",
              ],
            },
            {
              title: "When should we choose debt over equity?",
              body: [
                "When you have a clear path to repayment and the cost of equity, measured in ownership, control, and future leverage, exceeds the cost of debt. The most common scenario: you are 12–18 months from a significantly higher valuation and need bridge capital. The 1–2% warrant dilution on venture debt is dramatically cheaper than a 20%+ equity round at today's price.",
              ],
            },
            {
              title: "What should Canadian founders prioritize first?",
              body: [
                "SR&ED. For any Canadian company doing genuine R&D, SR&ED is the highest-priority non-dilutive capital source. It rewards work already being done. It does not require a competitive application. It does not require revenue. Optimize SR&ED first, then evaluate grants selectively, then layer on revenue-linked instruments as they become available. Equity comes last, and at a stronger position.",
              ],
            },
          ],
        },
      ],
    },
  ],
  midCta: {
    after: "capital-types",
    title: "The right capital at the right time changes everything.",
    body: "Most founders default to equity because it is familiar. execom helps founders evaluate every layer of the capital stack before dilution, bad terms, or unnecessary dependence become permanent.",
    primary: { label: "Assess capital stack", href: "/engage" },
    secondary: { label: "Explore SR&ED", href: "/sred" },
  },
  faq: [
    {
      q: "What counts as non-dilutive capital?",
      a: [
        "Any capital that does not require giving up equity in exchange for funding. This includes revenue-based financing, venture debt (though warrants create minor dilution), government grants, SR&ED tax credits, IP-backed lending, strategic partnerships, customer financing, and advance purchase agreements. The spectrum ranges from truly zero-dilution (grants, pre-sales) to nearly zero-dilution (venture debt with warrants).",
      ],
    },
    {
      q: "Is non-dilutive funding always better than equity?",
      a: [
        "No. When a company needs massive capital fast, when the business requires network effects that only top-tier VCs can unlock, or when a winner-take-all market means speed of capital deployment determines the outcome, equity may be the right choice. The point is not to avoid equity. The point is to avoid taking it too early, at too low a valuation, and for the wrong reasons.",
      ],
    },
    {
      q: "What should Canadian startups prioritize first?",
      a: [
        "SR&ED for any company doing qualifying R&D work. It is the most reliable, most accessible, and most aligned non-dilutive capital source available in Canada. From there: selective grants where fit is strong, revenue-linked instruments once recurring revenue exists, and equity only when the strategic case is clear.",
      ],
    },
    {
      q: "Is SR&ED more important than grants?",
      a: [
        "For most Canadian innovation companies, yes. SR&ED rewards work already being done and does not require a competitive application. Grants are valuable when the fit is strong, but the time cost of pursuing low-probability programs often exceeds the expected value. SR&ED first. Grants selectively.",
      ],
    },
    {
      q: "When does revenue-based financing make sense?",
      a: [
        "When you have consistent, recurring revenue of at least $10K/month and need growth capital without a new valuation event. RBF works best for SaaS, subscription, and e-commerce businesses with predictable revenue patterns. It does not work well for pre-revenue companies, project-based businesses, or companies with highly seasonal revenue.",
      ],
    },
    {
      q: "When is venture debt dangerous?",
      a: [
        "When there is no clear path to repayment. Venture debt does not disappear if the business stalls. Founders who use it to delay hard decisions, rather than to bridge toward a specific milestone, often end up in worse positions. Covenants can restrict operating flexibility, and in a downturn, debt obligations compound pressure on the business.",
      ],
    },
    {
      q: "Can non-dilutive capital replace VC entirely?",
      a: [
        "In some cases, yes. Companies have been built to significant scale and acquired for billions without ever taking venture capital. But for companies in winner-take-all markets or those requiring massive capital deployment, a disciplined mix, with non-dilutive tools used to maximize the valuation at which equity is taken, is typically the sharpest strategy.",
      ],
    },
    {
      q: "What is the smartest capital stack for an early-stage company?",
      a: [
        "SR&ED and R&D tax credits to fund initial development. Grants where the fit is strong. Pre-sales or strategic partnerships if applicable. RBF once recurring revenue exists. Venture debt to bridge between stages. Equity last, at a higher valuation, with a cleaner cap table, and stronger negotiating leverage than founders who raised equity first.",
      ],
    },
  ],
  closing: {
    title: "Do not default to *dilution*.",
    body: "The right capital stack can extend runway, preserve ownership, and improve every future financing decision. execom helps founders pressure-test which capital belongs now, which should wait, and which to avoid.",
    primary: { label: "Assess capital stack", href: "/engage" },
    secondary: { label: "Explore VC and angel capital", href: "/vc-angel-capital" },
  },
}
