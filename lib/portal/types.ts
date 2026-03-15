export type ClaimYearStatus =
  | 'draft'
  | 'in_progress'
  | 'ready_for_review'
  | 'under_review'
  | 'changes_requested'
  | 'approved'
  | 'filed'

export type ProfileRole = 'owner' | 'admin' | 'contributor' | 'viewer'
export type ProjectStatus = 'draft' | 'complete' | 'flagged'
export type FileCategory = 'payroll' | 'accounting' | 'technical' | 'contract' | 'other'
export type EvidenceType = 'document' | 'email' | 'commit_log' | 'photo' | 'test_result' | 'report' | 'other'
export type CostType = 'salary' | 'wages' | 'subcontractor' | 'materials' | 'overhead' | 'other'
export type CostSource = 'manual' | 'imported'
export type OutputType = 'xlsx' | 'pdf' | 'json'
export type ReviewStatus = 'pending' | 'in_review' | 'changes_requested' | 'approved'
export type ReviewCommentTargetType = 'project' | 'cost' | 'evidence' | 'general' | null

// ── Row types matching the schema exactly ──

export interface Company {
  id: string
  name: string
  legal_name: string | null
  bn: string | null
  fiscal_ye_month: number
  industry: string | null
  address: Record<string, string> | null
  created_at: string
  updated_at: string
}

export interface Profile {
  id: string
  company_id: string
  email: string
  full_name: string
  role: ProfileRole
  is_execom_staff: boolean
  invited_by: string | null
  created_at: string
}

export interface ClaimYear {
  id: string
  company_id: string
  fiscal_year: number
  status: ClaimYearStatus
  claim_json: Record<string, unknown> | null
  created_by: string | null
  created_at: string
  updated_at: string
}

export interface FileRecord {
  id: string
  claim_year_id: string
  uploaded_by: string | null
  file_name: string
  storage_key: string
  category: FileCategory
  mime_type: string | null
  file_size: number | null
  metadata: Record<string, unknown> | null
  uploaded_at: string
}

export interface Project {
  id: string
  claim_year_id: string
  company_id: string
  name: string
  code: string | null
  status: ProjectStatus
  objective: string | null
  uncertainty: string | null
  work_done: string | null
  advancement: string | null
  start_date: string | null
  end_date: string | null
  sort_order: number
  created_at: string
  updated_at: string
}

export interface Evidence {
  id: string
  project_id: string
  claim_year_id: string
  file_id: string | null
  evidence_type: EvidenceType
  title: string
  description: string | null
  date_range: string | null
  sort_order: number
  created_at: string
}

export interface Cost {
  id: string
  project_id: string
  claim_year_id: string
  file_id: string | null
  cost_type: CostType
  description: string
  amount: number
  hours: number | null
  rate: number | null
  employee_name: string | null
  vendor_name: string | null
  external_reference: string | null
  period_start: string | null
  period_end: string | null
  source: CostSource
  sort_order: number
  created_at: string
}

export interface ClaimOutput {
  id: string
  claim_year_id: string
  output_type: OutputType
  version: number
  storage_key: string | null
  payload: Record<string, unknown> | null
  generated_by: string | null
  created_at: string
}

export interface Review {
  id: string
  claim_year_id: string
  requested_by: string | null
  reviewer_id: string | null
  status: ReviewStatus
  notes: string | null
  requested_at: string
  resolved_at: string | null
}

export interface ReviewComment {
  id: string
  review_id: string
  author_id: string | null
  target_type: ReviewCommentTargetType
  target_id: string | null
  comment: string
  created_at: string
}

export interface AuditLog {
  id: string
  user_id: string | null
  action: string
  entity_type: string
  entity_id: string | null
  old_value: Record<string, unknown> | null
  new_value: Record<string, unknown> | null
  created_at: string
}

// ── Supabase Database type ──

type TableDef<R, I = Partial<R>, U = Partial<R>> = {
  Row: R
  Insert: I
  Update: U
}

export interface Database {
  public: {
    Tables: {
      companies: TableDef<Company, Partial<Company> & { name: string }>
      profiles: TableDef<Profile, Partial<Profile> & { id: string; company_id: string; email: string; full_name: string; role: string }>
      claim_years: TableDef<ClaimYear, Partial<ClaimYear> & { company_id: string; fiscal_year: number }>
      files: TableDef<FileRecord, Partial<FileRecord> & { claim_year_id: string; file_name: string; storage_key: string; category: string }>
      projects: TableDef<Project, Partial<Project> & { claim_year_id: string; company_id: string; name: string }>
      evidence: TableDef<Evidence, Partial<Evidence> & { project_id: string; claim_year_id: string; evidence_type: string; title: string }>
      costs: TableDef<Cost, Partial<Cost> & { project_id: string; claim_year_id: string; cost_type: string; description: string; amount: number }>
      claim_outputs: TableDef<ClaimOutput, Partial<ClaimOutput> & { claim_year_id: string; output_type: string }>
      reviews: TableDef<Review, Partial<Review> & { claim_year_id: string }>
      review_comments: TableDef<ReviewComment, Partial<ReviewComment> & { review_id: string; comment: string }>
      audit_log: TableDef<AuditLog, Partial<AuditLog> & { action: string; entity_type: string }>
    }
  }
}
