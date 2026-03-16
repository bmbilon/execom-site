/**
 * Manitoba Research and Development Tax Credit adapter.
 * Form: T2SCH380
 * Rate: 15% on eligible MB expenditures
 * 50% refundable / 50% non-refundable (standard);
 * 100% refundable when R&D performed under qualifying research institute contract.
 * Renunciation available; 6-month deadline critical for federal QE optimization.
 * Capital expenditures eligible (excluding buildings/leasehold interests).
 * 20-year carryforward on non-refundable portion.
 */

import { SupabaseClient } from '@supabase/supabase-js'
import type {
  ProvinceCalcStrategy,
  ProvinceExpenditures,
  ProvinceCreditResult,
} from '../types'

const CREDIT_RATE = 0.15
const STANDARD_REFUNDABLE_RATIO = 0.50

export const mbAdapter: ProvinceCalcStrategy = {
  provinceCode: 'MB',
  provinceName: 'Manitoba',
  primaryFormCode: 'T2SCH380',
  allFormCodes: ['T2SCH380'],
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

    const grossCredit = qualifiedBase * CREDIT_RATE

    // Determine refundability tier: check if any project in this claim year
    // has mb_qualifying_institute_flag set
    const { data: projects } = await sb
      .from('projects')
      .select('id, mb_qualifying_institute_flag')
      .eq('claim_year_id', exp.claimYearId)

    const hasQualifyingInstitute = (projects ?? []).some(
      (p: { mb_qualifying_institute_flag: boolean }) =>
        p.mb_qualifying_institute_flag
    )

    let refundableCredit: number
    let nonRefundableCredit: number

    if (hasQualifyingInstitute) {
      // 100% refundable when performed under eligible contract
      refundableCredit = grossCredit
      nonRefundableCredit = 0
      notes.push(
        'MB credit 100% refundable — qualifying research institute contract detected'
      )
    } else {
      // Standard 50/50 split
      refundableCredit = grossCredit * STANDARD_REFUNDABLE_RATIO
      nonRefundableCredit = grossCredit * (1 - STANDARD_REFUNDABLE_RATIO)
    }

    // Check renunciation status
    const { data: claimYear } = await sb
      .from('claim_years')
      .select('mb_renunciation_flag, mb_renunciation_date, tax_year_end')
      .eq('id', exp.claimYearId)
      .single()

    if (claimYear) {
      const sixMonthDeadline = new Date(claimYear.tax_year_end)
      sixMonthDeadline.setMonth(sixMonthDeadline.getMonth() + 6)
      const today = new Date()

      if (
        nonRefundableCredit > 0 &&
        !claimYear.mb_renunciation_flag &&
        today < sixMonthDeadline
      ) {
        notes.push(
          `MB renunciation window open until ${sixMonthDeadline.toISOString().slice(0, 10)} — renouncing non-refundable credit preserves federal QE`
        )
      }

      if (claimYear.mb_renunciation_flag) {
        notes.push(
          `MB non-refundable credit renounced on ${claimYear.mb_renunciation_date} — renounced portion not treated as government assistance for federal purposes`
        )
      }
    }

    const totalCredit = refundableCredit + nonRefundableCredit

    // federalAssistanceAmount: the refundable portion is always government
    // assistance. The non-refundable portion is government assistance ONLY
    // if it has NOT been renounced.
    const renounced = claimYear?.mb_renunciation_flag ?? false
    const federalAssistanceAmount = renounced
      ? refundableCredit // Non-refundable renounced → excluded
      : totalCredit      // Full credit is federal assistance

    return {
      provinceCode: 'MB',
      provinceName: 'Manitoba',
      formCode: 'T2SCH380',
      allFormCodes: ['T2SCH380'],
      credits: [
        {
          programCode: 'MB_RD',
          programName: 'Manitoba R&D Tax Credit',
          rate: CREDIT_RATE,
          base: qualifiedBase,
          creditAmount: totalCredit,
          refundable: hasQualifyingInstitute,
          formCode: 'T2SCH380',
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
