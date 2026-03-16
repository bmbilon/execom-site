/**
 * British Columbia SR&ED Tax Credit adapter.
 * Form: T666
 * Rate: 10% on qualified BC expenditures
 * Refundable for CCPCs up to expenditure limit; non-refundable for excess / non-CCPCs.
 * Recapture applies on property disposal/conversion.
 */

import { SupabaseClient } from '@supabase/supabase-js'
import type {
  ProvinceCalcStrategy,
  ProvinceExpenditures,
  ProvinceCreditResult,
} from '../types'

const CREDIT_RATE = 0.10
const EXPENDITURE_LIMIT_PRE_2024 = 3_000_000
const EXPENDITURE_LIMIT_POST_2024 = 6_000_000
const CUTOFF_DATE = '2024-12-16'

function expenditureLimitForYear(taxYearStart: string): number {
  return new Date(taxYearStart) >= new Date(CUTOFF_DATE)
    ? EXPENDITURE_LIMIT_POST_2024
    : EXPENDITURE_LIMIT_PRE_2024
}

export const bcAdapter: ProvinceCalcStrategy = {
  provinceCode: 'BC',
  provinceName: 'British Columbia',
  primaryFormCode: 'T666',
  allFormCodes: ['T666'],
  usesFederalBase: true,
  assistanceReducesBase: true,
  hasRecapture: true,
  hasRenunciation: false,
  requiresSeparateAuthority: false,

  async calculateCredit(
    exp: ProvinceExpenditures,
    _sb: SupabaseClient
  ): Promise<ProvinceCreditResult> {
    const notes: string[] = []

    // BC uses federal QE proportioned to BC expenditures
    let qualifiedBase = exp.qualifiedExpenditures
    if (exp.provinceAssistance > 0) {
      qualifiedBase = Math.max(0, qualifiedBase - exp.provinceAssistance)
      notes.push(
        `BC expenditures reduced by $${exp.provinceAssistance.toFixed(2)} provincial assistance`
      )
    }

    const limit = expenditureLimitForYear(exp.taxYearStart)

    let refundableCredit = 0
    let nonRefundableCredit = 0

    if (exp.isCCPC) {
      const refundableBase = Math.min(qualifiedBase, limit)
      refundableCredit = refundableBase * CREDIT_RATE
      const excessBase = Math.max(0, qualifiedBase - limit)
      nonRefundableCredit = excessBase * CREDIT_RATE
    } else {
      nonRefundableCredit = qualifiedBase * CREDIT_RATE
      notes.push(
        'Non-CCPC: entire BC credit is non-refundable (carry 3 back / 10 forward)'
      )
    }

    const totalCredit = refundableCredit + nonRefundableCredit

    return {
      provinceCode: 'BC',
      provinceName: 'British Columbia',
      formCode: 'T666',
      allFormCodes: ['T666'],
      credits: [
        {
          programCode: 'BC_SRED',
          programName: 'BC SR&ED Tax Credit',
          rate: CREDIT_RATE,
          base: qualifiedBase,
          creditAmount: totalCredit,
          refundable: exp.isCCPC,
          formCode: 'T666',
        },
      ],
      totalCredit,
      refundableCredit,
      nonRefundableCredit,
      isFederalAssistance: true,
      federalAssistanceAmount: totalCredit,
      qualifiedExpenditures: qualifiedBase,
      notes,
    }
  },
}
