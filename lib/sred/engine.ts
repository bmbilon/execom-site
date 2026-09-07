// ════════════════════════════════════════════════════════════════════════════
// SR&ED assessor — deterministic screening engine
//
// No model, no network, no randomness. Same answers in, same lane out, every
// time. That is what makes a result explainable to an applicant, replayable by
// a reviewer months later, and cheap enough to run for every mobile visitor.
//
// It issues no approval and no offer. Every purchase candidate starts
// unverified, and a candidate cannot become a purchase by changing a front-end
// field: the server recomputes all of this from validated answers.
//
// `assess()` returns two halves. `publicResult` is everything the browser may
// see. `internal` carries the purchase gates and the illustrative economics; it
// is persisted for staff and never serialized to the client.
// ════════════════════════════════════════════════════════════════════════════

import type { AssessmentInput } from './schema'
import {
  ARMS_LENGTH_CONTRACT_RATE,
  CCPC_ENHANCED_RATE,
  PROVINCIAL_INDICATIVE_RATES,
  PROXY_RATE,
  addMonths,
  expenditureLimitForYearEnd,
} from './rates'
import { SRED_POLICY_VERSION, type PurchasePolicy } from './config'

export type Lane =
  | 'purchase_review'
  | 'preparation_offer'
  | 'technical_review'
  | 'already_filed_review'
  | 'not_ready'

export const LANE_LABELS: Record<Lane, string> = {
  purchase_review: 'Purchase review',
  preparation_offer: 'Preparation offer',
  technical_review: 'Specialist review',
  already_filed_review: 'Existing claim review',
  not_ready: 'Not ready',
}

/** Reviewer triage weight. Purchase candidates surface first, nothing hides. */
export const LANE_PRIORITY: Record<Lane, number> = {
  purchase_review: 100,
  preparation_offer: 60,
  already_filed_review: 50,
  technical_review: 40,
  not_ready: 20,
}

export type EstimateKind = 'applicant_reported' | 'modelled' | 'none'

export interface Estimate {
  low: number
  high: number
  kind: EstimateKind
  /** Always false here. Verification happens after handoff, with documents. */
  verified: false
}

export interface DeadlineInfo {
  iso: string
  daysRemaining: number
  passed: boolean
  /** Calendar arithmetic only. Weekends, holidays and short years need review. */
  indicative: true
}

export interface PublicResult {
  lane: Lane
  policyVersion: string
  asOf: string
  estimate: Estimate | null
  provinceName: string
  /** Applicant-safe. Never contains economics, gates or decline reasons. */
  reasons: string[]
  /** Every assumption behind the number, shown next to it. */
  assumptions: string[]
  missingDocuments: string[]
  deadline: DeadlineInfo
  /** Show the three underwriting questions before giving a final answer. */
  needsUnderwritingScreen: boolean
  /** The optional 5% preparation service may be presented as a separate path. */
  preparationAvailable: boolean
  /** Always false. This build issues no offers. */
  offerIssued: false
  feeRate: number
}

export interface PurchaseGate {
  id: string
  label: string
  passed: boolean
  detail: string
  /** Unanswered rather than failed — the underwriting screen resolves it. */
  unanswered?: boolean
}

export interface PurchaseEconomics {
  /**
   * Assumes the Tax Rebate Discounting Act minimum-payment formula applies.
   * It does not determine applicability and it is not a quote.
   */
  assumption: string
  faceValueCad: number
  paymentCad: number
  grossDiscountCad: number
  baseContributionCad: number
  stressContributionCad: number
  minBaseContributionCad: number
  minStressContributionCad: number
  clearsFloor: boolean
}

export interface InternalResult {
  gates: PurchaseGate[]
  economics: PurchaseEconomics | null
  purchaseBlockers: string[]
  purchaseCandidate: boolean
  priority: number
  evidenceLevel: EvidenceLevel
}

export interface AssessOutcome {
  publicResult: PublicResult
  internal: InternalResult
}

