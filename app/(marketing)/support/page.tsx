import type { Metadata } from "next"
import Link from "next/link"

export const metadata: Metadata = {
  title: "Customer support | execom",
  description: "Customer support for all brands, products and services operated by Execom Inc. Get help with payments, orders, bookings, subscriptions and account access.",
  alternates: { canonical: "https://execom.ca/support" },
}

const topics = [
  {
    title: "Payments and receipts",
    description: "Ask about a charge, request a receipt or get help identifying a payment. Include the payment date, amount and any invoice or order reference.",
    subject: "Payment and receipt support",
  },
  {
    title: "Orders, bookings and subscriptions",
    description: "Need help with an order, rental, booking or subscription? Include the brand, your reference number and any change, cancellation or refund you are requesting. The terms of your purchase or booking apply.",
    subject: "Order, booking and subscription support",
  },
  {
    title: "Products, services and accounts",
    description: "Having trouble with a product, app, service or account? Tell us the brand or website, what you need help with and what happened. For account issues, include the email address you signed up with.",
    subject: "Product, service and account support",
  },
]

export default function SupportPage() {
  return (
    <>
      <section className="relative dark-atmosphere hero-pattern overflow-hidden">
        <div className="absolute bottom-0 left-0 h-px w-full bg-gradient-to-r from-teal/40 via-teal/10 to-transparent" />
        <div className="relative mx-auto max-w-[1200px] px-6 py-20 md:px-8 md:py-28">
          <p className="mb-6 text-nav uppercase tracking-widest text-teal">Customer support</p>
          <h1 className="max-w-[720px] font-serif text-[2.5rem] leading-[1.15] text-white md:text-[3.5rem]">How can we help?</h1>
          <p className="mt-7 max-w-[640px] text-lg leading-relaxed text-white/70">
            Support for all brands, products and services operated by Execom Inc.
            Whether you need help with a purchase, booking, subscription or account,
            contact our team and tell us which brand you used.
          </p>
          <a href="mailto:support@execom.ca" className="mt-9 inline-flex rounded-sm bg-teal px-6 py-4 font-medium text-[#071923] transition-colors hover:bg-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-teal sm:px-8">
            support@execom.ca <span aria-hidden="true" className="ml-4">↗</span>
          </a>
          <p className="mt-4 text-sm text-white/60">One support contact across all Execom Inc. brands.</p>
        </div>
      </section>

      <section className="light-section py-16 md:py-20" aria-label="Support topics">
        <div className="mx-auto grid max-w-[1200px] gap-6 px-6 md:grid-cols-3 md:px-8">
          {topics.map((topic) => (
            <article key={topic.title} className="flex flex-col rounded-sm border border-border bg-white p-7">
              <h2 className="font-serif text-2xl leading-tight text-fg">{topic.title}</h2>
              <p className="mb-7 mt-4 flex-1 text-base leading-relaxed text-fg/75">{topic.description}</p>
              <a href={`mailto:support@execom.ca?subject=${encodeURIComponent(topic.subject)}`} aria-label={`Email support: ${topic.title}`} className="font-medium text-blue underline decoration-blue/30 underline-offset-4 hover:decoration-blue">
                Email support <span aria-hidden="true">↗</span>
              </a>
            </article>
          ))}
        </div>
      </section>

      <section className="dark-atmosphere py-16 md:py-20">
        <div className="mx-auto grid max-w-[1200px] gap-10 px-6 md:grid-cols-2 md:px-8">
          <div>
            <h2 className="font-serif text-2xl text-white">What to include in your email</h2>
            <ul className="mt-5 list-disc space-y-3 pl-5 text-base leading-relaxed text-white/70">
              <li>Your name and the email used for your purchase, booking or account.</li>
              <li>The brand, product, app or website your request relates to.</li>
              <li>Your invoice, order, reservation or subscription reference, if you have one.</li>
              <li>A short description of the issue or requested change.</li>
            </ul>
            <p className="mt-6 text-sm leading-relaxed text-white/60">Please do not email passwords, verification codes or full card numbers.</p>
          </div>
          <div className="border-t border-white/15 pt-8 md:border-l md:border-t-0 md:pl-10 md:pt-0">
            <h2 className="font-serif text-2xl text-white">Useful links</h2>
            <div className="mt-5 flex flex-col items-start gap-4">
              <Link href="/portal/login" className="text-teal underline underline-offset-4">execom client portal</Link>
              <a href="https://rentbot.ca/contact" className="text-teal underline underline-offset-4">RentBot rental enquiries</a>
              <Link href="/contact" className="text-teal underline underline-offset-4">New project enquiries</Link>
            </div>
            <p className="mt-7 text-sm leading-relaxed text-white/60">
              Unsure which brand a charge relates to? If your statement mentions
              Execom Inc. or execom, email the payment date, amount and the
              description shown on your statement so we can help identify it.
            </p>
          </div>
        </div>
      </section>
    </>
  )
}
