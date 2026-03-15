'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Toaster, toast } from 'sonner'

interface ExportClientProps {
  yearId: string
  claimYear: { id: string; fiscal_year: number; status: string }
  outputs: {
    id: string
    output_type: string
    version: number
    storage_key: string | null
    created_at: string
  }[]
}

export default function ExportClient({ yearId, claimYear, outputs }: ExportClientProps) {
  const [generating, setGenerating] = useState<string | null>(null)
  const router = useRouter()

  async function handleGenerate(type: 'xlsx' | 'pdf' | 'json') {
    setGenerating(type)
    try {
      const res = await fetch(`/api/portal/export/${yearId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type }),
      })

      if (!res.ok) {
        const err = await res.json()
        toast.error(err.error || 'Export failed')
        setGenerating(null)
        return
      }

      const data = await res.json()

      if (type === 'json') {
        toast.success('Claim JSON updated')
      } else if (data.downloadUrl) {
        // Trigger download
        const link = document.createElement('a')
        link.href = data.downloadUrl
        link.download = data.fileName || `claim-${claimYear.fiscal_year}.${type}`
        link.click()
        toast.success(`${type.toUpperCase()} generated`)
      }

      router.refresh()
    } catch {
      toast.error('Export failed')
    }
    setGenerating(null)
  }

  return (
    <div>
      <Toaster position="bottom-right" />

      <p className="text-[12px] font-semibold uppercase tracking-[0.08em] text-blue mb-4">
        Export
      </p>
      <p className="text-[15px] text-[#5A5A5A] mb-8">
        Generate your claim package for review by your accountant. Each export rebuilds from live data.
      </p>

      {/* Export actions */}
      <div className="grid gap-4 md:grid-cols-3 mb-10">
        <div className="bg-white border border-[#E5E5E5] rounded-[6px] p-6">
          <p className="text-[12px] font-semibold uppercase tracking-[0.08em] text-blue mb-2">
            XLSX Workbook
          </p>
          <p className="text-[13px] text-[#5A5A5A] mb-4">
            6-sheet workbook with summary, projects, expenditures, salary allocation, T661 narratives, and evidence index.
          </p>
          <button
            onClick={() => handleGenerate('xlsx')}
            disabled={generating !== null}
            className="bg-blue text-white text-[14px] font-semibold py-2.5 px-6 rounded-[5px] hover:bg-blue-dark disabled:opacity-50 transition-colors"
          >
            {generating === 'xlsx' ? 'Generating...' : 'Generate XLSX'}
          </button>
        </div>

        <div className="bg-white border border-[#E5E5E5] rounded-[6px] p-6">
          <p className="text-[12px] font-semibold uppercase tracking-[0.08em] text-blue mb-2">
            PDF Packet
          </p>
          <p className="text-[13px] text-[#5A5A5A] mb-4">
            Filing-ready packet with cover page, claim summary, per-project narratives, cost tables, and evidence index.
          </p>
          <button
            onClick={() => handleGenerate('pdf')}
            disabled={generating !== null}
            className="bg-blue text-white text-[14px] font-semibold py-2.5 px-6 rounded-[5px] hover:bg-blue-dark disabled:opacity-50 transition-colors"
          >
            {generating === 'pdf' ? 'Generating...' : 'Generate PDF'}
          </button>
        </div>

        <div className="bg-white border border-[#E5E5E5] rounded-[6px] p-6">
          <p className="text-[12px] font-semibold uppercase tracking-[0.08em] text-blue mb-2">
            Claim JSON
          </p>
          <p className="text-[13px] text-[#5A5A5A] mb-4">
            Structured data snapshot of the full claim for integration or backup.
          </p>
          <button
            onClick={() => handleGenerate('json')}
            disabled={generating !== null}
            className="text-[14px] text-blue border border-blue px-5 py-2.5 rounded-[5px] hover:bg-blue hover:text-white disabled:opacity-50 transition-colors"
          >
            {generating === 'json' ? 'Generating...' : 'Rebuild JSON'}
          </button>
        </div>
      </div>

      {/* Previous exports */}
      {outputs.length > 0 && (
        <div>
          <p className="text-[12px] font-semibold uppercase tracking-[0.08em] text-blue mb-4">
            Previous Exports
          </p>
          <div className="space-y-2">
            {outputs.map((output) => (
              <div
                key={output.id}
                className="bg-white border border-[#E5E5E5] rounded-[6px] px-5 py-4 flex items-center justify-between"
              >
                <div>
                  <p className="text-[14px] text-[#1A1A1A] font-medium">
                    {output.output_type.toUpperCase()} v{output.version}
                  </p>
                  <p className="text-[12px] text-[#5A5A5A]">
                    {new Date(output.created_at).toLocaleString()}
                  </p>
                </div>
                {output.storage_key && (
                  <span className="text-[12px] text-blue">Available</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
