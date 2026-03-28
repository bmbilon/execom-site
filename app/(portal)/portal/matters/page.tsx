'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/portal/supabase-client'
import { STATUS_LABELS, STATUS_BADGE } from '@/lib/corp-setup/schema'
import type { CommercializationStatus } from '@/lib/corp-setup/schema'

const TYPE_LABELS: Record<string, string> = {
  incorporation: 'Incorporation',
  ip_transfer: 'IP Transfer',
  trademark: 'Trademark',
  licensing: 'Licensing',
}

interface MatterRow {
  id: string
  matter_type: string
  display_name: string
  status: CommercializationStatus
  created_at: string
  updated_at: string
}

export default function MattersListPage() {
  const router = useRouter()
  const [matters, setMatters] = useState<MatterRow[]>([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)

  useEffect(() => {
    ;(async () => {
      const supabase = createClient()
      const { data } = await supabase
        .from('commercialization_matters')
        .select('id, matter_type, display_name, status, created_at, updated_at')
        .order('updated_at', { ascending: false })
      setMatters((data || []) as MatterRow[])
      setLoading(false)
    })()
  }, [])

  async function handleNewMatter() {
    if (creating) return
    setCreating(true)
    try {
      const supabase = createClient()
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) { router.push('/portal/login'); return }

      const { data: matter } = await supabase
        .from('commercialization_matters')
        .insert({
          user_id: session.user.id,
          matter_type: 'incorporation',
          display_name: 'New Incorporation',
          status: 'draft',
        })
        .select('id')
        .single()

      if (matter) {
        router.push(`/portal/matters/${matter.id}/tasks/incorporation`)
      }
    } catch {
      setCreating(false)
    }
  }

  return (
    <div>
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-[22px] font-semibold text-[#1A1A1A]">Matters</h1>
          <p className="text-[14px] text-[#5A5A5A] mt-1">
            All client matters — incorporation, IP transfers, trademarks, and licensing.
          </p>
        </div>
        <button
          onClick={handleNewMatter}
          disabled={creating}
          className="px-5 py-2.5 bg-[#195E8E] text-white text-[14px] font-medium rounded hover:bg-[#144D75] transition-colors disabled:opacity-50"
        >
          {creating ? 'Creating…' : '+ New Matter'}
        </button>
      </div>

      {loading ? (
        <div className="py-12 text-center">
          <p className="text-[13px] text-[#b8b8b0]">Loading…</p>
        </div>
      ) : matters.length === 0 ? (
        <div className="py-16 text-center border border-dashed border-[#E5E5E5] rounded-lg">
          <p className="text-[14px] text-[#5A5A5A] mb-2">No matters yet.</p>
          <button
            onClick={handleNewMatter}
            disabled={creating}
            className="text-[14px] text-[#195E8E] hover:underline disabled:opacity-50"
          >
            Start your first incorporation →
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {matters.map((m) => {
            const name = m.display_name || 'Untitled Matter'
            const badgeCls = STATUS_BADGE[m.status as CommercializationStatus] ?? 'bg-[#E5E5E5] text-[#5A5A5A]'
            const label = STATUS_LABELS[m.status as CommercializationStatus] ?? m.status
            return (
              <Link
                key={m.id}
                href={`/portal/matters/${m.id}`}
                className="block bg-white border border-[#E5E5E5] rounded-lg px-5 py-4 hover:border-[#195E8E]/40 hover:shadow-sm transition-all group"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[14px] font-medium text-[#1A1A1A] group-hover:text-[#195E8E] transition-colors">
                      {name}
                    </p>
                    <p className="text-[12px] text-[#b8b8b0] mt-0.5">
                      {TYPE_LABELS[m.matter_type] ?? m.matter_type}
                      <span className="mx-1.5">·</span>
                      Updated {new Date(m.updated_at).toLocaleDateString('en-CA')}
                    </p>
                  </div>
                  <span className={`text-[11px] font-medium px-2.5 py-1 rounded-full ${badgeCls}`}>
                    {label}
                  </span>
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
