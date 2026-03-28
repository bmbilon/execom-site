/**
 * Trademark service — typed Supabase operations for the
 * commercialization/trademark module.
 *
 * Follows the same pattern as incorporationService.ts:
 *   - each function takes SupabaseClient as first arg
 *   - returns typed results
 *   - throws on error
 */

import { SupabaseClient } from '@supabase/supabase-js'
import type {
  TrademarkIntake,
  CommercializationStatus,
  CommercializationMatter,
  ApprovedSnapshot,
  GeneratedArtifact,
  MatterStatusEvent,
  ArtifactType,
  ArtifactStatus,
  GoodsServicesItem,
} from '@/lib/corp-setup/schema'
import { CLIENT_EDITABLE, ADMIN_TRANSITIONS, deriveFilingBasis } from '@/lib/corp-setup/schema'

// ═══════════════════════════════════════════════════════════════
// Payload hashing — SHA-256 for snapshot integrity
// ═══════════════════════════════════════════════════════════════

function sortKeysDeep(obj: unknown): unknown {
  if (obj === null || obj === undefined) return obj
  if (Array.isArray(obj)) return obj.map(sortKeysDeep)
  if (typeof obj === 'object') {
    const sorted: Record<string, unknown> = {}
    for (const key of Object.keys(obj as Record<string, unknown>).sort()) {
      sorted[key] = sortKeysDeep((obj as Record<string, unknown>)[key])
    }
    return sorted
  }
  return obj
}

async function hashPayload(payload: unknown): Promise<string> {
  const json = JSON.stringify(sortKeysDeep(payload))
  if (typeof globalThis.crypto !== 'undefined' && globalThis.crypto.subtle) {
    const buf = new TextEncoder().encode(json)
    const hash = await globalThis.crypto.subtle.digest('SHA-256', buf)
    return Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, '0')).join('')
  }
  let h = 0
  for (let i = 0; i < json.length; i++) {
    h = ((h << 5) - h + json.charCodeAt(i)) | 0
  }
  return 'fallback-' + Math.abs(h).toString(16)
}

// ═══════════════════════════════════════════════════════════════
// DB ↔ App serialization helpers
// ═══════════════════════════════════════════════════════════════

/** Convert app-level TrademarkIntake → DB row (flatten JSON fields) */
function toDbRow(intake: Partial<TrademarkIntake>): Record<string, unknown> {
  const row: Record<string, unknown> = { ...intake }

  // Serialize goods_services_items → goods_services text column
  if (intake.goods_services_items) {
    row.goods_services = JSON.stringify(intake.goods_services_items)
    // Also compute nice_classes summary
    const classes = intake.goods_services_items
      .map((g) => g.nice_class)
      .filter(Boolean)
    row.nice_classes = classes.length > 0 ? classes.join(', ') : null
  }
  delete row.goods_services_items

  // Derive filing basis
  if (intake.jurisdiction) {
    const basis = deriveFilingBasis(intake as TrademarkIntake)
    row.filing_basis_ca = basis.ca || null
    row.filing_basis_us = basis.us || null
  }

  // Strip fields that don't exist in the DB
  delete row.id
  delete row.created_at
  delete row.updated_at

  return row
}

/** Convert DB row → app-level TrademarkIntake (parse JSON fields) */
function fromDbRow(row: Record<string, unknown>): TrademarkIntake {
  const intake = { ...row } as unknown as TrademarkIntake

  // Parse goods_services JSON → structured items
  if (typeof row.goods_services === 'string' && row.goods_services) {
    try {
      intake.goods_services_items = JSON.parse(row.goods_services as string) as GoodsServicesItem[]
    } catch {
      intake.goods_services_items = []
    }
  } else {
    intake.goods_services_items = []
  }

  return intake
}

// ═══════════════════════════════════════════════════════════════
// Matters
// ═══════════════════════════════════════════════════════════════

