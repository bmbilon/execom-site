import { createServerSupabaseClient } from '@/lib/portal/supabase-server'
import { notFound } from 'next/navigation'
import ReviewWorkspaceClient from './ReviewWorkspaceClient'

export default async function ReviewWorkspacePage({
  params,
}: {
  params: { reviewId: string }
}) {
  const supabase = createServerSupabaseClient()
  const { data: { session } } = await supabase.auth.getSession()

  const { data: review } = await supabase
    .from('reviews')
    .select('*, claim_years(*, companies(*))')
    .eq('id', params.reviewId)
    .single()

  if (!review) notFound()

  const claimYearId = review.claim_year_id

  const { data: projects } = await supabase
    .from('projects')
    .select('*')
    .eq('claim_year_id', claimYearId)
    .order('sort_order')

  const { data: costs } = await supabase
    .from('costs')
    .select('*')
    .eq('claim_year_id', claimYearId)

  const { data: evidence } = await supabase
    .from('evidence')
    .select('*, files(file_name)')
    .eq('claim_year_id', claimYearId)

  const { data: comments } = await supabase
    .from('review_comments')
    .select('*, profiles(full_name)')
    .eq('review_id', params.reviewId)
    .order('created_at')

  return (
    <ReviewWorkspaceClient
      review={review}
      claimYear={review.claim_years as any}
      company={(review.claim_years as any)?.companies}
      projects={projects || []}
      costs={costs || []}
      evidence={evidence || []}
      comments={comments || []}
      reviewerId={session?.user.id || ''}
    />
  )
}
