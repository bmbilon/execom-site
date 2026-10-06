import Image from "next/image"
import Link from "next/link"
import { ArrowRight } from "lucide-react"
import type { WorkItem, WorkVisual } from "@/lib/site/work"
import { HexCadVisual } from "@/components/site/design/HexCadVisual"

function Visual({ visual, name }: { visual?: WorkVisual; name: string }) {
  if (!visual) {
    return (
      <div className="flex h-full items-center justify-center bg-ink-850">
        <span className="font-display text-[2.4rem] tracking-[-0.02em] text-snow/80">{name}</span>
      </div>
    )
  }
  if (visual.type === "hex") {
    return (
      <div className="flex h-full items-center justify-center bg-gradient-to-br from-[#0d1c2a] via-[#142a3e] to-[#06111c]">
        <HexCadVisual />
      </div>
    )
  }
  if (visual.type === "wordmark") {
    return (
      <div className="relative flex h-full flex-col justify-between overflow-hidden bg-[linear-gradient(160deg,rgba(25,94,142,0.42),rgba(7,17,27,0.2)_70%)] p-7">
        <div className="s-glow right-[-40px] top-[-60px] h-[200px] w-[280px] bg-[rgba(80,196,210,0.16)]" aria-hidden />
        <p className="relative font-display text-[4.2rem] italic leading-none tracking-[-0.03em] text-snow md:text-[5rem]">{visual.text}</p>
        <ul className="relative flex flex-wrap gap-x-4 gap-y-1.5">
          {visual.lines.map((l) => (
            <li key={l} className="s-mono text-[10.5px] uppercase tracking-[0.14em] text-cyan-200/90">
              {l}
            </li>
          ))}
        </ul>
      </div>
    )
  }
  return (
    <div className="relative h-full" style={{ background: visual.background ?? "#0d1c2a" }}>
      <Image
        src={visual.src}
        alt={visual.alt}
        fill
        sizes="(min-width: 1024px) 660px, 100vw"
        className={`${visual.fit === "contain" ? "object-contain p-3" : "object-cover"} ${visual.multiply ? "mix-blend-multiply" : ""}`}
        style={visual.position ? { objectPosition: visual.position } : undefined}
      />
    </div>
  )
}

// Alternating 5/7 then 7/5 rows on desktop.
const SPANS = ["lg:col-span-5", "lg:col-span-7", "lg:col-span-7", "lg:col-span-5"]

export function WorkGrid({ items }: { items: WorkItem[] }) {
  return (
    <div className="grid gap-4 lg:grid-cols-12 lg:gap-5">
      {items.map((w, i) => (
        <article
          key={w.key}
          className={`s-edge s-spot flex flex-col overflow-hidden ${SPANS[i % SPANS.length]}`}
          data-reveal
          style={{ ["--d" as string]: `${(i % 2) * 80}ms` }}
        >
          <div className="h-[230px] overflow-hidden sm:h-[280px] lg:h-[300px]">
            <Visual visual={w.visual} name={w.name} />
          </div>
          <div className="flex flex-1 flex-col border-t border-white/[0.07] p-6 md:p-7">
            <p className="s-mono text-[10.5px] uppercase tracking-[0.14em] text-fog">{w.kind}</p>
            <h3 className="mt-3 font-display text-[1.65rem] leading-[1.12] tracking-[-0.016em] text-snow">{w.name}</h3>
            <p className="mt-3 max-w-[58ch] text-[14.5px] leading-relaxed text-haze">{w.summary}</p>
            <ul className="mt-5 flex flex-wrap gap-2">
              {w.tags.map((t) => (
                <li key={t} className="rounded-full border border-white/[0.1] bg-white/[0.03] px-3 py-1 text-[12.5px] text-snow/85">
                  {t}
                </li>
              ))}
            </ul>
            {w.link && (
              <div className="mt-auto pt-6">
                {w.link.href.startsWith("/fanbrush") ? (
                  <a href={w.link.href} className="s-link text-[14px]">
                    {w.link.label}
                    <ArrowRight className="h-4 w-4" aria-hidden />
                  </a>
                ) : (
                  <Link href={w.link.href} className="s-link text-[14px]">
                    {w.link.label}
                    <ArrowRight className="h-4 w-4" aria-hidden />
                  </Link>
                )}
              </div>
            )}
          </div>
        </article>
      ))}
    </div>
  )
}