export async function createTrademarkMatter(
  sb: SupabaseClient,
  userId: string,
  displayName: string
): Promise<CommercializationMatter> {
  const { data, error } = await sb
    .from('commercialization_matters')
    .insert({
      user_id: userId,
      matter_type: 'trademark',
      display_name: displayName || 'New Trademark Filing',
      status: 'draft',
    })
    .select('*')
    .single()

  if (error) throw error
  return data as CommercializationMatter
}

// ═══════════════════════════════════════════════════════════════
// Intakes — CRUD
// ═══════════════════════════════════════════════════════════════

export async function createTMIntake(
  sb: SupabaseClient,
  userId: string,
  matterId: string,
  intake: Partial<TrademarkIntake>
): Promise<TrademarkIntake> {
  const row = toDbRow(intake)
  row.user_id = userId
  row.matter_id = matterId
  row.status = 'draft'

  const { data, error } = await sb
    .from('trademark_intakes')
    .insert(row)
    .select('*')
    .single()

  if (error) throw error
  return fromDbRow(data as Record<string, unknown>)
}

export async function getTMIntake(
  sb: SupabaseClient,
  intakeId: string
): Promise<TrademarkIntake> {
  const { data, error } = await sb
    .from('trademark_intakes')
    .select('*')
    .eq('id', intakeId)
    .single()

  if (error) throw error
  return fromDbRow(data as Record<string, unknown>)
}

export async function updateTMIntake(
  sb: SupabaseClient,
  intakeId: string,
  patch: Partial<TrademarkIntake>
): Promise<TrademarkIntake> {
  const row = toDbRow(patch)
  delete row.user_id
  delete row.matter_id

  const { data, error } = await sb
    .from('trademark_intakes')
    .update(row)
    .eq('id', intakeId)
    .select('*')
    .single()

  if (error) throw error
  return fromDbRow(data as Record<string, unknown>)
}

export async function listTMIntakesForUser(
  sb: SupabaseClient,
  userId: string
): Promise<TrademarkIntake[]> {
  const { data, error } = await sb
    .from('trademark_intakes')
    .select('*')
    .eq('user_id', userId)
    .order('updated_at', { ascending: false })

  if (error) throw error
  return (data ?? []).map((r: unknown) => fromDbRow(r as Record<string, unknown>))
}

export async function listAllTMIntakes(
  sb: SupabaseClient
): Promise<TrademarkIntake[]> {
  const { data, error } = await sb
    .from('trademark_intakes')
    .select('*')
    .order('updated_at', { ascending: false })

  if (error) throw error
  return (data ?? []).map((r: unknown) => fromDbRow(r as Record<string, unknown>))
}

// ═══════════════════════════════════════════════════════════════
// Status transitions
// ═══════════════════════════════════════════════════════════════

export function canClientEdit(status: CommercializationStatus): boolean {
  return CLIENT_EDITABLE.includes(status)
}

export function isValidAdminTransition(
  from: CommercializationStatus,
  to: CommercializationStatus
): boolean {
  return (ADMIN_TRANSITIONS[from] ?? []).includes(to)
}

export async function transitionTMStatus(
  sb: SupabaseClient,
  intakeId: string,
  matterId: string,
  toStatus: CommercializationStatus,
  changedBy: string,
  note?: string,
  changeRequestMessage?: string
): Promise<TrademarkIntake> {
  const current = await getTMIntake(sb, intakeId)
  const fromStatus = current.status

  if (!isValidAdminTransition(fromStatus, toStatus)) {
    throw new Error(`Invalid transition: ${fromStatus} → ${toStatus}`)
  }

  const patch: Partial<TrademarkIntake> = { status: toStatus }
  if (toStatus === 'changes_requested' && changeRequestMessage) {
    patch.change_request_message = changeRequestMessage
  }
  if (toStatus !== 'changes_requested') {
    patch.change_request_message = undefined
  }

  const updated = await updateTMIntake(sb, intakeId, patch)
  await logTMStatusEvent(sb, matterId, intakeId, fromStatus, toStatus, changedBy, note)

  return updated
}

