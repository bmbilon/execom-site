import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "About — Execom",
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

export default function About() {
  return (
    <>
      <Section>
        <div className="space-y-5 text-body text-fg/80">
          <p>
            Execom came from noticing the same failure modes across otherwise
            different companies.
          </p>
          <p>
            Founders who built substantial businesses but never revisited the
            legal and financial scaffolding they set up in year one. Structures
            that worked at $2M in revenue but created compounding problems at
            $20M. Capital decisions that traded long-term flexibility for
            short-term speed.
          </p>
          <p>These are not rare mistakes. They are the default.</p>
        </div>
      </Section>

      <Section>
        <SectionLabel>What repetition teaches</SectionLabel>
        <div className="space-y-5 text-body text-fg/80">
          <p>
            Most structural damage does not announce itself. It surfaces during
            a transaction, a dispute, or a tax filing — moments when the cost of
            correction is highest and the leverage is lowest.
          </p>
          <p>
            The lesson, learned repeatedly: the architecture underneath a
            business matters more than most founders believe, and it matters
            earlier than they expect.
          </p>
        </div>
      </Section>

      <Section>
        <SectionLabel>What getting it wrong teaches</SectionLabel>
        <div className="space-y-5 text-body text-fg/80">
          <p>
            Some of what Execom knows comes from getting it wrong.
          </p>
          <p>
            Structures that looked clean on paper but collapsed under regulatory
            scrutiny. Capital arrangements that aligned incentives on day one
            and created conflicts by year three. IP assignments that were
            technically valid but practically unenforceable across
            jurisdictions.
          </p>
          <p>
            Theory breaks at scale. Frameworks that hold in controlled
            conditions fall apart when you add real investors, real employees,
            real tax authorities, and real stakes.
          </p>
        </div>
      </Section>

      <Section className="mb-0">
        <SectionLabel>Why founders only</SectionLabel>
        <div className="space-y-5 text-body text-fg/80">
          <p>
            The person who carries the consequences of a structural decision
            should be the one making it — with full context, not a summary
            passed through three layers of management.
          </p>
          <p>
            Execom works with founders directly because that is where the actual
            decisions happen. Everything else is downstream.
          </p>
        </div>
      </Section>
    </>
  )
}
