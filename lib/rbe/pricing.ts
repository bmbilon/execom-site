/* ────────────────────────────────────────────────────────────────────
   execom RBE: one source of truth for tier prices.

   Prices live in prices.json so the landing page, the checkout route and
   scripts/rbe_stripe_setup.mjs all read the same numbers. Change a price
   there, then rerun the setup script to move the Stripe lookup keys. Amounts are in
   whole currency units and are the same number in both markets: CAD for
   Canadian formations, USD for US formations.
   ──────────────────────────────────────────────────────────────────── */

import prices from "./prices.json"

export type Market = "ca" | "us"
export type TierId = "launch" | "named" | "brand" | "commerce" | "scale"

export const TIER_IDS: TierId[] = ["launch", "named", "brand", "commerce", "scale"]

export const RBE_PRICES: Record<TierId, { name: string; upfront: number; monthly: number }> = prices

export const CURRENCY: Record<Market, "cad" | "usd"> = { ca: "cad", us: "usd" }

/** Days between checkout and the first monthly charge. Copy on the page reads this. */
export const MONTHLY_DELAY_DAYS = 30

/** Stripe Price lookup keys, e.g. rbe_brand_setup_cad, rbe_brand_monthly_usd. */
export function lookupKey(tier: TierId, kind: "setup" | "monthly", market: Market) {
  return `rbe_${tier}_${kind}_${CURRENCY[market]}`
}

export function isTier(v: unknown): v is TierId {
  return typeof v === "string" && (TIER_IDS as string[]).includes(v)
}

export function isMarket(v: unknown): v is Market {
  return v === "ca" || v === "us"
}

/** Where a paid customer goes to open their portal account and start the intake. */
export function intakeHref(tier: TierId, market: Market, sessionId?: string) {
  const q = new URLSearchParams({ plan: `rbe-${tier}`, market })
  if (sessionId) q.set("checkout", sessionId)
  return `/portal/signup?next=${encodeURIComponent(`/portal/company-setup?${q.toString()}`)}`
}
