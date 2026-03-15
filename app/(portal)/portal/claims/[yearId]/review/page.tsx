import { createServerSupabaseClient } from '@/lib/portal/supabase-server'
import { notFound } from 'next/navigation'
import ReviewClient from './ReviewClient'

export default async function ReviewPage({
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

  const { data: projects } = await supabase
    .from('projects')
    .select('*')
    .eq('claim_year_id', params.yearId)
    .order('sort_order')

  const { data: costs } = await supabase
    .from('costs')
    .select('*')
    .eq('claim_year_id', params.yearId)

  const { data: evidence } = await supabase
    .from('evidence')
    .select('*')
    .eq('claim_year_id', params.yearId)

  const { data: files } = await supabase
    .from('files')
    .select('*')
    .eq('claim_year_id', params.yearId)

  const { data: profile } = await supabase
    .from('profiles')
    .select('id, role')
    .eq('id', (await supabase.auth.getSession()).data.session?.user.id || '')
    .single()

  return (
    <ReviewClient
      yearId={params.yearId}
      claimYear={claimYear}
      company={claimYear.companies}
      projects={projects || []}
      costs={costs || []}
      evidence={evidence || []}
      files={files || []}
      profileId={profile?.id || ''}
      role={profile?.role || 'viewer'}
    />
  )
}
