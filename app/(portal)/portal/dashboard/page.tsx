import { createServerSupabaseClient } from '@/lib/portal/supabase-server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import DashboardClient from './DashboardClient'
import CompanySetupForm from './CompanySetupForm'

export default async function DashboardPage({
  searchParams,
}: {
  searchParams?: { setup?: string }
}) {
  const supabase = createServerSupabaseClient()
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) redirect('/portal/login')

  // ?setup=1 in the URL means the middleware just bounced this user
  // from a client-only route. Auto-open the CompanySetup panel so
  // they don't have to hunt for it.
  const setupRequested = searchParams?.setup === '1'

  // `redirect()` throws, so this is reachable only when session is non-null,
  // but TS doesn't narrow on `redirect`'s `never` return through destructuring.
  const authUser = session!.user

  // Profile may not exist yet for brand-new signups (auth trigger races
  // with the first dashboard render). We synthesize the minimum we need
  // and treat the user as a prospect.
  const { data: profile } = await supabase
    .from('profiles')
    .select('*, companies(*)')
    .eq('id', authUser.id)
    .single()

  const email = authUser.email || ''
  const fullName =
    profile?.full_name ||
    (authUser.user_metadata?.full_name as string | undefined) ||
    ''

  // Prospect path: no profile yet, or profile with no company attached.
  // We don't force CompanySetup here anymore — that flow is for execom
  // CLIENTS doing SR&ED / matters work, not for someone who just came in
  // to take the Prototype Readiness assessment.
  if (!profile || !profile.companies) {
    return <ProspectWelcome
      userId={authUser.id}
      email={email}
      fullName={fullName}
      hasProfile={!!profile}
      setupOpen={setupRequested}
    />
  }

  // Existing client path: load claim years and render the full dashboard.
  const { data: claimYears } = await supabase
    .from('claim_years')
    .select('*')
    .eq('company_id', profile.company_id)
    .order('fiscal_year', { ascending: false })

  const claimYearsWithStats = await Promise.all(
    (claimYears || []).map(async (cy) => {
      const { count: projectCount } = await supabase
        .from('projects')
        .select('*', { count: 'exact', head: true })
        .eq('claim_year_id', cy.id)

      const { data: costData } = await supabase
        .from('costs')
        .select('amount')
        .eq('claim_year_id', cy.id)

      const totalCosts = (costData || []).reduce(
        (sum: number, entry: { amount: number | null }) => sum + (entry.amount || 0),
        0
      )

      const { count: fileCount } = await supabase
        .from('files')
        .select('*', { count: 'exact', head: true })
        .eq('claim_year_id', cy.id)

      return {
        ...cy,
        projectCount: projectCount || 0,
        totalCosts,
        fileCount: fileCount || 0,
      }
    })
  )

  return (
    <DashboardClient
      profile={profile}
      company={profile.companies}
      claimYears={claimYearsWithStats}
    />
  )
}

// ─── Prospect welcome (no company attached yet) ──────────────────────────

function ProspectIcon() {
  return (
    <svg className="w-5 h-5 text-[#195E8E]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23-.693L5 14.5m14.8.8l1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0112 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5" />
    </svg>
  )
}

function ProspectWelcome({
  userId,
  email,
  fullName,
  hasProfile,
  setupOpen = false,
}: {
  userId: string
  email: string
  fullName: string
  hasProfile: boolean
  setupOpen?: boolean
}) {
  return (
    <div className="max-w-[920px] mx-auto">
      {setupOpen ? (
        <div className="mb-6 bg-cream/40 border border-gold/40 rounded-[6px] px-5 py-4">
          <p className="text-[13px] text-[#1A1A1A]">
            <span className="font-semibold">Company setup required.</span>{' '}
            That portal section is for execom clients with a registered
            company. Set up your company below to access SR&amp;ED, IP,
            corporate filings, and other client services.
          </p>
        </div>
      ) : null}

      <div className="mb-10">
        <p className="text-[12px] font-semibold uppercase tracking-[0.08em] text-blue mb-2">
          Welcome to execom
        </p>
        <h1 className="text-[1.75rem] font-serif text-[#1A1A1A] mb-2">
          {fullName ? `Hi ${fullName.split(' ')[0]},` : 'Hi there,'} let&rsquo;s get started.
        </h1>
        <p className="text-[15px] text-[#5A5A5A] max-w-[640px]">
          Most founders come to execom for one of two reasons: to pressure-test
          a product idea before tooling, or to set up the corporate, IP, and
          SR&amp;ED infrastructure for an existing business. Pick whichever
          fits where you are right now.
        </p>
      </div>

      {/* Primary tile — Prototype Readiness */}
      <Link
        href="/portal/prototype-readiness"
        className="group block bg-white border border-[#E5E5E5] rounded-[6px] p-6 hover:border-blue/40 hover:shadow-sm transition-all mb-4"
      >
        <div className="flex items-start gap-5">
          <div className="flex-shrink-0 w-10 h-10 bg-blue/5 rounded-[6px] flex items-center justify-center">
            <ProspectIcon />
          </div>
          <div className="flex-1">
            <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-blue mb-1">
              Pressure-test a product idea
            </p>
            <h2 className="text-[1.125rem] font-serif text-[#1A1A1A] mb-2">
              Prototype Readiness Assessment
            </h2>
            <p className="text-[14px] text-[#5A5A5A] leading-relaxed">
              A 20&ndash;30 minute walk-through of your product concept, target
              buyer, manufacturing path, and launch plan. We use your answers
              to recommend the right next step.
            </p>
          </div>
          <ArrowRight className="w-4 h-4 text-[#b8b8b0] group-hover:text-blue transition-colors flex-shrink-0 mt-1" />
        </div>
      </Link>

      {/* Secondary — Set up company for execom client services */}
      <details
        open={setupOpen}
        className="bg-white border border-[#E5E5E5] rounded-[6px] mt-8 overflow-hidden"
      >
        <summary className="cursor-pointer px-6 py-4 hover:bg-surface-raised/40 transition-colors">
          <span className="text-[14px] font-medium text-[#1A1A1A]">
            Already running a business? Set up your company for SR&amp;ED, IP, and corporate filings.
          </span>
        </summary>
        <div className="px-6 pb-6 pt-2 border-t border-[#E5E5E5] bg-surface-raised/30">
          <p className="text-[13px] text-[#5A5A5A] mb-5 leading-relaxed">
            For execom&rsquo;s client services (SR&amp;ED claims, incorporation,
            trademarks, IP assignments), we need basic company information.
            Skip this if you&rsquo;re only here for the Prototype Readiness Assessment.
          </p>
          <CompanySetupForm userId={userId} email={email} fullName={fullName} />
          {!hasProfile ? (
            <p className="mt-4 text-[11px] text-[#b8b8b0]">
              Heads up: your profile is still being created from your signup.
              If this form errors, refresh the page in a few seconds.
            </p>
          ) : null}
        </div>
      </details>
    </div>
  )
}
