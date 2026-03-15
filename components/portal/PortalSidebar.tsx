'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { createClient } from '@/lib/portal/supabase-client'
import { useRouter } from 'next/navigation'

interface SidebarProps {
  profile: {
    full_name: string
    role: string
    is_execom_staff: boolean
  }
  claimYears?: {
    id: string
    fiscal_year: number
    status: string
  }[]
}

const NAV_ITEMS = [
  { href: '/portal/dashboard', label: 'Dashboard' },
]

export default function PortalSidebar({ profile, claimYears = [] }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()

  async function handleSignOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/portal/login')
  }

  function isActive(href: string) {
    return pathname === href || pathname.startsWith(href + '/')
  }

  return (
    <aside className="w-[260px] min-h-screen bg-[#0d1b2a] flex flex-col flex-shrink-0">
      {/* Logo */}
      <div className="px-6 py-5 border-b border-white/5">
        <Link href="/portal/dashboard">
          <img
            src="/sred/images/logo-nav-white.png"
            alt="execom"
            className="h-8 w-auto"
          />
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {NAV_ITEMS.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`block px-3 py-2 rounded text-[13px] font-medium transition-colors ${
              isActive(item.href)
                ? 'bg-white/10 text-white'
                : 'text-white/50 hover:text-white/80 hover:bg-white/5'
            }`}
          >
            {item.label}
          </Link>
        ))}

        {/* Claim Years */}
        {claimYears.length > 0 && (
          <div className="pt-4">
            <p className="px-3 text-[11px] font-semibold uppercase tracking-[0.08em] text-white/30 mb-2">
              Claims
            </p>
            {claimYears.map((cy) => (
              <Link
                key={cy.id}
                href={`/portal/claims/${cy.id}/upload`}
                className={`block px-3 py-2 rounded text-[13px] font-medium transition-colors ${
                  pathname.includes(cy.id)
                    ? 'bg-white/10 text-white'
                    : 'text-white/50 hover:text-white/80 hover:bg-white/5'
                }`}
              >
                FY {cy.fiscal_year}
              </Link>
            ))}
          </div>
        )}

        {/* Settings */}
        <div className="pt-4">
          <Link
            href="/portal/settings"
            className={`block px-3 py-2 rounded text-[13px] font-medium transition-colors ${
              isActive('/portal/settings')
                ? 'bg-white/10 text-white'
                : 'text-white/50 hover:text-white/80 hover:bg-white/5'
            }`}
          >
            Settings
          </Link>
        </div>

        {/* Admin section */}
        {profile.is_execom_staff && (
          <div className="pt-4">
            <p className="px-3 text-[11px] font-semibold uppercase tracking-[0.08em] text-white/30 mb-2">
              Admin
            </p>
            <Link
              href="/portal/admin/clients"
              className={`block px-3 py-2 rounded text-[13px] font-medium transition-colors ${
                isActive('/portal/admin')
                  ? 'bg-white/10 text-white'
                  : 'text-white/50 hover:text-white/80 hover:bg-white/5'
              }`}
            >
              Clients
            </Link>
            <Link
              href="/portal/admin/reviews"
              className={`block px-3 py-2 rounded text-[13px] font-medium transition-colors ${
                isActive('/portal/admin/reviews')
                  ? 'bg-white/10 text-white'
                  : 'text-white/50 hover:text-white/80 hover:bg-white/5'
              }`}
            >
              Review Queue
            </Link>
          </div>
        )}
      </nav>

      {/* User info + Sign out */}
      <div className="px-4 py-4 border-t border-white/5">
        <p className="text-[13px] text-white/80 font-medium truncate">{profile.full_name}</p>
        <p className="text-[11px] text-white/30 uppercase tracking-wide mt-0.5">{profile.role}</p>
        <button
          onClick={handleSignOut}
          className="mt-3 text-[12px] text-white/30 hover:text-white/60 transition-colors"
        >
          Sign out
        </button>
      </div>
    </aside>
  )
}
