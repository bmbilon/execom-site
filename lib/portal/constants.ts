import type {
  FileCategory,
  CostType,
  EvidenceType,
  ClaimYearStatus,
  ProjectStatus,
  ProfileRole,
} from './types'

export const CATEGORY_OPTIONS: { value: FileCategory; label: string }[] = [
  { value: 'payroll', label: 'Payroll' },
  { value: 'accounting', label: 'Accounting' },
  { value: 'technical', label: 'Technical' },
  { value: 'contract', label: 'Contract' },
  { value: 'other', label: 'Other' },
]

export const COST_TYPE_OPTIONS: { value: CostType; label: string }[] = [
  { value: 'salary', label: 'Salary' },
  { value: 'wages', label: 'Wages' },
  { value: 'subcontractor', label: 'Subcontractor' },
  { value: 'materials', label: 'Materials' },
  { value: 'overhead', label: 'Overhead' },
  { value: 'other', label: 'Other' },
]

export const EVIDENCE_TYPE_OPTIONS: { value: EvidenceType; label: string }[] = [
  { value: 'document', label: 'Document' },
  { value: 'email', label: 'Email' },
  { value: 'commit_log', label: 'Commit Log' },
  { value: 'photo', label: 'Photo' },
  { value: 'test_result', label: 'Test Result' },
  { value: 'report', label: 'Report' },
  { value: 'other', label: 'Other' },
]

export const STATUS_CONFIG: Record<
  ClaimYearStatus,
  { label: string; color: string; textColor: string }
> = {
  draft: { label: 'Draft', color: 'bg-gray-100', textColor: 'text-gray-700' },
  in_progress: { label: 'In Progress', color: 'bg-blue-100', textColor: 'text-blue-700' },
  ready_for_review: {
    label: 'Ready for Review',
    color: 'bg-green-100',
    textColor: 'text-green-700',
  },
  under_review: { label: 'Under Review', color: 'bg-amber-100', textColor: 'text-amber-700' },
  changes_requested: {
    label: 'Changes Requested',
    color: 'bg-red-100',
    textColor: 'text-red-700',
  },
  approved: { label: 'Approved', color: 'bg-emerald-100', textColor: 'text-emerald-700' },
  filed: { label: 'Filed', color: 'bg-purple-100', textColor: 'text-purple-700' },
}

export const PROJECT_STATUS_CONFIG: Record<
  ProjectStatus,
  { label: string; color: string; textColor: string }
> = {
  draft: { label: 'Draft', color: 'bg-gray-100', textColor: 'text-gray-700' },
  complete: { label: 'Complete', color: 'bg-green-100', textColor: 'text-green-700' },
  flagged: { label: 'Flagged', color: 'bg-red-100', textColor: 'text-red-700' },
}

export const ROLE_PERMISSIONS: Record<
  ProfileRole,
  {
    canUpload: boolean
    canEditProjects: boolean
    canManageTeam: boolean
    canDeleteClaimYear: boolean
    canRequestReview: boolean
  }
> = {
  owner: {
    canUpload: true,
    canEditProjects: true,
    canManageTeam: true,
    canDeleteClaimYear: true,
    canRequestReview: true,
  },
  admin: {
    canUpload: true,
    canEditProjects: true,
    canManageTeam: true,
    canDeleteClaimYear: false,
    canRequestReview: true,
  },
  contributor: {
    canUpload: true,
    canEditProjects: true,
    canManageTeam: false,
    canDeleteClaimYear: false,
    canRequestReview: true,
  },
  viewer: {
    canUpload: false,
    canEditProjects: false,
    canManageTeam: false,
    canDeleteClaimYear: false,
    canRequestReview: false,
  },
}

export const MAX_FILE_SIZE = 25 * 1024 * 1024

export const MAX_CLAIM_YEAR_SIZE = 500 * 1024 * 1024

export const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-excel',
  'text/csv',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'image/png',
  'image/jpeg',
  'application/zip',
]

export const ALLOWED_EXTENSIONS = [
  '.pdf',
  '.xlsx',
  '.xls',
  '.csv',
  '.docx',
  '.png',
  '.jpg',
  '.zip',
]
