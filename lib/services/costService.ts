/**
 * Cost service: import management, line items, classification,
 * project splits, and cost summaries.
 */

import { SupabaseClient } from '@supabase/supabase-js'
import type {
  CostImport,
  CostLineItem,
  CostLineClassification,
  CostLineProjectSplit,
  RawCostRow,
  ClassificationInput,
  ProjectSplitInput,
  CostSummary,
} from './types'

// ── Cost Imports ──

export async function listImports(
  sb: SupabaseClient,
  claimYearId: string
): Promise<CostImport[]> {
  const { data, error } = await sb
    .from('cost_imports')
    .select('*')
    .eq('claim_year_id', claimYearId)
    .order('imported_at', { ascending: false })

  if (error) throw error
  return (data ?? []) as CostImport[]
}

export async function createImport(
  sb: SupabaseClient,
  claimYearId: string,
  sourceType: string,
  sourceName: string | null
): Promise<CostImport> {
  const { data, error } = await sb
    .from('cost_imports')
    .insert({
      claim_year_id: claimYearId,
      source_type: sourceType,
      source_name: sourceName,
      status: 'pending' as const,
    })
    .select()
    .single()

  if (error) throw error
  return data as CostImport
}

export async function updateImportStatus(
  sb: SupabaseClient,
  importId: string,
  status: CostImport['status'],
  rowCount?: number
): Promise<CostImport> {
  const updates: Record<string, unknown> = { status }
  if (rowCount !== undefined) updates.row_count = rowCount

  const { data, error } = await sb
    .from('cost_imports')
    .update(updates)
    .eq('id', importId)
    .select()
    .single()

  if (error) throw error
  return data as CostImport
}

// ── Cost Line Items ──

export async function insertLineItems(
  sb: SupabaseClient,
  importId: string,
  claimYearId: string,
  rows: RawCostRow[]
): Promise<CostLineItem[]> {
  const records = rows.map((r) => ({
    cost_import_id: importId,
    claim_year_id: claimYearId,
    line_date: r.line_date ?? null,
    vendor_or_employee: r.vendor_or_employee ?? null,
    description: r.description ?? null,
    gl_account: r.gl_account ?? null,
    gross_amount: r.gross_amount ?? null,
    tax_amount: r.tax_amount ?? null,
    net_amount: r.net_amount ?? null,
    currency: r.currency ?? 'CAD',
    raw_payload_json: r.raw_payload_json ?? null,
  }))

  const { data, error } = await sb
    .from('cost_line_items')
    .insert(records)
    .select()

  if (error) throw error
  return (data ?? []) as CostLineItem[]
}

export async function listLineItems(
  sb: SupabaseClient,
  claimYearId: string,
  options?: { importId?: string; limit?: number; offset?: number }
): Promise<CostLineItem[]> {
  let query = sb
    .from('cost_line_items')
    .select('*')
    .eq('claim_year_id', claimYearId)
    .order('line_date', { ascending: true })

  if (options?.importId) {
    query = query.eq('cost_import_id', options.importId)
  }
  if (options?.limit) {
    query = query.limit(options.limit)
  }
  if (options?.offset) {
    query = query.range(
      options.offset,
      options.offset + (options.limit ?? 50) - 1
    )
  }

  const { data, error } = await query
  if (error) throw error
  return (data ?? []) as CostLineItem[]
}

export async function getLineItem(
  sb: SupabaseClient,
  lineItemId: string
): Promise<CostLineItem> {
  const { data, error } = await sb
    .from('cost_line_items')
    .select('*')
    .eq('id', lineItemId)
    .single()

  if (error) throw error
  return data as CostLineItem
}

// ── Classification ──

export async function upsertClassification(
  sb: SupabaseClient,
  lineItemId: string,
  input: ClassificationInput
): Promise<CostLineClassification> {
  const { data, error } = await sb
    .from('cost_line_classifications')
    .upsert(
      {
        cost_line_item_id: lineItemId,
        likely_category: input.likely_category,
        confidence_score: input.confidence_score ?? null,
        related_party_flag: input.related_party_flag ?? false,
        excluded_flag: input.excluded_flag ?? false,
        rationale: input.rationale ?? null,
        classified_by: input.classified_by ?? 'manual',
      },
      { onConflict: 'cost_line_item_id' }
    )
    .select()
    .single()

  if (error) throw error
  return data as CostLineClassification
}

