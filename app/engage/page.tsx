import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "How We Engage — Execom",
}

export default function Engage() {
  return (
    <>
      <section className="mb-20 pt-8">
        <p className="hero-text">
          Engagements are built around a specific structural question or
          decision. Not a quarterly review. Not an ongoing relationship.
        </p>
        <div className="hero-rule" />
      </section>

      <section className="mb-20">
        <div className="space-y-4 text-body text-fg/80">
          <p>
            Most last days or weeks, not months. The intensity is high. The
            scope is narrow.
          </p>
        </div>
      </section>

      <section className="mb-20">
        <p className="section-label">What this looks like</p>
        <div className="space-y-4 text-body text-fg/80">
          <p>
            Execom examines how a company is configured — entities, ownership,
            IP, capital, personal exposure — and identifies where the structure
            is creating risk, friction, or constraint that the founder may not
            yet see.
          </p>
          <p>
            The output is a decision. Sometimes a sequence of decisions. Never
            a report for its own sake.
          </p>
          <p>
            Decisions are the deliverable. If a decision leads to legal, tax,
            or financial execution work, Execom can point to the right people.
            But the execution itself is not what we do.
          </p>
        </div>
      </section>

      <section>
        <p className="section-label">What we do not do</p>
        <div className="bg-surface-raised border border-border rounded-sm px-6 py-6 space-y-3">
          <p className="text-sm text-fg/60">We do not write business plans.</p>
          <p className="text-sm text-fg/60">
            We do not build financial models.
          </p>
          <p className="text-sm text-fg/60">
            We do not prepare pitch decks or investor materials.
          </p>
          <p className="text-sm text-fg/60">
            We do not manage fundraising processes.
          </p>
          <p className="text-sm text-fg/60">
            We do not provide ongoing operational support.
          </p>
          <p className="text-sm text-fg/60">
            We do not work with teams in the absence of the founder.
          </p>
        </div>
        <p className="text-body text-fg/80 mt-8">
          If what you need is execution support, you are in the wrong place.
        </p>
      </section>
    </>
  )
}
