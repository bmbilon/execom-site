import Link from 'next/link'

// Server component — runs on the request, no 'use client'. Lets us hit
// Supabase directly from the dashboard without a network round-trip.
import { createServerSupabaseClient } from '@/lib/portal/supabase-server'

interface OwnerDashboardProps {
  fullName: string
}

// One config row per workflow tile so adding/reordering tiles stays a
// single-file change. `table` + `submittedColumn` describe how to count
// queue rows; for workflows without a table yet, leave them null and the
// tile renders a "coming soon" badge.
const QUEUES: ReadonlyArray<{
  key: string
  title: string
  description: string
  href: string
  // Supabase table to count from. null = workflow not implemented yet.
  table: string | null
  // Column to use for the "new this week" badge. null = skip badge.
  submittedColumn: string | null
  // Optional filter: status column must equal one of these values. Lets us
  // count only "real" submissions, not drafts.
  statusColumn?: string
  countableStatuses?: string[]
}> = [
  {
    key: 'prototype',
    title: 'Prototype Applications',
    description: 'Founder readiness assessments waiting for triage and scoring follow-up.',
    href: '/portal/admin/prototype-readiness',
    table: 'prototype_assessments',
    submittedColumn: 'submitted_at',
    statusColumn: 'status',
    countableStatuses: ['submitted', 'reviewing', 'contacted'],
  },
  {
    key: 'sred',
    title: 'SR&ED Applications',
    description: 'Open claim years across all clients, draft through review.',
    href: '/portal/admin/sred',
    table: 'claim_years',
    submittedColumn: 'created_at',
  },
  {
    key: 'corp_setup',
    title: 'Corporate Setup Requests',
    description: 'Incorporation intakes from clients setting up a Canadian corp.',
    href: '/portal/admin/incorporations',
    table: 'incorporation_intakes',
    submittedColumn: 'created_at',
  },
  {
    key: 'trademarks',
    title: 'Trademark Applications',
    description: 'Canadian and US trademark filings pending review or action.',
    href: '/portal/admin/trademarks',
    table: 'trademark_intakes',
    submittedColumn: 'created_at',
  },
  {
    key: 'ip_assignment',
    title: 'IP Assignment Requests',
    description: 'IP transfer / assignment matters waiting on documentation.',
    href: '/portal/admin/ip-transfers',
    table: 'ip_transfer_intakes',
    submittedColumn: 'created_at',
  },
  {
    key: 'concept_validation',
    title: 'Concept Validation Submissions',
    description: 'Concept validation workflow — not yet shipping to founders.',
    href: '/portal/admin/concept-validation',
    table: null,
    submittedColumn: null,
  },
  {
    key: 'business_planning',
    title: 'Business Planning Submissions',
    description: 'Business planning workflow — not yet shipping to founders.',
    href: '/portal/admin/business-planning',
    table: null,
    submittedColumn: null,
  },
]

interface QueueCount {
  total: number
  newThisWeek: number
  comingSoon: boolean
}

async function countQueue(
  supabase: ReturnType<typeof createServerSupabaseClient>,
  q: (typeof QUEUES)[number],
): Promise<QueueCount> {
  if (!q.table) return { total: 0, newThisWeek: 0, comingSoon: true }

  const sevenDaysAgo = new Date(
    Date.now() - 7 * 24 * 60 * 60 * 1000,
  ).toISOString()

  try {
    // Total count
    let totalQuery = supabase.from(q.table).select('id', { count: 'exact', head: true })
    if (q.statusColumn && q.countableStatuses?.length) {
      totalQuery = totalQuery.in(q.statusColumn, q.countableStatuses)
    }
    const { count: total } = await totalQuery

    // "New this week" — submissions whose submittedColumn is within the
    // last 7 days. Same status filter applies.
    let recentQuery = supabase.from(q.table).select('id', { count: 'exact', head: true })
    if (q.submittedColumn) {
      recentQuery = recentQuery.gte(q.submittedColumn, sevenDaysAgo)
    }
    if (q.statusColumn && q.countableStatuses?.length) {
      recentQuery = recentQuery.in(q.statusColumn, q.countableStatuses)
    }
    const { count: newThisWeek } = await recentQuery

    return {
      total: total ?? 0,
      newThisWeek: newThisWeek ?? 0,
      comingSoon: false,
    }
  } catch {
    // Table may not exist or the user may lack RLS read access. Fall back
    // to zeros rather than 500ing the whole dashboard.
    return { total: 0, newThisWeek: 0, comingSoon: false }
  }
}

export default async function OwnerDashboard({ fullName }: OwnerDashboardProps) {
  const supabase = createServerSupabaseClient()

  // Count all queues in parallel — Supabase queries are independent.
  const counts = await Promise.all(QUEUES.map((q) => countQueue(supabase, q)))

  const firstName = fullName ? fullName.split(' ')[0] : ''

  return (
    <div>
      <div className="mb-10">
        <h1 className="portal-title text-[1.75rem] font-serif mb-1">
          {firstName ? `Hi ${firstName},` : 'Hi there,'} here&apos;s what&apos;s in the queue.
        </h1>
        <p className="portal-body text-[14px]">
          Each tile opens a queue of submissions across all clients.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {QUEUES.map((q, i) => {
          const c = counts[i]
          return (
            <Link
              key={q.key}
              href={q.href}
              className="group dashboard-card block p-6"
            >
              <div className="relative z-[1] flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-4">
                    <span className="font-serif text-[28px] leading-none text-[#1A1A1A] tracking-tight">
                      {c.comingSoon ? '—' : c.total}
                    </span>
                    {c.comingSoon ? (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wide bg-gray-100 text-[#5A5A5A]">
                        Coming soon
                      </span>
                    ) : c.newThisWeek > 0 ? (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wide bg-emerald-100 text-emerald-700">
                        {c.newThisWeek} new
                      </span>
                    ) : null}
                  </div>

                  <h3 className="portal-title text-[15px] font-semibold mb-1.5 tracking-tight group-hover:text-[#195E8E] transition-colors">
                    {q.title}
                  </h3>
                  <p className="portal-body text-[13px]">
                    {q.description}
                  </p>
                </div>

                <svg
                  className="w-4 h-4 text-[#b8b8b0] mt-1 flex-shrink-0 group-hover:text-[#195E8E] group-hover:translate-x-0.5 transition-all"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M8.25 4.5l7.5 7.5-7.5 7.5"
                  />
                </svg>
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
