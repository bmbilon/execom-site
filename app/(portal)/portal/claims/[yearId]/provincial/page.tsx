import { createServerSupabaseClient } from '@/lib/portal/supabase-server'
import { redirect } from 'next/navigation'
import { PROVINCE_REGISTRY, NO_PROGRAM_CODES } from '@/lib/services/provincial'
import { hasProgram } from '@/lib/services/provincial/types'

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

  const yearId = params.yearId

  // ── 1. Claim-year context ──

  const { data: claimYear } = await supabase
    .from('claim_years')
    .select(
      'company_id, tax_year_start, tax_year_end, method_election, associated_corp_flag, taxable_capital_eoy, mb_renunciation_flag, mb_renunciation_date, sk_renunciation_flag'
    )
    .eq('id', yearId)
    .single()

  // ── 2. Company context ──

  let company: {
    ccpc_flag: boolean
    specified_capital_amount: number | null
    prior_year_taxable_income_on: number | null
    qc_establishment_flag: boolean
  } | null = null

  if (claimYear?.company_id) {
    const { data } = await supabase
      .from('companies')
      .select('ccpc_flag, specified_capital_amount, prior_year_taxable_income_on, qc_establishment_flag')
      .eq('id', claimYear.company_id)
      .single()
    company = data
  }

  // ── 3. Provisional federal QE base ──

  const { data: fedLines } = await supabase
    .from('federal_line_values')
    .select('line_code, value')
    .eq('claim_year_id', yearId)
    .is('snapshot_id', null)

  const federalQE =
    (fedLines ?? []).find((l: { line_code: string }) => l.line_code === 'qualified_expenditures')
      ?.value ?? null
  const federalITC =
    (fedLines ?? []).find((l: { line_code: string }) => l.line_code === 'total_itc')?.value ?? null
  const federalCalcDone = (fedLines ?? []).length > 0

  // ── 4. Province activity from cost splits ──

  const { data: items } = await supabase
    .from('cost_line_items')
    .select('id')
    .eq('claim_year_id', yearId)

  const itemIds = (items ?? []).map((i: { id: string }) => i.id)

  const provinceTotals = new Map<string, number>()
  if (itemIds.length > 0) {
    const { data: splits } = await supabase
      .from('cost_line_project_splits')
      .select('province_code, allocation_amount')
      .in('cost_line_item_id', itemIds)
      .neq('review_status', 'excluded')

    for (const s of (splits ?? []) as { province_code: string; allocation_amount: number }[]) {
      provinceTotals.set(s.province_code, (provinceTotals.get(s.province_code) ?? 0) + s.allocation_amount)
    }
  }

  const activeProvinces = [...provinceTotals.entries()]
    .sort((a, b) => a[0].localeCompare(b[0]))

  // ── 5. Existing provincial calculation results ──

  const { data: provLines } = await supabase
    .from('provincial_line_values')
    .select('*')
    .eq('claim_year_id', yearId)
    .is('snapshot_id', null)
    .order('province_code')
    .order('form_code')
    .order('line_code')

  const provLinesByProvince = new Map<string, Array<{
    line_code: string
    value: number | null
    form_code: string
    explanation: string | null
  }>>()
  for (const l of (provLines ?? []) as Array<{
    province_code: string
    line_code: string
    value: number | null
    form_code: string
    explanation: string | null
  }>) {
    const arr = provLinesByProvince.get(l.province_code) ?? []
    arr.push(l)
    provLinesByProvince.set(l.province_code, arr)
  }

  const provincialCalcDone = (provLines ?? []).length > 0

  // ── 6. Three-pass state, check if assistance items have been upserted ──

  const { data: assistanceRows } = await supabase
    .from('assistance_items')
    .select('source_name, amount, treatment_notes')
    .eq('claim_year_id', yearId)
    .like('source_name', '% SR&ED Tax Credit')

  const provincialAssistanceUpserted = (assistanceRows ?? []).length > 0

  // ── Helpers ──

  function fmt(n: number | null | undefined): string {
    if (n === null || n === undefined) return '--'
    return `$${n.toLocaleString('en-CA', { minimumFractionDigits: 2 })}`
  }

  function getRegistryInfo(code: string) {
    const entry = PROVINCE_REGISTRY[code]
    if (!entry) return { status: 'unknown' as const }
    if (!hasProgram(entry)) return { status: 'no-program' as const, name: entry.provinceName }
    return {
      status: 'active' as const,
      forms: entry.allFormCodes,
      primaryForm: entry.primaryFormCode,
      name: entry.provinceName,
      usesFederalBase: entry.usesFederalBase,
      assistanceReducesBase: entry.assistanceReducesBase,
      hasRecapture: entry.hasRecapture,
      hasRenunciation: entry.hasRenunciation,
      requiresSeparateAuthority: entry.requiresSeparateAuthority,
    }
  }

  function getProvinceCreditTotal(code: string): number | null {
    const lines = provLinesByProvince.get(code)
    if (!lines) return null
    const totalLine = lines.find((l) => l.line_code === 'total_credit')
    return totalLine?.value ?? null
  }

  return (
    <div>
      <p className="text-[12px] font-semibold uppercase tracking-[0.08em] text-blue mb-3">Provincial</p>
      <h2 className="text-[1.5rem] font-serif text-[#1A1A1A] mb-6">Provincial Calculation</h2>

      {/* Three-Pass Status */}
      <div className="bg-white border border-[#E5E5E5] rounded-[6px] p-8 mb-6">
        <p className="text-[12px] font-semibold uppercase tracking-[0.08em] text-blue mb-4">Three-Pass Status</p>
        <div className="grid grid-cols-3 gap-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className={`w-2 h-2 rounded-full ${federalCalcDone ? 'bg-green-500' : 'bg-[#D4D4D4]'}`} />
              <p className="text-[12px] text-[#5A5A5A]">Step 1: Provisional Federal</p>
            </div>
            <p className="text-[15px] text-[#1A1A1A] pl-4">
              {federalCalcDone ? `QE: ${fmt(federalQE)}` : 'Not run'}
            </p>
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className={`w-2 h-2 rounded-full ${provincialCalcDone ? 'bg-green-500' : 'bg-[#D4D4D4]'}`} />
              <p className="text-[12px] text-[#5A5A5A]">Step 2: Provincial Credits</p>
            </div>
            <p className="text-[15px] text-[#1A1A1A] pl-4">
              {provincialCalcDone ? `${provLinesByProvince.size} province(s) calculated` : 'Not run'}
            </p>
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className={`w-2 h-2 rounded-full ${provincialAssistanceUpserted ? 'bg-green-500' : 'bg-[#D4D4D4]'}`} />
              <p className="text-[12px] text-[#5A5A5A]">Step 3: Final Federal</p>
            </div>
            <p className="text-[15px] text-[#1A1A1A] pl-4">
              {provincialAssistanceUpserted
                ? `${(assistanceRows ?? []).length} assistance item(s) applied`
                : 'Not run'}
            </p>
          </div>
        </div>
      </div>

      {/* Company & Claim Context */}
      <div className="bg-white border border-[#E5E5E5] rounded-[6px] p-8 mb-6">
        <p className="text-[12px] font-semibold uppercase tracking-[0.08em] text-blue mb-4">Context</p>
        <div className="grid grid-cols-4 gap-6 mb-4">
          <div>
            <p className="text-[12px] text-[#5A5A5A] mb-1">CCPC</p>
            <p className="text-[15px] text-[#1A1A1A]">{company?.ccpc_flag ? 'Yes' : 'No'}</p>
          </div>
          <div>
            <p className="text-[12px] text-[#5A5A5A] mb-1">Tax Year</p>
            <p className="text-[15px] text-[#1A1A1A]">{claimYear?.tax_year_start ?? '--'} to {claimYear?.tax_year_end ?? '--'}</p>
          </div>
          <div>
            <p className="text-[12px] text-[#5A5A5A] mb-1">Federal QE Base</p>
            <p className="text-[15px] font-mono text-[#1A1A1A]">{fmt(federalQE)}</p>
          </div>
          <div>
            <p className="text-[12px] text-[#5A5A5A] mb-1">Federal ITC</p>
            <p className="text-[15px] font-mono text-[#1A1A1A]">{fmt(federalITC)}</p>
          </div>
        </div>
        <div className="grid grid-cols-4 gap-6">
          <div>
            <p className="text-[12px] text-[#5A5A5A] mb-1">ON Specified Capital</p>
            <p className="text-[15px] font-mono text-[#1A1A1A]">{fmt(company?.specified_capital_amount)}</p>
          </div>
          <div>
            <p className="text-[12px] text-[#5A5A5A] mb-1">ON Prior Taxable Income</p>
            <p className="text-[15px] font-mono text-[#1A1A1A]">{fmt(company?.prior_year_taxable_income_on)}</p>
          </div>
          <div>
            <p className="text-[12px] text-[#5A5A5A] mb-1">MB Renunciation</p>
            <p className="text-[15px] text-[#1A1A1A]">
              {claimYear?.mb_renunciation_flag
                ? `Filed ${claimYear.mb_renunciation_date ?? ''}`
                : 'Not filed'}
            </p>
          </div>
          <div>
            <p className="text-[12px] text-[#5A5A5A] mb-1">SK Renunciation</p>
            <p className="text-[15px] text-[#1A1A1A]">{claimYear?.sk_renunciation_flag ? 'Filed' : 'Not filed'}</p>
          </div>
        </div>
      </div>

      {/* Province Cards */}
      {activeProvinces.length > 0 ? (
        <div className="space-y-4 mb-6">
          {activeProvinces.map(([code, totalAmount]) => {
            const info = getRegistryInfo(code)
            const creditTotal = getProvinceCreditTotal(code)
            const lines = provLinesByProvince.get(code) ?? []
            const isAB = code === 'AB'

            return (
              <div key={code} className="bg-white border border-[#E5E5E5] rounded-[6px] p-8">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <p className="text-[12px] font-semibold uppercase tracking-[0.08em] text-blue mb-1">
                      {info.status === 'active' || info.status === 'no-program' ? info.name : isAB ? 'Alberta' : code}
                    </p>
                    <div className="flex items-center gap-2">
                      <span className={`text-[11px] px-2 py-0.5 rounded font-semibold ${
                        info.status === 'active' || isAB
                          ? 'bg-blue/10 text-blue'
                          : info.status === 'no-program'
                          ? 'bg-[#F5F5F5] text-[#5A5A5A]'
                          : 'bg-orange-100 text-orange-700'
                      }`}>
                        {isAB ? 'IEG (inline)' : info.status === 'active' ? 'Adapter' : info.status === 'no-program' ? 'No Program' : 'Unknown'}
                      </span>
                      {info.status === 'active' && info.requiresSeparateAuthority && (
                        <span className="text-[11px] px-2 py-0.5 rounded font-semibold bg-amber-100 text-amber-700">
                          Revenue Québec
                        </span>
                      )}
                      {info.status === 'active' && info.hasRenunciation && (
                        <span className="text-[11px] px-2 py-0.5 rounded font-semibold bg-purple-100 text-purple-700">
                          Renunciation
                        </span>
                      )}
                      {info.status === 'active' && info.hasRecapture && (
                        <span className="text-[11px] px-2 py-0.5 rounded font-semibold bg-red-100 text-red-700">
                          Recapture
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    {creditTotal !== null ? (
                      <p className="text-[18px] font-mono font-semibold text-[#1A1A1A]">{fmt(creditTotal)}</p>
                    ) : (
                      <p className="text-[14px] text-[#5A5A5A]">Not calculated</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-6 mb-4">
                  <div>
                    <p className="text-[12px] text-[#5A5A5A] mb-1">Qualified Expenditures</p>
                    <p className="text-[15px] font-mono text-[#1A1A1A]">{fmt(totalAmount)}</p>
                  </div>
                  <div>
                    <p className="text-[12px] text-[#5A5A5A] mb-1">Forms Required</p>
                    <p className="text-[15px] text-[#1A1A1A]">
                      {isAB
                        ? 'AT1-SCH29'
                        : info.status === 'active'
                        ? info.forms.join(', ')
                        : '--'}
                    </p>
                  </div>
                  <div>
                    <p className="text-[12px] text-[#5A5A5A] mb-1">Adapter Flags</p>
                    <p className="text-[13px] text-[#1A1A1A]">
                      {isAB
                        ? 'Fed base, assistance reduces'
                        : info.status === 'active'
                        ? [
                            info.usesFederalBase ? 'Fed base' : 'Own base',
                            info.assistanceReducesBase ? 'Asst reduces' : 'Asst no-reduce (NL)',
                          ].join(', ')
                        : '--'}
                    </p>
                  </div>
                </div>

                {/* Credit line values if calculated */}
                {lines.length > 0 && (
                  <div className="border-t border-[#E5E5E5] pt-4">
                    <p className="text-[12px] text-[#5A5A5A] mb-2">Calculated Values</p>
                    <div className="space-y-2">
                      {lines.map((l, i) => (
                        <div key={i} className="flex items-center justify-between">
                          <div>
                            <span className="font-mono text-[11px] text-[#5A5A5A] mr-2">{l.form_code}</span>
                            <span className="text-[13px] text-[#1A1A1A]">{l.line_code.replace(/_/g, ' ')}</span>
                          </div>
                          <span className="text-[13px] font-mono text-[#1A1A1A]">{fmt(l.value)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      ) : (
        <div className="bg-white border border-[#E5E5E5] rounded-[6px] p-8 text-center mb-6">
          <p className="text-[15px] text-[#5A5A5A] mb-2">
            No provinces have cost splits allocated yet.
          </p>
          <p className="text-[13px] text-[#5A5A5A]">
            Assign province codes to cost line project splits, then return here to see provincial credit calculations.
          </p>
        </div>
      )}

      {/* No-program jurisdictions */}
      {activeProvinces.some(([code]) => NO_PROGRAM_CODES.includes(code as 'PE' | 'NT' | 'NU')) && (
        <div className="bg-amber-50 border border-amber-200 rounded-[6px] p-6 mb-6">
          <p className="text-[13px] text-amber-800">
            Cost splits exist for jurisdictions with no provincial SR&ED program (
            {activeProvinces
              .filter(([code]) => NO_PROGRAM_CODES.includes(code as 'PE' | 'NT' | 'NU'))
              .map(([code]) => code)
              .join(', ')}
            ). Only the federal SR&ED credit applies in these jurisdictions.
          </p>
        </div>
      )}

      <p className="text-[12px] text-[#5A5A5A] mt-4">
        All figures are Estimated. Provincial credit rates and eligibility thresholds are subject to provincial legislation.
        Credits marked as government assistance will reduce the federal qualified expenditure pool in Step 3.
      </p>
    </div>
  )
}
