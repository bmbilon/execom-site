import { createServerSupabaseClient } from '@/lib/portal/supabase-server'
import { redirect } from 'next/navigation'
import SettingsClient from './SettingsClient'

export default async function SettingsPage() {
  const supabase = createServerSupabaseClient()
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) redirect('/portal/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*, companies(*)')
    .eq('id', session.user.id)
    .single()

  if (!profile) redirect('/portal/dashboard')

  // Get team members
  const { data: team } = await supabase
    .from('profiles')
    .select('id, email, full_name, role, created_at')
    .eq('company_id', profile.company_id)
    .order('created_at')

  return (
    <SettingsClient
      profile={profile}
      company={profile.companies}
      team={team || []}
    />
  )
}
