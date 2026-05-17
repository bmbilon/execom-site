import { createServerSupabaseClient } from '@/lib/portal/supabase-server'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

export const dynamic = 'force-dynamic'

// claim_years.status enum from migration 001. Order = workflow stage,
// drives the priority sort so the things waiting on execom action
// (under_review / ready_for_review / changes_requested) float up.
type ClaimStatus =
  | 'draft'
  | 'in_progress'
  | 'ready_for_review'
  | 'under_review'
  | 'changes_requested'
  | 'approved'
  | 'filed'

const STATUS_LABELS: Record<ClaimStatus, string> = {
  draft: 'Draft',
  in_progress: 'In progress',
  ready_for_review: 'Ready for review',
  under_review: 'Under review',
  changes_requested: 'Changes requested',
  approved: 'Approved',
  filed: 'Filed',
}

const STATUS_BADGE: Record<ClaimStatus, string> = {
  draft: 'bg-gray-100 text-[#5A5A5A]',
  in_progress: 'bg-blue/10 text-blue',
  ready_for_review: 'bg-amber-100 text-amber-700',
  under_review: 'bg-amber-100 text-amber-700',
  changes_requested: 'bg-red-100 text-red-700',
  approved: 'bg-emerald-100 text-emerald-700',
  filed: 'bg-emerald-100 text-emerald-700',
}

// Stages waiting on execom action — used for the "needs attention" count
// in the page header.
const NEEDS_ATTENTION: ClaimStatus[] = [
  'ready_for_review',
  'under_review',
  'changes_requested',
]

interface ClaimYearRow {
  id: string
  fiscal_year: number
  status: ClaimStatus
  created_at: string
  updated_at: string
  company: {
    id: string
    name: string | null
    legal_name: string | null
  } | null
}

export default async function AdminSredPage() {
  const supabase = createServerSupabaseClient()

  // Join claim_years to companies so the queue shows who the claim
  // belongs to. RLS allows execom_staff to read across all companies.
  const { data: rows } = await supabase
    .from('claim_years')
    .select(
      `
        id, fiscal_year, status, created_at, updated_at,
        company:companies ( id, name, legal_name )
      `,
    )
    .order('updated_at', { ascending: false })
    .limit(200)

  const list = ((rows ?? []) as unknown as ClaimYearRow[]).sort((a, b) => {
    const aWait = NEEDS_ATTENTION.includes(a.status) ? 0 : 1
    const bWait = NEEDS_ATTENTION.includes(b.status) ? 0 : 1
    if (aWait !== bWait) return aWait - bWait
    return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
  })

  const waitingCount = list.filter((r) => NEEDS_ATTENTION.includes(r.status))
    .length

  return (
    <div>
      <div className="mb-8">
        <p className="text-[12px] font-semibold uppercase tracking-[0.08em] text-blue mb-2">
          Admin · SR&amp;ED
        </p>
        <h1 className="portal-title text-[1.75rem] font-serif">
          SR&amp;ED Applications
        </h1>
        <p className="portal-body mt-2 text-[14px]">
          Active claim years across all clients.{' '}
          {waitingCount > 0
            ? `${waitingCount} ${waitingCount === 1 ? 'claim is' : 'claims are'} waiting on execom review.`
            : 'Nothing currently waiting on execom action.'}
        </p>
      </div>

      {list.length === 0 ? (
        <div className="portal-card p-8 text-center text-[14px] text-[#5A5A5A]">
          No SR&amp;ED submissions yet.
        </div>
      ) : (
        <div className="portal-card overflow-hidden">
          <table className="w-full text-[14px]">
            <thead className="bg-surface-raised">
              <tr className="text-left text-[11px] font-semibold uppercase tracking-[0.08em] text-[#5A5A5A]">
                <th className="px-5 py-3">Company</th>
                <th className="px-5 py-3">Fiscal year</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3">Last updated</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody>
              {list.map((row) => {
                const companyName =
                  row.company?.legal_name ||
                  row.company?.name ||
                  'Unknown company'
                return (
                  <tr
                    key={row.id}
                    className="border-t border-[#E5E5E5] hover:bg-surface-raised/50 transition-colors"
                  >
                    <td className="px-5 py-4">
                      <p className="font-medium text-[#1A1A1A]">{companyName}</p>
                    </td>
                    <td className="px-5 py-4 font-serif text-[16px] text-[#1A1A1A]">
                      FY{row.fiscal_year}
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold uppercase tracking-wide ${STATUS_BADGE[row.status] ?? 'bg-gray-100 text-[#5A5A5A]'}`}
                      >
                        {STATUS_LABELS[row.status] ?? row.status}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-[12px] text-[#5A5A5A]">
                      {new Date(row.updated_at).toLocaleDateString('en-CA')}
                    </td>
                    <td className="px-5 py-4 text-right">
                      <Link
                        href={`/portal/claims/${row.id}`}
                        className="inline-flex items-center gap-1 text-[13px] text-blue hover:underline"
                      >
                        Open
                        <ArrowRight className="h-3.5 w-3.5" />
                      </Link>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
