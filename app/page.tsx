import Link from "next/link"

const PARTNER_LOGOS = [
  "BLG",
  "Council of Canadian Innovators",
  "IP Institute of Canada",
  "BlueIron",
  "Matregenix",
  "Max Planck Institute",
  "University of Calgary",
  "Innovation Asset Collective",
]

function LogoMarquee() {
  const logos = [...PARTNER_LOGOS, ...PARTNER_LOGOS]
  return (
    <section className="bg-white border-y border-border py-10 overflow-hidden">
      <div className="marquee-track">
        {logos.map((name, i) => (
          <div
            key={i}
            className="flex-shrink-0 px-10 flex items-center justify-center"
          >
            <span className="text-sm font-semibold text-fg/25 uppercase tracking-widest whitespace-nowrap">
              {name}
            </span>
          </div>
        ))}
      </div>
    </section>
  )
}

export default function Home() {
  return (
    <>
      {/* ── HERO ── */}
      <section className="relative bg-[#0d1b2a] hero-pattern overflow-hidden">
        {/* Gradient accent */}
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-[#195E8E]/20 to-transparent" />
        <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-teal/40 via-teal/10 to-transparent" />

        <div className="relative max-w-[1200px] mx-auto px-8 py-28 md:py-36">
          <div className="max-w-[640px]">
            <p className="text-teal text-nav uppercase tracking-widest mb-6">
              Structural decisions for founders
            </p>
            <h1 className="text-[2.5rem] md:text-[3.25rem] leading-[1.15] font-serif text-white mb-8">
              We deal in the decisions that are easy to defer and expensive to
              reverse.
            </h1>
            <p className="text-lg text-white/50 leading-relaxed max-w-[520px]">
              Capital structure. Entity design. IP ownership. Personal exposure.
              The architecture underneath the business.
            </p>
            <div className="mt-10 w-16 h-0.5 bg-teal" />
          </div>
        </div>
      </section>

      {/* ── PARTNER LOGOS ── */}
      <LogoMarquee />

      {/* ── WHEN THIS MATTERS ── */}
      <section className="bg-bg py-20 md:py-28">
        <div className="max-w-content mx-auto px-8">
          <p className="section-label">When this matters</p>
          <div className="space-y-4 text-body text-fg/80">
            <p>
              Your company has outgrown its original structure, but nobody has
              rebuilt the foundation.
            </p>
            <p>
              You are raising or deploying capital, and the terms do not reflect
              the actual risk profile.
            </p>
            <p>
              You operate across borders. The tax, IP, and liability seams are
              starting to show.
            </p>
            <p>
              Ownership of your most valuable intellectual property sits in the
              wrong entity, and moving it has consequences.
            </p>
            <p>
              Your personal downside has scaled with the company. Your upside
              has not kept pace.
            </p>
          </div>
        </div>
      </section>

      {/* ── HOW THIS WORKS ── */}
      <section className="bg-[#0d1b2a] py-20 md:py-28">
        <div className="max-w-content mx-auto px-8">
          <p className="section-label-light">How this works</p>
          <div className="space-y-4 text-body text-white/70">
            <p>
              Execom works directly with founders. Not their teams, not their
              boards, not their lawyers — though those conversations often
              follow.
            </p>
            <p>
              Engagements are short, specific, and focused on a small number of
              high-leverage structural questions. There are no retainers, no
              recurring calls, no decks.
            </p>
            <p className="text-white/90 font-medium">
              The output is a decision — or a clearer understanding of why a
              decision is being avoided.
            </p>
          </div>
        </div>
      </section>

      {/* ── CASE FRAGMENTS ── */}
      <section className="bg-surface-raised py-20 md:py-28">
        <div className="max-w-[1000px] mx-auto px-8">
          <p className="section-label">Situations we have worked on</p>
          <div className="grid md:grid-cols-2 gap-5 mt-10">
            <div className="case-card">
              <p className="text-sm text-fg/70">
                A cross-border SaaS company restructured its IP holding before a
                secondary transaction. The original setup would have created a
                seven-figure tax event that no one had modeled.
              </p>
            </div>
            <div className="case-card">
              <p className="text-sm text-fg/70">
                A founder discovered her cap table made a strategic acquisition
                structurally impossible. The fix took three weeks. Finding the
                problem took longer.
              </p>
            </div>
            <div className="case-card">
              <p className="text-sm text-fg/70">
                Two co-founders with divergent risk tolerances were heading
                toward a split. The issue was not the relationship. It was the
                entity design.
              </p>
            </div>
            <div className="case-card">
              <p className="text-sm text-fg/70">
                A company raising its Series B realized the Canadian parent
                entity was creating unnecessary friction with US investors. A
                single restructuring removed the obstacle entirely.
              </p>
            </div>
            <div className="case-card md:col-span-2">
              <p className="text-sm text-fg/70">
                A founder carrying significant personal guarantees tied to
                company debt needed to decouple before a leadership transition.
                The guarantees had been invisible to the board.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── CONTACT CTA ── */}
      <section className="bg-[#0d1b2a] py-20 md:py-24">
        <div className="max-w-content mx-auto px-8 text-center">
          <p className="text-white/50 text-body mb-4">
            If something here is relevant to a decision you are currently
            facing.
          </p>
          <Link
            href="/contact"
            className="inline-block border border-teal/40 text-teal text-nav uppercase tracking-widest px-8 py-4 hover:bg-teal/10 hover:border-teal transition-all"
          >
            Reach out
          </Link>
          <p className="text-caption text-white/20 mt-6 uppercase tracking-widest">
            We respond to specifics. Vague inquiries go unanswered.
          </p>
        </div>
      </section>
    </>
  )
}
