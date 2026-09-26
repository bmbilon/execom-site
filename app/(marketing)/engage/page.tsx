import type { Metadata } from "next"
import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { NextSteps, PageHero, SectionHeader } from "@/components/site/Primitives"
import { DecisionForm } from "@/components/site/engage/DecisionForm"
import { accentTitle } from "@/components/site/Rich"

export const metadata: Metadata = {
  title: "How We Engage | execom",
  description:
    "execom engages only when the work can be tied to capital efficiency, risk reduction, structural optionality, or a concrete change in trajectory. The deliverable is a decision.",
}

const FLOW = [
  {
    title: "Examine the configuration",
    text: "Entities, ownership, IP, capital, personal exposure. How the company is actually set up.",
  },
  {
    title: "Find the constraint",
    text: "Where the structure is creating risk, friction, or constraint that the founder may not yet see.",
  },
  {
    title: "Deliver the decision",
    text: "Sometimes a sequence of decisions. Never a report for its own sake.",
  },
]

const EXCLUSIONS = [
  { lead: "No coaching,", rest: "“founder mindset” packages, or accountability therapy." },
  { lead: "No masterminds, seminars,", rest: "retreats, hype circles, or pay-to-belong groups." },
  { lead: "No e-books, playbooks,", rest: "templates, or “the one trick” content products." },
  { lead: "No growth-hacking theatre,", rest: "“10x your ROAS,” funnel sorcery, or vanity-metric worship." },
  { lead: "No guaranteed outcomes,", rest: "traction promises, fundraising commitments, or overnight success." },
  { lead: "No motivational consulting.", rest: "We stress-test reality. We do not preach or inflate narratives." },
]

export default function Engage() {
  return (
    <>
      <PageHero
        eyebrow="How we engage"
        title="execom does not engage without a clearly defined, *measurable result*."
        lede="If the work cannot be tied to capital efficiency, risk reduction, structural optionality, or a concrete change in trajectory, we don't engage."
        primary={{ label: "Describe your decision", href: "#start" }}
        secondary={{ label: "Routine setup? Use the portal", href: "/portal/login" }}
      />

      {/* What this looks like */}
      <section className="s-section-tight">
        <div className="s-container">
          <SectionHeader
            eyebrow="What this looks like"
            title="Decisions are the *deliverable*."
            lede="If a decision leads to legal, tax, or financial execution work, execom can point to the right people. The execution itself is not what this engagement does."
            className="mb-14"
          />
          <ol className="relative grid gap-4 md:grid-cols-3">
            <div
              className="absolute left-[16.6%] right-[16.6%] top-[27px] hidden h-px bg-gradient-to-r from-cyan-500/50 via-navy-300/40 to-cyan-500/50 md:block"
              aria-hidden
            />
            {FLOW.map((s, i) => (
              <li key={s.title} className="relative flex flex-col items-start md:items-center md:text-center" data-reveal style={{ ["--d" as string]: `${i * 90}ms` }}>
                <span className="relative z-[1] flex h-14 w-14 items-center justify-center rounded-2xl border border-white/[0.12] bg-ink-850 s-mono text-[13px] text-cyan-300 shadow-[0_0_0_6px_rgba(7,17,27,1),0_0_30px_rgba(80,196,210,0.18)]">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <p className="mt-6 text-[1.2rem] font-semibold tracking-[-0.012em] text-snow">{s.title}</p>
                <p className="mt-2 max-w-[34ch] text-[15px] leading-relaxed text-haze">{s.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* What we do not do */}
      <section className="s-section-tight">
        <div className="s-container grid gap-10 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-16">
          <div className="self-start lg:sticky lg:top-[120px]" data-reveal>
            <p className="s-eyebrow">What we do not do</p>
            <h2 className="s-h2 mt-5">{accentTitle("If you need coaching or support, you are in the *wrong place*.")}</h2>
            <p className="s-lede mt-5">If you need access, speed, or clarity on a structural decision, you are in the right place.</p>
          </div>
          <ul className="grid gap-3 sm:grid-cols-2" data-reveal>
            {EXCLUSIONS.map((x) => (
              <li key={x.lead} className="s-glass s-spot p-5">
                <p className="text-[15px] leading-relaxed text-haze">
                  <span className="font-semibold text-snow">{x.lead}</span> {x.rest}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Start */}
      <section id="start" className="s-section s-anchor relative overflow-hidden">
        <div className="s-glow left-1/2 top-10 h-[320px] w-[720px] -translate-x-1/2 bg-[rgba(25,94,142,0.28)]" aria-hidden />
        <div className="s-container relative grid gap-10 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-16">
          <div data-reveal>
            <p className="s-eyebrow">Start</p>
            <h2 className="s-h2 mt-5">Describe the decision in plain language.</h2>
            <p className="s-lede mt-5">Two or three sentences is enough if the thinking is clear.</p>
            <div className="mt-8 rounded-2xl border border-white/[0.08] bg-white/[0.02] p-5">
              <p className="text-[14px] font-semibold text-snow">Routine company work?</p>
              <p className="mt-1 text-[14px] leading-relaxed text-haze">
                Incorporation, trademarks, corporate records, and SR&amp;ED run through the portal.
              </p>
              <Link href="/portal/login" className="s-link mt-3 text-[14px]">
                Access the portal
                <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
            </div>
          </div>
          <div data-reveal style={{ ["--d" as string]: "80ms" }}>
            <DecisionForm subject="execom engagement inquiry" />
          </div>
        </div>
      </section>

      <NextSteps from="/engage" />
    </>
  )
}
