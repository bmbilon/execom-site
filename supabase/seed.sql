-- ============================================================
-- SEED DATA: execom SR&ED Portal
-- Run AFTER migration. Creates test users via Supabase auth,
-- then populates every table with realistic sample data.
-- ============================================================

-- ============================================================
-- 1. COMPANIES
-- ============================================================

insert into companies (id, name, legal_name, bn, fiscal_ye_month, industry, address) values
  ('a1000000-0000-0000-0000-000000000001', 'Northforge Labs', 'Northforge Labs Inc.', '123456789RC0001', 12, 'Machine Learning / Computer Vision', '{"street":"220 4th Ave SW","city":"Calgary","province":"AB","postal":"T2P 0H5"}'),
  ('a2000000-0000-0000-0000-000000000002', 'Vectis Biotech', 'Vectis Biotechnology Corp.', '987654321RC0001', 3, 'Biotechnology', '{"street":"3655 36 St NW","city":"Calgary","province":"AB","postal":"T2L 1Y8"}'),
  ('a3000000-0000-0000-0000-000000000003', 'Riverbend Aerospace', 'Riverbend Aerospace Ltd.', '555666777RC0001', 6, 'Aerospace / Advanced Materials', '{"street":"2500 University Dr NW","city":"Calgary","province":"AB","postal":"T2N 1N4"}');

-- ============================================================
-- 2. AUTH USERS + PROFILES
-- ============================================================
-- We create auth.users entries directly so profiles can reference them.
-- Passwords are all: TestPass123!
-- The password hash below is bcrypt for "TestPass123!"

-- Northforge Labs team
insert into auth.users (id, instance_id, email, encrypted_password, email_confirmed_at, role, aud, created_at, updated_at, confirmation_token, recovery_token)
values
  ('b1000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000000', 'founder@northforge.dev', '$2a$10$PwG5y3SE0M7S9wE1V8T5N.TkG5y3SE0M7S9wE1V8T5NuTkG5y3SE0', now(), 'authenticated', 'authenticated', now(), now(), '', ''),
  ('b1000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000000', 'cto@northforge.dev', '$2a$10$PwG5y3SE0M7S9wE1V8T5N.TkG5y3SE0M7S9wE1V8T5NuTkG5y3SE0', now(), 'authenticated', 'authenticated', now(), now(), '', ''),
  ('b1000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000000', 'finance@northforge.dev', '$2a$10$PwG5y3SE0M7S9wE1V8T5N.TkG5y3SE0M7S9wE1V8T5NuTkG5y3SE0', now(), 'authenticated', 'authenticated', now(), now(), '', ''),
  ('b1000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000000', 'intern@northforge.dev', '$2a$10$PwG5y3SE0M7S9wE1V8T5N.TkG5y3SE0M7S9wE1V8T5NuTkG5y3SE0', now(), 'authenticated', 'authenticated', now(), now(), '', '');

-- Vectis Biotech team
insert into auth.users (id, instance_id, email, encrypted_password, email_confirmed_at, role, aud, created_at, updated_at, confirmation_token, recovery_token)
values
  ('b2000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000000', 'ceo@vectisbio.ca', '$2a$10$PwG5y3SE0M7S9wE1V8T5N.TkG5y3SE0M7S9wE1V8T5NuTkG5y3SE0', now(), 'authenticated', 'authenticated', now(), now(), '', ''),
  ('b2000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000000', 'lab@vectisbio.ca', '$2a$10$PwG5y3SE0M7S9wE1V8T5N.TkG5y3SE0M7S9wE1V8T5NuTkG5y3SE0', now(), 'authenticated', 'authenticated', now(), now(), '', '');

-- Riverbend Aerospace
insert into auth.users (id, instance_id, email, encrypted_password, email_confirmed_at, role, aud, created_at, updated_at, confirmation_token, recovery_token)
values
  ('b3000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000000', 'ops@riverbendaero.com', '$2a$10$PwG5y3SE0M7S9wE1V8T5N.TkG5y3SE0M7S9wE1V8T5NuTkG5y3SE0', now(), 'authenticated', 'authenticated', now(), now(), '', '');

