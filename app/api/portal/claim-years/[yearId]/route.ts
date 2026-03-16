import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { runClaimRecalculation } from '@/lib/services/recalcService'

/**
 * PATCH /api/portal/claim-years/:yearId
 *
 * Update claim-year metadata fields that affect calculation, then trigger recalculation.
 * Recalc-triggering fields: method_election, associated_corp_flag, taxable_capital_eoy,
 * prior_year_taxable_income_on, specified_capital_amount, mb_renunciation_flag
 *
 * Non-triggering fields (status, notes, etc.) update without recalculation.
 */

const RECALC_TRIGGER_FIELDS = new Set([
  'method_election',
  'associated_corp_flag',
  'taxable_capital_eoy',
  'prior_year_taxable_income_on',
  'specified_capital_amount',
  'mb_renunciation_flag',
  'tax_year_start',
  'tax_year_end',
])

export async function PATCH(
  request: Request,
  { params }: { params: { yearId: string } }
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

    const yearId = params.yearId
    const body = await request.json()

    // Whitelist allowed updatable fields
    const allowedFields = [
      'method_election',
      'associated_corp_flag',
      'taxable_capital_eoy',
      'prior_year_taxable_income_on',
      'specified_capital_amount',
      'mb_renunciation_flag',
      'tax_year_start',
      'tax_year_end',
      'status',
      'notes',
    ]

    const updatePayload: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    }

    let hasRecalcTriggerField = false

    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updatePayload[field] = body[field]
        if (RECALC_TRIGGER_FIELDS.has(field)) {
          hasRecalcTriggerField = true
        }
      }
    }

    // Update claim year
    const { data: updated, error } = await supabase
      .from('claim_years')
      .update(updatePayload)
      .eq('id', yearId)
      .select()
      .single()

    if (error) {
      return NextResponse.json(
        { ok: false, error: error.message },
        { status: 400 }
      )
    }

    // Only trigger recalculation if a calc-affecting field changed
    let recalcResult = null
    if (hasRecalcTriggerField) {
      try {
        const changedFields = Object.keys(body).filter((k) =>
          RECALC_TRIGGER_FIELDS.has(k)
        )
        recalcResult = await runClaimRecalculation(supabase, yearId, {
          triggerSource: 'claim_year_metadata_change',
          triggerEntity: 'claim_years',
          triggerEntityId: yearId,
          initiatedBy: session.user.id,
        })
        console.log(
          `Recalculation triggered by claim-year metadata change: ${changedFields.join(', ')}`
        )
      } catch (recalcErr) {
        console.warn('Post-metadata recalculation failed:', recalcErr)
      }
    }

    return NextResponse.json({
      ok: true,
      data: {
        claimYear: updated,
        recalcTriggered: hasRecalcTriggerField,
        recalculation: recalcResult
          ? { status: recalcResult.status, runId: recalcResult.runId }
          : null,
      },
    })
  } catch (e) {
    console.error('Claim year update error:', e)
    return NextResponse.json(
      { ok: false, error: 'Internal error' },
      { status: 500 }
    )
  }
}
