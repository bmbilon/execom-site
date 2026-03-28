/**
 * Normalized schema for the commercialization / incorporation module.
 *
 * This single file drives:
 *   1. Portal wizard fields (client-facing)
 *   2. Supabase table shapes
 *   3. Internal document generation (Word templates 01/02/03)
 *   4. Alberta PDF form filler (fill_ab_incorporation.py)
 *
 * Designed so the same parent `commercialization_matters` table can
 * later support IP transfer, trademark, and licensing child records
 * without structural rework.
 */

// ═══════════════════════════════════════════════════════════════
// Status machine — shared across all commercialization modules
// ═══════════════════════════════════════════════════════════════

export const COMMERCIALIZATION_STATUSES = [
  'draft',
  'submitted',
  'in_review',
  'changes_requested',
  'approved_for_generation',
  'generated',
  'filed',
] as const

/** Shared status type for all child modules (incorporation, IP, TM, licensing) */
export type CommercializationStatus = typeof COMMERCIALIZATION_STATUSES[number]

/** @deprecated Use CommercializationStatus — kept for backward compatibility */
export type IncorporationStatus = CommercializationStatus
/** @deprecated Use COMMERCIALIZATION_STATUSES */
export const INCORPORATION_STATUSES = COMMERCIALIZATION_STATUSES

/** Which statuses allow the client to edit the intake? */
export const CLIENT_EDITABLE: CommercializationStatus[] = ['draft', 'changes_requested']

/** Valid admin transitions from each status */
export const ADMIN_TRANSITIONS: Record<CommercializationStatus, CommercializationStatus[]> = {
  draft: [],
  submitted: ['in_review'],
  in_review: ['changes_requested', 'approved_for_generation'],
  changes_requested: [],
  approved_for_generation: ['generated'],
  generated: ['filed'],
  filed: [],
}

/** Human-readable labels */
export const STATUS_LABELS: Record<IncorporationStatus, string> = {
  draft: 'Draft',
  submitted: 'Submitted',
  in_review: 'In Review',
  changes_requested: 'Changes Requested',
  approved_for_generation: 'Approved',
  generated: 'Generated',
  filed: 'Filed',
}

/** Badge colour classes */
export const STATUS_BADGE: Record<IncorporationStatus, string> = {
  draft: 'bg-[#E5E5E5] text-[#5A5A5A]',
  submitted: 'bg-blue-100 text-blue-800',
  in_review: 'bg-yellow-100 text-yellow-800',
  changes_requested: 'bg-orange-100 text-orange-800',
  approved_for_generation: 'bg-green-100 text-green-800',
  generated: 'bg-emerald-100 text-emerald-800',
  filed: 'bg-[#195E8E]/10 text-[#195E8E]',
}

// ═══════════════════════════════════════════════════════════════
// Data structures
// ═══════════════════════════════════════════════════════════════

export interface Director {
  first_name: string
  middle_name?: string
  last_name: string
  street: string
  city: string
  province: string
  postal_code: string
}

export interface AgentForService {
  first_name: string
  last_name: string
  firm?: string
  email: string
  street: string
  city: string
  province: string
  postal_code: string
}

export interface Declarant {
  full_name: string
  phone: string
  email: string
  id_type: string
  id_reference?: string // only at PDF-fill time, not stored
}

export type ArticlesChoice = 'default' | 'provided_own' | 'custom'

export interface CustomArticles {
  share_classes: string
  transfer_restrictions?: string
  director_details?: string
  business_restrictions?: string
  other_provisions?: string
}

export type LegalElement = 'Ltd.' | 'Inc.' | 'Corp.' | 'Limited' | 'Incorporated' | 'Corporation'

// ═══════════════════════════════════════════════════════════════
// Full intake record — matches Supabase incorporation_intakes
// ═══════════════════════════════════════════════════════════════

export interface IncorporationIntake {
  id?: string
  matter_id?: string
  user_id?: string
  status: IncorporationStatus
  created_at?: string
  updated_at?: string

