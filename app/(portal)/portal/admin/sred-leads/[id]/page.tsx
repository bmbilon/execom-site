// Reviewer desk — one SR&ED acquisition lead.
//
// Shows the applicant's answers, the deterministic result the server produced
// from them, and the staff-only purchase analysis: which gates passed, which
// blocked, the illustrative economics, and what is missing. Nothing on this
// page approves anything.

import { createServerSupabaseClient } from '@/lib/portal/supabase-server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { LANE_LABELS, type InternalResult, type Lane, type PublicResult } from '@/lib/sred/engine'
import type { LeadStatus } from '@/lib/sred/schema'
import LeadControls from './LeadControls'

export const dynamic = 'force-dynamic'

const LANE_BADGE: Record<Lane, string> = {
  purchase_review: 'bg-emerald-100 text-emerald-700',
  preparation_offer: 'bg-blue/10 text-blue',
  already_filed_review: 'bg-cream text-[#7a5a00]',
  technical_review: 'bg-amber-100 text-amber-700',
  not_ready: 'bg-gray-100 text-[#5A5A5A]',
}

function cad(n: number | null | undefined): string {
  if (n === null || n === undefined || Number.isNaN(n)) return '—'
  return new Intl.NumberFormat('en-CA', {
    style: 'currency',
    currency: 'CAD',
    maximumFractionDigits: 0,
  }).format(n)
}

interface AuditRow {
  id: string
  event: string
  note: string | null
  created_at: string
  actor: string | null
}

