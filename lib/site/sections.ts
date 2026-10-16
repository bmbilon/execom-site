// In-page sections exposed to the command palette, keyed by page href.
// Advisory pages derive theirs from their content data; hand-built pages
// list their anchors explicitly.

import type { AdvisoryPageData } from "@/components/site/advisory/types"
import { ADVISORY_PAGES } from "./content"
import { FAQ as SOFTWARE_INDEPENDENCE_FAQ } from "./softwareIndependence"

const FAQ_TITLES = SOFTWARE_INDEPENDENCE_FAQ.map((f) => f.q).join(" ")

type Section = { id: string; nav: string; title?: string }

function fromAdvisory(data: AdvisoryPageData): Section[] {
  const list: Section[] = data.chapters.map((c) => ({ id: c.id, nav: c.nav, title: c.title.replace(/\*/g, "") }))
  if (data.faq?.length) list.push({ id: "faq", nav: "FAQ", title: data.faq.map((f) => f.q).join(" ") })
  return list
}

const HAND_BUILT: Record<string, Section[]> = {
  "/software-independence": [
    { id: "cases", nav: "Who did it", title: "Curative Klarna Sanofi Greenleaf Seawolves Atonom replaced Salesforce cases" },
    { id: "roi", nav: "ROI model", title: "SaaS replacement ROI calculator payback three-year TCO" },
    { id: "method", nav: "How it works", title: "Keep renegotiate consolidate replace method controls" },
    { id: "pricing", nav: "Pricing", title: "Blueprint Co-Build Managed Replacement pricing" },
    { id: "fit", nav: "Fit", title: "Signals scorecard qualification" },
    { id: "faq", nav: "Questions", title: FAQ_TITLES },
  ],
}

export const PAGE_SECTIONS: Record<string, Section[]> = {
  ...Object.fromEntries(ADVISORY_PAGES.map((p) => [p.href, fromAdvisory(p)])),
  ...HAND_BUILT,
}