-- execom staff (reviewer + admin)
insert into auth.users (id, instance_id, email, encrypted_password, email_confirmed_at, role, aud, created_at, updated_at, confirmation_token, recovery_token)
values
  ('b9000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000000', 'brett@execom.ca', '$2a$10$PwG5y3SE0M7S9wE1V8T5N.TkG5y3SE0M7S9wE1V8T5NuTkG5y3SE0', now(), 'authenticated', 'authenticated', now(), now(), '', ''),
  ('b9000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000000', 'reviewer@execom.ca', '$2a$10$PwG5y3SE0M7S9wE1V8T5N.TkG5y3SE0M7S9wE1V8T5NuTkG5y3SE0', now(), 'authenticated', 'authenticated', now(), now(), '', '');

-- Profiles
insert into profiles (id, company_id, email, full_name, role, is_execom_staff) values
  -- Northforge (all 4 roles)
  ('b1000000-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000001', 'founder@northforge.dev', 'Maya Chen', 'owner', false),
  ('b1000000-0000-0000-0000-000000000002', 'a1000000-0000-0000-0000-000000000001', 'cto@northforge.dev', 'James Okafor', 'admin', false),
  ('b1000000-0000-0000-0000-000000000003', 'a1000000-0000-0000-0000-000000000001', 'finance@northforge.dev', 'Sarah Park', 'contributor', false),
  ('b1000000-0000-0000-0000-000000000004', 'a1000000-0000-0000-0000-000000000001', 'intern@northforge.dev', 'Alex Rivera', 'viewer', false),
  -- Vectis
  ('b2000000-0000-0000-0000-000000000001', 'a2000000-0000-0000-0000-000000000002', 'ceo@vectisbio.ca', 'Dr. Priya Sharma', 'owner', false),
  ('b2000000-0000-0000-0000-000000000002', 'a2000000-0000-0000-0000-000000000002', 'lab@vectisbio.ca', 'Tom Nguyen', 'contributor', false),
  -- Riverbend
  ('b3000000-0000-0000-0000-000000000001', 'a3000000-0000-0000-0000-000000000003', 'ops@riverbendaero.com', 'Rachel Whitehorse', 'owner', false),
  -- execom staff
  ('b9000000-0000-0000-0000-000000000001', null, 'brett@execom.ca', 'Brett Bilon', 'admin', true),
  ('b9000000-0000-0000-0000-000000000002', null, 'reviewer@execom.ca', 'Kate Morrison', 'admin', true);

-- ============================================================
-- 3. CLAIM YEARS (one per status worth testing)
-- ============================================================

insert into claim_years (id, company_id, fiscal_year, status, created_by) values
  -- Northforge: 2024 approved, 2025 in_progress (primary test workspace)
  ('c1000000-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000001', 2024, 'approved', 'b1000000-0000-0000-0000-000000000001'),
  ('c1000000-0000-0000-0000-000000000002', 'a1000000-0000-0000-0000-000000000001', 2025, 'in_progress', 'b1000000-0000-0000-0000-000000000001'),
  -- Vectis: 2025 ready_for_review
  ('c2000000-0000-0000-0000-000000000001', 'a2000000-0000-0000-0000-000000000002', 2025, 'ready_for_review', 'b2000000-0000-0000-0000-000000000001'),
  -- Riverbend: 2025 draft (empty, fresh start)
  ('c3000000-0000-0000-0000-000000000001', 'a3000000-0000-0000-0000-000000000003', 2025, 'draft', 'b3000000-0000-0000-0000-000000000001');

-- ============================================================
-- 4. FILES (simulated uploads — no actual storage objects)
-- ============================================================

