import type { Metadata } from "next"
import { Breadcrumbs, CtaBand } from "@/components/site/Primitives"
import { ServiceDirectory } from "@/components/site/services/ServiceDirectory"
import { serviceCategory } from "@/lib/site/services"

export const metadata: Metadata = {
  title: "Services | execom",
  description: "Find turnkey services for physical and digital prototyping, websites, apps, content, manufacturing, regulatory coordination, grants, SR&ED, and growth.",
  alternates: { canonical: "/services" },
}

export default function ServicesPage({ searchParams }: { searchParams: { q?: string; category?: string } }) {
  const query = typeof searchParams.q === "string" ? searchParams.q : ""
  const category = serviceCategory(searchParams.category ?? "")?.key ?? "all"
  return (
    <>
      <section className="relative overflow-hidden pb-12 pt-10 md:pb-16 md:pt-14">
        <div className="s-atmo" aria-hidden />
        <div className="s-container relative">
          <Breadcrumbs href="/services" label="Services" />
          <p className="s-eyebrow s-eyebrow-dot mb-5">Turnkey services</p>
          <h1 className="s-display s-display-lg max-w-[20ch]">What do you need to <em className="text-cyan-300">move forward?</em></h1>
          <p className="s-lede mt-6 max-w-[58ch]">From a first prototype to the website, content, funding, and operations behind the business. Find the right starting point.</p>
        </div>
      </section>
      <section className="s-section-tight pt-0" aria-label="Service directory">
        <div className="s-container"><ServiceDirectory key={`${query}:${category}`} initialQuery={query} initialCategory={category} /></div>
      </section>
      <CtaBand title="Bring the problem. *We’ll scope the work*." body="One service or a connected engagement. Start with the product, the business, and the next decision." primary={{ label: "Talk with execom", href: "/engage" }} />
    </>
  )
}
