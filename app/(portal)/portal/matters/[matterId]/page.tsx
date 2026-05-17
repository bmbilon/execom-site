'use client'

import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/portal/supabase-client'
import { STATUS_LABELS, STATUS_BADGE } from '@/lib/corp-setup/schema'
import type { CommercializationStatus, ArtifactType } from '@/lib/corp-setup/schema'
import MatterTabs from '@/components/portal/matters/MatterTabs'

const TYPE_LABELS: Record<string, string> = {
  incorporation: 'Incorporation',
  ip_transfer: 'IP Transfer',
  trademark: 'Trademark',
  licensing: 'Licensing',
}

const ARTIFACT_LABELS: Record<string, string> = {
  alberta_incorporation_pdf: 'Alberta Incorporation Form',
  incorporation_package_docx: 'Incorporation Package',
  organizational_resolutions_docx: 'Organizational Resolutions',
  founder_subscription_docx: 'Founder Subscription Agreement',
}

interface MatterDetail {
  id: string
  matter_type: string
  display_name: string
  status: CommercializationStatus
  created_at: string
  updated_at: string
}

interface IntakeRef {
  id: string
  status: CommercializationStatus
  proposed_name?: string
}

interface SnapshotRef {
  id: string
  version: number
  approved_at: string
}

interface ArtifactRef {
  id: string
  artifact_type: string
  version: number
  generated_at: string
  status: string
}

interface StatusEvent {
  id: string
  from_status: string
  to_status: string
  changed_by: string
  note: string | null
  created_at: string
}

// ─── Main page (Overview) ────────────────────────────────────

