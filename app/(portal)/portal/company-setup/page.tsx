import { createServerSupabaseClient } from '@/lib/portal/supabase-server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import CompanySetupForm from '../dashboard/CompanySetupForm'

export const dynamic = 'force-dynamic'

// Friendly labels for the ?required= reason query param, set by middleware
// when it bounces a prospect away from a client-only route.
const REQUIRED_REASONS: Record<string, string> = {
  '1': 'a client-service area',
  sred: 'the SR&ED claim builder',
  trademarks: 'the trademark filing flow',
  matters: 'the Matters workspace',
  corp_setup: 'corporate setup',
}

export default async function CompanySetupPage({
  searchParams,
}: {
  searchParams?: { required?: string }
}) {
  const supabase = createServerSupabaseClient()
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) redirect('/portal/login?next=/portal/company-setup')

  const authUser = session!.user
  const { data: profile } = await supabase
    .from('profiles')
    .select('id, full_name, company_id')
    .eq('id', authUser.id)
    .single()

  const email = authUser.email || ''
  const fullName =
    profile?.full_name ||
    (authUser.user_metadata?.full_name as string | undefined) ||
    ''
  const alreadyHasCompany = !!profile?.company_id
  const reasonKey = searchParams?.required
  const reasonLabel = reasonKey ? REQUIRED_REASONS[reasonKey] || REQUIRED_REASONS['1'] : null

  return (
    <div className="max-w-[640px] mx-auto py-8">
      <Link
        href="/portal/dashboard"
        className="inline-flex items-center gap-1 text-[13px] text-blue hover:underline mb-6"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Back to dashboard
      </Link>

      {reasonLabel ? (
        <div className="mb-6 bg-cream/40 border border-gold/40 rounded-[6px] px-5 py-4">
          <p className="text-[13px] text-[#1A1A1A]">
            <span className="font-semibold">Company setup required.</span>{' '}
            We need basic company information before you can access {reasonLabel}.
          </p>
        </div>
      ) : null}

      <p className="text-[12px] font-semibold uppercase tracking-[0.08em] text-blue mb-2">
        Company Setup
      </p>

      {alreadyHasCompany ? (
        <>
          <h1 className="text-[1.75rem] font-serif text-[#1A1A1A] mb-2">
            Your company is already set up.
          </h1>
          <p className="text-[15px] text-[#5A5A5A] mb-8">
            If you need to update your company details (name, BN, fiscal year, address),
            email{' '}
            <a className="text-blue hover:underline" href="mailto:action@execom.ca">
              action@execom.ca
            </a>{' '}
            and we&rsquo;ll make the changes for you.
          </p>
          <Link
            href="/portal/dashboard"
            className="inline-flex items-center gap-2 bg-blue text-white text-[14px] font-semibold py-2.5 px-6 rounded-[5px] hover:bg-blue-dark transition-colors"
          >
            Back to dashboard
          </Link>
        </>
      ) : (
        <>
          <h1 className="text-[1.75rem] font-serif text-[#1A1A1A] mb-2">
            Set up your company profile
          </h1>
          <p className="text-[15px] text-[#5A5A5A] mb-8">
            execom uses this to file SR&amp;ED claims, trademarks, and corporate
            documents on your behalf. It only takes a minute.
          </p>
          <CompanySetupForm userId={authUser.id} email={email} fullName={fullName} />
        </>
      )}
    </div>
  )
}
