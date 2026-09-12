'use client'

/**
 * Capital Desk, the interactive block of the /capital-desk marketing route.
 *
 * Three sections that share one computed verdict: the screen (inputs plus a
 * live readout), the bench (blind cards, sorted so matches lead), and the
 * intake form (the screen result travels with the message).
 *
 * The engine reproduces Execom_Research_to_Ownership_Model_v2.xlsx. Verified
 * against the workbook at the Conservative, Base and Aggressive scenarios:
 * qualified expenditures, IEG, federal ITC, gross credits, year-one budget,
 * net outlay, credits earned to close, bridge residual, denial-case payment,
 * price, uses, senior capacity, senior drawn, financing gap and DSCR all tie.
 * Do not "simplify" a constant here without changing the workbook first.
 *
 * Brand rule: "execom" always lowercase in UI copy.
 */

import { useMemo, useState } from 'react'
import Link from 'next/link'

// TODO: point this at the desk inbox once it exists, or replace the mailto
// handoff with a POST to the CRM endpoint.
const DESK_EMAIL = 'brett@execom.ca'

// ─────────────────────────────────────────────────────────────────────────────
// MODEL CONSTANTS (v2 workbook)
// ─────────────────────────────────────────────────────────────────────────────

const YMPE = 74_600 // year's maximum pensionable earnings, 2026
const FLOOR_CEIL = 0.2 // seller net year-one outlay, share of baseline EBITDA
const BAND_LO = 650_000
const BAND_HI = 1_500_000
const COVER_MIN = 2.0 // denial-case coverage, go/no-go test 11
const CREDIT_MONTH = 17 // month the Alberta grant lands, from residency start

const EMPLOYER_BURDEN = 0.12
const PROXY_RATE = 0.55
const PROGRAM_FEE_MONTHLY = 3_000
const PROGRAM_FEE_SRED_SHARE = 0.6
const CONTRACT_ELIGIBLE = 0.8
const ASSESSMENT_FEE = 15_000
const OTHER_NON_ELIGIBLE = 5_000
const FED_ITC_RATE = 0.35

// ─────────────────────────────────────────────────────────────────────────────
// INPUT MODEL
// ─────────────────────────────────────────────────────────────────────────────

type Choices = {
  revenue: 'under3' | 'band' | 'over15'
  employees: 'under10' | 'band' | 'over80'
  province: 'AB' | 'other'
  claims: 'no' | 'yes'
  intent: 'exit' | 'stay' | 'unsure'
  constraint: 'named' | 'maybe' | 'software'
  concentration: 'under30' | 'over30'
  ownerSales: 'under' | 'over'
  sic: 'yes' | 'no'
  realty: 'no' | 'yes'
  books: 'clean' | 'messy'
  paper: 'yes' | 'maybe' | 'no'
}

type Numbers = {
  ebitda: number
  freeCash: number
  salary: number
  timeShare: number // percent
  materials: number
  multiple: number
  uplift: number // percent
  months: number
  contrib: number
}

type SectorKey =
  | 'fabrication'
  | 'food'
  | 'indserv'
  | 'ag'
  | 'building'
  | 'instrument'
  | 'homeserv'
  | 'retail'
  | 'prof'
  | 'franchise'
  | 'other'

type Lane =
  | 'r2o'
  | 'growth'
  | 'exit'
  | 'conditional'
  | 'below'
  | 'walkaway'

// Prefilled with an example so the readout is populated on first paint.
const DEFAULT_CHOICES: Choices = {
  revenue: 'band',
  employees: 'band',
  province: 'AB',
  claims: 'no',
  intent: 'exit',
  constraint: 'named',
  concentration: 'under30',
  ownerSales: 'under',
  sic: 'yes',
  realty: 'no',
  books: 'clean',
  paper: 'yes',
}

const DEFAULT_NUMBERS: Numbers = {
  ebitda: 720_000,
  freeCash: 210_000,
  salary: 90_000,
  timeShare: 60,
  materials: 25_000,
  multiple: 3.5,
  uplift: 20,
  months: 20,
  contrib: 150_000,
}

const WALK_PAST: SectorKey[] = ['homeserv', 'retail', 'prof', 'franchise']
const ARCHETYPES: SectorKey[] = [
  'fabrication',
  'food',
  'indserv',
  'ag',
  'building',
  'instrument',
]

const SECTOR_LABEL: Record<SectorKey, string> = {
  fabrication: 'Fabrication and machining',
  food: 'Food and beverage processing',
  indserv: 'Industrial services',
  ag: 'Ag processing and equipment',
  building: 'Building products',
  instrument: 'Instrumentation and controls',
  homeserv: 'Home and property services',
  retail: 'Retail or distribution',
  prof: 'Professional services',
  franchise: 'Franchise',
  other: 'Other',
}

const SECTOR_OPTIONS: { value: SectorKey; label: string }[] = [
  { value: 'fabrication', label: 'Custom fabrication and machining' },
  { value: 'food', label: 'Food and beverage processing' },
  { value: 'indserv', label: 'Industrial services: coatings, NDT, water' },
  { value: 'ag', label: 'Ag processing and equipment' },
  { value: 'building', label: 'Building products: precast, millwork, panels' },
  { value: 'instrument', label: 'Instrumentation, controls, electronics' },
  { value: 'homeserv', label: 'Home and property services' },
  { value: 'retail', label: 'Retail or distribution without processing' },
  { value: 'prof', label: 'Professional services' },
  { value: 'franchise', label: 'Franchise operation' },
  { value: 'other', label: 'Something else' },
]

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────

const money = (v: number) =>
  (v < 0 ? '-$' : '$') + Math.round(Math.abs(v)).toLocaleString('en-CA')

const pct = (v: number, d = 1) => (v * 100).toFixed(d) + '%'

const pmtAnnual = (p: number, rate: number, years: number) =>
  p <= 0 ? 0 : (p * rate) / (1 - Math.pow(1 + rate, -years))

const pmtMonthly = (p: number, annualRate: number, months: number) => {
  const r = annualRate / 12
  return p <= 0 ? 0 : (p * r) / (1 - Math.pow(1 + r, -months))
}

// ─────────────────────────────────────────────────────────────────────────────
// SR&ED AND RESIDENCY ENGINE
// ─────────────────────────────────────────────────────────────────────────────

type SredResult = {
  qualified: number
  ieg: number
  fed: number
  credits: number
  budget: number
  net: number
  floor: number
  creditsToClose: number
  terminationMonth: number
  residual: number
  denialMonthly: number
  denialAnnual: number
}

