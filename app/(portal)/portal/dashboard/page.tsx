import { createServerSupabaseClient } from '@/lib/portal/supabase-server'
import { redirect } from 'next/navigation'
import DashboardClient from './DashboardClient'

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
    .select('id, full_name, company_id')
    .eq('id', authUser.id)
    .single()

  const fullName =
    profile?.full_name ||
    (authUser.user_metadata?.full_name as string | undefined) ||
    ''

  return (
    <DashboardClient
      fullName={fullName}
      hasCompany={!!profile?.company_id}
    />
  )
}
