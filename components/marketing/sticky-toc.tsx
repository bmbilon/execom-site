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
    <nav className="hidden lg:block pl-5" aria-label="Table of contents">
      <div className="toc">
        <p className="toc-title">On this page</p>
        {items.map(({ id, label }) => (
          <button
            key={id}
            onClick={() => scrollTo(id)}
            className={`toc-link ${activeId === id ? "active" : ""}`}
          >
            {label}
          </button>
        ))}
      </div>
    </nav>
  )
}
