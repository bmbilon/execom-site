/**
 * IP Transfer service — typed Supabase operations for the
 * commercialization/ip-transfer module.
 *
 * Follows the same pattern as incorporationService.ts:
 *   - each function takes SupabaseClient as first arg
 *   - returns typed results
 *   - throws on error
 */

import { SupabaseClient } from '@supabase/supabase-js'
import type {
  IPTransferIntake,
  CommercializationStatus,
  CommercializationMatter,
  ApprovedSnapshot,
  GeneratedArtifact,
  MatterStatusEvent,
  ArtifactType,
  ArtifactStatus,
} from '@/lib/corp-setup/schema'
import { CLIENT_EDITABLE, ADMIN_TRANSITIONS } from '@/lib/corp-setup/schema'

// ═══════════════════════════════════════════════════════════════
// Payload hashing — reused from incorporationService pattern
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
    return Array.from(new Uint8Array(hash))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('')
  }
  // Fallback — should not trigger in modern runtimes
  let h = 0
  for (let i = 0; i < json.length; i++) {
    h = (Math.imul(31, h) + json.charCodeAt(i)) | 0
  }
  return Math.abs(h).toString(16).padStart(16, '0')
}

// ═══════════════════════════════════════════════════════════════
// Intakes — CRUD
// ═══════════════════════════════════════════════════════════════

export async function createIntake(
  sb: SupabaseClient,
  userId: string,
  matterId: string,
  intake: Partial<IPTransferIntake>
): Promise<IPTransferIntake> {
  const { data, error } = await sb
    .from('ip_transfer_intakes')
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
  return data as IPTransferIntake
}

export async function getIntake(
  sb: SupabaseClient,
  intakeId: string
): Promise<IPTransferIntake> {
  const { data, error } = await sb
    .from('ip_transfer_intakes')
    .select('*')
    .eq('id', intakeId)
    .single()

  if (error) throw error
  return data as IPTransferIntake
}

export async function updateIntake(
  sb: SupabaseClient,
  intakeId: string,
  patch: Partial<IPTransferIntake>
): Promise<IPTransferIntake> {
  const clean = { ...patch }
  delete clean.id
  delete clean.created_at
  delete clean.updated_at
  delete clean.user_id
  delete clean.matter_id

  const { data, error } = await sb
    .from('ip_transfer_intakes')
    .update(clean)
    .eq('id', intakeId)
    .select('*')
    .single()

  if (error) throw error
  return data as IPTransferIntake
}

export async function listAllIntakes(
  sb: SupabaseClient
): Promise<IPTransferIntake[]> {
  const { data, error } = await sb
    .from('ip_transfer_intakes')
    .select('*')
    .order('updated_at', { ascending: false })

  if (error) throw error
  return (data ?? []) as IPTransferIntake[]
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

export async function transitionStatus(
  sb: SupabaseClient,
  intakeId: string,
  matterId: string,
  toStatus: CommercializationStatus,
  changedBy: string,
  note?: string,
  changeRequestMessage?: string
): Promise<IPTransferIntake> {
  const current = await getIntake(sb, intakeId)
  const fromStatus = current.status

  if (!isValidAdminTransition(fromStatus, toStatus)) {
    throw new Error(`Invalid transition: ${fromStatus} → ${toStatus}`)
  }

  const patch: Partial<IPTransferIntake> = { status: toStatus }
  if (toStatus === 'changes_requested' && changeRequestMessage) {
    patch.change_request_message = changeRequestMessage
  }
  if (toStatus !== 'changes_requested') {
    patch.change_request_message = undefined
  }

  const updated = await updateIntake(sb, intakeId, patch)
  await logStatusEvent(sb, matterId, intakeId, fromStatus, toStatus, changedBy, note)

  return updated
}

export async function clientSubmit(
  sb: SupabaseClient,
  intakeId: string,
  matterId: string,
  userId: string
): Promise<IPTransferIntake> {
  const current = await getIntake(sb, intakeId)

  if (!CLIENT_EDITABLE.includes(current.status)) {
    throw new Error(`Cannot submit from status: ${current.status}`)
  }

  const updated = await updateIntake(sb, intakeId, {
    status: 'submitted',
    change_request_message: undefined,
  })

  await logStatusEvent(
    sb,
    matterId,
    intakeId,
    current.status,
    'submitted',
    userId,
    'Client submitted'
  )

  return updated
}

// ═══════════════════════════════════════════════════════════════
// Snapshots
// ═══════════════════════════════════════════════════════════════

export async function createSnapshot(
  sb: SupabaseClient,
  intakeId: string,
  matterId: string,
  approvedBy: string
): Promise<ApprovedSnapshot> {
  const intake = await getIntake(sb, intakeId)

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
  intakeId: string,
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
      note: note || null,
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
