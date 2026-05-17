'use client'

import { useParams } from 'next/navigation'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/portal/supabase-client'
import {
  type IncorporationIntake,
  type IncorporationStatus,
  type ApprovedSnapshot,
  type MatterStatusEvent,
  type GeneratedArtifact,
  ADMIN_TRANSITIONS,
  STATUS_LABELS,
  STATUS_BADGE,
} from '@/lib/corp-setup/schema'
import {
  transitionStatus,
  createSnapshot,
  logStatusEvent,
} from '@/lib/services/incorporationService'

export default function ReviewIntakePage() {
  const params = useParams()
  const intakeId = params.intakeId as string
  const supabase = createClient()

  const [data, setData] = useState<IncorporationIntake | null>(null)
  const [events, setEvents] = useState<MatterStatusEvent[]>([])
  const [snapshots, setSnapshots] = useState<ApprovedSnapshot[]>([])
  const [artifacts, setArtifacts] = useState<GeneratedArtifact[]>([])
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [adminNotes, setAdminNotes] = useState('')
  const [changeMsg, setChangeMsg] = useState('')
  const [showChangeModal, setShowChangeModal] = useState(false)

  useEffect(() => {
    load()
  }, [intakeId]) // eslint-disable-line react-hooks/exhaustive-deps

  async function load() {
    setLoading(true)
    const { data: row } = await supabase
      .from('incorporation_intakes')
      .select('*')
      .eq('id', intakeId)
      .single()

    if (row) {
      setData(row as unknown as IncorporationIntake)
      setAdminNotes(row.admin_notes || '')

      // Load audit trail
      if (row.matter_id) {
        const [eventsRes, snapshotsRes, artifactsRes] = await Promise.all([
          supabase.from('matter_status_events').select('*').eq('matter_id', row.matter_id).order('created_at', { ascending: false }),
          supabase.from('approved_snapshots').select('*').eq('intake_id', intakeId).order('version', { ascending: false }),
          supabase.from('generated_artifacts').select('*').eq('intake_id', intakeId).order('generated_at', { ascending: false }),
        ])
        setEvents((eventsRes.data || []) as MatterStatusEvent[])
        setSnapshots((snapshotsRes.data || []) as ApprovedSnapshot[])
        setArtifacts((artifactsRes.data || []) as GeneratedArtifact[])
      }
    }
    setLoading(false)
  }

  async function transition(toStatus: IncorporationStatus, note?: string) {
    if (!data || !data.matter_id) return
    setUpdating(true)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return
      const userId = session.user.id

      // Use service layer, enforces transition rules and creates audit trail
      await transitionStatus(
        supabase,
        intakeId,
        data.matter_id,
        toStatus,
        userId,
        note || `Admin: ${data.status} → ${toStatus}`,
        toStatus === 'changes_requested' ? changeMsg : undefined
      )

      // If approving, create snapshot via service layer
      // (service checks status === 'approved_for_generation' and computes payload hash)
      if (toStatus === 'approved_for_generation') {
        await createSnapshot(supabase, intakeId, data.matter_id, userId)
      }

      setShowChangeModal(false)
      setChangeMsg('')
      await load()
    } finally {
      setUpdating(false)
    }
  }

  async function saveNotes() {
    if (!data) return
    await supabase.from('incorporation_intakes').update({ admin_notes: adminNotes }).eq('id', intakeId)
  }

  if (loading) return <p className="text-[13px] text-[#b8b8b0] py-12 text-center">Loading…</p>
  if (!data) return (
    <div className="py-12 text-center">
      <p className="text-[14px] text-[#5A5A5A] mb-4">Intake not found.</p>
      <Link href="/portal/admin/incorporations" className="text-[14px] text-[#195E8E] hover:underline">← Back</Link>
    </div>
  )

  const agent = (data.agent as any) || {}
  const directors = (Array.isArray(data.directors) ? data.directors : []) as any[]
  const declarant = (data.declarant as any) || {}
  const custom = data.custom_articles as any
  const corpName = data.proposed_name ? `${data.proposed_name} ${data.legal_element}` : 'Untitled'
  const allowedTransitions = ADMIN_TRANSITIONS[data.status] || []

  const Row = ({ label, value, flag }: { label: string; value: string | undefined | null; flag?: boolean }) => (
    <div className={`grid grid-cols-3 gap-4 py-2 border-b border-[#E5E5E5] last:border-0 ${flag ? 'bg-yellow-50 -mx-2 px-2 rounded' : ''}`}>
      <dt className="text-[13px] font-medium text-[#5A5A5A]">{label}</dt>
      <dd className="col-span-2 text-[13px] text-[#1A1A1A]">{value || <span className="text-red-400 text-[12px]">Missing</span>}</dd>
    </div>
  )

  const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <div className="mb-6">
      <h3 className="text-[12px] font-semibold uppercase tracking-[0.06em] text-[#195E8E] mb-2">{title}</h3>
      <div className="bg-white border border-[#E5E5E5] rounded-lg p-4"><dl>{children}</dl></div>
    </div>
  )

  return (
    <div>
      <nav className="text-[12px] text-[#b8b8b0] mb-6">
        <Link href="/portal/admin/incorporations" className="hover:text-[#195E8E] transition-colors">Incorporations</Link>
        <span className="mx-1.5">/</span>
        <span className="text-[#5A5A5A]">{corpName}</span>
      </nav>

      {/* Header + actions */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-[20px] font-semibold text-[#1A1A1A]">{corpName}</h1>
          <div className="flex items-center gap-3 mt-1">
            <span className={`text-[11px] font-medium px-2.5 py-1 rounded-full ${STATUS_BADGE[data.status]}`}>
              {STATUS_LABELS[data.status]}
            </span>
            <span className="text-[11px] text-[#b8b8b0]">ID: {intakeId.slice(0, 8)}</span>
          </div>
        </div>
        <div className="flex gap-2">
          {allowedTransitions.map((toStatus) => {
            if (toStatus === 'changes_requested') {
              return (
                <button key={toStatus} onClick={() => setShowChangeModal(true)} disabled={updating}
                  className="px-4 py-2 text-[12px] font-medium rounded bg-orange-500 hover:bg-orange-600 text-white transition-colors disabled:opacity-50">
                  Request Changes
                </button>
              )
            }
            const colors: Record<string, string> = {
              in_review: 'bg-yellow-500 hover:bg-yellow-600 text-white',
              approved_for_generation: 'bg-green-600 hover:bg-green-700 text-white',
              generated: 'bg-emerald-600 hover:bg-emerald-700 text-white',
              filed: 'bg-[#195E8E] hover:bg-[#144D75] text-white',
            }
            return (
              <button key={toStatus} onClick={() => transition(toStatus)} disabled={updating}
                className={`px-4 py-2 text-[12px] font-medium rounded transition-colors disabled:opacity-50 ${colors[toStatus] || 'bg-[#E5E5E5] text-[#5A5A5A]'}`}>
                {toStatus === 'in_review' && 'Begin Review'}
                {toStatus === 'approved_for_generation' && 'Approve & Snapshot'}
                {toStatus === 'generated' && 'Mark Generated'}
                {toStatus === 'filed' && 'Mark Filed'}
              </button>
            )
          })}
        </div>
      </div>

      {/* Change request modal */}
      {showChangeModal && (
        <div className="mb-6 p-4 bg-orange-50 border border-orange-200 rounded-lg">
          <p className="text-[13px] font-semibold text-orange-800 mb-2">Request Changes from Client</p>
          <textarea className="w-full rounded border border-orange-300 px-3 py-2 text-[13px] min-h-[80px] focus:outline-none focus:ring-1 focus:ring-orange-400" value={changeMsg} onChange={(e) => setChangeMsg(e.target.value)} placeholder="Describe what needs to be changed (the client will see this)…" />
          <div className="flex gap-2 mt-2">
            <button onClick={() => transition('changes_requested', changeMsg)} disabled={!changeMsg.trim() || updating} className="px-4 py-2 text-[12px] font-medium rounded bg-orange-500 text-white hover:bg-orange-600 disabled:opacity-50">Send Request</button>
            <button onClick={() => setShowChangeModal(false)} className="px-4 py-2 text-[12px] font-medium text-[#5A5A5A]">Cancel</button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-3 gap-6">
        {/* Left: intake data (2 cols) */}
        <div className="col-span-2">
          <Section title="Company Basics">
            <Row label="Corporate Name" value={corpName} />
            <Row label="Alt Name 1" value={data.alt_name_1} />
            <Row label="Alt Name 2" value={data.alt_name_2} />
            <Row label="Reserved Name" value={data.reserved_name} />
            <Row label="Fiscal Year End" value={data.fiscal_year_end} />
          </Section>

          <Section title="Registered Office">
            <Row label="Street" value={data.reg_street} flag={!data.reg_street} />
            <Row label="City" value={data.reg_city} flag={!data.reg_city} />
            <Row label="Province" value={data.reg_province} flag={data.reg_province?.toLowerCase() !== 'alberta'} />
            <Row label="Postal Code" value={data.reg_postal_code} flag={!data.reg_postal_code} />
            <Row label="Mailing" value={data.mailing_same_as_reg ? 'Same as registered office' : `${data.mail_po_box || ''}, ${data.mail_city || ''}, ${data.mail_province || ''} ${data.mail_postal_code || ''}`} />
          </Section>

          <Section title="Agent for Service">
            <Row label="Name" value={`${agent.first_name || ''} ${agent.last_name || ''}`} flag={!agent.first_name || !agent.last_name} />
            <Row label="Firm" value={agent.firm} />
            <Row label="Email" value={agent.email} flag={!agent.email} />
            <Row label="Address" value={`${agent.street || ''}, ${agent.city || ''}, ${agent.province || ''} ${agent.postal_code || ''}`} flag={!agent.street} />
          </Section>

          <Section title="Directors">
            <Row label="Structure" value={data.director_structure === 'fixed' ? `Fixed: ${data.director_fixed_number}` : `Range: ${data.director_min} – ${data.director_max}`} />
            {directors.map((d: any, i: number) => (
              <Row key={i} label={`Director ${i + 1}`} value={`${d.first_name || ''} ${d.middle_name || ''} ${d.last_name || ''}, ${d.street || ''}, ${d.city || ''}, ${d.province || ''} ${d.postal_code || ''}`} flag={!d.first_name || !d.last_name} />
            ))}
          </Section>

          <Section title="Contact / Declarant">
            <Row label="Name" value={declarant.full_name} flag={!declarant.full_name} />
            <Row label="Phone" value={declarant.phone} flag={!declarant.phone} />
            <Row label="Email" value={declarant.email} flag={!declarant.email} />
            <Row label="ID Type" value={declarant.id_type} />
          </Section>

          <Section title="Articles">
            <Row label="Choice" value={data.articles_choice === 'default' ? 'Default (registry agent)' : data.articles_choice === 'provided_own' ? 'Client providing own' : 'Custom (below)'} />
            {data.articles_choice === 'custom' && custom && (
              <>
                <Row label="Share Classes" value={custom.share_classes} flag={!custom.share_classes} />
                <Row label="Transfer Restrictions" value={custom.transfer_restrictions} />
                <Row label="Business Restrictions" value={custom.business_restrictions} />
                <Row label="Other Provisions" value={custom.other_provisions} />
              </>
            )}
          </Section>
        </div>

        {/* Right sidebar: notes, snapshots, artifacts, audit */}
        <div className="col-span-1 space-y-6">
          {/* Admin notes */}
          <div className="bg-white border border-[#E5E5E5] rounded-lg p-4">
            <h4 className="text-[12px] font-semibold uppercase tracking-[0.06em] text-[#5A5A5A] mb-2">Internal Notes</h4>
            <textarea className="w-full rounded border border-[#E5E5E5] px-3 py-2 text-[13px] min-h-[100px] focus:outline-none focus:ring-1 focus:ring-[#195E8E]" value={adminNotes} onChange={(e) => setAdminNotes(e.target.value)} placeholder="Internal notes (not visible to client)…" />
            <button onClick={saveNotes} className="mt-2 px-3 py-1.5 text-[12px] font-medium text-[#195E8E] hover:underline">Save Notes</button>
          </div>

          {/* Generation command */}
          {(data.status === 'approved_for_generation' || data.status === 'generated') && snapshots.length > 0 && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h4 className="text-[12px] font-semibold text-green-800 mb-2">Generate Filing PDF</h4>
              <code className="block text-[11px] font-mono bg-green-100 rounded p-2 break-all">
                python scripts/fill_ab_incorporation.py --snapshot {snapshots[0].id}
              </code>
              <p className="text-[11px] text-green-700 mt-1">Snapshot v{snapshots[0].version} · {new Date(snapshots[0].approved_at || '').toLocaleDateString('en-CA')}</p>
            </div>
          )}

          {/* Snapshots */}
          {snapshots.length > 0 && (
            <div className="bg-white border border-[#E5E5E5] rounded-lg p-4">
              <h4 className="text-[12px] font-semibold uppercase tracking-[0.06em] text-[#5A5A5A] mb-2">Approved Snapshots</h4>
              {snapshots.map((s) => (
                <div key={s.id} className="py-1.5 border-b border-[#E5E5E5] last:border-0">
                  <p className="text-[12px] text-[#1A1A1A] font-medium">v{s.version}</p>
                  <p className="text-[11px] text-[#b8b8b0]">{new Date(s.approved_at || '').toLocaleString('en-CA')}</p>
                </div>
              ))}
            </div>
          )}

          {/* Artifacts */}
          {artifacts.length > 0 && (
            <div className="bg-white border border-[#E5E5E5] rounded-lg p-4">
              <h4 className="text-[12px] font-semibold uppercase tracking-[0.06em] text-[#5A5A5A] mb-2">Generated Files</h4>
              {artifacts.map((a) => (
                <div key={a.id} className="py-1.5 border-b border-[#E5E5E5] last:border-0">
                  <p className="text-[12px] text-[#1A1A1A]">{a.artifact_type}</p>
                  <p className="text-[11px] text-[#b8b8b0]">v{a.version} · {new Date(a.generated_at || '').toLocaleString('en-CA')}</p>
                </div>
              ))}
            </div>
          )}

          {/* Audit trail */}
          <div className="bg-white border border-[#E5E5E5] rounded-lg p-4">
            <h4 className="text-[12px] font-semibold uppercase tracking-[0.06em] text-[#5A5A5A] mb-2">Activity</h4>
            {events.length === 0 ? (
              <p className="text-[12px] text-[#b8b8b0]">No activity yet.</p>
            ) : (
              events.map((ev) => (
                <div key={ev.id} className="py-1.5 border-b border-[#E5E5E5] last:border-0">
                  <p className="text-[12px] text-[#1A1A1A]">
                    <span className="font-medium">{ev.from_status}</span> → <span className="font-medium">{ev.to_status}</span>
                  </p>
                  {ev.note && <p className="text-[11px] text-[#5A5A5A]">{ev.note}</p>}
                  <p className="text-[11px] text-[#b8b8b0]">{new Date(ev.created_at || '').toLocaleString('en-CA')}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
