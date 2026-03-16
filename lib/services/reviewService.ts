/**
 * Review service: rule definitions, automated rule evaluation,
 * and issue management for claim readiness checks.
 *
 * Rules are organized in three layers:
 *   - form: structural completeness (contacts, projects, method)
 *   - eligibility: narrative quality and evidence coverage
 *   - calculation: cost consistency and ITC math checks
 */

import { SupabaseClient } from '@supabase/supabase-js'
import type {
  ReviewRule,
  ReviewIssue,
  NarrativeSection,
  ClaimContact,
  Project,
} from './types'

// ── Keyword lists for narrative scanning ──

/** Terms that suggest commercial language in a technical narrative. */
const COMMERCIAL_KEYWORDS = [
  'market share',
  'revenue',
  'sales',
  'competitive advantage',
  'customer acquisition',
  'branding',
  'marketing',
  'profit',
  'ROI',
  'business case',
]

/** Terms that suggest systematic investigation is described. */
const SYSTEMATIC_KEYWORDS = [
  'hypothesis',
  'experiment',
  'tested',
  'iterat',
  'prototype',
  'trial',
  'analysis',
  'measured',
  'compared',
  'evaluated',
  'methodology',
]

/** Terms that suggest technological uncertainty is articulated. */
const UNCERTAINTY_KEYWORDS = [
  'unknown',
  'uncertain',
  'could not determine',
  'no known method',
  'limitation',
  'challenge',
  'unpredictable',
  'attempted',
  'failed',
  'obstacle',
]

// ── Rule evaluation ──

export interface RunRulesResult {
  issues: ReviewIssue[]
  blockerCount: number
  warningCount: number
  infoCount: number
}

/**
 * Run all enabled review rules against a claim year. Clears existing
 * open issues and generates fresh ones.
 */
