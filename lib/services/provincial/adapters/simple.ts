/**
 * Simple provincial adapters for provinces with straightforward
 * flat-rate, fully-refundable credits.
 *
 * NB (15%, T2SCH360, recapture)
 * NS (15%, T2SCH340, recapture, renunciation)
 * NL (15%, T2SCH301 — UNIQUE: assistance does NOT reduce NL base)
 * YT (15% + 5% Yukon University bonus, T2SCH442)
 */

import { SupabaseClient } from '@supabase/supabase-js'
import type {
  ProvinceCalcStrategy,
  ProvinceExpenditures,
  ProvinceCreditResult,
} from '../types'

// ── New Brunswick ───────────────────────────────────────────────────────────

export const nbAdapter: ProvinceCalcStrategy = {
  provinceCode: 'NB',
  provinceName: 'New Brunswick',
  primaryFormCode: 'T2SCH360',
  allFormCodes: ['T2SCH360'],
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
    let qualifiedBase = exp.qualifiedExpenditures
    if (exp.provinceAssistance > 0) {
      qualifiedBase = Math.max(0, qualifiedBase - exp.provinceAssistance)
    }
    const credit = qualifiedBase * 0.15

    return {
      provinceCode: 'NB',
      provinceName: 'New Brunswick',
      formCode: 'T2SCH360',
      allFormCodes: ['T2SCH360'],
      credits: [
        {
          programCode: 'NB_RD',
          programName: 'New Brunswick R&D Tax Credit',
          rate: 0.15,
          base: qualifiedBase,
          creditAmount: credit,
          refundable: true,
          formCode: 'T2SCH360',
        },
      ],
      totalCredit: credit,
      refundableCredit: credit,
      nonRefundableCredit: 0,
      isFederalAssistance: true,
      federalAssistanceAmount: credit,
      qualifiedExpenditures: qualifiedBase,
      notes,
    }
  },
}

// ── Nova Scotia ─────────────────────────────────────────────────────────────

export const nsAdapter: ProvinceCalcStrategy = {
  provinceCode: 'NS',
  provinceName: 'Nova Scotia',
  primaryFormCode: 'T2SCH340',
  allFormCodes: ['T2SCH340'],
  usesFederalBase: true,
  assistanceReducesBase: true,
  hasRecapture: true,
  hasRenunciation: true,
  requiresSeparateAuthority: false,

  async calculateCredit(
    exp: ProvinceExpenditures,
    _sb: SupabaseClient
  ): Promise<ProvinceCreditResult> {
    const notes: string[] = []
    let qualifiedBase = exp.qualifiedExpenditures
    if (exp.provinceAssistance > 0) {
      qualifiedBase = Math.max(0, qualifiedBase - exp.provinceAssistance)
    }
    const credit = qualifiedBase * 0.15

    return {
      provinceCode: 'NS',
      provinceName: 'Nova Scotia',
      formCode: 'T2SCH340',
      allFormCodes: ['T2SCH340'],
      credits: [
        {
          programCode: 'NS_RD',
          programName: 'Nova Scotia R&D Tax Credit',
          rate: 0.15,
          base: qualifiedBase,
          creditAmount: credit,
          refundable: true,
          formCode: 'T2SCH340',
        },
      ],
      totalCredit: credit,
      refundableCredit: credit,
      nonRefundableCredit: 0,
      isFederalAssistance: true,
      federalAssistanceAmount: credit,
      qualifiedExpenditures: qualifiedBase,
      notes,
    }
  },
}

// ── Newfoundland & Labrador ─────────────────────────────────────────────────
// UNIQUE: eligible expenditures are NOT reduced by assistance for NL purposes
// (except GST/HST ITCs). The NL credit itself IS federal assistance.

export const nlAdapter: ProvinceCalcStrategy = {
  provinceCode: 'NL',
  provinceName: 'Newfoundland and Labrador',
  primaryFormCode: 'T2SCH301',
  allFormCodes: ['T2SCH301'],
  usesFederalBase: true,
  assistanceReducesBase: false, // ← the key NL exception
  hasRecapture: false,
  hasRenunciation: false,
  requiresSeparateAuthority: false,

  async calculateCredit(
    exp: ProvinceExpenditures,
    _sb: SupabaseClient
  ): Promise<ProvinceCreditResult> {
    const notes: string[] = []

    // NL does NOT reduce base by assistance (except GST/HST ITCs)
    // Use the raw provincial expenditure allocation, not the assistance-reduced one
    const qualifiedBase = exp.qualifiedExpenditures
    notes.push(
      'NL UNIQUE: eligible expenditures NOT reduced by government/non-government assistance (except GST/HST ITCs)'
    )

    const credit = qualifiedBase * 0.15

    return {
      provinceCode: 'NL',
      provinceName: 'Newfoundland and Labrador',
      formCode: 'T2SCH301',
      allFormCodes: ['T2SCH301'],
      credits: [
        {
          programCode: 'NL_SRED',
          programName: 'NL SR&ED Tax Credit',
          rate: 0.15,
          base: qualifiedBase,
          creditAmount: credit,
          refundable: true,
          formCode: 'T2SCH301',
        },
      ],
      totalCredit: credit,
      refundableCredit: credit,
      nonRefundableCredit: 0,
      isFederalAssistance: true, // NL credit IS federal assistance
      federalAssistanceAmount: credit, // NL credit is federal assistance
      qualifiedExpenditures: qualifiedBase,
      notes,
    }
  },
}

// ── Yukon ───────────────────────────────────────────────────────────────────
// 15% base + 5% bonus on payments to Yukon University

export const ytAdapter: ProvinceCalcStrategy = {
  provinceCode: 'YT',
  provinceName: 'Yukon',
  primaryFormCode: 'T2SCH442',
  allFormCodes: ['T2SCH442'],
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

    let qualifiedBase = exp.qualifiedExpenditures
    if (exp.provinceAssistance > 0) {
      qualifiedBase = Math.max(0, qualifiedBase - exp.provinceAssistance)
    }

    const baseCredit = qualifiedBase * 0.15

    // Check for Yukon University payments
    // TODO: Once a yt_university_payment flag/amount is added to cost_line_project_splits,
    // fetch and sum those amounts here. For now, this is a stub.
    const yukonUPayments = 0 // Placeholder
    const bonusCredit = yukonUPayments * 0.05

    if (yukonUPayments > 0) {
      notes.push(
        `Yukon University bonus: $${yukonUPayments.toLocaleString()} × 5% = $${bonusCredit.toFixed(2)}`
      )
    }

    const totalCredit = baseCredit + bonusCredit

    return {
      provinceCode: 'YT',
      provinceName: 'Yukon',
      formCode: 'T2SCH442',
      allFormCodes: ['T2SCH442'],
      credits: [
        {
          programCode: 'YT_RD',
          programName: 'Yukon R&D Tax Credit',
          rate: 0.15,
          base: qualifiedBase,
          creditAmount: baseCredit,
          refundable: true,
          formCode: 'T2SCH442',
        },
        ...(bonusCredit > 0
          ? [
              {
                programCode: 'YT_UNIVERSITY',
                programName: 'Yukon University Bonus',
                rate: 0.05,
                base: yukonUPayments,
                creditAmount: bonusCredit,
                refundable: true,
                formCode: 'T2SCH442',
              },
            ]
          : []),
      ],
      totalCredit,
      refundableCredit: totalCredit,
      nonRefundableCredit: 0,
      isFederalAssistance: true,
      federalAssistanceAmount: totalCredit,
      qualifiedExpenditures: qualifiedBase,
      notes,
    }
  },
}
