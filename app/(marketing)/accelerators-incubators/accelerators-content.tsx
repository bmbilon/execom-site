"use client"

import { StickyToc } from "@/components/marketing/sticky-toc"
import { AccordionSection } from "@/components/marketing/accordion-section"
import { CtaPanel } from "@/components/marketing/cta-panel"
import { StatCallout, PullQuote } from "@/components/marketing/stat-callout"
import { ComparisonMatrix } from "@/components/marketing/comparison-matrix"

const tocItems = [
  { id: "overview", label: "Overview" },
  { id: "the-problem", label: "The Problem" },
  { id: "canada-factor", label: "The Canada Factor" },
  { id: "what-they-get-wrong", label: "What They Get Wrong" },
  { id: "when-they-help", label: "When They Actually Help" },
  { id: "what-founders-need", label: "What Founders Need Instead" },
  { id: "why-execom", label: "Why execom Is Different" },
  { id: "founder-mistakes", label: "Founder Mistakes" },
  { id: "faq", label: "FAQ" },
  { id: "assessment", label: "Assessment" },
]

export function AcceleratorsContent() {
  return (
    <>
      {/* ── OVERVIEW ── */}
      <section id="overview" className="light-section py-20 md:py-28">
        <div className="max-w-[1200px] mx-auto px-8">
          <div className="flex gap-16">
            <div className="w-48 flex-shrink-0">
              <StickyToc items={tocItems} />
            </div>
            <div className="flex-1 min-w-0 max-w-content space-y-6 text-body text-fg/80">
              <p className="section-label">Overview</p>
              <p>
                Accelerators and incubators are treated as default early-stage
                infrastructure. In practice, many are optimized for program
                optics, cohort photos, demo days, mentor rosters, rather than
                for the things that actually reduce risk and build companies.
              </p>
              <p>
                Founders often confuse being &ldquo;in motion&rdquo; with
                actually making progress. A twelve-week program with weekly
                pitch practice, office hours, and networking events can feel
                productive. Whether it moves the company forward is a different
                question.
              </p>
              <p>
                The right question is not &ldquo;Should I join a
                program?&rdquo; It is &ldquo;What problem am I actually trying
                to solve, and is a program the fastest way to solve it?&rdquo;
              </p>

              <div className="mt-10">
                <StatCallout
                  items={[
                    {
                      label: "Time",
                      description:
                        "Most programs consume 8–16 weeks of founder attention. That is a significant portion of early-stage runway spent on someone else's schedule.",
                    },
                    {
                      label: "Signal",
                      description:
                        "The badge carries weight only if the program is genuinely exceptional. For most programs, it signals participation, not progress.",
                    },
                    {
                      label: "Execution",
                      description:
                        "Programs rarely accelerate the specific operational work, formation, filings, documents, capital structure, that founders need done.",
                    },
                    {
                      label: "Leverage",
                      description:
                        "Real leverage comes from structure, speed, and capital discipline. Most programs substitute community for all three.",
                    },
                  ]}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── THE PROBLEM ── */}
      <section id="the-problem" className="dark-atmosphere py-20 md:py-28">
        <div className="max-w-[1200px] mx-auto px-8">
          <div className="flex gap-16">
            <div className="w-48 flex-shrink-0 hidden lg:block" />
            <div className="flex-1 min-w-0 max-w-content">
              <p className="section-label-light">The Problem</p>
              <p className="text-[1.1rem] text-white/50 mb-4">
                The startup ecosystem oversells accelerators.
              </p>
              <p className="text-body text-white/70 mb-10">
                Many programs package access and advice as if they are scarce
                commodities, encourage performative startup activity, and push
                founders to optimize for presentation before fundamentals.
                The result is motion without progress and delay where there
                should be execution.
              </p>

              <AccordionSection
                variant="dark"
                items={[
                  {
                    title: "Cohort identity is not operating leverage",
                    content: (
                      <p>
                        Being part of a cohort creates social reinforcement, not
                        structural advantage. Founders bond with peers, attend
                        events, and feel embedded in something larger. But cohort
                        membership does not clean your cap table, file your
                        trademarks, or sequence your capital stack. The identity
                        can feel valuable while delivering very little operational
                        progress.
                      </p>
                    ),
                  },
                  {
                    title: "Mentorship is usually generic",
                    content: (
                      <p>
                        Most accelerator mentorship consists of broad, recycled
                        advice from people who do not have deep context on the
                        specific company. Founders hear the same frameworks
                        repeatedly, product-market fit, fundraising narratives,
                        pitch structure, without receiving specific, actionable
                        guidance on the structural and operational problems that
                        actually block progress.
                      </p>
                    ),
                  },
                  {
                    title: "Demo-day logic distorts priorities",
                    content: (
                      <p>
                        When a program culminates in a showcase event, founder
                        behavior shifts toward presentation readiness. Deck
                        polish, narrative arc, and investor storytelling take
                        priority over product quality, customer acquisition, and
                        operational structure. The incentive is to look fundable,
                        not to be fundamentally sound.
                      </p>
                    ),
                  },
                  {
                    title: "Programs often create motion without progress",
                    content: (
                      <p>
                        Weekly check-ins, workshops, networking mixers, and
                        mentor rotations fill a calendar. They produce activity
                        reports and engagement metrics for the program. They do
                        not necessarily produce a cleaner corporate structure, a
                        stronger capital position, or a faster path to revenue
                        for the founder.
                      </p>
                    ),
                  },
                  {
                    title:
                      "The wrong environment can slow a serious founder down",
                    content: (
                      <p>
                        A founder with clear execution priorities who enters a
                        program designed around exploration, community, and
                        generalized advice may actually lose momentum. The
                        program cadence replaces the company cadence, and work
                        that should have moved in days stalls because the
                        founder&apos;s attention is absorbed elsewhere.
                      </p>
                    ),
                  },
                ]}
              />

              <div className="mt-10">
                <PullQuote variant="dark">
                  Most founders do not need a program. They need clearer
                  execution and better structure.
                </PullQuote>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── MID-PAGE CTA ── */}
      <div className="bg-bg">
        <CtaPanel
          headline="Not sure whether a program is worth your time?"
          body="execom helps founders evaluate what they actually need and whether an accelerator solves it. Most of the time, faster execution is the answer."
          primaryLabel="Assess Founder Leverage"
          primaryHref="/engage"
          secondaryLabel="Talk With execom"
          secondaryHref="/engage"
          variant="light"
        />
      </div>

      {/* ── THE CANADA FACTOR ── */}
      <section
        id="canada-factor"
        className="relative bg-surface-raised py-20 md:py-28 border-y border-border"
      >
        {/* subtle accent stripe */}
        <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-teal/40 via-teal/10 to-transparent" />

        <div className="max-w-[1200px] mx-auto px-8">
          <div className="flex gap-16">
            <div className="w-48 flex-shrink-0 hidden lg:block" />
            <div className="flex-1 min-w-0 max-w-content">
              <p className="text-teal text-nav uppercase tracking-widest mb-3">
                Regional Context
              </p>
              <h2 className="text-[1.75rem] md:text-[2rem] font-serif text-fg leading-snug mb-3">
                The Canada Factor
              </h2>
              <p className="text-[1.05rem] text-fg/60 italic mb-8">
                Why accelerators and incubators are especially overrated in
                Canada.
              </p>
              <p className="text-body text-fg/80 mb-10">
                In Canada, accelerators and incubators are often treated as
                essential founder infrastructure because the surrounding
                ecosystem is smaller, slower, and more institutionally mediated.
                That makes them visible. It does not always make them valuable.
                In many cases, founders are pushed toward programs because they
                lack faster, more direct paths to execution and capital
                discipline.
              </p>

              <AccordionSection
                variant="light"
                items={[
                  {
                    title:
                      "Ecosystem scarcity makes programs look more important than they are",
                    content: (
                      <p>
                        In smaller ecosystems, programs become central nodes by
                        default, not because they are highly effective, but
                        because alternatives are limited. A program can appear
                        essential simply because there are fewer visible pathways
                        for founders. Importance by scarcity is not the same as
                        importance by impact.
                      </p>
                    ),
                  },
                  {
                    title:
                      "Signaling matters more in Canada than it should",
                    content: (
                      <p>
                        Canadian founders often join programs because they
                        believe the badge will unlock legitimacy, introductions,
                        or investor confidence that the company has not yet
                        earned through traction alone. In tighter ecosystems,
                        this signaling instinct is stronger, and the programs
                        know it. The badge becomes a substitute for progress
                        rather than a reflection of it.
                      </p>
                    ),
                  },
                  {
                    title:
                      '"Support" often substitutes for speed',
                    content: (
                      <p>
                        Many Canadian programs provide community, workshops, and
                        process, but not the kind of execution infrastructure
                        founders actually need. A founder who needs a clean
                        incorporation, trademark protection, and a capital
                        strategy does not primarily need a Slack channel and
                        weekly office hours. Support is not the same as
                        throughput.
                      </p>
                    ),
                  },
                  {
                    title:
                      "Founders need structure more than programming",
                    content: (
                      <p>
                        What most Canadian founders lack is not guidance, it is
                        operational infrastructure. Faster company setup, cleaner
                        capital positioning, better non-dilutive execution,
                        stronger market-entry logic, and structured corporate
                        records would do more for most companies than another
                        twelve-week workshop series.
                      </p>
                    ),
                  },
                  {
                    title: "Why execom exists",
                    content: (
                      <p>
                        execom exists to give founders a faster, sharper
                        alternative to the institutional drag that often defines
                        early-stage support systems. Instead of cohort-based
                        programming, execom provides portal-based execution on
                        the tasks that actually build companies, formation,
                        filings, documents, capital, and corporate
                        infrastructure.
                      </p>
                    ),
                  },
                ]}
              />

              <div className="mt-10">
                <PullQuote>
                  In Canada, accelerators are often used to compensate for
                  ecosystem weakness. That does not mean they are the best use
                  of a founder&apos;s time.
                </PullQuote>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── WHAT ACCELERATORS GET WRONG ── */}
      <section id="what-they-get-wrong" className="dark-atmosphere py-20 md:py-28">
        <div className="max-w-[1200px] mx-auto px-8">
          <div className="flex gap-16">
            <div className="w-48 flex-shrink-0 hidden lg:block" />
            <div className="flex-1 min-w-0 max-w-content">
              <p className="section-label-light">What They Get Wrong</p>
              <p className="text-[1.1rem] text-white/50 mb-4">
                What most programs misunderstand.
              </p>
              <p className="text-body text-white/70 mb-10">
                Founders usually do not need more broad advice. They need
                specific execution on the things that actually compound:
                company formation, trademark protection, cap-table structure,
                funding strategy, SR&ED optimization, market entry, and
                distribution.
              </p>

              <AccordionSection
                variant="dark"
                items={[
                  {
                    title:
                      "They assume the founder's problem is knowledge",
                    content: (
                      <p>
                        Most programs are structured around teaching. But for
                        founders who already understand their market and product,
                        the bottleneck is not knowledge, it is execution
                        throughput. Workshops on lean methodology do not help a
                        founder who needs a clean federal incorporation filed
                        this week.
                      </p>
                    ),
                  },
                  {
                    title:
                      "They confuse network access with execution",
                    content: (
                      <p>
                        Introductions to mentors, investors, and alumni are
                        presented as core value. But introductions do not
                        close deals, build products, or structure companies.
                        Access without execution capacity is noise that feels
                        like signal.
                      </p>
                    ),
                  },
                  {
                    title:
                      "They overvalue mentorship and undervalue systems",
                    content: (
                      <p>
                        A rotating cast of mentors offering thirty-minute
                        conversations is not a system. Founders need repeatable
                        processes for the work they do over and over,
                        agreements, filings, corporate records, capital
                        planning. Systems scale. Mentorship conversations do
                        not.
                      </p>
                    ),
                  },
                  {
                    title:
                      "They push investor readiness before company readiness",
                    content: (
                      <p>
                        Many programs orient around preparing founders to raise.
                        The problem is that raising capital before the company is
                        structurally sound creates fragile outcomes. A founder
                        with a polished deck but a messy cap table, no trademark
                        protection, and unresolved corporate governance is not
                        investor-ready, they are investor-presentable, which is
                        a very different thing.
                      </p>
                    ),
                  },
                  {
                    title: "They rarely solve structural bottlenecks",
                    content: (
                      <p>
                        The hard, repeatable work of company building,
                        incorporation, shareholder agreements, IP assignments,
                        board resolutions, cap-table management, SR&ED filing,
                        is almost never what accelerators address. These are the
                        tasks that actually compound over time, and they are
                        precisely the tasks that programs leave to the founder to
                        figure out on their own.
                      </p>
                    ),
                  },
                ]}
              />
            </div>
          </div>
        </div>
      </section>

      {/* ── WHEN THEY ACTUALLY HELP ── */}
      <section id="when-they-help" className="light-section py-20 md:py-28">
        <div className="max-w-[1200px] mx-auto px-8">
          <div className="flex gap-16">
            <div className="w-48 flex-shrink-0 hidden lg:block" />
            <div className="flex-1 min-w-0 max-w-content">
              <p className="section-label">When They Actually Help</p>
              <p className="text-[1.05rem] text-fg/60 mb-4">
                When an accelerator can make sense.
              </p>
              <p className="text-body text-fg/80 mb-10">
                There are narrow circumstances where a program genuinely adds
                value. Recognizing those circumstances, and being honest about
                how rare they are, is part of making a sound decision.
              </p>

              <AccordionSection
                variant="light"
                items={[
                  {
                    title:
                      "A truly exceptional program with real network concentration",
                    content: (
                      <p>
                        A small number of programs offer network density that is
                        difficult to replicate independently, concentrated
                        investor relationships, deep alumni ecosystems, and
                        genuine follow-on capital dynamics. These programs exist,
                        and for the right founder at the right stage, they can
                        meaningfully change trajectory. But they represent a
                        fraction of the programs that market themselves this way.
                      </p>
                    ),
                  },
                  {
                    title:
                      "A founder who needs forced compression and environment",
                    content: (
                      <p>
                        Some founders benefit from externally imposed structure
                        and urgency. If a founder knows they work better under
                        compressed timelines and peer accountability, a
                        well-designed program can serve that function. The value
                        is environmental, not informational, and it only works
                        if the founder is honest about why they need it.
                      </p>
                    ),
                  },
                  {
                    title:
                      "A company entering a highly networked US venture track",
                    content: (
                      <p>
                        For Canadian founders pursuing US venture capital, a
                        well-positioned US-based program can provide
                        introductions and credibility that are otherwise
                        expensive to build from a distance. The signaling value
                        is higher in cross-border contexts where the founder
                        lacks existing network.
                      </p>
                    ),
                  },
                  {
                    title:
                      "A program with direct relevance to sector and stage",
                    content: (
                      <p>
                        Vertical-specific programs with genuine domain expertise,
                        relevant corporate partners, and sector-appropriate
                        investor networks can add value that generalist programs
                        cannot. The key indicator is whether the program&apos;s
                        resources are structurally relevant to the company or
                        merely adjacent.
                      </p>
                    ),
                  },
                  {
                    title:
                      "A founder explicitly buying signaling and understanding the tradeoff",
                    content: (
                      <p>
                        If a founder joins a program specifically for the
                        credential, and is clear-eyed about the time cost,
                        equity cost, and opportunity cost, that can be a
                        rational decision. The mistake is treating signaling as a
                        byproduct rather than the primary purchase, and
                        overestimating what the signal actually unlocks.
                      </p>
                    ),
                  },
                ]}
              />

              <p className="mt-10 text-body text-fg/70 italic border-l-2 border-blue pl-4">
                A good accelerator can be useful. The mistake is treating
                accelerators as default infrastructure.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── MID-PAGE CTA ── */}
      <div className="dark-atmosphere">
        <CtaPanel
          headline="Considering a program? Know what you are buying."
          body="Before committing time and equity to an accelerator, founders should understand what they actually need and whether a program solves it."
          primaryLabel="Assess Founder Leverage"
          primaryHref="/engage"
          secondaryLabel="Talk With execom"
          secondaryHref="/engage"
          variant="dark"
        />
      </div>

      {/* ── WHAT FOUNDERS NEED INSTEAD ── */}
      <section id="what-founders-need" className="light-section py-20 md:py-28">
        <div className="max-w-[1200px] mx-auto px-8">
          <div className="flex gap-16">
            <div className="w-48 flex-shrink-0 hidden lg:block" />
            <div className="flex-1 min-w-0 max-w-content">
              <p className="section-label">What Founders Need Instead</p>
              <p className="text-body text-fg/80 mb-10">
                Founders usually do not need another environment. They need
                fewer bottlenecks. The work that actually compounds,
                formation, records, capital strategy, filings, distribution,
                is the work that most programs leave entirely to the founder.
              </p>

              <div className="grid md:grid-cols-2 gap-5">
                {[
                  {
                    title: "Faster company formation and setup",
                    detail:
                      "Incorporation, articles, initial resolutions, and registered-agent setup executed through a structured intake, not a billable-hour conversation.",
                  },
                  {
                    title: "Clean documents and records",
                    detail:
                      "Shareholder agreements, IP assignments, NDAs, board resolutions, and corporate minute books maintained through repeatable workflows.",
                  },
                  {
                    title: "Sharper capital sequencing",
                    detail:
                      "Understanding when to pursue SR&ED, when to raise, when to pursue non-dilutive capital, and in what order, based on the company's actual position.",
                  },
                  {
                    title: "Non-dilutive funding discipline",
                    detail:
                      "SR&ED at 5%, not 15–30%. Grant triage based on probability, not hope. Capital strategy that treats non-dilutive funding as a tool, not a lifestyle.",
                  },
                  {
                    title: "Real market validation",
                    detail:
                      "Customer acquisition, revenue, and distribution progress, not pitch-competition wins or mentor approval. Markets validate companies; programs do not.",
                  },
                  {
                    title: "Distribution and market-entry execution",
                    detail:
                      "Access to channels, partners, and market-entry pathways that create real commercial traction rather than theoretical addressable-market slides.",
                  },
                ].map((item) => (
                  <div
                    key={item.title}
                    className="bg-white/80 border border-border p-6 hover:border-teal/40 transition-all duration-300"
                  >
                    <p className="text-[1.05rem] font-serif font-medium text-blue mb-2">
                      {item.title}
                    </p>
                    <p className="text-sm text-fg/60 leading-relaxed">
                      {item.detail}
                    </p>
                  </div>
                ))}
              </div>

              <div className="mt-10">
                <PullQuote>
                  Founders usually do not need another environment. They need
                  fewer bottlenecks.
                </PullQuote>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── WHY EXECOM IS DIFFERENT ── */}
      <section id="why-execom" className="dark-atmosphere py-20 md:py-28">
        <div className="max-w-[1200px] mx-auto px-8">
          <div className="flex gap-16">
            <div className="w-48 flex-shrink-0 hidden lg:block" />
            <div className="flex-1 min-w-0 max-w-content">
              <p className="section-label-light">Why execom Is Different</p>
              <p className="text-[1.1rem] text-white/50 mb-4">
                Why execom is often the better path.
              </p>
              <p className="text-body text-white/70 mb-10">
                execom provides the execution infrastructure that founders
                actually need, without the cohort cadence, generalized advice
                loops, or equity cost that come with most programs.
              </p>

              <ComparisonMatrix
                variant="dark"
                columns={[
                  { label: "execom", highlight: true },
                  { label: "Typical Accelerator" },
                ]}
                rows={[
                  {
                    dimension: "Execution",
                    values: [
                      "Portal-based workflows for formation, filings, documents, and capital",
                      "Workshops, office hours, and mentor rotations",
                    ],
                  },
                  {
                    dimension: "Speed",
                    values: [
                      "Structured intake to execution in days",
                      "8–16 week program cadence",
                    ],
                  },
                  {
                    dimension: "Cost",
                    values: [
                      "Fee-for-service; no equity required",
                      "Often 5–10% equity plus time cost",
                    ],
                  },
                  {
                    dimension: "Expert Input",
                    values: [
                      "Applied selectively where it changes outcomes",
                      "Generalized across cohort regardless of need",
                    ],
                  },
                  {
                    dimension: "Output",
                    values: [
                      "Clean corporate records, filed documents, structured capital strategy",
                      "Pitch deck, demo-day presentation, network introductions",
                    ],
                  },
                  {
                    dimension: "Focus",
                    values: [
                      "Company readiness: structure, records, capital, filings",
                      "Investor readiness: narrative, deck, presentation",
                    ],
                  },
                ]}
              />

              <div className="mt-10">
                <PullQuote variant="dark">
                  For most founders, speed plus structure is more valuable than
                  a cohort.
                </PullQuote>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FOUNDER MISTAKES ── */}
      <section id="founder-mistakes" className="light-section py-20 md:py-28">
        <div className="max-w-[1200px] mx-auto px-8">
          <div className="flex gap-16">
            <div className="w-48 flex-shrink-0 hidden lg:block" />
            <div className="flex-1 min-w-0 max-w-content">
              <p className="section-label">Founder Mistakes</p>
              <p className="text-body text-fg/80 mb-10">
                Common errors founders make when evaluating accelerators and
                incubators.
              </p>

              <div className="grid md:grid-cols-2 gap-4">
                {[
                  "Joining for the badge rather than the problem solved",
                  "Confusing a network with traction",
                  "Delaying operational setup while \"getting ready\"",
                  "Letting program cadence replace company cadence",
                  "Optimizing for investor optics too early",
                  "Assuming mentorship is execution",
                  "Treating community as leverage",
                  "Not asking what the company would look like six months later without the program",
                ].map((mistake, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-3 p-4 bg-white/60 border border-border rounded-sm"
                  >
                    <span className="flex-shrink-0 w-6 h-6 flex items-center justify-center text-[11px] font-semibold text-blue bg-blue/10 rounded-full mt-0.5">
                      {i + 1}
                    </span>
                    <p className="text-sm text-fg/70 leading-relaxed">
                      {mistake}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section id="faq" className="dark-atmosphere py-20 md:py-28">
        <div className="max-w-[1200px] mx-auto px-8">
          <div className="flex gap-16">
            <div className="w-48 flex-shrink-0 hidden lg:block" />
            <div className="flex-1 min-w-0 max-w-content">
              <p className="section-label-light">FAQ</p>

              <AccordionSection
                variant="dark"
                items={[
                  {
                    title: "Are accelerators worth it for startups?",
                    content: (
                      <p>
                        For most startups, no. The time cost, equity cost, and
                        opportunity cost exceed the value received. A small
                        number of genuinely exceptional programs can be worth it
                        in narrow circumstances, but the default answer should be
                        skepticism, not enthusiasm.
                      </p>
                    ),
                  },
                  {
                    title: "When does an accelerator actually help?",
                    content: (
                      <p>
                        When the program offers concentrated network value that
                        the founder cannot build independently, when the founder
                        genuinely needs externally imposed structure, or when the
                        signaling value is high enough to justify the cost. These
                        situations are less common than the ecosystem suggests.
                      </p>
                    ),
                  },
                  {
                    title:
                      "Are incubators different from accelerators in practice?",
                    content: (
                      <p>
                        The labels are used loosely. Incubators tend to be longer
                        and less structured; accelerators tend to be shorter and
                        more compressed. In practice, many of the same
                        criticisms apply to both: generalized advice,
                        performative activity, limited structural impact, and
                        high opportunity cost.
                      </p>
                    ),
                  },
                  {
                    title:
                      "Why are these programs especially overrated in Canada?",
                    content: (
                      <p>
                        Canada&apos;s smaller ecosystem makes programs more
                        visible and harder to bypass. Founders are pushed toward
                        them because faster alternatives are less available.
                        Institutional funding often flows through programs rather
                        than directly to companies, which reinforces their
                        centrality without necessarily proving their
                        effectiveness.
                      </p>
                    ),
                  },
                  {
                    title: "What do founders usually need instead?",
                    content: (
                      <p>
                        Faster company formation, clean corporate documents,
                        sharper capital sequencing, non-dilutive funding
                        discipline, real market validation, and distribution
                        execution. These are operational problems, not
                        informational ones, and they are rarely addressed by
                        program-based models.
                      </p>
                    ),
                  },
                  {
                    title:
                      "Can an accelerator hurt more than it helps?",
                    content: (
                      <p>
                        Yes. A program that absorbs founder attention, imposes
                        the wrong cadence, encourages premature fundraising, or
                        creates false confidence can actively slow a company
                        down. The cost is not always visible because the founder
                        feels busy throughout.
                      </p>
                    ),
                  },
                  {
                    title: "Is the real value just signaling?",
                    content: (
                      <p>
                        For many programs, yes. The operational and educational
                        value is modest; the primary benefit is the credential.
                        That can be a rational purchase if the founder
                        understands the tradeoff and the signal is strong enough
                        to justify the cost. For most programs, it is not.
                      </p>
                    ),
                  },
                  {
                    title: "What should I do before joining one?",
                    content: (
                      <p>
                        Ask what specific problem the program solves that you
                        cannot solve faster independently. If the answer is
                        vague, community, mentorship, exposure, you likely do
                        not need the program. If the answer is specific and
                        structural, evaluate the cost honestly against
                        alternatives.
                      </p>
                    ),
                  },
                ]}
              />
            </div>
          </div>
        </div>
      </section>

      {/* ── ASSESSMENT / CTA ── */}
      <section id="assessment" className="light-section py-20 md:py-24">
        <div className="max-w-[1200px] mx-auto px-8">
          <div className="flex gap-16">
            <div className="w-48 flex-shrink-0 hidden lg:block" />
            <div className="flex-1 min-w-0 max-w-content text-center">
              <h2 className="text-[1.5rem] md:text-[1.75rem] font-serif text-fg leading-snug mb-6">
                Do not outsource early-stage judgment to a program.
              </h2>
              <p className="text-body text-fg/60 mb-10 max-w-[540px] mx-auto">
                Most founders do not need another layer of programming. They
                need faster execution, cleaner structure, and stronger
                leverage. execom helps founders move directly on the work that
                actually compounds.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <a
                  href="/engage"
                  className="btn-premium"
                >
                  Assess Founder Leverage
                </a>
                <a
                  href="/engage"
                  className="inline-flex items-center px-7 py-3 text-[13px] font-semibold uppercase tracking-widest border border-border text-fg/60 hover:border-blue hover:text-blue transition-colors duration-200 rounded-sm"
                >
                  Engage execom
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