insert into files (id, claim_year_id, uploaded_by, file_name, storage_key, category, mime_type, file_size) values
  -- Northforge 2025
  ('d1000000-0000-0000-0000-000000000001', 'c1000000-0000-0000-0000-000000000002', 'b1000000-0000-0000-0000-000000000003', 'northforge-payroll-2025.xlsx', 'a1000000-0000-0000-0000-000000000001/c1000000-0000-0000-0000-000000000002/aaa11111-payroll-2025.xlsx', 'payroll', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 245000),
  ('d1000000-0000-0000-0000-000000000002', 'c1000000-0000-0000-0000-000000000002', 'b1000000-0000-0000-0000-000000000003', 'northforge-gl-2025.csv', 'a1000000-0000-0000-0000-000000000001/c1000000-0000-0000-0000-000000000002/aaa22222-gl-2025.csv', 'accounting', 'text/csv', 89000),
  ('d1000000-0000-0000-0000-000000000003', 'c1000000-0000-0000-0000-000000000002', 'b1000000-0000-0000-0000-000000000002', 'edge-detection-benchmark-results.pdf', 'a1000000-0000-0000-0000-000000000001/c1000000-0000-0000-0000-000000000002/aaa33333-edge-detection-benchmark.pdf', 'technical', 'application/pdf', 1200000),
  ('d1000000-0000-0000-0000-000000000004', 'c1000000-0000-0000-0000-000000000002', 'b1000000-0000-0000-0000-000000000002', 'model-architecture-v3.pdf', 'a1000000-0000-0000-0000-000000000001/c1000000-0000-0000-0000-000000000002/aaa44444-model-architecture-v3.pdf', 'technical', 'application/pdf', 3400000),
  ('d1000000-0000-0000-0000-000000000005', 'c1000000-0000-0000-0000-000000000002', 'b1000000-0000-0000-0000-000000000002', 'subcontractor-agreement-uofc.pdf', 'a1000000-0000-0000-0000-000000000001/c1000000-0000-0000-0000-000000000002/aaa55555-subcontractor-uofc.pdf', 'contract', 'application/pdf', 560000),
  -- Vectis 2025
  ('d2000000-0000-0000-0000-000000000001', 'c2000000-0000-0000-0000-000000000001', 'b2000000-0000-0000-0000-000000000002', 'vectis-payroll-summary-fy2025.xlsx', 'a2000000-0000-0000-0000-000000000002/c2000000-0000-0000-0000-000000000001/bbb11111-payroll-fy2025.xlsx', 'payroll', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 178000),
  ('d2000000-0000-0000-0000-000000000002', 'c2000000-0000-0000-0000-000000000001', 'b2000000-0000-0000-0000-000000000001', 'clinical-trial-protocol-v2.pdf', 'a2000000-0000-0000-0000-000000000002/c2000000-0000-0000-0000-000000000001/bbb22222-clinical-protocol-v2.pdf', 'technical', 'application/pdf', 2100000),
  ('d2000000-0000-0000-0000-000000000003', 'c2000000-0000-0000-0000-000000000001', 'b2000000-0000-0000-0000-000000000001', 'vectis-accounting-q1q4-2025.xlsx', 'a2000000-0000-0000-0000-000000000002/c2000000-0000-0000-0000-000000000001/bbb33333-accounting-q1q4.xlsx', 'accounting', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 312000);

-- ============================================================
-- 5. PROJECTS (with realistic T661 narratives)
-- ============================================================

