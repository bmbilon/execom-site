'use client'

import { useState } from 'react'
import { createClient } from '@/lib/portal/supabase-client'
import { useRouter } from 'next/navigation'
import StatusBadge from '@/components/portal/StatusBadge'
import T661Preview from '@/components/portal/T661Preview'
import ReviewCommentThread from '@/components/portal/ReviewCommentThread'
import { Toaster, toast } from 'sonner'

interface ReviewWorkspaceProps {
  review: { id: string; status: string; notes: string | null; claim_year_id: string }
  claimYear: { id: string; fiscal_year: number; status: string }
  company: { name: string; legal_name: string | null }
  projects: {
    id: string; name: string; code: string | null; status: string
    objective: string | null; uncertainty: string | null; work_done: string | null; advancement: string | null
  }[]
  costs: { id: string; project_id: string; cost_type: string; description: string; amount: number }[]
  evidence: { id: string; project_id: string; title: string; evidence_type: string; files: { file_name: string } | null }[]
  comments: {
    id: string; comment: string; target_type: string | null; target_id: string | null
    created_at: string; profiles: { full_name: string } | null
  }[]
  reviewerId: string
}

export default function ReviewWorkspaceClient({
  review,
  claimYear,
  company,
  projects,
  costs,
  evidence,
  comments,
  reviewerId,
}: ReviewWorkspaceProps) {
  const [acting, setActing] = useState(false)
  const router = useRouter()

  async function pickUpReview() {
    setActing(true)
    const supabase = createClient()

    await supabase
      .from('reviews')
      .update({ status: 'in_review', reviewer_id: reviewerId })
      .eq('id', review.id)

    await supabase
      .from('claim_years')
      .update({ status: 'under_review', updated_at: new Date().toISOString() })
      .eq('id', claimYear.id)

    toast.success('Review started')
    setActing(false)
    router.refresh()
  }

  async function requestChanges() {
    setActing(true)
    const supabase = createClient()

    await supabase
      .from('reviews')
      .update({ status: 'changes_requested' })
      .eq('id', review.id)

    await supabase
      .from('claim_years')
      .update({ status: 'changes_requested', updated_at: new Date().toISOString() })
      .eq('id', claimYear.id)

    toast.success('Changes requested')
    setActing(false)
    router.refresh()
  }

  async function approveReview() {
    setActing(true)
    const supabase = createClient()

    await supabase
      .from('reviews')
      .update({ status: 'approved', resolved_at: new Date().toISOString() })
      .eq('id', review.id)

    await supabase
      .from('claim_years')
      .update({ status: 'approved', updated_at: new Date().toISOString() })
      .eq('id', claimYear.id)

    toast.success('Claim approved')
    setActing(false)
    router.refresh()
  }

  const totalCosts = costs.reduce((sum, c) => sum + Number(c.amount), 0)

  return (
    <div>
      <Toaster position="bottom-right" />

      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <p className="text-[12px] font-semibold uppercase tracking-[0.08em] text-blue mb-2">
            Review
          </p>
          <h1 className="text-[1.5rem] font-serif text-[#1A1A1A]">
            {company.name}, FY {claimYear.fiscal_year}
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <StatusBadge status={review.status} />
          {review.status === 'pending' && (
            <button
              onClick={pickUpReview}
              disabled={acting}
              className="bg-blue text-white text-[14px] font-semibold py-2.5 px-6 rounded-[5px] hover:bg-blue-dark disabled:opacity-50 transition-colors"
            >
              Pick Up Review
            </button>
          )}
          {review.status === 'in_review' && (
            <>
              <button
                onClick={requestChanges}
                disabled={acting}
                className="text-[14px] text-red-600 border border-red-300 px-5 py-2.5 rounded-[5px] hover:bg-red-50 disabled:opacity-50 transition-colors"
              >
                Request Changes
              </button>
              <button
                onClick={approveReview}
                disabled={acting}
                className="bg-emerald-600 text-white text-[14px] font-semibold py-2.5 px-6 rounded-[5px] hover:bg-emerald-700 disabled:opacity-50 transition-colors"
              >
                Approve
              </button>
            </>
          )}
        </div>
      </div>

      {/* Summary */}
      <div className="bg-white border border-[#E5E5E5] rounded-[6px] p-6 mb-8">
        <div className="grid grid-cols-3 gap-6 text-center">
          <div>
            <p className="text-[24px] font-serif text-[#1A1A1A]">{projects.length}</p>
            <p className="text-[12px] text-[#5A5A5A]">Projects</p>
          </div>
          <div>
            <p className="text-[24px] font-serif text-[#1A1A1A]">{costs.length}</p>
            <p className="text-[12px] text-[#5A5A5A]">Cost Items</p>
          </div>
          <div>
            <p className="text-[24px] font-serif text-[#1A1A1A]">
              ${totalCosts.toLocaleString('en-CA', { minimumFractionDigits: 0 })}
            </p>
            <p className="text-[12px] text-[#5A5A5A]">Total Expenditures</p>
          </div>
        </div>
      </div>

      {/* Per-project review */}
      {projects.map((project) => {
        const projectCosts = costs.filter((c) => c.project_id === project.id)
        const projectEvidence = evidence.filter((e) => e.project_id === project.id)
        const projectComments = comments.filter(
          (c) => c.target_type === 'project' && c.target_id === project.id
        )

        return (
          <div key={project.id} className="bg-white border border-[#E5E5E5] rounded-[6px] p-8 mb-6">
            <T661Preview project={project} />

            <div className="mt-6 border-t border-[#E5E5E5] pt-6">
              <p className="text-[12px] font-semibold uppercase tracking-[0.08em] text-blue mb-3">
                Costs ({projectCosts.length})
              </p>
              {projectCosts.map((cost) => (
                <div key={cost.id} className="flex justify-between py-1 text-[13px]">
                  <span className="text-[#1A1A1A]">{cost.description}</span>
                  <span className="text-[#1A1A1A] font-mono">
                    ${Number(cost.amount).toLocaleString('en-CA', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              ))}
            </div>

            <div className="mt-4 border-t border-[#E5E5E5] pt-4">
              <p className="text-[12px] font-semibold uppercase tracking-[0.08em] text-blue mb-3">
                Evidence ({projectEvidence.length})
              </p>
              {projectEvidence.map((ev) => (
                <p key={ev.id} className="text-[13px] text-[#5A5A5A] py-0.5">
                  {ev.evidence_type}: {ev.title}
                  {ev.files && ` (${ev.files.file_name})`}
                </p>
              ))}
            </div>

            {/* Comments */}
            <div className="mt-4 border-t border-[#E5E5E5] pt-4">
              <ReviewCommentThread
                reviewId={review.id}
                targetType="project"
                targetId={project.id}
                comments={projectComments}
              />
            </div>
          </div>
        )
      })}

      {/* General comments */}
      <div className="bg-white border border-[#E5E5E5] rounded-[6px] p-8">
        <p className="text-[12px] font-semibold uppercase tracking-[0.08em] text-blue mb-4">
          General Comments
        </p>
        <ReviewCommentThread
          reviewId={review.id}
          targetType="general"
          targetId={null}
          comments={comments.filter((c) => c.target_type === 'general' || !c.target_type)}
        />
      </div>
    </div>
  )
}