export default function MatterOverviewPage() {
  const params = useParams()
  const matterId = params.matterId as string

  const [matter, setMatter] = useState<MatterDetail | null>(null)
  const [intakes, setIntakes] = useState<IntakeRef[]>([])
  const [snapshots, setSnapshots] = useState<SnapshotRef[]>([])
  const [artifacts, setArtifacts] = useState<ArtifactRef[]>([])
  const [events, setEvents] = useState<StatusEvent[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    ;(async () => {
      const supabase = createClient()

      const [mRes, iRes, sRes, aRes, eRes] = await Promise.all([
        supabase
          .from('commercialization_matters')
          .select('*')
          .eq('id', matterId)
          .single(),
        supabase
          .from('incorporation_intakes')
          .select('id, status, proposed_name')
          .eq('matter_id', matterId),
        supabase
          .from('approved_snapshots')
          .select('id, version, approved_at')
          .eq('matter_id', matterId)
          .order('version', { ascending: false }),
        supabase
          .from('generated_artifacts')
          .select('id, artifact_type, version, generated_at, status')
          .eq('matter_id', matterId)
          .order('generated_at', { ascending: false }),
        supabase
          .from('matter_status_events')
          .select('id, from_status, to_status, changed_by, note, created_at')
          .eq('matter_id', matterId)
          .order('created_at', { ascending: false })
          .limit(10),
      ])

      if (mRes.data) setMatter(mRes.data as MatterDetail)
      setIntakes((iRes.data || []) as IntakeRef[])
      setSnapshots((sRes.data || []) as SnapshotRef[])
      setArtifacts((aRes.data || []) as ArtifactRef[])
      setEvents((eRes.data || []) as StatusEvent[])
      setLoading(false)
    })()
  }, [matterId])

  if (loading) {
    return (
      <div className="py-12 text-center">
        <p className="text-[13px] text-[#b8b8b0]">Loading…</p>
      </div>
    )
  }

  if (!matter) {
    return (
      <div className="py-12 text-center">
        <p className="text-[14px] text-[#5A5A5A]">Matter not found.</p>
        <Link href="/portal/matters" className="text-[14px] text-[#195E8E] hover:underline mt-2 inline-block">
          ← Back to matters
        </Link>
      </div>
    )
  }

  const badgeCls = STATUS_BADGE[matter.status] ?? 'bg-[#E5E5E5] text-[#5A5A5A]'
  const statusLabel = STATUS_LABELS[matter.status] ?? matter.status
  const activeArtifacts = artifacts.filter((a) => a.status === 'generated')

  return (
    <div>
      {/* Header */}
      <nav className="text-[12px] text-[#b8b8b0] mb-4">
        <Link href="/portal/matters" className="hover:text-[#195E8E] transition-colors">
          Matters
        </Link>
        <span className="mx-1.5">/</span>
        <span className="text-[#5A5A5A]">{matter.display_name || 'Untitled'}</span>
      </nav>

      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-[22px] font-semibold text-[#1A1A1A]">
            {matter.display_name || 'Untitled Matter'}
          </h1>
          <p className="text-[13px] text-[#b8b8b0] mt-1">
            {TYPE_LABELS[matter.matter_type] ?? matter.matter_type}
            <span className="mx-1.5">·</span>
            Created {new Date(matter.created_at).toLocaleDateString('en-CA')}
          </p>
        </div>
        <span className={`text-[11px] font-medium px-2.5 py-1 rounded-full ${badgeCls}`}>
          {statusLabel}
        </span>
      </div>

      <MatterTabs matterId={matterId} />

      {/* Overview grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {/* Tasks card */}
        <Link
          href={`/portal/matters/${matterId}/tasks`}
          className="bg-white border border-[#E5E5E5] rounded-lg p-5 hover:border-[#195E8E]/40 hover:shadow-sm transition-all"
        >
          <p className="text-[11px] font-semibold uppercase tracking-[0.06em] text-[#b8b8b0] mb-1">
            Active Tasks
          </p>
          <p className="text-[28px] font-semibold text-[#1A1A1A]">
            {intakes.length}
          </p>
          <p className="text-[12px] text-[#b8b8b0] mt-1">
            {intakes.length === 1 ? '1 workflow' : `${intakes.length} workflows`}
          </p>
        </Link>

        {/* Snapshots card */}
        <Link
          href={`/portal/matters/${matterId}/documents`}
          className="bg-white border border-[#E5E5E5] rounded-lg p-5 hover:border-[#195E8E]/40 hover:shadow-sm transition-all"
        >
          <p className="text-[11px] font-semibold uppercase tracking-[0.06em] text-[#b8b8b0] mb-1">
            Approved Snapshots
          </p>
          <p className="text-[28px] font-semibold text-[#1A1A1A]">
            {snapshots.length}
          </p>
          <p className="text-[12px] text-[#b8b8b0] mt-1">
            {activeArtifacts.length} document{activeArtifacts.length !== 1 ? 's' : ''} generated
          </p>
        </Link>

        {/* Filings card */}
        <Link
          href={`/portal/matters/${matterId}/filings`}
          className="bg-white border border-[#E5E5E5] rounded-lg p-5 hover:border-[#195E8E]/40 hover:shadow-sm transition-all"
        >
          <p className="text-[11px] font-semibold uppercase tracking-[0.06em] text-[#b8b8b0] mb-1">
            Filings
          </p>
          <p className="text-[28px] font-semibold text-[#1A1A1A]">
            {artifacts.filter((a) => a.status === 'filed_copy').length}
          </p>
          <p className="text-[12px] text-[#b8b8b0] mt-1">
            {matter.status === 'filed' ? 'Filed' : 'Pending'}
          </p>
        </Link>
      </div>

      {/* Recent activity */}
      {events.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-[13px] font-semibold uppercase tracking-[0.06em] text-[#195E8E]">
              Recent Activity
            </h2>
            <Link
              href={`/portal/matters/${matterId}/activity`}
              className="text-[12px] text-[#195E8E] hover:underline"
            >
              View all →
            </Link>
          </div>
          <div className="space-y-2">
            {events.slice(0, 5).map((ev) => (
              <div
                key={ev.id}
                className="bg-white border border-[#E5E5E5] rounded px-4 py-3 text-[13px]"
              >
                <span className="text-[#5A5A5A]">
                  {STATUS_LABELS[ev.from_status as CommercializationStatus] ?? ev.from_status}
                </span>
                <span className="mx-1.5 text-[#b8b8b0]">→</span>
                <span className="text-[#1A1A1A] font-medium">
                  {STATUS_LABELS[ev.to_status as CommercializationStatus] ?? ev.to_status}
                </span>
                {ev.note && (
                  <span className="text-[#b8b8b0] ml-2">- {ev.note}</span>
                )}
                <span className="text-[#b8b8b0] float-right">
                  {new Date(ev.created_at).toLocaleDateString('en-CA')}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
