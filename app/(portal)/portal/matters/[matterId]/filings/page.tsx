'use client'

import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/portal/supabase-client'
import MatterTabs from '@/components/portal/matters/MatterTabs'

const ARTIFACT_LABELS: Record<string, string> = {
  alberta_incorporation_pdf: 'Alberta Incorporation Form',
  incorporation_package_docx: 'Incorporation Package',
  organizational_resolutions_docx: 'Organizational Resolutions',
  founder_subscription_docx: 'Founder Subscription Agreement',
}

interface FiledArtifact {
  id: string
  artifact_type: string
  version: number
  generated_at: string
}

export default function MatterFilingsPage() {
  const params = useParams()
  const matterId = params.matterId as string

  const [matterName, setMatterName] = useState('')
  const [filings, setFilings] = useState<FiledArtifact[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    ;(async () => {
      const supabase = createClient()
      const [mRes, fRes] = await Promise.all([
        supabase.from('commercialization_matters').select('display_name').eq('id', matterId).single(),
        supabase
          .from('generated_artifacts')
          .select('id, artifact_type, version, generated_at')
          .eq('matter_id', matterId)
          .eq('status', 'filed_copy')
          .order('generated_at', { ascending: false }),
      ])
      if (mRes.data) setMatterName(mRes.data.display_name)
      setFilings((fRes.data || []) as FiledArtifact[])
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
        <span className="text-[#5A5A5A]">Filings</span>
      </nav>

      <h1 className="text-[22px] font-semibold text-[#1A1A1A] mb-1">Filings</h1>
      <p className="text-[14px] text-[#5A5A5A] mb-6">Documents submitted to government registries.</p>

      <MatterTabs matterId={matterId} />

      {loading ? (
        <div className="py-12 text-center"><p className="text-[13px] text-[#b8b8b0]">Loading…</p></div>
      ) : filings.length === 0 ? (
        <div className="py-16 text-center border border-dashed border-[#E5E5E5] rounded-lg">
          <p className="text-[14px] text-[#5A5A5A]">No filings recorded yet.</p>
          <p className="text-[12px] text-[#b8b8b0] mt-1">
            Filings appear here after documents are submitted to the registrar.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {filings.map((f) => (
            <div key={f.id} className="bg-white border border-[#E5E5E5] rounded px-4 py-3 flex items-center justify-between">
              <div>
                <p className="text-[13px] font-medium text-[#1A1A1A]">
                  {ARTIFACT_LABELS[f.artifact_type] ?? f.artifact_type}
                </p>
                <p className="text-[12px] text-[#b8b8b0]">
                  v{f.version} · Filed {new Date(f.generated_at).toLocaleDateString('en-CA')}
                </p>
              </div>
              <span className="text-[11px] font-medium px-2.5 py-1 rounded-full bg-[#195E8E]/10 text-[#195E8E]">
                Filed
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
