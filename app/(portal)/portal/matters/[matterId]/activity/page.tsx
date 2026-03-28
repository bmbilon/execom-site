'use client'

import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/portal/supabase-client'
import { STATUS_LABELS } from '@/lib/corp-setup/schema'
import type { CommercializationStatus } from '@/lib/corp-setup/schema'
import MatterTabs from '@/components/portal/matters/MatterTabs'

interface StatusEvent {
  id: string
  from_status: string
  to_status: string
  changed_by: string
  note: string | null
  created_at: string
}

export default function MatterActivityPage() {
  const params = useParams()
  const matterId = params.matterId as string

  const [matterName, setMatterName] = useState('')
  const [events, setEvents] = useState<StatusEvent[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    ;(async () => {
      const supabase = createClient()
      const [mRes, eRes] = await Promise.all([
        supabase.from('commercialization_matters').select('display_name').eq('id', matterId).single(),
        supabase
          .from('matter_status_events')
          .select('id, from_status, to_status, changed_by, note, created_at')
          .eq('matter_id', matterId)
          .order('created_at', { ascending: false }),
      ])
      if (mRes.data) setMatterName(mRes.data.display_name)
      setEvents((eRes.data || []) as StatusEvent[])
      setLoading(false)
    })()
  }, [matterId])

  return (
    <div>
      <nav className="text-[12px] text-[#b8b8b0] mb-4">
        <Link href="/portal/matters" className="hover:text-[#195E8E] transition-colors">Matters</Link>
        <span className="mx-1.5">/</span>
        <Link href={`/portal/matters/${matterId}`} className="hover:text-[#195E8E] transition-colors">
          {matterName || 'Matter'}
        </Link>
        <span className="mx-1.5">/</span>
        <span className="text-[#5A5A5A]">Activity</span>
      </nav>

      <h1 className="text-[22px] font-semibold text-[#1A1A1A] mb-1">Activity</h1>
      <p className="text-[14px] text-[#5A5A5A] mb-6">Full audit trail for this matter.</p>

      <MatterTabs matterId={matterId} />

      {loading ? (
        <div className="py-12 text-center"><p className="text-[13px] text-[#b8b8b0]">Loading…</p></div>
      ) : events.length === 0 ? (
        <div className="py-16 text-center border border-dashed border-[#E5E5E5] rounded-lg">
          <p className="text-[14px] text-[#5A5A5A]">No activity recorded yet.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {events.map((ev) => (
            <div
              key={ev.id}
              className="bg-white border border-[#E5E5E5] rounded px-4 py-3"
            >
              <div className="flex items-start justify-between">
                <div className="text-[13px]">
                  <span className="text-[#5A5A5A]">
                    {STATUS_LABELS[ev.from_status as CommercializationStatus] ?? ev.from_status}
                  </span>
                  <span className="mx-1.5 text-[#b8b8b0]">→</span>
                  <span className="text-[#1A1A1A] font-medium">
                    {STATUS_LABELS[ev.to_status as CommercializationStatus] ?? ev.to_status}
                  </span>
                </div>
                <span className="text-[12px] text-[#b8b8b0]">
                  {new Date(ev.created_at).toLocaleString('en-CA')}
                </span>
              </div>
              {ev.note && (
                <p className="text-[12px] text-[#5A5A5A] mt-1">{ev.note}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
