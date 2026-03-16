/**
 * Recalculation orchestration service.
 *
 * Single canonical entry point for the deterministic recalculation pipeline:
 *   1. Acquire claim-year lock
 *   2. Create recalc_runs row (status: running)
 *   3. Clear prior recalc-generated provincial assistance only
 *   4. Provisional federal calculation
 *   5. Provincial credit dispatch (sorted province order)
 *   6. Upsert provincial-credit-derived assistance items
 *   7. Final federal calculation
 *   8. Run review rules
 *   9. Persist summary → status: succeeded
 *  10. Release lock
 *
 * All callers (routes, mutation triggers) MUST use this service
 * rather than chaining federal / provincial / review manually.
 */

import { SupabaseClient } from '@supabase/supabase-js'
import {
  calculateFederalWaterfall,
  saveFederalLineValues,
} from './federalCalcService'
import {
  calculateProvincialCredits,
  saveProvincialLineValues,
} from './provincialCalcService'
import { runAllRules } from './reviewService'

// ── Shared money-rounding helper ──

/**
 * Round a number to 2 decimal places for persistence.
 * Uses banker's rounding (round half to even) via toFixed + parseFloat.
 */
export function roundMoney(value: number): number {
  return Math.round(value * 100) / 100
}

// ── Types ──

export interface RecalcOptions {
  triggerSource?: string
  triggerEntity?: string
  triggerEntityId?: string
  initiatedBy?: string | null
  /** Force recalculation even if a stale lock exists */
  force?: boolean
}

export interface ProvincialCreditSummary {
  provinceCode: string
  creditAmount: number
  federalAssistanceAmount: number
}

export interface ReviewSummaryCount {
  blockers: number
  warnings: number
  info: number
}

export interface RecalcResult {
  claimYearId: string
  status: 'succeeded' | 'failed'
  provisionalFederalQualifiedExpenditures: number
  finalFederalQualifiedExpenditures: number
  provincesProcessed: string[]
  provincialCredits: ProvincialCreditSummary[]
  totalProvincialAssistance: number
  reviewSummary: ReviewSummaryCount
  runId: string
  startedAt: string
  finishedAt: string
}

export interface RecalcRun {
  id: string
  claim_year_id: string
  status: 'running' | 'succeeded' | 'failed' | 'cancelled'
  trigger_source: string | null
  trigger_entity: string | null
  trigger_entity_id: string | null
  initiated_by: string | null
  started_at: string
  finished_at: string | null
  error_message: string | null
  provisional_federal_qe: number | null
  final_federal_qe: number | null
  provinces_processed: string[] | null
  provincial_credits: ProvincialCreditSummary[] | null
  review_summary: ReviewSummaryCount | null
  metadata: Record<string, unknown> | null
}

export interface ClaimRecalcLock {
  claim_year_id: string
  locked_at: string
  locked_by: string | null
  run_id: string | null
}

// ── Custom errors ──

export class RecalcLockError extends Error {
  constructor(
    message: string,
    public claimYearId: string,
    public existingLock?: ClaimRecalcLock
  ) {
    super(message)
    this.name = 'RecalcLockError'
  }
}

export class RecalcDependencyError extends Error {
  constructor(message: string, public step: string) {
    super(message)
    this.name = 'RecalcDependencyError'
  }
}

// ── Lock management ──

/** Stale lock threshold: 5 minutes */
const LOCK_TIMEOUT_MS = 5 * 60 * 1000

async function acquireLock(
  sb: SupabaseClient,
  claimYearId: string,
  runId: string,
  initiatedBy: string | null,
  force: boolean
): Promise<void> {
  // Check for existing lock
  const { data: existing } = await sb
    .from('claim_recalc_locks')
    .select('*')
    .eq('claim_year_id', claimYearId)
    .maybeSingle()

  if (existing) {
    const lockAge = Date.now() - new Date(existing.locked_at).getTime()
    const isStale = lockAge > LOCK_TIMEOUT_MS

    if (!isStale && !force) {
      throw new RecalcLockError(
        `Claim year ${claimYearId} is already being recalculated (locked ${Math.round(lockAge / 1000)}s ago)`,
        claimYearId,
        existing as ClaimRecalcLock
      )
    }

    // Stale or forced: take over the lock
    // If the prior run is still 'running', mark it cancelled
    if (existing.run_id) {
      await sb
        .from('recalc_runs')
        .update({
          status: 'cancelled',
          finished_at: new Date().toISOString(),
          error_message: force
            ? 'Cancelled by forced recalculation'
            : 'Cancelled due to stale lock timeout',
        })
        .eq('id', existing.run_id)
        .eq('status', 'running')
    }

    // Update lock
    const { error } = await sb
      .from('claim_recalc_locks')
      .update({
        locked_at: new Date().toISOString(),
        locked_by: initiatedBy,
        run_id: runId,
      })
      .eq('claim_year_id', claimYearId)

    if (error) throw error
  } else {
    // Insert new lock
    const { error } = await sb.from('claim_recalc_locks').insert({
      claim_year_id: claimYearId,
      locked_at: new Date().toISOString(),
      locked_by: initiatedBy,
      run_id: runId,
    })

    if (error) throw error
  }
}

