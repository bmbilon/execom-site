'use client'

import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/portal/supabase-client'
import {
  type CommercializationStatus,
  ADMIN_TRANSITIONS,
  STATUS_LABELS,
  STATUS_BADGE,
} from '@/lib/corp-setup/schema'
import {
  transitionStatus,
  createSnapshot,
  logStatusEvent,
} from '@/lib/services/ipTransferService'

const ASSET_TYPE_LABELS: Record<string, string> = {
  invention: 'Invention / Patent',
  software: 'Software / Source Code',
  design: 'Industrial Design',
  trade_secret: 'Trade Secret / Know-How',
  other: 'Other',
}

const CONSIDERATION_LABELS: Record<string, string> = {
  shares: 'Shares',
  cash: 'Cash',
  mixed: 'Mixed (Cash + Shares)',
  nominal: 'Nominal ($1.00)',
}

interface IntakeData {
  id: string
  matter_id: string
  user_id: string
  status: CommercializationStatus
  asset_title: string
  asset_type: string
  asset_description: string
  invention_date: string
  public_disclosure: boolean
  disclosure_details: string
  inventor_name: string
  inventor_email: string
  inventor_phone: string
  inventor_address: string
  assignee_corp_name: string
  assignee_corp_number: string
  consideration_type: string
  consideration_amount: string
  share_class: string
  num_shares: number
  patent_filed: boolean
  patent_app_number: string
  patent_jurisdiction: string
  prior_art_notes: string
  existing_agreements: string
  admin_notes: string
  change_request_message: string
  updated_at: string
}

