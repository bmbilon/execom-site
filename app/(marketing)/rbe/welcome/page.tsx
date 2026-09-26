import type { Metadata } from "next"
import Link from "next/link"
import { ArrowRight } from "lucide-react"
import type Stripe from "stripe"
import { RBE_PRICES, intakeHref, isMarket, isTier } from "@/lib/rbe/pricing"
import { getStripe } from "@/lib/rbe/stripe"
import { GST_HST_DISPLAY } from "@/lib/rbe/business"
import { accentTitle } from "@/components/site/Rich"
import { brandCase } from "@/components/site/brand"

export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  title: "Welcome to RBE | execom",
  robots: { index: false, follow: false },
}

type Confirmed = {
  tierName: string
  country: string
  email: string | null
  paid: string
  firstMonthly: string | null
  href: string
}

async function confirm(sessionId: string | undefined): Promise<Confirmed | null> {
  const stripe = getStripe()
  if (!stripe || !sessionId || !sessionId.startsWith("cs_")) return null
  try {
    const s = await stripe.checkout.sessions.retrieve(sessionId, { expand: ["subscription"] })
    const tier = s.metadata?.tier
    const market = s.metadata?.market
    const settled = s.payment_status === "paid" || s.payment_status === "no_payment_required"
    if (s.status !== "complete" || !settled || !isTier(tier) || !isMarket(market)) return null

    const sub = typeof s.subscription === "object" ? (s.subscription as Stripe.Subscription | null) : null
    const firstMonthly = sub?.trial_end
      ? new Date(sub.trial_end * 1000).toLocaleDateString("en-US", {
          month: "long",
          day: "numeric",
          year: "numeric",
          timeZone: "America/Edmonton",
        })
      : null

    return {
      tierName: RBE_PRICES[tier].name,
      country: market === "ca" ? "Canada" : "United States",
      email: s.customer_details?.email ?? null,
      paid: `$${((s.amount_total ?? 0) / 100).toLocaleString("en-US", { minimumFractionDigits: 2 })} ${String(s.currency ?? "").toUpperCase()}`,
      firstMonthly,
      href: intakeHref(tier, market, s.id),
    }
  } catch (err) {
    console.error("[rbe] welcome lookup failed", err)
    return null
  }
}

export default async function RbeWelcome({
  searchParams,
}: {
  searchParams: { session_id?: string }
}) {
  const c = await confirm(searchParams.session_id)

  return (
    <section className="relative -mt-[var(--header-h)] flex min-h-[78vh] items-center overflow-hidden pb-20 pt-[calc(var(--header-h)+56px)] md:pb-28 md:pt-[calc(var(--header-h)+88px)]">
      <div className="s-atmo" aria-hidden />
      <div className="s-horizon" aria-hidden />
      <div className="s-container relative">
        {c ? (
          <div className="grid gap-12 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] lg:items-start lg:gap-16">
            <div>
              <p className="s-eyebrow s-eyebrow-dot mb-6">{brandCase(`execom RBE · ${c.tierName}`)}</p>
              <h1 className="s-display s-display-lg s-gradient-text max-w-[16ch]">
                {accentTitle("Payment received. Now *the intake*.")}
              </h1>
              <p className="s-lede mt-7 max-w-[52ch]">
                Create your portal account{c.email ? ` with ${c.email}` : ""} and answer one structured intake. Nothing
                gets filed until a person has reviewed it.
              </p>
              <div className="mt-10">
                <Link href={c.href} className="s-btn s-btn-primary s-btn-lg">
                  Create my portal account
                  <ArrowRight className="s-arrow h-4 w-4" aria-hidden />
                </Link>
              </div>
            </div>

            <div className="s-edge p-7 md:p-8">
              <p className="s-eyebrow">Your order</p>
              <dl className="rbe-receipt mt-5">
                <div>
                  <dt>Tier</dt>
                  <dd>{c.tierName}</dd>
                </div>
                <div>
                  <dt>Forming in</dt>
                  <dd>{c.country}</dd>
                </div>
                <div>
                  <dt>Paid today</dt>
                  <dd>{c.paid}</dd>
                </div>
                {c.firstMonthly && (
                  <div>
                    <dt>First monthly charge</dt>
                    <dd>{c.firstMonthly}</dd>
                  </div>
                )}
              </dl>
              <p className="mt-6 text-[13.5px] leading-relaxed text-haze">
                Your receipt is on its way from Stripe. Questions go to{" "}
                <a href="mailto:action@execom.ca" className="text-cyan-200 underline underline-offset-[3px]">
                  action@execom.ca
                </a>
                .
              </p>
              <p className="mt-2 text-[12px] text-fog">execom Inc. GST/HST No. {GST_HST_DISPLAY}</p>
            </div>
          </div>
        ) : (
          <div className="max-w-[680px]">
            <p className="s-eyebrow s-eyebrow-dot mb-6">{brandCase("execom RBE")}</p>
            <h1 className="s-display s-display-lg s-gradient-text">We couldn&apos;t confirm that checkout.</h1>
            <p className="s-lede mt-7">
              If you paid, your Stripe receipt has the details and we have the order. Email{" "}
              <a href="mailto:action@execom.ca">action@execom.ca</a> and we&apos;ll send your intake link. If you didn&apos;t
              finish, pick up where you left off.
            </p>
            <div className="mt-10">
              <Link href="/rbe#tiers" className="s-btn s-btn-primary s-btn-lg">
                Back to the tiers
                <ArrowRight className="s-arrow h-4 w-4" aria-hidden />
              </Link>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
