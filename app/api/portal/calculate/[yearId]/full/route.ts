import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import {
  calculateFederalWaterfall,
  saveFederalLineValues,
} from '@/lib/services/federalCalcService'
import {
  calculateProvincialCredits,
  saveProvincialLineValues,
} from '@/lib/services/provincialCalcService'

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
      return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 })
    }

    const yearId = params.yearId

    // Load claim year metadata
    const { data: claimYear, error: cyErr } = await supabase
      .from('claim_years')
      .select('tax_year_start, method_election, associated_corp_flag, taxable_capital_eoy, company_id')
      .eq('id', yearId)
      .single()

    if (cyErr || !claimYear) {
      return NextResponse.json({ ok: false, error: 'Claim year not found' }, { status: 404 })
    }

    // Load CCPC flag from company
    const { data: company } = await supabase
      .from('companies')
      .select('ccpc_flag')
      .eq('id', claimYear.company_id)
      .single()

    const isCcpc = company?.ccpc_flag ?? true

    const federalOpts = {
      taxYearStart: claimYear.tax_year_start || '2025-01-01',
      isCcpc,
      method: (claimYear.method_election || 'proxy') as 'proxy' | 'traditional',
    }

    // ── Step 1: Provisional federal calculation (before provincial assistance) ──
    const provisionalFederal = await calculateFederalWaterfall(supabase, yearId, federalOpts)

    // ── Step 2: All provincial calculations using provisional federal QE ──
    const provincialResults = await calculateProvincialCredits(
      supabase,
      yearId,
      provisionalFederal.qualifiedExpenditures
    )

    // ── Step 3: Sum federalAssistanceAmount from each adapter result ──
    // Use federalAssistanceAmount, NOT raw creditAmount (MB/SK renunciation may reduce it)
    const totalProvincialAssistance = provincialResults.reduce(
      (sum, r) => sum + r.federalAssistanceAmount,
      0
    )

    // ── Step 4: Upsert provincial credits as assistance items ──
    for (const r of provincialResults) {
      if (r.federalAssistanceAmount <= 0) continue

      await supabase.from('assistance_items').upsert(
        {
          claim_year_id: yearId,
          assistance_type: 'government_assistance',
          source_name: `${r.provinceName} SR&ED Tax Credit`,
          amount: r.federalAssistanceAmount,
          linked_project_id: null,
          treatment_notes: JSON.stringify({
            province_code: r.provinceCode,
            adapter_id: `${r.provinceCode.toLowerCase()}-sred-adapter`,
            calculated_at: new Date().toISOString(),
            total_credit: r.creditAmount,
            federal_assistance_portion: r.federalAssistanceAmount,
          }),
        },
        {
          onConflict: 'claim_year_id,source_name',
          ignoreDuplicates: false,
        }
      )
    }

    // ── Step 5: Final federal calculation (now includes provincial assistance) ──
    const finalFederal = await calculateFederalWaterfall(supabase, yearId, federalOpts)

    // ── Step 6: Save all line values ──
    const federalLines = await saveFederalLineValues(supabase, yearId, null, finalFederal)
    const provincialLines = await saveProvincialLineValues(supabase, yearId, null, provincialResults)

    return NextResponse.json({
      ok: true,
      data: {
        provisionalFederal: {
          qualifiedExpenditures: provisionalFederal.qualifiedExpenditures,
          totalItc: provisionalFederal.totalItc,
        },
        provincialResults: provincialResults.map((r) => ({
          provinceCode: r.provinceCode,
          creditAmount: r.creditAmount,
          federalAssistanceAmount: r.federalAssistanceAmount,
        })),
        totalProvincialAssistance,
        finalFederal: {
          qualifiedExpenditures: finalFederal.qualifiedExpenditures,
          totalItc: finalFederal.totalItc,
          enhancedItc: finalFederal.enhancedItc,
          basicItc: finalFederal.basicItc,
        },
        federalLinesCount: federalLines.length,
        provincialLinesCount: provincialLines.length,
      },
    })
  } catch (e) {
    console.error('Full calculation error:', e)
    return NextResponse.json(
      { ok: false, error: e instanceof Error ? e.message : 'Internal error' },
      { status: 500 }
    )
  }
}
