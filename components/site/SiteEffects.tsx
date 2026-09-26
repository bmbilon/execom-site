"use client"

import { usePathname } from "next/navigation"
import { useEffect } from "react"

declare global {
  interface Window {
    __siteHydrated?: boolean
  }
}

/**
 * Global, render-less effects for the marketing site:
 *  - reveal-on-scroll for elements marked [data-reveal]
 *  - cursor spotlight for .s-spot surfaces
 */
export function SiteEffects() {
  const pathname = usePathname()

  useEffect(() => {
    window.__siteHydrated = true
    document.documentElement.classList.add("reveal-ready")

    const els = Array.from(document.querySelectorAll<HTMLElement>("[data-reveal]:not(.is-in)"))
    if (!("IntersectionObserver" in window)) {
      els.forEach((el) => el.classList.add("is-in"))
      return
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-in")
            io.unobserve(entry.target)
          }
        }
      },
      { rootMargin: "0px 0px -6% 0px", threshold: 0.06 },
    )
    els.forEach((el) => io.observe(el))
    return () => io.disconnect()
  }, [pathname])

  useEffect(() => {
    let frame = 0
    const onMove = (e: PointerEvent) => {
      const target = (e.target as HTMLElement | null)?.closest?.(".s-spot") as HTMLElement | null
      if (!target) return
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(() => {
        const r = target.getBoundingClientRect()
        target.style.setProperty("--mx", `${e.clientX - r.left}px`)
        target.style.setProperty("--my", `${e.clientY - r.top}px`)
      })
    }
    document.addEventListener("pointermove", onMove, { passive: true })
    return () => {
      cancelAnimationFrame(frame)
      document.removeEventListener("pointermove", onMove)
    }
  }, [])

  return null
}

/**
 * Inline, pre-paint script: hide [data-reveal] elements only when JS runs,
 * and un-hide everything if hydration has not happened within 3.5s.
 */
export const REVEAL_BOOTSTRAP = `(function(){try{var d=document.documentElement;d.classList.add('reveal-ready');setTimeout(function(){if(!window.__siteHydrated){d.classList.remove('reveal-ready')}},3500)}catch(e){}})();`
