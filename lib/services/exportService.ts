/**
 * Export service: snapshot creation, file generation, and Supabase Storage
 * upload for export bundles.
 *
 * Provincial exports are a pure serialization/packaging layer over existing
 * adapter results. They do NOT recalculate credits — they read what the
 * adapters have already written to provincial_line_values.
 */

import { SupabaseClient } from '@supabase/supabase-js'
import { generateXlsx } from '@/lib/portal/xlsx-export'
import { generatePdf } from '@/lib/portal/pdf-export'
import type { ClaimJson } from '@/lib/portal/claim-builder'
import type { ClaimSnapshot, ExportBundle } from './types'
import { PROVINCE_REGISTRY, hasProgram } from './provincial'

// ── Storage bucket name ──

const EXPORT_BUCKET = 'claim-exports'

// ── Alberta backward compatibility ──

const AB_FORM_CODE = 'AT1-SCH29'

// ── Snapshot helpers ──

/**
 * Build a full claim state snapshot as JSON. This captures the
 * current state of the claim year, projects, costs, narratives,
 * contacts, and calculated line values.
 */
export async function buildSnapshotPayload(
  sb: SupabaseClient,
  claimYearId: string
): Promise<Record<string, unknown>> {
  const [
    claimYearRes,
    projectsRes,
    costImportsRes,
    costLineItemsRes,
    costClassificationsRes,
    costSplitsRes,
    contactsRes,
    assistanceRes,
    federalLinesRes,
    provincialLinesRes,
  ] = await Promise.all([
    sb.from('claim_years').select('*').eq('id', claimYearId).single(),
    sb.from('projects').select('*').eq('claim_year_id', claimYearId),
    sb.from('cost_imports').select('*').eq('claim_year_id', claimYearId),
    sb.from('cost_line_items').select('*').eq('claim_year_id', claimYearId),
    sb.from('cost_line_classifications').select('*'),
    sb.from('cost_line_project_splits').select('*').eq('claim_year_id', claimYearId),
    sb.from('claim_contacts').select('*').eq('claim_year_id', claimYearId),
    sb.from('assistance_items').select('*').eq('claim_year_id', claimYearId),
    sb
      .from('federal_line_values')
      .select('*')
      .eq('claim_year_id', claimYearId)
      .is('snapshot_id', null),
    sb
      .from('provincial_line_values')
      .select('*')
      .eq('claim_year_id', claimYearId)
      .is('snapshot_id', null),
  ])

  if (claimYearRes.error) throw claimYearRes.error

  // Fetch narratives for all projects
  const projectIds = (projectsRes.data ?? []).map(
    (p: { id: string }) => p.id
  )
  let narratives: unknown[] = []
  let evidenceLinks: unknown[] = []
  let persons: unknown[] = []

  if (projectIds.length > 0) {
    const [narRes, linkRes, personRes] = await Promise.all([
      sb
        .from('project_narrative_sections')
        .select('*')
        .in('project_id', projectIds),
      sb
        .from('project_evidence_links')
        .select('*')
        .in('project_id', projectIds),
      sb.from('project_people').select('*').in('project_id', projectIds),
    ])

    narratives = narRes.data ?? []
    evidenceLinks = linkRes.data ?? []
    persons = personRes.data ?? []
  }

  // Filter classifications to only those belonging to this claim year's line items
  const lineItemIds = new Set(
    (costLineItemsRes.data ?? []).map((li: { id: string }) => li.id)
  )
  const filteredClassifications = (costClassificationsRes.data ?? []).filter(
    (c: { cost_line_item_id: string }) => lineItemIds.has(c.cost_line_item_id)
  )

  return {
    captured_at: new Date().toISOString(),
    claim_year: claimYearRes.data,
    projects: projectsRes.data ?? [],
    cost_imports: costImportsRes.data ?? [],
    cost_line_items: costLineItemsRes.data ?? [],
    cost_line_classifications: filteredClassifications,
    cost_line_project_splits: costSplitsRes.data ?? [],
    contacts: contactsRes.data ?? [],
    assistance: assistanceRes.data ?? [],
    narratives,
    evidence_links: evidenceLinks,
    persons,
    federal_line_values: federalLinesRes.data ?? [],
    provincial_line_values: provincialLinesRes.data ?? [],
  }
}

