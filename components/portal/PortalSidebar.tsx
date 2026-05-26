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
    is_super_admin?: boolean
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

// Three nav variants, picked at render time:
//   STAFF    — execom staff get the admin queues nav. Dashboard becomes
//              the queue overview, individual workflow links go to the
//              admin queue pages, not the founder-facing wizards.
//   CLIENT   — onboarded founder with a company attached.
//   PROSPECT — signed-up user without a company yet. Hides the matter
//              / SR&ED routes that would require company context anyway.
const NAV_ITEMS_STAFF = [
  { href: '/portal/dashboard', label: 'Dashboard' },
  { href: '/portal/admin/prototype-readiness', label: 'Prototype Applications' },
  { href: '/portal/admin/sred', label: 'SR&ED Applications' },
  { href: '/portal/admin/incorporations', label: 'Corporate Setup' },
  { href: '/portal/admin/trademarks', label: 'Trademarks' },
  { href: '/portal/admin/ip-transfers', label: 'IP Assignment' },
  { href: '/portal/admin/concept-validation', label: 'Concept Validation' },
  { href: '/portal/admin/business-planning', label: 'Business Planning' },
  { href: '/portal/settings', label: 'Settings' },
]

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
  const navItems = profile.is_execom_staff
    ? NAV_ITEMS_STAFF
    : profile.has_company
      ? NAV_ITEMS_CLIENT
      : NAV_ITEMS_PROSPECT
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
      {/* Logo — links to the public marketing home page. Matches the
          marketing header logo treatment (44px tall, brightness-0 invert
          for pure-white silhouette on dark glass). */}
      <div className="px-6 py-5 border-b border-white/5">
        <Link href="/" aria-label="execom home" className="inline-flex">
          <img
            src="/execom-logo-full.png"
            alt="execom"
            className="h-11 w-auto opacity-90 hover:opacity-100 transition-opacity brightness-0 invert"
            style={{ objectFit: "contain" }}
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

        {/* Staff-only secondary tools — not part of the main queue nav.
            Clients + Review Queue are cross-cutting utilities rather than
            workflow queues, so they live below the primary list. */}
        {profile.is_execom_staff && (
          <div className="pt-4">
            <p className="px-3 text-[11px] font-semibold uppercase tracking-[0.08em] text-white/30 mb-2">
              Tools
            </p>
            <Link
              href="/portal/admin/clients"
              className={`block px-3 py-2 rounded text-[13px] font-medium transition-colors ${
                isActive('/portal/admin/clients')
                  ? 'portal-nav-item active text-white'
                  : 'portal-nav-item text-white/50 hover:text-white/80'
              }`}
            >
              Clients
            </Link>
            <Link
              href="/portal/admin/files"
              className={`block px-3 py-2 rounded text-[13px] font-medium transition-colors ${
                isActive('/portal/admin/files')
                  ? 'portal-nav-item active text-white'
                  : 'portal-nav-item text-white/50 hover:text-white/80'
              }`}
            >
              Files
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
              href="/portal/admin/audit"
              className={`block px-3 py-2 rounded text-[13px] font-medium transition-colors ${
                isActive('/portal/admin/audit')
                  ? 'portal-nav-item active text-white'
                  : 'portal-nav-item text-white/50 hover:text-white/80'
              }`}
            >
              Audit Log
            </Link>
            {profile.is_super_admin && (
              <>
                <Link
                  href="/portal/admin/users"
                  className={`block px-3 py-2 rounded text-[13px] font-medium transition-colors ${
                    isActive('/portal/admin/users')
                      ? 'portal-nav-item active text-white'
                      : 'portal-nav-item text-white/50 hover:text-white/80'
                  }`}
                >
                  Users
                </Link>
                <Link
                  href="/portal/admin/system"
                  className={`block px-3 py-2 rounded text-[13px] font-medium transition-colors ${
                    isActive('/portal/admin/system')
                      ? 'portal-nav-item active text-white'
                      : 'portal-nav-item text-white/50 hover:text-white/80'
                  }`}
                >
                  System
                </Link>
              </>
            )}
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
