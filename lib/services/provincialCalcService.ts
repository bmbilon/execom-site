/**
 * Provincial credit calculation service.
 *
 * Uses a strategy pattern via province adapters in ./provincial/.
 * Alberta (IEG) retains its inline implementation for backward compatibility
 * until migrated to the adapter pattern in a future pass.
 *
 * All rates and thresholds are configurable constants within each adapter.
 */

import { SupabaseClient } from '@supabase/supabase-js'
import type { ProvincialLineValue, CostLineProjectSplit } from './types'
import {
  PROVINCE_REGISTRY,
  hasProgram,
  validateCreditResult,
  type ProvinceCreditResult,
  type ProvinceExpenditures,
} from './provincial'

// ── Alberta IEG (inline — legacy, will be migrated to adapter) ──

const AB_IEG_BASE_RATE = 0.08
const AB_FORM_CODE = 'AT1-SCH29'

// ── Exported result type (backward compatible) ──

export interface ProvincialCalcResult {
  provinceCode: string
  provinceName: string
  qualifiedExpenditures: number
  creditRate: number
  creditAmount: number
  /** The portion of creditAmount that counts as government assistance for
   *  federal purposes. For most provinces this equals creditAmount. For MB/SK
   *  it may be lower if the non-refundable portion has been renounced.
   *  The three-pass orchestration sums this field — never raw creditAmount. */
  federalAssistanceAmount: number
  formCode: string
  /** Extended result from strategy adapter (null for legacy Alberta). */
  adapterResult: ProvinceCreditResult | null
}

// ── Main calculation entry point ──

/**
 * Calculate provincial credits for all provinces that have cost splits
 * allocated in this claim year.
 */