export default async function AdminSredLeadDetail({ params }: { params: { id: string } }) {
  const supabase = createServerSupabaseClient()

  const { data: row } = await supabase
    .from('sred_acquisition_leads')
    .select('*')
    .eq('id', params.id)
    .single()

  if (!row) notFound()

  const result = (row.result ?? {}) as PublicResult
  const internal = (row.internal ?? {}) as InternalResult
  const answers = (row.answers ?? {}) as Record<string, unknown>
  const contact = (row.contact ?? {}) as Record<string, string>
  const attribution = (row.attribution ?? {}) as Record<string, string>

  const { data: auditRows } = await supabase
    .from('sred_acquisition_audit')
    .select('id, event, note, created_at, actor')
    .eq('lead_id', params.id)
    .order('created_at', { ascending: false })
    .limit(50)

  const audit = (auditRows ?? []) as AuditRow[]
  const lane = (row.lane ?? 'not_ready') as Lane

  return (
    <div className="max-w-[900px]">
      <Link
        href="/portal/admin/sred-leads"
        className="inline-flex items-center gap-1 text-[13px] text-[#5A5A5A] hover:text-blue mb-6"
      >
        <ArrowLeft size={14} /> Back to the queue
      </Link>

      <div className="mb-8">
        <div className="flex flex-wrap items-center gap-3 mb-2">
          <span
            className={`inline-block rounded-full px-2.5 py-1 text-[12px] font-medium ${LANE_BADGE[lane]}`}
          >
            {LANE_LABELS[lane]}
          </span>
          <span className="inline-block rounded-full bg-gray-100 px-2.5 py-1 text-[12px] font-medium text-[#5A5A5A]">
            {String(row.status).replace(/_/g, ' ')}
          </span>
          <span className="text-[12px] text-[#8a8a82]">
            policy {row.policy_version} · v{row.version}
          </span>
        </div>
        <h1 className="text-[1.75rem] font-serif text-[#1A1A1A]">
          {row.company_name ?? 'Unnamed company'}
        </h1>
        <p className="mt-1 text-[14px] text-[#5A5A5A]">
          {contact.full_name} · {contact.email}
          {contact.phone ? ` · ${contact.phone}` : ''}
          {contact.role ? ` · ${contact.role}` : ''}
        </p>
        <p className="mt-1 text-[13px] text-[#8a8a82]">
          Requested: {row.requested ?? '—'} · consent {row.consent_version ?? '—'} · marketing{' '}
          {row.marketing_consent ? 'yes' : 'no'}
        </p>
      </div>

      {/* ── Purchase analysis ── */}
      <Panel title="Purchase analysis (staff only)">
        {internal.economics ? (
          <div className="grid sm:grid-cols-2 gap-4 mb-5">
            <Stat label="Face value reported" value={cad(internal.economics.faceValueCad)} />
            <Stat label="Modelled consideration" value={cad(internal.economics.paymentCad)} />
            <Stat label="Base contribution" value={cad(internal.economics.baseContributionCad)} />
            <Stat
              label="Stress contribution"
              value={cad(internal.economics.stressContributionCad)}
            />
          </div>
        ) : (
          <p className="text-[14px] text-[#5A5A5A] mb-5">
            No reported cash amount, so no economics were modelled.
          </p>
        )}

        {internal.economics && (
          <p className="text-[12px] leading-relaxed text-[#8a8a82] mb-5">
            {internal.economics.assumption} Floors: base{' '}
            {cad(internal.economics.minBaseContributionCad)}, stress{' '}
            {cad(internal.economics.minStressContributionCad)}.
          </p>
        )}

        {(internal.gates ?? []).length > 0 && (
          <div className="mb-5">
            <p className="text-[12px] font-semibold uppercase tracking-[0.08em] text-blue mb-2">
              Screening gates
            </p>
            <ul className="space-y-1.5">
              {internal.gates.map((g) => (
                <li key={g.id} className="flex gap-3 text-[14px]">
                  <span
                    aria-hidden
                    className={
                      g.unanswered
                        ? 'text-[#8a8a82]'
                        : g.passed
                          ? 'text-emerald-600'
                          : 'text-red-600'
                    }
                  >
                    {g.unanswered ? '–' : g.passed ? '✓' : '✕'}
                  </span>
                  <span className="text-[#1A1A1A]">
                    {g.label}
                    <span className="block text-[13px] text-[#5A5A5A]">{g.detail}</span>
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {(internal.purchaseBlockers ?? []).length > 0 && (
          <div>
            <p className="text-[12px] font-semibold uppercase tracking-[0.08em] text-red-700 mb-2">
              Blockers
            </p>
            <ul className="space-y-1.5">
              {internal.purchaseBlockers.map((b, i) => (
                <li key={i} className="text-[14px] text-[#5A5A5A]">
                  {b}
                </li>
              ))}
            </ul>
          </div>
        )}
      </Panel>

      {/* ── Result ── */}
      <Panel title="Result shown to the applicant">
        {result.estimate && (
          <p className="text-[15px] text-[#1A1A1A] mb-3">
            {result.estimate.low === result.estimate.high
              ? cad(result.estimate.high)
              : `${cad(result.estimate.low)} – ${cad(result.estimate.high)}`}{' '}
            <span className="text-[13px] text-[#8a8a82]">({result.estimate.kind})</span>
          </p>
        )}
        {result.deadline && (
          <p className="text-[13px] text-[#5A5A5A] mb-3">
            Indicative reporting deadline {result.deadline.iso}
            {result.deadline.passed ? ' (passed)' : ''}
          </p>
        )}
        <ul className="space-y-1.5 mb-4">
          {(result.reasons ?? []).map((r, i) => (
            <li key={i} className="text-[14px] text-[#5A5A5A]">
              {r}
            </li>
          ))}
        </ul>
        <p className="text-[12px] font-semibold uppercase tracking-[0.08em] text-blue mb-2">
          Documents still required
        </p>
        <ul className="space-y-1">
          {(result.missingDocuments ?? []).map((d, i) => (
            <li key={i} className="text-[14px] text-[#5A5A5A]">
              {d}
            </li>
          ))}
        </ul>
      </Panel>

      {/* ── Answers ── */}
      <Panel title="What the applicant entered">
        <dl className="grid sm:grid-cols-2 gap-x-6 gap-y-3">
          {Object.entries(answers).map(([k, v]) => (
            <div key={k}>
              <dt className="text-[12px] uppercase tracking-[0.06em] text-[#8a8a82]">
                {k.replace(/_/g, ' ')}
              </dt>
              <dd className="text-[14px] text-[#1A1A1A] break-words">
                {Array.isArray(v) ? v.join(', ') || '—' : String(v ?? '—')}
              </dd>
            </div>
          ))}
        </dl>
      </Panel>

      {/* ── Attribution ── */}
      <Panel title="Attribution">
        {Object.keys(attribution).length === 0 ? (
          <p className="text-[14px] text-[#5A5A5A]">Direct, no campaign parameters.</p>
        ) : (
          <dl className="grid sm:grid-cols-2 gap-x-6 gap-y-3">
            {Object.entries(attribution).map(([k, v]) => (
              <div key={k}>
                <dt className="text-[12px] uppercase tracking-[0.06em] text-[#8a8a82]">
                  {k.replace(/_/g, ' ')}
                </dt>
                <dd className="text-[14px] text-[#1A1A1A] break-words">{String(v)}</dd>
              </div>
            ))}
          </dl>
        )}
      </Panel>

      {/* ── Controls ── */}
      <Panel title="Move this lead">
        <LeadControls
          leadId={params.id}
          status={row.status as LeadStatus}
          version={row.version as number}
        />
      </Panel>

      {/* ── Audit ── */}
      <Panel title="Audit trail">
        {audit.length === 0 ? (
          <p className="text-[14px] text-[#5A5A5A]">Nothing recorded yet.</p>
        ) : (
          <ul className="space-y-3">
            {audit.map((a) => (
              <li key={a.id} className="border-l-2 border-[#E5E5E5] pl-4">
                <p className="text-[14px] text-[#1A1A1A]">{a.event}</p>
                {a.note && <p className="text-[13px] text-[#5A5A5A]">{a.note}</p>}
                <p className="text-[12px] text-[#8a8a82]">
                  {new Date(a.created_at).toLocaleString('en-CA')}
                  {a.actor ? ` · ${a.actor}` : ' · system'}
                </p>
              </li>
            ))}
          </ul>
        )}
      </Panel>
    </div>
  )
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-6 rounded-[5px] border border-[#E5E5E5] bg-white p-6">
      <h2 className="text-[13px] font-semibold uppercase tracking-[0.08em] text-blue mb-4">
        {title}
      </h2>
      {children}
    </section>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[12px] uppercase tracking-[0.06em] text-[#8a8a82]">{label}</p>
      <p className="text-[18px] text-[#1A1A1A]">{value}</p>
    </div>
  )
}
