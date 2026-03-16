import { createServerSupabaseClient } from '@/lib/portal/supabase-server'
import { redirect } from 'next/navigation'

export default async function SetupPage({
  params,
}: {
  params: { yearId: string }
}) {
  const supabase = createServerSupabaseClient()

  const {
    data: { session },
  } = await supabase.auth.getSession()
  if (!session) redirect('/portal/login')

  const { data: claimYear } = await supabase
    .from('claim_years')
    .select('*, companies(name, legal_name, bn, industry, address)')
    .eq('id', params.yearId)
    .single()

  const { data: contacts } = await supabase
    .from('claim_contacts')
    .select('*')
    .eq('claim_year_id', params.yearId)
    .order('created_at', { ascending: true })

  const data = { claimYear, contacts }

  return (
    <div>
      <p className="text-[12px] font-semibold uppercase tracking-[0.08em] text-blue mb-3">
        SETUP
      </p>
      <h2 className="text-[1.5rem] font-serif text-[#1A1A1A] mb-6">
        Claim Setup
      </h2>
      <pre className="text-[13px] font-mono text-[#5A5A5A] bg-white border border-[#E5E5E5] rounded-[6px] p-6 overflow-auto">
        {JSON.stringify(data, null, 2)}
      </pre>
    </div>
  )
}
