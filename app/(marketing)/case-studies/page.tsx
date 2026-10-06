import type { Metadata } from "next"
import { CaseStudyCards } from "@/components/site/CaseStudyCards"
import { CtaBand, PageHero } from "@/components/site/Primitives"
import { CASE_STUDIES } from "@/lib/site/caseStudies"

export const metadata: Metadata = {
  title: "Case studies | execom",
  description: "Explore execom project work across software, consumer products, concept validation, prototyping, and manufacturing preparation.",
}

export default function CaseStudiesPage() {
  return (
    <>
      <PageHero href="/case-studies" crumb="Case studies" eyebrow="Selected project work" title="The work behind *commercialization*." lede="Software, physical products, and the business decisions that move them forward. Explore the assignment, the work, and what each project produced." />
      <section className="s-section-tight pt-0" aria-label="Case study library">
        <div className="s-container">
          <CaseStudyCards studies={CASE_STUDIES} />
        </div>
      </section>
      <CtaBand title="What are you *building*?" body="Bring the concept, the product, or the commercial problem. We will help define the next useful step." primary={{ label: "Talk with execom", href: "/engage" }} />
    </>
  )
}
