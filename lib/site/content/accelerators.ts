import type { AdvisoryPageData } from "@/components/site/advisory/types"

export const accelerators: AdvisoryPageData = {
  href: "/accelerators-incubators",
  crumb: "Accelerators & incubators",
  hero: {
    eyebrow: "Accelerators & incubators",
    title: "Most startups should not join an *accelerator*.",
    lede: "For most founders, accelerators and incubators add less leverage than advertised and consume more time than they should.",
    primary: { label: "Assess founder leverage", href: "/engage" },
    secondary: { label: "Explore non-dilutive capital", href: "/non-dilutive-capital" },
    takeaways: [
      "Most programs consume **8–16 weeks** of founder attention and optimize for cohort identity, signaling, and process.",
      "Founders usually need **fewer bottlenecks**: faster formation, clean records, sharper capital sequencing, and distribution execution.",
      "Join a program only when it solves a specific, structural problem faster than you could alone.",
    ],
  },
  chapters: [
    {
      id: "overview",
      nav: "Overview",
      title: "Execution is usually more valuable than affiliation.",
      summary:
        "Many programs are optimized for optics: cohort photos, demo days, mentor rosters. The right question is what problem you are trying to solve, and whether a program is the fastest way to solve it.",
      blocks: [
        {
          kind: "points",
          items: [
            {
              label: "Time",
              text: "Most programs consume 8–16 weeks of founder attention. That is a significant portion of early-stage runway spent on someone else's schedule.",
            },
            {
              label: "Signal",
              text: "The badge carries weight only if the program is genuinely exceptional. For most programs, it signals participation, not progress.",
            },
            {
              label: "Execution",
              text: "Programs rarely accelerate the specific operational work, formation, filings, documents, capital structure, that founders need done.",
            },
            {
              label: "Leverage",
              text: "Real leverage comes from structure, speed, and capital discipline. Most programs substitute community for all three.",
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
                "Accelerators and incubators are treated as default early-stage infrastructure. In practice, many are optimized for program optics, cohort photos, demo days, mentor rosters, rather than for the things that actually reduce risk and build companies.",
                "Founders often confuse being “in motion” with actually making progress. A twelve-week program with weekly pitch practice, office hours, and networking events can feel productive. Whether it moves the company forward is a different question.",
                "The right question is not “Should I join a program?” It is “What problem am I actually trying to solve, and is a program the fastest way to solve it?”",
              ],
            },
          ],
        },
      ],
    },
    {
      id: "the-problem",
      nav: "The problem",
      title: "The startup ecosystem oversells accelerators.",
      summary:
        "Many programs sell access and advice as if they were scarce, and push founders to optimize for presentation before fundamentals. The result is motion without progress.",
      blocks: [
        {
          kind: "quote",
          text: "Most founders do not need a program. They need clearer execution and better structure.",
        },
        {
          kind: "accordion",
          items: [
            {
              title: "Cohort identity is not operating leverage",
              body: [
                "Being part of a cohort creates social reinforcement, not structural advantage. Founders bond with peers, attend events, and feel embedded in something larger. But cohort membership does not clean your cap table, file your trademarks, or sequence your capital stack. The identity can feel valuable while delivering very little operational progress.",
              ],
            },
            {
              title: "Mentorship is usually generic",
              body: [
                "Most accelerator mentorship consists of broad, recycled advice from people who do not have deep context on the specific company. Founders hear the same frameworks repeatedly, product-market fit, fundraising narratives, pitch structure, without receiving specific, actionable guidance on the structural and operational problems that actually block progress.",
              ],
            },
            {
              title: "Demo-day logic distorts priorities",
              body: [
                "When a program culminates in a showcase event, founder behavior shifts toward presentation readiness. Deck polish, narrative arc, and investor storytelling take priority over product quality, customer acquisition, and operational structure. The incentive is to look fundable, not to be fundamentally sound.",
              ],
            },
            {
              title: "Programs often create motion without progress",
              body: [
                "Weekly check-ins, workshops, networking mixers, and mentor rotations fill a calendar. They produce activity reports and engagement metrics for the program. They do not necessarily produce a cleaner corporate structure, a stronger capital position, or a faster path to revenue for the founder.",
              ],
            },
            {
              title: "The wrong environment can slow a serious founder down",
              body: [
                "A founder with clear execution priorities who enters a program designed around exploration, community, and generalized advice may actually lose momentum. The program cadence replaces the company cadence, and work that should have moved in days stalls because the founder's attention is absorbed elsewhere.",
              ],
            },
          ],
        },
      ],
    },
    {
      id: "canada-factor",
      nav: "The Canada factor",
      eyebrow: "Regional context",
      tone: "feature",
      title: "Accelerators are especially overrated in *Canada*.",
      summary:
        "Canada's ecosystem is smaller, slower, and more institutionally mediated, so programs look essential. Many founders end up in one because they lack a faster, more direct path to execution.",
      blocks: [
        {
          kind: "quote",
          text: "In Canada, accelerators are often used to compensate for ecosystem weakness. That does not mean they are the best use of a founder's time.",
        },
        {
          kind: "accordion",
          items: [
            {
              title: "Ecosystem scarcity makes programs look more important than they are",
              body: [
                "In smaller ecosystems, programs become central nodes by default, not because they are highly effective, but because alternatives are limited. A program can appear essential simply because there are fewer visible pathways for founders. Importance by scarcity is not the same as importance by impact.",
              ],
            },
            {
              title: "Signaling matters more in Canada than it should",
              body: [
                "Canadian founders often join programs because they believe the badge will unlock legitimacy, introductions, or investor confidence that the company has not yet earned through traction alone. In tighter ecosystems, this signaling instinct is stronger, and the programs know it. The badge becomes a substitute for progress rather than a reflection of it.",
              ],
            },
            {
              title: "“Support” often substitutes for speed",
              body: [
                "Many Canadian programs provide community, workshops, and process, but not the kind of execution infrastructure founders actually need. A founder who needs a clean incorporation, trademark protection, and a capital strategy does not primarily need a Slack channel and weekly office hours. Support is not the same as throughput.",
              ],
            },
            {
              title: "Founders need structure more than programming",
              body: [
                "What most Canadian founders lack is not guidance, it is operational infrastructure. Faster company setup, cleaner capital positioning, better non-dilutive execution, stronger market-entry logic, and structured corporate records would do more for most companies than another twelve-week workshop series.",
              ],
            },
            {
              title: "Why execom exists",
              body: [
                "execom exists to give founders a faster, sharper alternative to the institutional drag that often defines early-stage support systems. Instead of cohort-based programming, execom provides portal-based execution on the tasks that actually build companies, formation, filings, documents, capital, and corporate infrastructure.",
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
                "In Canada, accelerators and incubators are often treated as essential founder infrastructure because the surrounding ecosystem is smaller, slower, and more institutionally mediated. That makes them visible. It does not always make them valuable. In many cases, founders are pushed toward programs because they lack faster, more direct paths to execution and capital discipline.",
              ],
            },
          ],
        },
      ],
    },
    {
      id: "what-they-get-wrong",
      nav: "What programs miss",
      title: "What most programs misunderstand.",
      summary:
        "Founders rarely need more broad advice. They need specific execution on the work that compounds: formation, trademarks, cap-table structure, funding strategy, SR&ED, market entry, and distribution.",
      blocks: [
        {
          kind: "accordion",
          items: [
            {
              title: "They assume the founder's problem is knowledge",
              body: [
                "Most programs are structured around teaching. But for founders who already understand their market and product, the bottleneck is not knowledge, it is execution throughput. Workshops on lean methodology do not help a founder who needs a clean federal incorporation filed this week.",
              ],
            },
            {
              title: "They confuse network access with execution",
              body: [
                "Introductions to mentors, investors, and alumni are presented as core value. But introductions do not close deals, build products, or structure companies. Access without execution capacity is noise that feels like signal.",
              ],
            },
            {
              title: "They overvalue mentorship and undervalue systems",
              body: [
                "A rotating cast of mentors offering thirty-minute conversations is not a system. Founders need repeatable processes for the work they do over and over, agreements, filings, corporate records, capital planning. Systems scale. Mentorship conversations do not.",
              ],
            },
            {
              title: "They push investor readiness before company readiness",
              body: [
                "Many programs orient around preparing founders to raise. The problem is that raising capital before the company is structurally sound creates fragile outcomes. A founder with a polished deck but a messy cap table, no trademark protection, and unresolved corporate governance is not investor-ready, they are investor-presentable, which is a very different thing.",
              ],
            },
            {
              title: "They rarely solve structural bottlenecks",
              body: [
                "The hard, repeatable work of company building, incorporation, shareholder agreements, IP assignments, board resolutions, cap-table management, SR&ED filing, is almost never what accelerators address. These are the tasks that actually compound over time, and they are precisely the tasks that programs leave to the founder to figure out on their own.",
              ],
            },
          ],
        },
      ],
    },
    {
      id: "when-they-help",
      nav: "When programs help",
      title: "When an accelerator can make sense.",
      summary:
        "There are narrow circumstances where a program adds real value, and they are rarer than the ecosystem suggests. The mistake is treating accelerators as default infrastructure.",
      blocks: [
        {
          kind: "accordion",
          items: [
            {
              title: "A truly exceptional program with real network concentration",
              body: [
                "A small number of programs offer network density that is difficult to replicate independently, concentrated investor relationships, deep alumni ecosystems, and genuine follow-on capital dynamics. These programs exist, and for the right founder at the right stage, they can meaningfully change trajectory. But they represent a fraction of the programs that market themselves this way.",
              ],
            },
            {
              title: "A founder who needs forced compression and environment",
              body: [
                "Some founders benefit from externally imposed structure and urgency. If a founder knows they work better under compressed timelines and peer accountability, a well-designed program can serve that function. The value is environmental, not informational, and it only works if the founder is honest about why they need it.",
              ],
            },
            {
              title: "A company entering a highly networked US venture track",
              body: [
                "For Canadian founders pursuing US venture capital, a well-positioned US-based program can provide introductions and credibility that are otherwise expensive to build from a distance. The signaling value is higher in cross-border contexts where the founder lacks existing network.",
              ],
            },
            {
              title: "A program with direct relevance to sector and stage",
              body: [
                "Vertical-specific programs with genuine domain expertise, relevant corporate partners, and sector-appropriate investor networks can add value that generalist programs cannot. The key indicator is whether the program's resources are structurally relevant to the company or merely adjacent.",
              ],
            },
            {
              title: "A founder explicitly buying signaling and understanding the tradeoff",
              body: [
                "If a founder joins a program specifically for the credential, and is clear-eyed about the time cost, equity cost, and opportunity cost, that can be a rational decision. The mistake is treating signaling as a byproduct rather than the primary purchase, and overestimating what the signal actually unlocks.",
              ],
            },
          ],
        },
      ],
    },
    {
      id: "what-founders-need",
      nav: "What founders need",
      title: "Founders need fewer *bottlenecks*.",
      summary:
        "The work that compounds (formation, records, capital strategy, filings, distribution) is the work most programs leave entirely to the founder.",
      blocks: [
        {
          kind: "accordion",
          items: [
            {
              title: "Faster company formation and setup",
              body: [
                "Incorporation, articles, initial resolutions, and registered-agent setup executed through a structured intake, not a billable-hour conversation.",
              ],
            },
            {
              title: "Clean documents and records",
              body: [
                "Shareholder agreements, IP assignments, NDAs, board resolutions, and corporate minute books maintained through repeatable workflows.",
              ],
            },
            {
              title: "Sharper capital sequencing",
              body: [
                "Understanding when to pursue SR&ED, when to raise, when to pursue non-dilutive capital, and in what order, based on the company's actual position.",
              ],
            },
            {
              title: "Non-dilutive funding discipline",
              body: [
                "SR&ED at 5%, not 15–30%. Grant triage based on probability, not hope. Capital strategy that treats non-dilutive funding as a tool, not a lifestyle.",
              ],
            },
            {
              title: "Real market validation",
              body: [
                "Customer acquisition, revenue, and distribution progress, not pitch-competition wins or mentor approval. Markets validate companies; programs do not.",
              ],
            },
            {
              title: "Distribution and market-entry execution",
              body: [
                "Access to channels, partners, and market-entry pathways that create real commercial traction rather than theoretical addressable-market slides.",
              ],
            },
          ],
        },
      ],
    },
    {
      id: "why-execom",
      nav: "The alternative",
      title: "Why execom is often the *better path*.",
      summary:
        "execom provides the execution infrastructure founders actually need, without the cohort cadence, generalized advice loops, or equity cost that come with most programs.",
      blocks: [
        {
          kind: "matrix",
          columns: [{ label: "execom", highlight: true }, { label: "Typical accelerator" }],
          rows: [
            {
              label: "Execution",
              values: [
                "Portal-based workflows for formation, filings, documents, and capital",
                "Workshops, office hours, and mentor rotations",
              ],
            },
            {
              label: "Speed",
              values: ["Structured intake to execution in days", "8–16 week program cadence"],
            },
            {
              label: "Cost",
              values: ["Fee-for-service; no equity required", "Often 5–10% equity plus time cost"],
            },
            {
              label: "Expert input",
              values: [
                "Applied selectively where it changes outcomes",
                "Generalized across cohort regardless of need",
              ],
            },
            {
              label: "Output",
              values: [
                "Clean corporate records, filed documents, structured capital strategy",
                "Pitch deck, demo-day presentation, network introductions",
              ],
            },
            {
              label: "Focus",
              values: [
                "Company readiness: structure, records, capital, filings",
                "Investor readiness: narrative, deck, presentation",
              ],
            },
          ],
        },
        {
          kind: "quote",
          text: "For most founders, speed plus structure is more valuable than a cohort.",
        },
      ],
    },
    {
      id: "founder-mistakes",
      nav: "Mistakes",
      title: "Eight mistakes founders make when evaluating programs.",
      summary:
        "They range from joining for the badge to letting program cadence replace company cadence.",
      blocks: [
        {
          kind: "list",
          numbered: true,
          items: [
            "Joining for the badge rather than the problem solved",
            "Confusing a network with traction",
            "Delaying operational setup while “getting ready”",
            "Letting program cadence replace company cadence",
            "Optimizing for investor optics too early",
            "Assuming mentorship is execution",
            "Treating community as leverage",
            "Not asking what the company would look like six months later without the program",
          ],
        },
      ],
    },
  ],
  midCta: {
    after: "when-they-help",
    title: "Considering a program? Know what you are buying.",
    body: "Before committing time and equity to an accelerator, founders should understand what they actually need and whether a program solves it.",
    primary: { label: "Assess founder leverage", href: "/engage" },
    secondary: { label: "Talk with execom", href: "/contact" },
  },
  faq: [
    {
      q: "Are accelerators worth it for startups?",
      a: [
        "For most startups, no. The time cost, equity cost, and opportunity cost exceed the value received. A small number of genuinely exceptional programs can be worth it in narrow circumstances, but the default answer should be skepticism, not enthusiasm.",
      ],
    },
    {
      q: "When does an accelerator actually help?",
      a: [
        "When the program offers concentrated network value that the founder cannot build independently, when the founder genuinely needs externally imposed structure, or when the signaling value is high enough to justify the cost. These situations are less common than the ecosystem suggests.",
      ],
    },
    {
      q: "Are incubators different from accelerators in practice?",
      a: [
        "The labels are used loosely. Incubators tend to be longer and less structured; accelerators tend to be shorter and more compressed. In practice, many of the same criticisms apply to both: generalized advice, performative activity, limited structural impact, and high opportunity cost.",
      ],
    },
    {
      q: "Why are these programs especially overrated in Canada?",
      a: [
        "Canada's smaller ecosystem makes programs more visible and harder to bypass. Founders are pushed toward them because faster alternatives are less available. Institutional funding often flows through programs rather than directly to companies, which reinforces their centrality without necessarily proving their effectiveness.",
      ],
    },
    {
      q: "What do founders usually need instead?",
      a: [
        "Faster company formation, clean corporate documents, sharper capital sequencing, non-dilutive funding discipline, real market validation, and distribution execution. These are operational problems, not informational ones, and they are rarely addressed by program-based models.",
      ],
    },
    {
      q: "Can an accelerator hurt more than it helps?",
      a: [
        "Yes. A program that absorbs founder attention, imposes the wrong cadence, encourages premature fundraising, or creates false confidence can actively slow a company down. The cost is not always visible because the founder feels busy throughout.",
      ],
    },
    {
      q: "Is the real value just signaling?",
      a: [
        "For many programs, yes. The operational and educational value is modest; the primary benefit is the credential. That can be a rational purchase if the founder understands the tradeoff and the signal is strong enough to justify the cost. For most programs, it is not.",
      ],
    },
    {
      q: "What should I do before joining one?",
      a: [
        "Ask what specific problem the program solves that you cannot solve faster independently. If the answer is vague, community, mentorship, exposure, you likely do not need the program. If the answer is specific and structural, evaluate the cost honestly against alternatives.",
      ],
    },
  ],
  closing: {
    // ⁠ (word joiner) keeps "early-stage" from breaking at the hyphen under text-wrap: balance
    title: "Do not outsource *early-⁠stage judgment* to a program.",
    body: "Most founders need faster execution, cleaner structure, and stronger leverage. execom helps them move directly on the work that actually compounds.",
    primary: { label: "Assess founder leverage", href: "/engage" },
    secondary: { label: "Explore VC and angel capital", href: "/vc-angel-capital" },
  },
}