export async function clientSubmitTM(
  sb: SupabaseClient,
  intakeId: string,
  matterId: string,
  userId: string
): Promise<TrademarkIntake> {
  const current = await getTMIntake(sb, intakeId)

  if (!CLIENT_EDITABLE.includes(current.status)) {
    throw new Error(`Cannot submit from status: ${current.status}`)
  }

  const updated = await updateTMIntake(sb, intakeId, {
    status: 'submitted',
    change_request_message: undefined,
  })

  await logTMStatusEvent(sb, matterId, intakeId, current.status, 'submitted', userId, 'Client submitted')
  return updated
}

// ═══════════════════════════════════════════════════════════════
// Snapshots
// ═══════════════════════════════════════════════════════════════

export async function createTMSnapshot(
  sb: SupabaseClient,
  intakeId: string,
  matterId: string,
  approvedBy: string
): Promise<ApprovedSnapshot> {
  const intake = await getTMIntake(sb, intakeId)

  if (intake.status !== 'approved_for_generation') {
    throw new Error(`Cannot snapshot intake in status: ${intake.status}`)
  }

  const { data: existing } = await sb
    .from('approved_snapshots')
    .select('version')
    .eq('intake_id', intakeId)
    .order('version', { ascending: false })
    .limit(1)

  const nextVersion = existing && existing.length > 0 ? existing[0].version + 1 : 1
  const payloadHash = await hashPayload(intake)

  const { data, error } = await sb
    .from('approved_snapshots')
    .insert({
      intake_id: intakeId,
      matter_id: matterId,
      version: nextVersion,
      payload: intake,
      payload_hash: payloadHash,
      approved_by: approvedBy,
    })
    .select('*')
    .single()

  if (error) throw error
  return data as ApprovedSnapshot
}

export async function verifyTMSnapshotIntegrity(
  snapshot: ApprovedSnapshot
): Promise<boolean> {
  if (!snapshot.payload_hash) return false
  const computed = await hashPayload(snapshot.payload)
  return computed === snapshot.payload_hash
}

export async function listTMSnapshots(
  sb: SupabaseClient,
  intakeId: string
): Promise<ApprovedSnapshot[]> {
  const { data, error } = await sb
    .from('approved_snapshots')
    .select('*')
    .eq('intake_id', intakeId)
    .order('version', { ascending: false })

  if (error) throw error
  return (data ?? []) as ApprovedSnapshot[]
}

// ═══════════════════════════════════════════════════════════════
// Artifacts
// ═══════════════════════════════════════════════════════════════

export async function registerTMArtifact(
  sb: SupabaseClient,
  artifact: Omit<GeneratedArtifact, 'id' | 'generated_at'> & { snapshot_hash?: string }
): Promise<GeneratedArtifact> {
  const { data, error } = await sb
    .from('generated_artifacts')
    .insert(artifact)
    .select('*')
    .single()

  if (error) throw error
  return data as GeneratedArtifact
}

export async function listTMArtifacts(
  sb: SupabaseClient,
  matterId: string
): Promise<GeneratedArtifact[]> {
  const { data, error } = await sb
    .from('generated_artifacts')
    .select('*')
    .eq('matter_id', matterId)
    .order('generated_at', { ascending: false })

  if (error) throw error
  return (data ?? []) as GeneratedArtifact[]
}

// ═══════════════════════════════════════════════════════════════
// Audit trail
// ═══════════════════════════════════════════════════════════════

export async function logTMStatusEvent(
  sb: SupabaseClient,
  matterId: string,
  intakeId: string | undefined,
  fromStatus: string,
  toStatus: string,
  changedBy: string,
  note?: string
): Promise<MatterStatusEvent> {
  const { data, error } = await sb
    .from('matter_status_events')
    .insert({
      matter_id: matterId,
      intake_id: intakeId,
      from_status: fromStatus,
      to_status: toStatus,
      changed_by: changedBy,
      note,
    })
    .select('*')
    .single()

  if (error) throw error
  return data as MatterStatusEvent
}

export async function listTMStatusEvents(
  sb: SupabaseClient,
  matterId: string
): Promise<MatterStatusEvent[]> {
  const { data, error } = await sb
    .from('matter_status_events')
    .select('*')
    .eq('matter_id', matterId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return (data ?? []) as MatterStatusEvent[]
}