interface SnapshotRef {
  id: string
  version: number
  approved_at: string
  payload_hash: string
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

export default function AdminIPTransferDetailPage() {
  const params = useParams()
  const intakeId = params.intakeId as string

  const [data, setData] = useState<IntakeData | null>(null)
  const [snapshots, setSnapshots] = useState<SnapshotRef[]>([])
  const [artifacts, setArtifacts] = useState<ArtifactRef[]>([])
  const [events, setEvents] = useState<StatusEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [notes, setNotes] = useState('')
  const [showChangeModal, setShowChangeModal] = useState(false)
  const [changeMsg, setChangeMsg] = useState('')

  useEffect(() => {
    ;(async () => {
      const supabase = createClient()
      const { data: intake } = await supabase
        .from('ip_transfer_intakes')
        .select('*')
        .eq('id', intakeId)
        .single()

      if (!intake) {
        setLoading(false)
        return
      }

      setData(intake as IntakeData)
      setNotes(intake.admin_notes || '')

      const matterId = intake.matter_id

      const [sRes, aRes, eRes] = await Promise.all([
        supabase
          .from('approved_snapshots')
          .select('id, version, approved_at, payload_hash')
          .eq('intake_id', intakeId)
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
          .order('created_at', { ascending: false }),
      ])

      setSnapshots((sRes.data || []) as SnapshotRef[])
      setArtifacts((aRes.data || []) as ArtifactRef[])
      setEvents((eRes.data || []) as StatusEvent[])
      setLoading(false)
    })()
  }, [intakeId])

  async function transition(
    toStatus: CommercializationStatus,
    note?: string
  ) {
    if (!data) return
    const supabase = createClient()
    const {
      data: { session },
    } = await supabase.auth.getSession()
    const userId = session?.user?.id
    if (!userId) return

    try {
      await transitionStatus(
        supabase,
        intakeId,
        data.matter_id,
        toStatus,
        userId,
        note,
        toStatus === 'changes_requested' ? changeMsg : undefined
      )

      if (toStatus === 'approved_for_generation') {
        await createSnapshot(supabase, intakeId, data.matter_id, userId)
      }

      // Reload
      window.location.reload()
    } catch (err) {
      console.error('Transition failed:', err)
      alert(`Transition failed: ${err}`)
    }
  }

  async function saveNotes() {
    const supabase = createClient()
    await supabase
      .from('ip_transfer_intakes')
      .update({ admin_notes: notes })
      .eq('id', intakeId)
  }

  if (loading) {
    return (
      <div className="py-12 text-center">
        <p className="text-[13px] text-[#b8b8b0]">Loading…</p>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="py-12 text-center">
        <p className="text-[14px] text-[#5A5A5A]">Intake not found.</p>
      </div>
    )
  }

  const allowedNext = ADMIN_TRANSITIONS[data.status] || []
  const latestSnapshot = snapshots[0]

  return (
    <div>
      <nav className="text-[12px] text-[#b8b8b0] mb-4">
        <Link
          href="/portal/admin/ip-transfers"
          className="hover:text-[#195E8E] transition-colors"
        >
          IP Transfers
        </Link>
        <span className="mx-1.5">/</span>
        <span className="text-[#5A5A5A]">
          {data.asset_title || 'Untitled'}
        </span>
      </nav>

      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-[22px] font-semibold text-[#1A1A1A]">
            {data.asset_title || 'Untitled IP Transfer'}
          </h1>
          <p className="text-[13px] text-[#b8b8b0] mt-1">
            {ASSET_TYPE_LABELS[data.asset_type] || data.asset_type}
            <span className="mx-1.5">·</span>
            {data.inventor_name} → {data.assignee_corp_name}
          </p>
        </div>
        <span
          className={`text-[11px] font-medium px-2.5 py-1 rounded-full ${STATUS_BADGE[data.status]}`}
        >
          {STATUS_LABELS[data.status]}
        </span>
      </div>

      {/* Admin actions */}
      {allowedNext.length > 0 && (
        <div className="flex gap-2 mb-6">
          {allowedNext.map((to) =>
            to === 'changes_requested' ? (
              <button
                key={to}
                onClick={() => setShowChangeModal(true)}
                className="px-4 py-2 text-[13px] font-medium rounded bg-orange-100 text-orange-800 hover:bg-orange-200 transition-colors"
              >
                Request Changes
              </button>
            ) : to === 'approved_for_generation' ? (
              <button
                key={to}
                onClick={() => transition(to, 'Approved and snapshot created')}
                className="px-4 py-2 text-[13px] font-medium rounded bg-green-100 text-green-800 hover:bg-green-200 transition-colors"
              >
                Approve & Snapshot
              </button>
            ) : (
              <button
                key={to}
                onClick={() => transition(to)}
                className="px-4 py-2 text-[13px] font-medium rounded bg-[#195E8E]/10 text-[#195E8E] hover:bg-[#195E8E]/20 transition-colors"
              >
                {STATUS_LABELS[to]}
              </button>
            )
          )}
        </div>
      )}

      {/* Change request modal */}
      {showChangeModal && (
        <div className="mb-6 p-4 bg-orange-50 border border-orange-200 rounded-lg">
          <p className="text-[13px] font-medium text-orange-800 mb-2">
            Message to client:
          </p>
          <textarea
            className="w-full rounded border border-orange-200 px-3 py-2 text-[13px]"
            rows={3}
            value={changeMsg}
            onChange={(e) => setChangeMsg(e.target.value)}
            placeholder="Describe what needs to be changed…"
          />
          <div className="flex gap-2 mt-2">
            <button
              onClick={() => {
                transition('changes_requested', 'Changes requested')
                setShowChangeModal(false)
              }}
              className="px-4 py-2 text-[13px] font-medium rounded bg-orange-600 text-white hover:bg-orange-700"
            >
              Send
            </button>
            <button
              onClick={() => setShowChangeModal(false)}
              className="px-4 py-2 text-[13px] text-[#5A5A5A]"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-3 gap-6">
        {/* Left: Intake data */}
        <div className="col-span-2 space-y-6">
          {/* Asset section */}
          <div className="bg-white border border-[#E5E5E5] rounded-lg p-5">
            <h2 className="text-[13px] font-semibold uppercase tracking-[0.06em] text-[#195E8E] mb-3">
              Asset Details
            </h2>
            <dl className="grid grid-cols-2 gap-x-8 gap-y-2 text-[13px]">
              <dt className="text-[#b8b8b0]">Title</dt>
              <dd className="text-[#1A1A1A]">{data.asset_title || '-'}</dd>
              <dt className="text-[#b8b8b0]">Type</dt>
              <dd className="text-[#1A1A1A]">
                {ASSET_TYPE_LABELS[data.asset_type] || data.asset_type}
              </dd>
              <dt className="text-[#b8b8b0]">Invention Date</dt>
              <dd className="text-[#1A1A1A]">
                {data.invention_date || '-'}
              </dd>
              <dt className="text-[#b8b8b0]">Public Disclosure</dt>
              <dd className="text-[#1A1A1A]">
                {data.public_disclosure ? 'Yes' : 'No'}
              </dd>
            </dl>
            {data.asset_description && (
              <div className="mt-3">
                <p className="text-[12px] text-[#b8b8b0]">Description</p>
                <p className="text-[13px] text-[#5A5A5A] mt-1">
                  {data.asset_description}
                </p>
              </div>
            )}
            {data.public_disclosure && data.disclosure_details && (
              <div className="mt-3">
                <p className="text-[12px] text-[#b8b8b0]">
                  Disclosure Details
                </p>
                <p className="text-[13px] text-[#5A5A5A] mt-1">
                  {data.disclosure_details}
                </p>
              </div>
            )}
          </div>

          {/* Parties section */}
          <div className="bg-white border border-[#E5E5E5] rounded-lg p-5">
            <h2 className="text-[13px] font-semibold uppercase tracking-[0.06em] text-[#195E8E] mb-3">
              Parties
            </h2>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <p className="text-[12px] font-medium text-[#b8b8b0] mb-2">
                  Inventor / Assignor
                </p>
                <dl className="space-y-1 text-[13px]">
                  <dd className="text-[#1A1A1A] font-medium">
                    {data.inventor_name || '-'}
                  </dd>
                  <dd className="text-[#5A5A5A]">
                    {data.inventor_email || ''}
                  </dd>
                  <dd className="text-[#5A5A5A]">
                    {data.inventor_phone || ''}
                  </dd>
                  <dd className="text-[#5A5A5A]">
                    {data.inventor_address || ''}
                  </dd>
                </dl>
              </div>
              <div>
                <p className="text-[12px] font-medium text-[#b8b8b0] mb-2">
                  Assignee Corporation
                </p>
                <dl className="space-y-1 text-[13px]">
                  <dd className="text-[#1A1A1A] font-medium">
                    {data.assignee_corp_name || '-'}
                  </dd>
                  <dd className="text-[#5A5A5A]">
                    {data.assignee_corp_number
                      ? `Corp #${data.assignee_corp_number}`
                      : ''}
                  </dd>
                </dl>
              </div>
            </div>
          </div>

          {/* Consideration section */}
          <div className="bg-white border border-[#E5E5E5] rounded-lg p-5">
            <h2 className="text-[13px] font-semibold uppercase tracking-[0.06em] text-[#195E8E] mb-3">
              Consideration & Filing
            </h2>
            <dl className="grid grid-cols-2 gap-x-8 gap-y-2 text-[13px]">
              <dt className="text-[#b8b8b0]">Type</dt>
              <dd className="text-[#1A1A1A]">
                {CONSIDERATION_LABELS[data.consideration_type] ||
                  data.consideration_type}
              </dd>
              {data.consideration_amount && (
                <>
                  <dt className="text-[#b8b8b0]">Amount</dt>
                  <dd className="text-[#1A1A1A]">
                    ${data.consideration_amount}
                  </dd>
                </>
              )}
              {data.num_shares && (
                <>
                  <dt className="text-[#b8b8b0]">Shares</dt>
                  <dd className="text-[#1A1A1A]">
                    {data.num_shares} {data.share_class || 'Common'}
                  </dd>
                </>
              )}
              <dt className="text-[#b8b8b0]">Patent Filed</dt>
              <dd className="text-[#1A1A1A]">
                {data.patent_filed ? 'Yes' : 'No'}
              </dd>
              {data.patent_filed && (
                <>
                  <dt className="text-[#b8b8b0]">Application</dt>
                  <dd className="text-[#1A1A1A]">
                    {data.patent_app_number || '-'}{' '}
                    {data.patent_jurisdiction &&
                      `(${data.patent_jurisdiction})`}
                  </dd>
                </>
              )}
            </dl>
            {data.prior_art_notes && (
              <div className="mt-3">
                <p className="text-[12px] text-[#b8b8b0]">Prior Art Notes</p>
                <p className="text-[13px] text-[#5A5A5A] mt-1">
                  {data.prior_art_notes}
                </p>
              </div>
            )}
            {data.existing_agreements && (
              <div className="mt-3">
                <p className="text-[12px] text-[#b8b8b0]">
                  Existing Agreements
                </p>
                <p className="text-[13px] text-[#5A5A5A] mt-1">
                  {data.existing_agreements}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Right: Admin sidebar */}
        <div className="space-y-6">
          {/* Internal notes */}
          <div className="bg-white border border-[#E5E5E5] rounded-lg p-4">
            <h3 className="text-[12px] font-semibold uppercase tracking-[0.06em] text-[#b8b8b0] mb-2">
              Internal Notes
            </h3>
            <textarea
              className="w-full rounded border border-[#E5E5E5] px-3 py-2 text-[13px] text-[#1A1A1A]"
              rows={4}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              onBlur={saveNotes}
              placeholder="Internal notes (not visible to client)…"
            />
          </div>

          {/* Generation command */}
          {latestSnapshot && (
            <div className="bg-white border border-[#E5E5E5] rounded-lg p-4">
              <h3 className="text-[12px] font-semibold uppercase tracking-[0.06em] text-[#b8b8b0] mb-2">
                Generate IP Docs
              </h3>
              <p className="text-[12px] text-[#5A5A5A] mb-2">
                Snapshot v{latestSnapshot.version},{' '}
                {new Date(latestSnapshot.approved_at).toLocaleDateString(
                  'en-CA'
                )}
              </p>
              <code className="block text-[11px] bg-[#F7F6EE] p-2 rounded text-[#1A1A1A] break-all">
                node scripts/generate_ip_transfer_docs.js --snapshot{' '}
                {latestSnapshot.id} --register
              </code>
            </div>
          )}

          {/* Snapshots */}
          <div className="bg-white border border-[#E5E5E5] rounded-lg p-4">
            <h3 className="text-[12px] font-semibold uppercase tracking-[0.06em] text-[#b8b8b0] mb-2">
              Approved Snapshots
            </h3>
            {snapshots.length === 0 ? (
              <p className="text-[12px] text-[#b8b8b0]">None yet</p>
            ) : (
              <div className="space-y-2">
                {snapshots.map((s) => (
                  <div
                    key={s.id}
                    className="text-[12px] flex justify-between"
                  >
                    <span className="text-[#1A1A1A]">v{s.version}</span>
                    <span className="text-[#b8b8b0]">
                      {new Date(s.approved_at).toLocaleDateString('en-CA')}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Artifacts */}
          <div className="bg-white border border-[#E5E5E5] rounded-lg p-4">
            <h3 className="text-[12px] font-semibold uppercase tracking-[0.06em] text-[#b8b8b0] mb-2">
              Generated Files
            </h3>
            {artifacts.length === 0 ? (
              <p className="text-[12px] text-[#b8b8b0]">None yet</p>
            ) : (
              <div className="space-y-2">
                {artifacts.map((a) => (
                  <div
                    key={a.id}
                    className="text-[12px] flex justify-between"
                  >
                    <span className="text-[#1A1A1A]">
                      {a.artifact_type.replace(/_/g, ' ')}
                    </span>
                    <span className="text-[#b8b8b0]">v{a.version}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Activity log */}
          <div className="bg-white border border-[#E5E5E5] rounded-lg p-4">
            <h3 className="text-[12px] font-semibold uppercase tracking-[0.06em] text-[#b8b8b0] mb-2">
              Activity
            </h3>
            {events.length === 0 ? (
              <p className="text-[12px] text-[#b8b8b0]">No activity yet</p>
            ) : (
              <div className="space-y-2">
                {events.map((ev) => (
                  <div key={ev.id} className="text-[12px]">
                    <span className="text-[#5A5A5A]">
                      {STATUS_LABELS[ev.from_status as CommercializationStatus] ?? ev.from_status}
                    </span>
                    <span className="mx-1 text-[#b8b8b0]">→</span>
                    <span className="text-[#1A1A1A] font-medium">
                      {STATUS_LABELS[ev.to_status as CommercializationStatus] ?? ev.to_status}
                    </span>
                    {ev.note && (
                      <p className="text-[#b8b8b0] mt-0.5">{ev.note}</p>
                    )}
                    <p className="text-[#b8b8b0]">
                      {new Date(ev.created_at).toLocaleString('en-CA')}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