  // Step 1 — Company Basics
  proposed_name: string
  legal_element: LegalElement
  alt_name_1?: string
  alt_name_2?: string
  reserved_name?: string
  fiscal_year_end: string

  // Registered office (must be physical AB address)
  reg_street: string
  reg_city: string
  reg_province: string
  reg_postal_code: string

  // Mailing address
  mailing_same_as_reg: boolean
  mail_po_box?: string
  mail_city?: string
  mail_province?: string
  mail_postal_code?: string

  // Step 2 — People
  agent: AgentForService
  director_structure: 'fixed' | 'range'
  director_fixed_number?: number
  director_min?: number
  director_max?: number
  directors: Director[]
  declarant: Declarant

  // Step 3 — Articles
  articles_choice: ArticlesChoice
  custom_articles?: CustomArticles

  // Admin
  admin_notes?: string
  change_request_message?: string
}

// ═══════════════════════════════════════════════════════════════
// Parent matter — extensible to IP transfer, TM, licensing
// ═══════════════════════════════════════════════════════════════

export type MatterType = 'incorporation' | 'ip_transfer' | 'trademark' | 'licensing'

export interface CommercializationMatter {
  id?: string
  user_id?: string
  matter_type: MatterType
  display_name: string
  status: string // mirrors child status for fast queries
  created_at?: string
  updated_at?: string
}

// ═══════════════════════════════════════════════════════════════
// Approved snapshot — immutable record for generation
// ═══════════════════════════════════════════════════════════════

export interface ApprovedSnapshot {
  id?: string
  intake_id: string
  matter_id: string
  version: number
  payload: IncorporationIntake // full frozen copy
  payload_hash?: string        // SHA-256 of payload for integrity verification
  approved_by: string
  approved_at?: string
}

// ═══════════════════════════════════════════════════════════════
// Generated artifact tracking
// ═══════════════════════════════════════════════════════════════

export type ArtifactType =
  // Incorporation
  | 'alberta_incorporation_pdf'
  | 'incorporation_package_docx'
  | 'organizational_resolutions_docx'
  | 'founder_subscription_docx'
  // IP Transfer
  | 'ip_assignment_docx'
  | 'ip_board_resolution_docx'
  | 'ip_tax_memo_docx'
  | 'ip_consideration_docx'
  | 'ip_patent_recordation_docx'
  // Trademark
  | 'trademark_clearance_report_docx'
  | 'trademark_filing_record_docx'
  | 'trademark_filing_summary_ca_docx'
  | 'trademark_filing_summary_us_docx'
  | 'trademark_goods_schedule_docx'
  | 'trademark_owner_sheet_docx'
  // Licensing
  | 'licensing_term_sheet_docx'
  | 'licensing_readiness_packet_docx'
  // Shared
  | 'ciia_agreement_docx'
  | 'commercial_form_agreement_docx'

export type ArtifactStatus = 'generated' | 'superseded' | 'filed_copy'

export interface GeneratedArtifact {
  id?: string
  matter_id: string
  intake_id: string
  snapshot_id: string
  artifact_type: ArtifactType
  version: number
  file_path?: string
  storage_key?: string
  snapshot_hash?: string   // SHA-256 of snapshot payload at generation time
  generated_by: string
  generated_at?: string
  status: ArtifactStatus
}

// ═══════════════════════════════════════════════════════════════
// Status event / audit trail
// ═══════════════════════════════════════════════════════════════

export interface MatterStatusEvent {
  id?: string
  matter_id: string
  intake_id?: string
  from_status: string
  to_status: string
  changed_by: string
  note?: string
  created_at?: string
}

// ═══════════════════════════════════════════════════════════════
// Wizard steps — client-facing
// ═══════════════════════════════════════════════════════════════

export const WIZARD_STEPS = [
  {
    key: 'company' as const,
    number: 1,
    title: 'Company Basics',
    subtitle: 'Name, address, and fiscal year',
  },
  {
    key: 'people' as const,
    number: 2,
    title: 'People & Addresses',
    subtitle: 'Agent for service, directors, and contact person',
  },
  {
    key: 'articles' as const,
    number: 3,
    title: 'Articles & Structure',
    subtitle: 'Default or custom articles of incorporation',
  },
  {
    key: 'review' as const,
    number: 4,
    title: 'Review & Submit',
    subtitle: 'Confirm everything looks correct',
  },
] as const

