import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowLeft, ArrowUpRight } from "lucide-react"
import { CtaBand } from "@/components/site/Primitives"
import { CASE_STUDIES, getCaseStudy } from "@/lib/site/caseStudies"

export const dynamicParams = false

export function generateStaticParams() {
  return CASE_STUDIES.map(({ slug }) => ({ slug }))
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const study = getCaseStudy(params.slug)
  if (!study) return { title: "Case study not found | execom" }
  return { title: `${study.name} case study | execom`, description: study.summary }
}

export default function CaseStudyPage({ params }: { params: { slug: string } }) {
  const study = getCaseStudy(params.slug)
  if (!study) notFound()

  return (
    <>
      <section className="relative overflow-hidden pb-16 pt-14 md:pb-20 md:pt-20">
        <div className="s-atmo" aria-hidden />
        <div className="s-container relative">
          <Link href="/case-studies" className="s-link text-[14px]"><ArrowLeft className="h-4 w-4" aria-hidden /> All case studies</Link>
          <div className="mt-12 grid gap-10 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)] lg:items-center">
            <div>
              <p className="s-eyebrow mb-5">{study.sector}</p>
              <div className="flex items-center gap-5">
                {study.logo && <Image src={study.logo.src} alt={study.logo.alt} width={72} height={72} className="h-[72px] w-[72px] shrink-0 rounded-xl object-contain" />}
                <h1 className="font-display text-[clamp(2.5rem,6vw,4.5rem)] leading-[1.05] tracking-[-0.035em] text-snow">{study.name}</h1>
              </div>
              <p className="s-lede mt-7 max-w-[58ch]">{study.summary}</p>
            </div>
            <aside className="s-edge p-7 md:p-8" aria-label="Project scope">
              <p className="s-eyebrow">Project stage</p>
              <p className="mt-3 text-[18px] font-medium text-snow">{study.stage}</p>
              <ul className="mt-6 space-y-3 border-t border-white/[0.08] pt-6 text-[14px] text-haze">
                {study.capabilities.map((capability) => <li key={capability}>{capability}</li>)}
              </ul>
            </aside>
          </div>
        </div>
      </section>
      <section className="s-section-tight pt-0" aria-label="Project story">
        <div className="s-container grid gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.5fr)] lg:gap-20">
          <div>
            {study.visual ? (
              <div className="s-edge relative aspect-square overflow-hidden">
                <Image src={study.visual.src} alt={study.visual.alt} fill sizes="(min-width: 1024px) 440px, 100vw" className="object-contain p-8" />
              </div>
            ) : (
              <div className="border-t border-white/[0.1] pt-6"><p className="s-eyebrow">From concept to cash flow</p><p className="mt-4 max-w-[28ch] font-display text-[30px] leading-tight text-snow">The right work for the next decision.</p></div>
            )}
            {study.website && <a href={study.website.href} className="s-link mt-6 text-[14px]">{study.website.label} <ArrowUpRight className="h-4 w-4" aria-hidden /></a>}
          </div>
          <div className="space-y-9">
            {[
              { title: "The assignment", text: study.context },
              { title: "The work", text: study.work },
              { title: "What it produced", text: study.deliverable },
            ].map((section) => (
              <section key={section.title}>
                <h2 className="text-[20px] font-semibold text-snow">{section.title}</h2>
                <p className="mt-4 text-[16px] leading-[1.8] text-haze">{section.text}</p>
              </section>
            ))}
          </div>
        </div>
      </section>
      <CtaBand title="Bring us your *next step*." body="We scope the work around the product, the business, and the decision that matters now." primary={{ label: "Talk with execom", href: "/engage" }} />
    </>
  )
}
