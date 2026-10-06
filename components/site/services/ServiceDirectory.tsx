"use client"

import Link from "next/link"
import { useEffect, useMemo, useState } from "react"
import { ArrowRight, Search, X } from "lucide-react"
import { SERVICE_CATEGORIES, filterServices, serviceCategory, serviceHref } from "@/lib/site/services"

export function ServiceDirectory({ initialQuery, initialCategory }: { initialQuery: string; initialCategory: string }) {
  const [query, setQuery] = useState(initialQuery)
  const [category, setCategory] = useState(initialCategory)
  const results = useMemo(() => filterServices(query, category), [query, category])

  // Keep filtered views shareable without a network request for every keystroke.
  useEffect(() => {
    const params = new URLSearchParams()
    if (query.trim()) params.set("q", query.trim())
    if (category !== "all") params.set("category", category)
    const url = `/services${params.size ? `?${params}` : ""}`
    if (`${window.location.pathname}${window.location.search}` !== url) {
      window.history.replaceState(window.history.state, "", url)
    }
  }, [query, category])

  useEffect(() => {
    const restore = () => {
      const params = new URLSearchParams(window.location.search)
      setQuery(params.get("q") ?? "")
      const selected = params.get("category") ?? "all"
      setCategory(serviceCategory(selected) ? selected : "all")
    }
    window.addEventListener("popstate", restore)
    return () => window.removeEventListener("popstate", restore)
  }, [])

  const reset = () => { setQuery(""); setCategory("all") }

  return (
    <div className="grid gap-6 lg:grid-cols-[220px_minmax(0,1fr)] lg:gap-x-12">
      <div className="min-w-0 lg:col-start-2 lg:row-start-1">
        <label htmlFor="service-query" className="sr-only">Search services</label>
        <div className="relative">
          <Search className="pointer-events-none absolute left-5 top-1/2 h-5 w-5 -translate-y-1/2 text-cyan-300" aria-hidden />
          <input id="service-query" type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search services, e.g. prototyping" className="h-16 w-full rounded-xl border border-white/[0.14] bg-white/[0.035] pl-14 pr-12 text-[16px] text-snow outline-none placeholder:text-fog focus:border-cyan-300/60 focus:ring-2 focus:ring-cyan-300/10 [&::-webkit-search-cancel-button]:hidden" autoComplete="off" />
          {query && <button type="button" aria-label="Clear service search" onClick={() => setQuery("")} className="s-icon-btn absolute right-3 top-1/2 -translate-y-1/2"><X className="h-4 w-4" aria-hidden /></button>}
        </div>
        <div className="mt-4 flex items-center justify-between gap-4 text-[13px] text-fog">
          <p role="status">{results.length} {results.length === 1 ? "service" : "services"}{category !== "all" ? ` in ${serviceCategory(category)?.label}` : ""}</p>
          {(query || category !== "all") && <button type="button" onClick={reset} className="shrink-0 text-cyan-300 hover:text-snow">Reset filters</button>}
        </div>
      </div>
      <aside className="lg:col-start-1 lg:row-start-1 lg:row-span-2">
        <div className="lg:sticky lg:top-[calc(var(--header-h)+28px)]">
          <p className="s-eyebrow mb-4">Browse by service</p>
          <div className="flex flex-wrap gap-2 lg:grid lg:gap-1" role="group" aria-label="Filter by service category">
            {[{ key: "all", label: "All services" }, ...SERVICE_CATEGORIES].map((item) => (
              <button key={item.key} type="button" aria-pressed={category === item.key} onClick={() => setCategory(item.key)} className="rounded-lg border border-white/[0.08] px-3 py-2.5 text-left text-[13px] text-haze transition-colors hover:bg-white/[0.04] aria-pressed:border-cyan-300/30 aria-pressed:bg-cyan-300/[0.08] aria-pressed:text-cyan-300 lg:border-transparent lg:text-[14px]">
                {item.label}
              </button>
            ))}
          </div>
          <p className="mt-6 hidden text-[13px] leading-relaxed text-fog lg:block">Start with the work you need. We can connect the pieces into a turnkey engagement.</p>
        </div>
      </aside>
      <div className="min-w-0 lg:col-start-2 lg:row-start-2">
        {results.length === 0 ? (
          <div className="s-edge px-6 py-12">
            <h2 className="text-xl font-medium text-snow">No services match this search.</h2>
            <p className="mt-3 text-[15px] text-haze">Try a broader term or browse all categories.</p>
            <button type="button" onClick={reset} className="s-link mt-6">Show all services <ArrowRight className="h-4 w-4" aria-hidden /></button>
          </div>
        ) : SERVICE_CATEGORIES.map((group) => {
          const services = results.filter((service) => service.category === group.key)
          if (!services.length) return null
          return (
            <section key={group.key} className="mb-12" aria-labelledby={`category-${group.key}`}>
              <h2 id={`category-${group.key}`} className="mb-5 font-display text-[27px] tracking-[-0.015em] text-snow">{group.label}</h2>
              <div className="grid gap-3 sm:grid-cols-2">
                {services.map((service) => (
                  <Link key={service.slug} href={serviceHref(service)} className="s-edge s-card-link group flex flex-col p-6">
                    <h3 className="text-[17px] font-semibold leading-snug text-snow">{service.title}</h3>
                    <p className="mb-6 mt-3 text-[14px] leading-relaxed text-haze">{service.summary}</p>
                    <span className="s-link mt-auto text-[13px]">Explore service <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" aria-hidden /></span>
                  </Link>
                ))}
              </div>
            </section>
          )
        })}
      </div>
    </div>
  )
}