export type WizardStepKey = typeof WIZARD_STEPS[number]['key']

// ═══════════════════════════════════════════════════════════════
// Default blank record
// ═══════════════════════════════════════════════════════════════

export function blankIntake(): IncorporationIntake {
  return {
    status: 'draft',
    proposed_name: '',
    legal_element: 'Ltd.',
    fiscal_year_end: 'December 31',
    reg_street: '',
    reg_city: '',
    reg_province: 'Alberta',
    reg_postal_code: '',
    mailing_same_as_reg: true,
    agent: {
      first_name: '',
      last_name: '',
      email: '',
      street: '',
      city: '',
      province: 'Alberta',
      postal_code: '',
    },
    director_structure: 'fixed',
    director_fixed_number: 1,
    directors: [
      {
        first_name: '',
        last_name: '',
        street: '',
        city: '',
        province: 'Alberta',
        postal_code: '',
      },
    ],
    declarant: {
      full_name: '',
      phone: '',
      email: '',
      id_type: "Driver's Licence",
    },
    articles_choice: 'default',
  }
}

// ═══════════════════════════════════════════════════════════════
// Validation — maps to Alberta incorporation filing requirements
// ═══════════════════════════════════════════════════════════════

export interface ValidationError {
  field: string
  message: string
}

const LEGAL_ELEMENTS: string[] = ['Ltd.', 'Inc.', 'Corp.', 'Limited', 'Incorporated', 'Corporation']

export function validateStep(step: WizardStepKey, data: IncorporationIntake): ValidationError[] {
  const errs: ValidationError[] = []

  if (step === 'company') {
    if (!data.proposed_name.trim())
      errs.push({ field: 'proposed_name', message: 'Corporate name is required' })
    if (!LEGAL_ELEMENTS.includes(data.legal_element))
      errs.push({ field: 'legal_element', message: 'A legal suffix (Ltd., Inc., Corp., etc.) is required' })
    if (!data.reg_street.trim())
      errs.push({ field: 'reg_street', message: 'Registered office street address is required' })
    if (!data.reg_city.trim())
      errs.push({ field: 'reg_city', message: 'City is required' })
    if (!data.reg_postal_code.trim())
      errs.push({ field: 'reg_postal_code', message: 'Postal code is required' })
    if (data.reg_province.trim().toLowerCase() !== 'alberta')
      errs.push({ field: 'reg_province', message: 'Registered office must be in Alberta' })
    if (!data.mailing_same_as_reg) {
      if (!data.mail_po_box?.trim() && !data.mail_city?.trim())
        errs.push({ field: 'mail_po_box', message: 'Mailing address is required if different from registered office' })
    }
  }

  if (step === 'people') {
    // Agent — full address required by Alberta filing
    if (!data.agent.first_name.trim() || !data.agent.last_name.trim())
      errs.push({ field: 'agent.name', message: 'Agent for service name is required' })
    if (!data.agent.email.trim())
      errs.push({ field: 'agent.email', message: 'Agent email is required' })
    if (!data.agent.street.trim())
      errs.push({ field: 'agent.street', message: 'Agent street address is required (must be in Alberta)' })
    if (!data.agent.city.trim())
      errs.push({ field: 'agent.city', message: 'Agent city is required' })
    if (!data.agent.postal_code.trim())
      errs.push({ field: 'agent.postal_code', message: 'Agent postal code is required' })
    if (data.agent.province.trim().toLowerCase() !== 'alberta')
      errs.push({ field: 'agent.province', message: 'Agent for service must be an Alberta address' })

    // Directors — full addresses required by Alberta filing
    if (data.directors.length === 0)
      errs.push({ field: 'directors', message: 'At least one director is required' })
    data.directors.forEach((d, i) => {
      if (!d.first_name.trim() || !d.last_name.trim())
        errs.push({ field: `directors[${i}].name`, message: `Director ${i + 1} needs a first and last name` })
      if (!d.street.trim())
        errs.push({ field: `directors[${i}].street`, message: `Director ${i + 1} needs a street address` })
      if (!d.city.trim())
        errs.push({ field: `directors[${i}].city`, message: `Director ${i + 1} needs a city` })
      if (!d.postal_code.trim())
        errs.push({ field: `directors[${i}].postal_code`, message: `Director ${i + 1} needs a postal code` })
    })

    // Director count consistency
    if (data.director_structure === 'fixed') {
      const n = data.director_fixed_number ?? 1
      if (n < 1) errs.push({ field: 'director_fixed_number', message: 'Must have at least 1 director' })
    } else {
      const min = data.director_min ?? 1
      const max = data.director_max ?? 15
      if (min < 1) errs.push({ field: 'director_min', message: 'Minimum directors must be at least 1' })
      if (max < min) errs.push({ field: 'director_max', message: 'Maximum must be greater than or equal to minimum' })
    }

    // Declarant
    if (!data.declarant.full_name.trim())
      errs.push({ field: 'declarant.full_name', message: 'Contact person name is required' })
    if (!data.declarant.email.trim())
      errs.push({ field: 'declarant.email', message: 'Contact email is required' })
    if (!data.declarant.phone.trim())
      errs.push({ field: 'declarant.phone', message: 'Contact phone number is required' })
  }

  if (step === 'articles') {
    if (data.articles_choice === 'custom') {
      if (!data.custom_articles?.share_classes?.trim())
        errs.push({ field: 'custom_articles.share_classes', message: 'Share class description is required for custom articles' })
    }
  }

  return errs
}

