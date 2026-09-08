'use client'

// Every "start the assessor" call to action on the page.
//
// These were plain `#assessor` fragment links, which failed twice over: the
// first click only scrolled to a card still sitting on its intro screen, and a
// second click did nothing at all, because the browser treats a click on the
// fragment already in the URL as a no-op. On desktop, where the card sits
// beside the hero and is on screen from the start, the first click looked dead
// too.
//
// So this dispatches an event the assessor listens for, and the assessor both
// opens the first question and scrolls itself into view. The element stays an
// anchor with a real href: before hydration it still scrolls, which is the
// worst case rather than a dead control.

import type { ReactNode } from 'react'

export const SRED_START_EVENT = 'sred:start'

export default function StartAssessorLink({
  className,
  children,
}: {
  className?: string
  children: ReactNode
}) {
  return (
    <a
      href="#assessor"
      className={className}
      onClick={(e) => {
        e.preventDefault()
        window.dispatchEvent(new CustomEvent(SRED_START_EVENT))
      }}
    >
      {children}
    </a>
  )
}
