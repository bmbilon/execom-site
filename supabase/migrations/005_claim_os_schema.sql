-- ============================================================================
-- Migration 005: Claim OS Schema Extensions
-- ADDITIVE migration extending 003_sred_claim_os.sql
-- Does NOT drop or recreate anything from migrations 001–004.
-- ============================================================================
--
-- ── Compatibility Reference ─────────────────────────────────────────────────
--
-- Tables from 001_sred_portal.sql:
--   companies, profiles, claim_years, files, projects, evidence, costs,
--   claim_outputs, reviews, review_comments, audit_log
--
-- Tables from 003_sred_claim_os.sql:
--   claim_contacts, project_narrative_sections, project_people,
--   project_evidence_links, cost_imports, cost_line_items,
--   cost_project_splits, assistance_items, federal_claim_snapshots,
--   federal_line_values, federal_calculation_steps,
--   provincial_claim_snapshots, provincial_line_values,
--   provincial_project_breakdowns, review_issues, claim_snapshots,
--   export_bundles
--
-- RLS helpers from 001:
--   get_my_profile()
--   user_belongs_to_company(uuid)
--   is_execom_staff()
--
-- RLS helper from 003:
--   claim_year_company(uuid)
--
-- projects columns from 001:
--   id, claim_year_id, company_id (legacy), name, code, status, objective,
--   uncertainty, work_done, advancement, start_date, end_date, sort_order,
--   created_at, updated_at
--
-- projects columns added by 003:
--   field_code, continuation_flag, collaboration_flag, project_type
--
-- costs columns from 001:
--   id, project_id (legacy), claim_year_id, file_id, cost_type, description,
--   amount, hours, rate, employee_name, vendor_name, external_reference,
--   period_start, period_end, source, sort_order, created_at
--
-- ════════════════════════════════════════════════════════════════════════════


-- ────────────────────────────────────────────────────────────────────────────
-- 1. Add missing columns to existing tables
-- ────────────────────────────────────────────────────────────────────────────

-- claim_years: missing taxable_capital_eoy from 003
ALTER TABLE claim_years
  ADD COLUMN IF NOT EXISTS taxable_capital_eoy numeric(14,2);

-- claim_contacts: add preparer/CRA fields
ALTER TABLE claim_contacts
  ADD COLUMN IF NOT EXISTS preparer_ern text,
  ADD COLUMN IF NOT EXISTS billing_arrangement text
    CHECK (billing_arrangement IN ('contingency','fixed_fee','hourly','internal')),
  ADD COLUMN IF NOT EXISTS related_forms_required text[];

-- project_people: add specified employee fields
ALTER TABLE project_people
  ADD COLUMN IF NOT EXISTS specified_employee_flag boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS specified_employee_start_date date,
  ADD COLUMN IF NOT EXISTS specified_employee_end_date date;

-- project_evidence_links: make narrative_section_key NOT NULL with default
ALTER TABLE project_evidence_links
  ALTER COLUMN narrative_section_key SET DEFAULT 'general';
-- Backfill nulls
UPDATE project_evidence_links SET narrative_section_key = 'general' WHERE narrative_section_key IS NULL;
-- Now set NOT NULL (only if no nulls remain)
ALTER TABLE project_evidence_links
  ALTER COLUMN narrative_section_key SET NOT NULL;

-- review_issues: add target_field column (missing from 003)
ALTER TABLE review_issues
  ADD COLUMN IF NOT EXISTS target_field text;


-- ────────────────────────────────────────────────────────────────────────────
-- 2. Create review_rules table
-- ────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS review_rules (
  rule_key      text NOT NULL UNIQUE,
  layer         text NOT NULL CHECK (layer IN ('form','eligibility','calculation')),
  severity      text NOT NULL CHECK (severity IN ('blocker','warning','info')),
  source_area   text NOT NULL,
  message_template text NOT NULL,
  enabled       boolean DEFAULT true,
  created_at    timestamptz DEFAULT now()
);

ALTER TABLE review_rules ENABLE ROW LEVEL SECURITY;

-- review_rules: readable by all authenticated users, writable by execom staff
CREATE POLICY "review_rules_read" ON review_rules
  FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "review_rules_write" ON review_rules
  FOR ALL USING (is_execom_staff());


