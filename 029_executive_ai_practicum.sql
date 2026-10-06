-- Private, server-only admissions storage. No Data API or browser grants.
-- Preview runner substitutes the schema name with executive_ai_preview.
CREATE SCHEMA IF NOT EXISTS executive_ai;
REVOKE ALL ON SCHEMA executive_ai FROM PUBLIC;

CREATE TABLE IF NOT EXISTS executive_ai.cohorts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL, location text NOT NULL,
  starts_at timestamptz, ends_at timestamptz, deadline timestamptz,
  capacity integer NOT NULL CHECK (capacity BETWEEN 1 AND 6),
  state text NOT NULL DEFAULT 'draft' CHECK (state IN ('draft','open','closed','completed','cancelled')),
  schedule text NOT NULL DEFAULT '', instructional_hours numeric,
  version integer NOT NULL DEFAULT 1,
  created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(),
  CHECK (ends_at > starts_at), CHECK (deadline <= starts_at),
  CHECK (state <> 'open' OR (starts_at IS NOT NULL AND ends_at IS NOT NULL AND deadline IS NOT NULL AND instructional_hours > 0 AND length(schedule) >= 10))
);
CREATE TABLE IF NOT EXISTS executive_ai.applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reference text NOT NULL UNIQUE,
  request_id uuid NOT NULL UNIQUE, request_hash text NOT NULL,
  kind text NOT NULL CHECK (kind IN ('executive','employer')),
  owner_id uuid NOT NULL REFERENCES public.profiles(id),
  name text NOT NULL, email text NOT NULL, employer text NOT NULL,
  intake jsonb NOT NULL,
  status text NOT NULL DEFAULT 'submitted' CHECK (status IN ('submitted','reviewing','needs_information','qualified','awaiting_sponsor','waitlisted','offered','accepted','enrolled','declined','withdrawn')),
  cohort_id uuid REFERENCES executive_ai.cohorts(id),
  sponsor_verified boolean NOT NULL DEFAULT false,
  data_approval text NOT NULL CHECK (data_approval IN ('approved','pending','not_started')),
  sponsor_token_hash text NOT NULL UNIQUE,
  sponsor_expires_at timestamptz NOT NULL,
  sponsor_response jsonb,
  sponsor_brief jsonb, sponsor_shared_at timestamptz,
  consent_version text NOT NULL, consent_at timestamptz NOT NULL DEFAULT now(),
  version integer NOT NULL DEFAULT 1,
  created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(),
  CHECK (status NOT IN ('accepted','enrolled') OR (kind='executive' AND cohort_id IS NOT NULL AND sponsor_verified AND data_approval='approved'))
);
CREATE INDEX IF NOT EXISTS applications_queue ON executive_ai.applications(status, created_at DESC);
CREATE INDEX IF NOT EXISTS applications_cohort ON executive_ai.applications(cohort_id, status);
CREATE TABLE IF NOT EXISTS executive_ai.audit (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  application_id uuid REFERENCES executive_ai.applications(id),
  cohort_id uuid REFERENCES executive_ai.cohorts(id),
  actor_id text NOT NULL, action text NOT NULL,
  detail jsonb NOT NULL DEFAULT '{}', created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS executive_ai.rate_limits (
  key text PRIMARY KEY, count integer NOT NULL DEFAULT 1, expires_at timestamptz NOT NULL
);
REVOKE ALL ON ALL TABLES IN SCHEMA executive_ai FROM PUBLIC;

CREATE TABLE IF NOT EXISTS executive_ai.settings (
  id boolean PRIMARY KEY DEFAULT true CHECK(id), max_active_cohorts integer NOT NULL DEFAULT 1 CHECK(max_active_cohorts BETWEEN 1 AND 5)
);
CREATE TABLE IF NOT EXISTS executive_ai.prospects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), source_key text NOT NULL UNIQUE,
  record_type text NOT NULL CHECK(record_type IN ('employer','channel')),
  name text NOT NULL, region text NOT NULL DEFAULT '',
  contact_name text NOT NULL DEFAULT '', contact_role text NOT NULL DEFAULT '',
  contact_route text NOT NULL DEFAULT '', source_url text NOT NULL,
  process_hypothesis text NOT NULL DEFAULT '', evidence jsonb NOT NULL DEFAULT '[]',
  research_notes text NOT NULL DEFAULT '', introduction_notes text NOT NULL DEFAULT '',
  stage text NOT NULL DEFAULT 'researched' CHECK(stage IN ('researched','introduction_mapped','conversation','not_fit')),
  marketing_consent text NOT NULL DEFAULT 'none' CHECK(marketing_consent='none'),
  imported_by uuid NOT NULL, imported_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE executive_ai.prospects ENABLE ROW LEVEL SECURITY;