export async function runAllRules(
  sb: SupabaseClient,
  claimYearId: string
): Promise<RunRulesResult> {
  // Load enabled rules
  const { data: ruleRows, error: ruleErr } = await sb
    .from('review_rules')
    .select('*')
    .eq('enabled', true)

  if (ruleErr) throw ruleErr
  const rules = (ruleRows ?? []) as ReviewRule[]

  // Clear existing open issues for re-evaluation
  const { error: delErr } = await sb
    .from('review_issues')
    .delete()
    .eq('claim_year_id', claimYearId)
    .eq('resolution_status', 'open')

  if (delErr) throw delErr

  const newIssues: Array<Omit<ReviewIssue, 'id' | 'resolved_at'>> = []

  // ── Form-layer rules ──

  const formRules = rules.filter((r) => r.layer === 'form')

  // Load claim data needed for form rules
  const { data: contacts, error: contactErr } = await sb
    .from('claim_contacts')
    .select('*')
    .eq('claim_year_id', claimYearId)

  if (contactErr) throw contactErr
  const allContacts = (contacts ?? []) as ClaimContact[]

  const { data: projects, error: projErr } = await sb
    .from('projects')
    .select('*')
    .eq('claim_year_id', claimYearId)

  if (projErr) throw projErr
  const allProjects = (projects ?? []) as Project[]

  const { data: claimYear, error: cyErr } = await sb
    .from('claim_years')
    .select('*')
    .eq('id', claimYearId)
    .single()

  if (cyErr) throw cyErr

  for (const rule of formRules) {
    switch (rule.rule_key) {
      case 'no_projects': {
        if (allProjects.length === 0) {
          newIssues.push(
            buildIssue(claimYearId, rule, 'At least one project is required.')
          )
        }
        break
      }
      case 'no_claimant_contact': {
        const hasClaimant = allContacts.some(
          (c) => c.contact_role === 'claimant'
        )
        if (!hasClaimant) {
          newIssues.push(
            buildIssue(
              claimYearId,
              rule,
              'A claimant contact must be specified.'
            )
          )
        }
        break
      }
      case 'no_preparer_contact': {
        const hasPreparer = allContacts.some(
          (c) => c.contact_role === 'preparer'
        )
        if (!hasPreparer) {
          newIssues.push(
            buildIssue(
              claimYearId,
              rule,
              'A preparer contact must be specified.'
            )
          )
        }
        break
      }
      case 'no_method_election': {
        const claimJson = claimYear.claim_json as Record<string, unknown> | null
        const methodElection = claimJson?.method_election
        if (!methodElection) {
          newIssues.push(
            buildIssue(
              claimYearId,
              rule,
              'Method election (proxy vs. traditional) has not been set on Line 160.'
            )
          )
        }
        break
      }
      default:
        // Unknown form rule; skip
        break
    }
  }

  // ── Eligibility-layer rules (narrative quality) ──

  const eligibilityRules = rules.filter((r) => r.layer === 'eligibility')

  for (const project of allProjects) {
    const { data: narratives, error: narErr } = await sb
      .from('project_narrative_sections')
      .select('*')
      .eq('project_id', project.id)

    if (narErr) throw narErr
    const allNarratives = (narratives ?? []) as NarrativeSection[]

    for (const rule of eligibilityRules) {
      switch (rule.rule_key) {
        case 'missing_narrative': {
          const expectedKeys = [
            'technical_uncertainty',
            'systematic_investigation',
            'advancement',
          ]
          for (const key of expectedKeys) {
            const section = allNarratives.find((n) => n.section_key === key)
            const text =
              section?.approved_text ?? section?.ai_draft_text ?? section?.raw_text
            if (!text || text.trim().length < 20) {
              newIssues.push(
                buildIssue(
                  claimYearId,
                  rule,
                  `Project "${project.name}" is missing content for ${key.replace(/_/g, ' ')}.`,
                  project.id,
                  key
                )
              )
            }
          }
          break
        }
        case 'commercial_language': {
          for (const nar of allNarratives) {
            const text = (
              nar.approved_text ??
              nar.ai_draft_text ??
              nar.raw_text ??
              ''
            ).toLowerCase()
            const found = COMMERCIAL_KEYWORDS.filter((kw) =>
              text.includes(kw.toLowerCase())
            )
            if (found.length > 0) {
              newIssues.push(
                buildIssue(
                  claimYearId,
                  rule,
                  `Project "${project.name}" narrative "${nar.section_key}" contains commercial language: ${found.join(', ')}. CRA may flag this.`,
                  project.id,
                  nar.section_key
                )
              )
            }
          }
          break
        }
        case 'weak_systematic': {
          const sysNar = allNarratives.find(
            (n) => n.section_key === 'systematic_investigation'
          )
          const text = (
            sysNar?.approved_text ??
            sysNar?.ai_draft_text ??
            sysNar?.raw_text ??
            ''
          ).toLowerCase()
          if (text.length > 0) {
            const matchCount = SYSTEMATIC_KEYWORDS.filter((kw) =>
              text.includes(kw.toLowerCase())
            ).length
            if (matchCount < 2) {
              newIssues.push(
                buildIssue(
                  claimYearId,
                  rule,
                  `Project "${project.name}" systematic investigation narrative lacks hypothesis-driven language. Consider adding experimental methodology details.`,
                  project.id,
                  'systematic_investigation'
                )
              )
            }
          }
          break
        }
        case 'weak_uncertainty': {
          const uncNar = allNarratives.find(
            (n) => n.section_key === 'technical_uncertainty'
          )
          const text = (
            uncNar?.approved_text ??
            uncNar?.ai_draft_text ??
            uncNar?.raw_text ??
            ''
          ).toLowerCase()
          if (text.length > 0) {
            const matchCount = UNCERTAINTY_KEYWORDS.filter((kw) =>
              text.includes(kw.toLowerCase())
            ).length
            if (matchCount < 2) {
              newIssues.push(
                buildIssue(
                  claimYearId,
                  rule,
                  `Project "${project.name}" technical uncertainty narrative does not clearly articulate what was unknown. Strengthen the description of the technological gap.`,
                  project.id,
                  'technical_uncertainty'
                )
              )
            }
          }
          break
        }
        case 'no_evidence_links': {
          const { count, error: linkErr } = await sb
            .from('project_evidence_links')
            .select('id', { count: 'exact', head: true })
            .eq('project_id', project.id)

          if (linkErr) throw linkErr
          if ((count ?? 0) === 0) {
            newIssues.push(
              buildIssue(
                claimYearId,
                rule,
                `Project "${project.name}" has no evidence linked. CRA expects contemporaneous documentation.`,
                project.id
              )
            )
          }
          break
        }
        default:
          break
      }
    }
  }

  // ── Calculation-layer rules ──

  const calcRules = rules.filter((r) => r.layer === 'calculation')

  for (const rule of calcRules) {
    switch (rule.rule_key) {
      case 'no_costs': {
        const { count: costCount, error: ccErr } = await sb
          .from('costs')
          .select('id', { count: 'exact', head: true })
          .eq('claim_year_id', claimYearId)

        if (ccErr) throw ccErr
        if ((costCount ?? 0) === 0) {
          newIssues.push(
            buildIssue(
              claimYearId,
              rule,
              'No costs have been entered for this claim year.'
            )
          )
        }
        break
      }
      case 'unclassified_costs': {
        const { data: lineItems, error: liErr } = await sb
          .from('cost_line_items')
          .select('id')
          .eq('claim_year_id', claimYearId)

        if (liErr) throw liErr
        const ids = (lineItems ?? []).map((i: { id: string }) => i.id)

        if (ids.length > 0) {
          const { count: classifiedCount, error: clErr } = await sb
            .from('cost_line_classifications')
            .select('id', { count: 'exact', head: true })
            .in('cost_line_item_id', ids)

          if (clErr) throw clErr
          const unclassified = ids.length - (classifiedCount ?? 0)
          if (unclassified > 0) {
            newIssues.push(
              buildIssue(
                claimYearId,
                rule,
                `${unclassified} cost line items remain unclassified.`
              )
            )
          }
        }
        break
      }
      // TODO: Add calculation-layer rules for:
      //   - specified employee salary cap check (5x YMPE)
      //   - arms-length contract 80% rate verification
      //   - total ITC sanity check vs. historical averages
      //   - province split totals summing to 100%
      default:
        break
    }
  }

  // ── Persist new issues ──

  let insertedIssues: ReviewIssue[] = []

  if (newIssues.length > 0) {
    const { data: inserted, error: insErr } = await sb
      .from('review_issues')
      .insert(newIssues)
      .select()

    if (insErr) throw insErr
    insertedIssues = (inserted ?? []) as ReviewIssue[]
  }

  return {
    issues: insertedIssues,
    blockerCount: insertedIssues.filter((i) => i.severity === 'blocker').length,
    warningCount: insertedIssues.filter((i) => i.severity === 'warning').length,
    infoCount: insertedIssues.filter((i) => i.severity === 'info').length,
  }
}

