import { createServerSupabaseClient } from '@/lib/portal/supabase-server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

// All /portal/admin/* routes share this layout, which means it's the
// single chokepoint where we gate access on is_execom_staff. We:
//   1. Bounce unauthenticated users to /portal/login (preserving their
//      intended URL so they land where they meant to after sign-in).
//   2. For authenticated-but-not-staff users, render an explicit 403
//      page rather than silently redirecting to /portal/dashboard.
//      Silent redirects were causing the email-notification link to
//      dead-end for Brett before is_execom_staff was set on his profile.
export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = createServerSupabaseClient()
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) redirect('/portal/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('is_execom_staff')
    .eq('id', session.user.id)
    .single()

  if (!profile?.is_execom_staff) {
    return (
      <div className="max-w-[560px] mx-auto py-20">
        <div className="portal-card p-10 text-center">
          <p className="text-[11px] font-semibold uppercase tracking-[0.10em] text-[#b8b8b0] mb-4">
            403 · Restricted
          </p>
          <h1 className="portal-title text-[1.5rem] font-serif mb-3">
            You don&apos;t have access to this page.
          </h1>
          <p className="portal-body text-[14px] mb-8">
            The admin area is only available to execom staff. If you think
            you should have access, reach out to your contact at execom.
          </p>
          <div className="flex items-center justify-center gap-3">
            <Link href="/portal/dashboard" className="portal-button">
              Back to dashboard
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
