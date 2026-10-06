import type { PaletteEntry } from "@/components/site/CommandPalette"
import { SERVICES, serviceCategory, serviceHref } from "./services"
import { PAGES } from "./nav"
import { PAGE_SECTIONS } from "./sections"
import { CASE_STUDIES } from "./caseStudies"

const ACTIONS: PaletteEntry[] = [
  { kind: "action", title: "Browse all services", href: "/services", hint: "Service directory", keywords: "services capabilities offerings" },
  { kind: "action", title: "Access the client portal", href: "/portal/login", hint: "Sign in", keywords: "login account matters" },
  { kind: "action", title: "Talk with execom", href: "/engage", hint: "Engage", keywords: "contact call meeting start" },
  {
    kind: "action",
    title: "Estimate my startup cost",
    href: "/#startup-cost-calculator",
    hint: "Calculator",
    keywords: "calculator cost fees price estimate",
  },
  {
    kind: "action",
    title: "See the commercialization path",
    href: "/#path",
    hint: "Concept to cash flow",
    keywords: "commercialization path stages validate structure fund build market sell idea revenue cash flow",
  },
  {
    kind: "action",
    title: "See selected work",
    href: "/#work",
    hint: "Proof",
    keywords: "work portfolio case studies products proof",
  },
  {
    kind: "action",
    title: "Start the prototype readiness assessment",
    href: "/portal/prototype-readiness",
    hint: "Assessment",
    keywords: "prototype product assessment",
  },
]

/** Small, serialisable index handed to the client-side command palette. */
export function buildSearchIndex(): PaletteEntry[] {
  const services: PaletteEntry[] = SERVICES.map((service) => ({
    kind: "service",
    title: service.title,
    href: serviceHref(service),
    group: serviceCategory(service.category)?.label,
    hint: "Service",
    keywords: `${service.summary} ${service.keywords}`,
  }))
  const serviceRoutes = new Set(services.map((service) => service.href))
  const pages: PaletteEntry[] = PAGES.filter((p) => p.href && !serviceRoutes.has(p.href)).map((p) => ({
    kind: "page",
    title: p.label,
    href: p.href!,
    group: p.group,
    hint: p.group ?? "",
    keywords: `${p.description} ${(p.keywords ?? []).join(" ")}`,
  }))

  const sections: PaletteEntry[] = Object.entries(PAGE_SECTIONS).flatMap(([href, list]) => {
    const page = PAGES.find((p) => p.href === href)
    return list.map((s) => ({
      kind: "section" as const,
      title: page?.label ?? href,
      section: s.nav,
      href: `${href}#${s.id}`,
      keywords: s.title ?? "",
    }))
  })

  const studies: PaletteEntry[] = CASE_STUDIES.map((study) => ({
    kind: "page",
    title: study.name,
    href: `/case-studies/${study.slug}`,
    group: "Case studies",
    hint: "Case study",
    keywords: `${study.sector} ${study.summary} ${study.capabilities.join(" ")}`,
  }))

  return [...ACTIONS, ...services, ...pages, ...studies, ...sections]
}
