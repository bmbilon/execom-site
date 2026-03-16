/**
 * Ontario SR&ED Tax Credits adapter.
 * Three stacked programs:
 *   A) OITC — Ontario Innovation Tax Credit (T2SCH566): 8% refundable, $3M limit, phase-out
 *   B) ORDTC — Ontario Research & Development Tax Credit (T2SCH508): 3.5% non-refundable
 *   C) OBRITC — Ontario Business-Research Institute Tax Credit (T2SCH568/569): 20% refundable, $20M cap
 *
 * Combined effective rate on Ontario expenditures: up to 11.5% (OITC + ORDTC)
 * OBRITC is on a separate base (ERI contract payments only).
 */

import { SupabaseClient } from '@supabase/supabase-js'
import type {
  ProvinceCalcStrategy,
  ProvinceExpenditures,
  ProvinceCreditResult,
  ProvinceCreditLine,
} from '../types'

// ── OITC constants ──
const OITC_RATE = 0.08
const OITC_EXPENDITURE_LIMIT = 3_000_000
const OITC_MAX_CREDIT = 240_000
const OITC_CAPITAL_PHASE_OUT = 25_000_000
const OITC_INCOME_PHASE_OUT = 500_000

// ── ORDTC constants ──
const ORDTC_RATE = 0.035

// ── OBRITC constants ──
const OBRITC_RATE = 0.20
const OBRITC_EXPENDITURE_CAP = 20_000_000
const OBRITC_MAX_CREDIT = 4_000_000

export const onAdapter: ProvinceCalcStrategy = {
  provinceCode: 'ON',
  provinceName: 'Ontario',
  primaryFormCode: 'T2SCH566',
  allFormCodes: ['T2SCH566', 'T2SCH508', 'T2SCH568', 'T2SCH569'],
  usesFederalBase: true,
  assistanceReducesBase: true,
  hasRecapture: false,
  hasRenunciation: false,
  requiresSeparateAuthority: false,

  async calculateCredit(
    exp: ProvinceExpenditures,
    sb: SupabaseClient
  ): Promise<ProvinceCreditResult> {
    const notes: string[] = []
    const credits: ProvinceCreditLine[] = []

    // Base: Ontario-allocated federal qualified expenditures, less assistance
    let onBase = exp.qualifiedExpenditures
    if (exp.provinceAssistance > 0) {
      onBase = Math.max(0, onBase - exp.provinceAssistance)
    }

    // ── Program A: OITC (8% refundable) ──

    // Phase-out: check specified_capital_amount and prior_year_taxable_income_on
    const { data: company } = await sb
      .from('companies')
      .select('specified_capital_amount, prior_year_taxable_income_on')
      .eq(
        'id',
        (
          await sb
            .from('claim_years')
            .select('company_id')
            .eq('id', exp.claimYearId)
            .single()
        ).data?.company_id
      )
      .single()

    let oitcLimit = OITC_EXPENDITURE_LIMIT
    if (company) {
      const specCap = company.specified_capital_amount ?? 0
      const priorIncome = company.prior_year_taxable_income_on ?? 0

      if (specCap > OITC_CAPITAL_PHASE_OUT || priorIncome > OITC_INCOME_PHASE_OUT) {
        // Phase-out reduces the expenditure limit proportionally
        // Full phase-out at $50M capital or $1.5M income
        const capitalReduction =
          specCap > OITC_CAPITAL_PHASE_OUT
            ? Math.min(
                1,
                (specCap - OITC_CAPITAL_PHASE_OUT) / OITC_CAPITAL_PHASE_OUT
              )
            : 0
        const incomeReduction =
          priorIncome > OITC_INCOME_PHASE_OUT
            ? Math.min(
                1,
                (priorIncome - OITC_INCOME_PHASE_OUT) /
                  (3 * OITC_INCOME_PHASE_OUT)
              )
            : 0
        const reductionFactor = Math.max(capitalReduction, incomeReduction)
        oitcLimit = Math.max(0, OITC_EXPENDITURE_LIMIT * (1 - reductionFactor))
        notes.push(
          `OITC expenditure limit reduced to $${oitcLimit.toLocaleString()} due to phase-out (capital: $${specCap.toLocaleString()}, income: $${priorIncome.toLocaleString()})`
        )
      }
    }

    const oitcBase = Math.min(onBase, oitcLimit)
    const oitcCredit = Math.min(oitcBase * OITC_RATE, OITC_MAX_CREDIT)

    credits.push({
      programCode: 'OITC',
      programName: 'Ontario Innovation Tax Credit',
      rate: OITC_RATE,
      base: oitcBase,
      creditAmount: oitcCredit,
      refundable: true,
      formCode: 'T2SCH566',
    })

    // ── Program B: ORDTC (3.5% non-refundable) ──
    // Applies to full Ontario QE (no expenditure limit)
    const ordtcCredit = onBase * ORDTC_RATE

    credits.push({
      programCode: 'ORDTC',
      programName: 'Ontario Research and Development Tax Credit',
      rate: ORDTC_RATE,
      base: onBase,
      creditAmount: ordtcCredit,
      refundable: false,
      formCode: 'T2SCH508',
    })

    // ── Program C: OBRITC (20% refundable, separate ERI base) ──
    // Fetch ERI contract payments for this claim year
    const { data: eriContracts } = await sb
      .from('on_eri_contracts')
      .select('payment_amount')
      .eq('claim_year_id', exp.claimYearId)

    let obritcCredit = 0
    let obritcBase = 0
    if (eriContracts && eriContracts.length > 0) {
      obritcBase = (eriContracts as { payment_amount: number }[]).reduce(
        (sum, c) => sum + c.payment_amount,
        0
      )
      obritcBase = Math.min(obritcBase, OBRITC_EXPENDITURE_CAP)
      obritcCredit = Math.min(obritcBase * OBRITC_RATE, OBRITC_MAX_CREDIT)

      credits.push({
        programCode: 'OBRITC',
        programName: 'Ontario Business-Research Institute Tax Credit',
        rate: OBRITC_RATE,
        base: obritcBase,
        creditAmount: obritcCredit,
        refundable: true,
        formCode: 'T2SCH568',
      })

      notes.push(
        `OBRITC: ${eriContracts.length} ERI contract(s) totaling $${obritcBase.toLocaleString()}`
      )
    }

    const totalCredit = oitcCredit + ordtcCredit + obritcCredit
    const refundableCredit = oitcCredit + obritcCredit
    const nonRefundableCredit = ordtcCredit

    notes.push(
      `Ontario combined effective rate on base expenditures: ${((OITC_RATE + ORDTC_RATE) * 100).toFixed(1)}%`
    )

    return {
      provinceCode: 'ON',
      provinceName: 'Ontario',
      formCode: 'T2SCH566',
      allFormCodes: ['T2SCH566', 'T2SCH508', 'T2SCH568', 'T2SCH569'],
      credits,
      totalCredit,
      refundableCredit,
      nonRefundableCredit,
      isFederalAssistance: true,
      federalAssistanceAmount: totalCredit,
      qualifiedExpenditures: onBase,
      notes,
    }
  },
}
