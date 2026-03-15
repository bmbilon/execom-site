'use client'

import { useState } from 'react'
import { createClient } from '@/lib/portal/supabase-client'
import { useRouter } from 'next/navigation'
import CompletenessChecklist from '@/components/portal/CompletenessChecklist'
import T661Preview from '@/components/portal/T661Preview'
import StatusBadge from '@/components/portal/StatusBadge'
import { Toaster, toast } from 'sonner'

interface ReviewClientProps {
  yearId: string
  claimYear: { id: string; status: string; fiscal_year: number }
  company: { name: string; legal_name: string | null; bn: string | null; address: Record<string, string> | null }
  projects: {
    id: string
    name: string
    code: string | null
    status: string
    objective: string | null
    uncertainty: string | null
    work_done: string | null
    advancement: string | null
  }[]
  costs: { id: string; project_id: string; amount: number }[]
  evidence: { id: string; project_id: string }[]
  files: { id: string; category: string }[]
  profileId: string
  role: string
}

export default function ReviewClient({
  yearId,
  claimYear,
  company,
  projects,
  costs,
  evidence,
  files,
  profileId,
  role,
}: ReviewClientProps) {
  const [submitting, setSubmitting] = useState(false)
  const router = useRouter()

  // Run completeness checks
  const checks = runCompletenessChecks(company, projects, costs, evidence, files)
  const allPassed = checks.every((c) => c.passed)
  const canRequestReview = allPassed && (role === 'owner' || role === 'admin' || role === 'contributor')
  const isReviewable = claimYear.status === 'in_progress' || claimYear.status === 'changes_requested'

  async function handleRequestReview() {
    if (!canRequestReview) return
    setSubmitting(true)

    const supabase = createClient()

    // Create review record
    const { error: reviewError } = await supabase.from('reviews').insert({
      claim_year_id: yearId,
      requested_by: profileId,
    })

    if (reviewError) {
      toast.error(reviewError.message)
      setSubmitting(false)
      return
    }

    // Move claim to ready_for_review
    const { error: statusError } = await supabase
      .from('claim_years')
      .update({ status: 'ready_for_review', updated_at: new Date().toISOString() })
      .eq('id', yearId)

    if (statusError) {
      toast.error(statusError.message)
      setSubmitting(false)
      return
    }

    toast.success('Review requested')
    setSubmitting(false)
    router.refresh()
  }

  const totalCosts = costs.reduce((sum, c) => sum + Number(c.amount), 0)

  return (
    <div>
      <Toaster position="bottom-right" />

      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <p className="text-[12px] font-semibold uppercase tracking-[0.08em] text-blue">
            Claim Review
          </p>
          <StatusBadge status={claimYear.status} />
        </div>
        {isReviewable && (
          <button
            onClick={handleRequestReview}
            disabled={!canRequestReview || submitting}
            className="bg-blue text-white text-[14px] font-semibold py-2.5 px-6 rounded-[5px] hover:bg-blue-dark disabled:opacity-50 transition-colors"
          >
            {submitting ? 'Submitting...' : 'Request Review'}
          </button>
        )}
      </div>

      {/* Completeness Checklist */}
      <section className="mb-8">
        <p className="text-[13px] font-semibold text-[#1A1A1A] mb-4">Completeness Checklist</p>
        <CompletenessChecklist items={checks} />
      </section>

      {/* Summary */}
      <section className="mb-8">
        <p className="text-[13px] font-semibold text-[#1A1A1A] mb-4">Claim Summary</p>
        <div className="bg-white border border-[#E5E5E5] rounded-[6px] p-6">
          <div className="grid grid-cols-4 gap-6 text-center">
            <div>
              <p className="text-[24px] font-serif text-[#1A1A1A]">{projects.length}</p>
              <p className="text-[12px] text-[#5A5A5A]">Projects</p>
            </div>
            <div>
              <p className="text-[24px] font-serif text-[#1A1A1A]">{costs.length}</p>
              <p className="text-[12px] text-[#5A5A5A]">Cost Items</p>
            </div>
            <div>
              <p className="text-[24px] font-serif text-[#1A1A1A]">{evidence.length}</p>
              <p className="text-[12px] text-[#5A5A5A]">Evidence Items</p>
            </div>
            <div>
              <p className="text-[24px] font-serif text-[#1A1A1A]">
                ${totalCosts.toLocaleString('en-CA', { minimumFractionDigits: 0 })}
              </p>
              <p className="text-[12px] text-[#5A5A5A]">Total Expenditures</p>
            </div>
          </div>
        </div>
      </section>

      {/* T661 Previews */}
      <section>
        <p className="text-[13px] font-semibold text-[#1A1A1A] mb-4">T661 Narratives</p>
        <div className="space-y-6">
          {projects.map((project) => (
            <div key={project.id} className="bg-white border border-[#E5E5E5] rounded-[6px] p-8">
              <T661Preview project={project} />
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}

function runCompletenessChecks(
  company: { name: string; legal_name: string | null; bn: string | null; address: Record<string, string> | null },
  projects: { id: string; objective: string | null; uncertainty: string | null; work_done: string | null; advancement: string | null }[],
  costs: { project_id: string; amount: number }[],
  evidence: { project_id: string }[],
  files: { category: string }[]
) {
  const checks = []

  // Company profile complete
  const companyComplete = !!(company.name && company.legal_name && company.bn && company.address)
  checks.push({
    label: 'Company profile is complete',
    passed: companyComplete,
    detail: companyComplete ? undefined : 'Missing: ' + [
      !company.legal_name && 'legal name',
      !company.bn && 'business number',
      !company.address && 'address',
    ].filter(Boolean).join(', '),
  })

  // At least 1 project
  checks.push({
    label: 'At least one project',
    passed: projects.length > 0,
  })

  // Every project has all 4 T661 fields
  const projectsWithNarratives = projects.filter(
    (p) => p.objective && p.uncertainty && p.work_done && p.advancement
  )
  checks.push({
    label: 'All projects have complete T661 narratives',
    passed: projects.length > 0 && projectsWithNarratives.length === projects.length,
    detail: projects.length > 0
      ? `${projectsWithNarratives.length}/${projects.length} complete`
      : undefined,
  })

  // Every project has at least 1 cost
  const projectsWithCosts = new Set(costs.map((c) => c.project_id))
  const allProjectsHaveCosts = projects.every((p) => projectsWithCosts.has(p.id))
  checks.push({
    label: 'Every project has at least one cost',
    passed: projects.length > 0 && allProjectsHaveCosts,
  })

  // Every project has at least 1 evidence
  const projectsWithEvidence = new Set(evidence.map((e) => e.project_id))
  const allProjectsHaveEvidence = projects.every((p) => projectsWithEvidence.has(p.id))
  checks.push({
    label: 'Every project has at least one evidence item',
    passed: projects.length > 0 && allProjectsHaveEvidence,
  })

  // Total expenditures > 0
  const totalExpenditure = costs.reduce((sum, c) => sum + Number(c.amount), 0)
  checks.push({
    label: 'Total qualified expenditures greater than $0',
    passed: totalExpenditure > 0,
    detail: `$${totalExpenditure.toLocaleString('en-CA', { minimumFractionDigits: 2 })}`,
  })

  // At least 1 payroll or accounting file
  const hasPayrollOrAccounting = files.some(
    (f) => f.category === 'payroll' || f.category === 'accounting'
  )
  checks.push({
    label: 'At least one payroll or accounting file uploaded',
    passed: hasPayrollOrAccounting,
  })

  return checks
}
