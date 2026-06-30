'use client'

// ============================================================================
// Marketable Range Report — hidden / soft-launch portal dashboard tile.
// Renders ONLY when NEXT_PUBLIC_MARKETABLE_RANGE_PORTAL_TILE_ENABLED === "true".
// Reads a single NEXT_PUBLIC_ flag, so nothing secret reaches the browser.
// Intentionally NOT wired into PortalSidebar (no public navigation) and has no
// marketing page.
//
// Styling matches the sibling DashboardTile components: the .dashboard-card
// liquid-glass surface, a glossy blue->teal icon badge, portal-title/portal-body
// type, and a hover chevron. The whole card is the CTA. Because it links to a
// different origin (the staging report app) where the portal session does not
// carry, it opens in a new tab so the user keeps their portal context.
//
// Root stays a <section> (the test asserts it); display:contents lets the inner
// <a> behave as the real grid item, so it lines up with the other tiles.
// ============================================================================

// Staging product entry. Swap to the production URL when the report app graduates.
export const MARKETABLE_RANGE_STAGING_URL =
  'https://execom-marketable-range-report.vercel.app/onboarding/business?product=marketable-range'

export function isMarketableRangeTileEnabled(
  value: string | undefined = process.env.NEXT_PUBLIC_MARKETABLE_RANGE_PORTAL_TILE_ENABLED,
): boolean {
  return value === 'true'
}

export interface MarketableRangeTileProps {
  // Test / override hook. When omitted, the public flag is read.
  enabled?: boolean
}

export default function MarketableRangeTile({ enabled }: MarketableRangeTileProps = {}) {
  const show = enabled ?? isMarketableRangeTileEnabled()
  if (!show) return null

  return (
    <section
      data-testid="marketable-range-portal-tile"
      aria-label="Marketable Range Report"
      className="contents"
    >
      <a
        href={MARKETABLE_RANGE_STAGING_URL}
        target="_blank"
        rel="noopener noreferrer"
        data-testid="marketable-range-tile-cta"
        className="group dashboard-card block p-6"
      >
        {/* Top-edge teal hairline that fades in on hover. Subtle "alive" cue. */}
        <span
          aria-hidden
          className="pointer-events-none absolute inset-x-4 top-0 h-px opacity-0 transition-opacity duration-200 group-hover:opacity-100 z-[2]"
          style={{
            background:
              'linear-gradient(90deg, rgba(80,196,210,0) 0%, rgba(80,196,210,0.7) 50%, rgba(80,196,210,0) 100%)',
          }}
        />

        <div className="relative z-[1] flex items-start justify-between">
          <div className="flex-1 min-w-0">
            {/* Glossy icon badge — matches DashboardTile */}
            <div
              className="relative w-12 h-12 rounded-[10px] flex items-center justify-center mb-5 transition-transform duration-200 group-hover:scale-[1.03]"
              style={{
                background:
                  'linear-gradient(135deg, #195E8E 0%, #2A7FB5 55%, #50C4D2 100%)',
                boxShadow:
                  '0 1px 0 rgba(255,255,255,0.25) inset, 0 6px 16px rgba(25, 94, 142, 0.28), 0 1px 2px rgba(25, 94, 142, 0.20)',
              }}
            >
              <span
                aria-hidden
                className="pointer-events-none absolute inset-x-1.5 top-1 h-3 rounded-t-[8px]"
                style={{
                  background:
                    'linear-gradient(180deg, rgba(255,255,255,0.35) 0%, rgba(255,255,255,0) 100%)',
                }}
              />
              <span className="relative text-white">
                <svg
                  className="w-[22px] h-[22px]"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.75}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
                </svg>
              </span>
            </div>

            <h3 className="portal-title text-[16px] font-semibold mb-1.5 tracking-tight group-hover:text-[#195E8E] transition-colors">
              Marketable Range Report
            </h3>
            <p className="portal-body text-[13px]">
              Know your marketable range before anyone anchors you. Benchmark your business against
              execom&rsquo;s Canadian Owner Exit Index framework and see which broker, buyer, or
              successor numbers are supportable based on your current inputs.
            </p>
            <p className="mt-3 text-[12px] text-[#b8b8b0]">
              $199 report &middot; optional $19/month Range Live
            </p>
          </div>

          <svg
            className="w-4 h-4 text-[#b8b8b0] mt-1 flex-shrink-0 ml-4 group-hover:text-[#195E8E] group-hover:translate-x-0.5 transition-all"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M8.25 4.5l7.5 7.5-7.5 7.5"
            />
          </svg>
        </div>
      </a>
    </section>
  )
}
