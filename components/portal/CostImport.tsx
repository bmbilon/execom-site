'use client'

import { useState, useCallback } from 'react'
import { createClient } from '@/lib/portal/supabase-client'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

interface CostImportProps {
  projectId: string
  claimYearId: string
  files: { id: string; file_name: string; storage_key: string }[]
}

interface ParsedRow {
  description: string
  amount: number
  cost_type: string
  hours?: number
  rate?: number
  employee_name?: string
  vendor_name?: string
  external_reference?: string
}

const COLUMN_MAPPINGS = [
  'description',
  'amount',
  'cost_type',
  'hours',
  'rate',
  'employee_name',
  'vendor_name',
  'external_reference',
  '-- skip --',
] as const

export default function CostImport({ projectId, claimYearId, files }: CostImportProps) {
  const [step, setStep] = useState<'select' | 'map' | 'preview'>('select')
  const [headers, setHeaders] = useState<string[]>([])
  const [rows, setRows] = useState<string[][]>([])
  const [mappings, setMappings] = useState<Record<number, string>>({})
  const [importing, setImporting] = useState(false)
  const router = useRouter()

  const csvFiles = files.filter((f) =>
    f.file_name.toLowerCase().endsWith('.csv') ||
    f.file_name.toLowerCase().endsWith('.xlsx') ||
    f.file_name.toLowerCase().endsWith('.xls')
  )

  async function handleFileSelect(fileId: string) {
    const file = files.find((f) => f.id === fileId)
    if (!file) return

    if (file.file_name.toLowerCase().endsWith('.csv')) {
      const supabase = createClient()
      const { data, error } = await supabase.storage
        .from('sred-files')
        .download(file.storage_key)

      if (error || !data) {
        toast.error('Failed to download file')
        return
      }

      const text = await data.text()
      const lines = text.split('\n').filter((l) => l.trim())
      if (lines.length < 2) {
        toast.error('File has no data rows')
        return
      }

      setHeaders(parseCsvLine(lines[0]))
      setRows(lines.slice(1).map(parseCsvLine))
      setStep('map')
    } else {
      toast.error('XLSX import requires server-side processing. Use CSV for now.')
    }
  }

  function parseCsvLine(line: string): string[] {
    const result: string[] = []
    let current = ''
    let inQuotes = false
    for (const char of line) {
      if (char === '"') {
        inQuotes = !inQuotes
      } else if (char === ',' && !inQuotes) {
        result.push(current.trim())
        current = ''
      } else {
        current += char
      }
    }
    result.push(current.trim())
    return result
  }

  function getMappedRows(): ParsedRow[] {
    return rows.map((row) => {
      const mapped: Record<string, string> = {}
      Object.entries(mappings).forEach(([colIdx, field]) => {
        if (field !== '-- skip --') {
          mapped[field] = row[parseInt(colIdx)] || ''
        }
      })
      return {
        description: mapped.description || 'Imported cost',
        amount: parseFloat(mapped.amount) || 0,
        cost_type: mapped.cost_type || 'other',
        hours: mapped.hours ? parseFloat(mapped.hours) : undefined,
        rate: mapped.rate ? parseFloat(mapped.rate) : undefined,
        employee_name: mapped.employee_name || undefined,
        vendor_name: mapped.vendor_name || undefined,
        external_reference: mapped.external_reference || undefined,
      }
    }).filter((r) => r.amount > 0)
  }

  async function handleImport() {
    const mapped = getMappedRows()
    if (mapped.length === 0) {
      toast.error('No valid rows to import')
      return
    }

    setImporting(true)
    const supabase = createClient()

    const inserts = mapped.map((row) => ({
      project_id: projectId,
      claim_year_id: claimYearId,
      cost_type: row.cost_type,
      description: row.description,
      amount: row.amount,
      hours: row.hours ?? null,
      rate: row.rate ?? null,
      employee_name: row.employee_name ?? null,
      vendor_name: row.vendor_name ?? null,
      external_reference: row.external_reference ?? null,
      source: 'imported' as const,
    }))

    const { error } = await supabase.from('costs').insert(inserts)

    if (error) {
      toast.error(error.message)
      setImporting(false)
      return
    }

    toast.success(`Imported ${mapped.length} cost items`)
    setImporting(false)
    setStep('select')
    router.refresh()
  }

  if (csvFiles.length === 0) {
    return (
      <p className="text-[13px] text-[#5A5A5A]">
        Upload a CSV or XLSX file first, then import costs from it.
      </p>
    )
  }

  if (step === 'select') {
    return (
      <div>
        <p className="text-[13px] text-[#5A5A5A] mb-3">Select a file to import costs from:</p>
        <div className="space-y-2">
          {csvFiles.map((file) => (
            <button
              key={file.id}
              onClick={() => handleFileSelect(file.id)}
              className="block w-full text-left px-4 py-3 border border-[#E5E5E5] rounded hover:border-blue transition-colors text-[14px] text-[#1A1A1A]"
            >
              {file.file_name}
            </button>
          ))}
        </div>
      </div>
    )
  }

  if (step === 'map') {
    return (
      <div>
        <p className="text-[13px] text-[#5A5A5A] mb-4">
          Map columns to cost fields. {rows.length} data rows found.
        </p>
        <div className="space-y-2 mb-4">
          {headers.map((header, i) => (
            <div key={i} className="flex items-center gap-4">
              <span className="text-[14px] text-[#1A1A1A] w-[200px] truncate font-mono">
                {header}
              </span>
              <select
                value={mappings[i] || '-- skip --'}
                onChange={(e) => setMappings((prev) => ({ ...prev, [i]: e.target.value }))}
                className="border border-[#E5E5E5] rounded px-3 py-1.5 text-[13px]"
              >
                {COLUMN_MAPPINGS.map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>
          ))}
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setStep('preview')}
            disabled={!Object.values(mappings).includes('amount')}
            className="bg-blue text-white text-[14px] font-semibold py-2.5 px-6 rounded-[5px] hover:bg-blue-dark disabled:opacity-50 transition-colors"
          >
            Preview
          </button>
          <button
            onClick={() => setStep('select')}
            className="text-[14px] text-[#5A5A5A] py-2.5 px-4"
          >
            Cancel
          </button>
        </div>
      </div>
    )
  }

  // Preview step
  const mapped = getMappedRows()
  return (
    <div>
      <p className="text-[13px] text-[#5A5A5A] mb-4">
        {mapped.length} valid rows ready to import.
      </p>
      <div className="max-h-[300px] overflow-y-auto border border-[#E5E5E5] rounded mb-4">
        <table className="w-full text-[13px]">
          <thead className="bg-surface-raised sticky top-0">
            <tr>
              <th className="text-left px-3 py-2 text-[#5A5A5A] font-semibold">Description</th>
              <th className="text-right px-3 py-2 text-[#5A5A5A] font-semibold">Amount</th>
              <th className="text-left px-3 py-2 text-[#5A5A5A] font-semibold">Type</th>
            </tr>
          </thead>
          <tbody>
            {mapped.slice(0, 20).map((row, i) => (
              <tr key={i} className="border-t border-[#E5E5E5]">
                <td className="px-3 py-2 text-[#1A1A1A]">{row.description}</td>
                <td className="px-3 py-2 text-[#1A1A1A] text-right font-mono">
                  ${row.amount.toFixed(2)}
                </td>
                <td className="px-3 py-2 text-[#5A5A5A]">{row.cost_type}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {mapped.length > 20 && (
          <p className="px-3 py-2 text-[12px] text-[#5A5A5A]">...and {mapped.length - 20} more</p>
        )}
      </div>
      <div className="flex gap-3">
        <button
          onClick={handleImport}
          disabled={importing}
          className="bg-blue text-white text-[14px] font-semibold py-2.5 px-6 rounded-[5px] hover:bg-blue-dark disabled:opacity-50 transition-colors"
        >
          {importing ? 'Importing...' : `Import ${mapped.length} Costs`}
        </button>
        <button
          onClick={() => setStep('map')}
          className="text-[14px] text-[#5A5A5A] py-2.5 px-4"
        >
          Back
        </button>
      </div>
    </div>
  )
}
