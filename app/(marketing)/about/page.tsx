import type { Metadata } from "next"
import Link from "next/link"

export const metadata: Metadata = {
  title: "About — execom",
  description:
    "execom exists to help founders make structural decisions about capital, ownership, and growth deliberately — before the cost of getting them wrong compounds.",
}

export default function About() {
  return (
    <>
      {/* ── HERO ── */}
      <section className="relative bg-[#0d1b2a] hero-pattern overflow-hidden">
        <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-[#195E8E]/15 to-transparent" />
        <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-teal/40 via-teal/10 to-transparent" />

        <div className="relative max-w-[1200px] mx-auto px-8 py-28 md:py-36">
          <div className="max-w-[680px]">
            <p className="text-teal text-nav uppercase tracking-widest mb-6">
              About execom
            </p>

            <h1 className="text-[2.5rem] md:text-[3.25rem] leading-[1.15] font-serif text-white mb-8">
              Structure. Ownership. Capital. Risk.
            </h1>

            <p className="text-lg text-white/50 leading-relaxed max-w-[540px]">
              execom exists to help founders make the structural decisions that
              shape a company&apos;s trajectory — before the cost of getting them
              wrong compounds.
            </p>

            <div className="mt-10 w-16 h-0.5 bg-teal" />
          </div>
        </div>
      </section>

      {/* ── WHY EXECOM EXISTS ── */}
      <section className="bg-bg py-20 md:py-28">
        <div className="max-w-content mx-auto px-8">
          <p className="section-label">Why execom exists</p>
          <div className="space-y-6 text-body text-fg/80">
            <p>
              Most companies do not fail because the underlying idea was weak.
              They fail because the systems surrounding capital, partnerships,
              and growth were structured poorly from the beginning. A viable
              company can still produce a poor outcome if ownership is diluted
              too early, if capital is taken under the wrong incentives, or if
              expansion and distribution are pursued before the business has
              real leverage.
            </p>
            <p className="text-fg font-semibold text-lg">
              execom exists to help founders make those structural decisions
              deliberately.
            </p>
          </div>
        </div>
      </section>

      {/* ── THE PATTERN ── */}
      <section className="bg-[#0d1b2a] py-20 md:py-28">
        <div className="max-w-content mx-auto px-8">
          <p className="section-label-light">The pattern most founders encounter</p>
          <div className="space-y-6 text-body text-white/70">
            <p>
              Across companies and sectors, the same mistakes appear repeatedly.
              Founders raise capital earlier than necessary, accept terms that
              weaken their position, pursue grants that distract from building the
              business itself, or expand into new markets before distribution and
              operational leverage are established.
            </p>
            <p>
              None of these errors are unusual. In many cases they are encouraged
              by the incentives of the surrounding ecosystem, where consultants are
              paid for applications and intermediaries are paid when capital changes
              hands. For founders, however, the cost of those decisions compounds
              over years.
            </p>
          </div>
        </div>
      </section>

      {/* ── WHAT REPETITION TEACHES ── */}
      <section className="bg-bg py-20 md:py-28">
        <div className="max-w-content mx-auto px-8">
          <p className="section-label">What repetition teaches</p>
          <div className="space-y-6 text-body text-fg/80">
            <p>
              When a founder builds a single company, every major decision feels
              unprecedented. Seen across many companies, however, patterns emerge.
              Some opportunities that appear attractive weaken a company&apos;s
              position over time, while some decisions that feel urgent turn out
              to be unnecessary.
            </p>
            <p>
              Sometimes raising capital is the right step. Often the stronger move
              is delaying it until the business has achieved the leverage necessary
              to dictate better terms. The difference rarely lies in the idea
              itself; it lies in timing, structure, and incentives.
            </p>
          </div>
        </div>
      </section>

      {/* ── THE CANADA FACTOR ── */}
      <section className="bg-[#0d1b2a] py-20 md:py-28 relative">
        <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-teal/40 via-teal/20 to-transparent" />
        <div className="max-w-content mx-auto px-8">
          <p className="text-teal text-nav uppercase tracking-widest mb-3">
            Signature Section
          </p>
          <h2 className="text-[2rem] md:text-[2.5rem] font-serif text-white leading-tight mb-6">
            The Canada Factor
          </h2>
          <div className="space-y-6 text-body text-white/70">
            <p>
              Building companies in Canada introduces a set of structural
              realities that are frequently underestimated. Venture capital pools
              are smaller, fundraising cycles are slower, and domestic markets
              offer less immediate scale. Companies therefore operate longer
              before institutional capital becomes available.
            </p>
            <p>
              In this environment, capital efficiency, ownership discipline, and
              the intelligent use of programs such as SR&ED often matter more than
              headline fundraising milestones.
            </p>
            <p className="text-white/90 font-medium">
              execom helps founders design strategies that reflect these realities
              rather than assumptions borrowed from larger venture ecosystems.
            </p>
          </div>
        </div>
      </section>

      {/* ── HOW EXECOM WORKS ── */}
      <section className="bg-bg py-20 md:py-28">
        <div className="max-w-content mx-auto px-8">
          <p className="section-label">How execom works</p>
          <div className="space-y-6 text-body text-fg/80">
            <p>
              execom does not operate as a capital broker, a grant-writing service,
              or a conventional consulting firm. The work focuses on the structural
              decisions that shape a company&apos;s trajectory: how capital is
              sequenced, how ownership is preserved, how markets are entered, and
              how distribution is built in a way that compounds rather than
              fragments leverage.
            </p>
            <p className="text-fg font-semibold text-lg">
              Because those decisions ultimately belong to founders, execom works
              directly with them rather than through committees or intermediaries.
            </p>
            <p>
              execom is not an accelerator, an incubator, or a cohort-based
              program. It is execution infrastructure.{" "}
              <Link
                href="/accelerators-incubators"
                className="text-blue hover:text-teal transition-colors"
              >
                Most founders do not need a program — they need faster
                execution →
              </Link>
            </p>
          </div>
        </div>
      </section>

      {/* ── BRETT BILON BIO ── */}
      <section className="bg-[#0d1b2a] py-20 md:py-28">
        <div className="max-w-[900px] mx-auto px-8">
          {/* Photo — full-width landscape */}
          <div className="mb-10 md:mb-14">
            <img
              src="/brett-bilon.jpg"
              alt="Brett Bilon"
              className="w-full rounded-lg shadow-lg object-cover"
            />
          </div>

          {/* Name & title */}
          <p className="text-teal text-nav uppercase tracking-widest mb-3">
            Founder &amp; CEO
          </p>
          <h2 className="text-[1.8rem] md:text-[2.2rem] leading-tight font-serif text-white mb-8">
            Brett Bilon
          </h2>

          {/* Bio — two-column on desktop for readability */}
          <div className="columns-1 md:columns-2 gap-12 space-y-4 text-body text-white/70">
            <p>
              execom was founded by Brett Bilon, whose work across product
              development, technical R&D, and company building led to a consistent
              observation: promising companies are frequently undermined not by
              product failure but by avoidable structural mistakes in capital
              formation, market expansion, and distribution strategy.
            </p>
            <p>
              Brett has founded and scaled ventures across consumer products,
              beauty and personal care, digital technology, health and wellness,
              nanotech, and outdoor recreation. The range is deliberate. Every
              industry teaches a different version of the same structural problems.
            </p>
            <p>
              He built and launched Plume, a global beauty brand carried by
              Nordstrom, Sephora, Anthropologie, REVOLVE, and Loblaws. He raised
              capital across the full spectrum — from consumer crowdfunding to
              institutional debt — and navigated the regulatory, IP, and
              distribution complexity that comes with scaling a physical product
              internationally.
            </p>
            <p>
              Before execom, Brett spent time in enterprise sales and strategic
              partnerships at Lexmark, Iron Mountain, and DATA Communications
              Management. He also founded BMB Photographics, a luxury
              architectural photography firm whose work appeared in
              Architectural Digest.
            </p>
            <p>
              He holds a Bachelor of Commerce in Entrepreneurship and Innovation
              from the Haskayne School of Business at the University of Calgary.
            </p>
            <p className="text-white/90 font-medium">
              Most of what execom understands about those mistakes was expensive
              to learn. The purpose of the firm is to transfer that pattern
              recognition to founders before those costs compound.
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
      </section>

      {/* ── THE OBJECTIVE ── */}
      <section className="bg-bg py-20 md:py-28">
        <div className="max-w-content mx-auto px-8 text-center">
          <h3 className="text-[1.5rem] md:text-[1.75rem] font-serif leading-snug text-fg mb-6">
            The goal is not simply to facilitate access to capital. It is to
            establish and retain leverage.
          </h3>
          <p className="text-body leading-relaxed max-w-[540px] mx-auto text-fg/60 mb-10">
            When capital, distribution, and growth are structured carefully — and
            early — founders preserve ownership and strategic freedom. When they
            are not, the consequences tend to follow the company in costly ways
            for years to come.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/engage"
              className="inline-flex items-center px-7 py-3 text-[13px] font-semibold uppercase tracking-widest bg-teal text-[#0d1b2a] hover:bg-teal-dark transition-colors duration-200 rounded-sm"
            >
              Engage Execom
            </Link>
            <Link
              href="/sred/"
              className="inline-flex items-center px-7 py-3 text-[13px] font-semibold uppercase tracking-widest border border-border text-fg/60 hover:border-blue hover:text-blue transition-colors duration-200 rounded-sm"
            >
              Explore SR&ED
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
