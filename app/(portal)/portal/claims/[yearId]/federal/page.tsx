import { createServerSupabaseClient } from '@/lib/portal/supabase-server'
import { redirect } from 'next/navigation'

export default async function FederalPage({
  params,
}: {
  params: { yearId: string }
}) {
  const supabase = createServerSupabaseClient()

  const {
    data: { session },
  } = await supabase.auth.getSession()
  if (!session) redirect('/portal/login')

  const { data: federalLineValues } = await supabase
    .from('federal_line_values')
    .select('*')
    .eq('claim_year_id', params.yearId)
    .order('line_number', { ascending: true })

  const data = { federalLineValues: federalLineValues ?? [] }

  return (
    <div>
      <p className="text-[12px] font-semibold uppercase tracking-[0.08em] text-blue mb-3">
        FEDERAL
      </p>
      <h2 className="text-[1.5rem] font-serif text-[#1A1A1A] mb-6">
        Federal Calculation
      </h2>
      <pre className="text-[13px] font-mono text-[#5A5A5A] bg-white border border-[#E5E5E5] rounded-[6px] p-6 overflow-auto">
        {JSON.stringify(data, null, 2)}
      </pre>
    </div>
  )
}
