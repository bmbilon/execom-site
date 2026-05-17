import { createServerSupabaseClient } from '@/lib/portal/supabase-server'
import { redirect } from 'next/navigation'
import DashboardClient from './DashboardClient'
import OwnerDashboard from '@/components/portal/OwnerDashboard'

export default async function DashboardPage() {
  const supabase = createServerSupabaseClient()
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) redirect('/portal/login')

  // `redirect()` throws, so this is reachable only when session is non-null,
  // but TS doesn't narrow on `redirect`'s `never` return through destructuring.
  const authUser = session!.user

  // Profile may not exist yet for brand-new signups (auth trigger races
  // with the first dashboard render). We render the tile layout regardless;
  // the Company Setup tile is where missing profile / company data gets
  // filled in.
  const { data: profile } = await supabase
    .from('profiles')
    .select('id, full_name, company_id, is_execom_staff')
    .eq('id', authUser.id)
    .single()

  const fullName =
    profile?.full_name ||
    (authUser.user_metadata?.full_name as string | undefined) ||
    ''

  // Execom staff get a different dashboard: queues across all clients
  // rather than the founder-facing workflow tiles. The @ts-expect-error
  // is the standard Next.js workaround for async server components,
  // which return Promise<Element> but render fine at runtime.
  if (profile?.is_execom_staff) {
    // @ts-expect-error Server Component
    return <OwnerDashboard fullName={fullName} />
  }

  return (
    <DashboardClient
      fullName={fullName}
      hasCompany={!!profile?.company_id}
    />
  )
}