// ── Issue management ──

export async function listIssues(
  sb: SupabaseClient,
  claimYearId: string,
  options?: { status?: ReviewIssue['resolution_status']; severity?: ReviewIssue['severity'] }
): Promise<ReviewIssue[]> {
  let query = sb
    .from('review_issues')
    .select('*')
    .eq('claim_year_id', claimYearId)

  if (options?.status) {
    query = query.eq('resolution_status', options.status)
  }
  if (options?.severity) {
    query = query.eq('severity', options.severity)
  }

  const { data, error } = await query.order('severity').order('source_area')
  if (error) throw error
  return (data ?? []) as ReviewIssue[]
}

export async function resolveIssue(
  sb: SupabaseClient,
  issueId: string,
  resolution: ReviewIssue['resolution_status'],
  note?: string
): Promise<ReviewIssue> {
  const { data, error } = await sb
    .from('review_issues')
    .update({
      resolution_status: resolution,
      resolution_note: note ?? null,
      resolved_at: new Date().toISOString(),
    })
    .eq('id', issueId)
    .select()
    .single()

  if (error) throw error
  return data as ReviewIssue
}

// ── Helpers ──

function buildIssue(
  claimYearId: string,
  rule: ReviewRule,
  message: string,
  projectId?: string,
  targetField?: string
): Omit<ReviewIssue, 'id' | 'resolved_at'> {
  return {
    claim_year_id: claimYearId,
    project_id: projectId ?? null,
    rule_key: rule.rule_key,
    issue_type: rule.layer,
    severity: rule.severity,
    source_area: rule.source_area,
    message,
    target_field: targetField ?? null,
    resolution_status: 'open',
    resolution_note: null,
  }
}
