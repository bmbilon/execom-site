// execom Software Independence (/software-independence).
//
// Copy and prices trace to Brett's offer brief ("Curative's AI-Built CRM and
// the Execom Software Independence Offer", Oct 2026). Every case figure is
// attributed to a public source listed in SOURCES; keep the source number on
// any figure that moves.

/* ------------------------------------------------------------------ */
/* ROI model                                                           */
/* ------------------------------------------------------------------ */

export type RoiInputs = {
  /** Annual licences and add-ons for the platform under review */
  platform: number
  /** Annual administrator, integrator and consultant spend tied to it */
  admin: number
  /** Share of that spend the replacement removes, 0–1 */
  retired: number
  /** One-time build and migration */
  build: number
  /** Annual cost to own the replacement: hosting, AI usage, support, maintenance */
  own: number
  /** Stress test: add 30% to build and ownership costs */
  stress: boolean
}

/** Illustrative case from the offer brief: $600k platform, $250k build, $180k a year to own. */
export const ROI_DEFAULTS: RoiInputs = {
  platform: 600_000,
  admin: 0,
  retired: 1,
  build: 250_000,
  own: 180_000,
  stress: false,
}

export const STRESS_FACTOR = 1.3
/** Replacement bar from the brief: conservative ratio above 2.0 and payback under 18 months. */
export const RATIO_BAR = 2
export const RATIO_STRONG = 3
export const PAYBACK_BAR_MONTHS = 18

export type RoiVerdict = "replace" | "marginal" | "keep"

export type RoiResult = {
  avoidedAnnual: number
  build: number
  own: number
  ongoingNet: number
  yearOneNet: number
  threeYearBenefit: number
  threeYearCost: number
  threeYearNet: number
  ratio: number
  paybackMonths: number
  rentThreeYears: number
  ownThreeYears: number
  verdict: RoiVerdict
}

export function computeRoi(i: RoiInputs): RoiResult {
  const factor = i.stress ? STRESS_FACTOR : 1
  const build = i.build * factor
  const own = i.own * factor
  const incumbent = i.platform + i.admin
  const avoidedAnnual = incumbent * i.retired
  const ongoingNet = avoidedAnnual - own
  const yearOneNet = avoidedAnnual - build - own
  const threeYearBenefit = avoidedAnnual * 3
  const threeYearCost = build + own * 3
  const threeYearNet = threeYearBenefit - threeYearCost
  const ratio = threeYearCost > 0 ? threeYearBenefit / threeYearCost : Infinity
  const paybackMonths = ongoingNet > 0 ? build / (ongoingNet / 12) : Infinity
  const rentThreeYears = incumbent * 3
  const ownThreeYears = build + own * 3 + incumbent * (1 - i.retired) * 3

  let verdict: RoiVerdict = "marginal"
  if (ongoingNet <= 0 || ratio < 1) verdict = "keep"
  else if (ratio >= RATIO_BAR && paybackMonths <= PAYBACK_BAR_MONTHS) verdict = "replace"

  return {
    avoidedAnnual,
    build,
    own,
    ongoingNet,
    yearOneNet,
    threeYearBenefit,
    threeYearCost,
    threeYearNet,
    ratio,
    paybackMonths,
    rentThreeYears,
    ownThreeYears,
    verdict,
  }
}

/* ------------------------------------------------------------------ */
/* Cases                                                               */
/* ------------------------------------------------------------------ */

export type CaseStat = { value: string; label: string }

export type PublicCase = {
  name: string
  context: string
  /** Label for the `replaced` line; defaults to "Replaced" */
  replacedLabel?: string
  replaced: string
  built: string
  stats: CaseStat[]
  note?: string
  quote?: { text: string; by: string }
  sources: number[]
}

