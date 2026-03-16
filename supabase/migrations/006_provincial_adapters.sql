-- ============================================================================
-- Migration 006: Provincial Adapter Support
-- ADDITIVE migration extending 005_claim_os_schema.sql
-- Does NOT drop or recreate anything from migrations 001–005.
-- ============================================================================
--
-- Adds columns, tables, indexes, and seed data needed for multi-province
-- adapter support (BC, ON, QC, SK, MB, NB, NS, NL, YT).
-- ============================================================================

-- ── 1. Add columns to existing tables ──────────────────────────────────────

-- companies
ALTER TABLE companies ADD COLUMN IF NOT EXISTS ccpc_flag boolean DEFAULT true;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS specified_capital_amount numeric(14,2);
ALTER TABLE companies ADD COLUMN IF NOT EXISTS prior_year_taxable_income_on numeric(14,2);
ALTER TABLE companies ADD COLUMN IF NOT EXISTS qc_establishment_flag boolean DEFAULT false;

-- claim_years
ALTER TABLE claim_years ADD COLUMN IF NOT EXISTS mb_renunciation_flag boolean DEFAULT false;
ALTER TABLE claim_years ADD COLUMN IF NOT EXISTS mb_renunciation_date date;
ALTER TABLE claim_years ADD COLUMN IF NOT EXISTS sk_renunciation_flag boolean DEFAULT false;

-- projects
ALTER TABLE projects ADD COLUMN IF NOT EXISTS mb_qualifying_institute_flag boolean DEFAULT false;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS qc_precomm_flag boolean DEFAULT false;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS on_eri_contract_flag boolean DEFAULT false;

-- provincial_project_breakdowns (province-neutral columns alongside legacy Alberta)
ALTER TABLE provincial_project_breakdowns ADD COLUMN IF NOT EXISTS provincial_expenditures numeric(14,2);
ALTER TABLE provincial_project_breakdowns ADD COLUMN IF NOT EXISTS non_province_share numeric(12,2);
ALTER TABLE provincial_project_breakdowns ADD COLUMN IF NOT EXISTS provincial_salaries numeric(14,2);
ALTER TABLE provincial_project_breakdowns ADD COLUMN IF NOT EXISTS federal_proxy_in_province numeric(14,2);
ALTER TABLE provincial_project_breakdowns ADD COLUMN IF NOT EXISTS provincial_proxy_amount numeric(14,2);

-- export_bundles
ALTER TABLE export_bundles ADD COLUMN IF NOT EXISTS province_code text;

-- review_rules (add metadata column for province_code filtering)
ALTER TABLE review_rules ADD COLUMN IF NOT EXISTS metadata jsonb;

-- ── 2. Update export_type CHECK constraint ─────────────────────────────────

ALTER TABLE export_bundles DROP CONSTRAINT IF EXISTS export_bundles_export_type_check;
ALTER TABLE export_bundles ADD CONSTRAINT export_bundles_export_type_check
  CHECK (export_type IN ('t661_package','schedule_31','alberta_package','provincial_package','narrative_pack','evidence_appendix','cost_support','reviewer_memo','full_bundle'));

-- ── 3. Create provincial_employee_time table ───────────────────────────────

