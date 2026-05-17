'use client'

import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/portal/supabase-client'
import { STATUS_LABELS, STATUS_BADGE } from '@/lib/corp-setup/schema'
import type { CommercializationStatus } from '@/lib/corp-setup/schema'
import MatterTabs from '@/components/portal/matters/MatterTabs'

// ─── Workflow definitions ────────────────────────────────────

interface WorkflowDef {
  key: string
  label: string
  description: string
  intakeTable: string
  enabled: boolean
}

const WORKFLOWS: WorkflowDef[] = [
  {
    key: 'incorporation',
    label: 'Incorporation',
    description: 'Alberta Business Corporations Act filing',
    intakeTable: 'incorporation_intakes',
    enabled: true,
  },
  {
    key: 'ip-transfer',
    label: 'IP Assignment',
    description: 'Inventor-to-corporation intellectual property transfer',
    intakeTable: 'ip_transfer_intakes',
    enabled: true,
  },
  {
    key: 'trademark',
    label: 'Trademark Filing',
    description: 'Canada & US trademark application',
    intakeTable: 'trademark_intakes',
    enabled: true,
  },
  {
    key: 'licensing',
    label: 'Licensing Package',
    description: 'IP licensing agreement between entities',
    intakeTable: 'licensing_intakes',
    enabled: false,
  },
]

interface IntakeRef {
  id: string
  status: CommercializationStatus
}

export default function MatterTasksPage() {
  const params = useParams()
  const matterId = params.matterId as string

  const [matterName, setMatterName] = useState('')
  const [incIntakes, setIncIntakes] = useState<IntakeRef[]>([])
  const [ipIntakes, setIpIntakes] = useState<IntakeRef[]>([])
  const [tmIntakes, setTmIntakes] = useState<IntakeRef[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    ;(async () => {
      const supabase = createClient()
      const [mRes, iRes, ipRes, tmRes] = await Promise.all([
        supabase
          .from('commercialization_matters')
          .select('display_name')
          .eq('id', matterId)
          .single(),
        supabase
          .from('incorporation_intakes')
          .select('id, status')
          .eq('matter_id', matterId),
        supabase
          .from('ip_transfer_intakes')
          .select('id, status')
          .eq('matter_id', matterId),
        supabase
          .from('trademark_intakes')
          .select('id, status')
          .eq('matter_id', matterId),
      ])
      if (mRes.data) setMatterName(mRes.data.display_name)
      setIncIntakes((iRes.data || []) as IntakeRef[])
      setIpIntakes((ipRes.data || []) as IntakeRef[])
      setTmIntakes((tmRes.data || []) as IntakeRef[])
      setLoading(false)
    })()
  }, [matterId])

  return (
    <div>
      <nav className="text-[12px] text-[#b8b8b0] mb-4">
        <Link href="/portal/matters" className="hover:text-[#195E8E] transition-colors">
          Matters
        </Link>
        <span className="mx-1.5">/</span>
        <Link href={`/portal/matters/${matterId}`} className="hover:text-[#195E8E] transition-colors">
          {matterName || 'Matter'}
        </Link>
        <span className="mx-1.5">/</span>
        <span className="text-[#5A5A5A]">Tasks</span>
      </nav>

      <h1 className="text-[22px] font-semibold text-[#1A1A1A] mb-1">Tasks</h1>
      <p className="text-[14px] text-[#5A5A5A] mb-6">
        Workflows available for this matter.
      </p>

      <MatterTabs matterId={matterId} />

      {loading ? (
        <div className="py-12 text-center">
          <p className="text-[13px] text-[#b8b8b0]">Loading…</p>
        </div>
      ) : (
        <div className="space-y-3">
          {WORKFLOWS.map((wf) => {
            const intake =
              wf.key === 'incorporation' ? incIntakes[0] :
              wf.key === 'ip-transfer' ? ipIntakes[0] :
              wf.key === 'trademark' ? tmIntakes[0] :
              undefined
            const hasIntake = !!intake
            const badgeCls = intake
              ? STATUS_BADGE[intake.status] ?? 'bg-[#E5E5E5] text-[#5A5A5A]'
              : ''
            const statusLabel = intake
              ? STATUS_LABELS[intake.status] ?? intake.status
              : ''

            const href = wf.enabled
              ? hasIntake
                ? `/portal/matters/${matterId}/tasks/${wf.key}/${intake!.id}`
                : `/portal/matters/${matterId}/tasks/${wf.key}`
              : '#'

            return (
              <div
                key={wf.key}
                className={`portal-card px-5 py-4 transition-all ${
                  wf.enabled
                    ? 'hover:border-[#195E8E]/40 hover:shadow-sm'
                    : 'opacity-50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[14px] font-medium text-[#1A1A1A]">
                      {wf.label}
                    </p>
                    <p className="text-[12px] text-[#b8b8b0] mt-0.5">
                      {wf.description}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    {hasIntake && (
                      <span
                        className={`text-[11px] font-medium px-2.5 py-1 rounded-full ${badgeCls}`}
                      >
                        {statusLabel}
                      </span>
                    )}
                    {wf.enabled ? (
                      <Link
                        href={href}
                        className={`text-[13px] font-medium px-4 py-2 rounded transition-colors ${
                          hasIntake
                            ? 'text-[#195E8E] bg-[#195E8E]/5 hover:bg-[#195E8E]/10'
                            : 'text-white bg-[#195E8E] hover:bg-[#144D75]'
                        }`}
                      >
                        {hasIntake ? 'Continue' : 'Start'}
                      </Link>
                    ) : (
                      <span className="text-[12px] text-[#b8b8b0] italic">
                        Coming soon
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
