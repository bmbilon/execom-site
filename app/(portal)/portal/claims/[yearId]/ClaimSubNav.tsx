'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const TABS = [
  { segment: 'upload', label: 'Upload' },
  { segment: 'projects', label: 'Projects' },
  { segment: 'review', label: 'Review' },
  { segment: 'export', label: 'Export' },
]

export default function ClaimSubNav({ yearId }: { yearId: string }) {
  const pathname = usePathname()

  return (
    <nav className="flex gap-1 border-b border-[#E5E5E5]">
      {TABS.map((tab) => {
        const href = `/portal/claims/${yearId}/${tab.segment}`
        const isActive = pathname.startsWith(href)
        return (
          <Link
            key={tab.segment}
            href={href}
            className={`px-4 py-2.5 text-[13px] font-semibold transition-colors border-b-2 -mb-px ${
              isActive
                ? 'text-blue border-blue'
                : 'text-[#5A5A5A] border-transparent hover:text-[#1A1A1A]'
            }`}
          >
            {tab.label}
          </Link>
        )
      })}
    </nav>
  )
}
