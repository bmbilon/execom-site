/**
 * Incorporation service — typed Supabase operations for the
 * commercialization/incorporation module.
 *
 * Follows the same pattern as claimService.ts:
 *   - each function takes SupabaseClient as first arg
 *   - returns typed results
 *   - throws on error
 */

import { SupabaseClient } from '@supabase/supabase-js'
import type {
  IncorporationIntake,
  IncorporationStatus,
  CommercializationMatter,
  ApprovedSnapshot,
  GeneratedArtifact,
  MatterStatusEvent,
  ArtifactType,
  ArtifactStatus,
} from '@/lib/corp-setup/schema'
import { CLIENT_EDITABLE, ADMIN_TRANSITIONS } from '@/lib/corp-setup/schema'

// ═══════════════════════════════════════════════════════════════
// Payload hashing — SHA-256 for snapshot integrity
// ═══════════════════════════════════════════════════════════════

/** Recursively sort object keys to match Python json.dumps(sort_keys=True) */
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
  // Fallback for environments without crypto.subtle (shouldn't happen in modern runtimes)
  let h = 0
  for (let i = 0; i < json.length; i++) {
    h = ((h << 5) - h + json.charCodeAt(i)) | 0
  }
  return 'fallback-' + Math.abs(h).toString(16)
}

// ═══════════════════════════════════════════════════════════════
// Matters
// ═══════════════════════════════════════════════════════════════

export async function createMatter(
  sb: SupabaseClient,
  userId: string,
  displayName: string
): Promise<CommercializationMatter> {
  const { data, error } = await sb
    .from('commercialization_matters')
    .insert({
      user_id: userId,
      matter_type: 'incorporation',
      display_name: displayName || 'New Incorporation',
      status: 'draft',
    })
    .select('*')
    .single()

  if (error) throw error
  return data as CommercializationMatter
}

export async function getMatter(
  sb: SupabaseClient,
  matterId: string
): Promise<CommercializationMatter> {
  const { data, error } = await sb
    .from('commercialization_matters')
    .select('*')
    .eq('id', matterId)
    .single()

  if (error) throw error
  return data as CommercializationMatter
}

// ═══════════════════════════════════════════════════════════════
// Intakes — CRUD
// ═══════════════════════════════════════════════════════════════

export async function createIntake(
  sb: SupabaseClient,
  userId: string,
  matterId: string,
  intake: Partial<IncorporationIntake>
): Promise<IncorporationIntake> {
  const { data, error } = await sb
    .from('incorporation_intakes')
    .insert({
      ...intake,
      user_id: userId,
      matter_id: matterId,
      status: 'draft',
      id: undefined,
      created_at: undefined,
      updated_at: undefined,
    })
    .select('*')
    .single()

  if (error) throw error
  return data as IncorporationIntake
}

export async function getIntake(
  sb: SupabaseClient,
  intakeId: string
): Promise<IncorporationIntake> {
  const { data, error } = await sb
    .from('incorporation_intakes')
    .select('*')
    .eq('id', intakeId)
    .single()

  if (error) throw error
  return data as IncorporationIntake
}

export async function updateIntake(
  sb: SupabaseClient,
  intakeId: string,
  patch: Partial<IncorporationIntake>
): Promise<IncorporationIntake> {
  const clean = { ...patch }
  delete clean.id
  delete clean.created_at
  delete clean.updated_at
  delete clean.user_id
  delete clean.matter_id

  const { data, error } = await sb
    .from('incorporation_intakes')
    .update(clean)
    .eq('id', intakeId)
    .select('*')
    .single()

  if (error) throw error
  return data as IncorporationIntake
}

export async function listIntakesForUser(
  sb: SupabaseClient,
  userId: string
): Promise<IncorporationIntake[]> {
  const { data, error } = await sb
    .from('incorporation_intakes')
    .select('*')
    .eq('user_id', userId)
    .order('updated_at', { ascending: false })

  if (error) throw error
  return (data ?? []) as IncorporationIntake[]
}

export async function listAllIntakes(
  sb: SupabaseClient
): Promise<IncorporationIntake[]> {
  const { data, error } = await sb
    .from('incorporation_intakes')
    .select('*')
    .order('updated_at', { ascending: false })

  if (error) throw error
  return (data ?? []) as IncorporationIntake[]
}

