/**
 * Saskatchewan Research and Development Tax Credit adapter.
 * Form: T2SCH403
 * Rate: 10% on eligible SK expenditures
 * CCPC refundable on first $1M (= 1/3 of federal expenditure limit);
 * non-refundable on $1M–$10M; $10M absolute ceiling.
 * Renunciation available for non-refundable portion.
 */

import { SupabaseClient } from '@supabase/supabase-js'
import type {
  ProvinceCalcStrategy,
  ProvinceExpenditures,
  ProvinceCreditResult,
} from '../types'

const CREDIT_RATE = 0.10
const TOTAL_EXPENDITURE_CEILING = 10_000_000
// SK refundable limit = 1/3 of federal expenditure limit (rule, not hardcoded)
const FEDERAL_LIMIT_PRE_2024 = 3_000_000
const FEDERAL_LIMIT_POST_2024 = 6_000_000
const CUTOFF_DATE = '2024-12-16'

function skRefundableLimit(taxYearStart: string): number {
  const fedLimit =
    new Date(taxYearStart) >= new Date(CUTOFF_DATE)
      ? FEDERAL_LIMIT_POST_2024
      : FEDERAL_LIMIT_PRE_2024
  return Math.round(fedLimit / 3)
}

export const skAdapter: ProvinceCalcStrategy = {
  provinceCode: 'SK',
  provinceName: 'Saskatchewan',
  primaryFormCode: 'T2SCH403',
  allFormCodes: ['T2SCH403'],
  usesFederalBase: true,
  assistanceReducesBase: true,
  hasRecapture: false,
  hasRenunciation: true,
  requiresSeparateAuthority: false,

  async calculateCredit(
    exp: ProvinceExpenditures,
    sb: SupabaseClient
  ): Promise<ProvinceCreditResult> {
    const notes: string[] = []

    let qualifiedBase = exp.qualifiedExpenditures
    if (exp.provinceAssistance > 0) {
      qualifiedBase = Math.max(0, qualifiedBase - exp.provinceAssistance)
    }

    // Cap at $10M ceiling
    if (qualifiedBase > TOTAL_EXPENDITURE_CEILING) {
      notes.push(
        `SK expenditures capped at $10M ceiling (excess $${(qualifiedBase - TOTAL_EXPENDITURE_CEILING).toFixed(2)} not eligible)`
      )
      qualifiedBase = TOTAL_EXPENDITURE_CEILING
    }

    const refundableLimit = skRefundableLimit(exp.taxYearStart)
    let refundableCredit = 0
    let nonRefundableCredit = 0

    if (exp.isCCPC) {
      const refundableBase = Math.min(qualifiedBase, refundableLimit)
      refundableCredit = refundableBase * CREDIT_RATE
      const nonRefundableBase = Math.max(0, qualifiedBase - refundableLimit)
      nonRefundableCredit = nonRefundableBase * CREDIT_RATE
      notes.push(
        `SK refundable limit: $${refundableLimit.toLocaleString()} (1/3 of federal expenditure limit)`
      )
    } else {
      nonRefundableCredit = qualifiedBase * CREDIT_RATE
      notes.push('Non-CCPC: entire SK credit is non-refundable')
    }

    const totalCredit = refundableCredit + nonRefundableCredit

    // Check renunciation status
    let federalAssistanceAmount = totalCredit
    const { data: claimYear } = await sb
      .from('claim_years')
      .select('sk_renunciation_flag')
      .eq('id', exp.claimYearId)
      .single()

    if (claimYear?.sk_renunciation_flag && nonRefundableCredit > 0) {
      // Renounced non-refundable portion is NOT government assistance
      federalAssistanceAmount = refundableCredit
      notes.push(
        'SK non-refundable credit renounced — renounced portion excluded from federal government assistance'
      )
    }

    return {
      provinceCode: 'SK',
      provinceName: 'Saskatchewan',
      formCode: 'T2SCH403',
      allFormCodes: ['T2SCH403'],
      credits: [
        {
          programCode: 'SK_RD',
          programName: 'Saskatchewan R&D Tax Credit',
          rate: CREDIT_RATE,
          base: qualifiedBase,
          creditAmount: totalCredit,
          refundable: exp.isCCPC,
          formCode: 'T2SCH403',
        },
      ],
      totalCredit,
      refundableCredit,
      nonRefundableCredit,
      isFederalAssistance: true,
      federalAssistanceAmount,
      qualifiedExpenditures: qualifiedBase,
      notes,
    }
  },
}