/** Validate all steps — used before allowing submit */
export function validateAll(data: IncorporationIntake): ValidationError[] {
  return [
    ...validateStep('company', data),
    ...validateStep('people', data),
    ...validateStep('articles', data),
  ]
}

// ═══════════════════════════════════════════════════════════════
// IP Transfer intake
// ═══════════════════════════════════════════════════════════════

export type IPAssetType = 'invention' | 'software' | 'design' | 'trade_secret' | 'other'
export type ConsiderationType = 'shares' | 'cash' | 'mixed' | 'nominal'

export interface IPTransferIntake {
  id?: string
  matter_id?: string
  user_id?: string
  status: CommercializationStatus
  source_matter_id?: string

  asset_title: string
  asset_type: IPAssetType
  asset_description?: string
  invention_date?: string
  public_disclosure: boolean
  disclosure_details?: string

  inventor_name: string
  inventor_email?: string
  inventor_phone?: string
  inventor_address?: string

  assignee_corp_name: string
  assignee_corp_number?: string

  consideration_type: ConsiderationType
  consideration_amount?: string
  share_class?: string
  num_shares?: number

  patent_filed: boolean
  patent_app_number?: string
  patent_jurisdiction?: string

  prior_art_notes?: string
  existing_agreements?: string

  admin_notes?: string
  change_request_message?: string
  created_at?: string
  updated_at?: string
}

// ─── IP Transfer wizard steps ────────────────────────────────

export const IP_WIZARD_STEPS = [
  {
    key: 'asset' as const,
    number: 1,
    title: 'Asset Basics',
    subtitle: 'What intellectual property is being transferred',
  },
  {
    key: 'parties' as const,
    number: 2,
    title: 'Inventor & Company',
    subtitle: 'Who is transferring and who is receiving',
  },
  {
    key: 'consideration' as const,
    number: 3,
    title: 'Consideration & Filing',
    subtitle: 'Payment, shares, and patent status',
  },
  {
    key: 'review' as const,
    number: 4,
    title: 'Review & Submit',
    subtitle: 'Confirm everything looks correct',
  },
] as const

export type IPWizardStepKey = (typeof IP_WIZARD_STEPS)[number]['key']

// ─── Default blank IP Transfer record ────────────────────────

