// Reviewer desk — SR&ED acquisition queue.
//
// The point of this page is that the two or three files worth buying are
// obvious at a glance, without the other lanes being hidden. Purchase
// candidates sort to the top and carry the only badge with any colour weight;
// everything else stays visible and readable underneath.

import { createServerSupabaseClient } from '@/lib/portal/supabase-server'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { LANE_LABELS, type Lane } from '@/lib/sred/engine'

export const dynamic = 'force-dynamic'

interface QueueRow {
  id: string
  company_name: string | null
  contact_name: string | null
  contact_email: string | null
  fiscal_year_end: string | null
  claim_stage: string | null
  province: string | null
  lane: Lane
  status: string
  priority: number
  requested: string | null
  policy_version: string
  version: number
  marketing_consent: boolean
  created_at: string
  updated_at: string
  estimate_low: number | null
  estimate_high: number | null
  estimate_kind: string | null
  blocker_count: number | null
  utm_source: string | null
  utm_campaign: string | null
}

const LANE_BADGE: Record<Lane, string> = {
  purchase_review: 'bg-emerald-100 text-emerald-700',
  preparation_offer: 'bg-blue/10 text-blue',
  already_filed_review: 'bg-cream text-[#7a5a00]',
  technical_review: 'bg-amber-100 text-amber-700',
  not_ready: 'bg-gray-100 text-[#5A5A5A]',
}

const STATUS_BADGE: Record<string, string> = {
  new: 'bg-blue/10 text-blue',
  triaged: 'bg-gray-100 text-[#5A5A5A]',
  awaiting_documents: 'bg-amber-100 text-amber-700',
  specialist_review: 'bg-amber-100 text-amber-700',
  purchase_underwriting: 'bg-emerald-100 text-emerald-700',
  preparation_offered: 'bg-cream text-[#7a5a00]',
  closed: 'bg-gray-200 text-[#5A5A5A]',
}

function cad(n: number | null): string {
  if (n === null || Number.isNaN(n)) return '—'
  return new Intl.NumberFormat('en-CA', {
    style: 'currency',
    currency: 'CAD',
    maximumFractionDigits: 0,
  }).format(n)
}

export default async function AdminSredLeadsPage() {
  const supabase = createServerSupabaseClient()

  const { data: rows, error } = await supabase
    .from('sred_acquisition_queue')
    .select('*')
    .order('priority', { ascending: false })
    .order('created_at', { ascending: false })
    .limit(200)

  const list = (rows ?? []) as QueueRow[]
  const purchase = list.filter((r) => r.lane === 'purchase_review')
  const others = list.filter((r) => r.lane !== 'purchase_review')
  const open = list.filter((r) => r.status !== 'closed')

  return (
    <div>
      <div className="mb-8">
        <p className="text-[12px] font-semibold uppercase tracking-[0.08em] text-blue mb-2">
          Admin · SR&amp;ED acquisition
        </p>
        <h1 className="text-[1.75rem] font-serif text-[#1A1A1A]">Claim acquisition queue</h1>
        <p className="mt-2 text-[14px] text-[#5A5A5A]">
          Leads from the public /sred assessor. Screening is indicative and every input is
          unverified. Nothing here is an approval, an offer, or a funding decision.
        </p>
        <p className="mt-3 text-[13px] text-[#5A5A5A]">
          {open.length} open · {purchase.length} potential purchase{purchase.length === 1 ? '' : 's'}
        </p>
      </div>

      {error && (
        <div className="mb-6 rounded-[5px] border border-amber-200 bg-amber-50 p-4 text-[14px] text-amber-800">
          Could not read the queue: {error.message}. If migration 019 has not been applied to this
          environment, that is expected.
        </div>
      )}

      {list.length === 0 && !error && (
        <div className="rounded-[5px] border border-[#E5E5E5] bg-white p-8 text-center">
          <p className="text-[15px] text-[#5A5A5A]">No assessments yet.</p>
        </div>
      )}

      {purchase.length > 0 && (
        <section className="mb-10">
          <h2 className="text-[13px] font-semibold uppercase tracking-[0.08em] text-emerald-700 mb-3">
            Potential purchases
          </h2>
          <LeadTable rows={purchase} />
        </section>
      )}

      {others.length > 0 && (
        <section>
          <h2 className="text-[13px] font-semibold uppercase tracking-[0.08em] text-[#5A5A5A] mb-3">
            Everything else
          </h2>
          <LeadTable rows={others} />
        </section>
      )}
    </div>
  )
}

function LeadTable({ rows }: { rows: QueueRow[] }) {
  return (
    <div className="overflow-x-auto rounded-[5px] border border-[#E5E5E5] bg-white">
      <table className="w-full min-w-[720px] text-left">
        <thead className="border-b border-[#E5E5E5]">
          <tr className="text-[12px] uppercase tracking-[0.06em] text-[#8a8a82]">
            <th className="px-4 py-3 font-semibold">Company</th>
            <th className="px-4 py-3 font-semibold">Lane</th>
            <th className="px-4 py-3 font-semibold">Status</th>
            <th className="px-4 py-3 font-semibold">Indicative cash</th>
            <th className="px-4 py-3 font-semibold">Blockers</th>
            <th className="px-4 py-3 font-semibold">Source</th>
            <th className="px-4 py-3" />
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.id} className="border-b border-[#F0F0EC] last:border-0 align-top">
              <td className="px-4 py-4">
                <p className="text-[15px] font-medium text-[#1A1A1A]">
                  {r.company_name ?? 'Unnamed'}
                </p>
                <p className="text-[13px] text-[#5A5A5A]">
                  {r.contact_name} · {r.contact_email}
                </p>
                <p className="text-[12px] text-[#8a8a82] mt-1">
                  {r.province} · FYE {r.fiscal_year_end ?? '—'} · {r.claim_stage}
                </p>
              </td>
              <td className="px-4 py-4">
                <span
                  className={`inline-block rounded-full px-2.5 py-1 text-[12px] font-medium ${LANE_BADGE[r.lane]}`}
                >
                  {LANE_LABELS[r.lane]}
                </span>
              </td>
              <td className="px-4 py-4">
                <span
                  className={`inline-block rounded-full px-2.5 py-1 text-[12px] font-medium ${
                    STATUS_BADGE[r.status] ?? 'bg-gray-100 text-[#5A5A5A]'
                  }`}
                >
                  {r.status.replace(/_/g, ' ')}
                </span>
              </td>
              <td className="px-4 py-4 text-[14px] text-[#1A1A1A] whitespace-nowrap">
                {r.estimate_low === r.estimate_high
                  ? cad(r.estimate_high)
                  : `${cad(r.estimate_low)} – ${cad(r.estimate_high)}`}
                <span className="block text-[12px] text-[#8a8a82]">{r.estimate_kind ?? '—'}</span>
              </td>
              <td className="px-4 py-4 text-[14px] text-[#5A5A5A]">{r.blocker_count ?? 0}</td>
              <td className="px-4 py-4 text-[13px] text-[#5A5A5A]">
                {r.utm_source ?? 'direct'}
                {r.utm_campaign && (
                  <span className="block text-[12px] text-[#8a8a82]">{r.utm_campaign}</span>
                )}
              </td>
              <td className="px-4 py-4">
                <Link
                  href={`/portal/admin/sred-leads/${r.id}`}
                  className="inline-flex items-center gap-1 text-[13px] font-medium text-blue hover:text-blue-dark"
                >
                  Open <ArrowRight size={14} />
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
