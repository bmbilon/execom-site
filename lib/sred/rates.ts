// ════════════════════════════════════════════════════════════════════════════
// SR&ED rate constants for the PUBLIC INDICATIVE estimate only.
//
// Authority for real claim math is `lib/services/federalCalcService.ts` and the
// province adapters under `lib/services/provincial/`. Those run against a real
// claim year with classified cost line items and cannot serve an anonymous
// visitor who has typed three numbers into a phone. The constants here mirror
// the reviewed services so the two never disagree on headline rates; if a rate
// changes there, change it here in the same commit.
//
// Nothing in this file produces a filing figure. It produces a range that is
// labelled indicative everywhere it is shown.
// ════════════════════════════════════════════════════════════════════════════

/** Prescribed proxy amount — ITA Reg. 2900(4). Mirrors federalCalcService. */
export const PROXY_RATE = 0.55

/** CCPC enhanced ITC rate on qualified expenditures up to the limit. */
export const CCPC_ENHANCED_RATE = 0.35

/** Basic ITC rate. Non-refundable for most non-CCPC claimants. */
export const BASIC_ITC_RATE = 0.15

/** Arm's-length contract inclusion rate. */
export const ARMS_LENGTH_CONTRACT_RATE = 0.8

/** Expenditure limit, tax years starting before 2024-12-16. */
export const EXPENDITURE_LIMIT_PRE_2024 = 3_000_000

/** Expenditure limit, tax years starting on or after 2024-12-16. */
export const EXPENDITURE_LIMIT_POST_2024 = 6_000_000

export const CAPITAL_PROPERTY_REINSTATEMENT_DATE = '2024-12-16'

export function expenditureLimitForYearEnd(fiscalYearEndIso: string): number {
  // The limit keys off the tax year START. The public assessor only asks for a
  // year end, so approximate the start as year end minus twelve months.
  const end = new Date(fiscalYearEndIso)
  if (Number.isNaN(end.getTime())) return EXPENDITURE_LIMIT_PRE_2024
  const start = new Date(end)
  start.setFullYear(start.getFullYear() - 1)
  return start >= new Date(CAPITAL_PROPERTY_REINSTATEMENT_DATE)
    ? EXPENDITURE_LIMIT_POST_2024
    : EXPENDITURE_LIMIT_PRE_2024
}

export type ProvinceCode =
  | 'AB' | 'BC' | 'SK' | 'MB' | 'ON' | 'QC'
  | 'NB' | 'NS' | 'NL' | 'YT'
  | 'PE' | 'NT' | 'NU'

export interface ProvincialIndicativeRate {
  code: ProvinceCode
  name: string
  /** Headline credit rate applied to the indicative base. */
  rate: number
  /** Share of the credit that is refundable (cash) for a small CCPC. */
  refundableShare: number
  /** QC applies its enhanced rate to salaries, not the full base. */
  base: 'qualified_expenditures' | 'salary'
  note?: string
}

/**
 * Headline provincial rates, taken from the province adapters in this repo.
 * Refundability is modelled for a small CCPC — the only profile the pilot
 * purchase program considers — and is deliberately conservative elsewhere.
 */
export const PROVINCIAL_INDICATIVE_RATES: Record<ProvinceCode, ProvincialIndicativeRate> = {
  AB: { code: 'AB', name: 'Alberta', rate: 0.08, refundableShare: 1, base: 'qualified_expenditures', note: 'Innovation Employment Grant base rate. Incremental uplift not modelled.' },
  BC: { code: 'BC', name: 'British Columbia', rate: 0.10, refundableShare: 1, base: 'qualified_expenditures' },
  SK: { code: 'SK', name: 'Saskatchewan', rate: 0.10, refundableShare: 1, base: 'qualified_expenditures' },
  MB: { code: 'MB', name: 'Manitoba', rate: 0.15, refundableShare: 0.5, base: 'qualified_expenditures', note: 'Half the Manitoba credit is refundable at the standard ratio.' },
  ON: { code: 'ON', name: 'Ontario', rate: 0.08, refundableShare: 1, base: 'qualified_expenditures', note: 'OITC only. ORDTC is non-refundable and is not modelled here.' },
  QC: { code: 'QC', name: 'Quebec', rate: 0.30, refundableShare: 1, base: 'salary', note: 'Enhanced CRIC rate applied to salaries.' },
  NB: { code: 'NB', name: 'New Brunswick', rate: 0.15, refundableShare: 1, base: 'qualified_expenditures' },
  NS: { code: 'NS', name: 'Nova Scotia', rate: 0.15, refundableShare: 1, base: 'qualified_expenditures' },
  NL: { code: 'NL', name: 'Newfoundland and Labrador', rate: 0.15, refundableShare: 1, base: 'qualified_expenditures' },
  YT: { code: 'YT', name: 'Yukon', rate: 0.15, refundableShare: 1, base: 'qualified_expenditures' },
  PE: { code: 'PE', name: 'Prince Edward Island', rate: 0, refundableShare: 0, base: 'qualified_expenditures', note: 'No provincial SR&ED program.' },
  NT: { code: 'NT', name: 'Northwest Territories', rate: 0, refundableShare: 0, base: 'qualified_expenditures', note: 'No territorial SR&ED program.' },
  NU: { code: 'NU', name: 'Nunavut', rate: 0, refundableShare: 0, base: 'qualified_expenditures', note: 'No territorial SR&ED program.' },
}

/**
 * Last day of a given month. Month is 1-indexed, so lastDayOfMonth(2024, 2) is
 * 29 and lastDayOfMonth(2025, 2) is 28. Day 0 of the next month is the last day
 * of this one.
 */
export function lastDayOfMonth(year: number, month: number): number {
  return new Date(Date.UTC(year, month, 0)).getUTCDate()
}

/**
 * Calendar-month addition with month-end clamping. Adding 18 months to a
 * 2025-08-31 year end gives 2027-02-28, not an overflow into March.
 */
export function addMonths(iso: string, months: number): string {
  const [y, m, d] = iso.split('-').map(Number)
  const first = new Date(Date.UTC(y, m - 1 + months, 1, 12))
  const lastDayOfTarget = new Date(
    Date.UTC(first.getUTCFullYear(), first.getUTCMonth() + 1, 0, 12)
  ).getUTCDate()
  first.setUTCDate(Math.min(d, lastDayOfTarget))
  return first.toISOString().slice(0, 10)
}

/**
 * SR&ED reporting deadline: twelve months past the T2 filing due date, which is
 * itself six months past the tax year end. Eighteen months after year end.
 *
 * Calendar arithmetic only. Weekend and holiday rollovers, short tax years and
 * amended returns all need a specialist, which is why every surface that shows
 * this labels it indicative.
 */
export function sredReportingDeadline(fiscalYearEndIso: string): string {
  return addMonths(fiscalYearEndIso, 18)
}
