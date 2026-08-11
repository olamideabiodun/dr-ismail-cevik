-- =============================================================================
-- 20260810090100_functions.sql
-- Booking logic. All guest-facing writes go through SECURITY DEFINER functions
-- so that `anon` never holds a direct INSERT/UPDATE grant on public.appointments.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- is_admin() — SECURITY DEFINER so RLS policies on public.admins cannot recurse.
-- -----------------------------------------------------------------------------
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select exists (select 1 from public.admins a where a.user_id = auth.uid());
$$;

-- -----------------------------------------------------------------------------
-- generate_reference_code() — short, human-dictatable, ambiguity-free code.
-- -----------------------------------------------------------------------------
create or replace function public.generate_reference_code()
returns text
language plpgsql
volatile
set search_path = public, pg_temp
as $$
declare
  -- No I, O, 0 or 1: these get misheard on the phone.
  alphabet constant text := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  v_code   text;
begin
  loop
    v_code := 'IC-';
    for _i in 1..6 loop
      v_code := v_code || substr(alphabet, 1 + floor(random() * length(alphabet))::int, 1);
    end loop;
    exit when not exists (select 1 from public.appointments a where a.reference_code = v_code);
  end loop;
  return v_code;
end;
$$;

-- -----------------------------------------------------------------------------
-- get_available_slots()
--
-- The single source of truth for "what can be booked". The public booking UI
-- lists these; create_booking() and reschedule_booking_by_token() validate
-- against them, so the UI and the server can never disagree.
--
-- p_exclude_appointment_id lets a reschedule ignore its own current slot.
-- -----------------------------------------------------------------------------
create or replace function public.get_available_slots(
  p_service_slug           text,
  p_date                   date,
  p_exclude_appointment_id uuid default null
)
returns table (slot_start timestamptz, slot_end timestamptz)
language plpgsql
stable
security definer
set search_path = public, pg_temp
as $$
declare
  v_tz          text;
  v_interval    integer;
  v_min_notice  integer;
  v_max_advance integer;
  v_duration    integer;
  v_buffer      integer;
  v_today       date;
  v_open_excs   boolean;
  v_window      record;
  v_win_start   timestamptz;
  v_win_end     timestamptz;
  v_cursor      timestamptz;
  v_slot_end    timestamptz;
begin
  select s.timezone, s.slot_interval_min, s.min_notice_hours, s.max_advance_days
    into v_tz, v_interval, v_min_notice, v_max_advance
    from public.admin_settings s
   where s.id;

  -- Fall back to sane defaults if the singleton row was never seeded.
  v_tz          := coalesce(v_tz, 'Europe/Istanbul');
  v_interval    := coalesce(v_interval, 30);
  v_min_notice  := coalesce(v_min_notice, 12);
  v_max_advance := coalesce(v_max_advance, 60);

  select sv.duration_min, sv.buffer_min
    into v_duration, v_buffer
    from public.services sv
   where sv.slug = p_service_slug and sv.active;

  if v_duration is null then
    return; -- unknown or deactivated service -> no slots
  end if;

  v_today := (now() at time zone v_tz)::date;
  if p_date < v_today or p_date > (v_today + v_max_advance) then
    return;
  end if;

  -- A closure wins over everything else for that date.
  if exists (
    select 1 from public.availability_exceptions e
     where e.date = p_date and e.is_closed
  ) then
    return;
  end if;

  -- One-off open windows REPLACE the weekly rules for that date.
  select exists (
    select 1 from public.availability_exceptions e
     where e.date = p_date and not e.is_closed
  ) into v_open_excs;

  for v_window in
    select w.start_time, w.end_time
      from (
        select e.start_time, e.end_time
          from public.availability_exceptions e
         where v_open_excs and e.date = p_date and not e.is_closed
        union all
        select r.start_time, r.end_time
          from public.availability_rules r
         where not v_open_excs
           and r.active
           and r.weekday = extract(dow from p_date)::smallint
      ) w
     order by w.start_time
  loop
    -- Work in absolute time: `time + interval` wraps at midnight, timestamps do not.
    v_win_start := ((p_date + v_window.start_time) at time zone v_tz);
    v_win_end   := ((p_date + v_window.end_time)   at time zone v_tz);

    v_cursor := v_win_start;
    while (v_cursor + make_interval(mins => v_duration)) <= v_win_end loop
      v_slot_end := v_cursor + make_interval(mins => v_duration);

      if v_cursor >= (now() + make_interval(hours => v_min_notice))
         and not exists (
           select 1
             from public.appointments a
             join public.services asv on asv.id = a.service_id
            where a.status <> 'cancelled'
              and (p_exclude_appointment_id is null or a.id <> p_exclude_appointment_id)
              -- Reserve each side's trailing buffer as well as the appointment itself.
              and tstzrange(a.starts_at, a.ends_at + make_interval(mins => asv.buffer_min))
               && tstzrange(v_cursor,    v_slot_end + make_interval(mins => v_buffer))
         )
      then
        slot_start := v_cursor;
        slot_end   := v_slot_end;
        return next;
      end if;

      v_cursor := v_cursor + make_interval(mins => v_interval);
    end loop;
  end loop;

  return;
