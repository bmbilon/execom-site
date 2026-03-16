/**
 * Service-layer type definitions for the execom SR&ED Claim OS.
 *
 * Re-exports base portal types where overlap exists and defines
 * interfaces for all Claim OS tables, service inputs, and summaries.
 */

// ── Re-exports from the portal layer ──

export type {
  Company,
  Profile,
  ClaimYear,
  Project,
  Evidence,
  Cost,
  FileRecord,
  ClaimOutput,
  Review,
  ReviewComment,
  AuditLog,
  ClaimYearStatus,
  ProfileRole,
  ProjectStatus,
  FileCategory,
  EvidenceType,
  CostType,
  CostSource,
  OutputType,
  ReviewStatus,
} from '@/lib/portal/types'

// ── Claim OS row types ──

export interface ClaimContact {
  id: string
  claim_year_id: string
  contact_role: 'claimant' | 'preparer' | 'technical' | 'financial'
  name: string
  title: string | null
  email: string | null
  phone: string | null
  preparer_ern: string | null
  billing_arrangement: 'contingency' | 'fixed_fee' | 'hourly' | 'internal' | null
  related_forms_required: string[] | null
  created_at: string
}

export interface NarrativeSection {
  id: string
  project_id: string
  section_key:
    | 'technical_uncertainty'
    | 'systematic_investigation'
    | 'advancement'
    | 'project_logistics'
    | 'evidence_retained'
  raw_text: string | null
  ai_draft_text: string | null
  approved_text: string | null
  evidence_coverage_score: number
  review_status: 'draft' | 'ai_drafted' | 'edited' | 'approved' | 'flagged'
  updated_at: string | null
}

export interface ProjectPerson {
  id: string
  project_id: string
  person_type: 'employee' | 'contractor' | 'subcontractor' | 'consultant'
  name: string
  role: string | null
  employer_type: 'claimant' | 'arms_length' | 'non_arms_length' | null
  specified_employee_flag: boolean
  specified_employee_start_date: string | null
  specified_employee_end_date: string | null
  notes: string | null
  created_at: string
}

export interface ProjectEvidenceLink {
  id: string
  project_id: string
  evidence_id: string
  narrative_section_key: string
  support_strength: 'strong' | 'moderate' | 'weak'
  note: string | null
  created_at: string
}

export interface CostImport {
  id: string
  claim_year_id: string
  source_type: string
  source_name: string | null
  imported_at: string
  status: 'pending' | 'processing' | 'complete' | 'failed'
  row_count: number | null
  metadata_json: Record<string, unknown> | null
}

export interface CostLineItem {
  id: string
  cost_import_id: string
  claim_year_id: string
  line_date: string | null
  vendor_or_employee: string | null
  description: string | null
  gl_account: string | null
  gross_amount: number | null
  tax_amount: number | null
  net_amount: number | null
  currency: string
  raw_payload_json: Record<string, unknown> | null
  created_at: string
}

export interface CostLineClassification {
  id: string
  cost_line_item_id: string
  likely_category: string
  confidence_score: number | null
  related_party_flag: boolean
  excluded_flag: boolean
  rationale: string | null
  classified_by: 'manual' | 'ai' | 'rule'
}

export interface CostLineProjectSplit {
  id: string
  cost_line_item_id: string
  project_id: string
  allocation_percent: number
  allocation_amount: number
  province_code: string
  province_percent: number
  review_status: 'pending' | 'confirmed' | 'excluded' | 'flagged'
}

export interface AssistanceItem {
  id: string
  claim_year_id: string
  assistance_type:
    | 'government_grant'
    | 'government_assistance'
    | 'non_government_assistance'
    | 'contract_payment'
  source_name: string
  amount: number
  linked_project_id: string | null
  treatment_notes: string | null
}

export interface ClaimSnapshot {
  id: string
  claim_year_id: string
  snapshot_type: 'pre_export' | 'pre_review' | 'manual' | 'amendment'
  payload_json: Record<string, unknown>
  created_at: string
}

