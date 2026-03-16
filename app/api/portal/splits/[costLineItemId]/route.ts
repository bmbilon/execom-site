import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { runClaimRecalculation } from '@/lib/services/recalcService'

/**
 * PUT /api/portal/splits/:costLineItemId
 *
 * Replace project splits for a cost line item, then trigger recalculation.
 * Body: { splits: [{ project_id, allocation_percent, allocation_amount, province_code?, province_percent?, review_status? }] }
 */
export async function PUT(
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
    const { splits } = body as {
      splits: {
        project_id: string
        allocation_percent: number
        allocation_amount: number
        province_code?: string
        province_percent?: number
        review_status?: string
      }[]
    }

    if (!Array.isArray(splits)) {
      return NextResponse.json(
        { ok: false, error: 'Missing required field: splits (array)' },
        { status: 400 }
      )
    }

    // Resolve claim_year_id
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

    // Delete existing splits for this line item, then insert new ones
    const { error: delErr } = await supabase
      .from('cost_line_project_splits')
      .delete()
      .eq('cost_line_item_id', costLineItemId)

    if (delErr) {
      return NextResponse.json(
        { ok: false, error: delErr.message },
        { status: 400 }
      )
    }

    const insertRows = splits.map((s) => ({
      cost_line_item_id: costLineItemId,
      project_id: s.project_id,
      allocation_percent: s.allocation_percent,
      allocation_amount: s.allocation_amount,
      province_code: s.province_code ?? null,
      province_percent: s.province_percent ?? 100,
      review_status: s.review_status ?? 'pending',
    }))

    const { data: inserted, error: insErr } = await supabase
      .from('cost_line_project_splits')
      .insert(insertRows)
      .select()

    if (insErr) {
      return NextResponse.json(
        { ok: false, error: insErr.message },
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
          triggerSource: 'split_change',
          triggerEntity: 'cost_line_project_splits',
          triggerEntityId: costLineItemId,
          initiatedBy: session.user.id,
        }
      )
    } catch (recalcErr) {
      console.warn('Post-split recalculation failed:', recalcErr)
    }

    return NextResponse.json({
      ok: true,
      data: {
        splits: inserted,
        recalculation: recalcResult
          ? { status: recalcResult.status, runId: recalcResult.runId }
          : null,
      },
    })
  } catch (e) {
    console.error('Split update error:', e)
    return NextResponse.json(
      { ok: false, error: 'Internal error' },
      { status: 500 }
    )
  }
}
