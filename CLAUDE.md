# Project Rules — execom-site

## Git and working directory

- **The git repo root is `dashboard-refactor/`.** All git commands, file paths, and working directory references must use this as the base.
- When giving the user shell commands to run locally, **always** prefix with:
  ```
  cd ~/Desktop/execom/execom-site && ...
  ```
  Never assume the user is already in the right directory. Every command block starts with this `cd`.
- The remote is `origin` → `https://github.com/bmbilon/execom-site.git`
- Active branch: `feat/calculator-supabase-engine`

## Brand rules

- "execom" is always **lowercase** in visible UI copy. Never "Execom" or "EXECOM" in user-facing text.

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
