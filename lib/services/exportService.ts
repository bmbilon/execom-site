/**
 * Export service: snapshot creation, XLSX/PDF generation via existing
 * portal utilities, and Supabase Storage upload for export bundles.
 */

import { SupabaseClient } from '@supabase/supabase-js'
import { generateXlsx } from '@/lib/portal/xlsx-export'
import { generatePdf } from '@/lib/portal/pdf-export'
import type { ClaimJson } from '@/lib/portal/claim-builder'
import type { ClaimSnapshot, ExportBundle } from './types'

// ── Storage bucket name ──

const EXPORT_BUCKET = 'claim-exports'

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
    costsRes,
    contactsRes,
    assistanceRes,
    federalLinesRes,
    provincialLinesRes,
  ] = await Promise.all([
    sb.from('claim_years').select('*').eq('id', claimYearId).single(),
    sb.from('projects').select('*').eq('claim_year_id', claimYearId),
    sb.from('costs').select('*').eq('claim_year_id', claimYearId),
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

  return {
    captured_at: new Date().toISOString(),
    claim_year: claimYearRes.data,
    projects: projectsRes.data ?? [],
    costs: costsRes.data ?? [],
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
  exportType: 'xlsx' | 'pdf' | 'json'
  versionLabel: string
  generatedBy: string | null
  /** Pre-built ClaimJson for XLSX/PDF. Must be provided for xlsx/pdf exports. */
  claimJson?: ClaimJson
}

/**
 * Generate an export bundle: create a snapshot, generate the file,
 * upload to Supabase Storage, and record the bundle metadata.
 */
export async function generateExportBundle(
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
        const _exhaustive: never = exportType
        throw new Error(`Unsupported export type: ${_exhaustive}`)
      }
    }

    // 4. Upload to Supabase Storage
    const storageKey = `${claimYearId}/${versionLabel}.${fileExtension}`

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
  currentBundleId: string
): Promise<void> {
  const { error } = await sb
    .from('export_bundles')
    .update({ status: 'superseded' as const })
    .eq('claim_year_id', claimYearId)
    .eq('export_type', exportType)
    .eq('status', 'ready')
    .neq('id', currentBundleId)

  if (error) throw error
}
