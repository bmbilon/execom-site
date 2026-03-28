'use client'

import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/portal/supabase-client'
import MatterTabs from '@/components/portal/matters/MatterTabs'

const ARTIFACT_LABELS: Record<string, string> = {
  alberta_incorporation_pdf: 'Alberta Incorporation Form (PDF)',
  incorporation_package_docx: 'Incorporation Package (DOCX)',
  organizational_resolutions_docx: 'Organizational Resolutions (DOCX)',
  founder_subscription_docx: 'Founder Subscription Agreement (DOCX)',
}

interface ArtifactRow {
  id: string
  artifact_type: string
  version: number
  generated_at: string
  status: string
  snapshot_id: string
}

interface SnapshotRow {
  id: string
  version: number
  approved_at: string
}

export default function MatterDocumentsPage() {
  const params = useParams()
  const matterId = params.matterId as string

  const [matterName, setMatterName] = useState('')
  const [artifacts, setArtifacts] = useState<ArtifactRow[]>([])
  const [snapshots, setSnapshots] = useState<SnapshotRow[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    ;(async () => {
      const supabase = createClient()
      const [mRes, aRes, sRes] = await Promise.all([
        supabase.from('commercialization_matters').select('display_name').eq('id', matterId).single(),
        supabase
          .from('generated_artifacts')
          .select('id, artifact_type, version, generated_at, status, snapshot_id')
          .eq('matter_id', matterId)
          .order('generated_at', { ascending: false }),
        supabase
          .from('approved_snapshots')
          .select('id, version, approved_at')
          .eq('matter_id', matterId)
          .order('version', { ascending: false }),
      ])
      if (mRes.data) setMatterName(mRes.data.display_name)
      setArtifacts((aRes.data || []) as ArtifactRow[])
      setSnapshots((sRes.data || []) as SnapshotRow[])
      setLoading(false)
    })()
  }, [matterId])

  const active = artifacts.filter((a) => a.status === 'generated')
  const superseded = artifacts.filter((a) => a.status === 'superseded')

  return (
    <div>
      <nav className="text-[12px] text-[#b8b8b0] mb-4">
        <Link href="/portal/matters" className="hover:text-[#195E8E] transition-colors">Matters</Link>
        <span className="mx-1.5">/</span>
        <Link href={`/portal/matters/${matterId}`} className="hover:text-[#195E8E] transition-colors">
          {matterName || 'Matter'}
        </Link>
        <span className="mx-1.5">/</span>
        <span className="text-[#5A5A5A]">Documents</span>
      </nav>

      <h1 className="text-[22px] font-semibold text-[#1A1A1A] mb-1">Documents</h1>
      <p className="text-[14px] text-[#5A5A5A] mb-6">Generated documents and approved snapshots.</p>

      <MatterTabs matterId={matterId} />

      {loading ? (
        <div className="py-12 text-center"><p className="text-[13px] text-[#b8b8b0]">Loading…</p></div>
      ) : (
        <>
          {/* Approved snapshots */}
          <h2 className="text-[13px] font-semibold uppercase tracking-[0.06em] text-[#195E8E] mb-3">
            Approved Snapshots
          </h2>
          {snapshots.length === 0 ? (
            <p className="text-[13px] text-[#b8b8b0] mb-8">No approved snapshots yet.</p>
          ) : (
            <div className="space-y-2 mb-8">
              {snapshots.map((s) => (
                <div key={s.id} className="bg-white border border-[#E5E5E5] rounded px-4 py-3 flex items-center justify-between">
                  <div>
                    <p className="text-[13px] font-medium text-[#1A1A1A]">Snapshot v{s.version}</p>
                    <p className="text-[12px] text-[#b8b8b0]">
                      Approved {new Date(s.approved_at).toLocaleDateString('en-CA')}
                    </p>
                  </div>
                  <span className="text-[11px] font-mono text-[#b8b8b0]">{s.id.slice(0, 8)}</span>
                </div>
              ))}
            </div>
          )}

          {/* Active documents */}
          <h2 className="text-[13px] font-semibold uppercase tracking-[0.06em] text-[#195E8E] mb-3">
            Generated Documents
          </h2>
          {active.length === 0 ? (
            <p className="text-[13px] text-[#b8b8b0] mb-8">No generated documents yet.</p>
          ) : (
            <div className="space-y-2 mb-8">
              {active.map((a) => (
                <div key={a.id} className="bg-white border border-[#E5E5E5] rounded px-4 py-3 flex items-center justify-between">
                  <div>
                    <p className="text-[13px] font-medium text-[#1A1A1A]">
                      {ARTIFACT_LABELS[a.artifact_type] ?? a.artifact_type}
                    </p>
                    <p className="text-[12px] text-[#b8b8b0]">
                      v{a.version} · Generated {new Date(a.generated_at).toLocaleDateString('en-CA')}
                    </p>
                  </div>
                  <span className="text-[11px] font-medium px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800">
                    Active
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Superseded */}
          {superseded.length > 0 && (
            <>
              <h2 className="text-[13px] font-semibold uppercase tracking-[0.06em] text-[#b8b8b0] mb-3">
                Superseded
              </h2>
              <div className="space-y-2">
                {superseded.map((a) => (
                  <div key={a.id} className="bg-white border border-[#E5E5E5] rounded px-4 py-3 flex items-center justify-between opacity-50">
                    <div>
                      <p className="text-[13px] text-[#5A5A5A]">
                        {ARTIFACT_LABELS[a.artifact_type] ?? a.artifact_type}
                      </p>
                      <p className="text-[12px] text-[#b8b8b0]">v{a.version}</p>
                    </div>
                    <span className="text-[11px] text-[#b8b8b0]">Superseded</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </>
      )}
    </div>
  )
}
