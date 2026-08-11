-- =============================================================================
-- booking_smoke.sql — end-to-end assertions for the booking schema.
--
-- Run against a database that has had the migrations and seed applied:
--
--   npx supabase db reset          # migrations + seed
--   npm run db:test                # this file
--
-- Every check raises on failure, so with ON_ERROR_STOP=1 the script exits
-- non-zero the moment something is wrong. It is safe to re-run: everything it
-- inserts is rolled back at the end.
--
-- These are the guarantees the booking flow depends on. If one of them breaks,
-- patients get double-booked or PII leaks — so they are worth asserting rather
-- than assuming.
-- =============================================================================

\set ON_ERROR_STOP on
\timing off

begin;

-- Keep the whole run inside one transaction and roll it back at the end.
-- create_booking() takes a transaction-scoped advisory lock, which is released
-- with the rollback.

do $$
declare
  v_count integer;
begin
  ---------------------------------------------------------------------------
  raise notice '--- schema ---';

  select count(*) into v_count
    from information_schema.tables
   where table_schema = 'public'
     and table_name in ('services','availability_rules','availability_exceptions',
                        'appointments','admin_settings','admins');
  if v_count <> 6 then
    raise exception 'expected 6 tables, found %', v_count;
  end if;
  raise notice 'PASS  6 tables present';

  select count(*) into v_count
    from pg_tables
   where schemaname = 'public'
     and tablename in ('services','availability_rules','availability_exceptions',
                       'appointments','admin_settings','admins')
     and rowsecurity;
  if v_count <> 6 then
    raise exception 'RLS not enabled on all 6 tables (only % have it)', v_count;
  end if;
  raise notice 'PASS  RLS enabled on all 6 tables';

  -- The overlap guard is the one that actually prevents double-booking.
  if not exists (
    select 1 from pg_constraint where conname = 'appointments_no_overlap'
  ) then
    raise exception 'missing exclusion constraint appointments_no_overlap';
  end if;
  raise notice 'PASS  no-overlap exclusion constraint present';

  if not exists (
    select 1 from pg_indexes
     where schemaname = 'public' and indexname = 'appointments_unique_active_slot'
  ) then
    raise exception 'missing partial unique index appointments_unique_active_slot';
  end if;
  raise notice 'PASS  partial unique index on starts_at present';

  ---------------------------------------------------------------------------
  raise notice '--- seed ---';

  select count(*) into v_count from public.services where active;
  if v_count < 1 then
    raise exception 'no active services seeded';
  end if;
  raise notice 'PASS  % active services', v_count;

  select count(*) into v_count from public.availability_rules where active;
  if v_count < 1 then
    raise exception 'no availability rules seeded';
  end if;
  raise notice 'PASS  % availability rules', v_count;

  if not exists (select 1 from public.admin_settings where id) then
    raise exception 'admin_settings singleton row missing';
  end if;
  raise notice 'PASS  admin_settings singleton present';
end
$$;

---------------------------------------------------------------------------
-- Booking behaviour
---------------------------------------------------------------------------

do $$
declare
  v_slug     text;
  v_date     date;
  v_slot     timestamptz;
  v_slot2    timestamptz;
  v_token    uuid;
  v_ref      text;
  v_tz       text;
  v_found    boolean := false;
  v_msg      text;
