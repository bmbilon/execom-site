import Link from "next/link"

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

export default function Home() {
  return (
    <>
      <Section className="mb-28">
        <p className="text-body text-fg leading-relaxed">
          We deal in structural decisions — the kind that are easy to defer and
          expensive to reverse.
        </p>
      </Section>

      <Section>
        <SectionLabel>When this matters</SectionLabel>
        <div className="space-y-5 text-body text-fg/80">
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
      </Section>

      <Section>
        <SectionLabel>How this works</SectionLabel>
        <div className="space-y-5 text-body text-fg/80">
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
      </Section>

      <Section>
        <SectionLabel>Situations we have worked on</SectionLabel>
        <div className="space-y-8 text-body text-fg/70">
          <p>
            A cross-border SaaS company restructured its IP holding before a
            secondary transaction. The original setup would have created a
            seven-figure tax event that no one had modeled.
          </p>
          <p>
            A founder discovered her cap table made a strategic acquisition
            structurally impossible. The fix took three weeks. Finding the
            problem took longer.
          </p>
          <p>
            Two co-founders with divergent risk tolerances were heading toward a
            split. The issue was not the relationship. It was the entity design.
          </p>
          <p>
            A company raising its Series B realized the Canadian parent entity
            was creating unnecessary friction with US investors. A single
            restructuring removed the obstacle entirely.
          </p>
          <p>
            A founder carrying significant personal guarantees tied to company
            debt needed to decouple before a leadership transition. The
            guarantees had been invisible to the board.
          </p>
        </div>
      </Section>

      <Section className="mb-0">
        <div className="border-t border-border pt-12">
          <p className="text-body text-fg/70">
            If something here is relevant to a decision you are currently
            facing, you can reach us on the{" "}
            <Link
              href="/contact"
              className="text-fg underline underline-offset-4 decoration-border hover:decoration-fg transition-colors"
            >
              contact page
            </Link>
            .
          </p>
          <p className="text-body text-muted mt-4">
            We respond to specifics. Vague inquiries go unanswered.
          </p>
        </div>
      </Section>
    </>
  )
}
