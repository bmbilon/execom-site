import Image from "next/image"
import Link from "next/link"
import { ArrowRight, Plus } from "lucide-react"
import type { WorkItem, WorkVisual } from "@/lib/site/work"
import { CaseStudyCards } from "@/components/site/CaseStudyCards"
import { HOME_CASE_STUDIES } from "@/lib/site/caseStudies"
import { HexCadVisual } from "@/components/site/design/HexCadVisual"

function Visual({ visual }: { visual?: WorkVisual }) {
  if (!visual) return null
  if (visual.type === "hex") {
    return (
      <div className="flex h-full items-center justify-center bg-gradient-to-br from-[#0d1c2a] via-[#142a3e] to-[#06111c]">
        <HexCadVisual />
      </div>
    )
  }
  return (
    <div className="relative h-full" style={{ background: visual.background ?? "#0d1c2a" }}>
      <Image
        src={visual.src}
        alt={visual.alt}
        fill
        sizes="(min-width: 1024px) 680px, (min-width: 640px) 704px, 100vw"
        className={`${visual.fit === "contain" ? "object-contain p-3" : "object-cover"} ${visual.multiply ? "mix-blend-multiply" : ""}`}
        style={visual.position ? { objectPosition: visual.position } : undefined}
      />
    </div>
  )
}

function WorkCopy({ item }: { item: WorkItem }) {
  return (
    <>
      <p className="text-[15px] leading-relaxed text-haze">{item.summary}</p>
      {item.detail && <p className="mt-4 text-[15px] leading-relaxed text-haze">{item.detail}</p>}
      <ul className="mt-5 flex flex-wrap gap-2" aria-label={`${item.name} capabilities`}>
        {item.tags.map((tag) => (
          <li key={tag} className="rounded-full border border-white/[0.1] bg-white/[0.03] px-3 py-1 text-[12.5px] text-snow/85">
            {tag}
          </li>
        ))}
      </ul>
      {item.link && (
        <div className="mt-6">
          {item.link.href.startsWith("/fanbrush") || item.link.href.startsWith("https://") ? (
            <a href={item.link.href} className="s-link text-[14px]">
              {item.link.label}
              <ArrowRight className="h-4 w-4" aria-hidden />
            </a>
          ) : (
            <Link href={item.link.href} className="s-link text-[14px]">
              {item.link.label}
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
          )}
        </div>
      )}
      {item.evidence && (
        <ul className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-[12px] text-fog">
          {item.evidence.map((source) => (
            <li key={source.href}>
              <a href={source.href} className="underline decoration-white/20 underline-offset-4 transition-colors hover:text-snow">
                {source.label}
              </a>
            </li>
          ))}
        </ul>
      )}
    </>
  )
}

export function WorkGrid({ items }: { items: WorkItem[] }) {
  const featured = items.filter((item) => item.featured)
  const projects = items.filter((item) => !item.featured)

  return (
    <div className="grid gap-5">
      {featured.map((item, index) => (
        <article key={item.key} className="s-edge overflow-hidden lg:grid lg:grid-cols-12" aria-label={`${item.name} case study`} data-reveal>
          <div className={`overflow-hidden lg:aspect-auto ${item.layout === "portrait" ? "aspect-[1200/1407] lg:col-span-5 lg:min-h-[560px]" : "aspect-video lg:col-span-7 lg:min-h-[420px]"} ${index % 2 ? "lg:order-2" : ""}`}>
            <Visual visual={item.visual} />
          </div>
          <div className={`flex flex-col justify-center p-6 sm:p-8 lg:p-10 ${item.layout === "portrait" ? "lg:col-span-7" : "lg:col-span-5"} ${index % 2 ? "lg:order-1" : ""}`}>
            <p className="s-mono text-[10.5px] uppercase tracking-[0.14em] text-fog">{item.kind}</p>
            <h3 className="mb-6 mt-5">
              {item.logo ? (
                <span className={`inline-flex ${item.logo.background ? "rounded-lg px-3 py-2" : ""}`} style={{ background: item.logo.background }}>
                  <Image
                    src={item.logo.src}
                    alt={item.logo.alt}
                    width={item.logo.width}
                    height={item.logo.height}
                    className="max-w-full object-contain"
                    style={{ width: item.logo.width, height: item.logo.height }}
                  />
                </span>
              ) : (
                <span className="text-[1.65rem] font-semibold text-snow">{item.name}</span>
              )}
            </h3>
            <WorkCopy item={item} />
          </div>
        </article>
      ))}

      <div className="py-4">
        <CaseStudyCards studies={HOME_CASE_STUDIES} homepage />
        <div className="mt-7 flex justify-end">
          <Link href="/case-studies" className="s-link text-[14px]">
            Browse all case studies <ArrowRight className="h-4 w-4" aria-hidden />
          </Link>
        </div>
      </div>

      {projects.length > 0 && (
        <div className="s-edge overflow-hidden" data-reveal>
          <div className="border-b border-white/[0.07] px-6 py-5 sm:px-8">
            <p className="s-eyebrow">Design & development</p>
            <p className="mt-2 text-[14px] text-fog">Explore the work behind each product.</p>
          </div>
          <div className="divide-y divide-white/[0.07]">
            {projects.map((item) => (
              <details key={item.key} id={`work-${item.key}`} className="group/work">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-5 px-6 py-6 transition-colors hover:bg-white/[0.03] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-cyan-300 sm:px-8 [&::-webkit-details-marker]:hidden">
                  <span>
                    <span className="block text-[16px] font-semibold tracking-[-0.01em] text-snow sm:text-[18px]">{item.name}</span>
                    <span className="mt-1.5 block text-[13px] text-fog">{item.kind}</span>
                  </span>
                  <Plus className="h-5 w-5 shrink-0 text-cyan-300 transition-transform group-open/work:rotate-45 motion-reduce:transition-none" aria-hidden />
                </summary>
                <div className="grid gap-6 px-6 pb-7 sm:px-8 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] lg:gap-8">
                  <div className="h-[260px] overflow-hidden rounded-xl sm:h-[320px]">
                    <Visual visual={item.visual} />
                  </div>
                  <div className="lg:py-2">
                    <WorkCopy item={item} />
                  </div>
                </div>
              </details>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
