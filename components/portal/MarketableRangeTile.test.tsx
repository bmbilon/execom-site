import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import MarketableRangeTile, {
  isMarketableRangeTileEnabled,
  MARKETABLE_RANGE_STAGING_URL,
} from '@/components/portal/MarketableRangeTile'

const FLAG = 'NEXT_PUBLIC_MARKETABLE_RANGE_PORTAL_TILE_ENABLED'
const TILE_SRC = readFileSync('components/portal/MarketableRangeTile.tsx', 'utf8')

describe('feature flag gating', () => {
  it('is disabled when the flag is missing or not exactly "true"', () => {
    expect(isMarketableRangeTileEnabled(undefined)).toBe(false)
    expect(isMarketableRangeTileEnabled('')).toBe(false)
    expect(isMarketableRangeTileEnabled('false')).toBe(false)
    expect(isMarketableRangeTileEnabled('1')).toBe(false)
    expect(isMarketableRangeTileEnabled('TRUE')).toBe(false)
  })

  it('is enabled only for the exact string "true"', () => {
    expect(isMarketableRangeTileEnabled('true')).toBe(true)
  })

  it('renders nothing when explicitly disabled', () => {
    expect(MarketableRangeTile({ enabled: false })).toBeNull()
  })

  it('renders nothing when the env flag is unset (default hidden)', () => {
    const prev = process.env[FLAG]
    delete process.env[FLAG]
    try {
      expect(MarketableRangeTile()).toBeNull()
    } finally {
      if (prev === undefined) delete process.env[FLAG]
      else process.env[FLAG] = prev
    }
  })

  it('renders the tile element when enabled', () => {
    const el = MarketableRangeTile({ enabled: true })
    expect(el).not.toBeNull()
    expect((el as { type?: unknown } | null)?.type).toBe('section')
  })
})

describe('CTA target', () => {
  it('points to the staging product URL', () => {
    expect(MARKETABLE_RANGE_STAGING_URL).toBe(
      'https://execom-marketable-range-report.vercel.app/onboarding/business?product=marketable-range',
    )
  })

  it('uses that URL and opens in a new tab safely', () => {
    expect(TILE_SRC).toMatch(/href=\{MARKETABLE_RANGE_STAGING_URL\}/)
    expect(TILE_SRC).toMatch(/target="_blank"/)
    expect(TILE_SRC).toMatch(/rel="noopener noreferrer"/)
  })
})

describe('security', () => {
  it('references no service-role or other secret env vars (NEXT_PUBLIC_ only)', () => {
    expect(TILE_SRC).not.toContain('SUPABASE_SERVICE_ROLE_KEY')
    const envRefs = [...TILE_SRC.matchAll(/process\.env\.([A-Za-z0-9_]+)/g)].map((m) => m[1])
    expect(envRefs.length).toBeGreaterThan(0)
    for (const ref of envRefs) expect(ref.startsWith('NEXT_PUBLIC_')).toBe(true)
  })
})

describe('no public navigation changes', () => {
  it('PortalSidebar does not link to the marketable range tile', () => {
    const nav = readFileSync('components/portal/PortalSidebar.tsx', 'utf8').toLowerCase()
    expect(nav).not.toContain('marketable')
    expect(nav).not.toContain(MARKETABLE_RANGE_STAGING_URL.toLowerCase())
  })
})

describe('dashboard integration', () => {
  it('DashboardClient imports and renders the hidden Marketable Range tile', () => {
    const dashboard = readFileSync(
      'app/(portal)/portal/dashboard/DashboardClient.tsx',
      'utf8',
    )

    expect(dashboard).toContain('MarketableRangeTile')
    expect(dashboard).toMatch(/import\s+MarketableRangeTile\s+from\s+['"]@\/components\/portal\/MarketableRangeTile['"]/)
    expect(dashboard).toMatch(/<MarketableRangeTile\s*\/>/)
  })
})