function runSred(n: Numbers, c: Choices): SredResult {
  const timeShare = n.timeShare / 100
  const onSred = n.salary * timeShare

  const eligibleSalary = Math.min(onSred, 5 * YMPE)
  // The option makes the successor a specified employee from day one, so the
  // proxy base is capped at 75% of salary and 2.5 x YMPE.
  const proxyBase = Math.min(onSred, 0.75 * n.salary, 2.5 * YMPE)
  const proxy = PROXY_RATE * proxyBase
  const contracts =
    CONTRACT_ELIGIBLE * (PROGRAM_FEE_MONTHLY * 12 * PROGRAM_FEE_SRED_SHARE)

  const qualified = eligibleSalary + proxy + contracts + n.materials

  const iegRate = c.province === 'AB' ? (c.claims === 'yes' ? 0.08 : 0.2) : 0
  const ieg = qualified * iegRate
  const fed = FED_ITC_RATE * (qualified - ieg)
  const credits = ieg + fed

  const budget =
    n.salary * (1 + EMPLOYER_BURDEN) +
    n.materials +
    OTHER_NON_ELIGIBLE +
    PROGRAM_FEE_MONTHLY * 12 +
    ASSESSMENT_FEE
  const runRate = budget - ASSESSMENT_FEE
  const net = budget - credits

  // Year two: the IEG steps down as the historical base fills in.
  const iegRateY2 = c.province === 'AB' ? (c.claims === 'yes' ? 0.08 : 0.14) : 0
  const y2 =
    qualified * iegRateY2 + FED_ITC_RATE * (qualified - qualified * iegRateY2)
  const monthsInY2 = Math.max(0, Math.min(12, n.months - 12))
  const creditsToClose = credits + (y2 * monthsInY2) / 12

  // Failure path: terminated at the gate, claim denied in full.
  const terminationMonth = Math.max(3, Math.min(12, Math.round(n.months * 0.375)))
  const creditMonth = Math.max(terminationMonth + 4, CREDIT_MONTH)
  const outlayToTermination = (runRate / 12) * terminationMonth + ASSESSMENT_FEE
  const contributionToTermination =
    n.contrib * (terminationMonth / Math.max(1, n.months))
  const bridge = Math.max(0, outlayToTermination - contributionToTermination)
  const origination = 0.02 * bridge
  const interest =
    (0.12 * bridge * Math.max(0, creditMonth - terminationMonth / 2)) / 12
  const residual = bridge + origination + interest
  const denialMonthly = pmtMonthly(residual, 0.12, 24)

  return {
    qualified,
    ieg,
    fed,
    credits,
    budget,
    net,
    floor: net / FLOOR_CEIL,
    creditsToClose,
    terminationMonth,
    residual,
    denialMonthly,
    denialAnnual: denialMonthly * 12,
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// CAPITAL STACK AT CLOSE
// ─────────────────────────────────────────────────────────────────────────────

type StackResult = {
  price: number
  ebitdaClose: number
  uses: number
  senior: number
  vtb: number
  sub: number
  pref: number
  cash: number
  gap: number
  dscr: number
}

function runStack(n: Numbers): StackResult {
  const price = n.multiple * n.ebitda
  const ebitdaClose = n.ebitda * (1 + n.uplift / 100)
  const coordinationFee = 0.02 * price
  const uses = price + 30_000 + 50_000 + coordinationFee

  const capacity = Math.min(3.0 * ebitdaClose, 0.6 * price)
  const vtb = 0.2 * price
  const sub = 0.1 * price
  const pref = 0.15 * price
  const cash = 50_000
  const other = vtb + sub + pref + cash

  const senior = Math.max(0, Math.min(capacity, uses - other))
  const gap = uses - (senior + other)

  const debtService =
    pmtAnnual(senior, 0.08, 7) + pmtAnnual(vtb, 0.07, 5) + 0.13 * sub
  const cfads = ebitdaClose * 0.75

  return {
    price,
    ebitdaClose,
    uses,
    senior,
    vtb,
    sub,
    pref,
    cash,
    gap: Math.max(0, gap),
    dscr: debtService > 0 ? cfads / debtService : 0,
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// GATES, SCORE, ROUTE
// ─────────────────────────────────────────────────────────────────────────────

type Gate = {
  name: string
  sub: string
  threshold: string
  actual: string
  ok: boolean
  hard: boolean
}

type Verdict = {
  sred: SredResult
  stack: StackResult
  gates: Gate[]
  dimensions: { label: string; value: number }[]
  total: number
  route: string
  chip: string
  tone: 'ok' | 'op' | 'no'
  line: string
  lane: Lane
  coverage: number
}

function assess(n: Numbers, c: Choices, sector: SectorKey): Verdict {
  const sred = runSred(n, c)
  const stack = runStack(n)
  const walkPast = WALK_PAST.includes(sector)
  const archetype = ARCHETYPES.includes(sector)
  const coverage = sred.denialAnnual > 0 ? n.freeCash / sred.denialAnnual : 99

  const gates: Gate[] = [
    {
      name: 'EBITDA carries the residency',
      sub: 'Seller net cost in year one stays at or under 20% of baseline earnings',
      threshold: 'at least ' + money(sred.floor),
      actual: money(n.ebitda),
      ok: n.ebitda >= sred.floor,
      hard: true,
    },
    {
      name: 'Inside the financing band',
      sub: 'Where the transfer closes with about 35% seller paper',
      threshold: money(BAND_LO) + ' to ' + money(BAND_HI),
      actual: money(n.ebitda),
      ok: n.ebitda >= BAND_LO && n.ebitda <= BAND_HI,
      hard: false,
    },
    {
      name: 'Revenue band',
      sub: 'Enough operating complexity to absorb a technical hire',
      threshold: '$3M to $15M',
      actual:
        c.revenue === 'band'
          ? 'in band'
          : c.revenue === 'under3'
            ? 'under $3M'
            : 'over $15M',
      ok: c.revenue === 'band',
      hard: true,
    },
    {
      name: 'Headcount',
      sub: 'A crew the successor can learn to run',
      threshold: '10 to 80',
      actual:
        c.employees === 'band'
          ? 'in band'
          : c.employees === 'under10'
            ? 'under 10'
            : 'over 80',
      ok: c.employees === 'band',
      hard: true,
    },
    {
      name: 'A technological constraint you already name',
      sub: 'The narrowest gate. Routine engineering and software adoption are excluded',
      threshold: 'named and unresolved',
      actual:
        c.constraint === 'named'
          ? 'named'
          : c.constraint === 'maybe'
            ? 'roughly'
            : 'software, pricing or scheduling',
      ok: c.constraint === 'named',
      hard: true,
    },
    {
      name: 'Sector fits a technical archetype',
      sub: 'Six archetypes where experimental development is the real bottleneck',
      threshold: 'one of six',
      actual: SECTOR_LABEL[sector],
      ok: archetype,
      hard: true,
    },
    {
      name: 'Can carry a denied claim',
      sub: 'Free cash covers the worst case bridge payment twice over',
      threshold: 'at least ' + money(sred.denialAnnual * COVER_MIN) + ' free cash',
      actual: money(n.freeCash) + ' (' + coverage.toFixed(2) + 'x)',
      ok: coverage >= COVER_MIN,
      hard: true,
    },
    {
      name: 'No customer over 30% of revenue',
      sub: 'Concentration kills the financing and the price',
      threshold: 'under 30%',
      actual: c.concentration === 'under30' ? 'under 30%' : '30% or more',
      ok: c.concentration === 'under30',
      hard: true,
    },
    {
      name: 'Sales are not carried by the owner',
      sub: 'Relationships that leave with you are not transferable',
      threshold: 'under half',
      actual: c.ownerSales === 'under' ? 'under half' : 'more than half',
      ok: c.ownerSales === 'under',
      hard: false,
    },
    {
      name: 'Second in command in place',
      sub: 'Someone holds the floor while the successor runs experiments',
      threshold: 'yes',
      actual: c.sic === 'yes' ? 'yes' : 'no',
      ok: c.sic === 'yes',
      hard: false,
    },
    {
      name: 'No real property in the deal',
      sub: 'Land in the deal breaks the stack and adds a licensing question',
      threshold: 'leased or carved out',
      actual: c.realty === 'no' ? 'carved out' : 'land and building included',
      ok: c.realty === 'no',
      hard: false,
    },
    {
      name: 'Books survive a light review',
      sub: 'A quality of earnings pass is the first thing a lender asks for',
      threshold: 'reviewed or clean',
      actual: c.books === 'clean' ? 'reviewed or clean' : 'needs work',
      ok: c.books === 'clean',
      hard: false,
    },
    {
      name: 'About 35% of the price in paper',
      sub: '20% vendor take back plus a 15% preferred rollover',
      threshold: 'accepted',
      actual:
        c.paper === 'yes'
          ? 'accepted'
          : c.paper === 'maybe'
            ? 'open to it'
            : 'cash only',
      ok: c.paper !== 'no',
      hard: true,
    },
    {
      name: 'Financing closes without a gap',
      sub: 'Senior debt sized on improved earnings, capped at 60% of price',
      threshold: 'gap of $0',
      actual: stack.gap > 0 ? money(stack.gap) + ' short' : 'closes',
      ok: stack.gap <= 0,
      hard: false,
    },
    {
      name: 'Debt service coverage at close',
      sub: 'What a transition lender will underwrite to',
      threshold: 'at least 1.35x',
      actual: stack.dscr.toFixed(2) + 'x',
      ok: stack.dscr >= 1.35,
      hard: false,
    },
  ]

  // Four dimensions at 0 to 5. Pass mark 14 of 20, no dimension under 3.
  let financial = 0
  if (n.ebitda >= sred.floor) financial += 2
  else if (n.ebitda >= sred.floor * 0.85) financial += 1
  if (c.revenue === 'band') financial += 1
  if (coverage >= COVER_MIN) financial += 1
  if (c.books === 'clean') financial += 1

  let technical = 0
  if (c.constraint === 'named') technical += 2
  else if (c.constraint === 'maybe') technical += 1
  if (archetype) technical += 2
  else if (!walkPast) technical += 1
  if (n.timeShare >= 60) technical += 1

  let transferable = 0
  if (c.sic === 'yes') transferable += 2
  if (c.concentration === 'under30') transferable += 1
  if (c.ownerSales === 'under') transferable += 1
  if (c.realty === 'no') transferable += 1

  let terms = 0
  if (c.paper === 'yes') terms += 2
  else if (c.paper === 'maybe') terms += 1
  if (c.intent !== 'unsure') terms += 1
  if (n.multiple <= 4.0) terms += 1
  if (n.ebitda >= BAND_LO && n.ebitda <= BAND_HI) terms += 1

  const dimensions = [
    { label: 'Financial', value: Math.min(5, financial) },
    { label: 'Technical', value: Math.min(5, technical) },
    { label: 'Transferable', value: Math.min(5, transferable) },
    { label: 'Owner terms', value: Math.min(5, terms) },
  ]
  const total = dimensions.reduce((a, d) => a + d.value, 0)
  const anyLow = dimensions.some((d) => d.value < 3)

  const hardFails = gates.filter((g) => g.hard && !g.ok)
  const softFails = gates.filter((g) => !g.hard && !g.ok)

  let lane: Lane
  let route: string
  let chip: string
  let tone: 'ok' | 'op' | 'no'
  let line: string

  if (walkPast || c.constraint === 'software') {
    lane = 'walkaway'
    route = 'Conventional succession lane'
    chip = 'Routed out'
    tone = 'no'
    line =
      'The improvement here is equipment, pricing or software adoption, which CRA does not treat as experimental development. We would be selling you a research structure for a problem that is not a research problem. Take a broker or a straight raise, and use the assessment only if you want the earnings normalized first.'
  } else if (n.ebitda > BAND_HI) {
    lane = 'exit'
    route = 'Matched Exit'
    chip = 'Above the band'
    tone = 'op'
    line =
      'At ' +
      money(n.ebitda) +
      ' of earnings you are past the residency structure: the price no longer finances on 35% seller paper and you can attract a buyer on your own merits. You get matched straight to the bench, with the assessment and the quality of earnings work done first.'
  } else if (n.ebitda < sred.floor) {
    lane = 'below'
    route = 'Below the floor'
    chip = 'Fails the size test'
    tone = 'no'
    line =
      'The residency costs ' +
      money(sred.budget) +
      ' in year one and credits return ' +
      money(sred.credits) +
      ', so the net is ' +
      money(sred.net) +
      '. To keep that at or under 20% of earnings you need ' +
      money(sred.floor) +
      '. You are ' +
      money(sred.floor - n.ebitda) +
      ' short. Below the floor the business is funding an experiment it cannot carry if the claim is denied.'
  } else if (
    hardFails.length === 0 &&
    total >= 14 &&
    !anyLow &&
    c.intent !== 'stay'
  ) {
    lane = 'r2o'
    route = 'Research to Ownership'
    chip = 'Clears every gate'
    tone = 'ok'
    line =
      'Every hard gate clears and the file scores ' +
      total +
      ' of 20. Next step is the $15,000 assessment: a research project written the way CRA reads it, a pre-claim application filed before anyone signs, and a successor matched from the bench.'
  } else if (hardFails.length === 0 && c.intent === 'stay') {
    lane = 'growth'
    route = 'Evidence First Growth'
    chip = 'Capital lane'
    tone = 'ok'
    line =
      'You are not selling, so the ownership option comes off the table and the same evidence carries the capital instead: credits of about ' +
      money(sred.credits) +
      ' in year one, milestone released project funding, and the pilot bridge for the timing gap between spend and refund.'
  } else if (hardFails.length <= 1 && total >= 12) {
    lane = 'conditional'
    route = 'Conditional'
    chip = hardFails.length + softFails.length + ' gates open'
    tone = 'op'
    line =
      'The economics work. What is open is fixable before a residency starts: ' +
      gates
        .filter((g) => !g.ok)
        .slice(0, 3)
        .map((g) => g.name.toLowerCase())
        .join(', ') +
      '. The assessment sequences those and prices the fix.'
  } else {
    lane = 'conditional'
    route = 'Not yet'
    chip = hardFails.length + ' hard gates fail'
    tone = 'no'
    line =
      'Too many structural gates fail for a residency to be honest here: ' +
      hardFails
        .slice(0, 3)
        .map((g) => g.name.toLowerCase())
        .join(', ') +
      '. Worth a conversation about sequence, not a paid engagement today.'
  }

  return {
    sred,
    stack,
    gates,
    dimensions,
    total,
    route,
    chip,
    tone,
    line,
    lane,
    coverage,
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// THE BENCH
//
// Archetype placeholders. Replace each entry with a real, vouched bench
// member before this page is promoted in any campaign, and keep the
// anonymity convention (initials, band, region). Lender entries say
// "written indication of appetite" and never "commitment".
// ─────────────────────────────────────────────────────────────────────────────

type BenchKind = 'successor' | 'buyer' | 'backer' | 'advisor'

type BenchMember = {
  kind: BenchKind
  name: string
  meta: string
  vouch: string
  tags: string[]
  lanes: Lane[]
  sectors: SectorKey[]
}

const ALL_ARCHETYPES: SectorKey[] = [...ARCHETYPES]

const BENCH: BenchMember[] = [
  {
    kind: 'successor',
    name: 'J.M., P.Eng',
    meta: '16 yrs industrial operations / Calgary / seeks control',
    vouch:
      'Ran multi million dollar capital projects in energy services, never a profit and loss. Wants the shop, not the title.',
    tags: ['Fabrication', 'Weld procedures', 'Distortion control'],
    lanes: ['r2o', 'conditional'],
    sectors: ['fabrication', 'indserv', 'instrument'],
  },
  {
    kind: 'successor',
    name: 'D.R., CET',
    meta: '19 yrs, plant supervisor to operations manager / Red Deer / seeks control',
    vouch:
      'Runs crews, quoting and safety today. The archetype that passes every test in our model and needs the least hand holding.',
    tags: ['Building products', 'Crews', 'Quoting'],
    lanes: ['r2o', 'conditional'],
    sectors: ['building', 'fabrication', 'ag'],
  },
  {
    kind: 'successor',
    name: 'S.K., PhD',
    meta: '11 yrs food and materials science / Edmonton / seeks control',
    vouch:
      'Research is the day job, so the claim economics are the strongest on the bench. Needs a strong second in command beside her.',
    tags: ['Shelf life', 'Yield', 'Formulation'],
    lanes: ['r2o'],
    sectors: ['food', 'ag'],
  },
  {
    kind: 'buyer',
    name: 'Independent searcher, T.A.',
    meta: '$1M to $4M enterprise value / Alberta / control only',
    vouch:
      'Two years searching, funded by four backers, wants an operating business with a technical moat and a retiring owner.',
    tags: ['Control', 'Owner transition', 'Add backs'],
    lanes: ['exit', 'r2o'],
    sectors: ['fabrication', 'indserv', 'building', 'ag'],
  },
  {
    kind: 'buyer',
    name: 'Strategic acquirer, W.P. Group',
    meta: '$8M to $40M / Western Canada / bolt on',
    vouch:
      'Buys panel and precast capacity to fill its own order book. Pays for throughput, not for growth stories.',
    tags: ['Bolt on', 'Capacity', 'Same trade'],
    lanes: ['exit'],
    sectors: ['building', 'fabrication'],
  },
  {
    kind: 'backer',
    name: 'Senior transition lender',
    meta: '$500k to $6M / 7 yr amortization / DSCR 1.35x floor',
    vouch:
      'Written indication of appetite on files with an agreed price, a completed review and improved earnings. No forward commitments, ever.',
    tags: ['Senior debt', 'Cash flow lend', 'Indicative only'],
    lanes: ['r2o', 'exit', 'growth'],
    sectors: ALL_ARCHETYPES,
  },
  {
    kind: 'backer',
    name: 'Subordinated debt, regional fund',
    meta: '$250k to $2M / interest only / bullet by year 5',
    vouch:
      'Fills the slice between senior debt and seller paper. Minimum cheque is the constraint on smaller transfers.',
    tags: ['Mezzanine', 'No control', 'Bullet'],
    lanes: ['r2o', 'exit'],
    sectors: ALL_ARCHETYPES,
  },
  {
    kind: 'backer',
    name: 'SR&ED and pilot bridge financier',
    meta: 'Advances 60% to 75% of the filed claim / 24 mo terms',
    vouch:
      'Structures the proving period loan as a real repayable obligation so it never becomes assistance and never reduces the credit.',
    tags: ['Credit advance', 'Bridge', 'Repayable'],
    lanes: ['r2o', 'growth', 'conditional', 'below'],
    sectors: ALL_ARCHETYPES,
  },
  {
    kind: 'backer',
    name: 'Family office, minority preferred',
    meta: '$300k to $2.5M / 8% coupon / no board seat',
    vouch:
      'Buys milestone released preferred in businesses that are staying owner led. Wants verified benefit, not projections.',
    tags: ['Minority', 'Preferred', 'Milestones'],
    lanes: ['growth', 'exit'],
    sectors: ALL_ARCHETYPES,
  },
  {
    kind: 'advisor',
    name: 'SR&ED practice, CPA firm',
    meta: 'Pre claim approval / T661 / timesheet architecture',
    vouch:
      'Writes the project the way an examiner reads it and will tell you when the work is routine engineering before you spend a dollar.',
    tags: ['Pre claim', 'T661', 'Defensible'],
    lanes: ['r2o', 'growth', 'conditional', 'below', 'exit'],
    sectors: [...ALL_ARCHETYPES, 'other'],
  },
  {
    kind: 'advisor',
    name: 'Quality of earnings, transaction services',
    meta: '$8M and under / 3 to 4 week turnaround',
    vouch:
      'Normalizes owner compensation and one time items so the fixed price survives a lender review.',
    tags: ['Normalization', 'Working capital', 'Review ready'],
    lanes: ['r2o', 'exit', 'conditional'],
    sectors: [
      ...ALL_ARCHETYPES,
      'homeserv',
      'retail',
      'prof',
      'franchise',
      'other',
    ],
  },
  {
    kind: 'advisor',
    name: 'Deal counsel, share sales',
    meta: 'Option agreements / rollovers / lifetime capital gains',
    vouch:
      'Drafts the option so the successor deemed ownership is priced in from day one instead of found in a reassessment.',
    tags: ['Option', 'Rollover', 'LCGE'],
    lanes: ['r2o', 'exit', 'growth'],
    sectors: [...ALL_ARCHETYPES, 'other'],
  },
]

const KIND_LABEL: Record<BenchKind, string> = {
  successor: 'Operator successor',
  buyer: 'Buyer',
  backer: 'Backer',
  advisor: 'Advisor',
}

const STACK_COLORS = [
  '#195E8E',
  '#50C4D2',
  '#0d4f78',
  '#8FB6C6',
  '#B9CFD8',
  '#A6402F',
]

// ─────────────────────────────────────────────────────────────────────────────
// SMALL UI PIECES
// ─────────────────────────────────────────────────────────────────────────────

function Segmented<V extends string>({
  value,
  options,
  onChange,
}: {
  value: V
  options: { v: V; label: string }[]
  onChange: (v: V) => void
}) {
  return (
    <div className="cd-seg" role="group">
      {options.map((o) => (
        <button
          key={String(o.v)}
          type="button"
          aria-pressed={value === o.v}
          onClick={() => onChange(o.v)}
        >
          {o.label}
        </button>
      ))}
    </div>
  )
}

function MoneyField({
  id,
  value,
  step,
  width,
  onChange,
}: {
  id: string
  value: number
  step: number
  width: number
  onChange: (v: number) => void
}) {
  return (
    <div className="cd-money">
      <span className="cd-prefix">$</span>
      <input
        id={id}
        className="cd-input"
        type="number"
        min={0}
        step={step}
        value={value}
        style={{ width }}
        onChange={(e) => onChange(Number(e.target.value))}
      />
    </div>
  )
}

function UnitField({
  id,
  value,
  min,
  max,
  step,
  unit,
  onChange,
}: {
  id: string
  value: number
  min: number
  max: number
  step: number
  unit: string
  onChange: (v: number) => void
}) {
  return (
    <div className="cd-money cd-has-suffix">
      <input
        id={id}
        className="cd-input"
        type="number"
        min={min}
        max={max}
        step={step}
        value={value}
        style={{ width: 72 }}
        onChange={(e) => onChange(Number(e.target.value))}
      />
      <span className="cd-suffix">{unit}</span>
    </div>
  )
}

function Row({
  label,
  hint,
  htmlFor,
  children,
}: {
  label: string
  hint?: string
  htmlFor?: string
  children: React.ReactNode
}) {
  return (
    <div className="cd-row">
      <div>
        {htmlFor ? (
          <label className="cd-label" htmlFor={htmlFor}>
            {label}
          </label>
        ) : (
          <span className="cd-label">{label}</span>
        )}
        {hint ? <span className="cd-hint">{hint}</span> : null}
      </div>
      {children}
    </div>
  )
}

function KeyValue({
  rows,
}: {
  rows: { k: string; v: string; note: string }[]
}) {
  return (
    <dl>
      {rows.map((r) => (
        <div className="cd-kv" key={r.k}>
          <dt>{r.k}</dt>
          <dd>
            {r.v}
            <small>{r.note}</small>
          </dd>
        </div>
      ))}
    </dl>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN
// ─────────────────────────────────────────────────────────────────────────────

export default function CapitalDesk() {
  const [choices, setChoices] = useState<Choices>(DEFAULT_CHOICES)
  const [numbers, setNumbers] = useState<Numbers>(DEFAULT_NUMBERS)
  const [sector, setSector] = useState<SectorKey>('fabrication')
  const [benchFilter, setBenchFilter] = useState<BenchKind | 'all' | 'matched'>(
    'all',
  )
  const [status, setStatus] = useState('Takes about 60 seconds. No commitment.')
  const [form, setForm] = useState({
    fname: '',
    lname: '',
    email: '',
    company: '',
    change: '',
    engagement: 'auto',
    site: '',
  })

  const verdict = useMemo(
    () => assess(numbers, choices, sector),
    [numbers, choices, sector],
  )
  const { sred, stack } = verdict

  const setChoice = <K extends keyof Choices>(key: K, v: Choices[K]) =>
    setChoices((prev) => ({ ...prev, [key]: v }))
  const setNumber = (key: keyof Numbers, v: number) =>
    setNumbers((prev) => ({ ...prev, [key]: Number.isFinite(v) ? v : 0 }))

  const reset = () => {
    setChoices(DEFAULT_CHOICES)
    setNumbers(DEFAULT_NUMBERS)
    setSector('fabrication')
  }

  const segments = useMemo(() => {
    const raw: [string, number][] = [
      ['Senior debt', stack.senior],
      ['Vendor take back', stack.vtb],
      ['Subordinated debt', stack.sub],
      ['Seller preferred rollover', stack.pref],
      ['Successor cash', stack.cash],
      ['Unfilled gap', stack.gap],
    ]
    return raw.filter(([, v]) => v > 0)
  }, [stack])
  const segmentTotal = segments.reduce((t, [, v]) => t + v, 0) || 1

  const benchCards = useMemo(() => {
    const scored = BENCH.map((b) => ({
      member: b,
      matched:
        b.lanes.includes(verdict.lane) &&
        (b.sectors.includes(sector) || b.sectors.includes('other')),
    }))
    scored.sort((a, b) => Number(b.matched) - Number(a.matched))
    return scored.filter((c) => {
      if (benchFilter === 'all') return true
      if (benchFilter === 'matched') return c.matched
      return c.member.kind === benchFilter
    })
  }, [verdict.lane, sector, benchFilter])

  const summary = () => {
    const openGates = verdict.gates.filter((g) => !g.ok).map((g) => g.name)
    return [
      'EXECOM CAPITAL DESK, SCREEN RESULT',
      'Routed to: ' + verdict.route + ' (' + verdict.chip + ')',
      'Score: ' +
        verdict.total +
        '/20 ' +
        verdict.dimensions.map((d) => d.label + ' ' + d.value).join(', '),
      '',
      'Sector: ' +
        SECTOR_LABEL[sector] +
        ' / ' +
        (choices.province === 'AB' ? 'Alberta' : 'outside Alberta') +
        ' / claims SR&ED: ' +
        choices.claims,
      'EBITDA: ' +
        money(numbers.ebitda) +
        ' against a computed floor of ' +
        money(sred.floor),
      'Free cash: ' +
        money(numbers.freeCash) +
        ' (' +
        verdict.coverage.toFixed(2) +
        'x the denial case payment)',
      'Year one credits: ' +
        money(sred.credits) +
        ' on a budget of ' +
        money(sred.budget) +
        ', net ' +
        money(sred.net) +
        ' = ' +
        pct(sred.net / Math.max(1, numbers.ebitda)) +
        ' of EBITDA',
      'Price at ' +
        numbers.multiple.toFixed(2) +
        'x: ' +
        money(stack.price) +
        ', DSCR ' +
        stack.dscr.toFixed(2) +
        'x, gap ' +
        money(stack.gap),
      '',
      'Gates open: ' + (openGates.join('; ') || 'none'),
    ].join('\n')
  }

  const copyResult = async () => {
    try {
      await navigator.clipboard.writeText(summary())
      setStatus('Screen result copied. Paste it into your note or email.')
    } catch {
      setStatus('Could not reach the clipboard. Copy the fields manually.')
    }
  }

  const sendToDesk = () => {
    if (!form.email.trim()) {
      setStatus('A work email is the one field we need.')
      return
    }
    const name = (form.fname + ' ' + form.lname).trim()
    const model = form.engagement === 'auto' ? verdict.route : form.engagement
    const body = [
      'Name: ' + (name || '(not given)'),
      'Email: ' + form.email,
      'Company: ' + (form.company || '(not given)'),
      'Website: ' + (form.site || '(not given)'),
      'Model: ' + model,
      '',
      'What needs to change:',
      form.change || '(not given)',
      '',
      summary(),
    ].join('\n')
    const subject =
      'Capital Desk intake: ' + (form.company || name || form.email)
    window.location.href =
      'mailto:' +
      DESK_EMAIL +
      '?subject=' +
      encodeURIComponent(subject) +
      '&body=' +
      encodeURIComponent(body)
    setStatus('Opening your mail client with the screen result attached.')
  }

  const netShare = numbers.ebitda > 0 ? sred.net / numbers.ebitda : 0

  return (
    <>
      {/* ── THE SCREEN ─────────────────────────────────────────────── */}
      <section
        id="screen"
        className="border-t border-neutral-200 bg-[#FAFAF8] py-20 md:py-28"
      >
        <div className="max-w-[1200px] mx-auto px-6 md:px-8">
          <p className="section-label">The screen</p>
          <h2 className="text-2xl md:text-3xl font-serif font-semibold tracking-tight text-fg mb-3 max-w-[30ch]">
            Ninety seconds, and it tells you the number you would have to clear.
          </h2>
          <p className="text-body text-fg/70 max-w-content">
            Every threshold here is computed from your own inputs, not a rule of
            thumb. The EBITDA floor moves with your residency shape, your
            province and whether you already claim SR&amp;ED. Nothing here is a
            credit ruling or a financing commitment: the paid assessment
            produces CRA&apos;s determination.
          </p>
          <p className="text-sm text-muted mt-3">
            Prefilled with an example: a 34 person fabrication shop near Red
            Deer. Change any field.
          </p>

          <div className="grid lg:grid-cols-[1fr_400px] gap-6 mt-10 items-start">
            {/* inputs */}
            <form
              className="light-card cd-static p-6 md:p-8"
              autoComplete="off"
              onSubmit={(e) => e.preventDefault()}
            >
              <div className="flex items-center justify-between gap-4 flex-wrap mb-6">
                <p className="light-card-index">Qualifying inputs</p>
                <button
                  type="button"
                  className="cd-chip cd-flat"
                  style={{ cursor: 'pointer' }}
                  onClick={reset}
                >
                  Reset example
                </button>
              </div>

              <p className="cd-group-title">The business</p>
              <div className="mb-7">
                <Row
                  label="Normalized EBITDA, last full year"
                  hint="After a market wage for the owner role"
                  htmlFor="cd-ebitda"
                >
                  <MoneyField
                    id="cd-ebitda"
                    value={numbers.ebitda}
                    step={10000}
                    width={130}
                    onChange={(v) => setNumber('ebitda', v)}
                  />
                </Row>
                <Row
                  label="Annual free cash"
                  hint="After owner pay, debt, tax and maintenance capex"
                  htmlFor="cd-freecash"
                >
                  <MoneyField
                    id="cd-freecash"
                    value={numbers.freeCash}
                    step={5000}
                    width={130}
                    onChange={(v) => setNumber('freeCash', v)}
                  />
                </Row>
                <Row label="Revenue" hint="Sets the operating complexity screen">
                  <Segmented
                    value={choices.revenue}
                    options={[
                      { v: 'under3', label: 'Under $3M' },
                      { v: 'band', label: '$3M to $15M' },
                      { v: 'over15', label: 'Over $15M' },
                    ]}
                    onChange={(v) => setChoice('revenue', v)}
                  />
                </Row>
                <Row label="Employees">
                  <Segmented
                    value={choices.employees}
                    options={[
                      { v: 'under10', label: 'Under 10' },
                      { v: 'band', label: '10 to 80' },
                      { v: 'over80', label: 'Over 80' },
                    ]}
                    onChange={(v) => setChoice('employees', v)}
                  />
                </Row>
                <Row label="Province">
                  <Segmented
                    value={choices.province}
                    options={[
                      { v: 'AB', label: 'Alberta' },
                      { v: 'other', label: 'Elsewhere in Canada' },
                    ]}
                    onChange={(v) => setChoice('province', v)}
                  />
                </Row>
                <Row
                  label="Already claims SR&ED"
                  hint="Moves the Alberta IEG from 20% to 8%"
                >
                  <Segmented
                    value={choices.claims}
                    options={[
                      { v: 'no', label: 'No, first time' },
                      { v: 'yes', label: 'Yes, we claim' },
                    ]}
                    onChange={(v) => setChoice('claims', v)}
                  />
                </Row>
              </div>

              <p className="cd-group-title">The situation</p>
              <div>
                <Row label="Your intent">
                  <Segmented
                    value={choices.intent}
                    options={[
                      { v: 'exit', label: 'Exiting in 3 years' },
                      { v: 'stay', label: 'Staying, need capital' },
                      { v: 'unsure', label: 'Undecided' },
                    ]}
                    onChange={(v) => setChoice('intent', v)}
                  />
                </Row>
                <Row label="Sector" htmlFor="cd-sector">
                  <select
                    id="cd-sector"
                    className="cd-select"
                    style={{ maxWidth: 280 }}
                    value={sector}
                    onChange={(e) => setSector(e.target.value as SectorKey)}
                  >
                    {SECTOR_OPTIONS.map((o) => (
                      <option key={o.value} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                </Row>
                <Row
                  label="The constraint you would put a successor on"
                  hint="This is the SR&ED gate, and it is the narrowest one"
                >
                  <Segmented
                    value={choices.constraint}
                    options={[
                      { v: 'named', label: 'We name it already' },
                      { v: 'maybe', label: 'Roughly' },
                      { v: 'software', label: 'Software, pricing or scheduling' },
                    ]}
                    onChange={(v) => setChoice('constraint', v)}
                  />
                </Row>
                <Row label="Largest customer">
                  <Segmented
                    value={choices.concentration}
                    options={[
                      { v: 'under30', label: 'Under 30% of revenue' },
                      { v: 'over30', label: '30% or more' },
                    ]}
                    onChange={(v) => setChoice('concentration', v)}
                  />
                </Row>
                <Row label="Sales the owner personally carries">
                  <Segmented
                    value={choices.ownerSales}
                    options={[
                      { v: 'under', label: 'Under half' },
                      { v: 'over', label: 'More than half' },
                    ]}
                    onChange={(v) => setChoice('ownerSales', v)}
                  />
                </Row>
                <Row label="Second in command in place">
                  <Segmented
                    value={choices.sic}
                    options={[
                      { v: 'yes', label: 'Yes' },
                      { v: 'no', label: 'No' },
                    ]}
                    onChange={(v) => setChoice('sic', v)}
                  />
                </Row>
                <Row label="Real property in the deal">
                  <Segmented
                    value={choices.realty}
                    options={[
                      { v: 'no', label: 'Leased or carved out' },
                      { v: 'yes', label: 'Land and building' },
                    ]}
                    onChange={(v) => setChoice('realty', v)}
                  />
                </Row>
                <Row
                  label="Books"
                  hint="Would they survive a light quality of earnings review"
                >
                  <Segmented
                    value={choices.books}
                    options={[
                      { v: 'clean', label: 'Reviewed or clean' },
                      { v: 'messy', label: 'Needs work' },
                    ]}
                    onChange={(v) => setChoice('books', v)}
                  />
                </Row>
                <Row
                  label="Willing to take about 35% of the price in paper"
                  hint="20% vendor take back plus a 15% preferred rollover"
                >
                  <Segmented
                    value={choices.paper}
                    options={[
                      { v: 'yes', label: 'Yes' },
                      { v: 'maybe', label: 'Open to it' },
                      { v: 'no', label: 'Cash only' },
                    ]}
                    onChange={(v) => setChoice('paper', v)}
                  />
                </Row>
              </div>

              <details className="cd-details">
                <summary className="cd-group-title">
                  Residency and deal assumptions (base case defaults)
                </summary>
                <div className="mt-5">
                  <Row label="Successor salary" htmlFor="cd-salary">
                    <MoneyField
                      id="cd-salary"
                      value={numbers.salary}
                      step={5000}
                      width={110}
                      onChange={(v) => setNumber('salary', v)}
                    />
                  </Row>
                  <Row
                    label="Share of paid time directly on the experiment"
                    hint="Timesheets set this, not intentions"
                    htmlFor="cd-timeshare"
                  >
                    <UnitField
                      id="cd-timeshare"
                      value={numbers.timeShare}
                      min={10}
                      max={100}
                      step={5}
                      unit="%"
                      onChange={(v) => setNumber('timeShare', v)}
                    />
                  </Row>
                  <Row
                    label="Materials consumed or transformed in testing, per year"
                    htmlFor="cd-materials"
                  >
                    <MoneyField
                      id="cd-materials"
                      value={numbers.materials}
                      step={5000}
                      width={110}
                      onChange={(v) => setNumber('materials', v)}
                    />
                  </Row>
                  <Row
                    label="Purchase multiple on baseline EBITDA, fixed at signing"
                    htmlFor="cd-multiple"
                  >
                    <UnitField
                      id="cd-multiple"
                      value={numbers.multiple}
                      min={2}
                      max={6}
                      step={0.25}
                      unit="x"
                      onChange={(v) => setNumber('multiple', v)}
                    />
                  </Row>
                  <Row
                    label="Verified EBITDA uplift required at close"
                    htmlFor="cd-uplift"
                  >
                    <UnitField
                      id="cd-uplift"
                      value={numbers.uplift}
                      min={0}
                      max={60}
                      step={5}
                      unit="%"
                      onChange={(v) => setNumber('uplift', v)}
                    />
                  </Row>
                  <Row label="Months from start to close" htmlFor="cd-months">
                    <UnitField
                      id="cd-months"
                      value={numbers.months}
                      min={12}
                      max={30}
                      step={1}
                      unit="mo"
                      onChange={(v) => setNumber('months', v)}
                    />
                  </Row>
                  <Row
                    label="Cash the business puts into the residency before close"
                    htmlFor="cd-contrib"
                  >
                    <MoneyField
                      id="cd-contrib"
                      value={numbers.contrib}
                      step={10000}
                      width={130}
                      onChange={(v) => setNumber('contrib', v)}
                    />
                  </Row>
                  <p className="text-xs text-muted leading-relaxed mt-4">
                    Held fixed: employer burden 12%, prescribed proxy 55% on a
                    base capped at 75% of salary (the option makes the successor
                    a specified employee from day one), 35% federal refundable
                    credit, Alberta IEG at 20% for a first time performer and 8%
                    for an existing claimant, 80% of arm&apos;s length contract
                    work eligible, $15,000 assessment, $3,000 monthly program fee
                    with 60% performed as research on your behalf, pilot bridge at
                    12% plus 2%, credits realized about 17 months after the work
                    starts, and a failed residency terminating at roughly 37% of
                    the way to close.
                  </p>
                </div>
              </details>
            </form>

            {/* readout */}
            <div className="lg:sticky lg:top-[104px] flex flex-col gap-4">
              <div className="stage-card p-5 md:p-6">
                <div className="flex items-center justify-between gap-3 mb-2">
                  <p className="card-index">Routed to</p>
                  <span className={'cd-chip cd-dark-' + verdict.tone}>
                    {verdict.chip}
                  </span>
                </div>
                <p className="text-[1.35rem] md:text-[1.5rem] font-serif text-white leading-tight mb-3">
                  {verdict.route}
                </p>
                <p className="text-sm card-body">{verdict.line}</p>
                <div className="cd-scores">
                  {verdict.dimensions.map((d) => (
                    <div className="cd-score" key={d.label}>
                      <span className="text-[10.5px] uppercase tracking-widest text-white/45">
                        {d.label}
                      </span>
                      <span className="cd-bars">
                        {[1, 2, 3, 4, 5].map((b) => (
                          <i
                            key={b}
                            className={
                              b <= d.value
                                ? d.value < 3
                                  ? 'on low'
                                  : 'on'
                                : undefined
                            }
                          />
                        ))}
                      </span>
                      <span className="text-[11.5px] text-white/60 text-right cd-tabular">
                        {d.value}/5
                      </span>
                    </div>
                  ))}
                  <div className="cd-score cd-score-total">
                    <span className="text-[10.5px] uppercase tracking-widest text-teal">
                      Total
                    </span>
                    <span className="text-[11.5px] text-white/45">
                      pass mark 14, no line under 3
                    </span>
                    <span className="text-[13px] font-semibold text-white text-right cd-tabular">
                      {verdict.total}/20
                    </span>
                  </div>
                </div>
              </div>

              <div className="light-card cd-static p-5 md:p-6">
                <p className="light-card-index mb-3">Your numbers</p>
                <KeyValue
                  rows={[
                    {
                      k: 'EBITDA you would need',
                      v: money(sred.floor),
                      note:
                        choices.province === 'AB'
                          ? choices.claims === 'yes'
                            ? 'Alberta, existing claimant'
                            : 'Alberta, first time performer'
                          : 'Outside Alberta, federal credit only',
                    },
                    {
                      k: 'Year one residency budget',
                      v: money(sred.budget),
                      note: 'Salary, burden, materials, fees, assessment',
                    },
                    {
                      k: 'Gross credits, year one',
                      v: money(sred.credits),
                      note:
                        'IEG ' + money(sred.ieg) + ' plus federal ' + money(sred.fed),
                    },
                    {
                      k: 'Your net cost, year one',
                      v: money(sred.net),
                      note: pct(netShare) + ' of baseline EBITDA, ceiling 20%',
                    },
                    {
                      k: 'Credits earned through close',
                      v: money(sred.creditsToClose),
                      note: 'IEG steps down after year one',
                    },
                    {
                      k: 'Price, fixed at signing',
                      v: money(stack.price),
                      note: numbers.multiple.toFixed(2) + 'x baseline EBITDA',
                    },
                    {
                      k: 'Earnings at close',
                      v: money(stack.ebitdaClose),
                      note:
                        'after the ' +
                        pct(numbers.uplift / 100, 0) +
                        ' verified uplift',
                    },
                  ]}
                />
              </div>

              <div className="light-card cd-static p-5 md:p-6">
                <div className="flex items-center justify-between gap-3 mb-4">
                  <p className="light-card-index">Indicative stack at close</p>
                  <span
                    className={
                      'cd-chip ' + (stack.dscr >= 1.35 ? 'cd-ok' : 'cd-no')
                    }
                  >
                    DSCR {stack.dscr.toFixed(2)}x
                  </span>
                </div>
                <div className="cd-stackbar">
                  {segments.map(([label, value], idx) => (
                    <i
                      key={label}
                      title={label + ' ' + money(value)}
                      style={{
                        flex: value / segmentTotal,
                        background: STACK_COLORS[idx],
                      }}
                    />
                  ))}
                </div>
                <div className="mt-4 grid gap-2">
                  {segments.map(([label, value], idx) => (
                    <div className="cd-legend" key={label}>
                      <span style={{ background: STACK_COLORS[idx] }} />
                      <span className="cd-legend-label">{label}</span>
                      <span className="cd-legend-value">{money(value)}</span>
                    </div>
                  ))}
                  <div className="cd-legend cd-legend-total">
                    <span />
                    <span className="cd-legend-label">
                      Total uses, with fees and working capital
                    </span>
                    <span className="cd-legend-value">{money(stack.uses)}</span>
                  </div>
                </div>
              </div>

              <div className="light-card cd-static p-5 md:p-6">
                <p className="light-card-index mb-3">If the claim is denied</p>
                <KeyValue
                  rows={[
                    {
                      k: 'Residency ends at the gate',
                      v: 'month ' + sred.terminationMonth,
                      note: 'The cheapest place to stop',
                    },
                    {
                      k: 'Bridge outstanding, no credits',
                      v: money(sred.residual),
                      note: 'Principal, 2% fee, 12% interest to the credit month',
                    },
                    {
                      k: 'Amortized over 24 months',
                      v: money(sred.denialMonthly) + ' / mo',
                      note: money(sred.denialAnnual) + ' a year',
                    },
                    {
                      k: 'Your free cash covers it',
                      v: verdict.coverage.toFixed(2) + 'x',
                      note: 'Test requires 2.00x',
                    },
                  ]}
                />
              </div>

              <p className="text-xs text-muted leading-relaxed">
                Indicative only. Credits are estimates on stated inputs, not a
                CRA determination, and no lender commits before a signed deal.
              </p>
            </div>
          </div>

          {/* gates */}
          <div className="mt-16">
            <h3 className="text-[1.35rem] md:text-[1.5rem] font-serif font-medium tracking-tight text-fg mb-2">
              The hard gates
            </h3>
            <p className="text-body text-fg/70 max-w-content mb-6">
              A gate that fails is not a judgment about the business. It says
              this structure would cost you more than it returns, which is worth
              knowing in ninety seconds instead of after a paid engagement.
            </p>
            <div className="cd-scroll border border-border bg-white">
              <table className="cd-table">
                <thead>
                  <tr>
                    <th>Gate</th>
                    <th>Threshold</th>
                    <th>This business</th>
                    <th style={{ textAlign: 'right' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {verdict.gates.map((g) => (
                    <tr key={g.name}>
                      <td className="cd-g">
                        {g.name}
                        <small>{g.sub}</small>
                      </td>
                      <td className="cd-v">{g.threshold}</td>
                      <td className="cd-v">{g.actual}</td>
                      <td className="cd-s">
                        <span
                          className={
                            'cd-chip ' +
                            (g.ok ? 'cd-ok' : g.hard ? 'cd-no' : 'cd-op')
                          }
                        >
                          {g.ok ? 'Pass' : g.hard ? 'Fail' : 'Open'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* ── THE BENCH ──────────────────────────────────────────────── */}
      <section id="bench" className="light-section py-20 md:py-28">
        <div className="max-w-[1200px] mx-auto px-6 md:px-8">
          <p className="section-label">The bench</p>
          <h2 className="text-2xl md:text-3xl font-serif font-semibold tracking-tight text-fg mb-3 max-w-[26ch]">
            We do not list backers. We vouch for them.
          </h2>
          <p className="text-body text-fg/70 max-w-content">
            Nobody on this bench is here because they filled in a form. Each one
            has been through a live file with us, tells us their real box (cheque
            size, structure, sectors, what makes them walk), and gets shown a
            business only after the assessment is done. Your file stays anonymous
            until you say otherwise.
          </p>
          <div className="flex gap-2 flex-wrap mt-7">
            {(
              [
                ['all', 'All'],
                ['successor', 'Operator successors'],
                ['buyer', 'Buyers'],
                ['backer', 'Backers'],
                ['advisor', 'Advisors'],
                ['matched', 'Matched to your screen'],
              ] as [BenchKind | 'all' | 'matched', string][]
            ).map(([key, label]) => (
              <button
                key={key}
                type="button"
                aria-pressed={benchFilter === key}
                className={
                  'cd-chip ' + (benchFilter === key ? 'cd-ok' : 'cd-flat')
                }
                style={{ cursor: 'pointer' }}
                onClick={() => setBenchFilter(key)}
              >
                {label}
              </button>
            ))}
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5 mt-6">
            {benchCards.length === 0 ? (
              <article className="light-card cd-static p-6">
                <p className="text-sm leading-relaxed">
                  Nothing on the bench matches this screen yet. The assessment is
                  how a file gets shown to people who are not on this page.
                </p>
              </article>
            ) : (
              benchCards.map(({ member, matched }) => (
                <article
                  key={member.name}
                  className="light-card cd-static p-6 flex flex-col gap-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <p className="light-card-index">{KIND_LABEL[member.kind]}</p>
                    {matched ? (
                      <span className="cd-chip cd-ok">Matched</span>
                    ) : null}
                  </div>
                  <h3 className="text-[1rem] font-serif font-medium">
                    {member.name}
                  </h3>
                  <p className="cd-meta">{member.meta}</p>
                  <p className="text-sm leading-relaxed">{member.vouch}</p>
                  <div className="flex gap-2 flex-wrap mt-auto pt-1">
                    {member.tags.map((t) => (
                      <span className="cd-tag" key={t}>
                        {t}
                      </span>
                    ))}
                  </div>
                </article>
              ))
            )}
          </div>

          <div className="case-card mt-6 flex gap-4 items-start">
            <span className="cd-chip cd-op">Placeholder</span>
            <p className="text-sm text-fg/70 leading-relaxed">
              <strong className="text-fg font-semibold">
                These are archetype profiles, not signed bench members.
              </strong>{' '}
              Each card is replaced with a real, vouched person or institution as
              the bench fills, and the anonymity convention stays. Lender entries
              say written indication of appetite, never commitment.
            </p>
          </div>
        </div>
      </section>

      {/* ── INTAKE ─────────────────────────────────────────────────── */}
      <section id="intake" className="dark-atmosphere py-20 md:py-28">
        <div className="max-w-[1200px] mx-auto px-6 md:px-8 grid lg:grid-cols-[1fr_minmax(360px,540px)] gap-10 lg:gap-14 items-start">
          <div>
            <p className="section-label-light">Start the conversation</p>
            <h2 className="text-[1.5rem] md:text-[1.75rem] font-serif text-white leading-snug mb-4 max-w-[24ch]">
              Tell us what needs to change.
            </h2>
            <p className="text-white/60 leading-relaxed">
              Your screen result is attached automatically, so the first call
              starts at the real question instead of the introductions. About 60
              seconds, no obligation, and no file leaves this desk with your name
              on it.
            </p>
            <div className="mt-6 flex flex-col sm:flex-row gap-4">
              <Link href="/engage" className="btn-ghost-premium">
                Or use the engage form
              </Link>
            </div>
          </div>

          <form
            className="light-card cd-static p-6 md:p-8"
            onSubmit={(e) => e.preventDefault()}
          >
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="cd-label mb-1" htmlFor="cd-fname">
                  First name
                </label>
                <input
                  id="cd-fname"
                  className="cd-select"
                  type="text"
                  value={form.fname}
                  onChange={(e) => setForm({ ...form, fname: e.target.value })}
                />
              </div>
              <div>
                <label className="cd-label mb-1" htmlFor="cd-lname">
                  Last name
                </label>
                <input
                  id="cd-lname"
                  className="cd-select"
                  type="text"
                  value={form.lname}
                  onChange={(e) => setForm({ ...form, lname: e.target.value })}
                />
              </div>
              <div>
                <label className="cd-label mb-1" htmlFor="cd-email">
                  Work email
                </label>
                <input
                  id="cd-email"
                  className="cd-select"
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                />
              </div>
              <div>
                <label className="cd-label mb-1" htmlFor="cd-company">
                  Company
                </label>
                <input
                  id="cd-company"
                  className="cd-select"
                  type="text"
                  value={form.company}
                  onChange={(e) => setForm({ ...form, company: e.target.value })}
                />
              </div>
              <div className="md:col-span-2">
                <label className="cd-label mb-1" htmlFor="cd-change">
                  What needs to change
                </label>
                <textarea
                  id="cd-change"
                  className="cd-select cd-textarea"
                  rows={4}
                  placeholder="The constraint, the timeline, or the number you are trying to hit."
                  value={form.change}
                  onChange={(e) => setForm({ ...form, change: e.target.value })}
                />
              </div>
              <div>
                <label className="cd-label mb-1" htmlFor="cd-engagement">
                  Which model fits
                </label>
                <select
                  id="cd-engagement"
                  className="cd-select"
                  value={form.engagement}
                  onChange={(e) =>
                    setForm({ ...form, engagement: e.target.value })
                  }
                >
                  <option value="auto">Use my screen result</option>
                  <option value="Research to Ownership">
                    Research to Ownership
                  </option>
                  <option value="Evidence First Growth">
                    Evidence First Growth
                  </option>
                  <option value="Pilot Bridge">Pilot Bridge</option>
                  <option value="Matched Exit">Matched Exit</option>
                  <option value="Not sure yet">Not sure yet</option>
                </select>
              </div>
              <div>
                <label className="cd-label mb-1" htmlFor="cd-site">
                  Website (optional)
                </label>
                <input
                  id="cd-site"
                  className="cd-select"
                  type="text"
                  placeholder="example.ca"
                  value={form.site}
                  onChange={(e) => setForm({ ...form, site: e.target.value })}
                />
              </div>
              <div className="md:col-span-2 flex flex-wrap items-center gap-3 mt-2">
                <button type="button" className="cd-btn-dark" onClick={sendToDesk}>
                  Send to the desk
                </button>
                <button type="button" className="cd-btn-quiet" onClick={copyResult}>
                  Copy screen result
                </button>
                <span className="text-xs text-muted">{status}</span>
              </div>
            </div>
          </form>
        </div>
      </section>
    </>
  )
}
