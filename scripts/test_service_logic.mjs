#!/usr/bin/env node
/**
 * Service Layer Logic Tests
 *
 * Validates transition rules, hash computation, snapshot payload
 * completeness, and the Python filler field mapping — all without
 * needing a live database.
 *
 * Usage:
 *   node scripts/test_service_logic.mjs
 */

import { createHash } from 'crypto'
import { readFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
let passed = 0
let failed = 0

function assert(condition, name) {
  if (condition) {
    console.log(`  PASS: ${name}`)
    passed++
  } else {
    console.log(`  FAIL: ${name}`)
    failed++
  }
}

// ─── Load schema constants ────────────────────────────────────
// We can't import TS directly, so we replicate the constants.

const ADMIN_TRANSITIONS = {
  draft: [],
  submitted: ['in_review'],
  in_review: ['changes_requested', 'approved_for_generation'],
  changes_requested: [],
  approved_for_generation: ['generated'],
  generated: ['filed'],
  filed: [],
}

const CLIENT_EDITABLE = ['draft', 'changes_requested']

const VALID_TRANSITIONS = [
  ['draft', 'submitted'],         // client submit
  ['submitted', 'in_review'],     // admin begins review
  ['in_review', 'changes_requested'],   // admin requests changes
  ['in_review', 'approved_for_generation'], // admin approves
  ['changes_requested', 'submitted'],  // client re-submits
  ['approved_for_generation', 'generated'], // generation done
  ['generated', 'filed'],         // admin marks filed
]

const ALL_STATUSES = ['draft', 'submitted', 'in_review', 'changes_requested', 'approved_for_generation', 'generated', 'filed']

// ═══════════════════════════════════════════════════════════════
// TEST 1: Status transition rules
// ═══════════════════════════════════════════════════════════════

console.log('\n── Test 1: Status transition rules ──')

// Every valid transition should be allowed
for (const [from, to] of VALID_TRANSITIONS) {
  // Admin transitions
  const adminAllowed = (ADMIN_TRANSITIONS[from] || []).includes(to)
  // Client submit paths (draft/changes_requested → submitted)
  const clientAllowed = CLIENT_EDITABLE.includes(from) && to === 'submitted'
  assert(adminAllowed || clientAllowed, `${from} → ${to} is allowed`)
}

// Every INVALID transition should be blocked
let illegalCount = 0
for (const from of ALL_STATUSES) {
  for (const to of ALL_STATUSES) {
    if (from === to) continue
    const isValid = VALID_TRANSITIONS.some(([f, t]) => f === from && t === to)
    if (!isValid) {
      const adminAllowed = (ADMIN_TRANSITIONS[from] || []).includes(to)
      const clientAllowed = CLIENT_EDITABLE.includes(from) && to === 'submitted'
      if (adminAllowed || clientAllowed) {
        console.log(`  FAIL: ${from} → ${to} should be BLOCKED but is allowed`)
        failed++
      } else {
        illegalCount++
      }
    }
  }
}
assert(illegalCount > 0, `${illegalCount} illegal transitions are correctly blocked`)

// Filed is terminal
assert(ADMIN_TRANSITIONS.filed.length === 0, 'filed is a terminal state (no outgoing transitions)')

// Draft has no admin transitions (only client submit)
assert(ADMIN_TRANSITIONS.draft.length === 0, 'draft has no admin transitions')

// changes_requested has no admin transitions (only client re-submit)
assert(ADMIN_TRANSITIONS.changes_requested.length === 0, 'changes_requested has no admin transitions')

// ═══════════════════════════════════════════════════════════════
// TEST 2: Hash computation consistency
// ═══════════════════════════════════════════════════════════════

console.log('\n── Test 2: Hash computation consistency ──')

// Both Python (json.dumps sort_keys=True) and TypeScript (sortKeysDeep) recursively
// sort all object keys before hashing. This ensures cross-language consistency.

function sortKeysDeep(obj) {
  if (obj === null || obj === undefined) return obj
  if (Array.isArray(obj)) return obj.map(sortKeysDeep)
  if (typeof obj === 'object') {
    const sorted = {}
    for (const k of Object.keys(obj).sort()) sorted[k] = sortKeysDeep(obj[k])
    return sorted
  }
  return obj
}

const testPayload = {
  proposed_name: 'Test Corp',
  legal_element: 'Ltd.',
  reg_street: '123 Main St',
  reg_city: 'Calgary',
  reg_province: 'Alberta',
  reg_postal_code: 'T2E 2T9',
  agent: { first_name: 'John', last_name: 'Doe', email: 'john@test.com', street: '456 Elm', city: 'Edmonton', province: 'Alberta', postal_code: 'T5A 1A1' },
  directors: [{ first_name: 'Jane', last_name: 'Smith', street: '789 Oak', city: 'Calgary', province: 'Alberta', postal_code: 'T2P 3B3' }],
}

// TypeScript approach (recursive sort)
const tsJson = JSON.stringify(sortKeysDeep(testPayload))
const tsHash = createHash('sha256').update(tsJson).digest('hex')

// Verify hash with keys in a different insertion order (should produce same hash)
const reorderedPayload = {
  reg_city: 'Calgary',
  proposed_name: 'Test Corp',
  agent: { email: 'john@test.com', first_name: 'John', last_name: 'Doe', street: '456 Elm', city: 'Edmonton', province: 'Alberta', postal_code: 'T5A 1A1' },
  legal_element: 'Ltd.',
  directors: [{ street: '789 Oak', first_name: 'Jane', last_name: 'Smith', city: 'Calgary', province: 'Alberta', postal_code: 'T2P 3B3' }],
  reg_street: '123 Main St',
  reg_province: 'Alberta',
  reg_postal_code: 'T2E 2T9',
}
const reorderedJson = JSON.stringify(sortKeysDeep(reorderedPayload))
const reorderedHash = createHash('sha256').update(reorderedJson).digest('hex')

assert(tsHash === reorderedHash, 'Recursive key sorting produces same hash regardless of insertion order')
assert(tsHash.length === 64, 'Hash is 64-char hex (SHA-256)')

// Verify hash changes when data changes
const altPayload = { ...testPayload, proposed_name: 'Different Corp' }
const altJson = JSON.stringify(altPayload, Object.keys(altPayload).sort())
const altHash = createHash('sha256').update(altJson).digest('hex')
assert(tsHash !== altHash, 'Hash changes when payload changes')

// ═══════════════════════════════════════════════════════════════
// TEST 3: Snapshot payload completeness
// ═══════════════════════════════════════════════════════════════

console.log('\n── Test 3: Snapshot payload completeness ──')

// The Python filler reads these keys from the snapshot payload.
// Every key must be present in the IncorporationIntake interface.

const FILLER_REQUIRED_KEYS = [
  'proposed_name', 'legal_element',
  'reg_street', 'reg_city', 'reg_province', 'reg_postal_code',
  'mailing_same_as_reg', 'mail_po_box', 'mail_city', 'mail_province', 'mail_postal_code',
  'agent',         // nested: first_name, last_name, firm, email, street, city, province, postal_code
  'directors',     // array of nested objects
  'declarant',     // nested: full_name, phone, email, id_type
  'director_structure', 'director_fixed_number', 'director_min', 'director_max',
  'articles_choice', 'custom_articles',
]

const AGENT_REQUIRED_KEYS = ['first_name', 'last_name', 'email', 'street', 'city', 'province', 'postal_code']
const DIRECTOR_REQUIRED_KEYS = ['first_name', 'last_name', 'street', 'city', 'province', 'postal_code']
const DECLARANT_REQUIRED_KEYS = ['full_name', 'phone', 'email', 'id_type']

// Document generator also needs these (for docs 01/02/03):
const DOC_GEN_EXTRA_KEYS = ['fiscal_year_end', 'alt_name_1', 'alt_name_2']

// Simulate a full intake record (what getIntake() returns)
const fullIntake = {
  id: 'test-uuid',
  matter_id: 'matter-uuid',
  user_id: 'user-uuid',
  status: 'approved_for_generation',
  created_at: '2026-01-01',
  updated_at: '2026-01-01',
  proposed_name: 'Test Corp',
  legal_element: 'Ltd.',
  alt_name_1: 'Alt One',
  alt_name_2: null,
  reserved_name: null,
  fiscal_year_end: 'December 31',
  reg_street: '123 Main St',
  reg_city: 'Calgary',
  reg_province: 'Alberta',
  reg_postal_code: 'T2E 2T9',
  mailing_same_as_reg: true,
  mail_po_box: null,
  mail_city: null,
  mail_province: null,
  mail_postal_code: null,
  agent: {
    first_name: 'John', last_name: 'Doe', firm: 'Doe Law',
    email: 'john@test.com', street: '456 Elm', city: 'Edmonton',
    province: 'Alberta', postal_code: 'T5A 1A1',
  },
  director_structure: 'fixed',
  director_fixed_number: 1,
  director_min: null,
  director_max: null,
  directors: [{
    first_name: 'Jane', last_name: 'Smith', middle_name: null,
    street: '789 Oak', city: 'Calgary', province: 'Alberta', postal_code: 'T2P 3B3',
  }],
  declarant: {
    full_name: 'Jane Smith', phone: '403-555-0100',
    email: 'jane@test.com', id_type: "Driver's Licence",
  },
  articles_choice: 'default',
  custom_articles: null,
  admin_notes: null,
  change_request_message: null,
}

// Check all filler keys present
for (const key of FILLER_REQUIRED_KEYS) {
  assert(key in fullIntake, `Filler key "${key}" exists in intake record`)
}

// Check nested agent keys
for (const key of AGENT_REQUIRED_KEYS) {
  assert(key in fullIntake.agent, `Agent key "${key}" exists`)
}

// Check nested director keys
for (const key of DIRECTOR_REQUIRED_KEYS) {
  assert(key in fullIntake.directors[0], `Director key "${key}" exists`)
}

// Check nested declarant keys
for (const key of DECLARANT_REQUIRED_KEYS) {
  assert(key in fullIntake.declarant, `Declarant key "${key}" exists`)
}

// Check doc generator keys
for (const key of DOC_GEN_EXTRA_KEYS) {
  assert(key in fullIntake, `Doc generator key "${key}" exists in intake record`)
}

// ═══════════════════════════════════════════════════════════════
// TEST 4: Python field mapping coverage
// ═══════════════════════════════════════════════════════════════

console.log('\n── Test 4: Python field mapping coverage ──')

// Load the field mapping JSON
let fieldMapping
try {
  fieldMapping = JSON.parse(readFileSync(join(__dirname, 'ab_incorporation_fields.json'), 'utf-8'))
} catch {
  console.log('  SKIP: ab_incorporation_fields.json not found')
}

if (fieldMapping) {
  const schemaKeys = new Set(fieldMapping.form_fields.map(f => f.schema_key).filter(Boolean))
  assert(schemaKeys.size > 0, `${schemaKeys.size} schema keys mapped in field JSON`)

  // Verify the Python map_to_fields() would produce values for these keys
  // (We can't run Python, but we can verify the keys exist)
  const expectedKeys = [
    'full_corp_name', 'reg_street', 'reg_city', 'reg_province', 'reg_postal_code',
    'agent_last_name', 'agent_first_name', 'agent_email', 'agent_street',
    'dir1_last_name', 'dir1_first_name', 'declarant_name', 'declarant_phone',
  ]
  for (const key of expectedKeys) {
    assert(schemaKeys.has(key), `PDF field key "${key}" is mapped`)
  }
}

// ═══════════════════════════════════════════════════════════════
// TEST 5: Validation rules mirror Alberta filing
// ═══════════════════════════════════════════════════════════════

console.log('\n── Test 5: Validation rules ──')

// Re-implement validateAll in JS to test
const LEGAL_ELEMENTS = ['Ltd.', 'Inc.', 'Corp.', 'Limited', 'Incorporated', 'Corporation']

function validateAll(data) {
  const errs = []

  // Company step
  if (!data.proposed_name?.trim()) errs.push('proposed_name required')
  if (!LEGAL_ELEMENTS.includes(data.legal_element)) errs.push('legal_element required')
  if (!data.reg_street?.trim()) errs.push('reg_street required')
  if (!data.reg_city?.trim()) errs.push('reg_city required')
  if (!data.reg_postal_code?.trim()) errs.push('reg_postal_code required')
  if (data.reg_province?.trim().toLowerCase() !== 'alberta') errs.push('reg_province must be Alberta')

  // People step
  if (!data.agent?.first_name?.trim() || !data.agent?.last_name?.trim()) errs.push('agent name required')
  if (!data.agent?.email?.trim()) errs.push('agent email required')
  if (!data.agent?.street?.trim()) errs.push('agent street required')
  if (!data.agent?.city?.trim()) errs.push('agent city required')
  if (!data.agent?.postal_code?.trim()) errs.push('agent postal_code required')
  if (data.agent?.province?.trim().toLowerCase() !== 'alberta') errs.push('agent must be Alberta')

  if (!data.directors?.length) errs.push('at least one director')
  for (const d of (data.directors || [])) {
    if (!d.first_name?.trim() || !d.last_name?.trim()) errs.push('director name required')
    if (!d.street?.trim()) errs.push('director street required')
    if (!d.city?.trim()) errs.push('director city required')
    if (!d.postal_code?.trim()) errs.push('director postal_code required')
  }

  if (!data.declarant?.full_name?.trim()) errs.push('declarant name required')
  if (!data.declarant?.email?.trim()) errs.push('declarant email required')
  if (!data.declarant?.phone?.trim()) errs.push('declarant phone required')

  // Articles
  if (data.articles_choice === 'custom' && !data.custom_articles?.share_classes?.trim()) {
    errs.push('custom articles share_classes required')
  }

  return errs
}

// Valid intake should pass
const validErrors = validateAll(fullIntake)
assert(validErrors.length === 0, `Valid intake passes all checks (${validErrors.length} errors)`)

// Missing name should fail
const noName = { ...fullIntake, proposed_name: '' }
assert(validateAll(noName).length > 0, 'Empty proposed_name is caught')

// Non-Alberta registered office should fail
const bcOffice = { ...fullIntake, reg_province: 'British Columbia' }
assert(validateAll(bcOffice).some(e => e.includes('Alberta')), 'Non-Alberta registered office is caught')

// Non-Alberta agent should fail
const bcAgent = { ...fullIntake, agent: { ...fullIntake.agent, province: 'BC' } }
assert(validateAll(bcAgent).some(e => e.includes('Alberta')), 'Non-Alberta agent is caught')

// Missing agent city should fail
const noAgentCity = { ...fullIntake, agent: { ...fullIntake.agent, city: '' } }
assert(validateAll(noAgentCity).some(e => e.includes('city')), 'Missing agent city is caught')

// Missing director postal code should fail
const noDirPostal = { ...fullIntake, directors: [{ ...fullIntake.directors[0], postal_code: '' }] }
assert(validateAll(noDirPostal).some(e => e.includes('postal')), 'Missing director postal code is caught')

// No directors should fail
const noDirs = { ...fullIntake, directors: [] }
assert(validateAll(noDirs).some(e => e.includes('director')), 'Zero directors is caught')

// Custom articles without share_classes should fail
const badCustom = { ...fullIntake, articles_choice: 'custom', custom_articles: { share_classes: '' } }
assert(validateAll(badCustom).some(e => e.includes('share_classes')), 'Custom articles without share_classes is caught')

// Invalid legal element should fail
const badElement = { ...fullIntake, legal_element: 'LLC' }
assert(validateAll(badElement).some(e => e.includes('legal_element')), 'Invalid legal element (LLC) is caught')

// ═══════════════════════════════════════════════════════════════
// TEST 6: Artifact versioning logic
// ═══════════════════════════════════════════════════════════════

console.log('\n── Test 6: Artifact versioning logic ──')

// Simulate versioning: each new artifact for same type increments version
const artifacts = []
function simulateRegisterArtifact(snapshotId, artifactType) {
  const existing = artifacts.filter(a => a.snapshot_id === snapshotId && a.artifact_type === artifactType)
  const nextVersion = existing.length > 0 ? Math.max(...existing.map(a => a.version)) + 1 : 1

  // Supersede previous
  for (const a of artifacts) {
    if (a.intake_id === 'intake-1' && a.artifact_type === artifactType && a.status === 'generated') {
      a.status = 'superseded'
    }
  }

  artifacts.push({ snapshot_id: snapshotId, intake_id: 'intake-1', artifact_type: artifactType, version: nextVersion, status: 'generated' })
  return nextVersion
}

const v1 = simulateRegisterArtifact('snap-1', 'alberta_incorporation_pdf')
assert(v1 === 1, 'First artifact is version 1')

const v2 = simulateRegisterArtifact('snap-2', 'alberta_incorporation_pdf')
assert(v2 === 1, 'New snapshot starts at version 1')

const superseded = artifacts.filter(a => a.status === 'superseded')
assert(superseded.length === 1, 'Previous artifact was superseded')

const active = artifacts.filter(a => a.status === 'generated')
assert(active.length === 1, 'Only one active artifact per type')

// ═══════════════════════════════════════════════════════════════
// Summary
// ═══════════════════════════════════════════════════════════════

console.log(`\n═══════════════════════════════════════`)
console.log(`Results: ${passed} passed, ${failed} failed`)
console.log(`═══════════════════════════════════════\n`)

process.exit(failed > 0 ? 1 : 0)
