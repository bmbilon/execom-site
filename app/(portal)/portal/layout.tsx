import { createServerSupabaseClient } from '@/lib/portal/supabase-server'
import { redirect } from 'next/navigation'
import PortalSidebar from '@/components/portal/PortalSidebar'

export default async function PortalLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = createServerSupabaseClient()
  const { data: { session } } = await supabase.auth.getSession()

  // Auth pages render without sidebar
  if (!session) {
    return (
      <>
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Playfair+Display:wght@400;700&family=JetBrains+Mono:wght@400&display=swap"
          rel="stylesheet"
        />
        <div className="min-h-screen bg-bg">
          {children}
        </div>
      </>
    )
  }

  // Get profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', session.user.id)
    .single()

  // If no profile, redirect to setup (handled by dashboard)
  if (!profile) {
    return (
      <>
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Playfair+Display:wght@400;700&family=JetBrains+Mono:wght@400&display=swap"
          rel="stylesheet"
        />
        <div className="min-h-screen bg-bg">
          {children}
        </div>
      </>
    )
  }

  // Get claim years for sidebar
  const { data: claimYears } = await supabase
    .from('claim_years')
    .select('id, fiscal_year, status')
    .eq('company_id', profile.company_id)
    .order('fiscal_year', { ascending: false })

  return (
    <>
      <link
        href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Playfair+Display:wght@400;700&family=JetBrains+Mono:wght@400&display=swap"
        rel="stylesheet"
      />
      <div className="flex min-h-screen">
        <PortalSidebar
          profile={{
            full_name: profile.full_name,
            role: profile.role,
            is_execom_staff: profile.is_execom_staff,
          }}
          claimYears={claimYears || []}
        />
        <main className="flex-1 bg-bg">
          <div className="max-w-[1240px] mx-auto p-8">
            {children}
          </div>
        </main>
      </div>
    </>
  )
}
