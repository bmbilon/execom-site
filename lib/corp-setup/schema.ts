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

export type MarkType = 'word' | 'design' | 'sound' | 'other'
export type FilingBasis = 'use' | 'intent_to_use' | 'foreign_registration'

export interface TrademarkIntake {
  id?: string
  matter_id?: string
  user_id?: string
  status: CommercializationStatus
  source_matter_id?: string

  mark_text: string
  mark_type: MarkType
  mark_description?: string
  mark_image_path?: string

  owner_name: string
  owner_address?: string
  owner_type: string

  nice_classes?: string
  goods_services?: string
  filing_basis: FilingBasis
  first_use_date?: string
  first_use_commerce?: string

  clearance_done: boolean
  clearance_notes?: string
  conflicts_found: boolean
  conflict_details?: string

  jurisdiction: string
  priority_claim: boolean
  priority_country?: string
  priority_date?: string
  priority_app_number?: string

  admin_notes?: string
  change_request_message?: string
  created_at?: string
  updated_at?: string
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
