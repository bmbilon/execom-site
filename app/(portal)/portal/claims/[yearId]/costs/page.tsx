import { createServerSupabaseClient } from '@/lib/portal/supabase-server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

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

  const totalCosts = Object.values(summary).reduce((s, v) => s + v.total, 0)
  const totalItems = Object.values(summary).reduce((s, v) => s + v.count, 0)
  const categories = Object.entries(summary).sort((a, b) => b[1].total - a[1].total)

  return (
    <div>
      <p className="text-[12px] font-semibold uppercase tracking-[0.08em] text-blue mb-3">
        Costs
      </p>
      <h2 className="text-[1.5rem] font-serif text-[#1A1A1A] mb-6">
        Cost Management
      </h2>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-white border border-[#E5E5E5] rounded-[6px] p-6">
          <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-blue mb-2">Total Expenditures</p>
          <p className="text-[1.5rem] font-serif text-[#1A1A1A]">
            {totalCosts > 0
              ? `$${totalCosts.toLocaleString('en-CA', { minimumFractionDigits: 2 })}`
              : '--'}
          </p>
        </div>
        <div className="bg-white border border-[#E5E5E5] rounded-[6px] p-6">
          <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-blue mb-2">Cost Items</p>
          <p className="text-[1.5rem] font-serif text-[#1A1A1A]">{totalItems}</p>
        </div>
        <div className="bg-white border border-[#E5E5E5] rounded-[6px] p-6">
          <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-blue mb-2">Data Imports</p>
          <p className="text-[1.5rem] font-serif text-[#1A1A1A]">{(costImports || []).length}</p>
        </div>
      </div>

      {/* Category Breakdown */}
      <div className="bg-white border border-[#E5E5E5] rounded-[6px] p-8 mb-6">
        <p className="text-[12px] font-semibold uppercase tracking-[0.08em] text-blue mb-4">
          Expenditures by Category
        </p>
        {categories.length > 0 ? (
          <div className="space-y-3">
            {categories.map(([category, data]) => (
              <div key={category} className="flex items-center justify-between border-b border-[#E5E5E5] pb-3 last:border-0">
                <div>
                  <p className="text-[14px] font-medium text-[#1A1A1A] capitalize">{category.replace(/_/g, ' ')}</p>
                  <p className="text-[12px] text-[#5A5A5A]">{data.count} item{data.count !== 1 ? 's' : ''}</p>
                </div>
                <p className="text-[14px] font-mono text-[#1A1A1A]">
                  ${data.total.toLocaleString('en-CA', { minimumFractionDigits: 2 })}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-[14px] text-[#5A5A5A]">
            No costs recorded yet. Add costs from the Projects tab, or import cost data from payroll exports, general ledger, or accounts payable files.
          </p>
        )}
      </div>

      {/* Imports */}
      <div className="bg-white border border-[#E5E5E5] rounded-[6px] p-8">
        <p className="text-[12px] font-semibold uppercase tracking-[0.08em] text-blue mb-4">
          Data Imports
        </p>
        {(costImports || []).length > 0 ? (
          <div className="space-y-2">
            {(costImports || []).map((imp: { id: string; source_type: string; source_name: string | null; status: string; row_count: number | null; imported_at: string }) => (
              <div key={imp.id} className="flex items-center justify-between border border-[#E5E5E5] rounded-[6px] px-4 py-3">
                <div>
                  <p className="text-[14px] font-medium text-[#1A1A1A]">{imp.source_name || imp.source_type}</p>
                  <p className="text-[12px] text-[#5A5A5A]">
                    {imp.source_type}, {imp.row_count || 0} rows, {new Date(imp.imported_at).toLocaleDateString()}
                  </p>
                </div>
                <span className={`text-[11px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded ${
                  imp.status === 'complete' ? 'bg-emerald-100 text-emerald-700' :
                  imp.status === 'failed' ? 'bg-red-100 text-red-700' :
                  'bg-gray-100 text-[#5A5A5A]'
                }`}>
                  {imp.status}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6">
            <p className="text-[14px] text-[#5A5A5A] mb-4">
              No data imports yet. Upload payroll, GL, or AP exports to automatically populate cost line items.
            </p>
            <Link
              href={`/portal/claims/${params.yearId}/upload`}
              className="text-[14px] text-blue border-[1.5px] border-blue px-5 py-2.5 rounded-[5px] hover:bg-blue hover:text-white transition-colors"
            >
              Upload Files
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
