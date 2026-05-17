import { createServerSupabaseClient } from '@/lib/portal/supabase-server'
import { redirect } from 'next/navigation'
import Wizard from './Wizard'
import type { AnswerMap } from '@/lib/portal/prototype-readiness'

export const dynamic = 'force-dynamic'

export default async function PrototypeReadinessPage() {
  const supabase = createServerSupabaseClient()
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect('/portal/login?next=/portal/prototype-readiness')
  }

  // `redirect()` throws, so this is reachable only when session is non-null,
  // but TS doesn't narrow on `redirect`'s `never` return through destructuring.
  const userId = session!.user.id

  // Find an in-progress draft, or create one.
  let { data: assessment } = await supabase
    .from('prototype_assessments')
    .select('id, current_step, answers')
    .eq('user_id', userId)
    .eq('status', 'in_progress')
    .maybeSingle()

  if (!assessment) {
    const { data: created, error } = await supabase
      .from('prototype_assessments')
      .insert({
        user_id: userId,
        status: 'in_progress',
        current_step: 1,
        answers: {},
      })
      .select('id, current_step, answers')
      .single()
    if (error || !created) {
      return (
        <div className="py-12 text-center">
          <p className="text-[14px] text-red-600">
            We couldn’t start your assessment. Please refresh and try again.
          </p>
          {error?.message ? (
            <p className="mt-2 text-[12px] text-[#b8b8b0]">{error.message}</p>
          ) : null}
        </div>
      )
    }
    assessment = created
  }

  return (
    <Wizard
      assessmentId={assessment.id}
      initialStep={assessment.current_step ?? 1}
      initialAnswers={(assessment.answers as AnswerMap) ?? {}}
    />
  )
}