-- ────────────────────────────────────────────────────────────────────────────
-- 3. Create cost_line_classifications table
-- ────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS cost_line_classifications (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cost_line_item_id uuid NOT NULL REFERENCES cost_line_items(id) ON DELETE CASCADE,
  likely_category   text NOT NULL CHECK (likely_category IN (
    'salary_wages','specified_employee','arms_length_contractor',
    'non_arms_length_contractor','third_party_payment','materials_consumed',
    'materials_transformed','overhead','capital_property','proxy_interaction',
    'assistance_reimbursement','excluded'
  )),
  confidence_score  numeric(3,2),
  related_party_flag boolean DEFAULT false,
  excluded_flag     boolean DEFAULT false,
  rationale         text,
  classified_by     text DEFAULT 'manual' CHECK (classified_by IN ('manual','ai','rule')),
  created_at        timestamptz DEFAULT now(),
  UNIQUE (cost_line_item_id)
);

ALTER TABLE cost_line_classifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "cost_line_classifications_access" ON cost_line_classifications
  FOR ALL USING (
    user_belongs_to_company(
      claim_year_company(
        (SELECT claim_year_id FROM cost_line_items WHERE id = cost_line_item_id)
      )
    ) OR is_execom_staff()
  );

CREATE INDEX IF NOT EXISTS idx_cost_line_classifications_item ON cost_line_classifications(cost_line_item_id);


-- ────────────────────────────────────────────────────────────────────────────
-- 4. Create cost_line_project_splits table
-- ────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS cost_line_project_splits (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cost_line_item_id uuid NOT NULL REFERENCES cost_line_items(id) ON DELETE CASCADE,
  project_id        uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  allocation_percent numeric(5,2) NOT NULL,
  allocation_amount  numeric(12,2) NOT NULL,
  province_code     text DEFAULT 'AB',
  province_percent  numeric(5,2) DEFAULT 100,
  review_status     text DEFAULT 'pending' CHECK (review_status IN ('pending','confirmed','excluded','flagged')),
  created_at        timestamptz DEFAULT now(),
  UNIQUE (cost_line_item_id, project_id)
);

ALTER TABLE cost_line_project_splits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "cost_line_project_splits_access" ON cost_line_project_splits
  FOR ALL USING (
    user_belongs_to_company(
      claim_year_company(
        (SELECT claim_year_id FROM cost_line_items WHERE id = cost_line_item_id)
      )
    ) OR is_execom_staff()
  );

CREATE INDEX IF NOT EXISTS idx_cost_line_splits_item ON cost_line_project_splits(cost_line_item_id);
CREATE INDEX IF NOT EXISTS idx_cost_line_splits_project ON cost_line_project_splits(project_id);


-- ────────────────────────────────────────────────────────────────────────────
-- 5. Add FK from review_issues to review_rules
-- ────────────────────────────────────────────────────────────────────────────

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'review_issues_rule_key_fk' AND table_name = 'review_issues'
  ) THEN
    ALTER TABLE review_issues
      ADD CONSTRAINT review_issues_rule_key_fk
      FOREIGN KEY (rule_key) REFERENCES review_rules(rule_key);
  END IF;
END $$;


-- ────────────────────────────────────────────────────────────────────────────
-- 6. Seed review_rules
-- ────────────────────────────────────────────────────────────────────────────

