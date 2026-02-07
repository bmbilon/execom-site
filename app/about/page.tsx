import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "About - execom",
}

export default function About() {
  return (
    <>
      {/* ── HERO ── */}
      <section className="relative bg-[#0d1b2a] hero-pattern overflow-hidden">
        <div className="absolute top-0 left-0 w-1/3 h-full bg-gradient-to-r from-[#195E8E]/15 to-transparent" />
        <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-teal/40 via-teal/10 to-transparent" />

        <div className="relative max-w-[1200px] mx-auto px-8 py-28 md:py-36">
          <div className="max-w-[640px]">
            <p className="text-teal text-nav uppercase tracking-widest mb-6">
              About
            </p>
            <h1 className="text-[2.5rem] md:text-[3.25rem] leading-[1.15] font-serif text-white mb-8">
              The team you bring in before going full-steam on due diligence.
            </h1>
            <div className="mt-10 w-16 h-0.5 bg-teal" />
          </div>
        </div>
      </section>

      {/* ── THE PATTERN ── */}
      <section className="bg-bg py-20 md:py-28">
        <div className="max-w-content mx-auto px-8">
          <div className="space-y-4 text-body text-fg/80">
            <p>
              Founders who built substantial businesses but never revisited the
              legal and financial scaffolding they set up in year one. Structures
              that worked at $2M in revenue but created compounding problems at
              $20M. Capital decisions that traded long-term flexibility for
              short-term speed.
            </p>
            <p className="text-fg font-semibold text-lg">
              These are not rare mistakes. They are the default.
            </p>
          </div>
        </div>
      </section>

      {/* ── WHAT REPETITION TEACHES ── */}
      <section className="bg-[#0d1b2a] py-20 md:py-28">
        <div className="max-w-content mx-auto px-8">
          <p className="section-label-light">What repetition teaches</p>
          <div className="space-y-4 text-body text-white/70">
            <p>
              Most structural damage does not announce itself. It surfaces during
              a transaction, a dispute, or a tax filing. Usually when the cost
              of correction is highest and the leverage is lowest.
            </p>
            <p className="text-white/90 font-medium">
              The lesson, learned repeatedly: the architecture underneath a
              business matters more than most founders believe, and it matters
              earlier than they expect.
            </p>
          </div>
        </div>
      </section>

      {/* ── WHAT GETTING IT WRONG TEACHES ── */}
      <section className="bg-surface-raised py-20 md:py-28">
        <div className="max-w-content mx-auto px-8">
          <p className="section-label">What getting it wrong teaches</p>
          <div className="space-y-4 text-body text-fg/80">
            <p>
              We have built structures that looked clean on paper and collapsed
              under regulatory scrutiny. We have seen capital arrangements that
              aligned incentives on day one and created conflicts by year three.
              We have filed IP assignments that were technically valid but
              practically unenforceable across jurisdictions.
            </p>
            <p>
              Most of what execom knows was expensive to learn.
            </p>
          </div>
        </div>
      </section>

      {/* ── WHY FOUNDERS ONLY ── */}
      <section className="bg-[#0d1b2a] py-20 md:py-24">
        <div className="max-w-content mx-auto px-8">
          <p className="section-label-light">Why founders only</p>
          <div className="space-y-4 text-body text-white/70">
            <p>
              The person who carries the consequences of a structural decision
              should be the one making it. With full context, not a summary
              passed through three layers of management.
            </p>
            <p className="text-white/90 font-medium">
              execom works with founders directly because that is where the
              actual decisions happen. Everything else is downstream.
            </p>
          </div>
        </div>
      </section>
    </>
  )
}
