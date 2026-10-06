-- A versioned, explicitly unapproved starting course record. No commercial facts are invented.
INSERT INTO executive_ai.course_versions(content,approved,created_by)
SELECT jsonb_build_object(
  'legalEntity','', 'providerAddress','', 'buildAllowance','', 'terms','',
  'trainingCostCAD',NULL, 'buildCostCAD',NULL, 'softwareAndIntegrations','',
  'curriculum','Ten weekly 60-minute working sessions: define the process and baseline; choose approved tools; build and test; evaluate outputs and safeguards; document operation; complete an employer acceptance review.',
  'assessment','A working demonstration, baseline/result comparison, documented operating instructions and limitations, and employer acceptance review.',
  'providerEligibility','unresolved', 'courseEligibility','unresolved', 'eligibilityEvidence',''
),false,'system:initial-practicum-draft'
WHERE NOT EXISTS(SELECT 1 FROM executive_ai.course_versions);