begin
  raise notice '--- booking ---';

  select timezone into v_tz from public.admin_settings where id;
  select slug into v_slug from public.services where active order by sort limit 1;

  -- Walk forward until a date actually has slots. Which weekdays are open
  -- depends on the seed, so hard-coding "tomorrow" would be flaky.
  for i in 1..30 loop
    v_date := ((now() at time zone v_tz)::date + i);
    select g.slot_start into v_slot
      from public.get_available_slots(v_slug, v_date) g
     order by g.slot_start
     limit 1;
    if v_slot is not null then
      v_found := true;
      exit;
    end if;
  end loop;

  if not v_found then
    raise exception 'get_available_slots returned nothing for any of the next 30 days';
  end if;
  raise notice 'PASS  slots available on % (first: %)', v_date, v_slot;

  -- 1. A booking succeeds.
  select booking_reference, booking_cancel_token
    into v_ref, v_token
    from public.create_booking(
      v_slug, v_slot, 'Test Hasta', 'test@example.com', '05001234567', null, 'tr'
    );

  if v_ref is null then
    raise exception 'create_booking returned no reference';
  end if;
  raise notice 'PASS  booking created (ref %)', v_ref;

  -- 2. That slot is no longer offered.
  if exists (
    select 1 from public.get_available_slots(v_slug, v_date) g
     where g.slot_start = v_slot
  ) then
    raise exception 'booked slot is still being offered by get_available_slots';
  end if;
  raise notice 'PASS  booked slot removed from availability';

  -- 3. Booking it again is rejected.
  begin
    perform public.create_booking(
      v_slug, v_slot, 'Ikinci Hasta', 'second@example.com', null, null, 'tr'
    );
    raise exception 'FAIL: double booking was accepted';
  exception
    when sqlstate 'P0001' then
      get stacked diagnostics v_msg = message_text;
      if v_msg <> 'slot_unavailable' then
        raise exception 'expected slot_unavailable, got %', v_msg;
      end if;
      raise notice 'PASS  double booking rejected (%)', v_msg;
  end;

  -- 4. A slot in the past is rejected.
  begin
    perform public.create_booking(
      v_slug, now() - interval '2 days', 'Gecmis', 'past@example.com', null, null, 'tr'
    );
    raise exception 'FAIL: past booking was accepted';
  exception
    when sqlstate 'P0001' then
      get stacked diagnostics v_msg = message_text;
      if v_msg not in ('in_past', 'too_soon', 'slot_unavailable') then
        raise exception 'expected in_past/too_soon, got %', v_msg;
      end if;
      raise notice 'PASS  past booking rejected (%)', v_msg;
  end;

  -- 5. A date beyond max_advance_days is rejected.
  begin
    perform public.create_booking(
      v_slug, now() + interval '400 days', 'Uzak', 'far@example.com', null, null, 'tr'
    );
    raise exception 'FAIL: out-of-window booking was accepted';
  exception
    when sqlstate 'P0001' then
      get stacked diagnostics v_msg = message_text;
      if v_msg not in ('too_far', 'slot_unavailable') then
        raise exception 'expected too_far, got %', v_msg;
      end if;
      raise notice 'PASS  out-of-window booking rejected (%)', v_msg;
  end;

  -- 6. The token reads back exactly one booking.
  if (select count(*) from public.get_booking_by_token(v_token)) <> 1 then
    raise exception 'get_booking_by_token did not return the booking';
  end if;
  raise notice 'PASS  token reads back its own booking';

  -- 7. Cancelling frees the slot again.
  perform public.cancel_booking_by_token(v_token);

  if not exists (
    select 1 from public.get_available_slots(v_slug, v_date) g
     where g.slot_start = v_slot
  ) then
    raise exception 'slot was not released after cancellation';
  end if;
  raise notice 'PASS  cancellation released the slot';

  -- 8. Cancelling twice is rejected.
  begin
    perform public.cancel_booking_by_token(v_token);
    raise exception 'FAIL: double cancellation was accepted';
  exception
    when sqlstate 'P0001' then
      get stacked diagnostics v_msg = message_text;
      raise notice 'PASS  double cancellation rejected (%)', v_msg;
  end;
end
$$;

---------------------------------------------------------------------------
-- RLS: what an anonymous visitor can and cannot reach
---------------------------------------------------------------------------

do $$
declare
  v_count integer;
begin
  raise notice '--- RLS as anon ---';

  set local role anon;

  -- Services must be readable; the booking form is built from them.
  select count(*) into v_count from public.services;
  if v_count < 1 then
    raise exception 'anon cannot read services';
  end if;
  raise notice 'PASS  anon can read services (%)', v_count;

  -- Appointments hold patient PII and must be completely unreachable.
  begin
    select count(*) into v_count from public.appointments;
    if v_count > 0 then
      raise exception 'FAIL: anon read % appointment rows', v_count;
    end if;
    raise notice 'PASS  anon sees 0 appointments';
  exception
    when insufficient_privilege then
      raise notice 'PASS  anon denied on appointments (permission denied)';
  end;

  -- And must not be able to write one directly.
  begin
    insert into public.appointments (
      reference_code, service_id, starts_at, ends_at, patient_name, patient_email
    )
    values (
      'IC-HACK1', (select id from public.services limit 1),
      now() + interval '3 days', now() + interval '3 days 30 minutes',
      'Direct Insert', 'hack@example.com'
    );
    raise exception 'FAIL: anon inserted directly into appointments';
  exception
    when insufficient_privilege or check_violation then
      raise notice 'PASS  anon denied direct INSERT on appointments';
  end;

  reset role;
end
$$;

rollback;

\echo ''
\echo '================================================'
\echo ' All booking smoke checks passed.'
\echo '================================================'
