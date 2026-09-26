import type { AdvisoryPageData } from "@/components/site/advisory/types"

export const grants: AdvisoryPageData = {
  href: "/grants",
  crumb: "Grants",
  hero: {
    eyebrow: "Grants",
    title: "Most founders should not build their funding strategy around *grants*.",
    lede: "execom helps founders separate useful non-dilutive funding from slow, distracting grant-chasing.",
    primary: { label: "Assess non-dilutive strategy", href: "/engage" },
    secondary: { label: "Start with SR&ED", href: "/sred" },
    takeaways: [
      "For Canadian founders doing technical work, **SR&ED comes first**.",
      "Judge every program by friction, odds, timing, and fit with work already underway.",
      "Apply for a grant when it speeds up work you would do anyway.",
    ],
  },
  chapters: [
    {
      id: "overview",
      nav: "Overview",
      title: "A useful tool. Rarely the first one.",
      summary:
        "Non-dilutive capital deserves the same scrutiny as any other resource: friction, odds, timing, and strategic fit.",
      blocks: [
        {
          kind: "points",
          items: [
            {
              label: "Odds",
              text: "Most competitive grant programs have low success rates. Founders routinely overestimate their chances and underestimate the pool of applicants.",
            },
            {
              label: "Delay",
              text: "From application to decision to disbursement, grant timelines are almost always longer than founders expect. Months of work can yield nothing.",
            },
            {
              label: "Compliance",
              text: "Winning a grant is not the end. Reporting, documentation, audits, and milestone tracking create ongoing administrative drag that persists long after the award.",
            },
            {
              label: "Focus",
              text: "Every hour spent on a grant application is an hour not spent on product, customers, or revenue. The opportunity cost is real and usually underpriced.",
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
                "Grants are a tool, not a strategy. They are one component of a non-dilutive capital stack, and for most founders, they are not the component that should come first.",
                "Founders often chase grants for emotional reasons: validation, runway anxiety, the appeal of money that feels free. But non-dilutive capital should be evaluated like any other resource, by friction, odds, timing, and strategic alignment with work the company already needs to do.",
                "For Canadian founders in particular, SR&ED is often the highest-priority non-dilutive mechanism. It rewards work already underway, aligns with the company's actual technical roadmap, and does not require winning a competition.",
              ],
            },
          ],
        },
      ],
    },
    {
      id: "what-matters",
      nav: "What matters",
      title: "The hierarchy, side by side.",
      summary:
        "Score each source on speed, certainty, admin burden, and strategic fit. The order that falls out: SR&ED, then practical programs, then traditional grants.",
      blocks: [
        {
          kind: "matrix",
          columns: [{ label: "SR&ED", highlight: true }, { label: "IRAP / R&D support" }, { label: "Traditional grants" }],
          rows: [
            {
              label: "Speed",
              values: [
                "Filed with tax return; refunds within weeks to months",
                "Application-based; moderate review cycles",
                "Slow, months from application to decision, often longer to disbursement",
              ],
            },
            {
              label: "Certainty",
              values: [
                "High, based on qualifying work already done",
                "Moderate, competitive but with clearer criteria",
                "Low, competitive, subjective, and often unpredictable",
              ],
            },
            {
              label: "Admin burden",
              values: [
                "Documentation of technical work; manageable with proper systems",
                "Milestone reporting and financial tracking",
                "Heavy, proposals, budgets, reports, audits, compliance reviews",
              ],
            },
            {
              label: "Dependence risk",
              values: [
                "Low, rewards past work, not future promises",
                "Low to moderate, tied to specific projects",
                "High, builds expectation of continued grant reliance",
              ],
            },
            {
              label: "Founder distraction",
              values: [
                "Minimal if properly structured",
                "Moderate, application and reporting overhead",
                "Significant, can consume weeks of founder time per application",
              ],
            },
            {
              label: "Strategic fit",
              values: [
                "Directly aligned with R&D the company is already doing",
                "Usually aligned with technical roadmap",
                "Often requires contorting roadmap to match grant criteria",
              ],
            },
          ],
          note: "SR&ED and pragmatic low-friction programs come first. Traditional grants are conditional and secondary.",
        },
        {
          kind: "detail",
          label: "Why this order",
          blocks: [
            {
              kind: "prose",
              paras: [
                "Not all non-dilutive funding is created equal.",
                "Founders should prioritize capital sources by reliability, speed, alignment with actual roadmap, administrative burden, and probability-adjusted value. When you apply those filters honestly, the hierarchy becomes clear.",
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
        "Canada pushes founders toward non-dilutive money earlier than the US. The trap is over-rotating into slow, competitive grants when sharper prioritization would pay more.",
      blocks: [
        {
          kind: "quote",
          text: "Canadian founders do not need more funding folklore. They need a hierarchy of what is actually worth pursuing.",
        },
        {
          kind: "accordion",
          items: [
            {
              title: "Canada makes founders capital-hungry",
              body: [
                "Canada has smaller capital pools, slower fundraising cycles, smaller check sizes, and fewer acquirers. This makes founders understandably hungry for non-dilutive money. The instinct is correct, reducing dilution is smart. The mistake is letting that hunger drive founders toward whichever programs appear most available rather than which ones are actually highest-leverage.",
              ],
            },
            {
              title: "Grants become a psychological crutch",
              body: [
                "When capital is scarce, founders start seeing grants as salvation. Applications feel productive, they involve strategy, writing, financial modeling, timelines. But activity is not progress. A grant application that takes three weeks and has a low acceptance rate is not a capital strategy. It is busywork with a lottery ticket attached. Founders who replace traction-building with grant-chasing rarely come out ahead.",
              ],
            },
            {
              title: "The small-market, slow-adoption problem",
              body: [
                "Canadian enterprise adoption is slower and the domestic market is smaller. This means founders already face longer timelines to prove traction and generate revenue. A grant process, with its own months-long cycle, layered on top of an already slow market creates compounding delay. Time spent waiting on grant decisions is time not spent converting customers or demonstrating the growth that investors and partners actually care about.",
              ],
            },
            {
              title: "Why SR&ED matters more in Canada",
              body: [
                "For many Canadian innovation companies, SR&ED is the real workhorse of non-dilutive capital. It aligns with actual R&D spend, rewards work already being done, and operates on a fundamentally different model than competitive grants. SR&ED does not require winning a pitch competition or aligning your roadmap with someone else's priorities. It is usually more strategically important, and more financially significant, than spending months chasing uncertain grants. Most founders underuse it.",
              ],
            },
            {
              title: "Why execom exists",
              body: [
                "execom exists to help founders prioritize the right non-dilutive capital, structure SR&ED claims properly, avoid grant-chasing as a substitute for strategy, and use funding as leverage rather than as a crutch. The Canadian ecosystem does not need more grant directories. It needs better judgment about what is actually worth pursuing.",
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
                "Canada's capital environment pushes founders toward non-dilutive funding earlier than in the United States. That part is rational. The problem is that many founders then over-rotate into slow, competitive grant programs instead of focusing on the highest-leverage options first. In Canada, the right answer is often not “more grants.” It is sharper prioritization: SR&ED first, practical support second, grant-chasing only when tightly justified.",
              ],
            },
          ],
        },
      ],
    },
    {
      id: "grant-reality",
      nav: "Grant reality",
      title: "How grant programs work for most founders.",
      summary: "The honest version: real costs, low odds, slow money, and compliance that outlasts the award.",
      blocks: [
        {
          kind: "accordion",
          items: [
            {
              title: "Grants are not free money",
              body: [
                "Every grant has a cost: the time to apply, the constraints on how funds are used, the compliance obligations that follow, and the opportunity cost of what the founder could have been doing instead. The nominal dollar amount is almost never the real value once friction is accounted for. Founders who think of grants as free money are miscalculating the cost of their own time.",
              ],
            },
            {
              title: "Low odds are the norm",
              body: [
                "Most competitive grant programs have acceptance rates that would discourage founders if they saw the numbers clearly. Rejection is normal, not exceptional. Founders routinely overestimate their chances because the application process feels serious and professional, but feeling competitive and being competitive are different things. Expecting to win a grant is not a capital strategy.",
              ],
            },
            {
              title: "Timelines are usually worse than founders expect",
              body: [
                "From application to decision, weeks become months. From decision to disbursement, more months pass. Many grant programs operate on reimbursement models, meaning the company must spend the money first and recover it later, sometimes much later. Founders who factor grant funds into near-term cash flow projections are building on assumptions that frequently collapse.",
              ],
            },
            {
              title: "Compliance survives long after the award",
              body: [
                "Winning a grant starts a reporting relationship. Milestone tracking, financial documentation, progress reports, and potential audits create an administrative tail that extends well beyond the initial award. This overhead is real, ongoing, and almost always underestimated at application time.",
              ],
            },
            {
              title: "Never build the business assuming grant cash arrives",
              body: [
                "A business model that depends on grant funding to stay viable is not a business model. Grants should supplement a company that is already functional without them. If removing the grant from the financial model causes the company to fail, the problem is not the grant, it is the business.",
              ],
            },
          ],
        },
      ],
    },
    {
      id: "sred-first",
      nav: "SR&ED first",
      title: "Start with *SR&ED*.",
      summary:
        "It recovers money on qualifying work you have already done. No pitch, no competition, no bending the roadmap to someone else's criteria.",
      blocks: [
        {
          kind: "quote",
          text: "If your company is doing qualifying technical work in Canada, ignoring SR&ED while chasing grants is usually backwards.",
        },
        {
          kind: "accordion",
          items: [
            {
              title: "Why SR&ED usually comes first",
              body: [
                "SR&ED is not speculative. It is based on qualifying technical work your company has already done. It does not require a pitch, a competition, or contorting your roadmap. It aligns with actual R&D spend and rewards genuine innovation work. For many Canadian innovation companies, SR&ED represents the largest single source of non-dilutive capital available, and it is routinely underleveraged.",
              ],
            },
            {
              title: "Retroactive recovery vs speculative applications",
              body: [
                "The fundamental difference between SR&ED and traditional grants is the direction of the bet. SR&ED recovers money on work already performed. Grants ask you to predict and promise work that may or may not unfold as proposed. One is grounded. The other is speculative. Founders should exhaust the grounded option before investing heavily in the speculative one.",
              ],
            },
            {
              title: "Why founders underuse it",
              body: [
                "Many founders think SR&ED is only for large companies, requires complex filings they cannot handle, or produces insignificant returns. None of this is accurate. Early-stage companies with genuine technical work often qualify for meaningful claims. The problem is usually not eligibility, it is awareness, documentation habits, and the quality of advisory support.",
              ],
            },
            {
              title: "How it fits into a real capital stack",
              body: [
                "SR&ED should be the foundation layer of a non-dilutive capital strategy. It provides a reliable, recurring source of capital that strengthens the company's position before layering on other instruments, whether that is IRAP, selective grants, revenue-based financing, or equity. Every other non-dilutive decision should be made after SR&ED is properly structured.",
              ],
            },
          ],
        },
      ],
    },
    {
      id: "practical-programs",
      nav: "IRAP & programs",
      title: "Practical programs worth evaluating.",
      summary:
        "A short list of program categories that can earn the founder's time. The filter: does it fund work you were already doing, at an acceptable administrative cost, without pulling the company off course?",
      blocks: [
        {
          kind: "accordion",
          items: [
            {
              title: "IRAP",
              body: [
                "The National Research Council's Industrial Research Assistance Program provides advisory services and funding for R&D projects. For early-stage companies, IRAP can be a meaningful complement to SR&ED, covering project-specific costs with a relatively clear application process and assigned advisors. It works best when the project scope is well-defined and the company already has technical capacity to execute.",
              ],
            },
            {
              title: "Selective provincial support",
              body: [
                "Several provinces offer innovation support that, for the right company, can be worth pursuing. Alberta Innovates, Ontario's programs, and similar provincial instruments have varying relevance depending on geography, sector, and stage. The key is selectivity, not applying to everything available, but targeting the programs that genuinely fit.",
              ],
            },
            {
              title: "Export support where directly relevant",
              body: [
                "For companies already planning cross-border or international go-to-market, certain trade and export support programs can reduce the cost of market entry. These make sense when the company is already committed to the expansion, not when the grant is the reason for expanding.",
              ],
            },
            {
              title: "Tightly aligned R&D support",
              body: [
                "Programs that fund specific technical development, not general operations, can be useful when the project already exists on the roadmap. The test is simple: would you do this work without the funding? If yes, the program is an accelerant. If no, the program is pulling you off course.",
              ],
            },
            {
              title: "Programs that stack with SR&ED",
              body: [
                "Some non-dilutive programs can be combined with SR&ED claims, effectively increasing the total recovery on qualifying work. Understanding how instruments interact, what stacks, what offsets, and what creates audit complexity, is part of structuring a non-dilutive capital strategy properly rather than treating each program in isolation.",
              ],
            },
          ],
        },
      ],
    },
    {
      id: "when-grants-work",
      nav: "When grants work",
      title: "When grants make sense.",
      summary:
        "There are specific conditions where grants earn the effort. The cleanest test: take the grant out of the plan. If only your speed changes, apply.",
      blocks: [
        {
          kind: "quote",
          text: "Grants are best used as accelerants for motion that already exists, not as substitutes for motion.",
        },
        {
          kind: "accordion",
          items: [
            {
              title: "Deep tech, hard science, long technical-risk cycles",
              body: [
                "Companies with genuinely long development timelines, biotech, advanced materials, hardware with multi-year R&D cycles, often have a stronger case for grant funding. The timeline mismatch between venture capital expectations and deep-tech reality means non-dilutive capital can be structurally important, not just convenient.",
              ],
            },
            {
              title: "Government-as-customer situations",
              body: [
                "When the grant-giving body is also a potential customer or procurement partner, the relationship has value beyond the dollars. Defence, health, infrastructure, and public safety verticals sometimes offer grants that double as market validation and customer development.",
              ],
            },
            {
              title: "Projects already aligned with grant criteria",
              body: [
                "If the company was going to do the work anyway, and the grant criteria happen to match, the marginal cost of applying is lower and the strategic distortion is minimal. This is the cleanest use case, the grant accelerates existing motion rather than creating new motion for its own sake.",
              ],
            },
            {
              title: "Teams with enough runway and admin capacity",
              body: [
                "A two-person team burning through its last six months of runway should not be writing grant applications. A team with 18 months of runway, a dedicated operations person, and a clear project scope is in a different position. Grants require organizational capacity that early-stage founders rarely have.",
              ],
            },
            {
              title: "Grants as acceleration, not foundation",
              body: [
                "The clearest signal that a grant is worth pursuing: removing it from the plan would not change the company's direction. It would only change the speed. If the grant is the reason the project exists, that is a dependency. If the grant makes an existing project faster, that is leverage.",
              ],
            },
          ],
        },
      ],
    },
    {
      id: "hidden-costs",
      nav: "Hidden costs",
      title: "The real price of *free money*.",
      summary:
        "Founder time, reporting, reimbursement lag, audit exposure, and a slow drift toward performing for a funding body instead of customers.",
      blocks: [
        {
          kind: "accordion",
          items: [
            {
              title: "Founder time cost",
              body: [
                "A serious grant application is not a weekend project. Research, writing, financial projections, technical narratives, letters of support, and revisions can easily consume two to four weeks of focused founder time. Multiply that by several applications per year and the time cost becomes a meaningful percentage of the founder's productive capacity, time that was not spent on product, customers, or revenue.",
              ],
            },
            {
              title: "Reporting and compliance burden",
              body: [
                "Grant recipients enter a reporting relationship that typically requires quarterly or semi-annual progress reports, financial reconciliation, milestone documentation, and sometimes formal audits. This is not optional. Non-compliance can trigger clawback provisions. The administrative overhead is persistent and cumulative.",
              ],
            },
            {
              title: "Reimbursement lag and cash flow risk",
              body: [
                "Many grant programs operate on a reimbursement basis: spend first, submit documentation, wait for review, then receive funds. Delays of months are common. Founders who factor grant reimbursements into near-term cash flow projections are building on timing assumptions that frequently slip, and when they slip, the company absorbs the gap.",
              ],
            },
            {
              title: "Audit and documentation exposure",
              body: [
                "Grant-funded activities may be subject to audit, sometimes years after the project ends. Inadequate documentation at the time of spending can create retroactive compliance problems. This is especially risky for early-stage companies that do not yet have robust financial and project-tracking systems.",
              ],
            },
            {
              title: "The distraction tax",
              body: [
                "Beyond the measurable time costs, grant-chasing creates a subtler problem: it shifts the founder's attention from building a business to performing for a funding body. Roadmaps start bending toward grant criteria. Language gets optimized for reviewers instead of customers. The company slowly orients around external validation rather than market traction. This is the most expensive hidden cost, and the hardest to see from inside.",
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
      summary: "The patterns that show up again and again when founders pursue non-dilutive capital.",
      blocks: [
        {
          kind: "accordion",
          numbered: true,
          items: [
            {
              title: "Treating grants as strategy",
              body: [
                "Grants are a tool. When they become the plan, the company is building on someone else's timeline, criteria, and approval process.",
              ],
            },
            {
              title: "Ignoring SR&ED",
              body: [
                "The highest-leverage non-dilutive capital for most Canadian innovation companies. Underusing it while chasing grants is usually backwards.",
              ],
            },
            {
              title: "Applying before checking fit",
              body: [
                "Submitting applications to programs that do not match the company's stage, sector, or activities wastes time and builds false hope.",
              ],
            },
            {
              title: "Designing the roadmap around the grant",
              body: [
                "When the grant criteria start shaping what the company builds, the company has lost strategic autonomy for conditional money.",
              ],
            },
            {
              title: "Underestimating founder time cost",
              body: [
                "Multiple grant applications per year can consume a meaningful share of the founder's productive capacity. That time had a value.",
              ],
            },
            {
              title: "Assuming reimbursement timing",
              body: [
                "Building cash flow projections around expected grant disbursements is a structural risk. Delays are normal, not exceptional.",
              ],
            },
            {
              title: "Failing to build documentation early",
              body: [
                "Poor records at the time of spending create compliance problems months or years later, for both grants and SR&ED.",
              ],
            },
            {
              title: "Depending on grants to validate",
              body: [
                "Winning a grant is not market validation. Customers paying for your product is validation. Do not confuse the two.",
              ],
            },
          ],
        },
      ],
    },
  ],
  midCta: {
    after: "sred-first",
    title: "Is your SR&ED structured correctly?",
    body: "Most founders leave money on the table. execom structures SR&ED before layering on other non-dilutive capital.",
    primary: { label: "Explore SR&ED", href: "/sred" },
    secondary: { label: "Talk with execom", href: "/engage" },
  },
  faq: [
    {
      q: "Are grants worth it for startups?",
      a: [
        "Sometimes, but far less often than founders assume. Grants are worth it when the project already fits, the company can absorb the timeline and compliance burden, and the grant supplements work that would happen anyway. For most early-stage startups, other non-dilutive instruments should come first.",
      ],
    },
    {
      q: "What should Canadian founders prioritize first?",
      a: [
        "SR&ED. For companies doing qualifying technical work, it is usually the highest-leverage, most reliable, and least distracting source of non-dilutive capital. After SR&ED is properly structured, evaluate IRAP and selective practical programs. Competitive grants come last, and only when tightly aligned.",
      ],
    },
    {
      q: "Is SR&ED more important than grants?",
      a: [
        "For most qualifying Canadian companies, yes. SR&ED rewards work already done, operates on a more predictable timeline, and does not require winning a competition. It should typically be optimized before serious grant-chasing begins.",
      ],
    },
    {
      q: "What is the difference between SR&ED and IRAP?",
      a: [
        "SR&ED is a federal tax incentive that provides refundable credits for qualifying R&D expenditures, it is retroactive and based on work already performed. IRAP is a project-based funding program through the National Research Council that provides advisory and financial support for specific R&D projects, it is prospective and requires an application. They can complement each other but operate on different models.",
      ],
    },
    {
      q: "When do grants actually make sense?",
      a: [
        "Deep tech with long development cycles, government-as-customer situations, projects already aligned with grant criteria, and teams with enough runway and administrative capacity to absorb the process. The test: would you do this work without the grant? If yes, apply. If no, reconsider.",
      ],
    },
    {
      q: "Can grants hurt more than they help?",
      a: [
        "Yes. When grants consume disproportionate founder time, distort the roadmap, create dependency, or delay traction-building activities, the net effect is negative. The dollar amount of the grant can be smaller than the opportunity cost of pursuing it.",
      ],
    },
    {
      q: "What should I do before applying?",
      a: [
        "Ensure SR&ED is structured. Confirm the grant criteria genuinely match your current work. Estimate the realistic time cost of the application. Check whether the program operates on reimbursement and model the cash flow impact. Ask honestly: is this the best use of the next three weeks of my time?",
      ],
    },
    {
      q: "Can I build a business around grants?",
      a: [
        "No. A business that depends on winning grants to stay viable is not a business, it is a grant-dependent organization. Grants should supplement a company that is already functional without them. If the grant disappears and the company fails, the problem was never the grant.",
      ],
    },
  ],
  closing: {
    title: "Do not confuse non-dilutive funding with *easy money*.",
    body: "The right funding can extend runway and strengthen your position. The wrong pursuit drains attention and delays traction. execom helps founders focus on the non-dilutive capital that matters.",
    primary: { label: "Assess non-dilutive strategy", href: "/engage" },
    secondary: { label: "Explore SR&ED", href: "/sred" },
  },
}
