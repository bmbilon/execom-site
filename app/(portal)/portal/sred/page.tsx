'use client'

import { useState } from 'react'
import { createClient } from '@/lib/portal/supabase-client'
import { useRouter } from 'next/navigation'
import StatusBadge from '@/components/portal/StatusBadge'
import Link from 'next/link'

interface ClaimYearRow {
  id: string
  fiscal_year: number
  status: string
  updated_at: string
}

export default function SREDPage() {
  const router = useRouter()
  const [claimYears, setClaimYears] = useState<ClaimYearRow[]>([])
  const [loaded, setLoaded] = useState(false)
  const [showNewYear, setShowNewYear] = useState(false)
  const [newYear, setNewYear] = useState(new Date().getFullYear())
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState('')

  useState(() => {
    ;(async () => {
      const supabase = createClient()
      const { data: profile } = await supabase
        .from('profiles')
        .select('company_id')
        .single()

      if (profile?.company_id) {
        const { data } = await supabase
          .from('claim_years')
          .select('id, fiscal_year, status, updated_at')
          .eq('company_id', profile.company_id)
          .order('fiscal_year', { ascending: false })
        setClaimYears(data || [])
      }
      setLoaded(true)
    })()
  })

  async function handleCreateYear() {
    setError('')
    setCreating(true)
    const supabase = createClient()

    const { data: profile } = await supabase
      .from('profiles')
      .select('id, company_id')
      .single()

    if (!profile?.company_id) {
      setError('No company found. Please complete company setup first.')
      setCreating(false)
      return
    }

    const { error: err } = await supabase
      .from('claim_years')
      .insert({
        company_id: profile.company_id,
        fiscal_year: newYear,
        created_by: profile.id,
      })

    if (err) {
      setError(err.message)
      setCreating(false)
      return
    }

    setShowNewYear(false)
    setCreating(false)
    router.refresh()
    // Re-fetch
    const { data } = await supabase
      .from('claim_years')
      .select('id, fiscal_year, status, updated_at')
      .eq('company_id', profile.company_id)
      .order('fiscal_year', { ascending: false })
    setClaimYears(data || [])
  }

  return (
    <div>
      <nav className="text-[12px] text-[#b8b8b0] mb-4">
        <Link href="/portal/dashboard" className="hover:text-[#195E8E] transition-colors">
          Dashboard
        </Link>
        <span className="mx-1.5">/</span>
        <span className="text-[#5A5A5A]">SR&ED</span>
      </nav>

      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-[22px] font-semibold text-[#1A1A1A]">SR&ED Tax Credits</h1>
          <p className="text-[14px] text-[#5A5A5A] mt-1">
            Manage your SR&ED claim years, projects, and filings.
          </p>
        </div>
        <button
          onClick={() => setShowNewYear(true)}
          className="px-5 py-2.5 bg-[#195E8E] text-white text-[14px] font-medium rounded hover:bg-[#144D75] transition-colors"
        >
          + New Claim Year
        </button>
      </div>

      {/* Quick actions */}
      <div className="grid gap-4 md:grid-cols-3 mb-8">
        <Link
          href="/portal/screener"
          className="bg-white border border-[#E5E5E5] rounded-lg p-5 hover:border-[#195E8E]/40 hover:shadow-sm transition-all"
        >
          <p className="text-[12px] font-semibold uppercase tracking-[0.08em] text-[#195E8E] mb-2">
            Eligibility Screener
          </p>
          <p className="text-[13px] text-[#5A5A5A]">
            Assess whether your R&D work qualifies
          </p>
        </Link>

        {claimYears.length > 0 && (
          <Link
            href={`/portal/claims/${claimYears[0].id}/upload`}
            className="bg-white border border-[#E5E5E5] rounded-lg p-5 hover:border-[#195E8E]/40 hover:shadow-sm transition-all"
          >
            <p className="text-[12px] font-semibold uppercase tracking-[0.08em] text-[#195E8E] mb-2">
              Upload Documents
            </p>
            <p className="text-[13px] text-[#5A5A5A]">
              Add payroll, accounting, and technical files
            </p>
          </Link>
        )}
      </div>

      {/* New claim year form */}
      {showNewYear && (
        <div className="bg-white border border-[#E5E5E5] rounded-lg p-6 mb-6">
          <p className="text-[12px] font-semibold uppercase tracking-[0.08em] text-[#195E8E] mb-4">
            New Claim Year
          </p>
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-[13px] text-red-700 mb-4">
              {error}
            </div>
          )}
          <div className="flex items-end gap-4">
            <div>
              <label className="block text-[12px] font-semibold uppercase tracking-[0.08em] text-[#195E8E] mb-2">
                Fiscal Year
              </label>
              <input
                type="number"
                value={newYear}
                onChange={(e) => setNewYear(parseInt(e.target.value))}
                min={1900}
                max={2100}
                className="w-[120px] border border-[#E5E5E5] rounded-lg px-4 py-2.5 text-[14px] text-[#1A1A1A] focus:border-[#195E8E] focus:ring-1 focus:ring-[#195E8E]/20 outline-none transition-all"
              />
            </div>
            <button
              onClick={handleCreateYear}
              disabled={creating}
              className="bg-[#195E8E] text-white text-[14px] font-medium py-2.5 px-6 rounded hover:bg-[#144D75] disabled:opacity-50 transition-colors"
            >
              {creating ? 'Creating...' : 'Create'}
            </button>
            <button
              onClick={() => setShowNewYear(false)}
              className="text-[14px] text-[#5A5A5A] hover:text-[#1A1A1A] py-2.5 px-4 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Claim years */}
      {!loaded ? (
        <div className="py-12 text-center">
          <p className="text-[13px] text-[#b8b8b0]">Loading...</p>
        </div>
      ) : claimYears.length === 0 ? (
        <div className="py-16 text-center border border-dashed border-[#E5E5E5] rounded-lg">
          <p className="text-[14px] text-[#5A5A5A] mb-2">No claim years yet.</p>
          <button
            onClick={() => setShowNewYear(true)}
            className="text-[14px] text-[#195E8E] hover:underline"
          >
            Create your first claim year
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {claimYears.map((cy) => (
            <Link
              key={cy.id}
              href={`/portal/claims/${cy.id}/upload`}
              className="block bg-white border border-[#E5E5E5] rounded-lg px-5 py-4 hover:border-[#195E8E]/40 hover:shadow-sm transition-all group"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[16px] font-semibold text-[#1A1A1A] group-hover:text-[#195E8E] transition-colors">
                    FY {cy.fiscal_year}
                  </p>
                  <p className="text-[12px] text-[#b8b8b0] mt-0.5">
                    Updated {new Date(cy.updated_at).toLocaleDateString('en-CA')}
                  </p>
                </div>
                <StatusBadge status={cy.status} />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
