# Project Rules — execom-site

## Git and working directory

- **The git repo root is `execom-site/`.** All git commands, file paths, and working directory references must use this as the base.
- When giving the user shell commands to run locally, **always** prefix with:
  ```
  cd ~/Desktop/execom/execom-site && ...
  ```
  Never assume the user is already in the right directory. Every command block starts with this `cd`.
- The remote is `origin` → `https://github.com/bmbilon/execom-site.git`
- Primary branch: `main`

## Pre-push quality gate

- Before committing any TypeScript change, **always** run `npx tsc --noEmit` and confirm zero errors.
- Before committing any change, **always** run `npx next build` (or at minimum `npx tsc --noEmit`) to catch build failures before they hit Vercel.
- If a sandbox/session copy of the repo is used for editing, the final files must be synced back to the repo at `~/Desktop/execom/execom-site` and the build verified there before pushing.
- Never push code that has not passed a local type check. One clean push attempt — no "fix it on the next commit" cycles.

## Brand rules

- "execom" is always **lowercase** in visible UI copy. Never "Execom" or "EXECOM" in user-facing text.
- Never use em dashes in copy or comments. En dashes only for numeric ranges.

## Marketing site system

- Design system and rules: `brand/brand-guidelines.md` (v2, dark premium). Read it before touching `app/(marketing)`.
- Shared components live in `components/site/`; navigation data in `lib/site/nav.ts`; long-form page content in `lib/site/content/` (register new pages in `lib/site/content/index.ts`).
- Marketing styles are scoped under `.site` in `app/globals.css`; the portal keeps its own light theme.
- The home page tells the commercialization path (validate, structure and fund, build, enter the market, sell). Company setup, IP and SR&ED are stage 02; the portal engine copy sits in disclosures under it.
- The home hero visual is the launch corridor (`components/site/home/LaunchCorridor.tsx`, engine in `lib/site/corridor.ts`): canvas 2D, no dependencies. It plays once: the breakout settles into a still white core, the canvas stops, and the execom logo fades in on the core and stays (breathing glow in CSS). Reduced motion shows that end state directly. Keep the hero visual kinetic; no static checklist panels there.
- Home page proof lives in `lib/site/work.ts`. An entry renders only with `published: true` plus approved copy and a visual. Never write work copy that does not trace to published or client-supplied material.
- Never run find-and-replace scripts over binary files (images were corrupted by an em dash sweep in commit 9d5d82b).
- `/rbe` (execom RBE) is an unlisted ad landing page on the same system. Prices live in `lib/rbe/prices.json`; checkout posts to `/api/rbe/checkout` (Stripe Checkout, subscription with a one-time setup line). Keep the form fields `tier` and `market`.

## SQL migrations

- Migration files live at the repo root (e.g., `020_calculator_schema.sql`, `021_calculator_seed_data.sql`).
- Never modify a migration after it has been committed. Create a new numbered migration instead.
- Use the real `methodology_configs` schema: `value` is jsonb, `label` is NOT NULL, unique index is `(key, effective_date) WHERE superseded_date IS NULL`.

## Benchmark / calculator contracts

- Preserve existing benchmark slugs referenced in `calculatorService.ts` — do not introduce parallel slugs.
- Preserve existing scenario names: `fragmented_founder_path`, `execom`, `lean`, `professional`, `full_stack`, `all`, `delay`.
- Preserve `calculator_runs` JSONB persistence model — do not add typed columns for fields already in `inputs`/`outputs` JSONB.
- Preserve existing ramp config keys (`ramp_profile_{conservative|moderate|aggressive}_m{1_6|7_12}`).
- `accelerator_equity_proxy` is stored as a CAD dollar proxy, not percent.
- Benchmark resolution uses four-tier hierarchy: region+exact scenario > region+'all' > national+exact > national+'all'.

## Tier slugs

- `independence_launch`, `operator_system`, `asset_builder`, `executive_transition`

## Province codes

- `AB`, `ON`, `BC`, `FED`
