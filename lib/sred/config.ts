// ════════════════════════════════════════════════════════════════════════════
// SR&ED acquisition funnel — server-side policy configuration
//
// Pilot purchase screening thresholds and the illustrative economics used to
// test whether a candidate clears a contribution floor under base and stress
// scenarios. These are BUSINESS ASSUMPTIONS, not law, not lender terms, not
// measured loss history. Every one is overridable by environment variable so
// the pilot can be retuned without shipping new logic.
//
// SERVER ONLY. Funding cost and loss assumptions must never reach the browser.
// The guard below turns an accidental client import into a loud failure rather
// than a quiet leak, and `engine.ts` splits its output so the client half never
// carries a gate, a blocker reason, or an economics figure.
// ════════════════════════════════════════════════════════════════════════════

if (typeof window !== 'undefined') {
  throw new Error(
    'lib/sred/config.ts is server-only: it carries purchase funding and loss ' +
      'assumptions that must not be shipped to the browser.'
  )
}

/**
 * Version stamp written onto every stored lead. Bump whenever a threshold or
 * the routing logic changes so historical decisions stay explainable.
 */
export const SRED_POLICY_VERSION = '2026.09.07-pilot-1'

/** Consent wording version recorded alongside each captured contact. */
export const SRED_CONSENT_VERSION = 'assessment-2026-09-07'

function envNumber(key: string, fallback: number): number {
  const raw = process.env[key]
  if (raw === undefined || raw === '') return fallback
  const n = Number(raw)
  return Number.isFinite(n) ? n : fallback
}

function envBool(key: string, fallback: boolean): boolean {
  const raw = process.env[key]
  if (raw === undefined || raw === '') return fallback
  return raw === '1' || raw.toLowerCase() === 'true'
}

export interface PurchasePolicy {
  /**
   * Master switch for the purchase program. While this is false the page must
   * not advertise an available purchase and no applicant is routed into the
   * purchase lane. Capital, legal structure and funding gates control this.
   */
  programOpen: boolean

  // ── Published screening criteria ──
  /**
   * Applicant-reported expected SR&ED cash, inclusive band.
   *
   * The floor must stay above the point where the modelled contribution clears
   * `minBaseContributionCad`, or the page advertises a minimum that the
   * economics gate then rejects. At the current funding cost and fixed costs,
   * base contribution is roughly 0.0333 x face - 1020, so a $500 base floor is
   * viable from about $45,700 and a $1,500 floor only from about $75,700.
   */
  minExpectedCashCad: number
  maxExpectedCashCad: number
  /** Pilot underwrites filed or assessed claims only. */
  requireFiled: boolean
  /** Prior accepted claims required. Pilot preference is two, clean. */
  minPriorAcceptedClaims: number
  /** Unresolved issues on prior claims block the purchase lane. */
  requirePriorClaimsClean: boolean
  /** Expected collection window, in days. */
  maxCollectionDays: number

  // ── Server-only illustrative economics ──
  /**
   * Annualized funding cost applied to the consideration over the days the
   * position is outstanding. Illustrative, not a lender quote.
   */
  annualFundingCost: number
  /** Days outstanding, base scenario. */
  baseDays: number
  /** Days outstanding, stress scenario. */
  stressDays: number
  /** Fixed technical/financial review cost per file. */
  reviewCostCad: number
  /** Fixed acquisition cost per file. */
  acquisitionCostCad: number
  /** Expected loss provision as a share of face value. */
  expectedLossRate: number
  /** Minimum contribution the base scenario must clear. */
  minBaseContributionCad: number
  /** Minimum contribution the stress scenario must clear. */
  minStressContributionCad: number
}

export function getPurchasePolicy(): PurchasePolicy {
  return {
    programOpen: envBool('SRED_PURCHASE_PROGRAM_OPEN', true),

    minExpectedCashCad: envNumber('SRED_PURCHASE_MIN_CASH', 50_000),
    maxExpectedCashCad: envNumber('SRED_PURCHASE_MAX_CASH', 300_000),
    requireFiled: envBool('SRED_PURCHASE_REQUIRE_FILED', true),
    minPriorAcceptedClaims: envNumber('SRED_PURCHASE_MIN_PRIOR_CLAIMS', 2),
    requirePriorClaimsClean: envBool('SRED_PURCHASE_REQUIRE_CLEAN_HISTORY', true),
    maxCollectionDays: envNumber('SRED_PURCHASE_MAX_COLLECTION_DAYS', 60),

    annualFundingCost: envNumber('SRED_PURCHASE_FUNDING_COST', 0.1),
    baseDays: envNumber('SRED_PURCHASE_BASE_DAYS', 45),
    stressDays: envNumber('SRED_PURCHASE_STRESS_DAYS', 90),
    reviewCostCad: envNumber('SRED_PURCHASE_REVIEW_COST', 750),
    acquisitionCostCad: envNumber('SRED_PURCHASE_ACQUISITION_COST', 300),
    expectedLossRate: envNumber('SRED_PURCHASE_EXPECTED_LOSS', 0.005),
    // Set so the advertised $50,000 floor actually clears: a $50,000 file
    // models a base contribution of about $645, against $1,050 of fixed review
    // and acquisition cost. Thin, and deliberately so during the pilot.
    minBaseContributionCad: envNumber('SRED_PURCHASE_MIN_BASE_CONTRIBUTION', 500),
    minStressContributionCad: envNumber('SRED_PURCHASE_MIN_STRESS_CONTRIBUTION', 0),
  }
}

/**
 * Preparation service fee: 5% of the SR&ED cash refund actually received,
 * payable after receipt, under a separate agreement. Not a purchase, and never
 * described as one.
 */
export const PREPARATION_FEE_RATE = 0.05

/** Rate control on the anonymous assessor endpoints. */
export interface RateLimitPolicy {
  assessPerWindow: number
  leadPerWindow: number
  windowMs: number
}

export function getRateLimitPolicy(): RateLimitPolicy {
  return {
    assessPerWindow: envNumber('SRED_RATE_ASSESS_PER_WINDOW', 30),
    leadPerWindow: envNumber('SRED_RATE_LEAD_PER_WINDOW', 8),
    windowMs: envNumber('SRED_RATE_WINDOW_MS', 60_000),
  }
}

/** Max accepted request body, in bytes, on the public endpoints. */
export function maxBodyBytes(): number {
  return envNumber('SRED_MAX_BODY_BYTES', 32 * 1024)
}