export function blankIPTransferIntake(): IPTransferIntake {
  return {
    status: 'draft',
    asset_title: '',
    asset_type: 'invention',
    asset_description: '',
    invention_date: '',
    public_disclosure: false,
    disclosure_details: '',
    inventor_name: '',
    inventor_email: '',
    inventor_phone: '',
    inventor_address: '',
    assignee_corp_name: '',
    assignee_corp_number: '',
    consideration_type: 'shares',
    consideration_amount: '',
    share_class: 'Common',
    num_shares: undefined,
    patent_filed: false,
    patent_app_number: '',
    patent_jurisdiction: '',
    prior_art_notes: '',
    existing_agreements: '',
  }
}

// ─── IP Transfer validation ──────────────────────────────────

export function validateIPStep(
  step: IPWizardStepKey,
  data: IPTransferIntake
): ValidationError[] {
  const errs: ValidationError[] = []

  if (step === 'asset') {
    if (!data.asset_title.trim())
      errs.push({ field: 'asset_title', message: 'Asset title is required' })
    if (!data.asset_type)
      errs.push({ field: 'asset_type', message: 'Asset type is required' })
    if (data.public_disclosure && !data.disclosure_details?.trim())
      errs.push({
        field: 'disclosure_details',
        message: 'Disclosure details are required when there has been a public disclosure',
      })
  }

  if (step === 'parties') {
    if (!data.inventor_name.trim())
      errs.push({ field: 'inventor_name', message: 'Inventor name is required' })
    if (!data.assignee_corp_name.trim())
      errs.push({
        field: 'assignee_corp_name',
        message: 'Assignee corporation name is required',
      })
  }

  if (step === 'consideration') {
    if (!data.consideration_type)
      errs.push({ field: 'consideration_type', message: 'Consideration type is required' })
    if (
      data.patent_filed &&
      !data.patent_app_number?.trim() &&
      !data.patent_jurisdiction?.trim()
    )
      errs.push({
        field: 'patent_app_number',
        message: 'Provide patent application number or jurisdiction when patent is filed',
      })
  }

  return errs
}

export function validateAllIP(data: IPTransferIntake): ValidationError[] {
  return [
    ...validateIPStep('asset', data),
    ...validateIPStep('parties', data),
    ...validateIPStep('consideration', data),
  ]
}

// ═══════════════════════════════════════════════════════════════
// Trademark intake
// ═══════════════════════════════════════════════════════════════

export type MarkType = 'word' | 'design' | 'slogan' | 'combined' | 'sound' | 'other'
export type TrademarkJurisdiction = 'Canada' | 'United States' | 'Both'
export type OwnerEntityType = 'corporation' | 'individual' | 'partnership' | 'other'
export type GoodsServicesCategory = 'goods' | 'services'

/** Structured goods/services entry — stored JSON-encoded in the DB `goods_services` text column */
export interface GoodsServicesItem {
  description: string
  category: GoodsServicesCategory
  nice_class?: string
}

export interface TrademarkIntake {
  id?: string
  matter_id?: string
  user_id?: string
  status: CommercializationStatus
  source_matter_id?: string

  // Step 1 — Brand Basics
  mark_text: string
  mark_type: MarkType
  mark_description?: string
  mark_image_path?: string
  jurisdiction: TrademarkJurisdiction

  // Step 2 — Owner Information
  owner_name: string
  owner_type: OwnerEntityType
  owner_country: string
  owner_address?: string
  owner_corp_number?: string
  linked_incorporation_matter_id?: string

  // Step 3 — Goods & Services (stored as JSON string in DB)
  goods_services_items: GoodsServicesItem[]
  // legacy flat fields kept for DB compat
  nice_classes?: string
  goods_services?: string

  // Step 4 — Use & Timing
  already_in_use: boolean
  use_territory?: string       // Canada / US / Both / Other
  first_use_date?: string
  first_use_commerce?: string  // US-specific first use in commerce
  file_before_launch: boolean
  priority_claim: boolean
  priority_country?: string
  priority_date?: string
  priority_app_number?: string