export const CURATIVE: PublicCase = {
  name: "Curative",
  context: "Health insurer · 2026",
  replaced: "Salesforce CRM",
  built: "An internal CRM built in about two months with AI-assisted coding. Curative runs its AI agents inside it.",
  stats: [
    { value: "$600,000", label: "a year: the Salesforce contract it cancelled" },
    { value: "~80%", label: "cut in SaaS spend the CEO is targeting" },
    { value: "~$70", label: "per provider contract with its contracting agent, down from $1,500–$2,000" },
  ],
  note: "Curative did not disclose net savings or the cost to run the new system, and CEO Fred Turner called maintenance one of the hardest parts. That ownership work is what execom scopes and prices from day one.",
  sources: [1, 2],
}

export const CASES: PublicCase[] = [
  {
    name: "Seattle Seawolves",
    context: "Pro rugby · 70 staff",
    replaced: "Salesforce CRM and AXS ticketing",
    built: "Replacement software built with Claude Code by four engineers in four months.",
    stats: [{ value: "~$100,000", label: "less software spend" }],
    sources: [3],
  },
  {
    name: "Greenleaf Management",
    context: "Real estate · ~55 staff",
    replaced: "Salesforce, plus its Entrata and Yardi contracts",
    built: "A custom operating app built on Replit and Claude Code by a partner with no prior software background.",
    stats: [
      { value: "~$100,000", label: "a year saved" },
      { value: "~$300", label: "a month to maintain" },
    ],
    sources: [3, 4],
  },
  {
    name: "Atonom",
    context: "Utah startup · 45 staff",
    replaced: "A $40,000-a-year Salesforce contract",
    built: "A CRM built with Lovable.",
    stats: [{ value: "~$1,200", label: "a year expected running cost" }],
    quote: { text: "No one was using Salesforce to its fullest potential.", by: "Gabe Larsen, CRO" },
    sources: [3],
  },
  {
    name: "Klarna",
    context: "Fintech · 2024",
    replaced: "Salesforce and Workday",
    built: "Consolidated data from its SaaS systems onto an internally built stack, with a Neo4j graph database as one component.",
    stats: [{ value: "2", label: "enterprise platforms retired" }],
    quote: { text: "We did not replace SaaS with an LLM.", by: "Sebastian Siemiatkowski, CEO" },
    sources: [5, 6],
  },
  {
    name: "Sanofi",
    context: "Pharma · ~75,000 staff",
    replacedLabel: "Instead of",
    replaced: "Vendor AI agents from Salesforce, ServiceNow and SAP",
    built: "Agentic workflows on its own data platform, with Snowflake and Elementum.",
    stats: [
      { value: "~€10M", label: "a year projected IT savings" },
      { value: "Up to 80%", label: "of employee IT requests resolved by agents (goal)" },
    ],
    quote: {
      text: "I don't want to have Salesforce agents, speaking to ServiceNow agents, going to speak to SAP agents.",
      by: "Emmanuel Frenehard, Chief Digital Officer",
    },
    sources: [7],
  },
]

export const MARKET_SIGNAL = {
  stats: [
    { value: "35%", label: "of teams have already replaced at least one SaaS tool with a custom build" },
    { value: "78%", label: "expect to build more custom internal tools in 2026" },
  ],
  note: "Retool 2026 Build vs. Buy Report, 817 respondents surveyed in late 2025.",
  source: 8,
}

/** What the replacements have in common (offer brief, "The real business lesson"). */
export const CONDITIONS = [
  {
    title: "High avoidable spend",
    text: "A six-figure contract leaves room to fund a serious replacement and still come out ahead.",
  },
  {
    title: "Low real adoption",
    text: "People had stopped using the platform, or ran the actual process in spreadsheets, email and chat.",
  },
  {
    title: "A workflow worth owning",
    text: "The process was specific enough that a purpose-built system, with agents inside it, beat a generic configuration.",
  },
]

/* ------------------------------------------------------------------ */
/* Method                                                              */
/* ------------------------------------------------------------------ */

