import type { AdvisoryPageData } from "@/components/site/advisory/types"

export const vcAngel: AdvisoryPageData = {
  href: "/vc-angel-capital",
  crumb: "VC / angel capital",
  hero: {
    eyebrow: "VC / angel capital",
    title: "Not every founder should raise *venture capital*.",
    lede: "execom helps founders evaluate venture capital and angel financing before dilution, control loss, and bad capital decisions become irreversible.",
    primary: { label: "Assess capital strategy", href: "/engage" },
    secondary: { label: "Start with non-dilutive capital", href: "/non-dilutive-capital" },
    takeaways: [
      "Raise only if the business **needs outside capital** and can deliver the returns venture funds require.",
      "A raise takes five to ten months. On 18 months of runway, assume roughly half is spent raising.",
      "Stacked SAFEs and term sheet clauses decide what founders keep. Model both before you sign.",
    ],
  },
  chapters: [
    {
      id: "overview",
      nav: "Overview",
      title: "One financing tool among several.",
      summary:
        "A viable company is not automatically a viable venture outcome. Before raising, know what you give up, what you must deliver, and whether VC fits your trajectory.",
      blocks: [
        {
          kind: "points",
          items: [
            {
              label: "Speed",
              text: "Venture capital accelerates growth, but it also accelerates the timeline within which you must deliver returns. Speed is a commitment, not a gift.",
            },
            {
              label: "Dilution",
              text: "Every round reduces founder ownership. Early-stage equity is the most expensive capital you will ever issue. The math compounds quietly.",
            },
            {
              label: "Control",
              text: "Board seats, protective provisions, and veto rights are contractual. Once signed, they do not get renegotiated without leverage you may not have.",
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
                "Venture capital is one financing tool among several. It is not the default path, and it is not a signal of legitimacy. A viable company is not automatically a viable venture outcome, and the difference between those two things is where most capital strategy mistakes begin.",
                "Founders should understand the math before they raise: what they will give up, what they will be expected to deliver, and whether the structure of venture capital actually fits the trajectory of their business.",
              ],
            },
          ],
        },
      ],
    },
    {
      id: "market-now",
      nav: "The market now",
      title: "The venture market has changed structurally.",
      summary:
        "Headline numbers obscure what most founders face: capital concentrating in AI, longer raises, more down rounds, and fewer companies funded.",
      blocks: [
        {
          kind: "accordion",
          items: [
            {
              title: "The funding environment changed",
              body: [
                "The comfortable 18-month fundraising cadence of 2019–2021 is gone. Capital is concentrating into fewer companies, and the majority of venture dollars now flow into AI-centric firms. For founders outside that lane, the competitive landscape for funding looks nothing like the headlines suggest. Deal counts have dropped even as total dollar volume rose, meaning more capital flows into fewer companies at larger check sizes.",
              ],
            },
            {
              title: "AI gets the headlines, not everyone gets the capital",
              body: [
                "The majority of global venture investment is now concentrated in AI-centric companies. Non-AI founders are competing for the remainder in a materially more selective environment. This is not speculation, it is the structural reality of how capital is being deployed. If your company is not AI-native, your fundraising playbook needs to reflect a different market.",
              ],
            },
            {
              title: "Fundraising takes longer now",
              body: [
                "The median time between rounds has stretched significantly. Seed to Series A now takes over two years on average. The full fundraising process, from first outreach to close, realistically takes five to ten months. Founders must plan accordingly: if you have 18 months of runway, you actually have roughly nine months to build traction before you need to restart the raise.",
              ],
            },
            {
              title: "Down rounds are no longer rare",
              body: [
                "Down rounds now represent a meaningful percentage of deals at every stage, and the frequency increases significantly at later stages. Founders who raised at peak valuations face a reckoning. Software revenue multiples have compressed substantially from their 2021 levels, and fintech companies are seeing even steeper corrections. The valuation environment has reset.",
              ],
            },
            {
              title: "Fewer companies are getting funded",
              body: [
                "Only a very small percentage of startups ever close venture capital funding. Among those that raise seed rounds, a minority achieve a Series A within two years. The funnel is narrower than most founders realize, and planning a business that depends on the next round closing is a structural risk that should be modeled, not assumed away.",
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
        "Capital is scarcer, checks are smaller, adoption is slower, and growth rounds often come from outside the country. Canadian founders need better strategy earlier.",
      blocks: [
        {
          kind: "quote",
          text: "Canadian founders do not fail because they are weaker. They fail because the system gives them less room for error.",
        },
        {
          kind: "accordion",
          items: [
            {
              title: "Smaller pools of capital",
              body: [
                "Canadian founders compete in a shallower capital pool with fewer active firms, smaller checks, fewer competing term sheets, and more concentration. The majority of domestic venture capital is captured by a small number of large funds, leaving less available for new investments. The result is less leverage for founders and a slower, more constrained process.",
              ],
            },
            {
              title: "Slower, more conservative investor behavior",
              body: [
                "The traction trap is real: Canadian founders are expected to show more proof before investment, but they often need capital to create that proof. Decision cycles are slower, risk tolerance is lower, and the bar for conviction is higher than what most founders encounter in comparable US ecosystems. Angels typically write smaller checks with stricter terms.",
              ],
            },
            {
              title: "The small domestic market problem",
              body: [
                "Canada's domestic market is not large enough for many venture outcomes on its own. Enterprise technology adoption is slower, and the addressable customer base for B2B startups is significantly smaller than the US equivalent. Many founders must think cross-border much earlier than they expect, which changes go-to-market strategy, pricing, and team composition.",
              ],
            },
            {
              title: "Growth capital usually comes from elsewhere",
              body: [
                "As companies mature, the domestic capital gap grows acute. Larger rounds increasingly require US participation, which changes the game: longer fundraising cycles, different governance expectations, and often relocation pressure. A significant share of venture capital deployed in Canada now originates from US-based investors, creating dependency on foreign capital with its own set of terms and timelines.",
              ],
            },
            {
              title: "Why execom exists",
              body: [
                "execom exists to help founders overcome these structural constraints through better capital strategy, non-dilutive funding guidance, market entry planning, and sharper commercial positioning. The Canadian ecosystem does not need more cheerleading. It needs better tools, clearer information, and advisory that treats founders as capable adults navigating a difficult system.",
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
                "Canada produces exceptional founders, but the environment is materially more constrained than the United States. Capital is scarcer, check sizes are smaller, enterprise adoption is slower, and growth-stage funding often comes from outside the country. This does not make success impossible. It means founders need better strategy earlier.",
              ],
            },
          ],
        },
      ],
    },
    {
      id: "raise-or-not",
      nav: "Raise or not",
      title: "Raising is a question of math, timing, and fit.",
      summary:
        "One diagnostic question: does the business need outside capital, and can it deliver the expected return? If you cannot answer yet, you are not ready to raise or to bootstrap.",
      blocks: [
        {
          kind: "accordion",
          items: [
            {
              title: "Bootstrap vs raise",
              body: [
                "The core diagnostic question: does your venture both need outside capital and have the capacity to deliver the expected return? If yes, raise. If no, bootstrap. If you do not know, you are not ready for either.",
                "Bootstrap signals include a path to profitability within 6–12 months, strong gross margins, sustainable unit economics, and markets that value reliability over speed. Venture signals include winner-take-all dynamics, network effects that require speed to capture, and capital-intensive product development.",
              ],
            },
            {
              title: "When venture capital actually makes sense",
              body: [
                "VC makes sense when the opportunity is large enough, time-sensitive enough, and capital-intensive enough that external funding creates a structural advantage. Winner-take-all markets, network effects, and genuine capital-intensity are the clearest signals. If the business can reach profitability without dilution, the burden of proof falls on raising, not on bootstrapping.",
              ],
            },
            {
              title: "When it is a mistake",
              body: [
                "VC is a mistake when founders raise because it feels like progress rather than because the business requires it. Companies that can reach profitability within 12–18 months, serve markets that do not reward blitzscaling, or target exit outcomes below what fund math requires are structurally mismatched with venture capital. The wrong capital at the wrong valuation creates compounding problems that are expensive to unwind.",
              ],
            },
            {
              title: "The hybrid path",
              body: [
                "The hybrid path, bootstrapping to traction, then raising from strength, delivers compounding advantages: higher valuations, less dilution, and proof of execution that dramatically lowers investor risk. A founder raising a seed round with meaningful revenue can command significantly better terms than one raising on a pitch deck alone. Use traction before fundraising to improve terms and preserve ownership.",
              ],
            },
          ],
        },
      ],
    },
    {
      id: "angels-vs-vc",
      nav: "Angels vs VC",
      title: "Angels close in weeks. VCs bring governance.",
      summary:
        "Neither is inherently superior. The right choice depends on stage, governance tolerance, and whether later rounds will need institutional backing.",
      blocks: [
        {
          kind: "accordion",
          items: [
            {
              title: "What angels are good for",
              body: [
                "Angels close faster, typically in weeks rather than months. They take minority stakes with flexible involvement. Return expectations are lower, targeting three to ten times return rather than the ten to fifteen times required by institutional funds. This math means a moderate exit can be a success for an angel but a failure in VC terms. Angels are best suited for early conviction capital, speed, and relationships.",
              ],
            },
            {
              title: "What institutional VC changes",
              body: [
                "Institutional VC introduces structured governance: board seats, approval requirements on strategic pivots, senior hires, and future raises. The fund model drives behavior, every investment must be evaluated against portfolio return expectations. This creates alignment when the business is on a venture trajectory, and tension when it is not.",
              ],
            },
            {
              title: "Speed vs governance",
              body: [
                "Angel rounds close in weeks. Institutional pre-seed and seed rounds take months. The difference is not just time, it reflects the depth of diligence, the number of approvals required, and the governance framework that comes attached to the capital. Founders should choose based on what their company needs, not what feels most flattering.",
              ],
            },
            {
              title: "Follow-on capacity",
              body: [
                "Most angels cannot lead future rounds or provide the institutional credibility that later-stage investors look for when evaluating a company. VCs can. If your capital strategy depends on signaling strength for future rounds, the source of your early capital matters beyond the dollar amount.",
              ],
            },
          ],
        },
      ],
    },
    {
      id: "safe-vs-priced",
      nav: "SAFE vs priced",
      title: "SAFEs close fast. *Dilution* comes later.",
      summary:
        "One SAFE is a tool. Several with different caps are a deferred problem, and priced rounds trade higher upfront cost for a clean cap table.",
      blocks: [
        {
          kind: "accordion",
          items: [
            {
              title: "Why founders like SAFEs",
              body: [
                "SAFEs close in days rather than weeks. Legal costs are a fraction of a priced round. There are no board seats, minimal investor rights, and no immediate valuation negotiation. For early-stage companies moving fast with high conviction investors, SAFEs eliminate friction. The majority of pre-seed instruments now use the post-money SAFE format.",
              ],
            },
            {
              title: "Where SAFEs become dangerous",
              body: [
                "Post-money SAFEs give each investor a fixed percentage of the company, and all dilution from subsequent SAFEs comes exclusively from founders and existing shareholders, not from the new investors. Stacking multiple SAFEs with different caps pushes compounding dilution onto founders that only becomes visible when all instruments convert simultaneously at the next priced round. By that point, the damage is structural and irreversible.",
              ],
            },
            {
              title: "When priced rounds are cleaner",
              body: [
                "Priced rounds take longer and cost more in legal fees, but they deliver immediate cap table clarity. Everyone knows exactly what they own. There is no deferred dilution, no stacking risk, and no surprise conversion math at Series A. For larger raises or rounds with multiple investors, the upfront cost of a priced round often pays for itself in avoided dilution.",
              ],
            },
            {
              title: "How hidden dilution happens",
              body: [
                "A founder raises three SAFEs at different valuation caps. Each one feels reasonable in isolation. When Series A closes and all instruments convert simultaneously, the combined dilution can exceed what a single priced round would have produced, sometimes significantly. The problem is not any individual SAFE. It is the failure to model the cumulative effect of stacking them.",
              ],
            },
          ],
        },
      ],
    },
    {
      id: "term-sheets",
      nav: "Term sheets",
      title: "Where the real *negotiation* happens.",
      summary:
        "Founders who understand every clause negotiate better. Founders who do not lose control they never knew they had.",
      blocks: [
        {
          kind: "quote",
          text: "Founders usually think they lose control in the boardroom. Most of the time, they lose it in the term sheet.",
        },
        {
          kind: "accordion",
          items: [
            {
              title: "Liquidation preference",
              body: [
                "The liquidation preference determines who gets paid first and how much in an exit. A 1x non-participating preference means investors recover their investment before common shareholders receive anything. A participating preference lets investors recover their investment and share in remaining proceeds, effectively taking from founders twice. Stacked preferences across multiple rounds create a waterfall where later investors get paid first, and founders and employees may receive nothing in moderate exits.",
              ],
            },
            {
              title: "Anti-dilution",
              body: [
                "Anti-dilution provisions protect investors in down rounds by adjusting their conversion ratios upward, effectively reducing the founder's percentage to compensate. Full ratchet resets entirely to the new lower price and is the most punishing. Broad-based weighted average blends old and new prices and is the founder-friendly version to negotiate for.",
              ],
            },
            {
              title: "Board control",
              body: [
                "Board composition rights, veto lists over strategic decisions, hiring and firing approvals, and budget caps collectively replace founder autonomy with board consensus. Control is not lost in boardrooms. It is contracted away in term sheets. The erosion starts early and compounds quietly through successive rounds.",
              ],
            },
            {
              title: "Protective provisions",
              body: [
                "Protective provisions appear in the vast majority of venture deals and effectively give investors veto power over major decisions: future fundraising, acquisitions, changes to the charter, executive compensation, and more. The headline economics of a round may look standard. The governance terms are where alignment diverges.",
              ],
            },
            {
              title: "Option pool shuffles",
              body: [
                "Investors frequently require an expanded employee stock option pool to be carved out before the investment, meaning the dilution comes from the pre-money capitalization, not post-money. This effectively reduces the founder's pre-money stake before the round is even calculated, making the headline valuation less meaningful than it appears.",
              ],
            },
          ],
        },
      ],
    },
    {
      id: "founder-mistakes",
      nav: "Mistakes",
      title: "Eight mistakes that cost founders the most.",
      summary: "None is catastrophic on its own. They cost the most because they compound.",
      blocks: [
        {
          kind: "accordion",
          numbered: true,
          items: [
            {
              title: "Raising too early",
              body: [
                "Before validated demand or warm investor relationships. A missed first impression in a small VC community is difficult to recover.",
              ],
            },
            {
              title: "Chasing validation instead of fit",
              body: [
                "Capital is an accelerant, not proof of concept. Fundraising success does not equal product-market fit.",
              ],
            },
            {
              title: "Unrealistic valuation expectations",
              body: [
                "Overpricing creates a down-round trap. Anti-dilution provisions activate, cap tables get complicated, and future investors see a red flag.",
              ],
            },
            {
              title: "Misaligned investors",
              body: [
                "A VC whose fund math requires a large exit cannot be a good partner for a founder building a moderately-sized sustainable business.",
              ],
            },
            {
              title: "Not modeling dilution",
              body: [
                "Stacking SAFEs or ignoring option pool carve-outs creates deferred damage that only becomes visible when it is too late to fix.",
              ],
            },
            {
              title: "Ignoring non-dilutive capital",
              body: [
                "SR&ED, IRAP, grants, and revenue-based financing can fund significant milestones without giving up equity. Most founders underuse them.",
              ],
            },
            {
              title: "Not knowing the numbers cold",
              body: [
                "Guessing on CAC, LTV, burn rate, or conversion metrics signals operational immaturity. Not knowing your numbers ends conversations fast.",
              ],
            },
            {
              title: "Assuming all capital is good capital",
              body: [
                "The wrong capital at the wrong valuation from the wrong investor with the wrong terms is actively harmful. Not all money helps.",
              ],
            },
          ],
        },
      ],
    },
    {
      id: "equity-benchmarks",
      nav: "Equity benchmarks",
      title: "Founder equity erodes predictably across rounds.",
      summary:
        "By Series A, the median founding team holds roughly 37%. Percentage is only half the story: voting rights, board composition, and provisions decide control.",
      blocks: [
        {
          kind: "matrix",
          columns: [{ label: "Pre-seed" }, { label: "Seed" }, { label: "Series A" }, { label: "Series B+" }],
          rows: [
            { label: "Typical investor take", values: ["5–15%", "10–25%", "15–25%", "10–20%"] },
            { label: "Founder retention", values: ["80–90%", "60–80%", "37–65%", "25–50%"] },
            {
              label: "Strategic implication",
              values: [
                "Starting below 80% creates compounding problems by Series A",
                "The most expensive equity you will issue, protect it",
                "Median founding team holds roughly 37% after Series A",
                "Control depends on voting rights and provisions, not just percentage",
              ],
            },
          ],
          note: "These are directional ranges based on current market patterns, not prescriptive targets.",
        },
      ],
    },
  ],
  midCta: {
    after: "term-sheets",
    title: "Understand the terms before you sign them.",
    body: "execom helps founders evaluate term sheets, model dilution, and negotiate from a position of clarity.",
    primary: { label: "Assess capital strategy", href: "/engage" },
    secondary: { label: "Talk with execom", href: "/engage" },
  },
  faq: [
    {
      q: "Should I raise VC?",
      a: [
        "Only if your business both needs outside capital to capture a time-sensitive opportunity and has the trajectory to deliver the returns venture funds require. If you can reach profitability without dilution, or if your likely exit size does not match VC fund math, venture capital may not be the right structure, even if you could raise it.",
      ],
    },
    {
      q: "How long does fundraising usually take?",
      a: [
        "The full process from first outreach to close typically takes five to ten months. Most founders underestimate the timeline. If you have 18 months of runway, you should assume roughly half of that will be consumed by the fundraising process itself.",
      ],
    },
    {
      q: "How much equity should founders keep?",
      a: [
        "There is no single correct number, but the math is directional. Starting below 80% at pre-seed creates compounding problems. The median founding team retains roughly 37% by Series A. Equity percentage is only half the story, voting rights, board composition, and protective provisions determine actual control.",
      ],
    },
    {
      q: "Are angels better than VCs?",
      a: [
        "Neither is inherently better. Angels are faster, require less governance, and accept lower return multiples. VCs provide institutional credibility, follow-on capacity, and access to networks. The choice depends on your stage, your tolerance for governance, and whether your business needs institutional backing for future rounds.",
      ],
    },
    {
      q: "What is the real risk of SAFEs?",
      a: [
        "One SAFE is a useful tool. Stacking multiple SAFEs with different valuation caps pushes compounding dilution onto founders that only becomes visible when all instruments convert simultaneously. The risk is not any individual SAFE, it is the failure to model cumulative dilution before it is locked in.",
      ],
    },
    {
      q: "Is venture capital even a fit for Canadian founders?",
      a: [
        "It can be, but the environment is structurally more constrained. Capital pools are smaller, investor behavior is more conservative, the domestic market is limited, and growth-stage funding often requires US participation. Canadian founders who know these dynamics can sequence their strategy accordingly, but the playbook is different.",
      ],
    },
    {
      q: "What should I do before taking investor meetings?",
      a: [
        "Know your unit economics cold. Model your cap table through Series B including SAFE conversions. Understand the fund size and return requirements of the investors you are targeting. Explore non-dilutive options first. Talk to founders who have taken money from investors you are considering, and ask hard questions about governance and support.",
      ],
    },
  ],
  closing: {
    title: "Before you raise, know *what game* you are entering.",
    body: "The wrong capital at the wrong time can cost years. execom helps founders pressure-test their capital strategy before term sheets, dilution, and investor dynamics lock in.",
    primary: { label: "Assess capital strategy", href: "/engage" },
    secondary: { label: "Explore non-dilutive capital", href: "/non-dilutive-capital" },
  },
}