-- Northforge 2025: 2 projects
insert into projects (id, claim_year_id, company_id, name, code, status, objective, uncertainty, work_done, advancement, start_date, end_date, sort_order) values
(
  'e1000000-0000-0000-0000-000000000001',
  'c1000000-0000-0000-0000-000000000002',
  'a1000000-0000-0000-0000-000000000001',
  'Real-time Edge Detection for Low-Power IoT Devices',
  'NF-2025-01',
  'complete',
  'The objective was to develop a computer vision model capable of performing real-time edge detection on IoT devices with less than 512MB RAM and no dedicated GPU. Existing models such as YOLO and EfficientDet require computational resources that exceed the constraints of the target hardware by a factor of 10-50x. The goal was to achieve detection accuracy within 5% of EfficientDet-D0 while operating at 15+ frames per second on ARM Cortex-A53 class processors.',
  'The primary technological uncertainty was whether a neural network architecture could be designed that maintains acceptable detection accuracy while fitting within the memory and compute envelope of low-power ARM processors. Standard model compression techniques such as pruning and quantization had been attempted in prior work but resulted in accuracy degradation exceeding 25%, which was commercially unacceptable. It was unknown whether a fundamentally different architecture approach could resolve this trade-off.',
  'The team conducted a systematic investigation over 8 months. Phase 1 involved benchmarking 12 existing lightweight architectures on the target hardware, documenting memory usage, latency, and accuracy for each. Phase 2 explored a novel split-inference approach where early convolutional layers run on-device while deeper layers are processed asynchronously on an edge server. Phase 3 developed a custom knowledge distillation pipeline using a modified version of the teacher-student framework, where the student network was constrained to operations natively supported by ARM NEON SIMD instructions. Over 340 experiments were logged, with systematic variation of architecture depth, filter counts, activation functions, and quantization bit-widths.',
  'The work produced a novel architecture called EdgeSense-Lite that achieves 91.3% of EfficientDet-D0 accuracy while running at 18 FPS on a Raspberry Pi 4B with 1GB RAM. The key advancement was the discovery that depthwise separable convolutions combined with channel-wise mixed-precision quantization (8-bit for spatial layers, 4-bit for pointwise layers) preserved detection accuracy far better than uniform quantization. This finding was not predicted by existing literature and represents a new approach to hardware-aware neural architecture design for resource-constrained devices.',
  '2025-01-15', '2025-09-30', 1
),
(
  'e1000000-0000-0000-0000-000000000002',
  'c1000000-0000-0000-0000-000000000002',
  'a1000000-0000-0000-0000-000000000001',
  'Federated Learning Protocol for Privacy-Preserving Model Training',
  'NF-2025-02',
  'draft',
  'The objective was to develop a federated learning protocol that enables multiple IoT device fleets to contribute to model improvement without transmitting raw sensor data to a central server. The protocol needed to maintain model convergence rates within 15% of centralized training while ensuring that no individual device data could be reconstructed from the transmitted gradient updates.',
  'It was uncertain whether differential privacy guarantees could be maintained while achieving meaningful model convergence in a federated setting with highly heterogeneous data distributions across device fleets. Published federated learning approaches assume relatively uniform data distributions (IID assumption), but real-world IoT deployments exhibit extreme non-IID characteristics. The interaction between differential privacy noise injection and non-IID data heterogeneity on convergence behavior was not established in existing research.',
  'The investigation is ongoing. Work to date includes: implementing a baseline FedAvg protocol and measuring convergence on 6 simulated device fleets with varying data distributions; developing a novel gradient compression scheme that reduces communication overhead by 94% while preserving convergence; and initial experiments with a per-fleet adaptive clipping mechanism for differential privacy that adjusts noise scale based on local data heterogeneity metrics. 87 experimental runs have been completed across 3 privacy budget configurations.',
  '',
  '2025-06-01', null, 2
);

-- Vectis 2025: 1 complete project
insert into projects (id, claim_year_id, company_id, name, code, status, objective, uncertainty, work_done, advancement, start_date, end_date, sort_order) values
(
  'e2000000-0000-0000-0000-000000000001',
  'c2000000-0000-0000-0000-000000000001',
  'a2000000-0000-0000-0000-000000000002',
  'Novel Peptide Synthesis Route for Targeted Drug Delivery',
  'VB-2025-01',
  'complete',
  'The objective was to develop a scalable synthesis route for a class of cyclic peptides that can selectively bind to overexpressed integrin receptors on tumor cells. Existing synthesis methods for this peptide class produce yields below 12% at laboratory scale, making them commercially non-viable. The target was to achieve consistent yields above 35% while maintaining peptide purity above 98% as measured by HPLC.',
  'The technological uncertainty centered on whether solid-phase peptide synthesis could be modified to accommodate the steric constraints of the target cyclic peptide without the side reactions that have historically limited yield. The cyclization step in particular presented unknown challenges: it was not established whether on-resin cyclization or solution-phase cyclization after cleavage would produce better results for this specific peptide backbone geometry. Additionally, the interaction between the novel protecting group strategy and the cyclization conditions was unpredictable from first principles.',
  'A systematic 10-month investigation was conducted. The team synthesized 48 linear precursor variants using Fmoc solid-phase chemistry with 6 different resin types. Each variant was subjected to both on-resin and solution-phase cyclization under 4 temperature and solvent conditions. Analytical characterization included HPLC, mass spectrometry, and circular dichroism for every intermediate. A statistical design-of-experiments approach was used to efficiently explore the parameter space. The team also developed a novel real-time monitoring method using inline UV spectroscopy to detect cyclization completion, reducing failed batches by identifying stalled reactions within 30 minutes rather than after the full 24-hour cycle.',
  'The work identified a specific combination of pseudoproline dipeptide insertion at position 3 and microwave-assisted on-resin cyclization at 60C in DMF/water (95:5) that consistently produces yields of 41-47% with purity above 99.1%. This represents a 3.5x improvement over published methods. The key discovery was that the pseudoproline insertion creates a transient beta-turn that pre-organizes the linear precursor for cyclization, dramatically reducing the entropic barrier. This pre-organization effect had not been predicted by molecular dynamics simulations and represents a new design principle for cyclic peptide synthesis.',
  '2024-04-01', '2025-03-31', 1
);

