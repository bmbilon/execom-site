import { describe, expect, it } from "vitest"
import { existsSync } from "node:fs"
import { CASE_STUDIES } from "./caseStudies"
import { buildSearchIndex } from "./search"
import { SERVICE_CATEGORIES, SERVICES, filterServices, serviceHref } from "./services"

// Search terms visitors use must reach a useful destination, including shorthand.
describe("service discovery", () => {
  it.each([
    ["physical prototype", "physical-prototyping"],
    ["digital prototype", "digital-prototyping"],
    ["POC", "proof-of-concept"],
    ["pilots", "pilots"],
    ["websites", "websites-ecommerce"],
    ["e-commerce", "websites-ecommerce"],
    ["apps", "apps"],
    ["marketing assets", "marketing-assets"],
    ["explainer video", "concept-explainer-videos"],
    ["government compliance", "government-regulatory"],
    ["grants", "grants"],
    ["SRED", "sred"],
    ["SR&ED", "sred"],
    ["SR ED", "sred"],
  ])("finds %s", (query, slug) => {
    expect(filterServices(query).map((service) => service.slug)).toContain(slug)
  })
  it("combines category and query filters without leaking other categories", () => {
    const results = filterServices("prototype", "prototyping")
    expect(results.length).toBeGreaterThan(0)
    expect(results.every((service) => service.category === "prototyping")).toBe(true)
    expect(filterServices("grants", "digital")).toEqual([])
    expect(filterServices("unmatched-service-query")).toEqual([])
  })
  it("returns the full directory when filters are cleared", () => {
    expect(filterServices("  ")).toEqual(SERVICES)
  })
})

describe("service destinations", () => {
  it("has unique routes, valid categories, and real project references", () => {
    expect(new Set(SERVICES.map(serviceHref)).size).toBe(SERVICES.length)
    expect(new Set(SERVICES.map((service) => service.slug)).size).toBe(SERVICES.length)
    for (const service of SERVICES) {
      expect(SERVICE_CATEGORIES.some((category) => category.key === service.category)).toBe(true)
      for (const slug of service.cases ?? []) expect(CASE_STUDIES.some((study) => study.slug === slug)).toBe(true)
      if (service.href) expect(existsSync(`app/(marketing)${service.href}/page.tsx`)).toBe(true)
    }
  })
  it("indexes every service once, with its actual destination", () => {
    const index = buildSearchIndex()
    for (const service of SERVICES) {
      const entries = index.filter((entry) => entry.href === serviceHref(service))
      expect(entries).toHaveLength(1)
      expect(entries[0].kind).toBe("service")
      expect(entries[0].keywords).toContain(service.keywords)
    }
  })
})
