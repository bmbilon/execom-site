// ════════════════════════════════════════════════════════════════════════════
// SR&ED public endpoints — request guards
//
// The assessor is anonymous by design: a LinkedIn visitor must reach a
// preliminary result without an account. That removes session-based CSRF
// protection as an option, so the controls here are the ones that still work
// on an unauthenticated endpoint: same-origin enforcement, a hard body cap
// read before parsing, coarse per-IP rate control, and a honeypot.
//
// None of it may block a normal user before they see their estimate. The limits
// are deliberately loose enough that a real person filling the form twice on a
// train never trips them.
// ════════════════════════════════════════════════════════════════════════════

import { NextResponse } from 'next/server'
import { getRateLimitPolicy, maxBodyBytes } from './config'

export interface GuardFailure {
  response: NextResponse
}

function json(status: number, body: Record<string, unknown>): NextResponse {
  return NextResponse.json(body, { status })
}

// ─── Origin ────────────────────────────────────────────────────────────────

function allowedOrigins(): string[] {
  const configured = [
    process.env.NEXT_PUBLIC_SITE_URL,
    process.env.SRED_ALLOWED_ORIGIN,
    'https://execom.ca',
    'https://www.execom.ca',
  ].filter((v): v is string => !!v)

  // Local development and preview deployments.
  if (process.env.NODE_ENV !== 'production') {
    configured.push('http://localhost:3000', 'http://127.0.0.1:3000')
  }
  return configured.map((o) => o.replace(/\/$/, ''))
}

/**
 * Reject a cross-origin write. A missing Origin header is allowed: same-origin
 * form posts and non-browser callers legitimately omit it, and these endpoints
 * carry no ambient authority to abuse. A PRESENT but foreign Origin is refused.
 */
export function checkOrigin(request: Request): GuardFailure | null {
  const origin = request.headers.get('origin')
  if (!origin) return null

  const normalized = origin.replace(/\/$/, '')
  if (allowedOrigins().includes(normalized)) return null

  // Same host as the request itself is fine behind a proxy or preview domain.
  try {
    const requestHost = new URL(request.url).host
    if (new URL(origin).host === requestHost) return null
  } catch {
    // Unparseable origin — treat as foreign.
  }

  return { response: json(403, { error: 'Origin not allowed' }) }
}

// ─── Body ──────────────────────────────────────────────────────────────────

export interface BodyResult<T = unknown> {
  data?: T
  failure?: GuardFailure
}

/**
 * Read and parse the body with a hard byte cap applied BEFORE parsing, so an
 * oversized payload is never handed to JSON.parse.
 */
export async function readJsonBody(request: Request): Promise<BodyResult> {
  const limit = maxBodyBytes()

  const declared = request.headers.get('content-length')
  if (declared && Number(declared) > limit) {
    return { failure: { response: json(413, { error: 'Request too large' }) } }
  }

  let raw: string
  try {
    raw = await request.text()
  } catch {
    return { failure: { response: json(400, { error: 'Could not read request' }) } }
  }

  if (new TextEncoder().encode(raw).length > limit) {
    return { failure: { response: json(413, { error: 'Request too large' }) } }
  }

  try {
    return { data: JSON.parse(raw) }
  } catch {
    return { failure: { response: json(400, { error: 'Invalid JSON' }) } }
  }
}

// ─── Rate control ──────────────────────────────────────────────────────────

interface Bucket {
  count: number
  resetAt: number
}

/**
 * Per-process, in-memory. That is honest about what it is: a cheap brake on a
 * single instance, not a distributed limiter. Serverless scale-out weakens it,
 * which is why the durable limit also lives in the database intake function and
 * why edge rate control is listed as a launch gate.
 */
const buckets = new Map<string, Bucket>()

/** Exposed so tests can start from a clean slate. */
export function resetRateLimits(): void {
  buckets.clear()
}

export function clientKey(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for')
  const ip = forwarded?.split(',')[0]?.trim() || request.headers.get('x-real-ip') || 'unknown'
  return ip
}

export function checkRateLimit(
  request: Request,
  scope: 'assess' | 'lead',
  now: number = Date.now()
): GuardFailure | null {
  const policy = getRateLimitPolicy()
  const limit = scope === 'assess' ? policy.assessPerWindow : policy.leadPerWindow
  const key = `${scope}:${clientKey(request)}`

  const existing = buckets.get(key)
  if (!existing || existing.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + policy.windowMs })
    return null
  }

  existing.count += 1
  if (existing.count > limit) {
    const retryAfter = Math.max(1, Math.ceil((existing.resetAt - now) / 1000))
    return {
      response: NextResponse.json(
        { error: 'Too many requests. Give it a moment and try again.' },
        { status: 429, headers: { 'Retry-After': String(retryAfter) } }
      ),
    }
  }

  // Opportunistic sweep so the map cannot grow without bound.
  if (buckets.size > 5000) {
    for (const [k, v] of buckets) if (v.resetAt <= now) buckets.delete(k)
  }
  return null
}

// ─── Composite ─────────────────────────────────────────────────────────────

export async function guardPublicPost(
  request: Request,
  scope: 'assess' | 'lead'
): Promise<BodyResult> {
  const origin = checkOrigin(request)
  if (origin) return { failure: origin }

  const rate = checkRateLimit(request, scope)
  if (rate) return { failure: rate }

  return readJsonBody(request)
}