/**
 * Persist a snapshot to the claim_snapshots table.
 */
export async function createSnapshot(
  sb: SupabaseClient,
  claimYearId: string,
  snapshotType: ClaimSnapshot['snapshot_type'],
  payloadJson: Record<string, unknown>
): Promise<ClaimSnapshot> {
  const { data, error } = await sb
    .from('claim_snapshots')
    .insert({
      claim_year_id: claimYearId,
      snapshot_type: snapshotType,
      payload_json: payloadJson,
    })
    .select()
    .single()

  if (error) throw error
  return data as ClaimSnapshot
}

// ── Export generation ──

export interface GenerateExportOptions {
  claimYearId: string
  exportType: 'xlsx' | 'pdf' | 'json' | 'provincial_package'
  versionLabel: string
  generatedBy: string | null
  /** Pre-built ClaimJson for XLSX/PDF. Must be provided for xlsx/pdf exports. */
  claimJson?: ClaimJson
  /** Required for provincial_package exports. Also accepted for alberta_package compat. */
  provinceCode?: string
}

/** Typed error for export validation failures. */
export class ExportValidationError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly provinceCode?: string
  ) {
    super(message)
    this.name = 'ExportValidationError'
  }
}

/**
 * Generate an export bundle: create a snapshot, generate the file,
 * upload to Supabase Storage, and record the bundle metadata.
 *
 * For provincial_package exports: reads existing adapter results from
 * provincial_line_values — does NOT recalculate credits.
 */
export async function generateExportBundle(
  sb: SupabaseClient,
  opts: GenerateExportOptions
): Promise<ExportBundle> {
  // ── Alberta backward compat: map alberta_package → provincial_package + AB ──
  let effectiveType = opts.exportType
  let effectiveProvinceCode = opts.provinceCode ?? null

  if (opts.exportType === 'provincial_package') {
    if (!opts.provinceCode) {
      throw new ExportValidationError(
        'provincial_package export requires province_code',
        'MISSING_PROVINCE_CODE'
      )
    }
    effectiveProvinceCode = opts.provinceCode
  }

  // ── Provincial package branch ──
  if (effectiveType === 'provincial_package' && effectiveProvinceCode) {
    return generateProvincialBundle(sb, opts, effectiveProvinceCode)
  }

  // ── Standard (non-provincial) export branch ──
  return generateStandardBundle(sb, opts)
}

// ── Provincial export ──

