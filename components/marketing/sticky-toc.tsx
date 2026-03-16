"use client"

import { useEffect, useState } from "react"

interface TocItem {
  id: string
  label: string
}

interface StickyTocProps {
  items: TocItem[]
}

export function StickyToc({ items }: StickyTocProps) {
  const [activeId, setActiveId] = useState<string>("")

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        // Find the first intersecting section
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)

        if (visible.length > 0) {
          setActiveId(visible[0].target.id)
        }
      },
      { rootMargin: "-80px 0px -60% 0px", threshold: 0 }
    )

    items.forEach(({ id }) => {
      const el = document.getElementById(id)
      if (el) observer.observe(el)
    })

    return () => observer.disconnect()
  }, [items])

  const scrollTo = (id: string) => {
    const el = document.getElementById(id)
    if (el) {
      const y = el.getBoundingClientRect().top + window.scrollY - 80
      window.scrollTo({ top: y, behavior: "smooth" })
    }
  }

  return (
    <nav className="hidden lg:block" aria-label="Table of contents">
      <div className="sticky top-24 space-y-1">
        <p className="text-caption uppercase tracking-widest text-muted mb-4">
          On this page
        </p>
        {items.map(({ id, label }) => (
          <button
            key={id}
            onClick={() => scrollTo(id)}
            className={`block w-full text-left text-[13px] leading-relaxed py-1.5 pl-3 border-l-2 transition-all duration-200 ${
              activeId === id
                ? "border-teal text-fg font-medium"
                : "border-transparent text-muted hover:text-fg hover:border-border"
            }`}
          >
            {label}
          </button>
        ))}
      </div>
    </nav>
  )
}
