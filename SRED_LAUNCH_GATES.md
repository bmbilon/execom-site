# SR&ED acquisition funnel — launch gates

Branch: `feat/sred-claim-acquisition-funnel`

Everything below is deliberately **off**. The code is written so each item is a
configuration or an approval, not a rewrite. Nothing here should be switched on
because it is technically possible; each one is somebody's decision.

---

## 1. Purchase capital — CONFIRMED FUNDED

Brett confirmed on 2026-09-08 that capital is in place for the purchase option.
`SRED_PURCHASE_PROGRAM_OPEN` therefore stays `true`, the purchase lane is live,
and the headline "We buy qualifying SR&ED claims" is supportable.

Capital is not the same as clearance. Gate 2 below is still open, and the
headline depends on both. If funding is ever withdrawn or paused, set
`SRED_PURCHASE_PROGRAM_OPEN=false` before the next impression: with it off no
applicant is routed to `purchase_review`, filed claims fall to
`already_filed_review`, and the page must stop claiming a purchase is
available.

## 2. Legal sign-off — NOT OBTAINED

- **Tax Rebate Discounting Act applicability** to the intended purchase
  structure is unresolved. `purchaseEconomics()` in `lib/sred/engine.ts` *assumes*
  the Act's minimum-payment formula (85% of the first $300, 95% of the balance)
  applies, purely to model contribution. That assumption is labelled in the code
  and in the reviewer desk. It is not a legal opinion and no workaround has been
  invented around it.
- Page copy, the purchase/preparation distinction, and the consent wording
  (`SRED_CONSENT_VERSION = 'assessment-2026-09-07'`) need a legal read before
  launch.
- The 5% preparation service needs its own written agreement. The page describes
  it; nothing in this build enrols anyone in it.

## 3. Production database — MIGRATION NOT APPLIED

`supabase/migrations/019_sred_acquisition_leads.sql` has **not** been applied to
any environment. Apply to local/dev/preview only until reviewed.

Numbered 019 because 018 is taken by the unmerged `feat/mvp-readiness-track`
branch; the two merge without collision.

Before applying to production, verify against a live database:

- RLS actually denies a signed-in non-staff user (the policy is written; it has
  not been executed against real rows).
- `sred_lead_intake` and `sred_lead_transition` are executable by `service_role`
  only, and by nothing else.
- The `sred_acquisition_queue` view inherits RLS as expected.
- Retention and deletion policy for lead rows containing contact details.

## 4. Environment configuration — INCOMPLETE

`.env.local` does not exist in this repo. The `/sred` page and both public API
routes work without it: the assessor computes and returns a result, and the lead
endpoint responds `{ persisted: false }` and logs for manual pickup rather than
failing the applicant.

To actually store leads, set:

```
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...        # server-only, never NEXT_PUBLIC_
SRED_RATE_SALT=<random string>       # salts the rate-limit key hash
```

Without Supabase env, any request to a `/portal/*` route 500s in the auth
middleware. That is pre-existing behaviour for the whole site, not specific to
this work.

## 5. Ad spend — NOT ENABLED

No campaign has been created and no budget authorised. The page is built for the
canonical destination
`https://execom.ca/sred?utm_source=linkedin&utm_medium=paid_social&utm_campaign=...`
and `?start=1` opens the first question directly.

Do not run traffic while gate 1 is open in either direction: advertising a
purchase program that is not funded is the specific thing to avoid.

## 6. Pixels and conversion APIs — DISABLED

`emitSredEvent()` in `lib/sred/attribution.ts` pushes to a first-party
`window.dataLayer` and makes **no network call**. It is an adapter seam, not an
integration.

Before wiring any destination:

- consent capture and storage reviewed,
- the privacy allowlist in `buildAnalyticsPayload()` reviewed (it is an
  allowlist, and `lib/sred/attribution.test.ts` asserts that refund figures,
  payroll, technical narratives, CRA debt, contact details and decline reasons
  cannot appear in a payload),
- server-side conversion API and event-ID deduplication designed deliberately.

