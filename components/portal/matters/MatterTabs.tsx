'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const TABS = [
  { key: 'overview', label: 'Overview', path: '' },
  { key: 'tasks', label: 'Tasks', path: '/tasks' },
  { key: 'documents', label: 'Documents', path: '/documents' },
  { key: 'filings', label: 'Filings', path: '/filings' },
  { key: 'activity', label: 'Activity', path: '/activity' },
] as const

export default function MatterTabs({ matterId }: { matterId: string }) {
  const pathname = usePathname()
  const base = `/portal/matters/${matterId}`

  function isActive(tab: (typeof TABS)[number]) {
    if (tab.path === '') return pathname === base
    return pathname.startsWith(base + tab.path)
  }

  return (
    <div className="flex gap-1 border-b border-[#E5E5E5] mb-6">
      {TABS.map((tab) => (
        <Link
          key={tab.key}
          href={base + tab.path}
          className={`px-4 py-2.5 text-[13px] font-medium transition-colors -mb-px ${
            isActive(tab)
              ? 'text-[#195E8E] border-b-2 border-[#195E8E]'
              : 'text-[#b8b8b0] hover:text-[#5A5A5A]'
          }`}
        >
          {tab.label}
        </Link>
      ))}
    </div>
  )
}