  // Step 5 — Clearance & Risk
  clearance_done: boolean
  clearance_notes?: string
  known_competitors?: string
  domain_available?: string     // yes / no / unknown
  social_handles_available?: string
  risk_notes?: string

  // Derived (internal — not shown to client)
  filing_basis_ca?: string      // mapped from use/timing data
  filing_basis_us?: string      // use_in_commerce / intent_to_use / foreign_priority
  conflicts_found: boolean
  conflict_details?: string

  // Admin
  admin_notes?: string
  change_request_message?: string
  created_at?: string
  updated_at?: string
}

// ─── Trademark wizard steps ─────────────────────────────────

export const TM_WIZARD_STEPS = [
  {
    key: 'brand' as const,
    number: 1,
    title: 'Brand Basics',
    subtitle: 'Your brand name, type, and where you want to protect it',
  },
  {
    key: 'owner' as const,
    number: 2,
    title: 'Owner Information',
    subtitle: 'Who owns this brand',
  },
  {
    key: 'goods' as const,
    number: 3,
    title: 'What You Sell',
    subtitle: 'Products and services that use this brand',
  },
  {
    key: 'timing' as const,
    number: 4,
    title: 'Use & Timing',
    subtitle: 'Are you already using this brand in market',
  },
  {
    key: 'clearance' as const,
    number: 5,
    title: 'Clearance & Risk',
    subtitle: 'Prior searches and potential conflicts',
  },
  {
    key: 'review' as const,
    number: 6,
    title: 'Review & Submit',
    subtitle: 'Confirm everything looks correct',
  },
] as const

export type TMWizardStepKey = (typeof TM_WIZARD_STEPS)[number]['key']

// ─── Default blank trademark record ─────────────────────────

export function blankTrademarkIntake(): TrademarkIntake {
  return {
    status: 'draft',
    mark_text: '',
    mark_type: 'word',
    mark_description: '',
    mark_image_path: '',
    jurisdiction: 'Canada',

    owner_name: '',
    owner_type: 'corporation',
    owner_country: 'Canada',
    owner_address: '',
    owner_corp_number: '',

    goods_services_items: [{ description: '', category: 'goods', nice_class: '' }],

    already_in_use: false,
    use_territory: '',
    first_use_date: '',
    first_use_commerce: '',
    file_before_launch: false,
    priority_claim: false,
    priority_country: '',
    priority_date: '',
    priority_app_number: '',

    clearance_done: false,
    clearance_notes: '',
    known_competitors: '',
    domain_available: 'unknown',
    social_handles_available: 'unknown',
    risk_notes: '',

    conflicts_found: false,
    conflict_details: '',
  }
}

// ─── Trademark validation ───────────────────────────────────

export function validateTMStep(
  step: TMWizardStepKey,
  data: TrademarkIntake
): ValidationError[] {
  const errs: ValidationError[] = []

  if (step === 'brand') {
    if (!data.mark_text.trim() && !data.mark_description?.trim())
      errs.push({ field: 'mark_text', message: 'Brand name or design description is required' })
    if (!data.mark_type)
      errs.push({ field: 'mark_type', message: 'Brand type is required' })
    if (!data.jurisdiction)
      errs.push({ field: 'jurisdiction', message: 'Select at least one jurisdiction' })
    if ((data.mark_type === 'design' || data.mark_type === 'combined') && !data.mark_image_path && !data.mark_description?.trim())
      errs.push({ field: 'mark_image_path', message: 'Upload a logo/design or provide a design description' })
  }

  if (step === 'owner') {
    if (!data.owner_name.trim())
      errs.push({ field: 'owner_name', message: 'Owner name is required' })
    if (!data.owner_address?.trim())
      errs.push({ field: 'owner_address', message: 'Owner address is required' })
    if (!data.owner_country?.trim())
      errs.push({ field: 'owner_country', message: 'Owner country is required' })
  }

  if (step === 'goods') {
    const items = data.goods_services_items || []
    if (items.length === 0 || !items.some((g) => g.description.trim()))
      errs.push({ field: 'goods_services_items', message: 'At least one product or service is required' })
    items.forEach((g, i) => {
      if (!g.description.trim())
        errs.push({ field: `goods_services_items[${i}].description`, message: `Item ${i + 1} needs a description` })
    })
  }

  if (step === 'timing') {
    if (data.already_in_use) {
      if (!data.use_territory?.trim())
        errs.push({ field: 'use_territory', message: 'Specify where you are using this brand' })
      if (!data.first_use_date?.trim())
        errs.push({ field: 'first_use_date', message: 'First use date is required if already in use' })
      if ((data.jurisdiction === 'United States' || data.jurisdiction === 'Both') && !data.first_use_commerce?.trim())
        errs.push({ field: 'first_use_commerce', message: 'First use in commerce date is required for US filing' })
    }
    if (data.priority_claim) {
      if (!data.priority_country?.trim())
        errs.push({ field: 'priority_country', message: 'Priority country is required' })
      if (!data.priority_date?.trim())
        errs.push({ field: 'priority_date', message: 'Priority filing date is required' })
      if (!data.priority_app_number?.trim())
        errs.push({ field: 'priority_app_number', message: 'Priority application number is required' })
    }
  }

  // clearance step has no required fields
  return errs
}