end;
$$;

-- -----------------------------------------------------------------------------
-- create_booking() — guest booking, no account.
--
-- Raises one of these messages, which the app maps to localized copy:
--   service_not_found | in_past | too_soon | too_far | day_closed
--   slot_unavailable  | rate_limited
-- -----------------------------------------------------------------------------
create or replace function public.create_booking(
  p_service_slug  text,
  p_starts_at     timestamptz,
  p_patient_name  text,
  p_patient_email text,
  p_patient_phone text default null,
  p_notes         text default null,
  p_locale        text default 'tr'
)
returns table (
  booking_id           uuid,
  booking_reference    text,
  booking_cancel_token uuid,
  booking_starts_at    timestamptz,
  booking_ends_at      timestamptz,
  service_slug         text,
  service_name_tr      text,
  service_name_en      text,
  service_duration_min integer
)
language plpgsql
volatile
security definer
set search_path = public, pg_temp
as $$
declare
  v_tz          text;
  v_min_notice  integer;
  v_max_advance integer;
  v_service     public.services%rowtype;
  v_local_date  date;
  v_today       date;
  v_ends_at     timestamptz;
  v_name        text;
  v_email       text;
  v_phone       text;
  v_notes       text;
  v_locale      text;
  v_code        text;
  v_new_id      uuid;
  v_token       uuid;
