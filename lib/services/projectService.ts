/**
 * Project service: CRUD for projects, narrative sections, project
 * persons, and evidence links.
 */

import { SupabaseClient } from '@supabase/supabase-js'
import type {
  Project,
  CreateProjectInput,
  NarrativeSection,
  NarrativeSectionInput,
  ProjectPerson,
  ProjectPersonInput,
  ProjectEvidenceLink,
  EvidenceLinkInput,
} from './types'

// ── Projects ──

export async function getProject(
  sb: SupabaseClient,
  projectId: string
): Promise<Project> {
  const { data, error } = await sb
    .from('projects')
    .select('*')
    .eq('id', projectId)
    .single()

  if (error) throw error
  return data as Project
}

export async function listProjects(
  sb: SupabaseClient,
  claimYearId: string
): Promise<Project[]> {
  const { data, error } = await sb
    .from('projects')
    .select('*')
    .eq('claim_year_id', claimYearId)
    .order('sort_order')

  if (error) throw error
  return (data ?? []) as Project[]
}

export async function createProject(
  sb: SupabaseClient,
  input: CreateProjectInput
): Promise<Project> {
  const { data, error } = await sb
    .from('projects')
    .insert({
      claim_year_id: input.claim_year_id,
      company_id: input.company_id,
      name: input.name,
      code: input.code ?? null,
      status: 'draft' as const,
    })
    .select()
    .single()

  if (error) throw error
  return data as Project
}

export async function updateProject(
  sb: SupabaseClient,
  projectId: string,
  updates: Partial<Pick<Project, 'name' | 'code' | 'status' | 'objective' | 'uncertainty' | 'work_done' | 'advancement' | 'start_date' | 'end_date' | 'sort_order'>>
): Promise<Project> {
  const { data, error } = await sb
    .from('projects')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', projectId)
    .select()
    .single()

  if (error) throw error
  return data as Project
}

export async function deleteProject(
  sb: SupabaseClient,
  projectId: string
): Promise<void> {
  const { error } = await sb.from('projects').delete().eq('id', projectId)
  if (error) throw error
}

// ── Narrative Sections ──

export async function listNarratives(
  sb: SupabaseClient,
  projectId: string
): Promise<NarrativeSection[]> {
  const { data, error } = await sb
    .from('project_narrative_sections')
    .select('*')
    .eq('project_id', projectId)
    .order('section_key')

  if (error) throw error
  return (data ?? []) as NarrativeSection[]
}

export async function upsertNarrative(
  sb: SupabaseClient,
  input: NarrativeSectionInput
): Promise<NarrativeSection> {
  const { data, error } = await sb
    .from('project_narrative_sections')
    .upsert(
      {
        project_id: input.project_id,
        section_key: input.section_key,
        raw_text: input.raw_text ?? null,
        ai_draft_text: input.ai_draft_text ?? null,
        approved_text: input.approved_text ?? null,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'project_id,section_key' }
    )
    .select()
    .single()

  if (error) throw error
  return data as NarrativeSection
}

export async function updateNarrativeStatus(
  sb: SupabaseClient,
  narrativeId: string,
  reviewStatus: NarrativeSection['review_status']
): Promise<NarrativeSection> {
  const { data, error } = await sb
    .from('project_narrative_sections')
    .update({
      review_status: reviewStatus,
      updated_at: new Date().toISOString(),
    })
    .eq('id', narrativeId)
    .select()
    .single()

  if (error) throw error
  return data as NarrativeSection
}

// ── Project Persons ──

export async function listPersons(
  sb: SupabaseClient,
  projectId: string
): Promise<ProjectPerson[]> {
  const { data, error } = await sb
    .from('project_people')
    .select('*')
    .eq('project_id', projectId)
    .order('name')

  if (error) throw error
  return (data ?? []) as ProjectPerson[]
}

export async function upsertPerson(
  sb: SupabaseClient,
  input: ProjectPersonInput
): Promise<ProjectPerson> {
  const { data, error } = await sb
    .from('project_people')
    .upsert({
      project_id: input.project_id,
      person_type: input.person_type,
      name: input.name,
      role: input.role ?? null,
      employer_type: input.employer_type ?? null,
      specified_employee_flag: input.specified_employee_flag ?? false,
      notes: input.notes ?? null,
    })
    .select()
    .single()

  if (error) throw error
  return data as ProjectPerson
}

export async function deletePerson(
  sb: SupabaseClient,
  personId: string
): Promise<void> {
  const { error } = await sb
    .from('project_people')
    .delete()
    .eq('id', personId)

  if (error) throw error
}

// ── Evidence Links ──

export async function listEvidenceLinks(
  sb: SupabaseClient,
  projectId: string
): Promise<ProjectEvidenceLink[]> {
  const { data, error } = await sb
    .from('project_evidence_links')
    .select('*')
    .eq('project_id', projectId)
    .order('created_at')

  if (error) throw error
  return (data ?? []) as ProjectEvidenceLink[]
}

export async function upsertEvidenceLink(
  sb: SupabaseClient,
  input: EvidenceLinkInput
): Promise<ProjectEvidenceLink> {
  const { data, error } = await sb
    .from('project_evidence_links')
    .upsert(
      {
        project_id: input.project_id,
        evidence_id: input.evidence_id,
        narrative_section_key: input.narrative_section_key ?? 'technical_uncertainty',
        support_strength: input.support_strength ?? 'moderate',
        note: input.note ?? null,
      },
      { onConflict: 'project_id,evidence_id' }
    )
    .select()
    .single()

  if (error) throw error
  return data as ProjectEvidenceLink
}

export async function deleteEvidenceLink(
  sb: SupabaseClient,
  linkId: string
): Promise<void> {
  const { error } = await sb
    .from('project_evidence_links')
    .delete()
    .eq('id', linkId)

  if (error) throw error
}
