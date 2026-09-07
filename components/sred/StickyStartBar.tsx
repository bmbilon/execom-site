'use client'

// A thin bar that appears only once the assessor has scrolled out of view, and
// only before the visitor has started it. No overlay, no modal, no dismissal
// nag: it is the same primary action, kept within thumb reach on a long page.

import { useEffect, useState } from 'react'

export default function StickyStartBar() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const target = document.getElementById('assessor')
    if (!target) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        // Once someone is mid-flow the card grows tall enough that it is always
        // partly on screen, so this naturally stops showing after they start.
        setVisible(!entry.isIntersecting)
      },
      { rootMargin: '-80px 0px 0px 0px', threshold: 0 }
    )
    observer.observe(target)
    return () => observer.disconnect()
  }, [])

  if (!visible) return null

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-white/10 bg-[#04141e]/95 backdrop-blur-sm px-4 py-3 lg:hidden">
      <a href="#assessor" className="btn-premium w-full justify-center">
        Estimate my SR&amp;ED claim
      </a>
    </div>
  )
}
