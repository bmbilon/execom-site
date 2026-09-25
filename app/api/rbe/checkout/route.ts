import { NextResponse, type NextRequest } from "next/server"
import type Stripe from "stripe"
import {
  CURRENCY,
  MONTHLY_DELAY_DAYS,
  RBE_PRICES,
  intakeHref,
  isMarket,
  isTier,
  lookupKey,
  type Market,
  type TierId,
} from "@/lib/rbe/pricing"
import { getStripe } from "@/lib/rbe/stripe"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

/*
  POST /api/rbe/checkout   (form fields: tier, market)

  Creates a Stripe Checkout Session in subscription mode with two lines:
  the one-time setup fee, charged now, and the monthly plan, whose first
  charge lands MONTHLY_DELAY_DAYS after checkout. Answers 303 to Stripe.

  Prices come from Stripe by lookup key (scripts/rbe_stripe_setup.mjs
  creates them). If a key is missing, the line is built inline from
  lib/rbe/pricing.ts so checkout never breaks on a half-finished setup.
  With no STRIPE_SECRET_KEY at all, the visitor falls back to the old
  path: portal signup, then company setup.
*/

async function lineItems(
  stripe: Stripe,
  tier: TierId,
  market: Market
): Promise<Stripe.Checkout.SessionCreateParams.LineItem[]> {
  const p = RBE_PRICES[tier]
  const currency = CURRENCY[market]
  const setupKey = lookupKey(tier, "setup", market)
  const monthlyKey = lookupKey(tier, "monthly", market)

  const found = await stripe.prices.list({
    lookup_keys: [setupKey, monthlyKey],
    active: true,
    limit: 2,
  })
  const byKey = new Map(found.data.map((price) => [price.lookup_key, price.id]))

  const setup: Stripe.Checkout.SessionCreateParams.LineItem = byKey.get(setupKey)
    ? { price: byKey.get(setupKey), quantity: 1 }
    : {
        quantity: 1,
        price_data: {
          currency,
          unit_amount: p.upfront * 100,
          tax_behavior: "exclusive",
          product_data: { name: `execom RBE ${p.name}: setup` },
        },
      }

  const monthly: Stripe.Checkout.SessionCreateParams.LineItem = byKey.get(monthlyKey)
    ? { price: byKey.get(monthlyKey), quantity: 1 }
    : {
        quantity: 1,
        price_data: {
          currency,
          unit_amount: p.monthly * 100,
          recurring: { interval: "month" },
          tax_behavior: "exclusive",
          product_data: { name: `execom RBE ${p.name}: monthly plan` },
        },
      }

  if (!byKey.get(setupKey) || !byKey.get(monthlyKey)) {
    console.warn(`[rbe] price lookup keys missing for ${tier}/${market}; using inline prices`)
  }
  return [setup, monthly]
}

export async function POST(req: NextRequest) {
  const origin = req.nextUrl.origin
  let tier: unknown
  let market: unknown
  try {
    const form = await req.formData()
    tier = form.get("tier")
    market = form.get("market")
  } catch {
    /* fall through to validation */
  }

  if (!isTier(tier) || !isMarket(market)) {
    return NextResponse.redirect(new URL("/rbe#tiers", origin), 303)
  }

  const stripe = getStripe()
  if (!stripe) {
    console.error("[rbe] STRIPE_SECRET_KEY not set; sending visitor to portal signup")
    return NextResponse.redirect(new URL(intakeHref(tier, market), origin), 303)
  }

  const meta = { product: "rbe", tier, market }

  try {
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      line_items: await lineItems(stripe, tier, market),
      subscription_data: {
        trial_period_days: MONTHLY_DELAY_DAYS,
        metadata: meta,
      },
      metadata: meta,
      client_reference_id: `rbe-${tier}-${market}`,
      allow_promotion_codes: true,
      billing_address_collection: "required",
      automatic_tax: { enabled: process.env.STRIPE_AUTOMATIC_TAX === "1" },
      custom_fields: [
        {
          key: "company_name",
          label: { type: "custom", custom: "Company name you want (or numbered)" },
          type: "text",
          optional: true,
        },
      ],
      custom_text: {
        submit: {
          message: `The setup fee is charged today. Your first monthly charge comes ${MONTHLY_DELAY_DAYS} days from now.`,
        },
      },
      success_url: `${origin}/rbe/welcome?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/rbe?market=${market}#tiers`,
    })

    if (!session.url) throw new Error("Checkout Session returned no URL")
    return NextResponse.redirect(session.url, 303)
  } catch (err) {
    console.error("[rbe] checkout session failed", err)
    return NextResponse.redirect(new URL(`/rbe?market=${market}&checkout=error#tiers`, origin), 303)
  }
}