-- ============================================================
-- 6. EVIDENCE
-- ============================================================

insert into evidence (id, project_id, claim_year_id, file_id, evidence_type, title, description, sort_order) values
  -- NF-2025-01 evidence
  ('f1000000-0000-0000-0000-000000000001', 'e1000000-0000-0000-0000-000000000001', 'c1000000-0000-0000-0000-000000000002', 'd1000000-0000-0000-0000-000000000003', 'test_result', 'Edge Detection Benchmark Results', 'Benchmark comparing 12 architectures on Raspberry Pi 4B. Includes FPS, memory, and mAP metrics.', 1),
  ('f1000000-0000-0000-0000-000000000002', 'e1000000-0000-0000-0000-000000000001', 'c1000000-0000-0000-0000-000000000002', 'd1000000-0000-0000-0000-000000000004', 'document', 'EdgeSense-Lite Architecture Document', 'Final architecture specification with layer configurations and quantization parameters.', 2),
  ('f1000000-0000-0000-0000-000000000003', 'e1000000-0000-0000-0000-000000000001', 'c1000000-0000-0000-0000-000000000002', null, 'commit_log', 'Git Experiment Log — 340 Runs', 'Summary of git commits tagged with experiment IDs covering Jan-Sep 2025. Extracted from internal GitLab.', 3),
  ('f1000000-0000-0000-0000-000000000004', 'e1000000-0000-0000-0000-000000000001', 'c1000000-0000-0000-0000-000000000002', 'd1000000-0000-0000-0000-000000000005', 'document', 'University of Calgary Subcontractor Agreement', 'Research collaboration agreement for NEON SIMD optimization consulting.', 4),
  -- NF-2025-02 evidence (minimal, project is draft)
  ('f1000000-0000-0000-0000-000000000005', 'e1000000-0000-0000-0000-000000000002', 'c1000000-0000-0000-0000-000000000002', null, 'report', 'FedAvg Baseline Results', 'Initial convergence measurements across 6 simulated fleets.', 1),
  -- VB-2025-01 evidence
  ('f2000000-0000-0000-0000-000000000001', 'e2000000-0000-0000-0000-000000000001', 'c2000000-0000-0000-0000-000000000001', 'd2000000-0000-0000-0000-000000000002', 'document', 'Clinical Trial Protocol v2', 'Full protocol for the cyclic peptide synthesis investigation.', 1),
  ('f2000000-0000-0000-0000-000000000002', 'e2000000-0000-0000-0000-000000000001', 'c2000000-0000-0000-0000-000000000001', null, 'test_result', 'HPLC Purity Analysis — 48 Variants', 'Tabulated HPLC results for all 48 linear precursor variants with cyclization outcomes.', 2),
  ('f2000000-0000-0000-0000-000000000003', 'e2000000-0000-0000-0000-000000000001', 'c2000000-0000-0000-0000-000000000001', null, 'report', 'Design of Experiments Statistical Analysis', 'DOE analysis covering resin type, cyclization method, temperature, and solvent effects on yield.', 3);

-- ============================================================
-- 7. COSTS
-- ============================================================