async function releaseLock(
  sb: SupabaseClient,
  claimYearId: string
): Promise<void> {
  await sb
    .from('claim_recalc_locks')
    .delete()
    .eq('claim_year_id', claimYearId)
}

// ── Main orchestration ──

export async function runClaimRecalculation(
  sb: SupabaseClient,
  claimYearId: string,
  options?: RecalcOptions
): Promise<RecalcResult> {
  const startedAt = new Date().toISOString()

  // Create the run record first (before lock, so we have the runId)
  const { data: runRow, error: runErr } = await sb
    .from('recalc_runs')
    .insert({
      claim_year_id: claimYearId,
      status: 'running',
      trigger_source: options?.triggerSource ?? 'manual',
      trigger_entity: options?.triggerEntity ?? null,
      trigger_entity_id: options?.triggerEntityId ?? null,
      initiated_by: options?.initiatedBy ?? null,
      started_at: startedAt,
    })
    .select('id')
    .single()

  if (runErr || !runRow) {
    throw new RecalcDependencyError(
      `Failed to create recalc_runs row: ${runErr?.message}`,
      'init'
    )
  }

  const runId = runRow.id

  try {
    // ── 1. Acquire lock ──
    await acquireLock(
      sb,
      claimYearId,
      runId,
      options?.initiatedBy ?? null,
      options?.force ?? false
    )

    // ── 2. Load claim context ──
    const { data: claimYear, error: cyErr } = await sb
      .from('claim_years')
      .select(
        'tax_year_start, method_election, associated_corp_flag, taxable_capital_eoy, company_id'
      )
      .eq('id', claimYearId)
      .single()

    if (cyErr || !claimYear) {
      throw new RecalcDependencyError(
        'Claim year not found',
        'load_context'
      )
    }

    const { data: company } = await sb
      .from('companies')
      .select('ccpc_flag')
      .eq('id', claimYear.company_id)
      .single()

    const isCcpc = company?.ccpc_flag ?? true

    const federalOpts = {
      taxYearStart: claimYear.tax_year_start || '2025-01-01',
      isCcpc,
      method: (claimYear.method_election || 'proxy') as 'proxy' | 'traditional',
    }

    // ── 3. Clear prior recalc-generated provincial assistance ──
    // Only delete rows where generated_by = 'recalc_pipeline'
    // Manual/user-entered assistance rows are untouched
    await sb
      .from('assistance_items')
      .delete()
      .eq('claim_year_id', claimYearId)
      .eq('generated_by', 'recalc_pipeline')

    // ── 4. Provisional federal calculation ──
    const provisionalFederal = await calculateFederalWaterfall(
      sb,
      claimYearId,
      federalOpts
    )

    // ── 5. Provincial credit dispatch (sorted by province code) ──
    const provincialResults = await calculateProvincialCredits(
      sb,
      claimYearId,
      provisionalFederal.qualifiedExpenditures
    )

    // ── 6. Sum federalAssistanceAmount and upsert assistance items ──
    const totalProvincialAssistance = provincialResults.reduce(
      (sum, r) => sum + r.federalAssistanceAmount,
      0
    )

    for (const r of provincialResults) {
      if (r.federalAssistanceAmount <= 0) continue

      await sb.from('assistance_items').upsert(
        {
          claim_year_id: claimYearId,
          assistance_type: 'government_assistance',
          source_name: `${r.provinceName} SR&ED Tax Credit`,
          amount: roundMoney(r.federalAssistanceAmount),
          linked_project_id: null,
          generated_by: 'recalc_pipeline',
          recalc_run_id: runId,
          treatment_notes: JSON.stringify({
            generated_by: 'recalc_pipeline',
            province_code: r.provinceCode,
            adapter_id: `${r.provinceCode.toLowerCase()}-sred-adapter`,
            run_id: runId,
            calculated_at: new Date().toISOString(),
            total_credit: roundMoney(r.creditAmount),
            federal_assistance_portion: roundMoney(r.federalAssistanceAmount),
          }),
        },
        {
          onConflict: 'claim_year_id,source_name',
          ignoreDuplicates: false,
        }
      )
    }

    // ── 7. Final federal calculation (now includes provincial assistance) ──
    const finalFederal = await calculateFederalWaterfall(
      sb,
      claimYearId,
      federalOpts
    )

    // ── 8. Save all line values (rounded) ──
    // The save functions write to DB; we round the waterfall values
    // before passing to ensure persistence consistency
    const roundedFinalFederal = {
      ...finalFederal,
      totalExpenditures: roundMoney(finalFederal.totalExpenditures),
      exclusions: roundMoney(finalFederal.exclusions),
      proxyOrOverhead: roundMoney(finalFederal.proxyOrOverhead),
      assistance: roundMoney(finalFederal.assistance),
      qualifiedExpenditures: roundMoney(finalFederal.qualifiedExpenditures),
      enhancedItc: roundMoney(finalFederal.enhancedItc),
      basicItc: roundMoney(finalFederal.basicItc),
      totalItc: roundMoney(finalFederal.totalItc),
    }

    await saveFederalLineValues(sb, claimYearId, null, roundedFinalFederal)
    await saveProvincialLineValues(sb, claimYearId, null, provincialResults)

    // ── 9. Run review rules ──
    const reviewResult = await runAllRules(sb, claimYearId)

    const reviewSummary: ReviewSummaryCount = {
      blockers: reviewResult.blockerCount,
      warnings: reviewResult.warningCount,
      info: reviewResult.infoCount,
    }

    // ── 10. Build summary ──
    const provincesProcessed = provincialResults.map((r) => r.provinceCode)
    const provincialCredits: ProvincialCreditSummary[] = provincialResults.map(
      (r) => ({
        provinceCode: r.provinceCode,
        creditAmount: roundMoney(r.creditAmount),
        federalAssistanceAmount: roundMoney(r.federalAssistanceAmount),
      })
    )

    const finishedAt = new Date().toISOString()

    // Persist final state to recalc_runs
    await sb
      .from('recalc_runs')
      .update({
        status: 'succeeded',
        finished_at: finishedAt,
        provisional_federal_qe: roundMoney(
          provisionalFederal.qualifiedExpenditures
        ),
        final_federal_qe: roundMoney(finalFederal.qualifiedExpenditures),
        provinces_processed: provincesProcessed,
        provincial_credits: provincialCredits,
        review_summary: reviewSummary,
      })
      .eq('id', runId)

    // Release lock
    await releaseLock(sb, claimYearId)

    // Update claim year updated_at
    await sb
      .from('claim_years')
      .update({ updated_at: finishedAt })
      .eq('id', claimYearId)

    return {
      claimYearId,
      status: 'succeeded',
      provisionalFederalQualifiedExpenditures: roundMoney(
        provisionalFederal.qualifiedExpenditures
      ),
      finalFederalQualifiedExpenditures: roundMoney(
        finalFederal.qualifiedExpenditures
      ),
      provincesProcessed,
      provincialCredits,
      totalProvincialAssistance: roundMoney(totalProvincialAssistance),
      reviewSummary,
      runId,
      startedAt,
      finishedAt,
    }
  } catch (err) {
    // Mark run as failed and release lock
    const errorMessage =
      err instanceof Error ? err.message : 'Unknown recalculation error'

    await sb
      .from('recalc_runs')
      .update({
        status: 'failed',
        finished_at: new Date().toISOString(),
        error_message: errorMessage,
      })
      .eq('id', runId)

    await releaseLock(sb, claimYearId)

    throw err
  }
}

// ── Query helpers ──

export async function getLatestRecalcRun(
  sb: SupabaseClient,
  claimYearId: string
): Promise<RecalcRun | null> {
  const { data, error } = await sb
    .from('recalc_runs')
    .select('*')
    .eq('claim_year_id', claimYearId)
    .order('started_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (error) throw error
  return (data as RecalcRun) ?? null
}

export async function listRecalcRuns(
  sb: SupabaseClient,
  claimYearId: string,
  limit = 20
): Promise<RecalcRun[]> {
  const { data, error } = await sb
    .from('recalc_runs')
    .select('*')
    .eq('claim_year_id', claimYearId)
    .order('started_at', { ascending: false })
    .limit(limit)

  if (error) throw error
  return (data ?? []) as RecalcRun[]
}

export async function getRecalcLock(
  sb: SupabaseClient,
  claimYearId: string
): Promise<ClaimRecalcLock | null> {
  const { data, error } = await sb
    .from('claim_recalc_locks')
    .select('*')
    .eq('claim_year_id', claimYearId)
    .maybeSingle()

  if (error) throw error
  return (data as ClaimRecalcLock) ?? null
}
