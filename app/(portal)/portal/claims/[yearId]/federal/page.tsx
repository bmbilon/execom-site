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

  const { data: claimYear } = await supabase
    .from('claim_years')
    .select('method_election, tax_year_start, associated_corp_flag, taxable_capital_eoy')
    .eq('id', params.yearId)
    .single()

  const { data: federalLineValues } = await supabase
    .from('federal_line_values')
    .select('*')
    .eq('claim_year_id', params.yearId)
    .is('snapshot_id', null)
    .order('form_code')
    .order('line_code')

  const lines = federalLineValues || []
  const hasCalculation = lines.length > 0

  // Group lines by form
  const t661Lines = lines.filter((l: { form_code: string }) => l.form_code === 'T661')
  const sch31Lines = lines.filter((l: { form_code: string }) => l.form_code === 'T2SCH31')

  function findLine(formLines: { line_code: string; value: number | null }[], code: string): number {
    const line = formLines.find((l) => l.line_code === code)
    return line?.value ?? 0
  }

  function fmt(n: number): string {
    return `$${n.toLocaleString('en-CA', { minimumFractionDigits: 2 })}`
  }

  return (
    <div>
      <p className="text-[12px] font-semibold uppercase tracking-[0.08em] text-blue mb-3">Federal</p>
      <h2 className="text-[1.5rem] font-serif text-[#1A1A1A] mb-6">Federal ITC Calculation</h2>

      {/* Claim Configuration */}
      <div className="bg-white border border-[#E5E5E5] rounded-[6px] p-8 mb-6">
        <p className="text-[12px] font-semibold uppercase tracking-[0.08em] text-blue mb-4">Configuration</p>
        <div className="grid grid-cols-4 gap-6">
          <div>
            <p className="text-[12px] text-[#5A5A5A] mb-1">Method</p>
            <p className="text-[15px] text-[#1A1A1A] capitalize">{claimYear?.method_election || 'Proxy'}</p>
          </div>
          <div>
            <p className="text-[12px] text-[#5A5A5A] mb-1">Tax Year Start</p>
            <p className="text-[15px] text-[#1A1A1A]">{claimYear?.tax_year_start || 'Not set'}</p>
          </div>
          <div>
            <p className="text-[12px] text-[#5A5A5A] mb-1">Associated Corp</p>
            <p className="text-[15px] text-[#1A1A1A]">{claimYear?.associated_corp_flag ? 'Yes' : 'No'}</p>
          </div>
          <div>
            <p className="text-[12px] text-[#5A5A5A] mb-1">Taxable Capital</p>
            <p className="text-[15px] text-[#1A1A1A]">
              {claimYear?.taxable_capital_eoy ? fmt(claimYear.taxable_capital_eoy) : 'Not set'}
            </p>
          </div>
        </div>
      </div>

      {hasCalculation ? (
        <>
          {/* T661 Expenditure Waterfall */}
          <div className="bg-white border border-[#E5E5E5] rounded-[6px] p-8 mb-6">
            <p className="text-[12px] font-semibold uppercase tracking-[0.08em] text-blue mb-4">
              T661, Expenditure Waterfall
            </p>
            <div className="space-y-3">
              {t661Lines.map((line: { line_code: string; value: number | null; explanation: string | null }) => (
                <div key={line.line_code} className="flex items-center justify-between border-b border-[#E5E5E5] pb-3 last:border-0">
                  <div>
                    <p className="text-[14px] text-[#1A1A1A] capitalize">{line.line_code.replace(/_/g, ' ')}</p>
                    {line.explanation && (
                      <p className="text-[12px] text-[#5A5A5A]">{line.explanation}</p>
                    )}
                  </div>
                  <p className="text-[14px] font-mono text-[#1A1A1A]">{fmt(line.value ?? 0)}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Schedule 31 ITC */}
          <div className="bg-white border border-[#E5E5E5] rounded-[6px] p-8">
            <p className="text-[12px] font-semibold uppercase tracking-[0.08em] text-blue mb-4">
              Schedule T2SCH31, Investment Tax Credit
            </p>
            <div className="space-y-3">
              {sch31Lines.map((line: { line_code: string; value: number | null; explanation: string | null }) => (
                <div key={line.line_code} className="flex items-center justify-between border-b border-[#E5E5E5] pb-3 last:border-0">
                  <div>
                    <p className="text-[14px] text-[#1A1A1A] capitalize">{line.line_code.replace(/_/g, ' ')}</p>
                    {line.explanation && (
                      <p className="text-[12px] text-[#5A5A5A]">{line.explanation}</p>
                    )}
                  </div>
                  <p className="text-[14px] font-mono text-[#1A1A1A] font-semibold">{fmt(line.value ?? 0)}</p>
                </div>
              ))}
            </div>
          </div>
        </>
      ) : (
        <div className="bg-white border border-[#E5E5E5] rounded-[6px] p-8 text-center">
          <p className="text-[15px] text-[#5A5A5A] mb-2">
            No federal calculation has been run yet.
          </p>
          <p className="text-[13px] text-[#5A5A5A]">
            Add projects and costs first, then run the federal calculation to generate T661 line values and Schedule 31 ITC estimates.
          </p>
        </div>
      )}

      <p className="text-[12px] text-[#5A5A5A] mt-4">
        All figures are Estimated and subject to review. CCPC status, taxable capital phase-out, and associated corporation rules may affect final ITC amounts.
      </p>
    </div>
  )
}
