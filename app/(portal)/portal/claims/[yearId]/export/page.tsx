import { createServerSupabaseClient } from '@/lib/portal/supabase-server'
import { notFound } from 'next/navigation'
import ExportClient from './ExportClient'

export default async function ExportPage({
  params,
}: {
  params: { yearId: string }
}) {
  const supabase = createServerSupabaseClient()

  const { data: claimYear } = await supabase
    .from('claim_years')
    .select('*, companies(*)')
    .eq('id', params.yearId)
    .single()

  if (!claimYear) notFound()

  const { data: outputs } = await supabase
    .from('claim_outputs')
    .select('*')
    .eq('claim_year_id', params.yearId)
    .order('created_at', { ascending: false })

  return (
    <ExportClient
      yearId={params.yearId}
      claimYear={claimYear}
      outputs={outputs || []}
    />
  )
}