// ─── Helpers ───────────────────────────────────────────────────────────────

export type EvidenceLevel = 'strong' | 'partial' | 'none'

/** All four core records = strong; some = partial; none = none. */
export function evidenceLevel(evidence: AssessmentInput['evidence']): EvidenceLevel {
  const n = new Set(evidence).size
  if (n >= 4) return 'strong'
  if (n >= 1) return 'partial'
  return 'none'
}

const SHARE_RANGE: Record<AssessmentInput['experimental_share'], [number, number]> = {
  '25-50': [0.25, 0.5],
  '50-75': [0.5, 0.75],
  '75-100': [0.75, 1],
}

const FILED_STAGES: AssessmentInput['claim_stage'][] = ['filed', 'assessed']

const DOCUMENTS_FILED = [
  'Filed T661 and supporting financial schedules',
  'CRA assessment or status, and current tax-account balances',
  'Existing financing or security agreements, and any releases',
  'Identity, signing authority and matching corporate bank details',
]

const DOCUMENTS_UNFILED = [
  'Project evidence of technological uncertainty and experimentation',
  'Payroll records and work-allocation support',
  'Canadian contractor invoices and any assistance agreements',
  'Corporate tax profile, prior claims and fiscal-year details',
]

function round2(n: number): number {
  return Math.round(n * 100) / 100
}

// ─── Purchase economics ────────────────────────────────────────────────────

/**
 * Illustrative only. Models the Tax Rebate Discounting Act minimum payment
 * (85% of the first $300, 95% of the balance) as the consideration, then nets
 * funding cost, fixed review and acquisition cost, and an expected loss
 * provision. Whether the Act applies to a given structure is a legal question
 * this code does not answer, and none of these figures is an offer.
 */
export function purchaseEconomics(
  faceValueCad: number,
  policy: PurchasePolicy
): PurchaseEconomics {
  const payment =
    faceValueCad <= 300 ? faceValueCad * 0.85 : 255 + 0.95 * (faceValueCad - 300)
  const gross = faceValueCad - payment

  const net = (days: number) =>
    gross -
    payment * policy.annualFundingCost * (days / 365) -
    policy.reviewCostCad -
    policy.acquisitionCostCad -
    faceValueCad * policy.expectedLossRate

  const baseContributionCad = round2(net(policy.baseDays))
  const stressContributionCad = round2(net(policy.stressDays))

  return {
    assumption:
      'Discounting Act minimum-payment formula assumed; applicability unresolved. Not an offer.',
    faceValueCad: round2(faceValueCad),
    paymentCad: round2(payment),
    grossDiscountCad: round2(gross),
    baseContributionCad,
    stressContributionCad,
    minBaseContributionCad: policy.minBaseContributionCad,
    minStressContributionCad: policy.minStressContributionCad,
    clearsFloor:
      baseContributionCad >= policy.minBaseContributionCad &&
      stressContributionCad >= policy.minStressContributionCad,
  }
}

// ─── Estimate ──────────────────────────────────────────────────────────────

function modelledCash(input: AssessmentInput, share: number): number {
  const salary = input.salary_cad * share
  const contractor = input.contractor_cad * share
  const materials = input.materials_cad * share
  const proxyOverhead = salary * PROXY_RATE

  const gross = salary + proxyOverhead + contractor * ARMS_LENGTH_CONTRACT_RATE + materials
  const base = Math.max(0, gross - input.assistance_cad)

  const prov = PROVINCIAL_INDICATIVE_RATES[input.province]
  const provBase = prov.base === 'salary' ? salary : base
  const provincialCredit = provBase * prov.rate
  const provincialRefund = provincialCredit * prov.refundableShare

  // A provincial credit is government assistance and reduces the federal base.
  const federalBase = Math.max(0, base - provincialCredit)
  const limit = expenditureLimitForYearEnd(input.fiscal_year_end)
  const federalCredit = CCPC_ENHANCED_RATE * Math.min(federalBase, limit)

  return Math.round(federalCredit + provincialRefund)
}

