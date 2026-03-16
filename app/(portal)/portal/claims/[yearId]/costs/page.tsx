import { createServerSupabaseClient } from '@/lib/portal/supabase-server'
import { redirect } from 'next/navigation'

export default async function CostsPage({
  params,
}: {
  params: { yearId: string }
}) {
  const supabase = createServerSupabaseClient()

  const {
    data: { session },
  } = await supabase.auth.getSession()
  if (!session) redirect('/portal/login')

  const { data: costImports } = await supabase
    .from('cost_imports')
    .select('*')
    .eq('claim_year_id', params.yearId)
    .order('created_at', { ascending: false })

  const { data: costs } = await supabase
    .from('costs')
    .select('cost_type, amount')
    .eq('claim_year_id', params.yearId)

  // Aggregate costs by cost_type
  const summary: Record<string, { count: number; total: number }> = {}
  for (const c of costs || []) {
    const key = c.cost_type ?? 'unknown'
    if (!summary[key]) summary[key] = { count: 0, total: 0 }
    summary[key].count += 1
    summary[key].total += c.amount ?? 0
  }

  const data = { costImports, costSummary: summary }

  return (
    <div>
      <p className="text-[12px] font-semibold uppercase tracking-[0.08em] text-blue mb-3">
        COSTS
      </p>
      <h2 className="text-[1.5rem] font-serif text-[#1A1A1A] mb-6">
        Cost Management
      </h2>
      <pre className="text-[13px] font-mono text-[#5A5A5A] bg-white border border-[#E5E5E5] rounded-[6px] p-6 overflow-auto">
        {JSON.stringify(data, null, 2)}
      </pre>
    </div>
  )
}