INSERT INTO executive_ai.settings(id) VALUES(true) ON CONFLICT DO NOTHING;
CREATE TABLE IF NOT EXISTS executive_ai.course_versions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), version integer GENERATED ALWAYS AS IDENTITY UNIQUE,
  content jsonb NOT NULL, approved boolean NOT NULL DEFAULT false,
  created_by text NOT NULL, created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS executive_ai.offers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), application_id uuid NOT NULL REFERENCES executive_ai.applications(id),
  course_version_id uuid NOT NULL REFERENCES executive_ai.course_versions(id),
  snapshot jsonb NOT NULL, expires_at timestamptz NOT NULL,
  state text NOT NULL DEFAULT 'issued' CHECK(state IN ('issued','accepted','declined','superseded')),
  accepted_at timestamptz, accepted_by uuid, created_by text NOT NULL, created_at timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS offer_active ON executive_ai.offers(application_id) WHERE state='issued';
CREATE TABLE IF NOT EXISTS executive_ai.messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), application_id uuid NOT NULL REFERENCES executive_ai.applications(id),
  actor_id uuid NOT NULL, from_staff boolean NOT NULL, body text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS executive_ai.grant_cases (
  application_id uuid PRIMARY KEY REFERENCES executive_ai.applications(id),
  status text NOT NULL DEFAULT 'preparing' CHECK(status IN ('preparing','employer_reported_submitted','employer_reported_approved','employer_reported_declined','staff_evidence_reviewed')),
  evidence_reference text, notes text, reported_by uuid NOT NULL, updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS executive_ai.grant_packages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), application_id uuid NOT NULL REFERENCES executive_ai.applications(id),
  course_version_id uuid REFERENCES executive_ai.course_versions(id),
  snapshot jsonb NOT NULL, created_by uuid NOT NULL, created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE executive_ai.settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE executive_ai.course_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE executive_ai.offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE executive_ai.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE executive_ai.grant_cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE executive_ai.grant_packages ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON ALL TABLES IN SCHEMA executive_ai FROM PUBLIC;
REVOKE ALL ON ALL SEQUENCES IN SCHEMA executive_ai FROM PUBLIC;
ALTER TABLE executive_ai.applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE executive_ai.cohorts ENABLE ROW LEVEL SECURITY;
ALTER TABLE executive_ai.audit ENABLE ROW LEVEL SECURITY;
ALTER TABLE executive_ai.rate_limits ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS executive_ai.drafts (
  id uuid PRIMARY KEY,
  owner_id uuid NOT NULL REFERENCES public.profiles(id),
  kind text NOT NULL CHECK (kind IN ('executive','employer')),
  answers jsonb NOT NULL DEFAULT '{}',
  application_id uuid REFERENCES executive_ai.applications(id),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS drafts_owner ON executive_ai.drafts(owner_id,updated_at DESC);
CREATE TABLE IF NOT EXISTS executive_ai.nominations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  employer_application_id uuid NOT NULL REFERENCES executive_ai.applications(id),
  name text NOT NULL, email text NOT NULL,
  token_hash text NOT NULL UNIQUE, expires_at timestamptz NOT NULL,
  claimed_by uuid REFERENCES public.profiles(id),
  draft_id uuid,
  application_id uuid REFERENCES executive_ai.applications(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(employer_application_id,email)
);
ALTER TABLE executive_ai.drafts ENABLE ROW LEVEL SECURITY;
ALTER TABLE executive_ai.nominations ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON ALL TABLES IN SCHEMA executive_ai FROM PUBLIC;
