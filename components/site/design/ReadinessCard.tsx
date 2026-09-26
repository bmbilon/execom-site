import Link from "next/link"
import { ArrowRight } from "lucide-react"

const FACTS = [
  { k: "6", v: "short sections" },
  { k: "20–30", v: "minutes for most people" },
  { k: "2", v: "business days to a recommendation" },
]

/** Hero aside for the prototyping page. All figures come from the page copy. */
export function ReadinessCard() {
  return (
    <div className="s-edge relative overflow-hidden p-7 md:p-8">
      <div className="s-glow right-[-60px] top-[-80px] h-[200px] w-[300px] bg-[rgba(25,94,142,0.45)]" aria-hidden />
      <div className="relative">
        <p className="s-eyebrow">Prototype readiness assessment</p>
        <dl className="mt-6 grid gap-3">
          {FACTS.map((f) => (
            <div key={f.v} className="flex items-baseline gap-4 border-b border-white/[0.07] pb-3 last:border-0 last:pb-0">
              <dt className="min-w-[88px] font-display text-[2.1rem] leading-none tracking-[-0.02em] text-snow s-num">{f.k}</dt>
              <dd className="text-[14.5px] text-haze">{f.v}</dd>
            </div>
          ))}
        </dl>
        <p className="mt-6 text-[13.5px] leading-relaxed text-fog">Drafts auto-save, so you can step away and come back.</p>
        <Link href="/portal/prototype-readiness" className="s-link mt-5 text-[14px]">
          Start the assessment
          <ArrowRight className="h-4 w-4" aria-hidden />
        </Link>
      </div>
    </div>
  )
}