## 7. Contracts, PAD, funds movement — NOT IMPLEMENTED

No purchase agreement, no assignment, no pre-authorised debit, no bank details,
no payment of any kind exists in this build, and none is reachable from it.

The reviewer state machine deliberately has **no `approved` and no `funded`
state**: `new → triaged → awaiting_documents → specialist_review →
purchase_underwriting → preparation_offered → closed`. A test asserts no state
matching `approved|funded|paid` exists anywhere in it.

Adding financial execution requires reviewed evidence requirements, role
separation, signed approval records, verified bank details and independent
approval. That is a separate piece of work.

## 8. Outbound customer messaging — NOT ENABLED

Nothing sends email. The intake function writes a `review_task` row to
`sred_acquisition_outbox` so an accepted lead cannot be lost if a notification
later fails, but **no worker dispatches it**. No message reaches an applicant
until someone at execom does it by hand.

## 9. Document upload and AI review — OUT OF SCOPE

The public assessor collects no documents and asks for no CRA credentials. When
a prospect becomes a client, documents go through the existing portal pipeline.
No LLM touches public screening; first-stage triage is deterministic.

---

## Tuning items worth a decision before launch

These are live and working, but the numbers are business assumptions rather than
anything measured. All are environment-overridable — see `lib/sred/config.ts`.

| Item | Current default | Note |
| --- | --- | --- |
| Purchase band | $50,000 – $300,000 | Applicant-reported expected net cash |
| Prior claims | two accepted, clean | `SRED_PURCHASE_REQUIRE_CLEAN_HISTORY=false` relaxes to "no unresolved issues" |
| Collection window | ≤ 60 days | Answers of `30` or `60` pass |
| Funding cost | 10% annual | Illustrative, not a lender term |
| Base / stress days | 45 / 90 | Illustrative |
| Review + acquisition cost | $750 + $300 | Per file |
| Expected loss | 0.5% | Assumption, not measured loss history |
| Contribution floor | base $500, stress $0 | Set so the advertised $50,000 floor actually clears |

**The band floor and the economics floor are tied together.** Base contribution
runs at roughly `0.0333 x face - 1,020`, because $1,050 of fixed review and
acquisition cost has to be earned back before anything else. That gives:

| Base contribution floor | Smallest viable file |
| --- | --- |
| $1,500 | about $75,700 |
| $1,000 | about $60,700 |
| $500 (current) | about $45,700 |

So the $50,000 advertised floor works only while the base contribution floor
stays at or below about $645. **If you raise `SRED_PURCHASE_MIN_BASE_CONTRIBUTION`,
raise `SRED_PURCHASE_MIN_CASH` with it**, or the page will advertise a minimum
that underwriting then declines. A test pins the pairing so the two cannot drift
apart silently.

What a $50,000 file actually earns on this model: about $645 base and about $60
under stress. That is thin, and it is a deliberate pilot choice rather than an
oversight. Three ways to improve it if the volume is not worth the handling: a
lighter review path for small files (the $750 review cost is the biggest single
lever), a higher floor, or accepting thin margin to build claim history.

## Hardening still outstanding

- **Rate limiting** exists in two places: an in-process limiter
  (`lib/sred/guard.ts`, per instance, weakened by serverless scale-out) and a
  durable one inside `sred_lead_intake`. Edge rate control at the CDN is still
  the right answer before paid traffic.
- **Bot protection** is a honeypot plus rate control. Deliberately no CAPTCHA:
  nothing should stand between a visitor and their estimate. Revisit if abuse
  appears.
- **Origin checks** refuse a present-but-foreign `Origin`. A missing `Origin`
  header is allowed, because these endpoints are anonymous and carry no ambient
  authority. Revisit if that ever stops being true.
- **Secure resume** after contact capture is not built. Draft state is
  tab-scoped `sessionStorage` and is cleared on submit; nothing sensitive
  appears in a URL. An opaque expiring continuation token is the next step if
  resume-from-email is wanted.
- **RLS and staff-authorization tests** run against schema and types, not
  against a live database. Run them against a real Supabase instance before
  production.
