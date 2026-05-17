'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/portal/supabase-client'
import {
  type IncorporationStatus,
  STATUS_LABELS,
  STATUS_BADGE,
  INCORPORATION_STATUSES,
} from '@/lib/corp-setup/schema'

interface IntakeRow {
  id: string
  proposed_name: string
  legal_element: string
  status: IncorporationStatus
  updated_at: string
  declarant: { full_name?: string } | null
}

// Priority sort: submitted first, then in_review, etc.
const PRIORITY_ORDER: IncorporationStatus[] = [
  'submitted', 'in_review', 'changes_requested',
  'approved_for_generation', 'generated', 'draft', 'filed',
]

export default function AdminIncorporationsPage() {
  const [rows, setRows] = useState<IntakeRow[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<string>('all')

  useEffect(() => {
    ;(async () => {
      const supabase = createClient()
      const { data } = await supabase
        .from('incorporation_intakes')
        .select('id, proposed_name, legal_element, status, updated_at, declarant')
        .order('updated_at', { ascending: false })
      const sorted = (data || []).sort(
        (a: any, b: any) =>
          PRIORITY_ORDER.indexOf(a.status) - PRIORITY_ORDER.indexOf(b.status)
      )
      setRows(sorted as IntakeRow[])
      setLoading(false)
    })()
  }, [])

  const filtered = filter === 'all' ? rows : rows.filter((r) => r.status === filter)
  const counts = INCORPORATION_STATUSES.reduce((acc, s) => {
    acc[s] = rows.filter((r) => r.status === s).length
    return acc
  }, {} as Record<string, number>)

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-[20px] font-semibold text-[#1A1A1A]">Incorporations, Review Queue</h1>
        <p className="text-[13px] text-[#5A5A5A] mt-1">Review client submissions, approve, and generate filing documents.</p>
      </div>

      {/* Filter bar */}
      <div className="flex gap-2 mb-4 flex-wrap">
        <button onClick={() => setFilter('all')} className={`px-3 py-1.5 text-[12px] font-medium rounded-full transition-colors ${filter === 'all' ? 'bg-[#195E8E] text-white' : 'bg-[#E5E5E5] text-[#5A5A5A] hover:bg-[#d5d5d5]'}`}>
          All ({rows.length})
        </button>
        {INCORPORATION_STATUSES.filter((s) => counts[s] > 0).map((s) => (
          <button key={s} onClick={() => setFilter(s)} className={`px-3 py-1.5 text-[12px] font-medium rounded-full transition-colors ${filter === s ? 'bg-[#195E8E] text-white' : `${STATUS_BADGE[s]}`}`}>
            {STATUS_LABELS[s]} ({counts[s]})
          </button>
        ))}
      </div>

      {loading ? (
        <p className="text-[13px] text-[#b8b8b0] py-12 text-center">Loading…</p>
      ) : filtered.length === 0 ? (
        <p className="text-[14px] text-[#5A5A5A] py-12 text-center">No submissions{filter !== 'all' ? ' matching this filter' : ' yet'}.</p>
      ) : (
        <div className="portal-card overflow-hidden">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-[#E5E5E5] text-[11px] font-semibold uppercase tracking-wider text-[#b8b8b0]">
                <th className="px-5 py-3">Corporation</th>
                <th className="px-5 py-3">Contact</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3">Updated</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody>
              {filtered.map((row) => {
                const name = row.proposed_name ? `${row.proposed_name} ${row.legal_element}` : 'Untitled'
                const dec = row.declarant as any
                return (
                  <tr key={row.id} className="border-b border-[#E5E5E5] last:border-0 hover:bg-[#FAFAF8] transition-colors">
                    <td className="px-5 py-3 text-[13px] font-medium text-[#1A1A1A]">{name}</td>
                    <td className="px-5 py-3 text-[12px] text-[#5A5A5A]">{dec?.full_name || '-'}</td>
                    <td className="px-5 py-3">
                      <span className={`text-[11px] font-medium px-2.5 py-1 rounded-full ${STATUS_BADGE[row.status]}`}>
                        {STATUS_LABELS[row.status]}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-[12px] text-[#b8b8b0]">{new Date(row.updated_at).toLocaleDateString('en-CA')}</td>
                    <td className="px-5 py-3 text-right">
                      <Link href={`/portal/admin/incorporations/${row.id}`} className="text-[12px] text-[#195E8E] hover:underline">Review →</Link>
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