async function generateProvincialBundle(
  sb: SupabaseClient,
  opts: GenerateExportOptions,
  provinceCode: string
): Promise<ExportBundle> {
  const { claimYearId, versionLabel, generatedBy } = opts

  // 1. Resolve form codes for this province
  const formCodes = resolveFormCodes(provinceCode)
  const submissionAuthority = provinceCode === 'QC' ? 'Revenue Quebec' as const : 'CRA' as const

  // 2. Validate that provincial results exist
  const { data: provLines, error: plErr } = await sb
    .from('provincial_line_values')
    .select('line_code, value, form_code, explanation')
    .eq('claim_year_id', claimYearId)
    .eq('province_code', provinceCode)
    .is('snapshot_id', null)

  if (plErr) throw plErr

  if (!provLines || provLines.length === 0) {
    throw new ExportValidationError(
      `No provincial calculation results found for ${provinceCode}. Run the provincial calculation before exporting.`,
      'NO_PROVINCIAL_RESULTS',
      provinceCode
    )
  }

  // 3. Validate non-empty form codes (regime gate may have cleared them)
  if (formCodes.length === 0) {
    // Create a skipped bundle rather than failing hard
    const { data: skippedBundle, error: skipErr } = await sb
      .from('export_bundles')
      .insert({
        claim_year_id: claimYearId,
        version_label: versionLabel,
        export_type: 'provincial_package',
        province_code: provinceCode,
        status: 'skipped',
        generated_by: generatedBy,
        export_metadata: {
          form_codes: [],
          submission_authority: submissionAuthority,
          skipped_reason: `No form codes resolved for ${provinceCode} — a regime gate or no-program condition prevented form generation.`,
          generated_at: new Date().toISOString(),
        },
      })
      .select()
      .single()

    if (skipErr) throw skipErr
    return skippedBundle as ExportBundle
  }

  // 4. Create the bundle record in 'generating' status
  const { data: bundle, error: bundleErr } = await sb
    .from('export_bundles')
    .insert({
      claim_year_id: claimYearId,
      version_label: versionLabel,
      export_type: 'provincial_package',
      province_code: provinceCode,
      status: 'generating',
      generated_by: generatedBy,
      export_metadata: {
        form_codes: formCodes,
        submission_authority: submissionAuthority,
        generated_at: new Date().toISOString(),
      },
    })
    .select()
    .single()

  if (bundleErr) throw bundleErr
  const exportBundle = bundle as ExportBundle

  try {
    // 5. Build and persist snapshot
    const payload = await buildSnapshotPayload(sb, claimYearId)
    const snapshot = await createSnapshot(sb, claimYearId, 'pre_export', payload)

    // Extract company_id for storage path namespacing
    const companyId = (payload.claim_year as Record<string, unknown>)?.company_id as string

    // 6. Generate provincial package as JSON (form PDFs are future work —
    //    each CRA form like T666, T2SCH566, etc. needs a dedicated template)
    //    Use snapshot data — not live query — to guarantee export reflects
    //    the exact claim state at snapshot time.
    const snapshotProvLines = (
      (payload.provincial_line_values as Array<Record<string, unknown>>) ?? []
    ).filter((lv) => lv.province_code === provinceCode)

    const provincialPayload = {
      province_code: provinceCode,
      submission_authority: submissionAuthority,
      form_codes: formCodes,
      line_values: snapshotProvLines,
      exported_at: new Date().toISOString(),
      snapshot_id: snapshot.id,
    }

    const jsonStr = JSON.stringify(provincialPayload, null, 2)
    const fileBuffer = Buffer.from(jsonStr, 'utf-8')
    const storageKey = `${companyId}/${claimYearId}/provincial/${provinceCode}/${versionLabel}.json`

    // 7. Upload to storage
    const { error: uploadErr } = await sb.storage
      .from(EXPORT_BUCKET)
      .upload(storageKey, fileBuffer, {
        contentType: 'application/json',
        upsert: true,
      })

    if (uploadErr) throw uploadErr

    // 8. Update bundle record with success
    const { data: updated, error: updateErr } = await sb
      .from('export_bundles')
      .update({
        status: 'ready' as const,
        snapshot_id: snapshot.id,
        storage_key: storageKey,
        file_size: fileBuffer.length,
      })
      .eq('id', exportBundle.id)
      .select()
      .single()

    if (updateErr) throw updateErr
    return updated as ExportBundle
  } catch (err) {
    // Mark bundle as failed
    await sb
      .from('export_bundles')
      .update({ status: 'failed' as const })
      .eq('id', exportBundle.id)

    throw err
  }
}

/**
 * Resolve form codes for a province. Uses the adapter registry for strategy
 * provinces, hardcoded for Alberta (inline), empty for no-program provinces.
 */
function resolveFormCodes(provinceCode: string): string[] {
  // Alberta — inline, not in registry
  if (provinceCode === 'AB') return [AB_FORM_CODE]

  const entry = PROVINCE_REGISTRY[provinceCode]
  if (!entry) return []
  if (!hasProgram(entry)) return []

  return entry.allFormCodes
}

// ── Standard (non-provincial) export ──

