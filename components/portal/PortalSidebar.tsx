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
    // null/undefined when the user is a "prospect": signed up but no
    // execom client company attached yet. Used to hide nav items that
    // assume a company / SR&ED / matters context.
    has_company?: boolean | null
  }
  claimYears?: {
    id: string
    fiscal_year: number
    status: string
  }[]
}

// All possible nav items. We render a subset based on whether the user
// has a company attached. Prototype Readiness is always shown so a
// prospect can return to a draft, edit, or start a fresh one.
const NAV_ITEMS_CLIENT = [
  { href: '/portal/dashboard', label: 'Dashboard' },
  { href: '/portal/prototype-readiness', label: 'Prototype Readiness' },
  { href: '/portal/matters', label: 'Matters' },
  { href: '/portal/settings', label: 'Settings' },
]

const NAV_ITEMS_PROSPECT = [
  { href: '/portal/dashboard', label: 'Dashboard' },
  { href: '/portal/prototype-readiness', label: 'Prototype Readiness' },
  { href: '/portal/settings', label: 'Settings' },
]

export default function PortalSidebar({ profile, claimYears = [] }: SidebarProps) {
  void claimYears
  const navItems = profile.has_company ? NAV_ITEMS_CLIENT : NAV_ITEMS_PROSPECT
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
    <aside className="w-[260px] min-h-screen portal-sidebar flex flex-col flex-shrink-0">
      {/* Logo — links to the public marketing home page */}
      <div className="px-6 py-5 border-b border-white/5">
        <Link href="/" aria-label="execom home">
          <img
            src="/sred/images/logo-nav-white.png"
            alt="execom"
            className="h-8 w-auto"
          />
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`block px-3 py-2 rounded text-[13px] font-medium transition-colors ${
              isActive(item.href)
                ? 'portal-nav-item active text-white'
                : 'portal-nav-item text-white/50 hover:text-white/80'
            }`}
          >
            {item.label}
          </Link>
        ))}

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
                  ? 'portal-nav-item active text-white'
                  : 'portal-nav-item text-white/50 hover:text-white/80'
              }`}
            >
              Clients
            </Link>
            <Link
              href="/portal/admin/reviews"
              className={`block px-3 py-2 rounded text-[13px] font-medium transition-colors ${
                isActive('/portal/admin/reviews')
                  ? 'portal-nav-item active text-white'
                  : 'portal-nav-item text-white/50 hover:text-white/80'
              }`}
            >
              Review Queue
            </Link>
            <Link
              href="/portal/admin/incorporations"
              className={`block px-3 py-2 rounded text-[13px] font-medium transition-colors ${
                isActive('/portal/admin/incorporations')
                  ? 'portal-nav-item active text-white'
                  : 'portal-nav-item text-white/50 hover:text-white/80'
              }`}
            >
              Incorporations
            </Link>
            <Link
              href="/portal/admin/ip-transfers"
              className={`block px-3 py-2 rounded text-[13px] font-medium transition-colors ${
                isActive('/portal/admin/ip-transfers')
                  ? 'portal-nav-item active text-white'
                  : 'portal-nav-item text-white/50 hover:text-white/80'
              }`}
            >
              IP Transfers
            </Link>
            <Link
              href="/portal/admin/trademarks"
              className={`block px-3 py-2 rounded text-[13px] font-medium transition-colors ${
                isActive('/portal/admin/trademarks')
                  ? 'portal-nav-item active text-white'
                  : 'portal-nav-item text-white/50 hover:text-white/80'
              }`}
            >
              Trademarks
            </Link>
            <Link
              href="/portal/admin/prototype-readiness"
              className={`block px-3 py-2 rounded text-[13px] font-medium transition-colors ${
                isActive('/portal/admin/prototype-readiness')
                  ? 'portal-nav-item active text-white'
                  : 'portal-nav-item text-white/50 hover:text-white/80'
              }`}
            >
              Prototype Readiness
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
