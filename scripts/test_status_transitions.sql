-- ═══════════════════════════════════════════════════════════════
-- Operational Test: Status Transition Enforcement
--
-- Run against your Supabase database after applying migrations 009 + 010.
-- Uses a temporary test user. Each test either succeeds or raises an exception.
--
-- Usage:
--   psql $DATABASE_URL -f scripts/test_status_transitions.sql
--   OR run via Supabase SQL editor
-- ═══════════════════════════════════════════════════════════════

begin;

-- ─── Setup: create a test user in auth.users ──────────────────
-- (Supabase requires this for FK references)
-- If running in Supabase SQL Editor, you may need to use the service role.

do $$
declare
  test_user_id uuid := '00000000-0000-0000-0000-000000000001';
  test_matter_id uuid;
  test_intake_id uuid;
  test_snapshot_id uuid;
  err_msg text;
begin
  -- Create test user if not exists (skip if auth.users not accessible)
  begin
    insert into auth.users (id, email, raw_user_meta_data, aud, role, created_at, updated_at)
    values (test_user_id, 'test@execom.ca', '{}', 'authenticated', 'authenticated', now(), now())
    on conflict (id) do nothing;
  exception when others then
    raise notice 'Could not insert test user (may already exist): %', sqlerrm;
  end;

  -- Ensure test profile exists for staff check
  begin
    insert into profiles (id, is_execom_staff) values (test_user_id, true)
    on conflict (id) do update set is_execom_staff = true;
  exception when others then
    raise notice 'Could not insert test profile: %', sqlerrm;
  end;

  -- ─── Create test matter + intake ─────────────────────────────

  insert into commercialization_matters (user_id, matter_type, display_name, status)
  values (test_user_id, 'incorporation', 'Test Corp Ltd.', 'draft')
  returning id into test_matter_id;

  insert into incorporation_intakes (matter_id, user_id, status, proposed_name, legal_element)
  values (test_matter_id, test_user_id, 'draft', 'Test Corp', 'Ltd.')
  returning id into test_intake_id;

  raise notice '──────────────────────────────────────';
  raise notice 'TEST: Status transition enforcement';
  raise notice 'Matter: %  Intake: %', test_matter_id, test_intake_id;
  raise notice '──────────────────────────────────────';

  -- ─── TEST 1: Valid transition draft → submitted ──────────────
  begin
    update incorporation_intakes set status = 'submitted' where id = test_intake_id;
    raise notice 'PASS: draft → submitted';
  exception when others then
    raise notice 'FAIL: draft → submitted should succeed: %', sqlerrm;
  end;

  -- ─── TEST 2: ILLEGAL transition submitted → filed ────────────
  begin
    update incorporation_intakes set status = 'filed' where id = test_intake_id;
    raise notice 'FAIL: submitted → filed should have been rejected!';
  exception when others then
    get stacked diagnostics err_msg = message_text;
    if err_msg like '%Invalid status transition%' then
      raise notice 'PASS: submitted → filed correctly rejected';
    else
      raise notice 'FAIL: unexpected error: %', err_msg;
    end if;
  end;

  -- ─── TEST 3: ILLEGAL transition submitted → approved_for_generation
  begin
    update incorporation_intakes set status = 'approved_for_generation' where id = test_intake_id;
    raise notice 'FAIL: submitted → approved_for_generation should have been rejected!';
  exception when others then
    get stacked diagnostics err_msg = message_text;
    if err_msg like '%Invalid status transition%' then
      raise notice 'PASS: submitted → approved_for_generation correctly rejected';
    else
      raise notice 'FAIL: unexpected error: %', err_msg;
    end if;
  end;

  -- ─── TEST 4: Valid path submitted → in_review ────────────────
  begin
    update incorporation_intakes set status = 'in_review' where id = test_intake_id;
    raise notice 'PASS: submitted → in_review';
  exception when others then
    raise notice 'FAIL: submitted → in_review should succeed: %', sqlerrm;
  end;

  -- ─── TEST 5: ILLEGAL transition in_review → filed ────────────
  begin
    update incorporation_intakes set status = 'filed' where id = test_intake_id;
    raise notice 'FAIL: in_review → filed should have been rejected!';
  exception when others then
    get stacked diagnostics err_msg = message_text;
    if err_msg like '%Invalid status transition%' then
      raise notice 'PASS: in_review → filed correctly rejected';
    else
      raise notice 'FAIL: unexpected error: %', err_msg;
    end if;
  end;

  -- ─── TEST 6: Valid in_review → changes_requested ─────────────
  begin
    update incorporation_intakes set status = 'changes_requested' where id = test_intake_id;
    raise notice 'PASS: in_review → changes_requested';
  exception when others then
    raise notice 'FAIL: in_review → changes_requested should succeed: %', sqlerrm;
  end;

  -- ─── TEST 7: Valid changes_requested → submitted (re-submit) ─
  begin
    update incorporation_intakes set status = 'submitted' where id = test_intake_id;
    raise notice 'PASS: changes_requested → submitted';
  exception when others then
    raise notice 'FAIL: changes_requested → submitted should succeed: %', sqlerrm;
  end;

  -- ─── TEST 8: Walk through to approved ────────────────────────
  update incorporation_intakes set status = 'in_review' where id = test_intake_id;
  update incorporation_intakes set status = 'approved_for_generation' where id = test_intake_id;
  raise notice 'PASS: walked to approved_for_generation';

  -- ─── TEST 9: ILLEGAL approved → filed (must go through generated)
  begin
    update incorporation_intakes set status = 'filed' where id = test_intake_id;
    raise notice 'FAIL: approved_for_generation → filed should have been rejected!';
  exception when others then
    get stacked diagnostics err_msg = message_text;
    if err_msg like '%Invalid status transition%' then
      raise notice 'PASS: approved_for_generation → filed correctly rejected';
    else
      raise notice 'FAIL: unexpected error: %', err_msg;
    end if;
  end;

  -- ─── TEST 10: Valid full path to filed ───────────────────────
  begin
    update incorporation_intakes set status = 'generated' where id = test_intake_id;
    update incorporation_intakes set status = 'filed' where id = test_intake_id;
    raise notice 'PASS: approved → generated → filed';
  exception when others then
    raise notice 'FAIL: approved → generated → filed should succeed: %', sqlerrm;
  end;

  -- ─── TEST 11: ILLEGAL filed → anything ──────────────────────
  begin
    update incorporation_intakes set status = 'draft' where id = test_intake_id;
    raise notice 'FAIL: filed → draft should have been rejected!';
  exception when others then
    get stacked diagnostics err_msg = message_text;
    if err_msg like '%Invalid status transition%' then
      raise notice 'PASS: filed → draft correctly rejected (terminal state)';
    else
      raise notice 'FAIL: unexpected error: %', err_msg;
    end if;
  end;

  -- ─── TEST 12: Snapshot immutability ──────────────────────────
  -- Reset intake to approved for snapshot test
  -- (We need to bypass the trigger for this reset — use a temp disable)
  alter table incorporation_intakes disable trigger trg_enforce_status_transition;
  update incorporation_intakes set status = 'approved_for_generation' where id = test_intake_id;
  alter table incorporation_intakes enable trigger trg_enforce_status_transition;

  insert into approved_snapshots (intake_id, matter_id, version, payload, payload_hash, approved_by)
  values (test_intake_id, test_matter_id, 1, '{"proposed_name":"Test Corp"}', 'abc123hash', test_user_id)
  returning id into test_snapshot_id;

  begin
    update approved_snapshots set payload = '{"proposed_name":"TAMPERED"}' where id = test_snapshot_id;
    raise notice 'FAIL: Snapshot payload mutation should have been rejected!';
  exception when others then
    get stacked diagnostics err_msg = message_text;
    if err_msg like '%immutable%' then
      raise notice 'PASS: Snapshot payload mutation correctly rejected';
    else
      raise notice 'FAIL: unexpected error: %', err_msg;
    end if;
  end;

  begin
    update approved_snapshots set payload_hash = 'tampered_hash' where id = test_snapshot_id;
    raise notice 'FAIL: Snapshot hash mutation should have been rejected!';
  exception when others then
    get stacked diagnostics err_msg = message_text;
    if err_msg like '%immutable%' then
      raise notice 'PASS: Snapshot hash mutation correctly rejected';
    else
      raise notice 'FAIL: unexpected error: %', err_msg;
    end if;
  end;

  -- ─── TEST 13: Unique constraint on snapshot version ──────────
  begin
    insert into approved_snapshots (intake_id, matter_id, version, payload, approved_by)
    values (test_intake_id, test_matter_id, 1, '{"dup":"true"}', test_user_id);
    raise notice 'FAIL: Duplicate snapshot version should have been rejected!';
  exception when others then
    get stacked diagnostics err_msg = message_text;
    if err_msg like '%uq_snapshot_intake_version%' or err_msg like '%duplicate key%' then
      raise notice 'PASS: Duplicate snapshot version correctly rejected';
    else
      raise notice 'FAIL: unexpected error: %', err_msg;
    end if;
  end;

  raise notice '──────────────────────────────────────';
  raise notice 'ALL TESTS COMPLETE';
  raise notice '──────────────────────────────────────';
end $$;

-- Rollback to avoid persisting test data
rollback;
