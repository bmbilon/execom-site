import { createServerSupabaseClient } from '@/lib/portal/supabase-server'
import { redirect } from 'next/navigation'

export default async function ProvincialPage({
  params,
}: {
  params: { yearId: string }
}) {
  const supabase = createServerSupabaseClient()

  const {
    data: { session },
  } = await supabase.auth.getSession()
  if (!session) redirect('/portal/login')

  const { data: provincialLineValues } = await supabase
    .from('provincial_line_values')
    .select('*')
    .eq('claim_year_id', params.yearId)
    .order('line_number', { ascending: true })

  const { data: provincialProjectBreakdowns } = await supabase
    .from('provincial_project_breakdowns')
    .select('*')
    .eq('claim_year_id', params.yearId)

  const data = {
    provincialLineValues: provincialLineValues ?? [],
    provincialProjectBreakdowns: provincialProjectBreakdowns ?? [],
  }

  return (
    <div>
      <p className="text-[12px] font-semibold uppercase tracking-[0.08em] text-blue mb-3">
        PROVINCIAL
      </p>
      <h2 className="text-[1.5rem] font-serif text-[#1A1A1A] mb-6">
        Provincial Calculation
      </h2>
      <pre className="text-[13px] font-mono text-[#5A5A5A] bg-white border border-[#E5E5E5] rounded-[6px] p-6 overflow-auto">
        {JSON.stringify(data, null, 2)}
      </pre>
    </div>
  )
}