begin
  -- Serialize booking creation. A single practice books a handful of slots a day,
  -- so a transaction-scoped advisory lock is cheap and makes the
  -- check-then-insert sequence below genuinely atomic.
  perform pg_advisory_xact_lock(hashtext('public.create_booking'));

  select s.timezone, s.min_notice_hours, s.max_advance_days
    into v_tz, v_min_notice, v_max_advance
    from public.admin_settings s
   where s.id;

  v_tz          := coalesce(v_tz, 'Europe/Istanbul');
  v_min_notice  := coalesce(v_min_notice, 12);
  v_max_advance := coalesce(v_max_advance, 60);

  select * into v_service
    from public.services sv
   where sv.slug = p_service_slug and sv.active;

  if not found then
    raise exception 'service_not_found' using errcode = 'P0001';
  end if;

  -- Normalize input. The table's CHECK constraints are the last line of defence;
  -- Zod on the server is the first.
  v_name  := btrim(coalesce(p_patient_name, ''));
  v_email := lower(btrim(coalesce(p_patient_email, '')));
  v_phone := nullif(btrim(coalesce(p_patient_phone, '')), '');
  v_notes := nullif(left(btrim(coalesce(p_notes, '')), 1000), '');
  v_locale := case when p_locale in ('tr', 'en') then p_locale else 'tr' end;

  -- Defence in depth behind the app-level rate limiter.
  if (
    select count(*) from public.appointments a
     where lower(a.patient_email) = v_email
       and a.created_at > now() - interval '24 hours'
       and a.status <> 'cancelled'
  ) >= 5 then
    raise exception 'rate_limited' using errcode = 'P0001';
  end if;

  v_today      := (now() at time zone v_tz)::date;
  v_local_date := (p_starts_at at time zone v_tz)::date;

  if p_starts_at <= now() then
    raise exception 'in_past' using errcode = 'P0001';
  end if;

  if p_starts_at < (now() + make_interval(hours => v_min_notice)) then
    raise exception 'too_soon' using errcode = 'P0001';
  end if;

  if v_local_date > (v_today + v_max_advance) then
    raise exception 'too_far' using errcode = 'P0001';
  end if;

  if exists (
    select 1 from public.availability_exceptions e
     where e.date = v_local_date and e.is_closed
  ) then
    raise exception 'day_closed' using errcode = 'P0001';
  end if;

  -- Authoritative check: the requested instant must be one the UI would have offered.
  -- Covers working hours, slot-grid alignment, buffers and collisions in one shot.
  if not exists (
    select 1 from public.get_available_slots(p_service_slug, v_local_date) g
     where g.slot_start = p_starts_at
  ) then
    raise exception 'slot_unavailable' using errcode = 'P0001';
  end if;

  v_ends_at := p_starts_at + make_interval(mins => v_service.duration_min);
  v_code    := public.generate_reference_code();

  insert into public.appointments (
    reference_code, service_id, starts_at, ends_at, status,
    patient_name, patient_email, patient_phone, notes, locale
  )
  values (
    v_code, v_service.id, p_starts_at, v_ends_at, 'pending',
    v_name, v_email, v_phone, v_notes, v_locale
  )
  returning appointments.id, appointments.cancel_token into v_new_id, v_token;

  booking_id           := v_new_id;
  booking_reference    := v_code;
  booking_cancel_token := v_token;
  booking_starts_at    := p_starts_at;
  booking_ends_at      := v_ends_at;
  service_slug         := v_service.slug;
  service_name_tr      := v_service.name_tr;
  service_name_en      := v_service.name_en;
  service_duration_min := v_service.duration_min;
  return next;
end;
$$;

-- -----------------------------------------------------------------------------
-- get_booking_by_token() — a guest reading their own booking. The token is the
-- only credential; nothing else about the appointment table is exposed to anon.
-- -----------------------------------------------------------------------------
create or replace function public.get_booking_by_token(p_token uuid)
returns table (
  booking_reference text,
  booking_status    public.appointment_status,
  booking_starts_at timestamptz,
  booking_ends_at   timestamptz,
  patient_name      text,
  patient_email     text,
  patient_phone     text,
  notes             text,
  locale            text,
  service_slug      text,
  service_name_tr   text,
  service_name_en   text
)
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select a.reference_code, a.status, a.starts_at, a.ends_at,
         a.patient_name, a.patient_email, a.patient_phone, a.notes, a.locale,
         s.slug, s.name_tr, s.name_en
    from public.appointments a
    join public.services s on s.id = a.service_id
   where a.cancel_token = p_token;
$$;

-- -----------------------------------------------------------------------------
-- cancel_booking_by_token()
-- Raises: not_found | already_cancelled | already_started
-- -----------------------------------------------------------------------------
create or replace function public.cancel_booking_by_token(p_token uuid)
returns table (booking_reference text, booking_starts_at timestamptz)
language plpgsql
volatile
security definer
set search_path = public, pg_temp
as $$
declare
  v_appt public.appointments%rowtype;
