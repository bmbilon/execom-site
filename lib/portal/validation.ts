import { z } from 'zod'
import { ALLOWED_MIME_TYPES, MAX_FILE_SIZE } from './constants'
import type { Company, Project, FileRecord, Cost, Evidence } from './types'

export const bnSchema = z
  .string()
  .regex(/^\d{9}[A-Z]{2}\d{4}$/, 'Invalid CRA Business Number format')

export const companySchema = z.object({
  name: z.string().min(1, 'Company name is required'),
  legal_name: z.string().optional(),
  bn: bnSchema.optional(),
  fiscal_ye_month: z.number().int().min(1).max(12),
  industry: z.string().optional(),
  address: z
    .object({
      street: z.string().optional(),
      city: z.string().optional(),
      province: z.string().optional(),
      postal: z.string().optional(),
    })
    .optional(),
})

export const projectNarrativeSchema = z.object({
  objective: z
    .string()
    .min(100, 'Objective must be at least 100 characters')
    .max(2000, 'Objective must be at most 2000 characters'),
  uncertainty: z
    .string()
    .min(100, 'Uncertainty must be at least 100 characters')
    .max(2000, 'Uncertainty must be at most 2000 characters'),
  work_done: z
    .string()
    .min(200, 'Work done must be at least 200 characters')
    .max(4000, 'Work done must be at most 4000 characters'),
  advancement: z
    .string()
    .min(100, 'Advancement must be at least 100 characters')
    .max(2000, 'Advancement must be at most 2000 characters'),
})

export const projectSchema = z.object({
  name: z.string().min(1, 'Project name is required'),
  code: z.string().optional(),
  start_date: z.string().optional(),
  end_date: z.string().optional(),
  objective: z
    .string()
    .min(100, 'Objective must be at least 100 characters')
    .max(2000, 'Objective must be at most 2000 characters')
    .optional(),
  uncertainty: z
    .string()
    .min(100, 'Uncertainty must be at least 100 characters')
    .max(2000, 'Uncertainty must be at most 2000 characters')
    .optional(),
  work_done: z
    .string()
    .min(200, 'Work done must be at least 200 characters')
    .max(4000, 'Work done must be at most 4000 characters')
    .optional(),
  advancement: z
    .string()
    .min(100, 'Advancement must be at least 100 characters')
    .max(2000, 'Advancement must be at most 2000 characters')
    .optional(),
})

export const costSchema = z.object({
  cost_type: z.enum(['salary', 'wages', 'subcontractor', 'materials', 'overhead', 'other']),
  description: z.string().min(1, 'Description is required'),
  amount: z.number().positive('Amount must be positive'),
  hours: z.number().positive('Hours must be positive').optional(),
  rate: z.number().positive('Rate must be positive').optional(),
  employee_name: z.string().optional(),
  vendor_name: z.string().optional(),
  external_reference: z.string().optional(),
  period_start: z.string().optional(),
  period_end: z.string().optional(),
})

export const fileUploadSchema = z.object({
  size: z.number().max(MAX_FILE_SIZE, 'File size must not exceed 25 MB'),
  type: z.string().refine((val) => ALLOWED_MIME_TYPES.includes(val), {
    message: 'File type is not allowed',
  }),
})

export const claimYearSchema = z.object({
  fiscal_year: z
    .number()
    .int('Fiscal year must be an integer')
    .min(1900, 'Fiscal year must be at least 1900')
    .max(2100, 'Fiscal year must be at most 2100'),
})

export function completenessGateSchema({
  company,
  projects,
  files,
  costs,
  evidence,
}: {
  company: Company
  projects: Project[]
  files: FileRecord[]
  costs: Cost[]
  evidence: Evidence[]
}): { valid: boolean; errors: string[] } {
  const errors: string[] = []

  // Company profile complete
  if (!company.name) errors.push('Company name is required')
  if (!company.legal_name) errors.push('Company legal name is required')
  if (!company.bn) errors.push('Company business number is required')
  if (!company.address || !company.address.street || !company.address.city || !company.address.province || !company.address.postal) {
    errors.push('Company address must be complete (street, city, province, postal)')
  }

  // At least 1 project
  if (projects.length === 0) {
    errors.push('At least one project is required')
  }

  // Every project has all 4 T661 fields + at least 1 cost + at least 1 evidence
  for (const project of projects) {
    if (!project.objective) {
      errors.push(`Project "${project.name}" is missing the objective field`)
    }
    if (!project.uncertainty) {
      errors.push(`Project "${project.name}" is missing the uncertainty field`)
    }
    if (!project.work_done) {
      errors.push(`Project "${project.name}" is missing the work done field`)
    }
    if (!project.advancement) {
      errors.push(`Project "${project.name}" is missing the advancement field`)
    }

    const projectCosts = costs.filter((c) => c.project_id === project.id)
    if (projectCosts.length === 0) {
      errors.push(`Project "${project.name}" must have at least one cost`)
    }

    const projectEvidence = evidence.filter((e) => e.project_id === project.id)
    if (projectEvidence.length === 0) {
      errors.push(`Project "${project.name}" must have at least one piece of evidence`)
    }
  }

  // Total expenditures > 0
  const totalExpenditures = costs.reduce((sum, c) => sum + c.amount, 0)
  if (totalExpenditures <= 0) {
    errors.push('Total expenditures must be greater than zero')
  }

  // At least 1 file with category payroll or accounting
  const hasPayrollOrAccounting = files.some(
    (f) => f.category === 'payroll' || f.category === 'accounting'
  )
  if (!hasPayrollOrAccounting) {
    errors.push('At least one file with category "payroll" or "accounting" is required')
  }

  return { valid: errors.length === 0, errors }
}
