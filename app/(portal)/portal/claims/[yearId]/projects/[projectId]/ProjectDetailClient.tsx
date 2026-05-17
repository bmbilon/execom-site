'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import ProjectWizard from '@/components/portal/ProjectWizard'
import CostEntryForm from '@/components/portal/CostEntryForm'
import EvidencePanel from '@/components/portal/EvidencePanel'
import StatusBadge from '@/components/portal/StatusBadge'
import { Toaster } from 'sonner'

interface ProjectDetailProps {
  project: {
    id: string
    name: string
    code: string | null
    status: string
    objective: string | null
    uncertainty: string | null
    work_done: string | null
    advancement: string | null
    claim_year_id: string
    start_date: string | null
    end_date: string | null
  }
  yearId: string
  evidence: {
    id: string
    title: string
    evidence_type: string
    description: string | null
    file_id: string | null
    files: { file_name: string } | null
    sort_order: number
  }[]
  costs: {
    id: string
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
    source: string
  }[]
  availableFiles: {
    id: string
    file_name: string
    category: string
  }[]
}

export default function ProjectDetailClient({
  project,
  yearId,
  evidence,
  costs,
  availableFiles,
}: ProjectDetailProps) {
  const router = useRouter()
  const totalCosts = costs.reduce((sum, c) => sum + Number(c.amount), 0)

  return (
    <div>
      <Toaster position="bottom-right" />

      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          {project.code && (
            <span className="text-[12px] font-mono text-[#5A5A5A]">{project.code}</span>
          )}
          <h2 className="text-[1.25rem] font-serif text-[#1A1A1A]">{project.name}</h2>
        </div>
        <StatusBadge status={project.status} />
      </div>

      {/* T661 Narratives */}
      <section className="mb-10">
        <p className="text-[12px] font-semibold uppercase tracking-[0.08em] text-blue mb-4">
          T661 Narratives
        </p>
        <div className="bg-white border border-[#E5E5E5] rounded-[6px] p-8">
          <ProjectWizard
            projectId={project.id}
            claimYearId={yearId}
            initial={{
              objective: project.objective || '',
              uncertainty: project.uncertainty || '',
              work_done: project.work_done || '',
              advancement: project.advancement || '',
            }}
          />
        </div>
      </section>

      {/* Evidence */}
      <section className="mb-10">
        <p className="text-[12px] font-semibold uppercase tracking-[0.08em] text-blue mb-4">
          Evidence ({evidence.length})
        </p>
        <div className="bg-white border border-[#E5E5E5] rounded-[6px] p-8">
          <EvidencePanel
            projectId={project.id}
            claimYearId={yearId}
            evidence={evidence}
            availableFiles={availableFiles}
          />
        </div>
      </section>

      {/* Costs */}
      <section className="mb-10">
        <div className="flex items-center justify-between mb-4">
          <p className="text-[12px] font-semibold uppercase tracking-[0.08em] text-blue">
            Costs ({costs.length})
          </p>
          {totalCosts > 0 && (
            <span className="text-[14px] font-semibold text-[#1A1A1A]">
              ${totalCosts.toLocaleString('en-CA', { minimumFractionDigits: 2 })}
            </span>
          )}
        </div>

        {/* Existing costs */}
        {costs.length > 0 && (
          <div className="space-y-2 mb-6">
            {costs.map((cost) => (
              <div
                key={cost.id}
                className="bg-white border border-[#E5E5E5] rounded-[6px] px-5 py-4 flex items-center gap-4"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-[14px] text-[#1A1A1A] font-medium">{cost.description}</p>
                  <p className="text-[12px] text-[#5A5A5A]">
                    {cost.cost_type}
                    {cost.employee_name && `, ${cost.employee_name}`}
                    {cost.vendor_name && `, ${cost.vendor_name}`}
                  </p>
                </div>
                <span className="text-[14px] font-mono text-[#1A1A1A]">
                  ${Number(cost.amount).toLocaleString('en-CA', { minimumFractionDigits: 2 })}
                </span>
                {cost.hours && (
                  <span className="text-[12px] text-[#5A5A5A]">{cost.hours}h</span>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Add cost form */}
        <div className="bg-white border border-[#E5E5E5] rounded-[6px] p-8">
          <p className="text-[13px] font-semibold text-[#1A1A1A] mb-4">Add Cost</p>
          <CostEntryForm
            projectId={project.id}
            claimYearId={yearId}
            onSaved={() => router.refresh()}
          />
        </div>
      </section>

      {/* Summary Preview */}
      <section>
        <p className="text-[12px] font-semibold uppercase tracking-[0.08em] text-blue mb-4">
          Summary
        </p>
        <div className="bg-white border border-[#E5E5E5] rounded-[6px] p-8">
          <div className="grid grid-cols-3 gap-6 text-center">
            <div>
              <p className="text-[24px] font-serif text-[#1A1A1A]">{costs.length}</p>
              <p className="text-[12px] text-[#5A5A5A] mt-1">Cost items</p>
            </div>
            <div>
              <p className="text-[24px] font-serif text-[#1A1A1A]">{evidence.length}</p>
              <p className="text-[12px] text-[#5A5A5A] mt-1">Evidence items</p>
            </div>
            <div>
              <p className="text-[24px] font-serif text-[#1A1A1A]">
                ${totalCosts.toLocaleString('en-CA', { minimumFractionDigits: 0 })}
              </p>
              <p className="text-[12px] text-[#5A5A5A] mt-1">Total costs</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
