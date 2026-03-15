import { createServerSupabaseClient } from '@/lib/portal/supabase-server'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import ClaimSubNav from './ClaimSubNav'

export default async function ClaimLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: { yearId: string }
}) {
  const supabase = createServerSupabaseClient()

  const { data: claimYear } = await supabase
    .from('claim_years')
    .select('*, companies(name)')
    .eq('id', params.yearId)
    .single()

  if (!claimYear) notFound()

  return (
    <div>
      <div className="mb-6">
        <Link
          href="/portal/dashboard"
          className="text-[13px] text-blue hover:text-blue-dark transition-colors"
        >
          &larr; Dashboard
        </Link>
      </div>
      <div className="flex items-center gap-4 mb-6">
        <h1 className="text-[1.5rem] font-serif text-[#1A1A1A]">
          FY {claimYear.fiscal_year}
        </h1>
      </div>
      <ClaimSubNav yearId={params.yearId} />
      <div className="mt-6">{children}</div>
    </div>
  )
}
