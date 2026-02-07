import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "How We Engage - execom",
}

export default function Engage() {
  return (
    <>
      {/* ── HERO ── */}
      <section className="relative bg-[#0d1b2a] hero-pattern overflow-hidden">
        <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-[#195E8E]/15 to-transparent" />
        <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-teal/40 via-teal/10 to-transparent" />

        <div className="relative max-w-[1200px] mx-auto px-8 py-28 md:py-36">
          <div className="max-w-[640px]">
            <p className="text-teal text-nav uppercase tracking-widest mb-6">
              How this works
            </p>
            <h1 className="text-[2.5rem] md:text-[3.25rem] leading-[1.15] font-serif text-white mb-8">
              Engagements are built around a specific structural question. Not a
              quarterly review. Not an ongoing relationship.
            </h1>
            <p className="text-lg text-white/50 leading-relaxed max-w-[520px]">
              Most last days or weeks, not months. The intensity is high. The
              scope is narrow.
            </p>
            <div className="mt-10 w-16 h-0.5 bg-teal" />
          </div>
        </div>
      </section>

      {/* ── WHAT THIS LOOKS LIKE ── */}
      <section className="bg-bg py-20 md:py-28">
        <div className="max-w-content mx-auto px-8">
          <p className="section-label">What this looks like</p>
          <div className="space-y-4 text-body text-fg/80">
            <p>
              execom examines how a company is configured. entities, ownership, IP, capital, personal exposure. We identify where the structure is creating risk, friction, or constraint that the founder may not yet see.
            </p>
            <p>
              The output is a decision. Sometimes a sequence of decisions. Never
              a report for its own sake.
            </p>
            <p>
              Decisions are the deliverable. If a decision leads to legal, tax, or financial execution work, execom can point to the right people. But the execution itself is not what we do.
            </p>
          </div>
        </div>
      </section>

      {/* ── WHAT WE DO NOT DO ── */}
      <section className="bg-surface-raised py-20 md:py-28">
        <div className="max-w-[1000px] mx-auto px-8">
          <p className="section-label">What we do not do</p>
          <div className="grid md:grid-cols-2 gap-5 mt-10">
            <div className="case-card">
              <p className="text-sm text-fg/70">
                We do not write business plans.
              </p>
            </div>
            <div className="case-card">
              <p className="text-sm text-fg/70">
                We do not build financial models.
              </p>
            </div>
            <div className="case-card">
              <p className="text-sm text-fg/70">
                We do not prepare pitch decks or investor materials.
              </p>
            </div>
            <div className="case-card">
              <p className="text-sm text-fg/70">
                We do not manage fundraising processes.
              </p>
            </div>
            <div className="case-card">
              <p className="text-sm text-fg/70">
                We do not provide ongoing operational support.
              </p>
            </div>
            <div className="case-card">
              <p className="text-sm text-fg/70">
                We do not work with teams in the absence of the founder.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── CLOSING ── */}
      <section className="bg-[#0d1b2a] py-20 md:py-24">
        <div className="max-w-content mx-auto px-8 text-center">
          <p className="text-white/90 font-medium text-body">
            If what you need is execution support, you are in the wrong place.
          </p>
          <p className="text-white/40 text-sm mt-4">
            If what you need is clarity on a structural decision, we may be able
            to help.
          </p>
        </div>
      </section>
    </>
  )
}