export function validateAllTM(data: TrademarkIntake): ValidationError[] {
  return [
    ...validateTMStep('brand', data),
    ...validateTMStep('owner', data),
    ...validateTMStep('goods', data),
    ...validateTMStep('timing', data),
    ...validateTMStep('clearance', data),
  ]
}

/** Derive filing basis from intake data (internal mapping) */
export function deriveFilingBasis(data: TrademarkIntake): { ca?: string; us?: string } {
  const result: { ca?: string; us?: string } = {}

  if (data.jurisdiction === 'Canada' || data.jurisdiction === 'Both') {
    if (data.priority_claim) result.ca = 'priority'
    else if (data.already_in_use) result.ca = 'use'
    else result.ca = 'proposed_use'
  }

  if (data.jurisdiction === 'United States' || data.jurisdiction === 'Both') {
    if (data.already_in_use && data.first_use_commerce) result.us = 'use_in_commerce'
    else if (data.file_before_launch || !data.already_in_use) result.us = 'intent_to_use'
    else if (data.priority_claim) result.us = 'foreign_priority'
    else result.us = 'intent_to_use'
  }

  return result
}

// ═══════════════════════════════════════════════════════════════
// Licensing intake
// ═══════════════════════════════════════════════════════════════

export type LicenseType = 'exclusive' | 'non_exclusive' | 'sole'
export type LicensedIPType = 'patent' | 'software' | 'trade_secret' | 'trademark' | 'mixed'

export interface LicensingIntake {
  id?: string
  matter_id?: string
  user_id?: string
  status: CommercializationStatus
  source_matter_id?: string
  ip_matter_id?: string

  licensed_ip_title: string
  licensed_ip_type: LicensedIPType
  ip_description?: string

  licensor_name: string
  licensor_address?: string
  licensor_contact?: string

  licensee_name?: string
  licensee_address?: string
  licensee_type: string

  license_type: LicenseType
  territory: string
  field_of_use?: string
  term_years?: number
  auto_renewal: boolean

  upfront_fee?: string
  royalty_rate?: string
  royalty_basis?: string
  minimum_royalty?: string
  milestone_payments?: string

  sublicense_allowed: boolean
  sublicense_terms?: string

  prosecution_responsibility: string
  enforcement_responsibility: string
  improvement_ownership: string

  admin_notes?: string
  change_request_message?: string
  created_at?: string
  updated_at?: string
}

// ═══════════════════════════════════════════════════════════════
// Unified matter summary (for dashboard)
// ═══════════════════════════════════════════════════════════════

export interface MatterSummary {
  matter_id: string
  user_id: string
  matter_type: MatterType
  display_name: string
  status: string
  created_at: string
  updated_at: string
  incorporation_intake_id?: string
  ip_transfer_intake_id?: string
  trademark_intake_id?: string
  licensing_intake_id?: string
  snapshot_count: number
  active_artifact_count: number
}
