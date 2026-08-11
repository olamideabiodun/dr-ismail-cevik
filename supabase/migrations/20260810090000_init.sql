-- =============================================================================
-- 20260810090000_init.sql
-- Core schema: services, availability, appointments, settings, admin allow-list.
-- =============================================================================

create extension if not exists "pgcrypto";   -- gen_random_uuid()
create extension if not exists "btree_gist"; -- exclusion constraint on tstzrange + status

-- -----------------------------------------------------------------------------
-- Enums
-- -----------------------------------------------------------------------------
do $$
begin
  if not exists (select 1 from pg_type where typname = 'appointment_status') then
    create type public.appointment_status as enum ('pending', 'confirmed', 'cancelled', 'completed');
  end if;
end
$$;

-- -----------------------------------------------------------------------------
-- services
-- -----------------------------------------------------------------------------
create table if not exists public.services (
  id           uuid primary key default gen_random_uuid(),
  slug         text        not null unique,
  name_tr      text        not null,
  name_en      text        not null,
  summary_tr   text,
  summary_en   text,
  duration_min integer     not null default 30 check (duration_min between 5 and 480),
  buffer_min   integer     not null default 10 check (buffer_min between 0 and 240),
  active       boolean     not null default true,
  sort         integer     not null default 0,
  created_at   timestamptz not null default now()
);

comment on table public.services is
  'Bookable consultation types. duration_min is shown to the patient; buffer_min is reserved after the appointment and is never displayed.';

-- -----------------------------------------------------------------------------
-- availability_rules — recurring weekly working hours
-- weekday follows Postgres EXTRACT(DOW): 0 = Sunday ... 6 = Saturday
-- -----------------------------------------------------------------------------
create table if not exists public.availability_rules (
  id         uuid primary key default gen_random_uuid(),
  weekday    smallint    not null check (weekday between 0 and 6),
  start_time time        not null,
  end_time   time        not null,
  active     boolean     not null default true,
  created_at timestamptz not null default now(),
  constraint availability_rules_time_order check (end_time > start_time)
);

create index if not exists availability_rules_weekday_idx
  on public.availability_rules (weekday) where active;

comment on column public.availability_rules.weekday is
  'Postgres EXTRACT(DOW) convention: 0 = Sunday, 1 = Monday, ... 6 = Saturday.';

-- -----------------------------------------------------------------------------
-- availability_exceptions — one-off overrides for a specific date
--
-- Semantics (enforced in public.get_available_slots / public.create_booking):
--   * any row with is_closed = true  -> the whole date is closed, weekly rules ignored
--   * rows with is_closed = false    -> these windows REPLACE the weekly rules for that date
-- -----------------------------------------------------------------------------
create table if not exists public.availability_exceptions (
  id         uuid primary key default gen_random_uuid(),
  date       date        not null,
  is_closed  boolean     not null default true,
  start_time time,
  end_time   time,
  note       text,
  created_at timestamptz not null default now(),
  constraint availability_exceptions_window check (
    (is_closed and start_time is null and end_time is null)
    or (not is_closed and start_time is not null and end_time is not null and end_time > start_time)
  )
);

-- A date can only be closed once, but may carry several replacement windows.
create unique index if not exists availability_exceptions_closed_date_key
  on public.availability_exceptions (date) where is_closed;

create index if not exists availability_exceptions_date_idx
  on public.availability_exceptions (date);

-- -----------------------------------------------------------------------------
-- appointments
-- -----------------------------------------------------------------------------
create table if not exists public.appointments (
  id                   uuid primary key default gen_random_uuid(),
  reference_code       text        not null unique,
  service_id           uuid        not null references public.services (id) on delete restrict,
  starts_at            timestamptz not null,
  ends_at              timestamptz not null,
  status               public.appointment_status not null default 'pending',
  patient_name         text        not null check (length(btrim(patient_name)) between 2 and 120),
  patient_email        text        not null check (patient_email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  patient_phone        text,
  notes                text        check (notes is null or length(notes) <= 1000),
  locale               text        not null default 'tr' check (locale in ('tr', 'en')),
  confirmation_sent_at timestamptz,
  cancel_token         uuid        not null default gen_random_uuid(),
  cancelled_at         timestamptz,
  created_at           timestamptz not null default now(),
  constraint appointments_time_order check (ends_at > starts_at)
);

-- Required by BUILD_PROMPT: at most one live appointment per start instant.
create unique index if not exists appointments_unique_active_slot
  on public.appointments (starts_at) where status <> 'cancelled';

-- Stronger guarantee: no two live appointments may overlap at all, even when
-- their start instants differ (e.g. 10:00 for 60min vs 10:30 for 30min).
alter table public.appointments
  drop constraint if exists appointments_no_overlap;
alter table public.appointments
  add constraint appointments_no_overlap
  exclude using gist (tstzrange(starts_at, ends_at) with &&)
  where (status <> 'cancelled');

create unique index if not exists appointments_cancel_token_key
  on public.appointments (cancel_token);
create index if not exists appointments_starts_at_idx
  on public.appointments (starts_at);
create index if not exists appointments_status_idx
  on public.appointments (status);

comment on column public.appointments.cancel_token is
  'Unguessable token emailed to the patient. The only credential a guest has for reading, cancelling or rescheduling their own booking.';

-- -----------------------------------------------------------------------------
-- admin_settings — singleton
-- -----------------------------------------------------------------------------
create table if not exists public.admin_settings (
  id                boolean primary key default true,
  slot_interval_min integer     not null default 30 check (slot_interval_min between 5 and 240),
  min_notice_hours  integer     not null default 12 check (min_notice_hours between 0 and 720),
  max_advance_days  integer     not null default 60 check (max_advance_days between 1 and 365),
  timezone          text        not null default 'Europe/Istanbul',
  updated_at        timestamptz not null default now(),
  constraint admin_settings_singleton check (id)
);

-- -----------------------------------------------------------------------------
-- admins — allow-list of authenticated users who may manage the practice
-- -----------------------------------------------------------------------------
create table if not exists public.admins (
  user_id    uuid primary key references auth.users (id) on delete cascade,
  email      text,
  created_at timestamptz not null default now()
);

comment on table public.admins is
  'Admin allow-list. Insert the doctor''s auth.users id here after creating the user in the Supabase dashboard.';
