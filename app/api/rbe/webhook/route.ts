import { NextResponse, type NextRequest } from "next/server"
import type Stripe from "stripe"
import { RBE_PRICES, isMarket, isTier } from "@/lib/rbe/pricing"
import { getStripe } from "@/lib/rbe/stripe"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

/*
  POST /api/rbe/webhook

  Stripe endpoint for checkout.session.completed. Verifies the signature
  with STRIPE_WEBHOOK_SECRET and, for RBE sessions, emails the order to
  RBE_NOTIFY_EMAIL (default action@execom.ca) through Resend so a person
  can start the setup. Stripe itself holds the payment record.
*/

const esc = (s: unknown) =>
  String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")

function money(cents: number | null | undefined, currency: string | null | undefined) {
  if (cents == null) return "n/a"
  return `$${(cents / 100).toLocaleString("en-US", { minimumFractionDigits: 2 })} ${String(currency ?? "").toUpperCase()}`
}

async function notify(session: Stripe.Checkout.Session) {
  const key = process.env.RESEND_API_KEY
  if (!key) {
    console.error("[rbe] RESEND_API_KEY not set; order not emailed", session.id)
    return
  }
  const tier = session.metadata?.tier
  const market = session.metadata?.market
  const tierName = isTier(tier) ? RBE_PRICES[tier].name : String(tier)
  const country = isMarket(market) ? (market === "ca" ? "Canada" : "United States") : String(market)
  const c = session.customer_details
  const addr = c?.address
  const companyName = session.custom_fields?.find((f) => f.key === "company_name")?.text?.value

  const rows: [string, string][] = [
    ["Tier", `${tierName} (${country})`],
    ["Paid today", money(session.amount_total, session.currency)],
    ["Name", c?.name ?? ""],
    ["Email", c?.email ?? ""],
    ["Phone", c?.phone ?? ""],
    ["Company name wanted", companyName ?? "(blank)"],
    [
      "Billing address",
      addr ? [addr.line1, addr.line2, addr.city, addr.state, addr.postal_code, addr.country].filter(Boolean).join(", ") : "",
    ],
    ["Stripe customer", String(session.customer ?? "")],
    ["Subscription", String(session.subscription ?? "")],
    ["Checkout session", session.id],
  ]

  const html = `
    <div style="font-family:Inter,Arial,sans-serif;color:#111">
      <h2 style="color:#195E8E;margin:0 0 12px">New RBE order: ${esc(tierName)}, ${esc(country)}</h2>
      <table style="border-collapse:collapse;font-size:14px">
        ${rows
          .map(
            ([k, v]) =>
              `<tr><td style="padding:4px 16px 4px 0;font-weight:600;color:#195E8E;vertical-align:top">${esc(k)}</td><td>${esc(v)}</td></tr>`
          )
          .join("")}
      </table>
      <p style="font-size:13px;color:#555;margin-top:16px">The customer was sent to portal signup and company setup. Start the intake review once their account appears.</p>
    </div>`

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: "execom RBE <notifications@execom.ca>",
      to: process.env.RBE_NOTIFY_EMAIL || "action@execom.ca",
      reply_to: c?.email || undefined,
      subject: `RBE order: ${tierName} (${country}) from ${c?.name || c?.email || "new customer"}`,
      html,
    }),
  })
  if (!res.ok) console.error("[rbe] Resend failed", res.status, await res.text())
}

export async function POST(req: NextRequest) {
  const stripe = getStripe()
  const secret = process.env.STRIPE_WEBHOOK_SECRET
  const signature = req.headers.get("stripe-signature")
  if (!stripe || !secret || !signature) {
    return NextResponse.json({ error: "webhook not configured" }, { status: 400 })
  }

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(await req.text(), signature, secret)
  } catch (err) {
    console.error("[rbe] webhook signature check failed", err)
    return NextResponse.json({ error: "bad signature" }, { status: 400 })
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session
    if (session.metadata?.product === "rbe") {
      try {
        await notify(session)
      } catch (err) {
        console.error("[rbe] notify failed", err)
      }
    }
  }

  return NextResponse.json({ received: true })
}
