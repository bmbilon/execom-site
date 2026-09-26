// In-page sections exposed to the command palette, keyed by page href.
// Advisory pages derive theirs from their content data; hand-built pages
// list their anchors explicitly.

import type { AdvisoryPageData } from "@/components/site/advisory/types"
import { ADVISORY_PAGES } from "./content"

type Section = { id: string; nav: string; title?: string }

function fromAdvisory(data: AdvisoryPageData): Section[] {
  const list: Section[] = data.chapters.map((c) => ({ id: c.id, nav: c.nav, title: c.title.replace(/\*/g, "") }))
  if (data.faq?.length) list.push({ id: "faq", nav: "FAQ", title: data.faq.map((f) => f.q).join(" ") })
  return list
}

const HAND_BUILT: Record<string, Section[]> = {}

export const PAGE_SECTIONS: Record<string, Section[]> = {
  ...Object.fromEntries(ADVISORY_PAGES.map((p) => [p.href, fromAdvisory(p)])),
  ...HAND_BUILT,
}
