import type { AdvisoryPageData } from "@/components/site/advisory/types"

export const distributionAccess: AdvisoryPageData = {
  href: "/distribution-access",
  crumb: "Distribution access",
  hero: {
    eyebrow: "Distribution access",
    title: "Distribution is where most companies *actually fail*.",
    lede: "execom helps founders get to market through the right channels, with the right sequencing, economics, and commercial logic.",
    primary: { label: "Assess distribution strategy", href: "/engage" },
    secondary: { label: "Explore market entry", href: "/market-entry" },
    takeaways: [
      "When a company with a real product fails, the cause is almost always **distribution**.",
      "**Prove one channel** and document the playbook before you add a second.",
      "Fees and discounts across the chain can consume 30–60% of revenue. Model economics channel by channel.",
    ],
  },
  chapters: [
    {
      id: "overview",
      nav: "Overview",
      title: "Distribution is a core commercial system.",
      summary:
        "Access, channel economics, relationship leverage, and capital timing all sit inside it. Channels open more slowly than founders expect and need more infrastructure than they plan for.",
      blocks: [
        {
          kind: "points",
          items: [
            {
              label: "Access",
              text: "Shelf space is zero-sum. Enterprise trust takes years. Distribution is about earning a position that someone else currently holds, and defending it.",
            },
            {
              label: "Margin",
              text: "Every layer in the distribution chain takes a cut. Slotting fees, distributor discounts, referral commissions, and marketplace fees can consume 30–60% of revenue before the company sees a dollar.",
            },
            {
              label: "Control",
              text: "Direct channels give data and brand control. Intermediaries give reach. The tradeoff is structural, and choosing wrong is expensive to reverse.",
            },
            {
              label: "Timing",
              text: "Distribution relationships take 6–18 months to activate. Founders who start conversations when they need revenue are already too late.",
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
                "Distribution is not just a sales or marketing issue. It is a core commercial system involving access, channel economics, relationship leverage, and capital timing. Founders routinely overestimate how quickly channels open and underestimate how much infrastructure they require.",
                "The right distribution model depends on product type, average contract value, margins, capital constraints, and buyer behavior. Get it wrong and a great product sits in a warehouse or a demo queue, burning cash while access to buyers never becomes real.",
              ],
            },
          ],
        },
      ],
    },
    {
      id: "why-hard",
      nav: "Why it's hard",
      title: "The barriers are access, capital, and relationships.",
      summary:
        "Shelf space is zero-sum and capital goes out before any revenue comes back. Enterprise deals often take six months to a year, and once you run several channels, they compete with each other.",
      blocks: [
        {
          kind: "quote",
          text: "Most companies do not lose because the product was impossible. They lose because access to buyers never became real.",
        },
        {
          kind: "accordion",
          items: [
            {
              title: "Shelf space is zero-sum",
              body: [
                "Retail shelf space has remained largely static while new product introductions have accelerated. Retailers use slotting fees as both a gatekeeping mechanism and a profit center, fees that can be substantial for a national rollout. The asymmetry is sharp: the retailer gets paid whether your product sells or not. Getting listed is not distribution. Staying listed, with enough velocity to justify the space, is.",
              ],
            },
            {
              title: "Capital is front-loaded",
              body: [
                "For product companies, the cash flow problem is structural. Manufacturing, packaging, slotting fees, promotional spend, and shipping all happen before a single dollar of sell-through revenue. Payment terms of 30–90 days mean the company funds the entire channel before it gets paid back. Brands that skip capital preparation get listed, underperform, and get delisted, with no refund on the investment.",
              ],
            },
            {
              title: "Enterprise cycles are long and opaque",
              body: [
                "B2B enterprise sales cycles routinely stretch six months to a year or more. Legal reviews, procurement workflows, and committee-based decisions add layers of delay. The harder truth: the majority of enterprise buyers have already short-listed vendors before the research process begins. Brand and reputation need to exist before the sales conversation starts, which means distribution preparation begins long before the first meeting.",
              ],
            },
            {
              title: "Channel conflict destroys trust",
              body: [
                "Once you establish multiple distribution channels, they begin to compete with each other. Selling direct while a distributor sells the same product to the same buyers at the same price creates an adversarial relationship with a partner you need. Pricing inconsistencies across platforms erode partner confidence. Channel conflict is quiet, cumulative, and usually noticed only after the damage is done.",
              ],
            },
            {
              title: "Product quality does not create inevitability",
              body: [
                "The most persistent founder mistake is confusing product quality with distribution inevitability. Of companies that did have a real product, failure was almost always a distribution problem, not a product one. Early-stage go-to-market strategies often fail because they adopt frameworks designed for growth-stage companies: hiring sales teams before validating the motion, spreading resources across too many channels, and scaling assumptions instead of truths.",
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
        "Distribution in Canada is more accessible than founders think, and more constrained. A company can get into Canada without building meaningful distribution inside it.",
      blocks: [
        {
          kind: "quote",
          text: "Canada is not a shortcut to distribution. It is a distinct market with less room for error.",
        },
        {
          kind: "accordion",
          items: [
            {
              title: "Smaller market, tighter networks",
              body: [
                "Canada can be easier to navigate in some categories because the ecosystem is smaller, fewer gatekeepers, more concentrated decision-making, and shorter paths to key buyers. But that also means relationships matter disproportionately. The buyer at a major Canadian retailer or the procurement lead at a crown corporation has outsized influence. Burning a relationship in a small network is harder to recover from than in the US.",
              ],
            },
            {
              title: "Regional fragmentation is real",
              body: [
                "Success in Ontario does not mean success in Quebec, Alberta, or BC. Buyer behavior, language requirements, regulatory regimes, and professional networks differ materially. Quebec operates under a distinct civil law tradition and requires French in all commercial activity. A distribution strategy that works in Toronto may need to be substantially rebuilt for Montreal or Calgary.",
              ],
            },
            {
              title: "Slower enterprise and retail motion",
              body: [
                "Canadian buyers and institutions often move more cautiously than their US counterparts. Enterprise purchasing is more consensus-driven, and retail category reviews can run on longer cycles. This stretches sell-through timelines, delays reorder signals, and makes early traction harder to demonstrate, which matters when distributors and investors are watching velocity.",
              ],
            },
            {
              title: "Canada is rarely enough on its own",
              body: [
                "For many ambitious companies, Canada can validate a model, support a channel layer, or serve as a proving ground, but it rarely provides enough scale by itself to justify the full outcome founders want. The domestic addressable market in most categories is a fraction of the US equivalent. Founders who treat Canadian distribution as the endgame rather than a stepping stone often discover the ceiling too late.",
              ],
            },
            {
              title: "Why execom exists",
              body: [
                "execom helps founders determine whether Canada should be a validation market, a strategic channel layer, a secondary geography, or part of a broader North American distribution rollout. The answer depends on product type, margin structure, buyer behavior, and the company's actual scale ambitions, not on convenience.",
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
                "Canada can be a workable proving ground for some companies, but founders often misread how distribution actually works here. The market is smaller, relationships matter disproportionately, regional variation is real, and national scale is much harder than outsiders assume. A company can get into Canada without actually building meaningful distribution inside Canada.",
              ],
            },
          ],
        },
      ],
    },
    {
      id: "channel-types",
      nav: "Channel types",
      title: "Each channel has its own economics and failure modes.",
      summary:
        "Margin, speed, and control shift from one channel to the next. Know what you are actually buying into before you commit.",
      blocks: [
        {
          kind: "accordion",
          items: [
            {
              title: "Retail distribution",
              body: [
                "Placement in physical or online retail stores. Access requires pitching category buyers, passing vendor compliance, and agreeing to slotting fees, promotional co-op spending, and performance minimums. The timeline from first buyer conversation to shelf is typically 6–18 months for a national retailer.",
                "**Margin:** Low to medium (30–50% after distributor fees and slotting). **Speed:** 6–18 months. **Control:** Low, the retailer owns the shelf and the customer. **Common mistake:** Launching nationally before proving velocity regionally. Start with specialty and regional chains that move faster and require less capital.",
              ],
            },
            {
              title: "Enterprise sales",
              body: [
                "Direct sales to business customers, corporations, governments, institutions. Involves long, multi-stakeholder decision processes with legal, procurement, and security reviews. The highest-value lever is warm introductions and proof-of-concept pilots.",
                "**Margin:** High (70–90%). **Speed:** 6–18+ months per deal. **Control:** High, direct relationship and data. **Common mistake:** Delegating sales before founding team has closed 10–20 deals and documented a repeatable process.",
              ],
            },
            {
              title: "Channel partners",
              body: [
                "Third-party companies that sell, implement, or refer your product in exchange for commission or revenue share. Includes resellers, VARs, referral partners, and technology integration partners. Revenue share typically runs 10–25% of MRR for embedded partners.",
                "**Margin:** Medium (50–70%). **Speed:** 3–12 months to first revenue. **Control:** Medium, shared customer relationship. **Common mistake:** Building a wide, low-commitment partner network instead of a small number of high-commitment partners with genuine economics.",
              ],
            },
            {
              title: "Distributors",
              body: [
                "Companies that hold inventory and sell to retailers or end customers on your behalf. They dramatically lower go-to-market complexity, but at the cost of margin, visibility, and customer data. You often do not know which end customers are buying your product.",
                "**Margin:** Low to medium (40–60% off MSRP for consumer goods). **Speed:** 6–18 months. **Control:** Low, the distributor controls placement, pricing, and sell-through. **Common mistake:** Granting exclusivity without performance minimums. Distributors that hold your product without actively selling it are a liability, not an asset.",
              ],
            },
            {
              title: "Marketplaces",
              body: [
                "Third-party platforms, Amazon, Walmart Marketplace, app stores, Salesforce AppExchange, and industry-specific B2B marketplaces. Immediate access to massive traffic and built-in trust, but with loss of customer data, pricing pressure, and fee stacking.",
                "**Margin:** Medium (55–75% after fees). **Speed:** Days to weeks. **Control:** Very low, algorithm dependency, brand dilution risk. **Common mistake:** Making a marketplace the sole distribution channel. Use it for discovery and demand validation, then build direct channels to protect margins and customer relationships.",
              ],
            },
            {
              title: "Strategic alliances",
              body: [
                "Partnerships that provide distribution leverage through embedded access, co-selling, or shared customer relationships. Not a reseller program, a structural business arrangement. Technology embedding, co-selling agreements, OEM / white-label arrangements, and referral agreements with professional service firms all qualify.",
                "**Margin:** Variable. **Speed:** 6–24 months. **Control:** Shared, depends on structure. **Common mistake:** Confusing a co-marketing arrangement with a strategic alliance. A real alliance creates mutual dependency that makes separation costly. If either side can walk away easily, it is not an alliance.",
              ],
            },
          ],
        },
      ],
    },
    {
      id: "sequencing",
      nav: "Sequencing",
      title: "*Sequence* channels before you scale them.",
      summary:
        "Most failures happen when founders jump from proving demand straight to scaling several channels, without a documented, repeatable motion in between.",
      blocks: [
        {
          kind: "quote",
          text: "Founders do not usually fail because they picked the wrong channel first. They fail because they scaled before they had a playbook.",
        },
        {
          kind: "steps",
          items: [
            {
              title: "Validation",
              text: "Prove demand exists, not reach. Sell direct, founder-led. Track conversion, reorder rate, CAC, LTV. Do not invest in channel programs yet. The signal: unsolicited inbound from buyers who found you organically.",
            },
            {
              title: "Repeatability",
              text: "Identify one channel that works and build a repeatable playbook. Formalize the sales process. Document the script, objection handling, and onboarding. Begin pilot partner conversations. The signal: deals closing through the same sequence without founder involvement.",
            },
            {
              title: "Expansion",
              text: "Add a second channel systematically without breaking the one that works. Hire a distribution or channel leader. Implement CRM and channel management infrastructure. The signal: inbound from distributors or retailers asking you to work with them.",
            },
            {
              title: "Scale",
              text: "Build distribution defensibility. Negotiate exclusivity or preferred placement. Develop tiered partner programs. Launch international distribution selectively. The moat is in the channel relationships, not just the product.",
            },
          ],
        },
      ],
    },
    {
      id: "gtm-motion",
      nav: "GTM motion",
      title: "Channel and sales motion are one decision.",
      summary:
        "Distribution strategy and sales motion are linked decisions. The motion sets how buyers meet the product, how deals close, and what the economics look like at scale.",
      blocks: [
        {
          kind: "accordion",
          items: [
            {
              title: "Product-led growth",
              body: [
                "The product drives acquisition, free trials, freemium, self-serve onboarding. Works best for software with low average contract values, natural virality, and end-user-initiated purchasing. Gross margins run 80–90%.",
                "**Best fit:** ACV under $10K, broad user applicability, low friction to try. **What founders misunderstand:** PLG still requires investment in onboarding, activation, and conversion. A free tier without a clear upgrade path is a cost center, not a growth engine. **When it breaks:** Complex products, regulated industries, buyers who do not self-serve.",
              ],
            },
            {
              title: "Sales-led growth",
              body: [
                "A human sales team drives acquisition through outbound, demos, and negotiated contracts. Required for enterprise software, complex hardware, regulated industries, and high average contract values. Gross margins run 65–80%.",
                "**Best fit:** ACV above $30K, complex buying processes, relationship-based selling. **What founders misunderstand:** Sales-led does not mean hiring a VP of Sales. Founders must close the first 10–20 deals personally to build the playbook. **When it breaks:** Low ACV, high-volume products, or markets where buyers expect self-serve.",
              ],
            },
            {
              title: "Hybrid motion",
              body: [
                "The highest-performing model for mid-market companies. Self-serve captures SMB and mid-market while a focused sales team handles enterprise expansion from existing product users. Land-and-expand compresses enterprise sales cycles and dramatically reduces acquisition cost.",
                "**Best fit:** Products with both self-serve and enterprise use cases. **What founders misunderstand:** Hybrid requires two different operational systems, self-serve infrastructure and a sales team, running simultaneously. It is not simpler. It is more powerful when done well, and more expensive when done poorly. **When it breaks:** When the company does not have the resources to invest in both motions properly.",
              ],
            },
          ],
        },
      ],
    },
    {
      id: "what-they-want",
      nav: "Investors & partners",
      title: "What investors and partners look for.",
      summary:
        "Investors want demand data and channel-level economics, retail buyers want velocity, partners want a profitable practice, and distributors want existing pull.",
      blocks: [
        {
          kind: "accordion",
          items: [
            {
              title: "What investors need to see",
              body: [
                "Quantitative evidence of demand, not projections, but actual data: reorder rates, organic inbound, signed LOIs. Channel-level unit economics, CAC, LTV, payback, and gross margin by channel, not blended. Retention as the primary signal, investors weight retention more heavily than acquisition. A clear path to profitability. And crucially: evidence that the founding team personally cracked at least one route to market with a documented playbook.",
              ],
            },
            {
              title: "What retail buyers need to see",
              body: [
                "Velocity data from existing channels, even DTC conversion rates or regional store sell-through. Marketing investment commitment, retailers want to know you will drive consumers to their shelf. Packaging compliance. Margins that work for both sides. And reorder history, evidence that consumers come back.",
              ],
            },
            {
              title: "What channel partners need to see",
              body: [
                "Whether a partner can build a profitable practice around your product. Model their P&L, not just yours. Sales enablement, training, collateral, certification, deal support. Enough addressable opportunity in their territory. And a reliable supply and product roadmap, partners burn their customer relationships recommending products, and they never recommend you again if you cannot deliver.",
              ],
            },
            {
              title: "What distributors need to see",
              body: [
                "Existing pull. Distributors are not marketing companies, they move products that already have demand. Show them sell-through data, not potential. Margin structure with enough room for distributor, retailer, and your own margin to coexist. Operational readiness, EDI capability, fill rates, compliance, minimum order quantities.",
              ],
            },
          ],
        },
      ],
    },
    {
      id: "hot-issues",
      nav: "Hot issues",
      title: "Five dynamics shaping distribution right now.",
      summary:
        "Amazon revenue is concentrating among established sellers, private label is squeezing shelf space, and supply chains are being restructured. In B2B, product-led growth is moving into enterprise and partner programs are table stakes.",
      blocks: [
        {
          kind: "accordion",
          items: [
            {
              title: "The Amazon trap",
              body: [
                "Revenue concentrates among established sellers. New registrations are at a decade low in some categories. Amazon remains a critical discovery channel, but a dangerous dependency. Brands that build exclusively through Amazon often find themselves unable to maintain margins or survive algorithm changes.",
              ],
            },
            {
              title: "AI and supply chain disruption",
              body: [
                "Geopolitical tensions, tariffs, and supply chain restructuring are forcing brands to diversify manufacturing and logistics. Retailers increasingly require supply chain transparency and domestic sourcing options as preconditions for listing.",
              ],
            },
            {
              title: "Slotting fee pressure",
              body: [
                "As retailers expand private-label products, shelf space for third-party brands is shrinking and slotting fees are increasing. Retailers that do not charge slotting fees are often more open to emerging brands with authentic velocity stories.",
              ],
            },
            {
              title: "PLG entering enterprise",
              body: [
                "Product-led growth is crossing into enterprise. Self-serve onboarding lands individual users inside large organizations, then converts into company-wide contracts through land-and-expand. This compresses enterprise sales cycles and reduces acquisition cost.",
              ],
            },
            {
              title: "Channel programs as table stakes",
              body: [
                "For B2B technology, a structured channel partner program is no longer optional. Enterprise buyers increasingly purchase through known intermediaries. Companies without partner programs are invisible in large portions of the market.",
              ],
            },
          ],
        },
      ],
    },
    {
      id: "common-mistakes",
      nav: "Common mistakes",
      title: "Eight distribution mistakes founders keep making.",
      summary: "The patterns that cost founders the most. Almost every one of them is avoidable.",
      blocks: [
        {
          kind: "accordion",
          numbered: true,
          items: [
            {
              title: "Treating GTM as a marketing function",
              body: [
                "Go-to-market is not a campaign. It is a company strategy that spans product, sales, marketing, and distribution. Delegating it to a marketing hire before establishing a repeatable motion scales confusion.",
              ],
            },
            {
              title: "Targeting everyone",
              body: [
                "Broad targeting produces messaging that resonates with no one. Narrow your ICP until it feels uncomfortably specific. Win that segment first, then expand.",
              ],
            },
            {
              title: "Scaling channels before proving one",
              body: [
                "Hiring a sales team or committing to a national launch before a repeatable acquisition model exists accelerates burn, not revenue. Most premature scaling starts here.",
              ],
            },
            {
              title: "Single-channel dependency",
              body: [
                "Relying on one channel, Amazon, one enterprise customer, one retail banner, creates existential risk. Algorithm changes, buyer turnover, or a contract termination can destroy revenue overnight.",
              ],
            },
            {
              title: "Ignoring channel-level economics",
              body: [
                "Different channels produce wildly different unit economics. Without channel-level CAC, LTV, and margin modeled in advance, founders consistently undercapitalize the channels that look most attractive.",
              ],
            },
            {
              title: "Copying later-stage competitors",
              body: [
                "A Series D company's partner programs and retail relationships were built over years. You do not have their brand, infrastructure, or runway. Validate your own motion.",
              ],
            },
            {
              title: "Engaging buyers too late",
              body: [
                "Major retail buyers have category planning cycles 12–18 months out. Enterprise buyers short-list vendors they already know. Starting conversations when you need revenue means you are already too late.",
              ],
            },
            {
              title: "Assuming partners will figure it out",
              body: [
                "Signing a distributor or channel partner is not the end of the work. It is the beginning. Active enablement, joint business planning, and performance accountability are required, not optional.",
              ],
            },
          ],
        },
      ],
    },
  ],
  midCta: {
    after: "channel-types",
    title: "Can your distribution economics survive contact with reality?",
    body: "execom helps founders model channel economics, structure partner agreements, and sequence distribution before scale makes mistakes expensive.",
    primary: { label: "Assess distribution strategy", href: "/engage" },
    secondary: { label: "Talk with execom", href: "/engage" },
  },
  faq: [
    {
      q: "Should I use a distributor or go direct?",
      a: [
        "Going direct produces higher margins and better data but requires operational capability. A distributor reduces complexity at the cost of margin and visibility. Start direct with regional accounts to build data and capability, then evaluate distributors for national scale.",
      ],
    },
    {
      q: "How do I get a meeting with a retail buyer?",
      a: [
        "Trade shows are the highest-density environment for buyer meetings. Brokers with standing buyer relationships are the second path. A warm introduction from a brand the buyer already respects is worth more than any pitch deck. Cold outreach to retail buyers almost never works.",
      ],
    },
    {
      q: "When am I ready for enterprise sales?",
      a: [
        "When you have documented case studies with quantified outcomes, can explain your security posture and integration architecture, have a repeatable demo that converts, and have priced appropriately for the value delivered. Enterprise buyers are suspicious of prices that seem too cheap.",
      ],
    },
    {
      q: "Is Amazon worth it?",
      a: [
        "Amazon is a discovery engine, not a brand-building engine. It is worth it if your category has active Amazon search behavior, you can maintain margins after fees, and you have a strategy to convert marketplace buyers into direct customers. It is not worth it if your product requires explanation, storytelling, or relationship-based selling. Never make it your sole channel.",
      ],
    },
    {
      q: "How do I protect my brand across channels?",
      a: [
        "Implement minimum advertised price policy before entering retail. Vary SKU mix by channel with exclusive configurations for direct. Build brand equity through content and community so consumers seek you out specifically, reducing dependence on retailer presentation.",
      ],
    },
    {
      q: "How do I keep distributors from deprioritizing me?",
      a: [
        "Distributors prioritize products that sell fastest and require least effort. Your job is to generate consumer pull that makes your product easy for their sales reps to lead with. Build direct relationships with the reps, not just the executive team, and make it financially worthwhile for them through incentives and co-selling support.",
      ],
    },
    {
      q: "When should I hire a VP of Sales or Head of Distribution?",
      a: [
        "After you have closed 10–20 deals and documented a repeatable process. Hire someone to run the playbook, not to discover it. The number one reason VP of Sales hires fail at early-stage companies is that founders hand over a broken or unproven motion and expect the new hire to fix it while hitting targets.",
      ],
    },
    {
      q: "How many channels should we run at once?",
      a: [
        "At early stage, one. Prove it works, document the playbook, then add a second with dedicated resources. Running three or more channels before any of them is repeatable spreads resources too thin and prevents the company from learning what actually works. A healthy mature distribution mix involves at least two independent channels each generating meaningful revenue.",
      ],
    },
  ],
  closing: {
    title: "Make distribution *the plan*.",
    body: "The wrong route to market wastes time, capital, and momentum. execom helps founders pressure-test channels, economics, sequencing, and partner strategy before scale makes mistakes expensive.",
    primary: { label: "Assess distribution strategy", href: "/engage" },
    secondary: { label: "Explore market entry", href: "/market-entry" },
  },
}
