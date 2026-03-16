import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { runClaimRecalculation } from '@/lib/services/recalcService'

/**
 * POST /api/portal/assistance/:yearId
 *
 * Create or update a manual assistance item, then trigger recalculation.
 * Body: { assistance_type, source_name, amount, linked_project_id?, treatment_notes? }
 *
 * DELETE /api/portal/assistance/:yearId
 *
 * Delete an assistance item by id, then trigger recalculation.
 * Body: { assistanceId }
 */

function createSupabase() {
  const cookieStore = cookies()
  return createServerClient(
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
}

export async function POST(
  request: Request,
  { params }: { params: { yearId: string } }
) {
  try {
    const supabase = createSupabase()

    const {
      data: { session },
    } = await supabase.auth.getSession()
    if (!session) {
      return NextResponse.json(
        { ok: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const yearId = params.yearId
    const body = await request.json()
    const { assistance_type, source_name, amount, linked_project_id, treatment_notes } =
      body as {
        assistance_type: string
        source_name: string
        amount: number
        linked_project_id?: string
        treatment_notes?: string
      }

    if (!assistance_type || !source_name || amount === undefined) {
      return NextResponse.json(
        {
          ok: false,
          error: 'Missing required fields: assistance_type, source_name, amount',
        },
        { status: 400 }
      )
    }

    // Upsert manual assistance item (generated_by = NULL means manual)
    const { data: item, error } = await supabase
      .from('assistance_items')
      .upsert(
        {
          claim_year_id: yearId,
          assistance_type,
          source_name,
          amount,
          linked_project_id: linked_project_id ?? null,
          treatment_notes: treatment_notes ?? null,
          generated_by: null, // explicit: manual entry
        },
        {
          onConflict: 'claim_year_id,source_name',
          ignoreDuplicates: false,
        }
      )
      .select()
      .single()

    if (error) {
      return NextResponse.json(
        { ok: false, error: error.message },
        { status: 400 }
      )
    }

    // Trigger recalculation
    let recalcResult = null
    try {
      recalcResult = await runClaimRecalculation(supabase, yearId, {
        triggerSource: 'assistance_change',
        triggerEntity: 'assistance_items',
        triggerEntityId: item.id,
        initiatedBy: session.user.id,
      })
    } catch (recalcErr) {
      console.warn('Post-assistance recalculation failed:', recalcErr)
    }

    return NextResponse.json({
      ok: true,
      data: {
        assistanceItem: item,
        recalculation: recalcResult
          ? { status: recalcResult.status, runId: recalcResult.runId }
          : null,
      },
    })
  } catch (e) {
    console.error('Assistance upsert error:', e)
    return NextResponse.json(
      { ok: false, error: 'Internal error' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { yearId: string } }
) {
  try {
    const supabase = createSupabase()

    const {
      data: { session },
    } = await supabase.auth.getSession()
    if (!session) {
      return NextResponse.json(
        { ok: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const yearId = params.yearId
    const body = await request.json()
    const { assistanceId } = body as { assistanceId: string }

    if (!assistanceId) {
      return NextResponse.json(
        { ok: false, error: 'Missing required field: assistanceId' },
        { status: 400 }
      )
    }

    // Verify ownership (claim_year_id match) and delete
    const { error } = await supabase
      .from('assistance_items')
      .delete()
      .eq('id', assistanceId)
      .eq('claim_year_id', yearId)

    if (error) {
      return NextResponse.json(
        { ok: false, error: error.message },
        { status: 400 }
      )
    }

    // Trigger recalculation
    let recalcResult = null
    try {
      recalcResult = await runClaimRecalculation(supabase, yearId, {
        triggerSource: 'assistance_delete',
        triggerEntity: 'assistance_items',
        triggerEntityId: assistanceId,
        initiatedBy: session.user.id,
      })
    } catch (recalcErr) {
      console.warn('Post-assistance-delete recalculation failed:', recalcErr)
    }

    return NextResponse.json({
      ok: true,
      data: {
        deleted: assistanceId,
        recalculation: recalcResult
          ? { status: recalcResult.status, runId: recalcResult.runId }
          : null,
      },
    })
  } catch (e) {
    console.error('Assistance delete error:', e)
    return NextResponse.json(
      { ok: false, error: 'Internal error' },
      { status: 500 }
    )
  }
}
