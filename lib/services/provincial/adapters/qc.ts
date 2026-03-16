/**
 * Quebec CRIC (Crédit pour la recherche, l'innovation et la commercialisation) adapter.
 * Form: RD-1029.8.CR-T (filed with CO-17 to Revenue Québec, NOT CRA)
 * Effective: tax years beginning after March 25, 2025
 * Base rate: 20% on eligible expenditures above exclusion threshold
 * Enhanced rate: 30% on first $1M above exclusion threshold
 * Fully refundable.
 * Unique: exclusion threshold based on per-employee R&D time fraction × basic personal amount.
 * Supports pre-commercialization activities (unique to QC).
 * For tax years beginning on or before March 25, 2025: prior-regime forms apply (not implemented here).
 */

import { SupabaseClient } from '@supabase/supabase-js'
import type {
  ProvinceCalcStrategy,
  ProvinceExpenditures,
  ProvinceCreditResult,
} from '../types'

const BASE_RATE = 0.20
const ENHANCED_RATE = 0.30
const ENHANCED_LIMIT = 1_000_000
const MINIMUM_EXCLUSION = 50_000
const CRIC_EFFECTIVE_DATE = '2025-03-25'

// 2025 Quebec basic personal amount — should be configurable per tax year
const BASIC_PERSONAL_AMOUNT_2025 = 18_751

export const qcAdapter: ProvinceCalcStrategy = {
  provinceCode: 'QC',
  provinceName: 'Quebec',
  primaryFormCode: 'RD-1029.8.CR-T',
  allFormCodes: ['RD-1029.8.CR-T', 'RD-1029.8.EN'],
  usesFederalBase: false, // Quebec has its own eligible expenditure calculation
  assistanceReducesBase: true,
  hasRecapture: false,
  hasRenunciation: false,
  requiresSeparateAuthority: true, // Revenue Québec

  async calculateCredit(
    exp: ProvinceExpenditures,
    sb: SupabaseClient
  ): Promise<ProvinceCreditResult> {
    const notes: string[] = []

    // Check regime date
    const taxYearStart = new Date(exp.taxYearStart)
    const cricEffective = new Date(CRIC_EFFECTIVE_DATE)
    if (taxYearStart <= cricEffective) {
      notes.push(
        'CRIC applies to tax years beginning after March 25, 2025 — this claim may require prior-regime forms (RD-1029.7 etc.)'
      )
      // Return zero result with structured warning — prior regime not yet implemented
      return {
        provinceCode: 'QC',
        provinceName: 'Quebec',
        formCode: 'RD-1029.8.CR-T',
        allFormCodes: [], // Empty — no forms to generate for pre-CRIC years
        credits: [],
        totalCredit: 0,
        refundableCredit: 0,
        nonRefundableCredit: 0,
        isFederalAssistance: true,
        federalAssistanceAmount: 0,
        qualifiedExpenditures: 0,
        notes,
        warning: {
          code: 'QC_PRE_CRIC_REGIME',
          message: `CRIC applies to tax years beginning after ${CRIC_EFFECTIVE_DATE}. Tax year starting ${exp.taxYearStart} requires prior-regime forms (RD-1029.7 etc.) which are not yet implemented.`,
        },
      }
    }

    // Calculate exclusion threshold from provincial_employee_time
    const { data: employeeTime } = await sb
      .from('provincial_employee_time')
      .select('rd_time_fraction')
      .eq('claim_year_id', exp.claimYearId)
      .eq('province_code', 'QC')

    let exclusionThreshold = MINIMUM_EXCLUSION
    if (employeeTime && employeeTime.length > 0) {
      const sumTimeFraction = (
        employeeTime as { rd_time_fraction: number }[]
      ).reduce((sum, e) => sum + e.rd_time_fraction, 0)
      const calculatedThreshold =
        sumTimeFraction * BASIC_PERSONAL_AMOUNT_2025
      exclusionThreshold = Math.max(MINIMUM_EXCLUSION, calculatedThreshold)
      notes.push(
        `QC exclusion threshold: $${exclusionThreshold.toFixed(2)} (${employeeTime.length} employees, sum FTE fraction: ${sumTimeFraction.toFixed(3)})`
      )
    } else {
      notes.push(
        'QC exclusion threshold defaulting to $50,000 minimum — no employee R&D time fractions provided'
      )
    }

    // QC uses its own expenditure base (not proportioned from federal)
    let qualifiedBase = exp.qualifiedExpenditures
    if (exp.provinceAssistance > 0) {
      qualifiedBase = Math.max(0, qualifiedBase - exp.provinceAssistance)
    }

    const aboveThreshold = Math.max(0, qualifiedBase - exclusionThreshold)

    let cricCredit: number
    if (aboveThreshold <= ENHANCED_LIMIT) {
      cricCredit = aboveThreshold * ENHANCED_RATE
    } else {
      cricCredit =
        ENHANCED_LIMIT * ENHANCED_RATE +
        (aboveThreshold - ENHANCED_LIMIT) * BASE_RATE
    }

    notes.push(
      'QC CRIC is filed with Revenue Québec CO-17 return — NOT with CRA T2'
    )

    return {
      provinceCode: 'QC',
      provinceName: 'Quebec',
      formCode: 'RD-1029.8.CR-T',
      allFormCodes: ['RD-1029.8.CR-T', 'RD-1029.8.EN'],
      credits: [
        {
          programCode: 'CRIC',
          programName:
            'Tax Credit for R&D, Innovation and Pre-Commercialization',
          rate: aboveThreshold <= ENHANCED_LIMIT ? ENHANCED_RATE : BASE_RATE,
          base: aboveThreshold,
          creditAmount: cricCredit,
          refundable: true,
          formCode: 'RD-1029.8.CR-T',
        },
      ],
      totalCredit: cricCredit,
      refundableCredit: cricCredit,
      nonRefundableCredit: 0,
      isFederalAssistance: true,
      federalAssistanceAmount: cricCredit,
      qualifiedExpenditures: qualifiedBase,
      notes,
    }
  },
}
