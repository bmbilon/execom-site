import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { runClaimRecalculation } from '@/lib/services/recalcService'

/**
 * PATCH /api/portal/classifications/:costLineItemId
 *
 * Update classification for a cost line item, then trigger recalculation.
 * Body: { likely_category, confidence_score?, related_party_flag?, excluded_flag?, rationale?, classified_by? }
 */
export async function PATCH(
  request: Request,
  { params }: { params: { costLineItemId: string } }
) {
  try {
    const cookieStore = cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              )
            } catch {
              // Called from route handler
            }
          },
        },
      }
    )

    const {
      data: { session },
    } = await supabase.auth.getSession()
    if (!session) {
      return NextResponse.json(
        { ok: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const costLineItemId = params.costLineItemId
    const body = await request.json()

    // Resolve claim_year_id from cost_line_items
    const { data: lineItem, error: lineErr } = await supabase
      .from('cost_line_items')
      .select('claim_year_id')
      .eq('id', costLineItemId)
      .single()

    if (lineErr || !lineItem) {
      return NextResponse.json(
        { ok: false, error: 'Cost line item not found' },
        { status: 404 }
      )
    }

    // Update classification
    const updatePayload: Record<string, unknown> = {}
    if (body.likely_category !== undefined)
      updatePayload.likely_category = body.likely_category
    if (body.confidence_score !== undefined)
      updatePayload.confidence_score = body.confidence_score
    if (body.related_party_flag !== undefined)
      updatePayload.related_party_flag = body.related_party_flag
    if (body.excluded_flag !== undefined)
      updatePayload.excluded_flag = body.excluded_flag
    if (body.rationale !== undefined) updatePayload.rationale = body.rationale
    if (body.classified_by !== undefined)
      updatePayload.classified_by = body.classified_by

    const { data: classification, error: clsErr } = await supabase
      .from('cost_line_classifications')
      .update(updatePayload)
      .eq('cost_line_item_id', costLineItemId)
      .select()
      .single()

    if (clsErr) {
      return NextResponse.json(
        { ok: false, error: clsErr.message },
        { status: 400 }
      )
    }

    // Trigger recalculation (non-blocking on failure)
    let recalcResult = null
    try {
      recalcResult = await runClaimRecalculation(
        supabase,
        lineItem.claim_year_id,
        {
          triggerSource: 'classification_change',
          triggerEntity: 'cost_line_classifications',
          triggerEntityId: classification.id,
          initiatedBy: session.user.id,
        }
      )
    } catch (recalcErr) {
      console.warn('Post-classification recalculation failed:', recalcErr)
    }

    return NextResponse.json({
      ok: true,
      data: {
        classification,
        recalculation: recalcResult
          ? { status: recalcResult.status, runId: recalcResult.runId }
          : null,
      },
    })
  } catch (e) {
    console.error('Classification update error:', e)
    return NextResponse.json(
      { ok: false, error: 'Internal error' },
      { status: 500 }
    )
  }
}