begin
  select * into v_appt
    from public.appointments a
   where a.cancel_token = p_token
   for update;

  if not found then
    raise exception 'not_found' using errcode = 'P0001';
  end if;

  if v_appt.status = 'cancelled' then
    raise exception 'already_cancelled' using errcode = 'P0001';
  end if;

  if v_appt.starts_at <= now() then
    raise exception 'already_started' using errcode = 'P0001';
  end if;

  update public.appointments
     set status = 'cancelled', cancelled_at = now()
   where id = v_appt.id;

  booking_reference := v_appt.reference_code;
  booking_starts_at := v_appt.starts_at;
  return next;
end;
$$;

-- -----------------------------------------------------------------------------
-- reschedule_booking_by_token()
-- Raises: not_found | already_cancelled | already_started | slot_unavailable
-- -----------------------------------------------------------------------------
create or replace function public.reschedule_booking_by_token(
  p_token     uuid,
  p_starts_at timestamptz
)
returns table (
  booking_reference text,
  booking_starts_at timestamptz,
  booking_ends_at   timestamptz
)
language plpgsql
volatile
security definer
set search_path = public, pg_temp
as $$
declare
  v_appt       public.appointments%rowtype;
  v_service    public.services%rowtype;
  v_tz         text;
  v_local_date date;
  v_ends_at    timestamptz;
begin
  perform pg_advisory_xact_lock(hashtext('public.create_booking'));

  select coalesce(s.timezone, 'Europe/Istanbul') into v_tz
    from public.admin_settings s where s.id;
  v_tz := coalesce(v_tz, 'Europe/Istanbul');

  select * into v_appt
    from public.appointments a
   where a.cancel_token = p_token
   for update;

  if not found then
    raise exception 'not_found' using errcode = 'P0001';
  end if;
  if v_appt.status = 'cancelled' then
    raise exception 'already_cancelled' using errcode = 'P0001';
  end if;
  if v_appt.starts_at <= now() then
    raise exception 'already_started' using errcode = 'P0001';
  end if;

  select * into v_service from public.services sv where sv.id = v_appt.service_id;

  v_local_date := (p_starts_at at time zone v_tz)::date;

  -- Exclude this appointment so its current slot does not block its own move.
  if not exists (
    select 1 from public.get_available_slots(v_service.slug, v_local_date, v_appt.id) g
     where g.slot_start = p_starts_at
  ) then
    raise exception 'slot_unavailable' using errcode = 'P0001';
  end if;

  v_ends_at := p_starts_at + make_interval(mins => v_service.duration_min);

  update public.appointments
     set starts_at = p_starts_at,
         ends_at   = v_ends_at,
         status    = 'pending'
   where id = v_appt.id;

  booking_reference := v_appt.reference_code;
  booking_starts_at := p_starts_at;
  booking_ends_at   := v_ends_at;
  return next;
end;
$$;

-- -----------------------------------------------------------------------------
-- Execution grants. Revoke the implicit PUBLIC grant first, then hand out
-- exactly what each role needs.
-- -----------------------------------------------------------------------------
revoke all on function public.is_admin()                                              from public;
revoke all on function public.generate_reference_code()                               from public;
revoke all on function public.get_available_slots(text, date, uuid)                    from public;
revoke all on function public.create_booking(text, timestamptz, text, text, text, text, text) from public;
revoke all on function public.get_booking_by_token(uuid)                              from public;
revoke all on function public.cancel_booking_by_token(uuid)                           from public;
revoke all on function public.reschedule_booking_by_token(uuid, timestamptz)          from public;

grant execute on function public.is_admin()                           to authenticated;
grant execute on function public.get_available_slots(text, date, uuid) to anon, authenticated;
grant execute on function public.create_booking(text, timestamptz, text, text, text, text, text) to anon, authenticated;
grant execute on function public.get_booking_by_token(uuid)            to anon, authenticated;
grant execute on function public.cancel_booking_by_token(uuid)         to anon, authenticated;
grant execute on function public.reschedule_booking_by_token(uuid, timestamptz) to anon, authenticated;

-- generate_reference_code() stays internal: only the definer-owned functions call it.
