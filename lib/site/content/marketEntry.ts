import type { AdvisoryPageData } from "@/components/site/advisory/types"

export const marketEntry: AdvisoryPageData = {
  href: "/market-entry",
  crumb: "Market entry",
  hero: {
    eyebrow: "Market entry",
    title: "Entering a new market is *harder* than most founders think.",
    lede: "execom helps companies enter Canada and the United States with sharper sequencing, better channel strategy, and fewer expensive mistakes.",
    primary: { label: "Assess market readiness", href: "/engage" },
    secondary: { label: "Explore distribution access", href: "/distribution-access" },
    takeaways: [
      "When entries fail, the cause is usually the **route into the market**: wrong model, too fast, underfunded.",
      "Canada can be a proving ground. For most venture-scale companies, the US is the only viable primary market.",
      "Budget **18 months at zero new-market revenue**. Most founders underestimate expansion cost by two to three times.",
    ],
  },
  chapters: [
    {
      id: "overview",
      nav: "Overview",
      title: "Market entry is a *sequencing* problem.",
      summary:
        "Legal structure, channels, capital, localization, and market psychology all have to line up. The right entry model turns on control, regulation, and how long you can fund the gap before revenue.",
      blocks: [
        {
          kind: "points",
          items: [
            {
              label: "Timing",
              text: "Entering too early burns capital. Entering too late cedes the market. The window is narrower than founders think, and the sequencing matters more than the speed.",
            },
            {
              label: "Control",
              text: "Partnerships compress time to revenue but reduce control. Subsidiaries give full control but require real budget and a multi-year commitment. The tradeoff is structural.",
            },
            {
              label: "Channel",
              text: "Distribution in North America is concentrated and relationship-driven. A signed agreement is not distribution. An activated partner with aligned incentives is.",
            },
            {
              label: "Runway",
              text: "Most founders underestimate expansion cost by two to three times. If the capital cannot sustain 18 months of operations without new-market revenue, the company is not ready.",
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
                "Market entry is not just a sales problem. It is a sequencing problem involving legal structure, channel strategy, capital allocation, localization, and market psychology. Companies that enter too hard, too fast, or with the wrong structure do not fail because the product was wrong. They fail because the route into the market was weak.",
                "The right entry model depends on how much control the company needs, how much capital is available, how complex the regulatory environment is, and whether the company is prepared to sustain the investment through the inevitable period when costs are high and revenue has not yet arrived.",
              ],
            },
          ],
        },
      ],
    },
    {
      id: "founder-concerns",
      nav: "Founder concerns",
      title: "What founders actually worry about.",
      summary:
        "These are the questions that matter before committing capital. The answers depend on product, stage, market, and commercial model.",
      blocks: [
        {
          kind: "list",
          items: [
            "Do we need a local entity before we start selling?",
            "Should we enter Canada or the US first?",
            "How much runway do we really need?",
            "How do we find channel partners that actually move product?",
            "What can we test before committing to a subsidiary?",
            "How different are buyers in this market, really?",
          ],
        },
      ],
    },
    {
      id: "real-barriers",
      nav: "Real barriers",
      title: "The barriers founders do not prepare for.",
      summary:
        "They are structural, relationship-driven, and capital-intensive: regulation, distribution access, buyer differences, partners, and runway.",
      blocks: [
        {
          kind: "quote",
          text: "Most market entries do not die because the product is impossible. They die because the route into the market was weak.",
        },
        {
          kind: "accordion",
          items: [
            {
              title: "Regulatory and compliance friction",
              body: [
                "North America presents a layered regulatory environment. In Canada, federal rules coexist with ten provincial regimes, each with varying requirements for employment, data handling, consumer protection, and licensing. In the US, the complexity multiplies across 50 states plus federal jurisdiction.",
                "Data privacy alone is a minefield: Canada's PIPEDA and Quebec's Law 25 on one side, and a patchwork of state-level frameworks in the US on the other. The critical error most companies make is treating regulatory compliance as a post-entry task. It must be scoped before the first commercial transaction.",
              ],
            },
            {
              title: "Distribution access",
              body: [
                "Distribution in North America is among the most relationship-driven and channel-concentrated in the world. In retail, access to major chains requires broker relationships and annual category review cycles. In enterprise software, hyperscaler marketplaces have become de facto gatekeepers. In professional services, panel membership and RFP eligibility are mediated through networks built over years. A company without existing channel relationships starts with a structural disadvantage that takes time and capital to overcome.",
              ],
            },
            {
              title: "Buyer and cultural differences",
              body: [
                "US buyers move quickly, reward directness, and expect clear ROI-oriented pitches backed by social proof. Canadian buyers are more relationship-oriented, consensus-driven, and risk-averse, multiple stakeholders are involved earlier in the cycle, and the absence of local references creates meaningful friction.",
                "The gap between how international founders pitch and what North American buyers expect to hear is one of the most underestimated factors in expansion planning.",
              ],
            },
            {
              title: "Partnership development",
              body: [
                "Finding partners willing to sign an agreement is easy. Finding partners who will actively sell is hard. The most documented failure mode in market entry is the distributor commitment problem: a company recruits a credible-looking partner, signs a formal agreement, then discovers 12–18 months later that the partner allocated minimal resources and managed the relationship to preserve optionality rather than drive volume. Active partner selection, performance covenants, joint business planning, and co-selling investment are required, not optional.",
              ],
            },
            {
              title: "Capital intensity and runway",
              body: [
                "The most consistent financial miscalculation in international expansion is underestimating total cost by two to three times. A realistic cost model for entering either Canada or the US includes entity formation, local leadership hire, office presence, demand generation, compliance, travel, and a working capital buffer covering months where costs are high and revenue has not yet arrived.",
                "Companies that do not budget for the valley of death, typically months 6–18 post-entry, frequently exit prematurely, having proven the concept but run out of capital before capturing the returns.",
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
        "Canada is both an opportunity and a structural constraint. For many venture-oriented companies, the market alone is too small, too fragmented, and too slow to support the outcome they want.",
      blocks: [
        {
          kind: "quote",
          text: "Canada is not a bad market. It is a market founders misread constantly.",
        },
        {
          kind: "accordion",
          items: [
            {
              title: "Canada is easier to enter, but smaller than founders think",
              body: [
                "Lower competition and somewhat lower setup friction in some sectors make Canada a softer landing. Government procurement is more accessible to new entrants. Non-dilutive programs like SR&ED provide meaningful capital offsets. But the market ceiling is materially lower, 38 million people, a smaller enterprise base, and a GDP roughly one-tenth of the United States. Founders who treat Canada as a primary market when their venture economics require US-scale revenue are building on a structural mismatch.",
              ],
            },
            {
              title: "Provincial fragmentation is real",
              body: [
                "Canada is not one uniform market. Ontario, Quebec, Alberta, and British Columbia differ materially in regulation, buyer behavior, language, industry composition, and professional networks. Quebec operates under a distinct civil law tradition, requires French in all commercial activity, and has a meaningfully different startup and enterprise ecosystem. Alberta's energy-driven economy creates different buyer priorities. A market entry plan that treats Canada as a single entity will misallocate resources.",
              ],
            },
            {
              title: "Enterprise adoption is often slower",
              body: [
                "Canadian buyers are more relationship-oriented, consensus-driven, and risk-averse than US counterparts. Multiple stakeholders are involved earlier in the purchasing cycle. International references without Canadian customers create friction. The deal cycle typically runs longer than founders expect, which stretches timelines and makes early traction harder to demonstrate.",
              ],
            },
            {
              title: "Canada is often a stepping stone, not the whole game",
              body: [
                "For many ambitious companies, Canada works as a beachhead or proving ground, a place to validate the product, build reference customers, and develop local expertise before entering the US. That is a legitimate strategy. The mistake is treating Canada as the destination when the venture economics actually require US-scale growth.",
              ],
            },
            {
              title: "Why execom exists",
              body: [
                "execom helps founders decide whether Canada should be the first market, a test market, a support market, or bypassed in favor of a US-first strategy. The answer depends on product, stage, capital, and commercial model, not on convenience or proximity.",
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
                "Canada can be an attractive first market in some cases, but founders routinely misunderstand its scale and structural limits. It is easier to enter than the United States in some respects, but it is not a substitute for broader market strategy. For many venture-oriented companies, Canada alone is too small, too regionally fragmented, and too slow-moving to support the outcome they actually want.",
              ],
            },
          ],
        },
      ],
    },
    {
      id: "entry-models",
      nav: "Entry models",
      title: "Five entry models, from cross-border to subsidiary.",
      summary:
        "Each one trades control for speed, or capital for reach. The right choice depends on where the company is, what it sells, and how much commitment it can sustain.",
      blocks: [
        {
          kind: "accordion",
          items: [
            {
              title: "Cross-border selling first",
              body: [
                "Selling across the border without a local entity, using existing infrastructure, digital distribution, or a lightweight sales motion. Works primarily for SaaS and digital products with low friction to purchase.",
                "**When it makes sense:** Early validation, digital products, small contract values. **Control:** Low. **Capital burden:** Very low. **Common mistake:** Assuming it scales. Enterprise buyers expect a local entity, local support, and local compliance.",
              ],
            },
            {
              title: "Local partnerships and channel alliances",
              body: [
                "A well-structured channel alliance with a credible local partner can compress time to first revenue from 18+ months to 6–9 months by leveraging the partner's existing customer trust, regulatory standing, and distribution network.",
                "**When it makes sense:** B2B tech, regulated industries, limited capital. **Control:** Medium. **Capital burden:** Low to medium. **Common mistake:** Confusing a signed agreement with an activated partner. The agreement is the beginning of the work, not the end of it.",
              ],
            },
            {
              title: "Licensing",
              body: [
                "Licensing technology, brand, or methodology to a local company that handles all commercial activity. The licensor receives a royalty stream without bearing the cost of local operations.",
                "**When it makes sense:** IP-rich products, regulated markets, companies seeking capital efficiency. **Control:** Low to medium. **Capital burden:** Low. **Common mistake:** Granting broad rights without performance covenants or adequate IP protection.",
              ],
            },
            {
              title: "Distribution agreements",
              body: [
                "Formal agreements where a local distributor purchases product at wholesale and resells. Transfers logistics, warehousing, and customer management to the distributor.",
                "**When it makes sense:** Physical products, hardware, consumer goods. **Control:** Medium. **Capital burden:** Low to medium. **Common mistake:** Granting exclusivity without performance minimums. A signed distributor is not distribution, it is a bet on someone else's commitment.",
              ],
            },
            {
              title: "Local subsidiary / direct presence",
              body: [
                "Establishing a wholly owned local entity provides maximum control over commercial activity, hiring, pricing, and brand positioning. It is also the structure that most enterprise buyers, investors, and government procurement expect.",
                "**When it makes sense:** Enterprise sales, long-term commitment, regulated technology. **Control:** Full. **Capital burden:** High, first-year costs typically range from $300K to $1.5M+. **Common mistake:** Treating it as a three-month experiment. A subsidiary requires a minimum three-year commitment.",
              ],
            },
          ],
        },
      ],
    },
    {
      id: "canada-vs-us",
      nav: "Canada vs US",
      title: "Two adjacent markets. Very different realities.",
      summary:
        "Canada can be a lower-cost proving ground. For venture-backed scale, the US may be the only market that fits.",
      blocks: [
        {
          kind: "matrix",
          columns: [{ label: "Canada" }, { label: "United States" }],
          rows: [
            {
              label: "Market size",
              values: [
                "38M people, $2.2T GDP, meaningful but limited ceiling",
                "335M people, $28T GDP, largest single-country opportunity for most categories",
              ],
            },
            {
              label: "Competition",
              values: [
                "Lower in most sectors, fewer incumbents, less saturated",
                "Intense, deep incumbent presence, sophisticated buyers, crowded categories",
              ],
            },
            {
              label: "Cost to enter",
              values: [
                "Moderate, lower setup costs, non-dilutive programs available",
                "High, legal, talent, compliance, and market-building costs are substantial",
              ],
            },
            {
              label: "Regulatory",
              values: [
                "Federal + 10 provinces, manageable but fragmented, Quebec adds complexity",
                "Federal + 50 states, deeply fragmented, state-level variation is extreme",
              ],
            },
            {
              label: "Sales velocity",
              values: [
                "Slower, consensus-driven, risk-averse, relationship-oriented buyers",
                "Faster, outcome-driven, ROI-focused, but cycles still run 6–18 months for enterprise",
              ],
            },
            {
              label: "Channel dynamics",
              values: [
                "Concentrated, fewer channel partners, government procurement is accessible",
                "Concentrated and competitive, hyperscaler marketplaces are increasingly required",
              ],
            },
            {
              label: "Capital required",
              values: [
                "Lower, can test with lighter infrastructure, SR&ED offsets costs",
                "Significant, minimum 18 months of funded runway, serious local hire required",
              ],
            },
            {
              label: "Best fit for",
              values: [
                "Beachhead, validation, government, SR&ED-eligible companies",
                "Scale, enterprise, venture-backed growth, long-term market commitment",
              ],
            },
          ],
        },
        {
          kind: "detail",
          label: "How to choose between them",
          blocks: [
            {
              kind: "prose",
              paras: [
                "Canada may be the right first market for companies that need a lower-cost proving ground, have government or regulated-sector fit, or want to validate before committing US-level capital.",
                "The US may be the only market that fits the intended scale for venture-backed companies, enterprise SaaS, or products that require deep market density to succeed.",
                "The correct answer depends on product, stage, runway, and commercial model, not on proximity or convenience.",
              ],
            },
          ],
        },
      ],
    },
    {
      id: "decision-frameworks",
      nav: "Decision frameworks",
      title: "Decide with discipline rather than narrative.",
      summary:
        "A readiness checklist, an entry mode comparison, a PESTEL scan, and a 90-day sequence. A “no” on any of the first four readiness items is typically a hard blocker.",
      blocks: [
        {
          kind: "matrix",
          columns: [{ label: "Control" }, { label: "Capital" }, { label: "Speed" }],
          rows: [
            { label: "Cross-border", values: ["Low", "Very low", "Fast"] },
            { label: "Licensing", values: ["Low to medium", "Low", "Medium"] },
            { label: "Distribution", values: ["Medium", "Low to medium", "Medium"] },
            { label: "Channel partner", values: ["Medium", "Low to medium", "Medium to fast"] },
            { label: "Subsidiary", values: ["Full", "High", "Slow then full"] },
          ],
          note: "**Entry mode selection.** The right entry mode is a function of control requirements, capital availability, speed to revenue, and risk tolerance.",
        },
        {
          kind: "accordion",
          items: [
            {
              title: "Market readiness checklist",
              body: [
                "Before committing capital, founders should be able to answer affirmatively to all seven:",
                "**01** Product validated with discovery interviews in the specific target geography",
                "**02** Dedicated, ringfenced 18-month budget at zero new-market revenue",
                "**03** Local market leader identified, with existing relationships in the target segment",
                "**04** Legal counsel has completed compliance intake: employment, data, tax, licensing",
                "**05** Competitive differentiation articulated against local incumbents",
                "**06** Channel hypothesis defined with primary and backup strategy",
                "**07** Leadership committed to a minimum 3-year market development horizon",
                "A “no” on any of the first four is typically a hard blocker.",
              ],
            },
            {
              title: "PESTEL / external environment",
              body: [
                "A practical PESTEL analysis for North American entry should cover:",
                "**Political:** Trade policy under CUSMA/USMCA, Buy American / Buy Canadian procurement preferences, CFIUS implications for foreign investment, current bilateral trade dynamics",
                "**Economic:** FX exposure, interest rate effects on spending, venture availability, wage benchmarks by city",
                "**Social:** Regional identity differences, DEI expectations in procurement, multicultural demographics affecting positioning",
                "**Technological:** Cloud-first expectations, SOC 2 as table stakes, AI adoption curves, marketplace procurement norms",
                "**Environmental:** Carbon pricing, ESG reporting in procurement, California's environmental regulations",
                "**Legal:** Data privacy patchwork, employment law variation, IP protection, sector-specific licensing",
              ],
            },
            {
              title: "90-day entry sequencing",
              body: [
                "**Days 1–30: Intelligence & infrastructure.** Customer discovery interviews in the target market. Competitive landscape mapping. Regulatory compliance intake with local counsel. Entity formation initiation. Banking and payroll setup. Beachhead geography selection. Local hire search initiated.",
                "**Days 31–60: Pilot validation.** First pilot customers or signed LOIs. Pricing model validation against market norms. Channel partner shortlist and initial conversations. Brand and messaging adaptation. Product localization review. First local hire onboarded.",
                "**Days 61–90: Commercial launch.** First paid contracts executed. Distribution or channel agreement signed. PR and ecosystem activation. Board update with market entry proof points. Month 4–12 scale plan with specific KPIs and capital allocation.",
              ],
            },
          ],
        },
      ],
    },
    {
      id: "common-mistakes",
      nav: "Common mistakes",
      title: "Eight mistakes, almost all of them avoidable.",
      summary:
        "The patterns that cost founders the most in market entry, from localization and pricing to budget and legal review.",
      blocks: [
        {
          kind: "accordion",
          numbered: true,
          items: [
            {
              title: "Assuming no localization is needed",
              body: [
                "Localization is not translation. It includes pricing models, compliance design, messaging emphasis, and the value proposition framing that resonates locally.",
              ],
            },
            {
              title: "Managing the market remotely",
              body: [
                "Remote management from headquarters is among the highest-probability failure configurations. Decision latency, cultural misreading, and relationship poverty compound quickly.",
              ],
            },
            {
              title: "Underestimating sales-cycle length",
              body: [
                "Enterprise cycles run 6–18 months. Government can take longer. Companies that model 60–90 day cycles based on home-market experience routinely exhaust runway before deals close.",
              ],
            },
            {
              title: "Confusing a signed distributor with real distribution",
              body: [
                "A signed agreement is psychological security, not market access. Distributors must be actively led, enabled, and held to performance covenants, or they will do nothing.",
              ],
            },
            {
              title: "Ignoring province/state-level variation",
              body: [
                "Canada is not one market. The US is fifty. Quebec and California each have regulatory environments that bear little resemblance to their neighbors.",
              ],
            },
            {
              title: "Copying home-market pricing directly",
              body: [
                "Pricing norms, billing cycles, and contract structures vary. What works in Europe or Asia may not survive contact with North American buyer expectations.",
              ],
            },
            {
              title: "No dedicated expansion budget",
              body: [
                "Funding market entry from general operating cash creates constant competition for resources. A ringfenced budget with an 18-month horizon is the minimum viable commitment.",
              ],
            },
            {
              title: "Skipping local legal review",
              body: [
                "Employment law, data privacy, tax nexus, and sector-specific licensing vary dramatically. Every commercial transaction before compliance is scoped is a liability.",
              ],
            },
          ],
        },
      ],
    },
  ],
  midCta: {
    after: "canada-vs-us",
    title: "Canada first, US first, or both?",
    body: "The sequencing decision is one of the highest-leverage choices a founder makes. execom helps founders get it right.",
    primary: { label: "Assess market readiness", href: "/engage" },
    secondary: { label: "Talk with execom", href: "/engage" },
  },
  faq: [
    {
      q: "Do we need a local entity before we start selling?",
      a: [
        "Not always. Cross-border selling and partnerships can work for early validation. But enterprise buyers, government procurement, and most investors expect a local entity. If the company is serious about the market, entity formation is not optional, it is a question of timing.",
      ],
    },
    {
      q: "Should we enter Canada or the US first?",
      a: [
        "It depends on product, stage, and capital. Canada is lower-cost, less competitive, and more accessible for government business. The US is the larger opportunity and the only viable primary market for most venture-scale companies. Some companies should use Canada as a proving ground. Others should go directly to the US. The wrong answer is both at once with insufficient resources.",
      ],
    },
    {
      q: "What is the safest way to test a market?",
      a: [
        "Customer discovery interviews, product-led growth, marketplace listings, or a structured channel partnership. All of these allow the company to validate demand before committing to local infrastructure. The test should answer a specific commercial question, not just generate activity.",
      ],
    },
    {
      q: "How much runway should we assume?",
      a: [
        "Eighteen months of funded operations at zero new-market revenue. That is the minimum. B2B enterprise sales cycles, partner activation timelines, and regulatory setup mean that revenue rarely arrives in the first year. Companies that budget for twelve months are almost always underfunded.",
      ],
    },
    {
      q: "Are distributors worth it?",
      a: [
        "They can be, but only with rigorous selection, performance covenants, joint business planning, and active co-selling investment. A passive distributor agreement without accountability is the single most-documented failure mode in international market entry.",
      ],
    },
    {
      q: "When should we open a subsidiary?",
      a: [
        "When the market has been validated, the company has reference customers or strong pipeline, and the leadership is committed to a minimum three-year horizon. Opening a subsidiary as the first move, before product-market fit is confirmed locally, is the most capital-intensive way to learn what a lighter approach could have revealed for a fraction of the cost.",
      ],
    },
    {
      q: "What do founders usually underestimate most?",
      a: [
        "Three things: the total cost of market establishment, the length of enterprise sales cycles, and the time required to activate channel partners. Each one is typically underestimated by a factor of two. Together, they account for most premature exits from otherwise viable markets.",
      ],
    },
    {
      q: "How do we know if we are actually ready?",
      a: [
        "If the company can answer yes to the market readiness checklist, validated product interest, ringfenced budget, local leadership, regulatory intake, clear competitive position, defined channel strategy, and genuine multi-year commitment, it is ready. If any of the first four are missing, it is not.",
      ],
    },
  ],
  closing: {
    title: "Do not enter a market on *narrative alone*.",
    body: "A new market can multiply the business, or quietly drain time and capital for eighteen months. execom helps founders pressure-test the route before they commit.",
    primary: { label: "Assess market readiness", href: "/engage" },
    secondary: { label: "Explore distribution access", href: "/distribution-access" },
  },
}