// ═══════════════════════════════════════════════════════════════
// Status transitions
// ═══════════════════════════════════════════════════════════════

/** Check if client can edit this intake */
export function canClientEdit(status: IncorporationStatus): boolean {
  return CLIENT_EDITABLE.includes(status)
}

/** Check if a given admin transition is allowed */
export function isValidAdminTransition(
  from: IncorporationStatus,
  to: IncorporationStatus
): boolean {
  return (ADMIN_TRANSITIONS[from] ?? []).includes(to)
}

/** Perform a status transition with audit trail */
export async function transitionStatus(
  sb: SupabaseClient,
  intakeId: string,
  matterId: string,
  toStatus: IncorporationStatus,
  changedBy: string,
  note?: string,
  changeRequestMessage?: string
): Promise<IncorporationIntake> {
  // Read current
  const current = await getIntake(sb, intakeId)
  const fromStatus = current.status

  if (!isValidAdminTransition(fromStatus, toStatus)) {
    throw new Error(`Invalid transition: ${fromStatus} → ${toStatus}`)
  }

  // Build update
  const patch: Partial<IncorporationIntake> = { status: toStatus }
  if (toStatus === 'changes_requested' && changeRequestMessage) {
    patch.change_request_message = changeRequestMessage
  }
  if (toStatus !== 'changes_requested') {
    patch.change_request_message = undefined
  }

  // Update intake
  const updated = await updateIntake(sb, intakeId, patch)

  // Log event
  await logStatusEvent(sb, matterId, intakeId, fromStatus, toStatus, changedBy, note)

  return updated
}

/** Client submits — only from draft or changes_requested */
export async function clientSubmit(
  sb: SupabaseClient,
  intakeId: string,
  matterId: string,
  userId: string
): Promise<IncorporationIntake> {
  const current = await getIntake(sb, intakeId)

  if (!CLIENT_EDITABLE.includes(current.status)) {
    throw new Error(`Cannot submit from status: ${current.status}`)
  }

  const updated = await updateIntake(sb, intakeId, {
    status: 'submitted',
    change_request_message: undefined,
  })

  await logStatusEvent(sb, matterId, intakeId, current.status, 'submitted', userId, 'Client submitted')

  return updated
}

// ═══════════════════════════════════════════════════════════════
// Snapshots
// ═══════════════════════════════════════════════════════════════

/** Create an immutable approved snapshot from the current intake.
 *  Computes a SHA-256 hash of the payload for integrity verification. */
export async function createSnapshot(
  sb: SupabaseClient,
  intakeId: string,
  matterId: string,
  approvedBy: string
): Promise<ApprovedSnapshot> {
  // Get current intake as the frozen payload
  const intake = await getIntake(sb, intakeId)

  if (intake.status !== 'approved_for_generation') {
    throw new Error(`Cannot snapshot intake in status: ${intake.status}`)
  }

  // Get next version
  const { data: existing } = await sb
    .from('approved_snapshots')
    .select('version')
    .eq('intake_id', intakeId)
    .order('version', { ascending: false })
    .limit(1)

  const nextVersion = existing && existing.length > 0 ? existing[0].version + 1 : 1

  // Compute payload hash for integrity verification
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

/** Verify a snapshot's payload matches its stored hash */
export async function verifySnapshotIntegrity(
  snapshot: ApprovedSnapshot
): Promise<boolean> {
  if (!snapshot.payload_hash) return false
  const computed = await hashPayload(snapshot.payload)
  return computed === snapshot.payload_hash
}

export async function getLatestSnapshot(
  sb: SupabaseClient,
  intakeId: string
): Promise<ApprovedSnapshot | null> {
  const { data, error } = await sb
    .from('approved_snapshots')
    .select('*')
    .eq('intake_id', intakeId)
    .order('version', { ascending: false })
    .limit(1)
    .single()

  if (error && error.code !== 'PGRST116') throw error // PGRST116 = not found
  return (data as ApprovedSnapshot) ?? null
}

export async function listSnapshots(
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

export async function registerArtifact(
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

export async function listArtifacts(
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

export async function logStatusEvent(
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

export async function listStatusEvents(
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
