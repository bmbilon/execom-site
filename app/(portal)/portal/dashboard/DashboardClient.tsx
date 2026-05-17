'use client'

import { useState } from 'react'
import { createClient } from '@/lib/portal/supabase-client'
import { useRouter } from 'next/navigation'
import DashboardTile from '@/components/portal/DashboardTile'
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

// ─── SVG Icons ───────────────────────────────────────────────

function IncorporateIcon() {
  return (
    <svg className="w-5 h-5 text-[#195E8E]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3h.008v.008h-.008V10.5zm0 3h.008v.008h-.008V13.5z" />
    </svg>
  )
}

function TrademarkIcon() {
  return (
    <svg className="w-5 h-5 text-[#195E8E]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
    </svg>
  )
}

function IPIcon() {
  return (
    <svg className="w-5 h-5 text-[#195E8E]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" />
    </svg>
  )
}

function SREDIcon() {
  return (
    <svg className="w-5 h-5 text-[#195E8E]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  )
}

function LicensingIcon() {
  return (
    <svg className="w-5 h-5 text-[#195E8E]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
    </svg>
  )
}

function DocumentsIcon() {
  return (
    <svg className="w-5 h-5 text-[#195E8E]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z" />
    </svg>
  )
}

function PrototypeIcon() {
  return (
    <svg className="w-5 h-5 text-[#195E8E]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23-.693L5 14.5m14.8.8l1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0112 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5" />
    </svg>
  )
}

// ─── Component ───────────────────────────────────────────────

export default function DashboardClient({ profile, company, claimYears }: DashboardProps) {
  return (
    <div>
      {/* Header */}
      <div className="mb-10">
        <h1 className="text-[1.75rem] font-serif text-[#1A1A1A] mb-1">Client Portal</h1>
        <p className="text-[14px] text-[#5A5A5A]">
          Choose a task to begin or continue.
        </p>
      </div>

      {/* Product tiles */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mb-12">
        <DashboardTile
          title="Incorporate"
          description="Register a new corporation and generate your formation documents."
          icon={<IncorporateIcon />}
          href="/portal/matters/new?type=incorporation"
        />
        <DashboardTile
          title="Trademarks"
          description="File and manage trademark applications."
          icon={<TrademarkIcon />}
          href="/portal/matters/new?type=trademark"
        />
        <DashboardTile
          title="IP Assignment"
          description="Transfer intellectual property into your corporation."
          icon={<IPIcon />}
          href="/portal/matters/new?type=ip_transfer"
        />
        <DashboardTile
          title="SR&ED"
          description="Prepare and manage SR&ED tax credit claims."
          icon={<SREDIcon />}
          href="/portal/sred"
        />
        <DashboardTile
          title="Licensing"
          description="Prepare licensing agreements and commercialization structures."
          icon={<LicensingIcon />}
          href="/portal/matters/new?type=licensing"
        />
        <DashboardTile
          title="Documents & Filings"
          description="View generated legal documents and filings."
          icon={<DocumentsIcon />}
          href="/portal/matters"
        />
        <DashboardTile
          title="Prototype Readiness"
          description="Pressure-test a product idea before tooling and find the right next step."
          icon={<PrototypeIcon />}
          href="/portal/prototype-readiness"
        />
      </div>

      {/* Recent matters */}
      <RecentMatters />
    </div>
  )
}

function RecentMatters() {
  const [matters, setMatters] = useState<any[]>([])
  const [loaded, setLoaded] = useState(false)

  useState(() => {
    ;(async () => {
      const supabase = createClient()
      const { data } = await supabase
        .from('commercialization_matters')
        .select('id, matter_type, display_name, status, updated_at')
        .order('updated_at', { ascending: false })
        .limit(5)
      setMatters(data || [])
      setLoaded(true)
    })()
  })

  const TYPE_LABELS: Record<string, string> = {
    incorporation: 'Incorporation',
    ip_transfer: 'IP Transfer',
    trademark: 'Trademark',
    licensing: 'Licensing',
  }

  if (!loaded || matters.length === 0) return null

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <p className="text-[12px] font-semibold uppercase tracking-[0.08em] text-[#195E8E]">
          Recent Matters
        </p>
        <Link href="/portal/matters" className="text-[13px] text-[#195E8E] hover:underline">
          View all
        </Link>
      </div>
      <div className="space-y-2">
        {matters.map((m: any) => (
          <Link
            key={m.id}
            href={`/portal/matters/${m.id}`}
            className="block bg-white border border-[#E5E5E5] rounded-lg px-5 py-3 hover:border-[#195E8E]/40 hover:shadow-sm transition-all group"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[14px] font-medium text-[#1A1A1A] group-hover:text-[#195E8E] transition-colors">
                  {m.display_name || 'Untitled Matter'}
                </p>
                <p className="text-[12px] text-[#b8b8b0] mt-0.5">
                  {TYPE_LABELS[m.matter_type] ?? m.matter_type}
                  <span className="mx-1.5">·</span>
                  Updated {new Date(m.updated_at).toLocaleDateString('en-CA')}
                </p>
              </div>
              <svg className="w-4 h-4 text-[#b8b8b0] group-hover:text-[#195E8E] transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
              </svg>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
