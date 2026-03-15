import { createServerSupabaseClient } from '@/lib/portal/supabase-server'
import { notFound } from 'next/navigation'
import ProjectsClient from './ProjectsClient'

export default async function ProjectsPage({
  params,
}: {
  params: { yearId: string }
}) {
  const supabase = createServerSupabaseClient()

  const { data: claimYear } = await supabase
    .from('claim_years')
    .select('id, company_id')
    .eq('id', params.yearId)
    .single()

  if (!claimYear) notFound()

  const { data: projects } = await supabase
    .from('projects')
    .select('*')
    .eq('claim_year_id', params.yearId)
    .order('sort_order', { ascending: true })

  // Get cost and evidence counts per project
  const projectIds = (projects || []).map((p) => p.id)
  const { data: costs } = await supabase
    .from('costs')
    .select('project_id')
    .in('project_id', projectIds.length > 0 ? projectIds : ['_none_'])

  const { data: evidence } = await supabase
    .from('evidence')
    .select('project_id')
    .in('project_id', projectIds.length > 0 ? projectIds : ['_none_'])

  const costCounts: Record<string, number> = {}
  const evidenceCounts: Record<string, number> = {}

  costs?.forEach((c) => {
    costCounts[c.project_id] = (costCounts[c.project_id] || 0) + 1
  })
  evidence?.forEach((e) => {
    evidenceCounts[e.project_id] = (evidenceCounts[e.project_id] || 0) + 1
  })

  return (
    <ProjectsClient
      yearId={params.yearId}
      companyId={claimYear.company_id}
      projects={projects || []}
      costCounts={costCounts}
      evidenceCounts={evidenceCounts}
    />
  )
}