export const OUTCOMES = [
  { title: "Keep and optimize", text: "Cut unused seats and add-ons, fix the configuration, stay put." },
  { title: "Renegotiate", text: "Go into the renewal with usage evidence and a credible alternative on the table." },
  { title: "Consolidate", text: "Fold overlapping tools into the platform you already pay for." },
  { title: "Replace", text: "Build the workflow you should own, migrate, run in parallel, then cancel." },
]

export const PHASES = [
  {
    title: "Find the target",
    text: "Contracts, renewals, seats, utilization, admins, add-ons, integrations and shadow workflows, ranked by avoidable spend and replacement risk.",
  },
  {
    title: "Extract the workflow",
    text: "Map what people actually do, not the menus. Records, workflow, intelligence and actions are separated, so you rebuild the 10–20% that carries the value.",
  },
  {
    title: "Prove one slice",
    text: "One high-volume workflow runs on real or governed data and is measured on cycle time, unit cost, error rate and manual touches.",
  },
  {
    title: "Engineer the controls",
    text: "SSO, least privilege, audit trails, encryption, testing, model limits and human approval on consequential actions, before production.",
  },
  {
    title: "Run in parallel",
    text: "Old and new run side by side. Outputs are reconciled and rollback is tested. The contract is cancelled only after acceptance.",
  },
  {
    title: "Own the lifecycle",
    text: "A named owner, an operating budget, a roadmap, service levels and a vulnerability process for every system that goes live.",
  },
]

export const CONTROLS = [
  "SSO, MFA, role-based access, least privilege and separate environments",
  "Encryption in transit and at rest, with managed secrets",
  "A complete audit trail for record changes, model actions, approvals and exports",
  "Data classification, retention, deletion and regional residency rules",
  "Automated tests, code review, dependency and vulnerability scanning, penetration testing where warranted",
  "Human approval for irreversible, financial, legal, clinical or externally binding actions",
  "Hard limits on model usage, tokens, retries and tool access",
  "Backups, restore testing, recovery objectives, incident response and rollback",
  "Vendor and model portability, so the replacement does not become the next lock-in",
]

/* ------------------------------------------------------------------ */
/* Pricing                                                             */
/* ------------------------------------------------------------------ */

export type Tier = {
  id: string
  n: string
  name: string
  forWho: string
  promise: string
  duration: string
  fee: string
  feeNote: string
  recurring?: string
  includes: string[]
  youSupply: string
  commitment: string
  successFee: string
  pick?: boolean
}

export const TIERS: Tier[] = [
  {
    id: "blueprint",
    n: "01",
    name: "Blueprint",
    forWho: "For teams with the product and IT capacity to build and run it themselves.",
    promise: "Exactly what to replace, how, and whether it pays.",
    duration: "4–6 weeks",
    fee: "$25,000–$40,000",
    feeNote: "fixed",
    includes: [
      "SaaS spend and renewal map",
      "Licence utilization and adoption analysis",
      "Workflow and data-flow maps",
      "Three-year build-versus-buy TCO",
      "Risk register and target architecture",
      "A working thin-slice prototype",
      "Board-ready keep, renegotiate, consolidate or replace memo",
    ],
    youSupply: "You build and operate.",
    commitment: "Decision-quality evidence and a working thin slice.",
    successFee: "5% of verified first-year savings",
    pick: true,
  },
  {
    id: "co-build",
    n: "02",
    name: "Co-Build",
    forWho: "For internal teams that need architecture and delivery leadership.",
    promise: "The first production workflow, built with your team, with the capability handed over.",
    duration: "8–14 weeks",
    fee: "$85,000–$175,000",
    feeNote: "fixed",
    recurring: "Optional support $7,500–$15,000/month",
    includes: [
      "Everything in Blueprint",
      "Production architecture and a paired build",
      "CI/CD and a security baseline",
      "Integrations, testing and the migration plan",
      "Training and handoff",
    ],
    youSupply: "A product owner and technical contributors.",
    commitment: "A production-ready workflow against agreed acceptance tests.",
    successFee: "7.5% of verified first-year savings",
  },
  {
    id: "managed",
    n: "03",
    name: "Managed Replacement",
    forWho: "For executive teams that want one accountable partner.",
    promise: "Design, build, migrate, launch and operate the replacement.",
    duration: "12–24 weeks",
    fee: "$200,000–$500,000",
    feeNote: "implementation",
    recurring: "Managed operation $15,000–$40,000/month",
    includes: [
      "Everything in Co-Build",
      "End-to-end development and data migration",
      "Parallel run, cutover and vendor decommissioning",
      "Support desk, monitoring and maintenance",
      "Monthly reliability, usage, cost and outcome reporting",
      "Client-owned repository, documentation and exit rights",
    ],
    youSupply: "A sponsor, process owners, security approvers and acceptance users.",
    commitment: "Milestone, reliability and service-level commitments.",
    successFee: "10–15% of verified first-year savings, capped",
  },
]

