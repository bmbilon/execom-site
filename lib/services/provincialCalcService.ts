/**
 * Provincial credit calculation service.
 *
 * Currently implements Alberta Innovation Employment Grant (IEG)
 * and Ontario Innovation Tax Credit (OITC). Additional provinces
 * can be added by extending the PROVINCE_CONFIGS map.
 *
 * All rates and thresholds are configurable constants.
 */

import { SupabaseClient } from '@supabase/supabase-js'
import type { ProvincialLineValue, CostLineProjectSplit } from './types'

// ── Province configuration ──

interface ProvinceConfig {
  /** Display name */
  name: string
  /** Credit rate applied to qualified provincial expenditures. */
  creditRate: number
  /** Maximum qualifying expenditure, or null if no cap. */
  expenditureCap: number | null
  /** Whether the province uses the federal qualified expenditure as base. */
  usesFederalBase: boolean
  /** Form code for the provincial schedule. */
  formCode: string
}

const PROVINCE_CONFIGS: Record<string, ProvinceConfig> = {
  AB: {
    name: 'Alberta',
    creditRate: 0.08, // Alberta IEG base rate (8% for R&D)
    expenditureCap: null,
    usesFederalBase: true,
    formCode: 'AT1-SCH29',
  },
  ON: {
    name: 'Ontario',
    creditRate: 0.08, // Ontario Innovation Tax Credit
    expenditureCap: 3_000_000, // OITC expenditure limit
    usesFederalBase: true,
    formCode: 'CT23',
  },
  BC: {
    name: 'British Columbia',
    creditRate: 0.10, // BC SR&ED tax credit
    expenditureCap: null,
    usesFederalBase: true,
    formCode: 'T666-BC',
  },
  QC: {
    name: 'Quebec',
    creditRate: 0.14, // Quebec R&D tax credit (SME rate)
    expenditureCap: null,
    usesFederalBase: false, // Quebec has its own calculation
    formCode: 'RD-1029.8',
  },
  // TODO: Add remaining provinces (SK, MB, NS, NB, NL, PE, NT, NU, YT)
}

// ── Types ──

export interface ProvincialCalcResult {
  provinceCode: string
  provinceName: string
  qualifiedExpenditures: number
  creditRate: number
  creditAmount: number
  formCode: string
}

// ── Calculation ──

/**
 * Calculate provincial credits for all provinces that have cost splits
 * allocated in this claim year.
 */
export async function calculateProvincialCredits(
  sb: SupabaseClient,
  claimYearId: string,
  federalQualifiedExpenditures: number
): Promise<ProvincialCalcResult[]> {
  // Find all province codes with allocated splits for this claim year
  const { data: items, error: itemErr } = await sb
    .from('cost_line_items')
    .select('id')
    .eq('claim_year_id', claimYearId)

  if (itemErr) throw itemErr
  const itemIds = (items ?? []).map((i: { id: string }) => i.id)

  if (itemIds.length === 0) return []

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

  const results: ProvincialCalcResult[] = []

  for (const [code, totalAmount] of provinceExpenditures) {
    const config = PROVINCE_CONFIGS[code]
    if (!config) {
      // Province not yet configured; skip with a minimal entry
      results.push({
        provinceCode: code,
        provinceName: code,
        qualifiedExpenditures: totalAmount,
        creditRate: 0,
        creditAmount: 0,
        formCode: 'UNKNOWN',
      })
      continue
    }

    // Determine the base for credit calculation
    let qualifiedBase: number
    if (config.usesFederalBase) {
      // Province share of the federal qualified expenditures, proportional
      const totalAllAllocated = allSplits.reduce(
        (sum, s) => sum + s.allocation_amount,
        0
      )
      const provinceProportion =
        totalAllAllocated > 0 ? totalAmount / totalAllAllocated : 0
      qualifiedBase = federalQualifiedExpenditures * provinceProportion
    } else {
      // Province uses its own base (e.g., Quebec)
      qualifiedBase = totalAmount
      // TODO: Quebec has its own eligible expenditure rules that differ
      //       from the federal calculation. Implement Quebec-specific
      //       deductions and salary base adjustments.
    }

    // Apply cap if applicable
    if (config.expenditureCap !== null) {
      qualifiedBase = Math.min(qualifiedBase, config.expenditureCap)
    }

    const creditAmount = qualifiedBase * config.creditRate

    results.push({
      provinceCode: code,
      provinceName: config.name,
      qualifiedExpenditures: qualifiedBase,
      creditRate: config.creditRate,
      creditAmount,
      formCode: config.formCode,
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
  const lines = results.flatMap((r) => [
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
    },
  ])

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
