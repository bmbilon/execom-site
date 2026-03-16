import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import {
  runClaimRecalculation,
  RecalcLockError,
} from '@/lib/services/recalcService'

/**
 * POST /api/portal/calculate/:yearId/full
 *
 * Run the full three-pass calculation pipeline via the canonical
 * recalculation orchestrator. This replaces the prior manual
 * chaining of federal → provincial → federal services.
 *
 * Backward-compatible: returns the same response shape as before
 * by reading persisted line values after the pipeline completes.
 */
export async function POST(
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

    // Delegate to the canonical recalculation pipeline
    const result = await runClaimRecalculation(supabase, yearId, {
      triggerSource: 'full_calculation',
      triggerEntity: 'claim_years',
      triggerEntityId: yearId,
      initiatedBy: session.user.id,
    })

    // Read persisted federal line values for precise ITC figures
    const { data: fedLines } = await supabase
      .from('federal_line_values')
      .select('line_code, value')
      .eq('claim_year_id', yearId)
      .is('snapshot_id', null)

    const fedMap = new Map<string, number>()
    for (const line of fedLines ?? []) {
      fedMap.set(line.line_code, line.value ?? 0)
    }

    // Line value counts for backward compatibility
    const { count: provincialLinesCount } = await supabase
      .from('provincial_line_values')
      .select('id', { count: 'exact', head: true })
      .eq('claim_year_id', yearId)
      .is('snapshot_id', null)

    return NextResponse.json({
      ok: true,
      data: {
        provisionalFederal: {
          qualifiedExpenditures:
            result.provisionalFederalQualifiedExpenditures,
          totalItc: result.provisionalFederalQualifiedExpenditures *
            ((fedMap.get('total_itc') ?? 0) /
              (fedMap.get('qualified_expenditures') || 1)),
        },
        provincialResults: result.provincialCredits.map((c) => ({
          provinceCode: c.provinceCode,
          creditAmount: c.creditAmount,
          federalAssistanceAmount: c.federalAssistanceAmount,
        })),
        totalProvincialAssistance: result.totalProvincialAssistance,
        finalFederal: {
          qualifiedExpenditures: fedMap.get('qualified_expenditures') ?? 0,
          totalItc: fedMap.get('total_itc') ?? 0,
          enhancedItc: fedMap.get('enhanced_itc') ?? 0,
          basicItc: fedMap.get('basic_itc') ?? 0,
        },
        federalLinesCount: (fedLines ?? []).length,
        provincialLinesCount: provincialLinesCount ?? 0,
        recalcRunId: result.runId,
      },
    })
  } catch (e) {
    if (e instanceof RecalcLockError) {
      return NextResponse.json(
        {
          ok: false,
          error: e.message,
          code: 'RECALC_LOCK_CONFLICT',
        },
        { status: 409 }
      )
    }

    console.error('Full calculation error:', e)
    return NextResponse.json(
      {
        ok: false,
        error: e instanceof Error ? e.message : 'Internal error',
      },
      { status: 500 }
    )
  }
}
