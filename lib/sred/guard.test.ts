import { beforeEach, describe, expect, it } from 'vitest'
import { checkOrigin, checkRateLimit, clientKey, readJsonBody, resetRateLimits } from './guard'
import { getRateLimitPolicy, maxBodyBytes } from './config'
import { fingerprint, rateKey } from './store'

function post(url: string, init: RequestInit = {}): Request {
  return new Request(url, { method: 'POST', ...init })
}

describe('origin control', () => {
  it('allows a request with no Origin header', () => {
    expect(checkOrigin(post('https://execom.ca/api/sred/assess'))).toBeNull()
  })

  it('allows the production origin', () => {
    expect(
      checkOrigin(
        post('https://execom.ca/api/sred/assess', { headers: { origin: 'https://execom.ca' } })
      )
    ).toBeNull()
  })

  it('allows localhost outside production', () => {
    expect(
      checkOrigin(
        post('http://localhost:3000/api/sred/assess', {
          headers: { origin: 'http://localhost:3000' },
        })
      )
    ).toBeNull()
  })

  it('allows a same-host preview domain', () => {
    expect(
      checkOrigin(
        post('https://execom-site-git-x.vercel.app/api/sred/assess', {
          headers: { origin: 'https://execom-site-git-x.vercel.app' },
        })
      )
    ).toBeNull()
  })

  it('refuses a foreign origin with 403', () => {
    const failure = checkOrigin(
      post('https://execom.ca/api/sred/assess', { headers: { origin: 'https://evil.example' } })
    )
    expect(failure?.response.status).toBe(403)
  })

  it('refuses a look-alike domain', () => {
    const failure = checkOrigin(
      post('https://execom.ca/api/sred/assess', { headers: { origin: 'https://execom.ca.evil.io' } })
    )
    expect(failure?.response.status).toBe(403)
  })
})

describe('body limits', () => {
  it('accepts a normal payload', async () => {
    const res = await readJsonBody(
      post('https://execom.ca/api/sred/assess', { body: JSON.stringify({ hello: 'world' }) })
    )
    expect(res.failure).toBeUndefined()
    expect(res.data).toEqual({ hello: 'world' })
  })

  it('refuses an oversized body with 413 before parsing it', async () => {
    const huge = JSON.stringify({ blob: 'x'.repeat(maxBodyBytes() + 1024) })
    const res = await readJsonBody(post('https://execom.ca/api/sred/assess', { body: huge }))
    expect(res.failure?.response.status).toBe(413)
  })

  it('refuses an oversized declared content-length without reading it', async () => {
    const res = await readJsonBody(
      post('https://execom.ca/api/sred/assess', {
        body: JSON.stringify({ a: 1 }),
        headers: { 'content-length': String(maxBodyBytes() * 10) },
      })
    )
    expect(res.failure?.response.status).toBe(413)
  })

  it('refuses malformed JSON with 400', async () => {
    const res = await readJsonBody(post('https://execom.ca/api/sred/assess', { body: '{ nope' }))
    expect(res.failure?.response.status).toBe(400)
  })
})

describe('rate control', () => {
  beforeEach(() => resetRateLimits())

  function fromIp(ip: string) {
    return post('https://execom.ca/api/sred/assess', { headers: { 'x-forwarded-for': ip } })
  }

  it('identifies a client by the first forwarded address', () => {
    expect(clientKey(fromIp('203.0.113.9, 70.41.3.18'))).toBe('203.0.113.9')
  })

  it('lets a real person work through the flow without tripping', () => {
    const limit = getRateLimitPolicy().assessPerWindow
    for (let i = 0; i < limit; i++) {
      expect(checkRateLimit(fromIp('203.0.113.9'), 'assess')).toBeNull()
    }
  })

  it('brakes a flood with 429 and a Retry-After', () => {
    const limit = getRateLimitPolicy().assessPerWindow
    for (let i = 0; i < limit; i++) checkRateLimit(fromIp('198.51.100.7'), 'assess')
    const failure = checkRateLimit(fromIp('198.51.100.7'), 'assess')
    expect(failure?.response.status).toBe(429)
    expect(failure?.response.headers.get('Retry-After')).toBeTruthy()
  })

  it('keeps one visitor rate-limit bucket away from another', () => {
    const limit = getRateLimitPolicy().assessPerWindow
    for (let i = 0; i <= limit; i++) checkRateLimit(fromIp('198.51.100.7'), 'assess')
    expect(checkRateLimit(fromIp('203.0.113.10'), 'assess')).toBeNull()
  })

  it('keeps the lead endpoint on a tighter budget than the assessor', () => {
    const policy = getRateLimitPolicy()
    expect(policy.leadPerWindow).toBeLessThan(policy.assessPerWindow)
  })

  it('forgets a bucket once its window has passed', () => {
    const limit = getRateLimitPolicy().assessPerWindow
    const now = Date.now()
    for (let i = 0; i <= limit; i++) checkRateLimit(fromIp('198.51.100.8'), 'assess', now)
    expect(checkRateLimit(fromIp('198.51.100.8'), 'assess', now)).not.toBeNull()
    const later = now + getRateLimitPolicy().windowMs + 1
    expect(checkRateLimit(fromIp('198.51.100.8'), 'assess', later)).toBeNull()
  })
})

describe('idempotency and rate keys', () => {
  it('fingerprints the same payload identically regardless of key order', () => {
    const a = fingerprint({ answers: { b: 2, a: 1 }, contact: { email: 'x@y.ca' } })
    const b = fingerprint({ contact: { email: 'x@y.ca' }, answers: { a: 1, b: 2 } })
    expect(a).toBe(b)
  })

  it('fingerprints a changed payload differently, so a retry cannot swap answers', () => {
    const a = fingerprint({ answers: { salary_cad: 100 } })
    const b = fingerprint({ answers: { salary_cad: 200 } })
    expect(a).not.toBe(b)
  })

  it('ignores undefined so an optional answer left blank stays stable', () => {
    expect(fingerprint({ a: 1, b: undefined })).toBe(fingerprint({ a: 1 }))
  })

  it('produces a 64-character rate key that never contains the raw client address', () => {
    const key = rateKey('lead', '203.0.113.9')
    expect(key).toHaveLength(64)
    expect(key).toMatch(/^[0-9a-f]{64}$/)
    expect(key).not.toContain('203.0.113.9')
  })
})