CREATE TABLE IF NOT EXISTS provincial_employee_time (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  claim_year_id uuid NOT NULL REFERENCES claim_years(id) ON DELETE CASCADE,
  project_person_id uuid REFERENCES project_people(id) ON DELETE SET NULL,
  province_code text NOT NULL DEFAULT 'QC',
  rd_time_fraction numeric(5,4) NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE provincial_employee_time ENABLE ROW LEVEL SECURITY;
CREATE POLICY "provincial_employee_time_access" ON provincial_employee_time
  FOR ALL USING (
    user_belongs_to_company(claim_year_company(claim_year_id))
    OR is_execom_staff()
  );
CREATE INDEX IF NOT EXISTS idx_prov_employee_time_claim ON provincial_employee_time(claim_year_id);

-- ── 4. Create on_eri_contracts table ───────────────────────────────────────

CREATE TABLE IF NOT EXISTS on_eri_contracts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  claim_year_id uuid NOT NULL REFERENCES claim_years(id) ON DELETE CASCADE,
  eri_code text,
  eri_name text,
  contract_date date,
  payment_amount numeric(12,2),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE on_eri_contracts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "on_eri_contracts_access" ON on_eri_contracts
  FOR ALL USING (
    user_belongs_to_company(claim_year_company(claim_year_id))
    OR is_execom_staff()
  );
CREATE INDEX IF NOT EXISTS idx_on_eri_contracts_claim ON on_eri_contracts(claim_year_id);
CREATE INDEX IF NOT EXISTS idx_on_eri_contracts_project ON on_eri_contracts(project_id);

-- ── 5. Additional indexes ──────────────────────────────────────────────────

CREATE INDEX IF NOT EXISTS idx_provincial_project_breakdowns_province ON provincial_project_breakdowns(province_code);
CREATE INDEX IF NOT EXISTS idx_export_bundles_province ON export_bundles(province_code);

-- ── 6. Seed provincial review rules ───────────────────────────────────────

INSERT INTO review_rules (rule_key, layer, severity, source_area, message_template, metadata) VALUES
  ('FORM.PROV.BC.NO_EXPENDITURES', 'form', 'warning', 'provincial_calc', 'BC has cost splits but zero qualified expenditures', '{"province_code":"BC"}'),
  ('FORM.PROV.ON.NO_EXPENDITURES', 'form', 'warning', 'provincial_calc', 'Ontario has cost splits but zero qualified expenditures', '{"province_code":"ON"}'),
  ('FORM.PROV.QC.NO_EXPENDITURES', 'form', 'warning', 'provincial_calc', 'Quebec has cost splits but zero qualified expenditures', '{"province_code":"QC"}'),
  ('FORM.PROV.SK.NO_EXPENDITURES', 'form', 'warning', 'provincial_calc', 'Saskatchewan has cost splits but zero qualified expenditures', '{"province_code":"SK"}'),
  ('FORM.PROV.MB.NO_EXPENDITURES', 'form', 'warning', 'provincial_calc', 'Manitoba has cost splits but zero qualified expenditures', '{"province_code":"MB"}'),
  ('FORM.PROV.NB.NO_EXPENDITURES', 'form', 'warning', 'provincial_calc', 'New Brunswick has cost splits but zero qualified expenditures', '{"province_code":"NB"}'),
  ('FORM.PROV.NS.NO_EXPENDITURES', 'form', 'warning', 'provincial_calc', 'Nova Scotia has cost splits but zero qualified expenditures', '{"province_code":"NS"}'),
  ('FORM.PROV.NL.NO_EXPENDITURES', 'form', 'warning', 'provincial_calc', 'Newfoundland has cost splits but zero qualified expenditures', '{"province_code":"NL"}'),
  ('FORM.PROV.YT.NO_EXPENDITURES', 'form', 'warning', 'provincial_calc', 'Yukon has cost splits but zero qualified expenditures', '{"province_code":"YT"}'),
  ('FORM.PROV.BC.FEDERAL_BASE_REQUIRED', 'form', 'blocker', 'provincial_calc', 'Federal calculation must be run before BC provincial calculation', '{"province_code":"BC"}'),
  ('FORM.PROV.ON.FEDERAL_BASE_REQUIRED', 'form', 'blocker', 'provincial_calc', 'Federal calculation must be run before Ontario provincial calculation', '{"province_code":"ON"}'),
  ('FORM.PROV.QC.FEDERAL_BASE_REQUIRED', 'form', 'blocker', 'provincial_calc', 'Federal calculation must be run before Quebec provincial calculation', '{"province_code":"QC"}'),
  ('FORM.PROV.SK.FEDERAL_BASE_REQUIRED', 'form', 'blocker', 'provincial_calc', 'Federal calculation must be run before Saskatchewan provincial calculation', '{"province_code":"SK"}'),
  ('FORM.PROV.MB.FEDERAL_BASE_REQUIRED', 'form', 'blocker', 'provincial_calc', 'Federal calculation must be run before Manitoba provincial calculation', '{"province_code":"MB"}'),
  ('FORM.PROV.NB.FEDERAL_BASE_REQUIRED', 'form', 'blocker', 'provincial_calc', 'Federal calculation must be run before New Brunswick provincial calculation', '{"province_code":"NB"}'),
  ('FORM.PROV.NS.FEDERAL_BASE_REQUIRED', 'form', 'blocker', 'provincial_calc', 'Federal calculation must be run before Nova Scotia provincial calculation', '{"province_code":"NS"}'),
  ('FORM.PROV.NL.FEDERAL_BASE_REQUIRED', 'form', 'blocker', 'provincial_calc', 'Federal calculation must be run before Newfoundland provincial calculation', '{"province_code":"NL"}'),
  ('FORM.PROV.YT.FEDERAL_BASE_REQUIRED', 'form', 'blocker', 'provincial_calc', 'Federal calculation must be run before Yukon provincial calculation', '{"province_code":"YT"}'),
  ('FORM.PROV.QC.WRONG_REGIME_DATE', 'form', 'warning', 'provincial_calc', 'Quebec CRIC regime applies to taxation years beginning after March 25, 2025', '{"province_code":"QC"}'),
  ('CALC.PROV.ON.OITC_PHASE_OUT', 'calculation', 'warning', 'provincial_calc', 'Ontario OITC phase-out may apply based on specified capital or prior year taxable income', '{"province_code":"ON"}'),
  ('ELIG.PROV.MB.RENUNCIATION_DEADLINE', 'eligibility', 'warning', 'provincial_calc', 'Manitoba renunciation 6-month window check', '{"province_code":"MB"}'),
  ('CALC.PROV.QC.EXCLUSION_THRESHOLD_MISSING', 'calculation', 'warning', 'provincial_calc', 'Quebec claim has no provincial_employee_time rows for exclusion threshold', '{"province_code":"QC"}'),
  ('CALC.PROV.SK.TOTAL_EXCEEDS_10M', 'calculation', 'warning', 'provincial_calc', 'Saskatchewan expenditures exceed $10M ceiling', '{"province_code":"SK"}'),
  ('CALC.PROV.NL.ASSISTANCE_NOT_REDUCED', 'calculation', 'info', 'provincial_calc', 'NL eligible expenditures are not reduced by assistance (except GST/HST ITCs)', '{"province_code":"NL"}')
ON CONFLICT (rule_key) DO NOTHING;
