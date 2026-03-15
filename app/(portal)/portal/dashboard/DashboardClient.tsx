'use client'

import { useState } from 'react'
import { createClient } from '@/lib/portal/supabase-client'
import { useRouter } from 'next/navigation'
import StatusBadge from '@/components/portal/StatusBadge'
import Link from 'next/link'

interface DashboardProps {
  profile: {
    full_name: string
    role: string
    company_id: string
  }
  company: {
    id: string
    name: string
  }
  claimYears: {
    id: string
    fiscal_year: number
    status: string
    created_at: string
    updated_at: string
  }[]
}

export default function DashboardClient({ profile, company, claimYears }: DashboardProps) {
  const [showNewYear, setShowNewYear] = useState(false)
  const [newYear, setNewYear] = useState(new Date().getFullYear())
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  async function handleCreateYear() {
    setError('')
    setCreating(true)

    const supabase = createClient()
    const { data, error } = await supabase
      .from('claim_years')
      .insert({
        company_id: company.id,
        fiscal_year: newYear,
        created_by: profile.company_id, // will use actual profile.id from session
      })
      .select()
      .single()

    if (error) {
      setError(error.message)
      setCreating(false)
      return
    }

    setShowNewYear(false)
    setCreating(false)
    router.refresh()
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <p className="text-[12px] font-semibold uppercase tracking-[0.08em] text-blue mb-3">
            Dashboard
          </p>
          <h1 className="text-[1.75rem] font-serif text-[#1A1A1A]">{company.name}</h1>
        </div>
        <button
          onClick={() => setShowNewYear(true)}
          className="bg-blue text-white text-[14px] font-semibold py-3 px-7 rounded-[5px] hover:bg-blue-dark transition-colors"
        >
          New Claim Year
        </button>
      </div>

      {/* New claim year form */}
      {showNewYear && (
        <div className="bg-white border border-[#E5E5E5] rounded-[6px] p-6 mb-6">
          <p className="text-[12px] font-semibold uppercase tracking-[0.08em] text-blue mb-4">
            New Claim Year
          </p>
          {error && (
            <div className="bg-red-50 border border-red-200 rounded px-4 py-3 text-[13px] text-red-700 mb-4">
              {error}
            </div>
          )}
          <div className="flex items-end gap-4">
            <div>
              <label className="block text-[12px] font-semibold uppercase tracking-[0.08em] text-blue mb-2">
                Fiscal Year
              </label>
              <input
                type="number"
                value={newYear}
                onChange={(e) => setNewYear(parseInt(e.target.value))}
                min={1900}
                max={2100}
                className="w-[120px] border-[1.5px] border-[#E5E5E5] rounded px-4 py-3 text-[15px] font-sans text-[#1A1A1A] focus:border-blue focus:shadow-[0_0_0_3px_rgba(25,94,142,0.12)] outline-none transition-all"
              />
            </div>
            <button
              onClick={handleCreateYear}
              disabled={creating}
              className="bg-blue text-white text-[14px] font-semibold py-3 px-7 rounded-[5px] hover:bg-blue-dark disabled:opacity-50 transition-colors"
            >
              {creating ? 'Creating...' : 'Create'}
            </button>
            <button
              onClick={() => setShowNewYear(false)}
              className="text-[14px] text-[#5A5A5A] hover:text-[#1A1A1A] py-3 px-4 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Claim years grid */}
      {claimYears.length === 0 ? (
        <div className="bg-white border border-[#E5E5E5] rounded-[6px] p-8 text-center">
          <p className="text-[15px] text-[#5A5A5A]">
            No claim years yet. Create one to start organizing your SR&ED claim.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {claimYears.map((cy) => (
            <Link
              key={cy.id}
              href={`/portal/claims/${cy.id}/upload`}
              className="bg-white border border-[#E5E5E5] rounded-[6px] p-8 hover:shadow-sm transition-shadow group"
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-[1.25rem] font-serif text-[#1A1A1A]">FY {cy.fiscal_year}</h2>
                <StatusBadge status={cy.status} />
              </div>
              <p className="text-[13px] text-[#5A5A5A]">
                Last updated {new Date(cy.updated_at).toLocaleDateString()}
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