export const GAINSHARE_RULES = [
  "The baseline is the trailing twelve months of cash expense plus any contracted renewal increase.",
  "Savings count only after an invoice is cancelled, reduced or avoided.",
  "AI, cloud, maintenance, third-party software and replacement labour are deducted first.",
  "General productivity is excluded unless it is measured and agreed in the contract.",
  "The fee runs for twelve months and is capped.",
  "If the recommendation is to keep the incumbent, there is no success fee. The fixed Blueprint fee still applies.",
]

/* ------------------------------------------------------------------ */
/* Fit                                                                 */
/* ------------------------------------------------------------------ */

export const FIT_PROFILE = [
  { label: "Company size", value: "200–2,000 employees" },
  { label: "SaaS spend", value: "$1M+ a year" },
  { label: "Target platform", value: "$150k+ a year" },
  { label: "Renewal", value: "Inside 6–12 months" },
]

export const STRONG_SIGNALS = [
  "Fewer than half of licensed users are meaningfully active",
  "You pay for the platform and a dedicated admin or outside integrator",
  "The real process runs in spreadsheets, email, Slack or Teams",
  "Repeated manual review, data entry, reconciliation, approvals or handoffs",
  "Stable core workflows with unusual business rules",
  "Integration friction hurts more than missing features",
  "Management wants control of the data, the workflow logic and future AI agents",
]

export const WEAK_SIGNALS = [
  "The platform is inexpensive and broadly adopted",
  "Requirements change weekly because the model is unsettled",
  "A commodity function that mature vendors already serve well",
  "No accountable system owner",
  "Data that is locked, undocumented or legally non-portable",
  "An expectation of zero maintenance or full feature parity in eight weeks",
]

export const SCORECARD = [
  { label: "Avoidable annual cost", low: "Under $50,000", high: "Above $500,000" },
  { label: "Actual adoption", low: "Broad, deep use", high: "Little meaningful use" },
  { label: "Workflow differentiation", low: "Commodity process", high: "Highly proprietary process" },
  { label: "Data portability", low: "Locked or unusable", high: "Clean exports and documented APIs" },
  { label: "Integration complexity", low: "Many brittle real-time dependencies", high: "Few well-documented interfaces" },
  { label: "Risk and compliance", low: "Unclear or unacceptable", high: "Clear controls and approvers" },
  { label: "Executive ownership", low: "No accountable sponsor", high: "P&L owner with decision authority" },
  { label: "Operating capacity", low: "Nobody can own it", high: "Named product and technical owners" },
]

/* ------------------------------------------------------------------ */
/* Questions                                                           */
/* ------------------------------------------------------------------ */