export interface FederalLineValue {
  id: string
  claim_year_id: string
  snapshot_id: string | null
  form_code: string
  line_code: string
  value: number | null
  explanation: string | null
}

export interface ProvincialLineValue {
  id: string
  claim_year_id: string
  snapshot_id: string | null
  province_code: string
  form_code: string
  line_code: string
  value: number | null
  explanation: string | null
}

export interface ReviewRule {
  rule_key: string
  layer: 'form' | 'eligibility' | 'calculation'
  severity: 'blocker' | 'warning' | 'info'
  source_area: string
  message_template: string
  enabled: boolean
}

export interface ReviewIssue {
  id: string
  claim_year_id: string
  project_id: string | null
  rule_key: string | null
  issue_type: string
  severity: 'blocker' | 'warning' | 'info'
  source_area: string
  message: string
  target_field: string | null
  resolution_status: 'open' | 'resolved' | 'dismissed' | 'deferred'
  resolution_note: string | null
  resolved_at: string | null
}

export interface ExportBundle {
  id: string
  claim_year_id: string
  version_label: string
  export_type: string
  province_code: string | null
  status: 'generating' | 'ready' | 'failed' | 'superseded'
  snapshot_id: string | null
  storage_key: string | null
  file_size: number | null
  generated_by: string | null
  created_at: string
}

// ── Provincial adapter tables (migration 006) ──

export interface ProvincialEmployeeTime {
  id: string
  claim_year_id: string
  project_person_id: string
  province_code: string
  rd_time_fraction: number
  created_at: string
}

export interface OnEriContract {
  id: string
  project_id: string
  claim_year_id: string
  eri_code: string
  eri_name: string
  contract_date: string | null
  payment_amount: number
  created_at: string
}

// ── Input types for create / update operations ──

export interface CreateClaimYearInput {
  company_id: string
  fiscal_year: number
  tax_year_start?: string
  tax_year_end?: string
  method_election?: string
}

export interface ClaimContactInput {
  claim_year_id: string
  contact_role: string
  name: string
  title?: string
  email?: string
  phone?: string
  preparer_ern?: string
  billing_arrangement?: string
  related_forms_required?: string[]
}

export interface CreateProjectInput {
  claim_year_id: string
  company_id: string
  name: string
  code?: string
  project_type?: string
}

export interface NarrativeSectionInput {
  project_id: string
  section_key: string
  raw_text?: string
  ai_draft_text?: string
  approved_text?: string
}

export interface ProjectPersonInput {
  project_id: string
  person_type: string
  name: string
  role?: string
  employer_type?: string
  specified_employee_flag?: boolean
  notes?: string
}

export interface EvidenceLinkInput {
  project_id: string
  evidence_id: string
  narrative_section_key?: string
  support_strength?: string
  note?: string
}

export interface RawCostRow {
  line_date?: string
  vendor_or_employee?: string
  description?: string
  gl_account?: string
  gross_amount?: number
  tax_amount?: number
  net_amount?: number
  currency?: string
  raw_payload_json?: Record<string, unknown>
}

export interface ClassificationInput {
  likely_category: string
  confidence_score?: number
  related_party_flag?: boolean
  excluded_flag?: boolean
  rationale?: string
  classified_by?: string
}

export interface ProjectSplitInput {
  project_id: string
  allocation_percent: number
  allocation_amount: number
  province_code?: string
  province_percent?: number
}

export interface AssistanceItemInput {
  claim_year_id: string
  assistance_type: string
  source_name: string
  amount: number
  linked_project_id?: string
  treatment_notes?: string
}

// ── Summary / computed types ──

export interface ClaimSummary {
  projectCount: number
  costTotal: number
  fileCount: number
  evidenceCount: number
  narrativeCompletionPercent: number
  readinessScore: number
}

export interface CostSummary {
  totalByCategory: Record<string, number>
  mappedCount: number
  unmappedCount: number
  provinceSplits: Record<string, number>
}

export interface FederalWaterfall {
  totalExpenditures: number
  exclusions: number
  proxyOrOverhead: number
  assistance: number
  qualifiedExpenditures: number
  enhancedItc: number
  basicItc: number
  totalItc: number
}
