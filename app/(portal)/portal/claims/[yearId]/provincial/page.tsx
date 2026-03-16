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

  const { data: claimYear } = await supabase
    .from('claim_years')
    .select('province_programs, taxable_capital_eoy')
    .eq('id', params.yearId)
    .single()

  const { data: provincialLineValues } = await supabase
    .from('provincial_line_values')
    .select('*')
    .eq('claim_year_id', params.yearId)
    .order('province_code')
    .order('form_code')
    .order('line_code')

  const { data: provincialBreakdowns } = await supabase
    .from('provincial_project_breakdowns')
    .select('*, projects(name, code)')
    .eq('claim_year_id', params.yearId)

  const lines = provincialLineValues || []
  const breakdowns = provincialBreakdowns || []
  const hasCalculation = lines.length > 0
  const programs = (claimYear?.province_programs as string[]) || ['AB']

  function fmt(n: number | null): string {
    if (n === null || n === undefined) return '--'
    return `$${n.toLocaleString('en-CA', { minimumFractionDigits: 2 })}`
  }

  return (
    <div>
      <p className="text-[12px] font-semibold uppercase tracking-[0.08em] text-blue mb-3">Provincial</p>
      <h2 className="text-[1.5rem] font-serif text-[#1A1A1A] mb-6">Provincial Calculation</h2>

      {/* Province Programs */}
      <div className="bg-white border border-[#E5E5E5] rounded-[6px] p-8 mb-6">
        <p className="text-[12px] font-semibold uppercase tracking-[0.08em] text-blue mb-4">Active Programs</p>
        <div className="flex gap-3">
          {programs.map((p: string) => (
            <span key={p} className="text-[13px] font-semibold text-blue bg-blue/10 px-3 py-1.5 rounded">
              {p === 'AB' ? 'Alberta IEG' :
               p === 'ON' ? 'Ontario OITC' :
               p === 'BC' ? 'BC SR&ED Credit' :
               p === 'QC' ? 'Quebec R&D Credit' : p}
            </span>
          ))}
        </div>
      </div>

      {hasCalculation ? (
        <>
          {/* Line Values */}
          <div className="bg-white border border-[#E5E5E5] rounded-[6px] p-8 mb-6">
            <p className="text-[12px] font-semibold uppercase tracking-[0.08em] text-blue mb-4">
              Provincial Line Values
            </p>
            <div className="space-y-3">
              {lines.map((line: { id: string; province_code: string; form_code: string; line_code: string; value: number | null; explanation: string | null }) => (
                <div key={line.id} className="flex items-center justify-between border-b border-[#E5E5E5] pb-3 last:border-0">
                  <div>
                    <p className="text-[14px] text-[#1A1A1A]">
                      <span className="font-mono text-[12px] text-blue mr-2">{line.province_code}</span>
                      {line.line_code.replace(/_/g, ' ')}
                    </p>
                    {line.explanation && (
                      <p className="text-[12px] text-[#5A5A5A]">{line.explanation}</p>
                    )}
                  </div>
                  <p className="text-[14px] font-mono text-[#1A1A1A]">{fmt(line.value)}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Project Breakdowns */}
          {breakdowns.length > 0 && (
            <div className="bg-white border border-[#E5E5E5] rounded-[6px] p-8">
              <p className="text-[12px] font-semibold uppercase tracking-[0.08em] text-blue mb-4">
                Per-Project Provincial Breakdown
              </p>
              <div className="overflow-x-auto">
                <table className="w-full text-[13px]">
                  <thead>
                    <tr className="border-b-2 border-blue">
                      <th className="text-left py-2 pr-4 font-semibold text-[#1A1A1A]">Project</th>
                      <th className="text-left py-2 pr-4 font-semibold text-[#1A1A1A]">Province</th>
                      <th className="text-right py-2 pr-4 font-semibold text-[#1A1A1A]">Provincial Expenditures</th>
                      <th className="text-right py-2 pr-4 font-semibold text-[#1A1A1A]">Provincial Salaries</th>
                      <th className="text-right py-2 font-semibold text-[#1A1A1A]">Provincial Proxy</th>
                    </tr>
                  </thead>
                  <tbody>
                    {breakdowns.map((b: {
                      id: string; province_code: string;
                      alberta_expenditures: number | null; alberta_salaries: number | null;
                      alberta_proxy_amount: number | null;
                      projects: { name: string; code: string | null } | null
                    }) => (
                      <tr key={b.id} className="border-b border-[#E5E5E5]">
                        <td className="py-3 pr-4 text-[#1A1A1A]">
                          {b.projects?.code && <span className="font-mono text-[12px] text-[#5A5A5A] mr-2">{b.projects.code}</span>}
                          {b.projects?.name || 'Unknown'}
                        </td>
                        <td className="py-3 pr-4 text-[#1A1A1A]">{b.province_code}</td>
                        <td className="py-3 pr-4 text-right font-mono text-[#1A1A1A]">{fmt(b.alberta_expenditures)}</td>
                        <td className="py-3 pr-4 text-right font-mono text-[#1A1A1A]">{fmt(b.alberta_salaries)}</td>
                        <td className="py-3 text-right font-mono text-[#1A1A1A]">{fmt(b.alberta_proxy_amount)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="bg-white border border-[#E5E5E5] rounded-[6px] p-8 text-center">
          <p className="text-[15px] text-[#5A5A5A] mb-2">
            No provincial calculation has been run yet.
          </p>
          <p className="text-[13px] text-[#5A5A5A]">
            Complete the federal calculation first. Provincial credits (Alberta IEG, Ontario OITC, etc.) are derived from the federal expenditure base.
          </p>
        </div>
      )}

      <p className="text-[12px] text-[#5A5A5A] mt-4">
        All figures are Estimated. Provincial credit rates and eligibility thresholds are subject to provincial legislation and may differ from federal treatment.
      </p>
    </div>
  )
}