export const FAQ = [
  {
    q: "Doesn't custom software become a maintenance problem?",
    a: "It does when maintenance is an afterthought. execom prices the lifecycle up front: an operating budget, automated tests and monitoring, documentation, and either a handoff to your team or a managed service with an SLA.",
  },
  {
    q: "Salesforce already handles security and compliance. Why take that on?",
    a: "A mature vendor carries a lot of control work for you. Replacement is recommended only when you can meet an explicit control baseline and the economics still hold after that baseline is costed in.",
  },
  {
    q: "Is AI-generated code safe to run in production?",
    a: "It is treated as untrusted until it is reviewed, tested, scanned and accepted, the same as any other code. NIST's secure development guidance for generative AI takes the same position.",
  },
  {
    q: "We can't reproduce every feature. Does that matter?",
    a: "The goal is not feature parity. It is the small set of workflows that create value, the records and controls you are required to keep, and nothing you were paying for and not using.",
  },
  {
    q: "What if the model vendor raises prices?",
    a: "The architecture routes between approved models, caps usage, caches where it is appropriate and reports unit economics monthly, so a price change is a configuration decision, not a crisis.",
  },
  {
    q: "What if execom disappears?",
    a: "You own the repository, the infrastructure access, the documentation and the runbooks. Contracts include escrow or transition terms and a defined handoff process.",
  },
  {
    q: "Why not just negotiate harder?",
    a: "Sometimes that is the right answer, and the Blueprint will say so. Usage data and a priced replacement are also the strongest position you can bring into a renewal.",
  },
  {
    q: "Which currency are the prices in?",
    a: "US dollars, before tax. Scope is fixed after intake and tied to workflow count, integrations, record volume, data sensitivity, users, availability requirements and migration complexity.",
  },
]

/* ------------------------------------------------------------------ */
/* Sources                                                             */
/* ------------------------------------------------------------------ */

export const SOURCES = [
  {
    n: 1,
    label: "Business Insider, “Curative CEO says company ditched a $600k-a-year Salesforce contract after vibe-coding a CRM in 2 months,” July 2026",
    href: "https://www.businessinsider.com/curative-ceo-salesforce-vibecode-crm-2026-7",
  },
  {
    n: 2,
    label: "20VC, “The Craziest Story in Startups: Curative with Fred Turner,” July 2026",
    href: "https://www.thetwentyminutevc.com/fred-turner",
  },
  {
    n: 3,
    label: "The Information (Laura Bratton), “How Small Firms Use Claude to Quit Salesforce,” as reported by PYMNTS, July 8, 2026",
    href: "https://www.pymnts.com/news/artificial-intelligence/2026/smbs-swap-pricey-saas-contracts-for-ai-built-apps/",
  },
  {
    n: 4,
    label: "Replit customer story, “Greenleaf Replaces Salesforce with Custom CRM”",
    href: "https://replit.com/customers/greenleaf",
  },
  {
    n: 5,
    label: "ITPro, Klarna scraps Salesforce and Workday in SaaS consolidation drive, September 13, 2024",
    href: "https://itpro.com/technology/artificial-intelligence/how-is-he-doing-this-marc-benioff-questions-klarna-ceo-s-scrapping-of-workday-salesforce-in-saas-consolidation-drive",
  },
  {
    n: 6,
    label: "TechCrunch, “Klarna CEO doubts that other companies will replace Salesforce with AI,” March 4, 2025",
    href: "https://techcrunch.com/2025/03/04/klarna-ceo-doubts-that-other-companies-will-replace-salesforce-with-ai",
  },
  {
    n: 7,
    label: "Fortune (John Kell), Sanofi builds its own AI ecosystem with Snowflake and Elementum, May 27, 2026",
    href: "https://fortune.com/2026/05/27/sanofi-snowflake-elementumai-data/",
  },
  {
    n: 8,
    label: "Retool, 2026 Build vs. Buy Report, via Business Wire, February 17, 2026",
    href: "https://www.businesswire.com/news/home/20260217548274/en/Retools-2026-Build-vs.-Buy-Report-Reveals-35-of-Enterprises-Have-Already-Replaced-SaaS-With-Custom-Software",
  },
  {
    n: 9,
    label: "NIST SP 800-218A, Secure Software Development Practices for Generative AI and Dual-Use Foundation Models",
    href: "https://csrc.nist.gov/projects/ssdf",
  },
]
