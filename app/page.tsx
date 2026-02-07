import Link from "next/link"

export default function Home() {
  return (
    <>
      {/* Hero */}
      <section className="mb-24 pt-8">
        <p className="hero-text">
          We deal in structural decisions — the kind that are easy to defer and
          expensive to reverse.
        </p>
        <div className="hero-rule" />
      </section>

      {/* When this matters */}
      <section className="mb-20">
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
            Your personal downside has scaled with the company. Your upside has
            not kept pace.
          </p>
        </div>
      </section>

      {/* How this works */}
      <section className="mb-20">
        <p className="section-label">How this works</p>
        <div className="space-y-4 text-body text-fg/80">
          <p>
            Execom works directly with founders. Not their teams, not their
            boards, not their lawyers — though those conversations often follow.
          </p>
          <p>
            Engagements are short, specific, and focused on a small number of
            high-leverage structural questions. There are no retainers, no
            recurring calls, no decks.
          </p>
          <p>
            The output is a decision — or a clearer understanding of why a
            decision is being avoided.
          </p>
        </div>
      </section>

      {/* Case fragments */}
      <section className="mb-20">
        <p className="section-label">Situations we have worked on</p>
        <div className="space-y-6">
          <div className="case-fragment">
            <p className="text-sm text-fg/70">
              A cross-border SaaS company restructured its IP holding before a
              secondary transaction. The original setup would have created a
              seven-figure tax event that no one had modeled.
            </p>
          </div>
          <div className="case-fragment">
            <p className="text-sm text-fg/70">
              A founder discovered her cap table made a strategic acquisition
              structurally impossible. The fix took three weeks. Finding the
              problem took longer.
            </p>
          </div>
          <div className="case-fragment">
            <p className="text-sm text-fg/70">
              Two co-founders with divergent risk tolerances were heading toward
              a split. The issue was not the relationship. It was the entity
              design.
            </p>
          </div>
          <div className="case-fragment">
            <p className="text-sm text-fg/70">
              A company raising its Series B realized the Canadian parent entity
              was creating unnecessary friction with US investors. A single
              restructuring removed the obstacle entirely.
            </p>
          </div>
          <div className="case-fragment">
            <p className="text-sm text-fg/70">
              A founder carrying significant personal guarantees tied to company
              debt needed to decouple before a leadership transition. The
              guarantees had been invisible to the board.
            </p>
          </div>
        </div>
      </section>

      {/* Contact CTA */}
      <section>
        <div className="border-t border-border pt-10">
          <p className="text-body text-fg/70">
            If something here is relevant to a decision you are currently
            facing, you can reach us on the{" "}
            <Link
              href="/contact"
              className="text-blue underline underline-offset-4 decoration-teal/30 hover:decoration-teal transition-colors"
            >
              contact page
            </Link>
            .
          </p>
          <p className="text-sm text-muted mt-3">
            We respond to specifics. Vague inquiries go unanswered.
          </p>
        </div>
      </section>
    </>
  )
}
