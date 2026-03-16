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

-- assistance_items: add unique constraint for upsert in three-pass orchestration
-- Without this, each recalculation inserts duplicate provincial assistance rows
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'assistance_items_claim_source_unique'
  ) THEN
    ALTER TABLE assistance_items
      ADD CONSTRAINT assistance_items_claim_source_unique
      UNIQUE (claim_year_id, source_name);
  END IF;
END $$;

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

  -- ── British Columbia (BC) ─────────────────────────────────────────────────
  ('FORM.PROV.BC.NO_FORM_T666',              'form',          'blocker', 'provincial_calc', 'BC credit requires Form T666 to be generated and included in the export bundle', '{"province_code":"BC"}'::jsonb),
  ('FORM.PROV.BC.NO_BC_EXPENDITURES',        'form',          'blocker', 'provincial_calc', 'BC credit requires at least one cost line split with province_code = ''BC''', '{"province_code":"BC"}'::jsonb),
  ('CALC.PROV.BC.EXPENDITURE_LIMIT_SHARED',  'calculation',   'warning', 'provincial_calc', 'Associated corporations must share the BC expenditure limit — verify Form T2SCH9 associated group allocation', '{"province_code":"BC"}'::jsonb),
  ('CALC.PROV.BC.REFUNDABLE_EXCEEDS_LIMIT',  'calculation',   'blocker', 'provincial_calc', 'Refundable BC credit claimed on expenditures exceeding the expenditure limit — verify CCPC status and limit', '{"province_code":"BC"}'::jsonb),
  ('CALC.PROV.BC.ASSISTANCE_NOT_DEDUCTED',   'calculation',   'blocker', 'provincial_calc', 'BC qualified expenditures must be reduced by government/non-government assistance related to BC SR&ED', '{"province_code":"BC"}'::jsonb),
  ('FORM.PROV.BC.FEDERAL_BASE_REQUIRED',     'form',          'blocker', 'provincial_calc', 'Federal T661 must be filed to establish the BC qualified expenditure base', '{"province_code":"BC"}'::jsonb),
  ('ELIG.PROV.BC.RECAPTURE_CHECK',           'eligibility',   'warning', 'provincial_calc', 'BC SR&ED property disposed of or converted to commercial use may require recapture — verify T666 Part 2', '{"province_code":"BC"}'::jsonb),
  ('ELIG.PROV.BC.NON_CCPC_NONREFUNDABLE',    'eligibility',   'info',    'provincial_calc', 'Non-CCPC claimant: BC SR&ED credit is non-refundable only — can only reduce BC taxes payable, excess carried 3 back / 10 forward', '{"province_code":"BC"}'::jsonb),
  ('ELIG.PROV.BC.CAPITAL_POST_DEC2024',      'eligibility',   'info',    'provincial_calc', 'Capital expenditures on property acquired after December 15, 2024 may now be included in BC qualified expenditure base', '{"province_code":"BC"}'::jsonb),

  -- ── Saskatchewan (SK) ─────────────────────────────────────────────────────
  ('FORM.PROV.SK.NO_FORM_403',               'form',          'blocker', 'provincial_calc', 'SK credit requires T2SCH403 in the export bundle', '{"province_code":"SK"}'::jsonb),
  ('FORM.PROV.SK.NO_SK_EXPENDITURES',        'form',          'blocker', 'provincial_calc', 'SK credit requires at least one cost line split with province_code = ''SK''', '{"province_code":"SK"}'::jsonb),
  ('CALC.PROV.SK.REFUNDABLE_OVER_LIMIT',     'calculation',   'blocker', 'provincial_calc', 'SK refundable credit capped at $1M of eligible expenditures for CCPCs — excess is non-refundable', '{"province_code":"SK"}'::jsonb),
  ('CALC.PROV.SK.TOTAL_EXCEEDS_10M',         'calculation',   'blocker', 'provincial_calc', 'SK eligible expenditures exceed $10M annual ceiling — excess is not eligible for any SK credit', '{"province_code":"SK"}'::jsonb),
  ('ELIG.PROV.SK.NON_CCPC_NONREFUNDABLE',    'eligibility',   'info',    'provincial_calc', 'Non-CCPC: SK credit is non-refundable only — can reduce SK taxes payable, carry 3 back / 10 forward', '{"province_code":"SK"}'::jsonb),
  ('ELIG.PROV.SK.RENUNCIATION_WINDOW',       'eligibility',   'warning', 'provincial_calc', 'SK non-refundable credit may be renounced to preserve federal QE — renunciation must occur before T2 filing (6-month deadline)', '{"province_code":"SK"}'::jsonb),
  ('CALC.PROV.SK.LIMIT_RATIO_CHECK',         'calculation',   'info',    'provincial_calc', 'SK refundable limit = 1/3 of federal expenditure limit — verify limit is consistent with current federal limit', '{"province_code":"SK"}'::jsonb),
  ('FORM.PROV.SK.FEDERAL_BASE_REQUIRED',     'form',          'blocker', 'provincial_calc', 'Federal T661 must be filed to establish SK eligible expenditure base', '{"province_code":"SK"}'::jsonb),

  -- ── Manitoba (MB) ─────────────────────────────────────────────────────────
  ('FORM.PROV.MB.NO_FORM_380',               'form',          'blocker', 'provincial_calc', 'MB credit requires T2SCH380 in the export bundle', '{"province_code":"MB"}'::jsonb),
  ('FORM.PROV.MB.NO_MB_EXPENDITURES',        'form',          'blocker', 'provincial_calc', 'MB credit requires at least one cost line split with province_code = ''MB''', '{"province_code":"MB"}'::jsonb),
  ('ELIG.PROV.MB.RENUNCIATION_DEADLINE_WARNING','eligibility', 'warning', 'provincial_calc', 'MB non-refundable credit renunciation must occur before the T2 filing deadline (6 months from year-end) — failure increases government assistance and reduces federal QE', '{"province_code":"MB"}'::jsonb),
  ('FORM.PROV.MB.REFUNDABILITY_FLAG_MISSING', 'form',          'warning', 'provincial_calc', 'MB credit: confirm whether SR&ED is performed under an eligible contract with a qualifying MB research institute (determines 50% vs 100% refundability)', '{"province_code":"MB"}'::jsonb),
  ('ELIG.PROV.MB.CAPITAL_BUILDING_EXCLUDED',  'eligibility',   'blocker', 'provincial_calc', 'Buildings and leasehold interests in buildings are not eligible capital expenditures for the MB credit — remove from MB eligible base', '{"province_code":"MB"}'::jsonb),
  ('ELIG.PROV.MB.CARRYFORWARD_20YR',         'eligibility',   'info',    'provincial_calc', 'MB non-refundable credit carries forward 20 years (longer than the 10-year federal carryforward)', '{"province_code":"MB"}'::jsonb),
  ('FORM.PROV.MB.FEDERAL_BASE_REQUIRED',     'form',          'blocker', 'provincial_calc', 'Federal T661 must be filed to establish MB eligible expenditure base', '{"province_code":"MB"}'::jsonb),
  ('ELIG.PROV.MB.QUALIFYING_INSTITUTE_LIST',  'eligibility',   'info',    'provincial_calc', 'Verify qualifying research institute is on the Manitoba Finance approved list before applying 100% refundability', '{"province_code":"MB"}'::jsonb),

  -- ── Ontario (ON) ──────────────────────────────────────────────────────────
  ('FORM.PROV.ON.OITC_NO_FORM_566',          'form',          'blocker', 'provincial_calc', 'Ontario OITC requires T2SCH566 in the export bundle', '{"province_code":"ON"}'::jsonb),
  ('FORM.PROV.ON.ORDTC_NO_FORM_508',         'form',          'blocker', 'provincial_calc', 'Ontario ORDTC requires T2SCH508 in the export bundle', '{"province_code":"ON"}'::jsonb),
  ('CALC.PROV.ON.OITC_PHASE_OUT_CHECK',      'calculation',   'warning', 'provincial_calc', 'Ontario OITC: verify specified capital amount (<=25M) and prior-year taxable income (<=500K) to confirm full expenditure limit applies', '{"province_code":"ON"}'::jsonb),
  ('CALC.PROV.ON.OITC_EXPENDITURE_LIMIT_SHARED','calculation', 'warning', 'provincial_calc', 'Associated corporations must share the OITC $3M expenditure limit — verify allocation', '{"province_code":"ON"}'::jsonb),
  ('FORM.PROV.ON.OBRITC_ERI_CONTRACT_REQUIRED','form',         'blocker', 'provincial_calc', 'OBRITC requires a completed T2SCH569 for each eligible contract with an Eligible Research Institute', '{"province_code":"ON"}'::jsonb),
  ('ELIG.PROV.ON.OBRITC_CASH_ONLY',          'eligibility',   'blocker', 'provincial_calc', 'OBRITC eligible expenditures must be cash payments — in-kind contributions are not eligible', '{"province_code":"ON"}'::jsonb),
  ('CALC.PROV.ON.OBRITC_CAP_EXCEEDED',       'calculation',   'blocker', 'provincial_calc', 'OBRITC annual eligible expenditure cap is $20M ($4M maximum credit) — reduce claimed amount', '{"province_code":"ON"}'::jsonb),
  ('CALC.PROV.ON.OBRITC_FEDERAL_ASSISTANCE_REDUCTION','calculation','warning','provincial_calc', 'OBRITC = government assistance — must reduce federal qualified SR&ED expenditure pool', '{"province_code":"ON"}'::jsonb),
  ('ELIG.PROV.ON.ORDTC_NON_REFUNDABLE_ONLY', 'eligibility',   'info',    'provincial_calc', 'ORDTC is non-refundable — it reduces Ontario corporate income tax payable only; excess carries 3 back / 20 forward', '{"province_code":"ON"}'::jsonb),
  ('FORM.PROV.ON.NO_ON_EXPENDITURES',        'form',          'blocker', 'provincial_calc', 'Ontario credit(s) require at least one cost line split with province_code = ''ON''', '{"province_code":"ON"}'::jsonb),

  -- ── Quebec (QC) ───────────────────────────────────────────────────────────
  ('FORM.PROV.QC.WRONG_REGIME_DATE',         'form',          'blocker', 'provincial_calc', 'QC CRIC applies to tax years beginning after March 25, 2025 — use prior-regime forms (RD-1029.7 etc.) for earlier tax years', '{"province_code":"QC"}'::jsonb),
  ('FORM.PROV.QC.NO_FORM_CRIC',             'form',          'blocker', 'provincial_calc', 'QC CRIC requires Form RD-1029.8.CR-T filed with Revenue Quebec CO-17 return', '{"province_code":"QC"}'::jsonb),
  ('FORM.PROV.QC.REVENUE_QUEBEC_NOT_CRA',   'form',          'blocker', 'provincial_calc', 'QC CRIC is administered by Revenue Quebec — do NOT file with CRA; submit with CO-17 provincial return', '{"province_code":"QC"}'::jsonb),
  ('CALC.PROV.QC.EXCLUSION_THRESHOLD_MISSING','calculation',   'blocker', 'provincial_calc', 'QC CRIC exclusion threshold requires per-employee R&D time fraction data — employee time tracking must be provided', '{"province_code":"QC"}'::jsonb),
  ('ELIG.PROV.QC.PRECOMM_WITHOUT_RD_LINK',  'eligibility',   'warning', 'provincial_calc', 'QC CRIC pre-commercialization activities must be a continuation of R&D carried out in Quebec — document the R&D-to-pre-commercialization link', '{"province_code":"QC"}'::jsonb),
  ('CALC.PROV.QC.ASSOCIATED_CORP_LIMIT',    'calculation',   'warning', 'provincial_calc', 'Associated corporations must share the $1M CRIC enhanced-rate expenditure limit — file RD-1029.8.EN', '{"province_code":"QC"}'::jsonb),
  ('ELIG.PROV.QC.CAPITAL_DOCUMENTATION',     'eligibility',   'warning', 'provincial_calc', 'QC CRIC capital equipment expenditures require documentation of R&D/pre-commercialization use percentage', '{"province_code":"QC"}'::jsonb),
  ('CALC.PROV.QC.ASSISTANCE_DEDUCTION',      'calculation',   'blocker', 'provincial_calc', 'QC CRIC qualified expenditures must be reduced by any government or non-government assistance before computing the credit', '{"province_code":"QC"}'::jsonb),
  ('FORM.PROV.QC.NO_QC_EXPENDITURES',       'form',          'blocker', 'provincial_calc', 'QC credit requires at least one cost line split with province_code = ''QC''', '{"province_code":"QC"}'::jsonb),
  ('ELIG.PROV.QC.FEDERAL_SCIENTIFIC_REVIEW', 'eligibility',   'info',    'provincial_calc', 'QC CRIC eligibility for R&D component relies on federal CRA scientific determination — ensure T661 Part 2 narratives are strong', '{"province_code":"QC"}'::jsonb),

  -- ── New Brunswick (NB) ────────────────────────────────────────────────────
  ('FORM.PROV.NB.NO_FORM_360',              'form',          'blocker', 'provincial_calc', 'NB credit requires T2SCH360 in the export bundle', '{"province_code":"NB"}'::jsonb),
  ('FORM.PROV.NB.NO_NB_EXPENDITURES',       'form',          'blocker', 'provincial_calc', 'NB credit requires at least one cost line split with province_code = ''NB''', '{"province_code":"NB"}'::jsonb),
  ('ELIG.PROV.NB.RECAPTURE_CHECK',          'eligibility',   'warning', 'provincial_calc', 'NB SR&ED property disposed of or converted to commercial use requires recapture calculation on T2SCH360', '{"province_code":"NB"}'::jsonb),
  ('FORM.PROV.NB.FEDERAL_BASE_REQUIRED',    'form',          'blocker', 'provincial_calc', 'Federal T661 must establish NB eligible expenditure base', '{"province_code":"NB"}'::jsonb),
  ('CALC.PROV.NB.ASSISTANCE_REDUCTION',     'calculation',   'warning', 'provincial_calc', 'NB qualified expenditures must be reduced by government/non-government assistance — verify assistance_items for NB projects', '{"province_code":"NB"}'::jsonb),

  -- ── Nova Scotia (NS) ──────────────────────────────────────────────────────
  ('FORM.PROV.NS.NO_FORM_340',              'form',          'blocker', 'provincial_calc', 'NS credit requires T2SCH340 in the export bundle', '{"province_code":"NS"}'::jsonb),
  ('FORM.PROV.NS.NO_NS_EXPENDITURES',       'form',          'blocker', 'provincial_calc', 'NS credit requires at least one cost line split with province_code = ''NS''', '{"province_code":"NS"}'::jsonb),
  ('ELIG.PROV.NS.RECAPTURE_CHECK',          'eligibility',   'warning', 'provincial_calc', 'NS SR&ED property disposed of or converted to commercial use requires recapture on T2SCH340', '{"province_code":"NS"}'::jsonb),
  ('FORM.PROV.NS.FEDERAL_BASE_REQUIRED',    'form',          'blocker', 'provincial_calc', 'Federal T661 required to establish NS eligible expenditure base', '{"province_code":"NS"}'::jsonb),
  ('ELIG.PROV.NS.RENUNCIATION_AVAILABLE',   'eligibility',   'info',    'provincial_calc', 'NS credit may be renounced under s.41(7) NS Income Tax Act — consider if non-refundable optimization is needed', '{"province_code":"NS"}'::jsonb),

  -- ── Newfoundland & Labrador (NL) ──────────────────────────────────────────
  ('FORM.PROV.NL.NO_FORM_301',              'form',          'blocker', 'provincial_calc', 'NL credit requires T2SCH301 in the export bundle (corporations)', '{"province_code":"NL"}'::jsonb),
  ('FORM.PROV.NL.NO_NL_EXPENDITURES',       'form',          'blocker', 'provincial_calc', 'NL credit requires at least one cost line split with province_code = ''NL''', '{"province_code":"NL"}'::jsonb),
  ('CALC.PROV.NL.ASSISTANCE_NOT_DEDUCTED_FROM_NL','calculation','info',  'provincial_calc', 'NL UNIQUE RULE: eligible expenditures are NOT reduced by government or non-government assistance for NL credit purposes (except GST/HST ITCs)', '{"province_code":"NL"}'::jsonb),
  ('CALC.PROV.NL.NL_CREDIT_IS_FEDERAL_ASSISTANCE','calculation','warning','provincial_calc', 'NL credit = government assistance for federal purposes — must reduce federal qualified SR&ED expenditure pool', '{"province_code":"NL"}'::jsonb),
  ('FORM.PROV.NL.FEDERAL_BASE_REQUIRED',    'form',          'blocker', 'provincial_calc', 'Federal T661 required to establish NL eligible expenditure base', '{"province_code":"NL"}'::jsonb),
  ('FORM.PROV.NL.INDIVIDUALS_USE_T1129',    'form',          'info',    'provincial_calc', 'Individuals, trust beneficiaries, and partners claiming NL credit use Form T1129, not T2SCH301', '{"province_code":"NL"}'::jsonb),

  -- ── Yukon (YT) ────────────────────────────────────────────────────────────
  ('FORM.PROV.YT.NO_FORM_442',              'form',          'blocker', 'provincial_calc', 'Yukon credit requires T2SCH442 in the export bundle', '{"province_code":"YT"}'::jsonb),
  ('FORM.PROV.YT.NO_YT_EXPENDITURES',       'form',          'blocker', 'provincial_calc', 'Yukon credit requires at least one cost line split with province_code = ''YT''', '{"province_code":"YT"}'::jsonb),
  ('ELIG.PROV.YT.YUKON_U_BONUS_FLAG',       'eligibility',   'info',    'provincial_calc', 'Payments to Yukon University qualify for an additional 5% credit — verify and flag YT University contract payments', '{"province_code":"YT"}'::jsonb),
  ('FORM.PROV.YT.FEDERAL_BASE_REQUIRED',    'form',          'blocker', 'provincial_calc', 'Federal T661 required to establish Yukon eligible expenditure base', '{"province_code":"YT"}'::jsonb),
  ('FORM.PROV.YT.YUKON_U_CONTRACT_MISSING', 'form',          'warning', 'provincial_calc', '5% Yukon University bonus claimed but no Yukon University contract recorded — attach contract documentation', '{"province_code":"YT"}'::jsonb),

  -- ── No-program jurisdictions ──────────────────────────────────────────────
  ('FORM.PROV.PE.NO_PROGRAM',               'form',          'info',    'provincial_calc', 'Prince Edward Island has no provincial SR&ED tax credit — federal SR&ED credit only applies', '{"province_code":"PE"}'::jsonb),
  ('FORM.PROV.NT.NO_PROGRAM',               'form',          'info',    'provincial_calc', 'Northwest Territories has no territorial SR&ED tax credit — federal SR&ED credit only applies', '{"province_code":"NT"}'::jsonb),
  ('FORM.PROV.NU.NO_PROGRAM',               'form',          'info',    'provincial_calc', 'Nunavut has no territorial SR&ED tax credit — federal SR&ED credit only applies', '{"province_code":"NU"}'::jsonb)

ON CONFLICT (rule_key) DO NOTHING;
