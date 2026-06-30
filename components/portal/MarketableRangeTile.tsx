'use client'

// ============================================================================
// Marketable Range Report — hidden / soft-launch portal dashboard tile.
// Renders ONLY when NEXT_PUBLIC_MARKETABLE_RANGE_PORTAL_TILE_ENABLED === "true".
// Reads a single NEXT_PUBLIC_ flag, so nothing secret reaches the browser.
// Intentionally NOT wired into PortalSidebar (no public navigation) and has no
// marketing page. The CTA opens the staging app in a new tab: it is a different
// origin and the portal session does not carry, so a same-tab nav would dump
// the user out of the portal into a separate login. New tab keeps context.
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
      className="bg-white border border-[#E5E5E5] rounded-lg p-6 flex flex-col"
    >
      <div className="w-10 h-10 rounded-lg bg-[#195E8E]/5 flex items-center justify-center mb-4">
        <svg
          className="w-5 h-5 text-[#195E8E]"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.5}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z"
          />
        </svg>
      </div>

      <h3 className="text-[15px] font-semibold text-[#1A1A1A] mb-1.5">Marketable Range Report</h3>

      <p className="text-[13px] font-semibold text-[#195E8E] mb-2">
        Know your marketable range before anyone anchors you.
      </p>

      <p className="text-[13px] text-[#5A5A5A] leading-relaxed mb-4">
        Connect your financials, benchmark your business against execom&rsquo;s Canadian Owner Exit
        Index framework, and see which broker, buyer, or successor numbers are supportable based on
        your current inputs.
      </p>

      <a
        href={MARKETABLE_RANGE_STAGING_URL}
        target="_blank"
        rel="noopener noreferrer"
        data-testid="marketable-range-tile-cta"
        className="self-start bg-[#195E8E] text-white text-[13px] font-semibold px-4 py-2 rounded-md hover:bg-[#16527c] transition-colors"
      >
        Start report
      </a>

      <p className="text-[12px] text-[#b8b8b0] mt-3">
        $199 report · optional $19/month Range Live
      </p>
    </section>
  )
}