export async function listClassifications(
  sb: SupabaseClient,
  lineItemIds: string[]
): Promise<CostLineClassification[]> {
  const { data, error } = await sb
    .from('cost_line_classifications')
    .select('*')
    .in('cost_line_item_id', lineItemIds)

  if (error) throw error
  return (data ?? []) as CostLineClassification[]
}

// ── Project Splits ──

export async function upsertProjectSplits(
  sb: SupabaseClient,
  lineItemId: string,
  splits: ProjectSplitInput[]
): Promise<CostLineProjectSplit[]> {
  // Remove existing splits for this line item then insert fresh
  const { error: delErr } = await sb
    .from('cost_line_project_splits')
    .delete()
    .eq('cost_line_item_id', lineItemId)

  if (delErr) throw delErr

  const records = splits.map((s) => ({
    cost_line_item_id: lineItemId,
    project_id: s.project_id,
    allocation_percent: s.allocation_percent,
    allocation_amount: s.allocation_amount,
    province_code: s.province_code ?? 'ON',
    province_percent: s.province_percent ?? 100,
    review_status: 'pending' as const,
  }))

  const { data, error } = await sb
    .from('cost_line_project_splits')
    .insert(records)
    .select()

  if (error) throw error
  return (data ?? []) as CostLineProjectSplit[]
}

export async function listSplitsForProject(
  sb: SupabaseClient,
  projectId: string
): Promise<CostLineProjectSplit[]> {
  const { data, error } = await sb
    .from('cost_line_project_splits')
    .select('*')
    .eq('project_id', projectId)

  if (error) throw error
  return (data ?? []) as CostLineProjectSplit[]
}

export async function updateSplitStatus(
  sb: SupabaseClient,
  splitId: string,
  reviewStatus: CostLineProjectSplit['review_status']
): Promise<CostLineProjectSplit> {
  const { data, error } = await sb
    .from('cost_line_project_splits')
    .update({ review_status: reviewStatus })
    .eq('id', splitId)
    .select()
    .single()

  if (error) throw error
  return data as CostLineProjectSplit
}

// ── Cost Summary ──

export async function getCostSummary(
  sb: SupabaseClient,
  claimYearId: string
): Promise<CostSummary> {
  // All line items for this claim year
  const { data: items, error: itemErr } = await sb
    .from('cost_line_items')
    .select('id, net_amount')
    .eq('claim_year_id', claimYearId)

  if (itemErr) throw itemErr
  const allItems = (items ?? []) as Array<{ id: string; net_amount: number | null }>
  const itemIds = allItems.map((i) => i.id)

  // Classifications
  let classifications: CostLineClassification[] = []
  if (itemIds.length > 0) {
    const { data: cls, error: clsErr } = await sb
      .from('cost_line_classifications')
      .select('*')
      .in('cost_line_item_id', itemIds)

    if (clsErr) throw clsErr
    classifications = (cls ?? []) as CostLineClassification[]
  }

  const classifiedSet = new Set(classifications.map((c) => c.cost_line_item_id))

  const totalByCategory: Record<string, number> = {}
  for (const cls of classifications) {
    const item = allItems.find((i) => i.id === cls.cost_line_item_id)
    const amt = item?.net_amount ?? 0
    totalByCategory[cls.likely_category] =
      (totalByCategory[cls.likely_category] ?? 0) + amt
  }

  // Province splits
  let provinceSplits: Record<string, number> = {}
  if (itemIds.length > 0) {
    const { data: splits, error: spErr } = await sb
      .from('cost_line_project_splits')
      .select('province_code, allocation_amount')
      .in('cost_line_item_id', itemIds)

    if (spErr) throw spErr

    for (const s of (splits ?? []) as Array<{
      province_code: string
      allocation_amount: number
    }>) {
      provinceSplits[s.province_code] =
        (provinceSplits[s.province_code] ?? 0) + s.allocation_amount
    }
  }

  return {
    totalByCategory,
    mappedCount: classifiedSet.size,
    unmappedCount: allItems.length - classifiedSet.size,
    provinceSplits,
  }
}
