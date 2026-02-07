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

      {/* ── BRETT BILON BIO ── */}
      <section className="bg-bg py-20 md:py-28">
        <div className="max-w-[1000px] mx-auto px-8">
          <div className="flex flex-col md:flex-row gap-10 md:gap-16 items-start">
            {/* Photo */}
            <div className="flex-shrink-0 w-full md:w-[280px]">
              <img
                src="/brett-bilon.jpg"
                alt="Brett Bilon"
                className="w-full rounded-lg shadow-lg object-cover aspect-[3/4]"
              />
            </div>

            {/* Bio content */}
            <div className="flex-1 min-w-0">
              <p className="text-teal text-nav uppercase tracking-widest mb-3">
                Founder &amp; CEO
              </p>
              <h2 className="text-[1.8rem] md:text-[2.2rem] leading-tight font-serif text-fg mb-6">
                Brett Bilon
              </h2>
              <div className="space-y-4 text-body text-fg/80">
                <p>
                  Brett has founded and scaled ventures across consumer products,
                  beauty and personal care, digital technology, health and
                  wellness, nanotech, and outdoor recreation. The range is
                  deliberate. Every industry teaches a different version of
                  the same structural problems.
                </p>
                <p>
                  He built and launched Plume, a global beauty brand carried by
                  Nordstrom, Sephora, Anthropologie, REVOLVE, and Loblaws. He
                  raised capital across the full spectrum&mdash;from consumer
                  crowdfunding to institutional debt&mdash;and navigated the
                  regulatory, IP, and distribution complexity that comes with
                  scaling a physical product internationally.
                </p>
                <p>
                  Before execom, Brett spent time in enterprise sales and
                  strategic partnerships at Lexmark, Iron Mountain, and DATA
                  Communications Management. He also founded BMB Photographics,
                  a luxury architectural photography firm whose work appeared
                  in Architectural Digest.
                </p>
                <p>
                  He holds a Bachelor of Commerce in Entrepreneurship and
                  Innovation from the Haskayne School of Business at the
                  University of Calgary.
                </p>
                <p className="text-fg font-medium">
                  Most of what execom knows came from building things that
                  were hard to build, in markets that did not cooperate, with
                  structures that had to be rebuilt more than once.
                </p>
              </div>
              <div className="mt-8 flex gap-4">
                <a
                  href="https://ca.linkedin.com/in/brettbilon"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-sm font-semibold text-teal hover:text-teal/80 transition"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                  LinkedIn
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
