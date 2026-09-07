import type { Metadata } from "next"

import SredAssessor from "@/components/sred/SredAssessor"
import SignInLink from "@/components/sred/SignInLink"
import StickyStartBar from "@/components/sred/StickyStartBar"
import {
  ELIGIBILITY,
  FAQ,
  FOOTER_DISCLOSURE,
  HERO,
  TWO_PATHS,
} from "@/components/sred/copy"

export const metadata: Metadata = {
  title: "We buy qualifying SR&ED claims | execom",
  description:
    "Find out what your SR&ED claim could be worth, and whether execom will buy it. Free estimate, no obligation. Claims we do not purchase can be prepared for 5% of the refund actually received.",
  alternates: { canonical: "/sred" },
}

export default function SRED() {
  return (
    <>
      {/* ── HERO + ASSESSOR ───────────────────────────────────────────────
          One dark block. The assessor card starts inside the first mobile
          viewport so a sponsored-post visitor can begin without scrolling
          through an explanation first. ?start=1 skips straight to question one. */}
      <section className="relative dark-atmosphere hero-pattern overflow-hidden">
        <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-[#195E8E]/15 to-transparent" />
        <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-teal/40 via-teal/10 to-transparent" />

        <div className="relative max-w-[1200px] mx-auto px-5 sm:px-8 pt-7 pb-12 md:pt-20 md:pb-24">
          <div className="grid lg:grid-cols-[1fr_minmax(0,520px)] gap-8 lg:gap-16 items-start">
            {/* The hero block is deliberately short on a phone. A LinkedIn
                visitor lands, reads one promise, and the first assessor
                question is the next thing on screen. The second supporting
                line and the purchase disclosure move below the card on mobile
                so they inform without standing between the offer and the
                first input. */}
            <div className="max-w-[620px]">
              <p className="text-teal text-nav uppercase tracking-widest mb-3">
                {HERO.eyebrow}
              </p>

              <h1 className="text-[1.75rem] sm:text-[2.25rem] md:text-[3.25rem] leading-[1.14] font-serif text-white mb-3 md:mb-5">
                {HERO.headline}
              </h1>

              <p className="text-[15px] md:text-lg text-white/70 leading-relaxed mb-3 md:mb-2">
                {HERO.sub}
              </p>
              <p className="hidden md:block text-lg text-white/70 leading-relaxed mb-5">
                {HERO.sub2}
              </p>

              <p className="text-white font-medium text-[15px] mb-4 md:mb-6">{HERO.promise}</p>

              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                <a href="#assessor" className="btn-premium justify-center sm:justify-start">
                  {HERO.primaryCta}
                </a>
                <SignInLink
                  className="inline-flex items-center justify-center sm:justify-start min-h-[44px] text-[14px] text-white/55 hover:text-teal underline underline-offset-4 transition-colors"
                  label={HERO.secondaryCta}
                />
              </div>

              <p className="hidden md:block mt-6 text-[13px] leading-relaxed text-white/40 max-w-[520px]">
                {HERO.disclosure}
              </p>

              <div className="hidden md:block mt-8 w-16 h-0.5 bg-teal" />
            </div>

            <div className="lg:pt-2">
              <SredAssessor />

              {/* Mobile home for the purchase disclosure: still visible without
                  hunting, still before anyone can act on the offer. */}
              <p className="md:hidden mt-5 text-[13px] leading-relaxed text-white/40">
                {HERO.disclosure}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── WHAT IT COULD BE WORTH ────────────────────────────────────── */}
      <section className="light-section section-from-dark py-16 md:py-24">
        <div className="max-w-content mx-auto px-5 sm:px-8 space-y-5 text-body text-fg/80">
          <p className="section-label">What a claim is usually worth</p>

          <p>
            A Canadian-controlled private corporation can recover 35% of qualifying SR&amp;ED
            expenditures as a refundable federal credit, on top of whatever its province pays. For a
            company with a technical team, that is normally the difference between a good year and a
            tight one.
          </p>

          <p>
            The size of a claim tracks the technical payroll behind it far more than the industry it
            sits in. A four-person engineering team working on a genuinely uncertain problem
            routinely produces a larger claim than a laboratory that documented nothing.
          </p>

          <p className="text-fg font-semibold text-lg">
            The estimate above is indicative. It is not a CRA determination, and it is not an offer.
          </p>
        </div>
      </section>

      {/* ── TWO PATHS ─────────────────────────────────────────────────── */}
      <section className="dark-atmosphere py-16 md:py-24">
        <div className="max-w-wide mx-auto px-5 sm:px-8">
          <p className="section-label-light mb-10">Two ways this can go</p>

          <div className="grid md:grid-cols-2 gap-5 md:gap-6">
            {TWO_PATHS.map((path) => (
              <div key={path.index} className="card-dark p-6 md:p-8">
                <p className="card-index">{path.index}</p>
                <h2 className="card-title mt-3">{path.title}</h2>
                <p className="card-body mt-4">{path.body}</p>
                <p className="mt-5 text-[13px] leading-relaxed text-white/40">{path.fine}</p>
              </div>
            ))}
          </div>

          <p className="mt-8 text-[13px] leading-relaxed text-white/40 max-w-[720px]">
            The purchase program and the preparation service are separate. Companies not offered a
            purchase choose for themselves whether to engage execom for preparation, and nobody is
            enrolled in anything by using the estimator.
          </p>
        </div>
      </section>

      {/* ── ELIGIBILITY EDUCATION ─────────────────────────────────────── */}
      <section className="light-section section-from-dark py-16 md:py-24">
        <div className="max-w-content mx-auto px-5 sm:px-8 space-y-5 text-body text-fg/80">
          <p className="section-label">Eligibility</p>

          <h2 className="text-[1.5rem] md:text-[1.75rem] font-serif text-fg leading-snug">
            {ELIGIBILITY.heading}
          </h2>

          <p>{ELIGIBILITY.body}</p>
          <p>{ELIGIBILITY.body2}</p>
          <p>{ELIGIBILITY.body3}</p>
          <p className="text-fg font-medium">{ELIGIBILITY.body4}</p>

          <div className="pt-2">
            <a href="#assessor" className="btn-premium">
              {ELIGIBILITY.cta}
            </a>
          </div>
        </div>
      </section>

      {/* ── TRUST / COMPLIANCE ────────────────────────────────────────── */}
      <section className="dark-atmosphere py-16 md:py-24">
        <div className="max-w-content mx-auto px-5 sm:px-8 text-white/70 space-y-5">
          <p className="section-label-light">How execom handles this</p>

          <p>
            The estimator asks only what a screening decision needs. It never asks for CRA
            credentials, and no documents are uploaded through the public page. When a prospect
            becomes a client, everything moves into the existing execom portal, where documents,
            claim preparation and review already live.
          </p>

          <p>
            Screening is deterministic and versioned. The same answers produce the same result, the
            server recalculates every figure rather than trusting the browser, and each assessment
            records the policy version it was decided under, so any result can be explained months
            later.
          </p>

          <p>
            Your figures, technical description and tax details are never sent to advertising
            platforms. Campaign attribution is first-party and carries no business data.
          </p>

          <p className="pt-2">
            <SignInLink
              className="inline-flex items-center min-h-[44px] text-[14px] text-white/60 hover:text-teal underline underline-offset-4 transition-colors"
              label="Already an execom client? Sign in to the portal"
            />
          </p>
        </div>
      </section>

      {/* ── FAQ ───────────────────────────────────────────────────────── */}
      <section className="light-section section-from-dark py-16 md:py-24">
        <div className="max-w-content mx-auto px-5 sm:px-8">
          <p className="section-label mb-8">Straight answers</p>

          <div className="space-y-4">
            {FAQ.map((item) => (
              <details
                key={item.q}
                className="group rounded-[5px] border border-border bg-white/70 px-5"
              >
                <summary className="cursor-pointer list-none py-4 text-[16px] font-medium text-fg flex items-start justify-between gap-4">
                  <span>{item.q}</span>
                  <span
                    aria-hidden
                    className="mt-1 shrink-0 text-teal transition-transform group-open:rotate-45"
                  >
                    +
                  </span>
                </summary>
                <p className="pb-5 text-[15px] leading-relaxed text-fg/70">{item.a}</p>
              </details>
            ))}
          </div>

          <div className="mt-12 pt-8 border-t border-border space-y-4">
            {FOOTER_DISCLOSURE.map((line, i) => (
              <p key={i} className="text-[13px] leading-relaxed text-muted">
                {line}
              </p>
            ))}
          </div>
        </div>
      </section>

      <StickyStartBar />
    </>
  )
}
