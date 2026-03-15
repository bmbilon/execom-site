import { createServerSupabaseClient } from '@/lib/portal/supabase-server'
import { redirect } from 'next/navigation'
import DashboardClient from './DashboardClient'

export default async function DashboardPage() {
  const supabase = createServerSupabaseClient()
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) redirect('/portal/login')

  // Check if profile exists
  const { data: profile } = await supabase
    .from('profiles')
    .select('*, companies(*)')
    .eq('id', session.user.id)
    .single()

  // No profile = needs setup
  if (!profile) {
    return <CompanySetup userId={session.user.id} email={session.user.email || ''} fullName={session.user.user_metadata?.full_name || ''} />
  }

  // No company = needs setup
  if (!profile.companies) {
    return <CompanySetup userId={session.user.id} email={session.user.email || ''} fullName={profile.full_name} />
  }

  // Get claim years
  const { data: claimYears } = await supabase
    .from('claim_years')
    .select('*')
    .eq('company_id', profile.company_id)
    .order('fiscal_year', { ascending: false })

  return (
    <DashboardClient
      profile={profile}
      company={profile.companies}
      claimYears={claimYears || []}
    />
  )
}

function CompanySetup({ userId, email, fullName }: { userId: string; email: string; fullName: string }) {
  return (
    <div className="max-w-[520px] mx-auto py-12">
      <p className="text-[12px] font-semibold uppercase tracking-[0.08em] text-blue mb-4">
        Company Setup
      </p>
      <h1 className="text-[1.75rem] font-serif text-[#1A1A1A] mb-2">
        Set up your company profile
      </h1>
      <p className="text-[15px] text-[#5A5A5A] mb-8">
        Before you can start organizing your SR&ED claim, we need some basic information about your company.
      </p>
      <CompanySetupForm userId={userId} email={email} fullName={fullName} />
    </div>
  )
}

import CompanySetupForm from './CompanySetupForm'
