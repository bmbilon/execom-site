import { createServerSupabaseClient } from './supabase-server'

export interface ClaimJson {
  version: string
  generated_at: string
  company: {
    name: string
    legal_name: string | null
    bn: string | null
    fiscal_year: number
    fiscal_ye_month: number
    address: Record<string, string> | null
  }
  totals: {
    salary: number
    wages: number
    subcontractor: number
    materials: number
    overhead: number
    other: number
    total_qualified: number
    estimated_federal_itc: number
  }
  projects: {
    code: string | null
    name: string
    status: string
    start_date: string | null
    end_date: string | null
    t661: {
      objective: string | null
      uncertainty: string | null
      work_done: string | null
      advancement: string | null
    }
    costs: {
      cost_type: string
      description: string
      amount: number
      hours: number | null
      rate: number | null
      employee_name: string | null
      vendor_name: string | null
      external_reference: string | null
      period_start: string | null
      period_end: string | null
    }[]
    evidence: {
      evidence_type: string
      title: string
      description: string | null
      file_name: string | null
    }[]
  }[]
}

export async function buildClaimJson(claimYearId: string): Promise<ClaimJson> {
  const supabase = createServerSupabaseClient()

  const { data: claimYear } = await supabase
    .from('claim_years')
    .select('*, companies(*)')
    .eq('id', claimYearId)
    .single()

  if (!claimYear) throw new Error('Claim year not found')

  const { data: projects } = await supabase
    .from('projects')
    .select('*')
    .eq('claim_year_id', claimYearId)
    .order('sort_order')

  const { data: costs } = await supabase
    .from('costs')
    .select('*')
    .eq('claim_year_id', claimYearId)

  const { data: evidence } = await supabase
    .from('evidence')
    .select('*, files(file_name)')
    .eq('claim_year_id', claimYearId)

  const company = claimYear.companies

  // Calculate totals by category
  const totals = {
    salary: 0,
    wages: 0,
    subcontractor: 0,
    materials: 0,
    overhead: 0,
    other: 0,
    total_qualified: 0,
    estimated_federal_itc: 0,
  }

  for (const cost of costs || []) {
    const amount = Number(cost.amount)
    const key = cost.cost_type as keyof typeof totals
    if (key in totals) totals[key] += amount
    totals.total_qualified += amount
  }

  // Estimated federal ITC at 15% (non-CCPC rate; CCPC rate is 35% under threshold)
  totals.estimated_federal_itc = totals.total_qualified * 0.15

  const projectData = (projects || []).map((project) => {
    const projectCosts = (costs || [])
      .filter((c) => c.project_id === project.id)
      .map((c) => ({
        cost_type: c.cost_type,
        description: c.description,
        amount: Number(c.amount),
        hours: c.hours ? Number(c.hours) : null,
        rate: c.rate ? Number(c.rate) : null,
        employee_name: c.employee_name,
        vendor_name: c.vendor_name,
        external_reference: c.external_reference,
        period_start: c.period_start,
        period_end: c.period_end,
      }))

    const projectEvidence = (evidence || [])
      .filter((e) => e.project_id === project.id)
      .map((e) => ({
        evidence_type: e.evidence_type,
        title: e.title,
        description: e.description,
        file_name: e.files?.file_name || null,
      }))

    return {
      code: project.code,
      name: project.name,
      status: project.status,
      start_date: project.start_date,
      end_date: project.end_date,
      t661: {
        objective: project.objective,
        uncertainty: project.uncertainty,
        work_done: project.work_done,
        advancement: project.advancement,
      },
      costs: projectCosts,
      evidence: projectEvidence,
    }
  })

  return {
    version: '1.0',
    generated_at: new Date().toISOString(),
    company: {
      name: company.name,
      legal_name: company.legal_name,
      bn: company.bn,
      fiscal_year: claimYear.fiscal_year,
      fiscal_ye_month: company.fiscal_ye_month,
      address: company.address,
    },
    totals,
    projects: projectData,
  }
}