INSERT INTO review_rules (rule_key, layer, severity, source_area, message_template) VALUES
  ('FORM.CLAIM.NO_PROJECTS',                     'form',          'blocker', 't661_part1',        'Claim must have at least one project'),
  ('FORM.CLAIM.NO_CONTACTS',                     'form',          'blocker', 't661_part1',        'Claimant and preparer contact information required'),
  ('FORM.CLAIM.NO_METHOD',                       'form',          'blocker', 't661_part1',        'Method election (proxy or traditional) must be selected'),
  ('FORM.CLAIM.NO_TAX_YEAR',                     'form',          'blocker', 't661_part1',        'Tax year start and end dates required'),
  ('FORM.CLAIM.NO_BN',                           'form',          'blocker', 't661_part1',        'Business number is required for filing'),
  ('FORM.PROJECT.NO_NARRATIVES',                 'form',          'blocker', 't661_part2',        'Project must have approved narratives for uncertainty, investigation, and advancement'),
  ('FORM.PROJECT.MISSING_FIELD_CODE',            'form',          'warning', 't661_part2',        'Field of science/technology code should be assigned'),
  ('FORM.PROJECT.MISSING_DATES',                 'form',          'warning', 't661_part2',        'Project start and completion dates should be set'),
  ('ELIG.NARRATIVE.COMMERCIAL_LANGUAGE',         'eligibility',   'warning', 'project_narrative', 'Technical uncertainty section contains commercial language'),
  ('ELIG.NARRATIVE.NO_EXPERIMENTS',              'eligibility',   'warning', 'project_narrative', 'Systematic investigation lacks experimental chronology'),
  ('ELIG.NARRATIVE.NO_EVIDENCE',                 'eligibility',   'warning', 'project_narrative', 'Narrative section has no evidence links'),
  ('ELIG.COST.NO_PROJECT',                       'eligibility',   'warning', 'cost_allocation',   'Cost line is not assigned to any project'),
  ('ELIG.COST.RELATED_PARTY',                    'eligibility',   'warning', 'cost_allocation',   'Related party cost requires treatment documentation'),
  ('ELIG.COST.LARGE_CONTRACTOR',                 'eligibility',   'info',    'cost_allocation',   'Contractor payment exceeds $30,000 — ensure listed on T661'),
  ('CALC.FED.PROJECT_SUM',                       'calculation',   'blocker', 'federal_calc',      'Project cost totals do not match claim total'),
  ('CALC.FED.PPA_MISMATCH',                      'calculation',   'blocker', 'federal_calc',      'Prescribed proxy amount does not match configured proxy rate applied to qualifying salaries'),
  ('CALC.FED.NEGATIVE_QE',                       'calculation',   'blocker', 'federal_calc',      'Qualified expenditures are negative — check reductions'),
  ('CALC.FED.METHOD_INCONSISTENCY',              'calculation',   'blocker', 'federal_calc',      'Method election conflicts with expenditure structure'),
  ('CALC.PROV.AB_RECONCILE',                     'calculation',   'warning', 'provincial_calc',   'Alberta expenditures exceed federal total'),
  ('CALC.PROV.AB_SPLIT_COMPLETE',                'calculation',   'blocker', 'provincial_calc',   'Project has costs but no Alberta expenditure breakdown'),
  ('ELIG.PROJECT.CONTINUATION_NO_DIFFERENTIATION','eligibility',  'warning', 'project_narrative', 'Multi-year continuation project must differentiate current-year work from prior years'),
  ('FORM.COST.SALARY_180_DAYS',                  'form',          'blocker', 'cost_allocation',   'Salary/wages paid more than 180 days after tax year end are not deductible SR&ED expenditures'),
  ('ELIG.COST.SPECIFIED_EMPLOYEE_CAP',           'eligibility',   'warning', 'cost_allocation',   'Specified employee salary exceeds form-year cap — excess is not eligible'),
  ('ELIG.COST.ASSOCIATED_CORP_T1174',            'eligibility',   'blocker', 'cost_allocation',   'Associated corporation with specified employees requires Form T1174 allocation agreement'),
  ('FORM.CLAIM.DEADLINE_WARNING',                'form',          'warning', 't661_part1',        'T661 filing deadline is within 90 days — claim has not been exported'),
  ('FORM.CLAIM.DEADLINE_CRITICAL',               'form',          'blocker', 't661_part1',        'T661 filing deadline is within 30 days — claim has not been exported'),
  ('ELIG.NARRATIVE.ADVANCEMENT_MISSING',         'eligibility',   'warning', 'project_narrative', 'Line 246 advancement does not appear to connect back to Line 242 uncertainty'),
  ('FORM.NARRATIVE.WORD_LIMIT_EXCEEDED',         'form',          'warning', 'project_narrative', 'Narrative section exceeds CRA word limit'),
  ('ELIG.NARRATIVE.LOW_EVIDENCE_COVERAGE',       'eligibility',   'warning', 'project_narrative', 'Narrative section evidence_coverage_score is below 0.5 — weak substantiation for CRA review'),
  ('FORM.CLAIM.NO_PREPARER_ERN',                 'form',          'warning', 't661_part1',        'Claim preparer contact is missing Electronic Registration Number (ERN)')
ON CONFLICT (rule_key) DO NOTHING;
