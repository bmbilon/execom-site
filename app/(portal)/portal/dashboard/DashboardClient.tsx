'use client'

import { useState } from 'react'
import { createClient } from '@/lib/portal/supabase-client'
import { useRouter } from 'next/navigation'
import StatusBadge from '@/components/portal/StatusBadge'
import Link from 'next/link'

interface ClaimYearWithStats {
  id: string
  fiscal_year: number
  status: string
  created_at: string
  updated_at: string
  projectCount: number
  totalCosts: number
  fileCount: number
}

interface DashboardProps {
  profile: {
    id: string
    full_name: string
    role: string
    company_id: string
  }
  company: {
    id: string
    name: string
  }
  claimYears: ClaimYearWithStats[]
}

const COMPLETENESS_CHECKS = [
  'Has projects',
  'Has cost entries',
  'Has uploaded files',
  'Has project narratives',
  'Has payroll data',
  'Has contractor costs',
  'Ready for review',
] as const

function getCompleteness(cy: ClaimYearWithStats): number {
  let passed = 0
  if (cy.projectCount > 0) passed++
  if (cy.totalCosts > 0) passed += 2 // costs imply payroll/contractor progress
  if (cy.fileCount > 0) passed++
  return Math.min(passed, COMPLETENESS_CHECKS.length)
}

export default function DashboardClient({ profile, company, claimYears }: DashboardProps) {
  const [showNewYear, setShowNewYear] = useState(false)
  const [newYear, setNewYear] = useState(new Date().getFullYear())
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const firstClaimYear = claimYears.length > 0 ? claimYears[0] : null

  async function handleCreateYear() {
    setError('')
    setCreating(true)

    const supabase = createClient()
    const { data, error } = await supabase
      .from('claim_years')
      .insert({
        company_id: company.id,
        fiscal_year: newYear,
        created_by: profile.id,
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
      {/* Welcome section */}
      <div className="mb-10">
        <p className="text-[12px] font-semibold uppercase tracking-[0.08em] text-blue mb-3">
          SR&ED Claim Portal
        </p>
        <h1 className="text-[1.75rem] font-serif text-[#1A1A1A]">{company.name}</h1>
      </div>

      {/* Quick Actions row */}
      <div className="grid gap-4 md:grid-cols-3 mb-10">
        <Link
          href="/portal/screener"
          className="bg-white border border-[#E5E5E5] rounded-[6px] p-8 hover:shadow-sm transition-shadow group"
        >
          <p className="text-[12px] font-semibold uppercase tracking-[0.08em] text-blue mb-3">
            Eligibility Screener
          </p>
          <p className="text-[14px] text-[#5A5A5A] leading-relaxed">
            Assess whether your R&D work qualifies for SR&ED tax credits
          </p>
        </Link>

        <button
          onClick={() => setShowNewYear(true)}
          className="bg-white border border-[#E5E5E5] rounded-[6px] p-8 hover:shadow-sm transition-shadow text-left"
        >
          <p className="text-[12px] font-semibold uppercase tracking-[0.08em] text-blue mb-3">
            Start a Claim
          </p>
          <p className="text-[14px] text-[#5A5A5A] leading-relaxed">
            Create a new claim year and begin organizing your SR&ED documentation
          </p>
        </button>

        {firstClaimYear ? (
          <Link
            href={`/portal/claims/${firstClaimYear.id}/upload`}
            className="bg-white border border-[#E5E5E5] rounded-[6px] p-8 hover:shadow-sm transition-shadow group"
          >
            <p className="text-[12px] font-semibold uppercase tracking-[0.08em] text-blue mb-3">
              Upload Documents
            </p>
            <p className="text-[14px] text-[#5A5A5A] leading-relaxed">
              Add payroll, accounting, and technical files to support your claim
            </p>
          </Link>
        ) : (
          <div className="bg-white border border-[#E5E5E5] rounded-[6px] p-8 opacity-50 cursor-not-allowed">
            <p className="text-[12px] font-semibold uppercase tracking-[0.08em] text-blue mb-3">
              Upload Documents
            </p>
            <p className="text-[14px] text-[#5A5A5A] leading-relaxed">
              Add payroll, accounting, and technical files to support your claim
            </p>
          </div>
        )}
      </div>

      {/* New claim year form */}
      {showNewYear && (
        <div className="bg-white border border-[#E5E5E5] rounded-[6px] p-8 mb-6">
          <p className="text-[12px] font-semibold uppercase tracking-[0.08em] text-blue mb-4">
            New Claim Year
          </p>
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-[6px] px-4 py-3 text-[13px] text-red-700 mb-4">
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
                className="w-[120px] border-[1.5px] border-[#E5E5E5] rounded-[6px] px-4 py-3 text-[15px] font-sans text-[#1A1A1A] focus:border-blue focus:shadow-[0_0_0_3px_rgba(25,94,142,0.12)] outline-none transition-all"
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

      {/* Claim Years section */}
      <div className="mb-4">
        <p className="text-[12px] font-semibold uppercase tracking-[0.08em] text-blue mb-4">
          Claim Years
        </p>
      </div>

      {claimYears.length === 0 ? (
        <div className="bg-white border border-[#E5E5E5] rounded-[6px] p-8 text-center">
          <p className="text-[15px] text-[#5A5A5A]">
            No claim years yet. Create one to start organizing your SR&ED claim.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {claimYears.map((cy) => {
            const completeness = getCompleteness(cy)
            return (
              <Link
                key={cy.id}
                href={`/portal/claims/${cy.id}/upload`}
                className="bg-white border border-[#E5E5E5] rounded-[6px] p-8 hover:shadow-sm transition-shadow group"
              >
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-[1.25rem] font-serif text-[#1A1A1A]">FY {cy.fiscal_year}</h2>
                  <StatusBadge status={cy.status} />
                </div>

                <div className="grid grid-cols-3 gap-3 mb-4">
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-blue mb-1">
                      Projects
                    </p>
                    <p className="text-[18px] font-serif text-[#1A1A1A]">{cy.projectCount}</p>
                  </div>
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-blue mb-1">
                      Costs
                    </p>
                    <p className="text-[18px] font-serif text-[#1A1A1A]">
                      {cy.totalCosts > 0
                        ? `$${cy.totalCosts.toLocaleString('en-CA', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`
                        : '--'}
                    </p>
                  </div>
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-blue mb-1">
                      Files
                    </p>
                    <p className="text-[18px] font-serif text-[#1A1A1A]">{cy.fileCount}</p>
                  </div>
                </div>

                {/* Progress indicator */}
                <div className="pt-3 border-t border-[#E5E5E5]">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-[12px] text-[#5A5A5A]">
                      {completeness} of {COMPLETENESS_CHECKS.length} checks passed
                    </p>
                  </div>
                  <div className="w-full h-[4px] bg-[#E5E5E5] rounded-[2px]">
                    <div
                      className="h-full bg-blue rounded-[2px] transition-all"
                      style={{ width: `${(completeness / COMPLETENESS_CHECKS.length) * 100}%` }}
                    />
                  </div>
                </div>

                <p className="text-[13px] text-[#5A5A5A] mt-3">
                  Last updated {new Date(cy.updated_at).toLocaleDateString()}
                </p>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
