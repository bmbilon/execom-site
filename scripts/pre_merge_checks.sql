-- ═══════════════════════════════════════════════════════════════
-- Pre-merge verification script
-- Run after: supabase db reset
-- Usage:    psql $DATABASE_URL -f scripts/pre_merge_checks.sql
--           OR in Supabase SQL Editor (Dashboard → SQL)
-- ═══════════════════════════════════════════════════════════════

\set ON_ERROR_STOP on

-- ─── Check 1: Verify all expected objects exist ─────────────

do $$
declare
  missing text[] := '{}';
begin
  -- Enums
  if not exists (select 1 from pg_type where typname = 'commercialization_status') then
    missing := missing || 'enum:commercialization_status';
  end if;
  if not exists (select 1 from pg_type where typname = 'matter_type') then
    missing := missing || 'enum:matter_type';
  end if;
  if not exists (select 1 from pg_type where typname = 'artifact_type') then
    missing := missing || 'enum:artifact_type';
  end if;
  -- Old enum should NOT exist
  if exists (select 1 from pg_type where typname = 'incorporation_status') then
    missing := missing || 'STALE:incorporation_status still exists!';
  end if;

  -- Tables
  if not exists (select 1 from information_schema.tables where table_name = 'commercialization_matters') then
    missing := missing || 'table:commercialization_matters';
  end if;
  if not exists (select 1 from information_schema.tables where table_name = 'incorporation_intakes') then
    missing := missing || 'table:incorporation_intakes';
  end if;
  if not exists (select 1 from information_schema.tables where table_name = 'ip_transfer_intakes') then
    missing := missing || 'table:ip_transfer_intakes';
  end if;
  if not exists (select 1 from information_schema.tables where table_name = 'approved_snapshots') then
    missing := missing || 'table:approved_snapshots';
  end if;
  if not exists (select 1 from information_schema.tables where table_name = 'generated_artifacts') then
    missing := missing || 'table:generated_artifacts';
  end if;
  if not exists (select 1 from information_schema.tables where table_name = 'matter_status_events') then
    missing := missing || 'table:matter_status_events';
  end if;

  if array_length(missing, 1) > 0 then
    raise exception 'CHECK 1 FAILED — Missing objects: %', array_to_string(missing, ', ');
  else
    raise notice 'CHECK 1 PASSED — All expected tables and enums exist, old enum dropped.';
  end if;
end$$;


-- ─── Check 2: Snapshot immutability ─────────────────────────

do $$
declare
  test_user_id uuid;
  test_matter_id uuid;
  test_intake_id uuid;
  test_snapshot_id uuid;
begin
  -- Create test user (use existing service role or create temp)
  test_user_id := gen_random_uuid();

  -- Insert test matter
  insert into commercialization_matters (id, user_id, matter_type, display_name)
  values (gen_random_uuid(), test_user_id, 'incorporation', 'Test Matter')
  returning id into test_matter_id;

  -- Insert test intake
  insert into incorporation_intakes (id, matter_id, user_id, status)
  values (gen_random_uuid(), test_matter_id, test_user_id, 'draft')
  returning id into test_intake_id;

  -- Insert test snapshot
  insert into approved_snapshots (id, intake_id, matter_id, version, payload, payload_hash, approved_by)
  values (
    gen_random_uuid(), test_intake_id, test_matter_id, 1,
    '{"test": "original_data"}'::jsonb,
    'abc123hash',
    test_user_id
  )
  returning id into test_snapshot_id;

  -- Try to mutate payload — should FAIL
  begin
    update approved_snapshots
    set payload = '{}'::jsonb
    where id = test_snapshot_id;

    raise exception 'CHECK 2 FAILED — Snapshot payload mutation was NOT blocked!';
  exception
    when others then
      if sqlerrm like '%immutable%' then
        raise notice 'CHECK 2 PASSED — Snapshot payload mutation correctly blocked.';
      else
        raise exception 'CHECK 2 FAILED — Unexpected error: %', sqlerrm;
      end if;
  end;

  -- Try to mutate hash — should FAIL
  begin
    update approved_snapshots
    set payload_hash = 'tampered'
    where id = test_snapshot_id;

    raise exception 'CHECK 2b FAILED — Snapshot hash mutation was NOT blocked!';
  exception
    when others then
      if sqlerrm like '%immutable%' then
        raise notice 'CHECK 2b PASSED — Snapshot hash mutation correctly blocked.';
      else
        raise exception 'CHECK 2b FAILED — Unexpected error: %', sqlerrm;
      end if;
  end;

  -- Cleanup
  delete from approved_snapshots where id = test_snapshot_id;
  delete from incorporation_intakes where id = test_intake_id;
  delete from commercialization_matters where id = test_matter_id;
