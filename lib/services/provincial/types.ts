/**
 * Provincial calculation strategy types.
 *
 * Each province adapter implements ProvinceCalcStrategy to encapsulate
 * province-specific credit logic, form codes, and edge cases.
 */

import { SupabaseClient } from '@supabase/supabase-js'

// ── Input to a provincial calculation ──

export interface ProvinceExpenditures {
  /** Total qualified expenditures allocated to this province. */
  qualifiedExpenditures: number
  /** Federal qualified expenditures (pre-provincial assistance). */
  federalQualifiedExpenditures: number
  /** Total assistance already deducted from federal QE. */
  federalAssistance: number
  /** Province-specific assistance items. */
  provinceAssistance: number
  /** Whether the claiming corporation is a CCPC. */
  isCCPC: boolean
  /** Tax year start date (ISO string). */
  taxYearStart: string
  /** Tax year end date (ISO string). */
  taxYearEnd: string
  /** Claim year ID for database lookups. */
  claimYearId: string
}

// ── Output from a provincial calculation ──

export interface ProvinceCreditResult {
  provinceCode: string
  provinceName: string
  formCode: string
  /** Primary form codes for export bundle generation. */
  allFormCodes: string[]
  /** Detailed credit breakdown. */
  credits: ProvinceCreditLine[]
  /** Total credit (sum of all credit lines). */
  totalCredit: number
  /** Total refundable portion. */
  refundableCredit: number
  /** Total non-refundable portion. */
  nonRefundableCredit: number
  /** Whether this credit is government assistance for federal purposes. */
  isFederalAssistance: boolean
  /** The portion of totalCredit that counts as government assistance for federal
   *  purposes. May be less than totalCredit when renunciation applies (MB, SK)
   *  or when a non-refundable portion is not claimed. The orchestration layer
   *  sums this field — never raw totalCredit. */
  federalAssistanceAmount: number
  /** Qualified expenditures used as base for this province. */
  qualifiedExpenditures: number
  /** Notes and warnings for the preparer. */
  notes: string[]
  /** Structured warning when a regime gate prevents calculation (e.g., QC pre-CRIC).
   *  Allows the review system and export service to act on the reason
   *  rather than interpreting a silent zero result. */
  warning?: { code: string; message: string }
}

export interface ProvinceCreditLine {
  /** Program identifier (e.g., 'OITC', 'ORDTC', 'OBRITC' for Ontario). */
  programCode: string
  programName: string
  rate: number
  base: number
  creditAmount: number
  refundable: boolean
  formCode: string
}

// ── Strategy interface ──

export interface ProvinceCalcStrategy {
  /** Two-letter province/territory code. */
  provinceCode: string
  /** Display name. */
  provinceName: string
  /** Primary CRA/provincial form code. */
  primaryFormCode: string
  /** All form codes this province requires. */
  allFormCodes: string[]

  // ── Province characteristics ──

  /** Whether the province uses federal QE as its base (most do). */
  usesFederalBase: boolean
  /** Whether assistance reduces the provincial eligible expenditure base.
   *  FALSE only for Newfoundland & Labrador. */
  assistanceReducesBase: boolean
  /** Whether recapture applies (BC, NB, NS). */
  hasRecapture: boolean
  /** Whether renunciation is available (SK, MB, NS). */
  hasRenunciation: boolean
  /** Whether filed with a separate authority (QC → Revenue Québec). */
  requiresSeparateAuthority: boolean

  /**
   * Calculate the provincial credit(s).
   * Some provinces (Ontario) have multiple stacked programs.
   */
  calculateCredit(
    expenditures: ProvinceExpenditures,
    sb: SupabaseClient
  ): Promise<ProvinceCreditResult>
}

// ── No-program gate ──

export interface NoProgram {
  provinceCode: string
  provinceName: string
  hasProgram: false
}

// ── Province registry entry ──

export type ProvinceRegistryEntry = ProvinceCalcStrategy | NoProgram

export function hasProgram(
  entry: ProvinceRegistryEntry
): entry is ProvinceCalcStrategy {
  return !('hasProgram' in entry) || entry.hasProgram !== false
}

/**
 * Validate that a ProvinceCreditResult is internally consistent.
 * Prevents adapter bugs that would inflate federal assistance deductions.
 * Call this after every adapter.calculateCredit() return.
 */
export function validateCreditResult(result: ProvinceCreditResult): void {
  if (result.federalAssistanceAmount > result.totalCredit) {
    throw new Error(
      `[${result.provinceCode}] federalAssistanceAmount ($${result.federalAssistanceAmount}) ` +
      `exceeds totalCredit ($${result.totalCredit}). ` +
      `This would inflate federal assistance deductions.`
    )
  }
  if (result.refundableCredit + result.nonRefundableCredit !== result.totalCredit) {
    throw new Error(
      `[${result.provinceCode}] refundable ($${result.refundableCredit}) + ` +
      `nonRefundable ($${result.nonRefundableCredit}) != totalCredit ($${result.totalCredit}).`
    )
  }
}
