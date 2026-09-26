#!/usr/bin/env node
/*
  execom RBE: create (or update) the Stripe products and prices.

    STRIPE_SECRET_KEY=sk_test_... node scripts/rbe_stripe_setup.mjs
    STRIPE_SECRET_KEY=sk_live_... node scripts/rbe_stripe_setup.mjs

  Reads lib/rbe/prices.json. For each tier it makes one product
  (id rbe_<tier>) and four prices: setup and monthly, in CAD and USD,
  each carrying a lookup key such as rbe_brand_setup_cad. The checkout
  route finds prices by those keys.

  It also sets up GST/HST from lib/rbe/business.json: adds the GST/HST
  number to the Stripe account as a tax ID (so it can print on invoices)
  and creates the Canada GST/HST registration in Stripe Tax. Stripe Tax
  still needs the head office address, set once in the Dashboard.

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
const business = JSON.parse(readFileSync(join(here, "../lib/rbe/business.json"), "utf8"))
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
// ── GST/HST ────────────────────────────────────────────────────────────
console.log(`\nGST/HST (${business.legalName})`)

const ownIds = await stripe.taxIds.list({ owner: { type: "self" }, limit: 100 })
const gst = ownIds.data.find((t) => t.type === "ca_gst_hst" && t.value === business.gstHst)
if (gst) {
  console.log(`  = account tax ID ${gst.value} (${gst.id})`)
} else {
  const created = await stripe.taxIds.create({
    type: "ca_gst_hst",
    value: business.gstHst,
    owner: { type: "self" },
  })
  console.log(`  + account tax ID ${created.value} (${created.id})`)
}

const regs = await stripe.tax.registrations.list({ status: "all", limit: 100 })
const caReg = regs.data.find(
  (r) => r.country === "CA" && r.country_options?.ca?.type === "standard" && r.status !== "expired"
)
if (caReg) {
  console.log(`  = Stripe Tax registration CA GST/HST (${caReg.id}, ${caReg.status})`)
} else {
  const reg = await stripe.tax.registrations.create({
    country: "CA",
    country_options: { ca: { type: "standard" } },
    active_from: "now",
  })
  console.log(`  + Stripe Tax registration CA GST/HST (${reg.id}, ${reg.status})`)
}

const settings = await stripe.tax.settings.retrieve()
if (settings.status === "active") {
  console.log("  Stripe Tax is active. Checkout charges GST/HST to Canadian buyers.")
} else {
  const missing = settings.status_details?.pending?.missing_fields?.join(", ") || "head_office"
  console.log(`  Stripe Tax is pending (missing: ${missing}).`)
  console.log("  Dashboard > Tax > Settings: add the head office address. Checkout turns tax on by itself after that.")
}
console.log("  Dashboard > Settings > Billing > Invoice template: tick the GST/HST number so it prints on every invoice.")

console.log("\nDone.")
