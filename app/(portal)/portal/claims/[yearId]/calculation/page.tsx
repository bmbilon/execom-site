import { createServerSupabaseClient } from '@/lib/portal/supabase-server'
import { notFound } from 'next/navigation'
import CalculationStatusClient from './CalculationStatusClient'

export default async function CalculationStatusPage({
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

  // Fetch recent recalculation runs
  const { data: recalcRuns } = await supabase
    .from('recalc_runs')
    .select('*')
    .eq('claim_year_id', params.yearId)
    .order('started_at', { ascending: false })
    .limit(20)

  // Fetch current lock status
  const { data: recalcLock } = await supabase
    .from('claim_recalc_locks')
    .select('*')
    .eq('claim_year_id', params.yearId)
    .maybeSingle()

  // Fetch current federal line values
  const { data: federalLines } = await supabase
    .from('federal_line_values')
    .select('*')
    .eq('claim_year_id', params.yearId)
    .is('snapshot_id', null)
    .order('form_code')
    .order('line_code')

  // Fetch current provincial line values
  const { data: provincialLines } = await supabase
    .from('provincial_line_values')
    .select('*')
    .eq('claim_year_id', params.yearId)
    .is('snapshot_id', null)
    .order('province_code')
    .order('line_code')

  // Fetch review issues
  const { data: reviewIssues } = await supabase
    .from('review_issues')
    .select('*')
    .eq('claim_year_id', params.yearId)
    .eq('resolution_status', 'open')
    .order('severity')

  return (
    <CalculationStatusClient
      yearId={params.yearId}
      claimYear={claimYear}
      recalcRuns={recalcRuns ?? []}
      recalcLock={recalcLock ?? null}
      federalLines={federalLines ?? []}
      provincialLines={provincialLines ?? []}
      reviewIssues={reviewIssues ?? []}
    />
  )
}
