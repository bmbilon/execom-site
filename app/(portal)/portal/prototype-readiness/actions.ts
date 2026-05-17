'use server'

import { createServerSupabaseClient } from '@/lib/portal/supabase-server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { scoreAssessment, SECTIONS, type AnswerMap } from '@/lib/portal/prototype-readiness'

// ─── Save progress (without submitting) ────────────────────────────────────

export async function saveAssessmentProgress(params: {
  assessmentId: string
  answers: AnswerMap
  currentStep: number
}) {
  const { assessmentId, answers, currentStep } = params
  const supabase = createServerSupabaseClient()
  const {
    data: { session },
  } = await supabase.auth.getSession()
  if (!session) {
    return { ok: false as const, error: 'Not signed in.' }
  }

  // Surface a few common fields onto the row for the admin queue.
  const founder_name =
    typeof answers['founder_name'] === 'string' ? (answers['founder_name'] as string) : null
  const founder_email =
    typeof answers['founder_email'] === 'string' ? (answers['founder_email'] as string) : null
  const company_name =
    typeof answers['company_name'] === 'string' ? (answers['company_name'] as string) : null
  const product_name =
    typeof answers['product_name'] === 'string' ? (answers['product_name'] as string) : null

  const { error } = await supabase
    .from('prototype_assessments')
    .update({
      answers,
      current_step: currentStep,
      founder_name,
      founder_email,
      company_name,
      product_name,
    })
    .eq('id', assessmentId)
    .eq('user_id', session.user.id)
    .eq('status', 'in_progress')

  if (error) {
    return { ok: false as const, error: error.message }
  }

  revalidatePath('/portal/prototype-readiness')
  return { ok: true as const }
}

// ─── Submit final ──────────────────────────────────────────────────────────

export async function submitAssessment(params: {
  assessmentId: string
  answers: AnswerMap
}) {
  const { assessmentId, answers } = params
  const supabase = createServerSupabaseClient()
  const {
    data: { session },
  } = await supabase.auth.getSession()
  if (!session) {
    return { ok: false as const, error: 'Not signed in.' }
  }

  // Minimum validation: every question marked required must have a value.
  const missing: string[] = []
  for (const section of SECTIONS) {
    for (const q of section.questions) {
      if (!q.required) continue
      const v = answers[q.id]
      const empty =
        v === undefined ||
        v === null ||
        v === '' ||
        (Array.isArray(v) && v.length === 0)
      if (empty) missing.push(q.label)
    }
  }
  if (missing.length > 0) {
    return {
      ok: false as const,
      error: `Please answer the required questions before submitting: ${missing.slice(0, 3).join('; ')}${missing.length > 3 ? '…' : ''}`,
    }
  }

  const scored = scoreAssessment(answers)

  const founder_name =
    typeof answers['founder_name'] === 'string' ? (answers['founder_name'] as string) : null
  const founder_email =
    typeof answers['founder_email'] === 'string' ? (answers['founder_email'] as string) : null
  const company_name =
    typeof answers['company_name'] === 'string' ? (answers['company_name'] as string) : null
  const product_name =
    typeof answers['product_name'] === 'string' ? (answers['product_name'] as string) : null

  const { error } = await supabase
    .from('prototype_assessments')
    .update({
      answers,
      status: 'submitted',
      submitted_at: new Date().toISOString(),
      internal_score: scored.score,
      internal_tier: scored.tier,
      recommended_path: scored.recommendedPath,
      scored_at: new Date().toISOString(),
      founder_name,
      founder_email,
      company_name,
      product_name,
    })
    .eq('id', assessmentId)
    .eq('user_id', session.user.id)
    .eq('status', 'in_progress')

  if (error) {
    return { ok: false as const, error: error.message }
  }

  redirect('/portal/prototype-readiness/thank-you')
}

// ─── Staff: rescore + update review status / notes ─────────────────────────

export async function staffUpdateAssessment(params: {
  assessmentId: string
  status?:
    | 'submitted'
    | 'reviewing'
    | 'contacted'
    | 'closed_won'
    | 'closed_lost'
    | 'archived'
  internalNotes?: string
  rescore?: boolean
}) {
  const supabase = createServerSupabaseClient()
  const {
    data: { session },
  } = await supabase.auth.getSession()
  if (!session) return { ok: false as const, error: 'Not signed in.' }

  // Confirm staff role
  const { data: profile } = await supabase
    .from('profiles')
    .select('is_execom_staff')
    .eq('id', session.user.id)
    .single()
  if (!profile?.is_execom_staff) {
    return { ok: false as const, error: 'Not authorized.' }
  }

  const update: Record<string, unknown> = {}
  if (params.status) update.status = params.status
  if (params.internalNotes !== undefined) update.internal_notes = params.internalNotes

  if (params.rescore) {
    const { data: row } = await supabase
      .from('prototype_assessments')
      .select('answers')
      .eq('id', params.assessmentId)
      .single()
    if (row?.answers) {
      const s = scoreAssessment(row.answers as AnswerMap)
      update.internal_score = s.score
      update.internal_tier = s.tier
      update.recommended_path = s.recommendedPath
      update.scored_at = new Date().toISOString()
      update.scored_by = session.user.id
    }
  }

  const { error } = await supabase
    .from('prototype_assessments')
    .update(update)
    .eq('id', params.assessmentId)

  if (error) return { ok: false as const, error: error.message }

  revalidatePath('/portal/admin/prototype-readiness')
  revalidatePath(`/portal/admin/prototype-readiness/${params.assessmentId}`)
  return { ok: true as const }
}
