import { createServerSupabaseClient } from '@/lib/portal/supabase-server'
import { notFound } from 'next/navigation'
import ProjectDetailClient from './ProjectDetailClient'

export default async function ProjectDetailPage({
  params,
}: {
  params: { yearId: string; projectId: string }
}) {
  const supabase = createServerSupabaseClient()

  const { data: project } = await supabase
    .from('projects')
    .select('*')
    .eq('id', params.projectId)
    .single()

  if (!project) notFound()

  const { data: evidence } = await supabase
    .from('evidence')
    .select('*, files(file_name)')
    .eq('project_id', params.projectId)
    .order('sort_order', { ascending: true })

  const { data: costs } = await supabase
    .from('costs')
    .select('*')
    .eq('project_id', params.projectId)
    .order('sort_order', { ascending: true })

  // Get available files for evidence linking
  const { data: availableFiles } = await supabase
    .from('files')
    .select('id, file_name, category')
    .eq('claim_year_id', params.yearId)

  return (
    <ProjectDetailClient
      project={project}
      yearId={params.yearId}
      evidence={evidence || []}
      costs={costs || []}
      availableFiles={availableFiles || []}
    />
  )
}
