import Image from "next/image"
import Link from "next/link"
import { ArrowUpRight } from "lucide-react"
import type { CaseStudy } from "@/lib/site/caseStudies"
import { CaseStudyImage } from "./CaseStudyImage"

export function CaseStudyCards({ studies, homepage = false }: { studies: CaseStudy[]; homepage?: boolean }) {
  const Heading = homepage ? "h3" : "h2"
  return (
    <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
      {studies.map((study) => (
        <article key={study.slug} aria-label={`${study.name} mini case study`} className="s-edge flex flex-col overflow-hidden" data-reveal>
          {study.visual && (
            <Link href={`/case-studies/${study.slug}`} className="block transition-opacity hover:opacity-90" aria-label={`Explore ${study.name}`}>
              <CaseStudyImage visual={study.visual} preview />
            </Link>
          )}
          <div className="flex flex-1 flex-col p-6 sm:p-7">
            <div className="mb-7 flex items-start justify-between gap-5">
              {study.logo ? (
                <Image src={study.logo.src} alt={study.logo.alt} width={64} height={64} className="h-16 w-16 rounded-xl object-contain" />
              ) : (
                <p className="s-mono max-w-[22ch] text-[11px] uppercase leading-relaxed tracking-[0.12em] text-fog">{study.sector}</p>
              )}
              <ArrowUpRight className="h-5 w-5 shrink-0 text-cyan-300" aria-hidden />
            </div>
            {homepage && <p className="s-mono mb-3 text-[10.5px] uppercase tracking-[0.14em] text-fog">Turnkey services</p>}
            <Heading className="text-[23px] font-semibold tracking-[-0.02em] text-snow">{study.name}</Heading>
            <p className="mt-4 text-[14px] leading-relaxed text-haze">{study.summary}</p>
            <div className="mt-auto pt-7">
              <Link href={`/case-studies/${study.slug}`} className="s-link text-[14px]" aria-label={`Read the ${study.name} case study`}>
                Read the case study <ArrowUpRight className="h-4 w-4" aria-hidden />
              </Link>
            </div>
          </div>
        </article>
      ))}
    </div>
  )
}
