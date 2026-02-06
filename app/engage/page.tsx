import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "How We Engage — Execom",
}

function Section({
  children,
  className = "",
}: {
  children: React.ReactNode
  className?: string
}) {
  return <section className={`mb-20 ${className}`}>{children}</section>
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-nav uppercase tracking-widest text-muted mb-8">
      {children}
    </p>
  )
}

export default function Engage() {
  return (
    <>
      <Section>
        <div className="space-y-5 text-body text-fg/80">
          <p>
            Engagements are built around a specific structural question or
            decision. Not a quarterly review. Not an ongoing relationship. Not a
            retainer.
          </p>
          <p>
            Most last days or weeks, not months. The intensity is high. The
            scope is narrow.
          </p>
        </div>
      </Section>

      <Section>
        <SectionLabel>What this looks like</SectionLabel>
        <div className="space-y-5 text-body text-fg/80">
          <p>
            Execom examines how a company is configured — entities, ownership,
            IP, capital, personal exposure — and identifies where the structure
            is creating risk, friction, or constraint that the founder may not
            yet see.
          </p>
          <p>
            The output is a decision. Sometimes a sequence of decisions. Never a
            report for its own sake.
          </p>
          <p>
            Decisions are the deliverable. If a decision leads to legal, tax, or
            financial execution work, Execom can point to the right people. But
            the execution itself is not what we do.
          </p>
        </div>
      </Section>

      <Section className="mb-0">
        <SectionLabel>What we do not do</SectionLabel>
        <div className="space-y-4 text-body text-fg/60">
          <p>We do not write business plans.</p>
          <p>We do not build financial models.</p>
          <p>We do not prepare pitch decks or investor materials.</p>
          <p>We do not manage fundraising processes.</p>
          <p>We do not provide ongoing operational support.</p>
          <p>We do not work with teams in the absence of the founder.</p>
          <p className="text-fg/80 pt-4">
            If what you need is execution support, you are in the wrong place.
          </p>
        </div>
      </Section>
    </>
  )
}