end$$;


-- ─── Check 3: Status transition enforcement ─────────────────

do $$
declare
  test_user_id uuid;
  test_matter_id uuid;
  test_intake_id uuid;
begin
  test_user_id := gen_random_uuid();

  insert into commercialization_matters (id, user_id, matter_type, display_name)
  values (gen_random_uuid(), test_user_id, 'incorporation', 'Transition Test')
  returning id into test_matter_id;

  insert into incorporation_intakes (id, matter_id, user_id, status)
  values (gen_random_uuid(), test_matter_id, test_user_id, 'draft')
  returning id into test_intake_id;

  -- 3a: Illegal jump draft → approved_for_generation should FAIL
  begin
    update incorporation_intakes
    set status = 'approved_for_generation'
    where id = test_intake_id;

    raise exception 'CHECK 3a FAILED — Illegal transition draft→approved_for_generation was NOT blocked!';
  exception
    when others then
      if sqlerrm like '%Invalid status transition%' then
        raise notice 'CHECK 3a PASSED — Illegal transition draft→approved_for_generation blocked.';
      else
        raise exception 'CHECK 3a FAILED — Unexpected error: %', sqlerrm;
      end if;
  end;

  -- 3b: Legal sequence draft → submitted → in_review → approved_for_generation → generated → filed
  update incorporation_intakes set status = 'submitted' where id = test_intake_id;
  raise notice 'CHECK 3b — draft→submitted OK';

  update incorporation_intakes set status = 'in_review' where id = test_intake_id;
  raise notice 'CHECK 3b — submitted→in_review OK';

  update incorporation_intakes set status = 'approved_for_generation' where id = test_intake_id;
  raise notice 'CHECK 3b — in_review→approved_for_generation OK';

  update incorporation_intakes set status = 'generated' where id = test_intake_id;
  raise notice 'CHECK 3b — approved_for_generation→generated OK';

  update incorporation_intakes set status = 'filed' where id = test_intake_id;
  raise notice 'CHECK 3b — generated→filed OK';

  raise notice 'CHECK 3b PASSED — Full legal transition chain succeeded.';

  -- 3c: Filed is terminal — no further transitions allowed
  begin
    update incorporation_intakes set status = 'draft' where id = test_intake_id;
    raise exception 'CHECK 3c FAILED — filed→draft was NOT blocked!';
  exception
    when others then
      if sqlerrm like '%Invalid status transition%' then
        raise notice 'CHECK 3c PASSED — filed is terminal, no transitions allowed.';
      else
        raise exception 'CHECK 3c FAILED — Unexpected error: %', sqlerrm;
      end if;
  end;

  -- 3d: Test IP transfer uses the same enforcement
  declare
    ip_intake_id uuid;
  begin
    insert into ip_transfer_intakes (id, matter_id, user_id, status)
    values (gen_random_uuid(), test_matter_id, test_user_id, 'draft')
    returning id into ip_intake_id;

    begin
      update ip_transfer_intakes
      set status = 'filed'
      where id = ip_intake_id;

      raise exception 'CHECK 3d FAILED — IP transfer illegal transition draft→filed was NOT blocked!';
    exception
      when others then
        if sqlerrm like '%Invalid status transition%' then
          raise notice 'CHECK 3d PASSED — IP transfer transition enforcement active.';
        else
          raise exception 'CHECK 3d FAILED — Unexpected error: %', sqlerrm;
        end if;
    end;

    delete from ip_transfer_intakes where id = ip_intake_id;
  end;

  -- Cleanup
  delete from incorporation_intakes where id = test_intake_id;
  delete from commercialization_matters where id = test_matter_id;
end$$;


-- ─── Check 4: Artifact traceability ─────────────────────────

do $$
declare
  test_user_id uuid;
  test_matter_id uuid;
  test_intake_id uuid;
  snap1_id uuid;
  snap2_id uuid;
  art1_id uuid;
  art2_id uuid;
  snap1_hash text;
  snap2_hash text;
  art1_stored_hash text;
  art2_stored_hash text;