export async function calculateProvincialCredits(
  sb: SupabaseClient,
  claimYearId: string,
  federalQualifiedExpenditures: number
): Promise<ProvincialCalcResult[]> {
  // Fetch all cost line items for this claim year
  const { data: items, error: itemErr } = await sb
    .from('cost_line_items')
    .select('id')
    .eq('claim_year_id', claimYearId)

  if (itemErr) throw itemErr
  const itemIds = (items ?? []).map((i: { id: string }) => i.id)

  if (itemIds.length === 0) return []

  // Fetch all splits with province allocations
  const { data: splits, error: spErr } = await sb
    .from('cost_line_project_splits')
    .select('province_code, allocation_amount')
    .in('cost_line_item_id', itemIds)
    .neq('review_status', 'excluded')

  if (spErr) throw spErr
  const allSplits = (splits ?? []) as Array<
    Pick<CostLineProjectSplit, 'province_code' | 'allocation_amount'>
  >

  // Aggregate totals by province
  const provinceExpenditures = new Map<string, number>()
  for (const s of allSplits) {
    provinceExpenditures.set(
      s.province_code,
      (provinceExpenditures.get(s.province_code) ?? 0) + s.allocation_amount
    )
  }

  const totalAllAllocated = allSplits.reduce(
    (sum, s) => sum + s.allocation_amount,
    0
  )

  // Fetch claim year metadata
  const { data: claimYear } = await sb
    .from('claim_years')
    .select(
      'company_id, tax_year_start, tax_year_end, associated_corp_flag'
    )
    .eq('id', claimYearId)
    .single()

  // Fetch company CCPC status
  let isCCPC = true // Default to CCPC
  if (claimYear?.company_id) {
    const { data: company } = await sb
      .from('companies')
      .select('ccpc_flag')
      .eq('id', claimYear.company_id)
      .single()
    if (company) isCCPC = company.ccpc_flag ?? true
  }

  // Fetch province-level assistance
  const { data: assistanceItems } = await sb
    .from('assistance_items')
    .select('amount, linked_project_id')
    .eq('claim_year_id', claimYearId)

  const totalAssistance = (assistanceItems ?? []).reduce(
    (sum: number, a: { amount: number }) => sum + a.amount,
    0
  )

  const results: ProvincialCalcResult[] = []

  // Deterministic ordering: sorted province codes ensure consistent logs and review outputs
  const sortedProvinces = [...provinceExpenditures.entries()].sort((a, b) =>
    a[0].localeCompare(b[0])
  )

  for (const [code, totalAmount] of sortedProvinces) {
    // Calculate province's share of federal QE
    const provinceProportion =
      totalAllAllocated > 0 ? totalAmount / totalAllAllocated : 0
    const provinceShareOfFederalQE =
      federalQualifiedExpenditures * provinceProportion

    // Province-level assistance (proportional for now — TODO: per-project)
    const provinceAssistance = totalAssistance * provinceProportion

    // ── Alberta (legacy inline) ──
    if (code === 'AB') {
      const qualifiedBase = provinceShareOfFederalQE
      const creditAmount = qualifiedBase * AB_IEG_BASE_RATE

      results.push({
        provinceCode: 'AB',
        provinceName: 'Alberta',
        qualifiedExpenditures: qualifiedBase,
        creditRate: AB_IEG_BASE_RATE,
        creditAmount,
        federalAssistanceAmount: creditAmount, // AB IEG is always federal assistance
        formCode: AB_FORM_CODE,
        adapterResult: null,
      })
      continue
    }

    // ── Strategy adapter lookup ──
    const entry = PROVINCE_REGISTRY[code]

    if (!entry) {
      // Unknown province code — emit a zero result
      results.push({
        provinceCode: code,
        provinceName: code,
        qualifiedExpenditures: totalAmount,
        creditRate: 0,
        creditAmount: 0,
        federalAssistanceAmount: 0,
        formCode: 'UNKNOWN',
        adapterResult: null,
      })
      continue
    }

    if (!hasProgram(entry)) {
      // No-program province (PE, NT, NU) — emit info-only result
      results.push({
        provinceCode: code,
        provinceName: entry.provinceName,
        qualifiedExpenditures: totalAmount,
        creditRate: 0,
        creditAmount: 0,
        federalAssistanceAmount: 0,
        formCode: 'NONE',
        adapterResult: null,
      })
      continue
    }

    // ── Run province adapter ──
    const expenditures: ProvinceExpenditures = {
      qualifiedExpenditures: entry.usesFederalBase
        ? provinceShareOfFederalQE
        : totalAmount,
      federalQualifiedExpenditures: federalQualifiedExpenditures,
      federalAssistance: totalAssistance,
      provinceAssistance,
      isCCPC,
      taxYearStart: claimYear?.tax_year_start ?? '',
      taxYearEnd: claimYear?.tax_year_end ?? '',
      claimYearId,
    }

    const adapterResult = await entry.calculateCredit(expenditures, sb)
    validateCreditResult(adapterResult)

    results.push({
      provinceCode: code,
      provinceName: adapterResult.provinceName,
      qualifiedExpenditures: adapterResult.qualifiedExpenditures,
      creditRate:
        adapterResult.credits.length === 1
          ? adapterResult.credits[0].rate
          : adapterResult.totalCredit / (adapterResult.qualifiedExpenditures || 1),
      creditAmount: adapterResult.totalCredit,
      federalAssistanceAmount: adapterResult.federalAssistanceAmount,
      formCode: adapterResult.formCode,
      adapterResult,
    })
  }

  return results
}

// ── Persist provincial line values ──

