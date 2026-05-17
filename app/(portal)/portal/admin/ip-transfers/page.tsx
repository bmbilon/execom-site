'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/portal/supabase-client'
import {
  type CommercializationStatus,
  COMMERCIALIZATION_STATUSES,
  STATUS_LABELS,
  STATUS_BADGE,
} from '@/lib/corp-setup/schema'

const ASSET_TYPE_LABELS: Record<string, string> = {
  invention: 'Invention',
  software: 'Software',
  design: 'Design',
  trade_secret: 'Trade Secret',
  other: 'Other',
}

interface IntakeRow {
  id: string
  asset_title: string
  asset_type: string
  inventor_name: string
  assignee_corp_name: string
  status: CommercializationStatus
  updated_at: string
}

const PRIORITY_ORDER: CommercializationStatus[] = [
  'submitted',
  'in_review',
  'changes_requested',
  'approved_for_generation',
  'generated',
  'draft',
  'filed',
]

export default function AdminIPTransfersPage() {
  const [intakes, setIntakes] = useState<IntakeRow[]>([])
  const [filter, setFilter] = useState<CommercializationStatus | 'all'>('all')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    ;(async () => {
      const supabase = createClient()
      const { data } = await supabase
        .from('ip_transfer_intakes')
        .select(
          'id, asset_title, asset_type, inventor_name, assignee_corp_name, status, updated_at'
        )
        .order('updated_at', { ascending: false })
      setIntakes((data || []) as IntakeRow[])
      setLoading(false)
    })()
  }, [])

  const counts = COMMERCIALIZATION_STATUSES.reduce(
    (acc, s) => {
      acc[s] = intakes.filter((i) => i.status === s).length
      return acc
    },
    {} as Record<CommercializationStatus, number>
  )

  const filtered =
    filter === 'all' ? intakes : intakes.filter((i) => i.status === filter)
  const sorted = [...filtered].sort(
    (a, b) => PRIORITY_ORDER.indexOf(a.status) - PRIORITY_ORDER.indexOf(b.status)
  )

  return (
    <div>
      <h1 className="text-[22px] font-semibold text-[#1A1A1A] mb-1">
        IP Transfers
      </h1>
      <p className="text-[14px] text-[#5A5A5A] mb-6">
        All IP transfer intakes across clients.
      </p>

      {/* Filter bar */}
      <div className="flex gap-2 flex-wrap mb-6">
        <button
          onClick={() => setFilter('all')}
          className={`px-3 py-1.5 rounded text-[12px] font-medium transition-colors ${
            filter === 'all'
              ? 'bg-[#195E8E] text-white'
              : 'bg-[#F7F6EE] text-[#5A5A5A] hover:bg-[#E5E5E5]'
          }`}
        >
          All ({intakes.length})
        </button>
        {COMMERCIALIZATION_STATUSES.filter((s) => counts[s] > 0).map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`px-3 py-1.5 rounded text-[12px] font-medium transition-colors ${
              filter === s
                ? 'bg-[#195E8E] text-white'
                : 'bg-[#F7F6EE] text-[#5A5A5A] hover:bg-[#E5E5E5]'
            }`}
          >
            {STATUS_LABELS[s]} ({counts[s]})
          </button>
        ))}
      </div>

      {loading ? (
        <div className="py-12 text-center">
          <p className="text-[13px] text-[#b8b8b0]">Loading…</p>
        </div>
      ) : sorted.length === 0 ? (
        <div className="py-16 text-center border border-dashed border-[#E5E5E5] rounded-lg">
          <p className="text-[14px] text-[#5A5A5A]">
            No IP transfer intakes found.
          </p>
        </div>
      ) : (
        <div className="portal-card overflow-hidden">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="bg-[#F7F6EE] text-[#5A5A5A] text-left">
                <th className="px-4 py-3 font-medium">Asset</th>
                <th className="px-4 py-3 font-medium">Type</th>
                <th className="px-4 py-3 font-medium">Inventor</th>
                <th className="px-4 py-3 font-medium">Assignee</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Updated</th>
                <th className="px-4 py-3 font-medium"></th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((row) => (
                <tr
                  key={row.id}
                  className="border-t border-[#E5E5E5] hover:bg-[#F7F6EE]/50"
                >
                  <td className="px-4 py-3 font-medium text-[#1A1A1A]">
                    {row.asset_title || 'Untitled'}
                  </td>
                  <td className="px-4 py-3 text-[#5A5A5A]">
                    {ASSET_TYPE_LABELS[row.asset_type] || row.asset_type}
                  </td>
                  <td className="px-4 py-3 text-[#5A5A5A]">
                    {row.inventor_name || '-'}
                  </td>
                  <td className="px-4 py-3 text-[#5A5A5A]">
                    {row.assignee_corp_name || '-'}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`text-[11px] font-medium px-2.5 py-1 rounded-full ${STATUS_BADGE[row.status]}`}
                    >
                      {STATUS_LABELS[row.status]}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-[#b8b8b0]">
                    {new Date(row.updated_at).toLocaleDateString('en-CA')}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/portal/admin/ip-transfers/${row.id}`}
                      className="text-[#195E8E] hover:underline"
                    >
                      Review
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
