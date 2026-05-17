import { createServerSupabaseClient } from '@/lib/portal/supabase-server'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { PATH_LABELS, TIER_LABELS } from '@/lib/portal/prototype-readiness'

export const dynamic = 'force-dynamic'

interface QueueRow {
  id: string
  status: string
  founder_name: string | null
  founder_email: string | null
  company_name: string | null
  product_name: string | null
  internal_score: number | null
  internal_tier: keyof typeof TIER_LABELS | null
  recommended_path: keyof typeof PATH_LABELS | null
  submitted_at: string | null
  updated_at: string
  created_at: string
  user_full_name: string | null
  user_email: string | null
}

const STATUS_BADGE: Record<string, string> = {
  in_progress: 'bg-gray-100 text-[#5A5A5A]',
  submitted: 'bg-blue/10 text-blue',
  reviewing: 'bg-amber-100 text-amber-700',
  contacted: 'bg-cream text-[#7a5a00]',
  closed_won: 'bg-emerald-100 text-emerald-700',
  closed_lost: 'bg-gray-200 text-[#5A5A5A]',
  archived: 'bg-gray-100 text-[#b8b8b0]',
}

const TIER_BADGE: Record<string, string> = {
  high: 'bg-emerald-100 text-emerald-700',
  medium: 'bg-blue/10 text-blue',
  risky: 'bg-amber-100 text-amber-700',
  not_ready: 'bg-gray-100 text-[#5A5A5A]',
}

export default async function AdminPrototypeReadinessPage() {
  const supabase = createServerSupabaseClient()

  const { data: rows } = await supabase
    .from('prototype_assessment_queue')
    .select('*')
    .order('submitted_at', { ascending: false, nullsFirst: false })
    .order('updated_at', { ascending: false })
    .limit(200)

  const list = (rows ?? []) as QueueRow[]
  const submitted = list.filter((r) => r.status !== 'in_progress')
  const drafts = list.filter((r) => r.status === 'in_progress')

  return (
    <div>
      <div className="mb-8">
        <p className="text-[12px] font-semibold uppercase tracking-[0.08em] text-blue mb-2">
          Admin · Prototype Readiness
        </p>
        <h1 className="text-[1.75rem] font-serif text-[#1A1A1A]">
          Prototype Readiness Queue
        </h1>
        <p className="mt-2 text-[14px] text-[#5A5A5A]">
          Submitted assessments, scored internally. Founders only see a generic
          thank-you — score, tier, and recommended path are for execom staff.
        </p>
      </div>

      {/* Submitted */}
      <section className="mb-12">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-[1rem] font-serif text-[#1A1A1A]">
            Submitted ({submitted.length})
          </h2>
        </div>

        {submitted.length === 0 ? (
          <div className="bg-white border border-[#E5E5E5] rounded-[6px] p-8 text-center text-[14px] text-[#5A5A5A]">
            No submitted assessments yet.
          </div>
        ) : (
          <div className="bg-white border border-[#E5E5E5] rounded-[6px] overflow-hidden">
            <table className="w-full text-[14px]">
              <thead className="bg-surface-raised">
                <tr className="text-left text-[11px] font-semibold uppercase tracking-[0.08em] text-[#5A5A5A]">
                  <th className="px-5 py-3">Founder / Product</th>
                  <th className="px-5 py-3">Score</th>
                  <th className="px-5 py-3">Tier</th>
                  <th className="px-5 py-3">Recommended path</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3">Submitted</th>
                  <th className="px-5 py-3" />
                </tr>
              </thead>
              <tbody>
                {submitted.map((r) => (
                  <tr
                    key={r.id}
                    className="border-t border-[#E5E5E5] hover:bg-surface-raised/50 transition-colors"
                  >
                    <td className="px-5 py-4">
                      <p className="font-medium text-[#1A1A1A]">
                        {r.founder_name || r.user_full_name || '—'}
                      </p>
                      <p className="text-[12px] text-[#5A5A5A]">
                        {r.product_name || 'Untitled product'}
                        {r.company_name ? ` · ${r.company_name}` : ''}
                      </p>
                    </td>
                    <td className="px-5 py-4 font-serif text-[18px] text-[#1A1A1A]">
                      {r.internal_score ?? '—'}
                    </td>
                    <td className="px-5 py-4">
                      {r.internal_tier ? (
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold ${TIER_BADGE[r.internal_tier]}`}
                        >
                          {TIER_LABELS[r.internal_tier]}
                        </span>
                      ) : (
                        '—'
                      )}
                    </td>
                    <td className="px-5 py-4 text-[13px] text-[#1A1A1A]">
                      {r.recommended_path
                        ? PATH_LABELS[r.recommended_path]
                        : '—'}
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold uppercase tracking-wide ${STATUS_BADGE[r.status] ?? 'bg-gray-100 text-[#5A5A5A]'}`}
                      >
                        {r.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-[12px] text-[#5A5A5A]">
                      {r.submitted_at
                        ? new Date(r.submitted_at).toLocaleDateString('en-CA')
                        : '—'}
                    </td>
                    <td className="px-5 py-4 text-right">
                      <Link
                        href={`/portal/admin/prototype-readiness/${r.id}`}
                        className="inline-flex items-center gap-1 text-[13px] text-blue hover:underline"
                      >
                        Review
                        <ArrowRight className="h-3.5 w-3.5" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Drafts */}
      {drafts.length > 0 && (
        <section>
          <h2 className="text-[1rem] font-serif text-[#1A1A1A] mb-4">
            In-progress drafts ({drafts.length})
          </h2>
          <div className="bg-white border border-[#E5E5E5] rounded-[6px] overflow-hidden">
            <table className="w-full text-[14px]">
              <thead className="bg-surface-raised">
                <tr className="text-left text-[11px] font-semibold uppercase tracking-[0.08em] text-[#5A5A5A]">
                  <th className="px-5 py-3">Founder</th>
                  <th className="px-5 py-3">Product</th>
                  <th className="px-5 py-3">Last updated</th>
                  <th className="px-5 py-3" />
                </tr>
              </thead>
              <tbody>
                {drafts.map((r) => (
                  <tr key={r.id} className="border-t border-[#E5E5E5]">
                    <td className="px-5 py-4 text-[#1A1A1A]">
                      {r.founder_name || r.user_full_name || r.user_email || '—'}
                    </td>
                    <td className="px-5 py-4 text-[#1A1A1A]">
                      {r.product_name || '—'}
                    </td>
                    <td className="px-5 py-4 text-[12px] text-[#5A5A5A]">
                      {new Date(r.updated_at).toLocaleDateString('en-CA')}
                    </td>
                    <td className="px-5 py-4 text-right">
                      <Link
                        href={`/portal/admin/prototype-readiness/${r.id}`}
                        className="inline-flex items-center gap-1 text-[13px] text-blue hover:underline"
                      >
                        View
                        <ArrowRight className="h-3.5 w-3.5" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  )
}
