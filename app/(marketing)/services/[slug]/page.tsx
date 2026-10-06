import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowLeft, ArrowRight } from "lucide-react"
import { CtaBand, PageHero } from "@/components/site/Primitives"
import { CaseStudyCards } from "@/components/site/CaseStudyCards"
import { CASE_STUDIES } from "@/lib/site/caseStudies"
import { SERVICES, getService, serviceCategory, serviceHref } from "@/lib/site/services"

export const dynamicParams = false
export function generateStaticParams() {
  return SERVICES.filter((service) => !service.href).map(({ slug }) => ({ slug }))
}
export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const service = getService(params.slug)
  if (!service || service.href) return { title: "Service not found | execom" }
  return { title: `${service.title} | execom`, description: service.summary, alternates: { canonical: serviceHref(service) } }
}
export default function ServicePage({ params }: { params: { slug: string } }) {
  const service = getService(params.slug)
  if (!service || service.href) notFound()
  const category = serviceCategory(service.category)!
  const examples = CASE_STUDIES.filter((study) => service.cases?.includes(study.slug)).slice(0, 2)
  const related = SERVICES.filter((entry) => entry.category === service.category && entry.slug !== service.slug).slice(0, 3)
  return (
    <>
      <PageHero href={serviceHref(service)} crumb={service.title} eyebrow="Turnkey services" title={service.title} lede={service.summary} primary={{ label: "Scope a project", href: "/engage" }}>
        <Link href={`/services?category=${category.key}`} className="s-link mt-7 text-[14px]"><ArrowLeft className="h-4 w-4" aria-hidden />{category.label}</Link>
      </PageHero>
      <section className="s-section-tight pt-0" aria-label="Service scope">
        <div className="s-container grid gap-10 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)] lg:gap-20">
          <div>
            <h2 className="font-display text-[32px] text-snow">The work</h2>
            <p className="mt-5 text-[17px] leading-[1.8] text-haze">{service.scope}</p>
            <h2 className="mt-10 text-[19px] font-semibold text-snow">What to bring</h2>
            <p className="mt-3 text-[16px] leading-relaxed text-haze">{service.inputs}</p>
            {service.links && <div className="mt-7 grid gap-3">{service.links.map((link) => <Link key={link.href} href={link.href} className="s-link text-[14px]">{link.label}<ArrowRight className="h-4 w-4" aria-hidden /></Link>)}</div>}
          </div>
          <aside className="s-edge self-start p-7 md:p-8" aria-label="Potential deliverables">
            <h2 className="s-eyebrow">What an engagement can include</h2>
            <ul className="mt-6 divide-y divide-white/[0.08]">
              {service.deliverables.map((item, index) => <li key={item} className="flex gap-4 py-4 first:pt-0"><span className="s-mono pt-1 text-[11px] text-cyan-300">0{index + 1}</span><span className="text-[16px] leading-relaxed text-snow">{item}</span></li>)}
            </ul>
            <p className="mt-5 text-[13px] leading-relaxed text-fog">Scope and deliverables are agreed around your stage, constraints, and next decision.</p>
          </aside>
        </div>
      </section>
      {examples.length > 0 && <section className="s-section-tight"><div className="s-container"><p className="s-eyebrow mb-4">Selected work</p><h2 className="s-h2 mb-8">Explore related projects.</h2><CaseStudyCards studies={examples} /></div></section>}
      {related.length > 0 && <section className="s-section-tight"><div className="s-container"><h2 className="font-display text-[30px] text-snow">Connected services</h2><div className="mt-7 grid gap-4 md:grid-cols-3">{related.map((entry) => <Link key={entry.slug} href={serviceHref(entry)} className="s-edge s-card-link flex flex-col p-6"><h3 className="text-[17px] font-semibold text-snow">{entry.title}</h3><p className="mb-5 mt-3 text-[14px] leading-relaxed text-haze">{entry.summary}</p><span className="s-link mt-auto text-[13px]">Explore service<ArrowRight className="h-4 w-4" aria-hidden /></span></Link>)}</div></div></section>}
      <CtaBand title="Let’s define the *next useful step*." body="Bring the context and the result you need. We will connect the right work into a clear scope." primary={{ label: "Talk with execom", href: "/engage" }} secondary={{ label: "Browse all services", href: "/services" }} />
    </>
  )
}