// ─── Main entry ────────────────────────────────────────────────────────────

export function assess(
  input: AssessmentInput,
  policy: PurchasePolicy,
  today: string = new Date().toISOString().slice(0, 10)
): AssessOutcome {
  const filed = FILED_STAGES.includes(input.claim_stage)
  const deadlineIso = addMonths(input.fiscal_year_end, 18)
  const future = input.fiscal_year_end > today
  const expired = !filed && deadlineIso < today
  const evidence = evidenceLevel(input.evidence)
  const prov = PROVINCIAL_INDICATIVE_RATES[input.province]

  const reasons: string[] = []
  const assumptions: string[] = []
  let estimate: Estimate | null = null

  // ── Estimate ──
  if (filed && (input.reported_refund_cad ?? 0) > 0) {
    const reported = input.reported_refund_cad as number
    estimate = { low: reported, high: reported, kind: 'applicant_reported', verified: false }
    assumptions.push(
      'This is the amount you entered, not an independent CRA verification.'
    )
  } else if (
    !future &&
    !expired &&
    input.corporation === 'ccpc' &&
    input.research === 'yes' &&
    input.salary_cad + input.contractor_cad + input.materials_cad > 0
  ) {
    const [lo, hi] = SHARE_RANGE[input.experimental_share]
    let low = modelledCash(input, lo)
    const high = modelledCash(input, hi)
    // Thin records mean less of the reported spend survives review.
    if (evidence === 'none') low = Math.round(low * 0.8)
    else if (evidence === 'partial') low = Math.round(low * 0.9)

    estimate = { low: Math.min(low, high), high, kind: 'modelled', verified: false }

    assumptions.push(
      `Uses the ${input.experimental_share}% experimental-work share you selected. It is a range of inputs, not a confidence interval.`,
      'Assumes CCPC status, the 35% enhanced federal rate, available expenditure limit and qualifying Canadian work.',
      'Includes the 55% prescribed proxy overhead amount on salaries, and 80% of arm’s-length Canadian contractor cost.',
      'Government assistance you entered is subtracted in full from the expenditure base.',
      `Includes the ${prov.name} credit at its headline rate; a provincial credit is assistance and reduces the federal base.`,
      'Before income-tax liabilities, CRA set-offs and refundability checks. A credit is not automatically cash.'
    )
    if (prov.note) assumptions.push(`${prov.name}: ${prov.note}`)
    if (evidence !== 'strong') {
      assumptions.push(
        'The low end carries a reduction because not all core records were reported as being on hand.'
      )
    }
  }

  // ── Lane ──
  let lane: Lane

  if (expired) {
    lane = 'not_ready'
    reasons.push(
      'This unfiled tax period appears to be outside the standard 18-month SR&ED reporting window. Verify the dates and whether an original return was filed on time.'
    )
  } else if (future) {
    lane = 'not_ready'
    reasons.push(
      'Planned work, or a tax year that has not closed, is not a collectible refund yet.'
    )
  } else if (input.research === 'no' && !filed) {
    lane = 'not_ready'
    reasons.push(
      'Routine development on its own does not establish SR&ED eligibility. The program tests for technological uncertainty that standard practice could not resolve.'
    )
  } else if (filed) {
    lane = 'already_filed_review'
    reasons.push(
      'Work that is already filed is not automatically a new preparation engagement.'
    )
  } else if (
    input.research === 'unsure' ||
    input.systematic !== 'yes' ||
    evidence === 'none' ||
    input.corporation !== 'ccpc'
  ) {
    lane = 'technical_review'
    reasons.push(
      'The technical evidence, the corporation profile or the way the work was recorded needs a specialist to look at it before anyone estimates cash.'
    )
  } else if (!estimate || estimate.high <= 0) {
    lane = 'technical_review'
    reasons.push(
      'These inputs do not produce a positive illustrative credit. Costs and assistance need checking.'
    )
  } else {
    lane = 'preparation_offer'
    reasons.push(
      'Supportable unfiled work can be considered for the optional preparation service.'
    )
  }

  // ── Purchase gates ──
  const face = filed ? (input.reported_refund_cad ?? 0) : 0
  const gates: PurchaseGate[] = []

  gates.push({
    id: 'program_open',
    label: 'Purchase intake open',
    passed: policy.programOpen,
    detail: policy.programOpen ? 'Open' : 'Closed by configuration',
  })
  gates.push({
    id: 'filed_or_assessed',
    label: 'Claim filed or assessed',
    passed: policy.requireFiled ? filed : true,
    detail: filed ? input.claim_stage : 'Not yet filed',
  })
  gates.push({
    id: 'expected_cash_band',
    label: 'Expected net cash inside the pilot band',
    passed: face >= policy.minExpectedCashCad && face <= policy.maxExpectedCashCad,
    detail: `Reported $${face.toLocaleString('en-CA')} against $${policy.minExpectedCashCad.toLocaleString('en-CA')}–$${policy.maxExpectedCashCad.toLocaleString('en-CA')}`,
  })
  gates.push({
    id: 'corporation_profile',
    label: 'CCPC corporation profile',
    passed: input.corporation === 'ccpc',
    detail: input.corporation,
  })
  gates.push({
    id: 'records_complete',
    label: 'Complete supporting records',
    passed: evidence === 'strong',
    detail: `Records reported: ${evidence}`,
  })
  gates.push({
    id: 'claim_history',
    label: 'Two prior accepted claims, no unresolved issues',
    passed: policy.requirePriorClaimsClean
      ? input.claim_history === 'two_clean'
      : input.claim_history !== 'issues',
    detail: input.claim_history,
  })
  gates.push({
    id: 'no_tax_offsets',
    label: 'No unresolved CRA offsets or tax debt',
    passed: input.debt === 'no',
    unanswered: input.debt === undefined,
    detail: input.debt ?? 'Not yet asked',
  })
  gates.push({
    id: 'no_competing_security',
    label: 'No competing assignment, pledge or security',
    passed: input.security === 'no',
    unanswered: input.security === undefined,
    detail: input.security ?? 'Not yet asked',
  })
  gates.push({
    id: 'collection_window',
    label: `Collection expected within ~${policy.maxCollectionDays} days`,
    passed: input.timing === '30' || input.timing === '60',
    unanswered: input.timing === undefined,
    detail: input.timing ?? 'Not yet asked',
  })
  gates.push({
    id: 'open_to_sale',
    label: 'Applicant open to a purchase',
    passed: input.preference !== 'service',
    detail: input.preference,
  })

  const economics = face > 0 ? purchaseEconomics(face, policy) : null
  gates.push({
    id: 'economics_floor',
    label: 'Illustrative contribution above the floor, base and stress',
    passed: !!economics?.clearsFloor,
    detail: economics
      ? `Base $${economics.baseContributionCad.toLocaleString('en-CA')}, stress $${economics.stressContributionCad.toLocaleString('en-CA')}`
      : 'No reported cash amount to model',
  })

  // Blockers are the gates that were ANSWERED and failed. An unanswered gate is
  // a question we have not put yet, not a reason to decline.
  const BLOCKER_TEXT: Record<string, string> = {
    program_open: 'Cash-purchase intake is not open. Do not advertise an available purchase.',
    filed_or_assessed: 'The purchase pilot requires a filed or assessed claim.',
    expected_cash_band: `Purchase pilot range: $${policy.minExpectedCashCad.toLocaleString('en-CA')}–$${policy.maxExpectedCashCad.toLocaleString('en-CA')} expected net cash.`,
    corporation_profile: 'Pilot corporation profile requires review.',
    records_complete: 'Complete records are required for purchase screening.',
    claim_history: 'Pilot prefers two previously accepted claims without unresolved issues.',
    no_tax_offsets: 'Tax balances and set-offs need clearance.',
    no_competing_security: 'Existing assignments or security need verification or a release.',
    collection_window: 'Pilot requires a supported near-term collection timeline.',
    open_to_sale: 'Applicant prefers the preparation service over a purchase.',
    economics_floor: 'Illustrative risk-adjusted contribution is below the configured floor.',
  }

  const answeredFailures = gates.filter((g) => !g.passed && !g.unanswered)
  const purchaseBlockers = answeredFailures.map((g) => BLOCKER_TEXT[g.id] ?? g.label)
  const unanswered = gates.filter((g) => g.unanswered)

  // ── Purchase override ──
  //
  // A filed file that clears every gate is a purchase candidate. When that
  // happens the earlier "already filed" line is replaced rather than added to:
  // telling someone their claim is worth a purchase review AND that filed work
  // is not a preparation engagement reads like two different answers.
  if (filed && !future && !expired && purchaseBlockers.length === 0 && unanswered.length === 0) {
    if (policy.programOpen) {
      lane = 'purchase_review'
      reasons.length = 0
      reasons.push(
        'This matches our initial purchase screen. Every input is still unverified, and this is not an offer or an approval.'
      )
    } else {
      lane = 'already_filed_review'
      reasons.push('Cash-purchase intake is not currently open.')
    }
  }

  // Ask the three underwriting questions only when nothing else blocks, so we
  // never make someone answer them for a file that cannot be purchased anyway.
  const needsUnderwritingScreen =
    policy.programOpen &&
    filed &&
    !future &&
    !expired &&
    unanswered.length > 0 &&
    purchaseBlockers.length === 0

  // ── Context ──
  if (input.preapproval === 'yes') {
    assumptions.push(
      'Pre-claim approval relates to the work described. It does not approve an expenditure amount and does not guarantee a refund.'
    )
  }
  if (input.corporation === 'other' && lane !== 'not_ready') {
    reasons.push(
      'Outside a CCPC the federal credit is generally non-refundable: it reduces tax payable rather than paying out as cash.'
    )
  }
  if (input.corporation === 'unsure' && lane !== 'not_ready') {
    reasons.push(
      'CCPC status changes the answer materially, because only the enhanced credit is refundable cash. That needs confirming before any figure means much.'
    )
  }
  if (input.assistance_cad > 0) {
    reasons.push(
      'Government assistance reduces the expenditures a claim can be built on, and the figures above already carry that reduction.'
    )
  }

  const daysRemaining = Math.floor(
    (new Date(deadlineIso + 'T12:00:00Z').getTime() -
      new Date(today + 'T12:00:00Z').getTime()) /
      86_400_000
  )
  if (!filed && daysRemaining >= 0 && daysRemaining <= 120) {
    reasons.push(
      `The reporting deadline for this fiscal year is roughly ${daysRemaining} days away. SR&ED reporting deadlines are not extendable.`
    )
  }

  // A technically weak claim never becomes a preparation lead just because it
  // failed purchase underwriting, and a filed claim is never auto-enrolled.
  const preparationAvailable = lane === 'preparation_offer'

  return {
    publicResult: {
      lane,
      policyVersion: SRED_POLICY_VERSION,
      asOf: today,
      estimate,
      provinceName: prov.name,
      reasons,
      assumptions,
      missingDocuments: filed ? DOCUMENTS_FILED : DOCUMENTS_UNFILED,
      deadline: {
        iso: deadlineIso,
        daysRemaining,
        passed: expired,
        indicative: true,
      },
      needsUnderwritingScreen,
      preparationAvailable,
      offerIssued: false,
      feeRate: 0.05,
    },
    internal: {
      gates,
      economics,
      purchaseBlockers,
      purchaseCandidate: lane === 'purchase_review',
      priority: LANE_PRIORITY[lane],
      evidenceLevel: evidence,
    },
  }
}
