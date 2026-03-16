import { createServerSupabaseClient } from '@/lib/portal/supabase-server'
import { redirect } from 'next/navigation'
import SetupClient from './SetupClient'

export default async function SetupPage({
  params,
}: {
  params: { yearId: string }
}) {
  const supabase = createServerSupabaseClient()

  const {
    data: { session },
  } = await supabase.auth.getSession()
  if (!session) redirect('/portal/login')

  const { data: claimYear } = await supabase
    .from('claim_years')
    .select('*, companies(name, legal_name, bn, industry, address)')
    .eq('id', params.yearId)
    .single()

  const { data: contacts } = await supabase
    .from('claim_contacts')
    .select('*')
    .eq('claim_year_id', params.yearId)
    .order('created_at', { ascending: true })

  return (
    <SetupClient
      yearId={params.yearId}
      claimYear={claimYear}
      contacts={contacts || []}
    />
  )
}