export async function saveProvincialLineValues(
  sb: SupabaseClient,
  claimYearId: string,
  snapshotId: string | null,
  results: ProvincialCalcResult[]
): Promise<ProvincialLineValue[]> {
  const lines: Array<{
    claim_year_id: string
    snapshot_id: string | null
    province_code: string
    form_code: string
    line_code: string
    value: number
    explanation: string
  }> = []

  for (const r of results) {
    if (r.adapterResult) {
      // Strategy adapter — persist detailed credit lines
      for (const credit of r.adapterResult.credits) {
        lines.push(
          {
            claim_year_id: claimYearId,
            snapshot_id: snapshotId,
            province_code: r.provinceCode,
            form_code: credit.formCode,
            line_code: `${credit.programCode}_base`,
            value: credit.base,
            explanation: `${credit.programName} qualified expenditure base`,
          },
          {
            claim_year_id: claimYearId,
            snapshot_id: snapshotId,
            province_code: r.provinceCode,
            form_code: credit.formCode,
            line_code: `${credit.programCode}_rate`,
            value: credit.rate,
            explanation: `${credit.programName} credit rate`,
          },
          {
            claim_year_id: claimYearId,
            snapshot_id: snapshotId,
            province_code: r.provinceCode,
            form_code: credit.formCode,
            line_code: `${credit.programCode}_credit`,
            value: credit.creditAmount,
            explanation: `${credit.programName} credit amount`,
          }
        )
      }

      // Summary line values
      lines.push(
        {
          claim_year_id: claimYearId,
          snapshot_id: snapshotId,
          province_code: r.provinceCode,
          form_code: r.formCode,
          line_code: 'total_credit',
          value: r.adapterResult.totalCredit,
          explanation: `${r.provinceName} total provincial credit`,
        },
        {
          claim_year_id: claimYearId,
          snapshot_id: snapshotId,
          province_code: r.provinceCode,
          form_code: r.formCode,
          line_code: 'refundable_credit',
          value: r.adapterResult.refundableCredit,
          explanation: `${r.provinceName} refundable portion`,
        },
        {
          claim_year_id: claimYearId,
          snapshot_id: snapshotId,
          province_code: r.provinceCode,
          form_code: r.formCode,
          line_code: 'non_refundable_credit',
          value: r.adapterResult.nonRefundableCredit,
          explanation: `${r.provinceName} non-refundable portion`,
        }
      )
    } else {
      // Legacy Alberta / unknown — flat 3-line format
      lines.push(
        {
          claim_year_id: claimYearId,
          snapshot_id: snapshotId,
          province_code: r.provinceCode,
          form_code: r.formCode,
          line_code: 'qualified_expenditures',
          value: r.qualifiedExpenditures,
          explanation: `Provincial qualified expenditures for ${r.provinceName}`,
        },
        {
          claim_year_id: claimYearId,
          snapshot_id: snapshotId,
          province_code: r.provinceCode,
          form_code: r.formCode,
          line_code: 'credit_rate',
          value: r.creditRate,
          explanation: `${r.provinceName} credit rate`,
        },
        {
          claim_year_id: claimYearId,
          snapshot_id: snapshotId,
          province_code: r.provinceCode,
          form_code: r.formCode,
          line_code: 'credit_amount',
          value: r.creditAmount,
          explanation: `${r.provinceName} credit amount`,
        }
      )
    }
  }

  if (lines.length === 0) return []

  const { data, error } = await sb
    .from('provincial_line_values')
    .upsert(lines, {
      onConflict:
        'claim_year_id,snapshot_id,province_code,form_code,line_code',
    })
    .select()

  if (error) throw error
  return (data ?? []) as ProvincialLineValue[]
}

// ── Read stored provincial line values ──

export async function getProvincialLineValues(
  sb: SupabaseClient,
  claimYearId: string,
  provinceCode?: string,
  snapshotId?: string
): Promise<ProvincialLineValue[]> {
  let query = sb
    .from('provincial_line_values')
    .select('*')
    .eq('claim_year_id', claimYearId)

  if (provinceCode) {
    query = query.eq('province_code', provinceCode)
  }

  if (snapshotId) {
    query = query.eq('snapshot_id', snapshotId)
  } else {
    query = query.is('snapshot_id', null)
  }

  const { data, error } = await query
    .order('province_code')
    .order('form_code')
    .order('line_code')

  if (error) throw error
  return (data ?? []) as ProvincialLineValue[]
}
