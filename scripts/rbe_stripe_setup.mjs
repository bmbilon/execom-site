#!/usr/bin/env node
/*
  execom RBE: create (or update) the Stripe products and prices.

    STRIPE_SECRET_KEY=sk_test_... node scripts/rbe_stripe_setup.mjs
    STRIPE_SECRET_KEY=sk_live_... node scripts/rbe_stripe_setup.mjs

  Reads lib/rbe/prices.json. For each tier it makes one product
  (id rbe_<tier>) and four prices: setup and monthly, in CAD and USD,
  each carrying a lookup key such as rbe_brand_setup_cad. The checkout
  route finds prices by those keys.

  Safe to rerun. An existing price with the right amount is left alone.
  If the amount in prices.json changed, a new price is created and the
  lookup key moves to it (transfer_lookup_key), so checkout switches
  over with no deploy and existing subscribers keep their old price.
  Run it once in test mode, once in live mode.
*/

import { readFileSync } from "node:fs"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"
import Stripe from "stripe"

const key = process.env.STRIPE_SECRET_KEY
if (!key) {
  console.error("Set STRIPE_SECRET_KEY first.")
  process.exit(1)
}
const stripe = new Stripe(key)
const here = dirname(fileURLToPath(import.meta.url))
const tiers = JSON.parse(readFileSync(join(here, "../lib/rbe/prices.json"), "utf8"))
const currencies = ["cad", "usd"]

async function ensureProduct(tier, name) {
  const id = `rbe_${tier}`
  try {
    const p = await stripe.products.retrieve(id)
    if (p.name !== `execom RBE ${name}` || !p.active) {
      await stripe.products.update(id, { name: `execom RBE ${name}`, active: true })
    }
    return id
  } catch (err) {
    if (err?.statusCode !== 404) throw err
    await stripe.products.create({
      id,
      name: `execom RBE ${name}`,
      metadata: { product: "rbe", tier },
    })
    return id
  }
}

async function ensurePrice({ product, lookup, currency, amount, recurring, nickname }) {
  const existing = (await stripe.prices.list({ lookup_keys: [lookup], limit: 1 })).data[0]
  if (existing && existing.unit_amount === amount && existing.currency === currency && existing.active) {
    return `  = ${lookup} ${existing.id}`
  }
  const created = await stripe.prices.create({
    product,
    currency,
    unit_amount: amount,
    nickname,
    tax_behavior: "exclusive",
    lookup_key: lookup,
    transfer_lookup_key: true,
    ...(recurring ? { recurring: { interval: "month" } } : {}),
  })
  if (existing) await stripe.prices.update(existing.id, { active: false })
  return `  + ${lookup} ${created.id}${existing ? ` (replaced ${existing.id})` : ""}`
}

const mode = key.startsWith("sk_live") ? "LIVE" : "test"
console.log(`execom RBE Stripe setup (${mode} mode)`)

for (const [tier, t] of Object.entries(tiers)) {
  const product = await ensureProduct(tier, t.name)
  console.log(`${t.name} (${product})`)
  for (const currency of currencies) {
    console.log(
      await ensurePrice({
        product,
        currency,
        lookup: `rbe_${tier}_setup_${currency}`,
        amount: t.upfront * 100,
        recurring: false,
        nickname: `${t.name} setup ${currency.toUpperCase()}`,
      })
    )
    console.log(
      await ensurePrice({
        product,
        currency,
        lookup: `rbe_${tier}_monthly_${currency}`,
        amount: t.monthly * 100,
        recurring: true,
        nickname: `${t.name} monthly ${currency.toUpperCase()}`,
      })
    )
  }
}
console.log("Done.")
