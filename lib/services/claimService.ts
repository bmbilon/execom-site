/**
 * Claim-level service: CRUD for claim years, contacts, snapshots,
 * assistance items, and claim-wide summaries.
 */

import { SupabaseClient } from '@supabase/supabase-js'
import type {
  ClaimYear,
  CreateClaimYearInput,
  ClaimContact,
  ClaimContactInput,
  AssistanceItem,
  AssistanceItemInput,
  ClaimSnapshot,
  ClaimSummary,
} from './types'

// ── Claim Years ──

export async function getClaimYear(
  sb: SupabaseClient,
  claimYearId: string
): Promise<ClaimYear> {
  const { data, error } = await sb
    .from('claim_years')
    .select('*')
    .eq('id', claimYearId)
    .single()

  if (error) throw error
  return data as ClaimYear
}

export async function listClaimYears(
  sb: SupabaseClient,
  companyId: string
): Promise<ClaimYear[]> {
  const { data, error } = await sb
    .from('claim_years')
    .select('*')
    .eq('company_id', companyId)
    .order('fiscal_year', { ascending: false })

  if (error) throw error
  return (data ?? []) as ClaimYear[]
}

export async function createClaimYear(
  sb: SupabaseClient,
  input: CreateClaimYearInput
): Promise<ClaimYear> {
  const { data, error } = await sb
    .from('claim_years')
    .insert({
      company_id: input.company_id,
      fiscal_year: input.fiscal_year,
      status: 'draft' as const,
    })
    .select()
    .single()

  if (error) throw error
  return data as ClaimYear
}

export async function updateClaimYearStatus(
  sb: SupabaseClient,
  claimYearId: string,
  status: ClaimYear['status']
): Promise<ClaimYear> {
  const { data, error } = await sb
    .from('claim_years')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', claimYearId)
    .select()
    .single()

  if (error) throw error
  return data as ClaimYear
}

// ── Claim Contacts ──

export async function listContacts(
  sb: SupabaseClient,
  claimYearId: string
): Promise<ClaimContact[]> {
  const { data, error } = await sb
    .from('claim_contacts')
    .select('*')
    .eq('claim_year_id', claimYearId)
    .order('created_at')

  if (error) throw error
  return (data ?? []) as ClaimContact[]
}

export async function upsertContact(
  sb: SupabaseClient,
  input: ClaimContactInput
): Promise<ClaimContact> {
  const { data, error } = await sb
    .from('claim_contacts')
    .upsert(
      {
        claim_year_id: input.claim_year_id,
        contact_role: input.contact_role,
        name: input.name,
        title: input.title ?? null,
        email: input.email ?? null,
        phone: input.phone ?? null,
        preparer_ern: input.preparer_ern ?? null,
        billing_arrangement: input.billing_arrangement ?? null,
        related_forms_required: input.related_forms_required ?? null,
      },
      { onConflict: 'claim_year_id,contact_role' }
    )
    .select()
    .single()

  if (error) throw error
  return data as ClaimContact
}

export async function deleteContact(
  sb: SupabaseClient,
  contactId: string
): Promise<void> {
  const { error } = await sb
    .from('claim_contacts')
    .delete()
    .eq('id', contactId)

  if (error) throw error
}

// ── Assistance / Government Funding ──

export async function listAssistance(
  sb: SupabaseClient,
  claimYearId: string
): Promise<AssistanceItem[]> {
  const { data, error } = await sb
    .from('assistance_items')
    .select('*')
    .eq('claim_year_id', claimYearId)
    .order('created_at')

  if (error) throw error
  return (data ?? []) as AssistanceItem[]
}

export async function upsertAssistance(
  sb: SupabaseClient,
  input: AssistanceItemInput
): Promise<AssistanceItem> {
  const { data, error } = await sb
    .from('assistance_items')
    .upsert({
      claim_year_id: input.claim_year_id,
      assistance_type: input.assistance_type,
      source_name: input.source_name,
      amount: input.amount,
      linked_project_id: input.linked_project_id ?? null,
      treatment_notes: input.treatment_notes ?? null,
    })
    .select()
    .single()

  if (error) throw error
  return data as AssistanceItem
}

export async function deleteAssistance(
  sb: SupabaseClient,
  assistanceId: string
): Promise<void> {
  const { error } = await sb
    .from('assistance_items')
    .delete()
    .eq('id', assistanceId)

  if (error) throw error
}

// ── Snapshots ──

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

export async function getLatestSnapshot(
  sb: SupabaseClient,
  claimYearId: string
): Promise<ClaimSnapshot | null> {
  const { data, error } = await sb
    .from('claim_snapshots')
    .select('*')
    .eq('claim_year_id', claimYearId)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (error) throw error
  return (data as ClaimSnapshot) ?? null
}

// ── Claim Summary ──

export async function getClaimSummary(
  sb: SupabaseClient,
  claimYearId: string
): Promise<ClaimSummary> {
  // Fetch projects count
  const { count: projectCount, error: projErr } = await sb
    .from('projects')
    .select('id', { count: 'exact', head: true })
    .eq('claim_year_id', claimYearId)

  if (projErr) throw projErr

  // Fetch cost total
  const { data: costs, error: costErr } = await sb
    .from('costs')
    .select('amount')
    .eq('claim_year_id', claimYearId)

  if (costErr) throw costErr

  const costTotal = (costs ?? []).reduce(
    (sum: number, c: { amount: number }) => sum + c.amount,
    0
  )

  // Fetch files count
  const { count: fileCount, error: fileErr } = await sb
    .from('files')
    .select('id', { count: 'exact', head: true })
    .eq('claim_year_id', claimYearId)

  if (fileErr) throw fileErr

  // Fetch evidence count
  const { count: evidenceCount, error: evErr } = await sb
    .from('evidence')
    .select('id', { count: 'exact', head: true })
    .eq('claim_year_id', claimYearId)

  if (evErr) throw evErr

  // Narrative completion: count approved narrative sections vs expected
  const { data: projects, error: npErr } = await sb
    .from('projects')
    .select('id')
    .eq('claim_year_id', claimYearId)

  if (npErr) throw npErr

  const expectedNarratives = (projects ?? []).length * 5 // 5 section keys per project
  let approvedNarratives = 0

  if (expectedNarratives > 0) {
    const projectIds = (projects ?? []).map((p: { id: string }) => p.id)
    const { count: approved, error: narErr } = await sb
      .from('project_narrative_sections')
      .select('id', { count: 'exact', head: true })
      .in('project_id', projectIds)
      .eq('review_status', 'approved')

    if (narErr) throw narErr
    approvedNarratives = approved ?? 0
  }

  const narrativeCompletionPercent =
    expectedNarratives > 0
      ? Math.round((approvedNarratives / expectedNarratives) * 100)
      : 0

  // Readiness score: simple heuristic (0-100)
  const hasProjects = (projectCount ?? 0) > 0
  const hasCosts = costTotal > 0
  const hasEvidence = (evidenceCount ?? 0) > 0
  const narrativesComplete = narrativeCompletionPercent >= 80

  let readinessScore = 0
  if (hasProjects) readinessScore += 25
  if (hasCosts) readinessScore += 25
  if (hasEvidence) readinessScore += 25
  if (narrativesComplete) readinessScore += 25

  return {
    projectCount: projectCount ?? 0,
    costTotal,
    fileCount: fileCount ?? 0,
    evidenceCount: evidenceCount ?? 0,
    narrativeCompletionPercent,
    readinessScore,
  }
}