begin
  test_user_id := gen_random_uuid();

  insert into commercialization_matters (id, user_id, matter_type, display_name)
  values (gen_random_uuid(), test_user_id, 'incorporation', 'Artifact Trace Test')
  returning id into test_matter_id;

  insert into incorporation_intakes (id, matter_id, user_id, status)
  values (gen_random_uuid(), test_matter_id, test_user_id, 'draft')
  returning id into test_intake_id;

  -- Create two snapshots with different hashes
  snap1_id := gen_random_uuid();
  snap2_id := gen_random_uuid();

  insert into approved_snapshots (id, intake_id, matter_id, version, payload, payload_hash, approved_by)
  values (snap1_id, test_intake_id, test_matter_id, 1, '{"v": 1}'::jsonb, 'hash_snapshot_v1', test_user_id);

  insert into approved_snapshots (id, intake_id, matter_id, version, payload, payload_hash, approved_by)
  values (snap2_id, test_intake_id, test_matter_id, 2, '{"v": 2}'::jsonb, 'hash_snapshot_v2', test_user_id);

  -- Generate artifacts from each snapshot
  insert into generated_artifacts (id, matter_id, intake_id, snapshot_id, artifact_type, version, file_path, snapshot_hash, generated_by)
  values (gen_random_uuid(), test_matter_id, test_intake_id, snap1_id, 'incorporation_package_docx', 1, '/docs/v1.docx', 'hash_snapshot_v1', test_user_id)
  returning id into art1_id;

  insert into generated_artifacts (id, matter_id, intake_id, snapshot_id, artifact_type, version, file_path, snapshot_hash, generated_by)
  values (gen_random_uuid(), test_matter_id, test_intake_id, snap2_id, 'incorporation_package_docx', 2, '/docs/v2.docx', 'hash_snapshot_v2', test_user_id)
  returning id into art2_id;

  -- Verify both artifacts exist
  if (select count(*) from generated_artifacts where matter_id = test_matter_id) != 2 then
    raise exception 'CHECK 4a FAILED — Expected 2 artifacts, got %',
      (select count(*) from generated_artifacts where matter_id = test_matter_id);
  end if;
  raise notice 'CHECK 4a PASSED — Both artifacts exist in generated_artifacts.';

  -- Verify each artifact references a snapshot_hash
  select snapshot_hash into art1_stored_hash from generated_artifacts where id = art1_id;
  select snapshot_hash into art2_stored_hash from generated_artifacts where id = art2_id;

  if art1_stored_hash is null or art2_stored_hash is null then
    raise exception 'CHECK 4b FAILED — Artifact snapshot_hash is NULL';
  end if;
  raise notice 'CHECK 4b PASSED — Both artifacts have snapshot_hash values.';

  -- Verify hash matches snapshot table
  select payload_hash into snap1_hash from approved_snapshots where id = snap1_id;
  select payload_hash into snap2_hash from approved_snapshots where id = snap2_id;

  if art1_stored_hash != snap1_hash then
    raise exception 'CHECK 4c FAILED — Artifact 1 hash (%) does not match snapshot 1 hash (%)', art1_stored_hash, snap1_hash;
  end if;
  if art2_stored_hash != snap2_hash then
    raise exception 'CHECK 4c FAILED — Artifact 2 hash (%) does not match snapshot 2 hash (%)', art2_stored_hash, snap2_hash;
  end if;
  raise notice 'CHECK 4c PASSED — Artifact hashes match their source snapshots.';

  raise notice 'CHECK 4 PASSED — Full audit chain verified.';

  -- Cleanup
  delete from generated_artifacts where matter_id = test_matter_id;
  delete from approved_snapshots where matter_id = test_matter_id;
  delete from incorporation_intakes where id = test_intake_id;
  delete from commercialization_matters where id = test_matter_id;
end$$;


-- ─── Summary ─────────────────────────────────────────────────

do $$
begin
  raise notice '';
  raise notice '═══════════════════════════════════════════════════════';
  raise notice 'ALL PRE-MERGE CHECKS PASSED';
  raise notice '═══════════════════════════════════════════════════════';
  raise notice 'Safe to merge feat/commercialization-portal into main.';
  raise notice '';
end$$;
