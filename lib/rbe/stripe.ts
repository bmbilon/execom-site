import Stripe from "stripe"

let client: Stripe | null = null

/** Server-only Stripe client. Returns null until STRIPE_SECRET_KEY is set. */
export function getStripe(): Stripe | null {
  const key = process.env.STRIPE_SECRET_KEY
  if (!key) return null
  if (!client) client = new Stripe(key)
  return client
}
