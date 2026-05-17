'use client'

import { useState } from 'react'
import { createClient } from '@/lib/portal/supabase-client'
import { useRouter } from 'next/navigation'
import StatusBadge from '@/components/portal/StatusBadge'
import Link from 'next/link'
import { Toaster, toast } from 'sonner'

interface Company {
  id: string
  name: string
  legal_name: string | null
  bn: string | null
  claim_years: { id: string; fiscal_year: number; status: string }[]
  profiles: { id: string; full_name: string; email: string; role: string }[]
}

export default function AdminClientsClient({ companies }: { companies: Company[] }) {
  const [viewingAs, setViewingAs] = useState<string | null>(null)
  const [viewingCompany, setViewingCompany] = useState<Company | null>(null)
  const router = useRouter()

  async function startImpersonation(company: Company) {
    const supabase = createClient()
    const { data: { session } } = await supabase.auth.getSession()

    // Log impersonation start
    await supabase.from('audit_log').insert({
      user_id: session?.user.id,
      action: 'impersonate_start',
      entity_type: 'profile',
      entity_id: company.profiles[0]?.id,
      new_value: { company_id: company.id, company_name: company.name },
    })

    setViewingAs(company.id)
    setViewingCompany(company)
    toast.success(`Viewing as ${company.name}`)
  }

  async function endImpersonation() {
    if (!viewingCompany) return
    const supabase = createClient()
    const { data: { session } } = await supabase.auth.getSession()

    await supabase.from('audit_log').insert({
      user_id: session?.user.id,
      action: 'impersonate_end',
      entity_type: 'profile',
      entity_id: viewingCompany.profiles[0]?.id,
    })

    setViewingAs(null)
    setViewingCompany(null)
    toast.success('Exited impersonation')
  }

  return (
    <div>
      <Toaster position="bottom-right" />

      {/* Impersonation banner */}
      {viewingCompany && (
        <div className="bg-amber-100 border border-amber-300 rounded-[6px] px-5 py-3 mb-6 flex items-center justify-between">
          <p className="text-[13px] text-amber-800">
            Viewing as <strong>{viewingCompany.name}</strong> (read-only)
          </p>
          <button
            onClick={endImpersonation}
            className="text-[13px] font-semibold text-amber-800 hover:text-amber-900"
          >
            Exit
          </button>
        </div>
      )}

      <p className="text-[12px] font-semibold uppercase tracking-[0.08em] text-blue mb-3">
        Admin
      </p>
      <h1 className="text-[1.75rem] font-serif text-[#1A1A1A] mb-8">Client Companies</h1>

      {/* Viewing a specific company */}
      {viewingCompany && (
        <div className="portal-card p-8 mb-8">
          <h2 className="text-[1.25rem] font-serif text-[#1A1A1A] mb-4">{viewingCompany.name}</h2>
          <p className="text-[13px] text-[#5A5A5A] mb-4">
            {viewingCompany.legal_name && `Legal: ${viewingCompany.legal_name}`}
            {viewingCompany.bn && `, BN: ${viewingCompany.bn}`}
          </p>

          <p className="text-[12px] font-semibold uppercase tracking-[0.08em] text-blue mb-3 mt-6">
            Claim Years
          </p>
          {viewingCompany.claim_years.length === 0 ? (
            <p className="text-[13px] text-[#5A5A5A]">No claim years</p>
          ) : (
            <div className="space-y-2">
              {viewingCompany.claim_years.map((cy) => (
                <Link
                  key={cy.id}
                  href={`/portal/claims/${cy.id}/review`}
                  className="flex items-center justify-between px-4 py-3 border border-[#E5E5E5] rounded hover:border-blue transition-colors"
                >
                  <span className="text-[14px] text-[#1A1A1A]">FY {cy.fiscal_year}</span>
                  <StatusBadge status={cy.status} />
                </Link>
              ))}
            </div>
          )}

          <p className="text-[12px] font-semibold uppercase tracking-[0.08em] text-blue mb-3 mt-6">
            Team Members
          </p>
          <div className="space-y-2">
            {viewingCompany.profiles.map((p) => (
              <div key={p.id} className="flex items-center justify-between px-4 py-2 text-[13px]">
                <span className="text-[#1A1A1A]">{p.full_name}</span>
                <span className="text-[#5A5A5A]">{p.email}, {p.role}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Company list */}
      <div className="space-y-3">
        {companies.map((company) => (
          <div
            key={company.id}
            className="portal-card px-6 py-5 flex items-center justify-between"
          >
            <div>
              <p className="text-[14px] text-[#1A1A1A] font-medium">{company.name}</p>
              <p className="text-[12px] text-[#5A5A5A]">
                {company.profiles.length} member{company.profiles.length !== 1 ? 's' : ''}
                {', '}
                {company.claim_years.length} claim year{company.claim_years.length !== 1 ? 's' : ''}
              </p>
            </div>
            <div className="flex items-center gap-3">
              {company.claim_years.map((cy) => (
                <StatusBadge key={cy.id} status={cy.status} />
              ))}
              <button
                onClick={() => startImpersonation(company)}
                className="text-[13px] text-blue hover:text-blue-dark transition-colors ml-2"
              >
                View
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