async function generateStandardBundle(
  sb: SupabaseClient,
  opts: GenerateExportOptions
): Promise<ExportBundle> {
  const { claimYearId, exportType, versionLabel, generatedBy } = opts

  // 1. Create the export bundle record in 'generating' status
  const { data: bundle, error: bundleErr } = await sb
    .from('export_bundles')
    .insert({
      claim_year_id: claimYearId,
      version_label: versionLabel,
      export_type: exportType,
      status: 'generating' as const,
      generated_by: generatedBy,
    })
    .select()
    .single()

  if (bundleErr) throw bundleErr
  const exportBundle = bundle as ExportBundle

  try {
    // 2. Build and persist snapshot
    const payload = await buildSnapshotPayload(sb, claimYearId)
    const snapshot = await createSnapshot(
      sb,
      claimYearId,
      'pre_export',
      payload
    )

    // Extract company_id for storage path namespacing
    const companyId = (payload.claim_year as Record<string, unknown>)?.company_id as string

    // 3. Generate the file
    let fileBuffer: Buffer
    let mimeType: string
    let fileExtension: string

    switch (exportType) {
      case 'xlsx': {
        if (!opts.claimJson) {
          throw new Error('claimJson is required for XLSX export')
        }
        fileBuffer = await generateXlsx(opts.claimJson)
        mimeType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        fileExtension = 'xlsx'
        break
      }
      case 'pdf': {
        if (!opts.claimJson) {
          throw new Error('claimJson is required for PDF export')
        }
        fileBuffer = await generatePdf(opts.claimJson)
        mimeType = 'application/pdf'
        fileExtension = 'pdf'
        break
      }
      case 'json': {
        const jsonStr = JSON.stringify(payload, null, 2)
        fileBuffer = Buffer.from(jsonStr, 'utf-8')
        mimeType = 'application/json'
        fileExtension = 'json'
        break
      }
      default: {
        throw new Error(`Unsupported export type: ${exportType}`)
      }
    }

    // 4. Upload to Supabase Storage
    const storageKey = `${companyId}/${claimYearId}/${versionLabel}.${fileExtension}`

    const { error: uploadErr } = await sb.storage
      .from(EXPORT_BUCKET)
      .upload(storageKey, fileBuffer, {
        contentType: mimeType,
        upsert: true,
      })

    if (uploadErr) throw uploadErr

    // 5. Update bundle record with success
    const { data: updated, error: updateErr } = await sb
      .from('export_bundles')
      .update({
        status: 'ready' as const,
        snapshot_id: snapshot.id,
        storage_key: storageKey,
        file_size: fileBuffer.length,
      })
      .eq('id', exportBundle.id)
      .select()
      .single()

    if (updateErr) throw updateErr
    return updated as ExportBundle
  } catch (err) {
    // Mark bundle as failed
    await sb
      .from('export_bundles')
      .update({ status: 'failed' as const })
      .eq('id', exportBundle.id)

    throw err
  }
}

// ── Alberta backward compatibility ──

/**
 * Generate an Alberta export using the new provincial_package pattern.
 * Callers using the old alberta_package type should use this instead.
 */
export async function generateAlbertaExportBundle(
  sb: SupabaseClient,
  claimYearId: string,
  versionLabel: string,
  generatedBy: string | null
): Promise<ExportBundle> {
  return generateExportBundle(sb, {
    claimYearId,
    exportType: 'provincial_package',
    versionLabel,
    generatedBy,
    provinceCode: 'AB',
  })
}

// ── Bundle queries ──

export async function listExportBundles(
  sb: SupabaseClient,
  claimYearId: string
): Promise<ExportBundle[]> {
  const { data, error } = await sb
    .from('export_bundles')
    .select('*')
    .eq('claim_year_id', claimYearId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return (data ?? []) as ExportBundle[]
}

export async function getExportBundle(
  sb: SupabaseClient,
  bundleId: string
): Promise<ExportBundle> {
  const { data, error } = await sb
    .from('export_bundles')
    .select('*')
    .eq('id', bundleId)
    .single()

  if (error) throw error
  return data as ExportBundle
}

/**
 * Generate a signed download URL for an export bundle.
 */
export async function getExportDownloadUrl(
  sb: SupabaseClient,
  storageKey: string,
  expiresInSeconds: number = 3600
): Promise<string> {
  const { data, error } = await sb.storage
    .from(EXPORT_BUCKET)
    .createSignedUrl(storageKey, expiresInSeconds)

  if (error) throw error
  return data.signedUrl
}

/**
 * Mark previous bundles of the same type as superseded when a new
 * version is generated.
 */
export async function supersedePriorBundles(
  sb: SupabaseClient,
  claimYearId: string,
  exportType: string,
  currentBundleId: string,
  /** Required for provincial_package — scopes supersession to one province. */
  provinceCode?: string | null
): Promise<void> {
  let query = sb
    .from('export_bundles')
    .update({ status: 'superseded' as const })
    .eq('claim_year_id', claimYearId)
    .eq('export_type', exportType)
    .eq('status', 'ready')
    .neq('id', currentBundleId)

  if (provinceCode) {
    query = query.eq('province_code', provinceCode)
  }

  const { error } = await query
  if (error) throw error
}