insert into costs (id, project_id, claim_year_id, cost_type, description, amount, hours, rate, employee_name, vendor_name, external_reference, period_start, period_end, source, sort_order) values
  -- NF-2025-01 costs
  ('a7100000-0000-0000-0000-000000000001', 'e1000000-0000-0000-0000-000000000001', 'c1000000-0000-0000-0000-000000000002', 'salary', 'Lead ML Engineer — architecture design and experiment execution', 128000.00, 1400, 91.43, 'James Okafor', null, null, '2025-01-15', '2025-09-30', 'manual', 1),
  ('a7100000-0000-0000-0000-000000000002', 'e1000000-0000-0000-0000-000000000001', 'c1000000-0000-0000-0000-000000000002', 'salary', 'Junior ML Researcher — benchmarking and data preparation', 62000.00, 1200, 51.67, 'Amir Patel', null, null, '2025-03-01', '2025-09-30', 'manual', 2),
  ('a7100000-0000-0000-0000-000000000003', 'e1000000-0000-0000-0000-000000000001', 'c1000000-0000-0000-0000-000000000002', 'subcontractor', 'University of Calgary — ARM NEON SIMD optimization consulting', 35000.00, null, null, null, 'University of Calgary', 'PO-2025-0047', '2025-04-01', '2025-08-31', 'manual', 3),
  ('a7100000-0000-0000-0000-000000000004', 'e1000000-0000-0000-0000-000000000001', 'c1000000-0000-0000-0000-000000000002', 'materials', 'Raspberry Pi 4B units (24x) for distributed testing', 4800.00, null, null, null, 'DigiKey Electronics', 'INV-DK-88291', '2025-02-15', '2025-02-15', 'manual', 4),
  ('a7100000-0000-0000-0000-000000000005', 'e1000000-0000-0000-0000-000000000001', 'c1000000-0000-0000-0000-000000000002', 'overhead', 'Prescribed proxy amount — NF-2025-01', 45960.00, null, null, null, null, null, '2025-01-15', '2025-09-30', 'manual', 5),
  -- NF-2025-02 costs (partial, project is draft)
  ('a7100000-0000-0000-0000-000000000006', 'e1000000-0000-0000-0000-000000000002', 'c1000000-0000-0000-0000-000000000002', 'salary', 'Lead ML Engineer — federated learning protocol design', 48000.00, 520, 92.31, 'James Okafor', null, null, '2025-06-01', '2025-09-30', 'manual', 1),
  -- VB-2025-01 costs
  ('a7200000-0000-0000-0000-000000000001', 'e2000000-0000-0000-0000-000000000001', 'c2000000-0000-0000-0000-000000000001', 'salary', 'Principal Scientist — synthesis route design and supervision', 165000.00, 1800, 91.67, 'Dr. Priya Sharma', null, null, '2024-04-01', '2025-03-31', 'manual', 1),
  ('a7200000-0000-0000-0000-000000000002', 'e2000000-0000-0000-0000-000000000001', 'c2000000-0000-0000-0000-000000000001', 'salary', 'Research Associate — synthesis execution and HPLC analysis', 78000.00, 1600, 48.75, 'Tom Nguyen', null, null, '2024-04-01', '2025-03-31', 'manual', 2),
  ('a7200000-0000-0000-0000-000000000003', 'e2000000-0000-0000-0000-000000000001', 'c2000000-0000-0000-0000-000000000001', 'materials', 'Fmoc amino acids, resins, solvents, and reagents', 42000.00, null, null, null, 'Sigma-Aldrich Canada', 'PO-VB-2024-112', '2024-04-01', '2025-03-31', 'manual', 3),
  ('a7200000-0000-0000-0000-000000000004', 'e2000000-0000-0000-0000-000000000001', 'c2000000-0000-0000-0000-000000000001', 'overhead', 'Prescribed proxy amount — VB-2025-01', 57000.00, null, null, null, null, null, '2024-04-01', '2025-03-31', 'manual', 4);

-- ============================================================
-- 8. REVIEWS (Vectis has a pending review for admin testing)
-- ============================================================

insert into reviews (id, claim_year_id, requested_by, reviewer_id, status, notes) values
  ('a8100000-0000-0000-0000-000000000001', 'c2000000-0000-0000-0000-000000000001', 'b2000000-0000-0000-0000-000000000001', null, 'pending', 'First submission. Please review the peptide synthesis project narrative and cost allocations.');

-- ============================================================
-- 9. REVIEW COMMENTS (sample thread on the Vectis review)
-- ============================================================

insert into review_comments (id, review_id, author_id, target_type, target_id, comment) values
  ('a9100000-0000-0000-0000-000000000001', 'a8100000-0000-0000-0000-000000000001', 'b2000000-0000-0000-0000-000000000001', 'general', null, 'We have completed the peptide synthesis project and assembled all costs and evidence. The overhead is calculated using the prescribed proxy method. Ready for your review.');

-- ============================================================
-- 10. AUDIT LOG (sample entries)
-- ============================================================

insert into audit_log (user_id, action, entity_type, entity_id) values
  ('b1000000-0000-0000-0000-000000000001', 'create_claim_year', 'claim_year', 'c1000000-0000-0000-0000-000000000002'),
  ('b1000000-0000-0000-0000-000000000003', 'upload_file', 'file', 'd1000000-0000-0000-0000-000000000001'),
  ('b1000000-0000-0000-0000-000000000002', 'create_project', 'project', 'e1000000-0000-0000-0000-000000000001'),
  ('b2000000-0000-0000-0000-000000000001', 'request_review', 'review', 'a8100000-0000-0000-0000-000000000001');
