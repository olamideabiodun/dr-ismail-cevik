-- =============================================================================
-- 20260810090200_rls.sql
-- Row Level Security. Default posture is deny; every allowance below is explicit.
--
-- Key rule: `anon` has NO policy on public.appointments at all. Guests never
-- read or write that table directly — they go through the SECURITY DEFINER
-- functions in 20260810090100_functions.sql, which expose exactly one booking
-- at a time and only to whoever holds its cancel_token.
-- =============================================================================

alter table public.services                enable row level security;
alter table public.availability_rules      enable row level security;
alter table public.availability_exceptions enable row level security;
alter table public.appointments            enable row level security;
alter table public.admin_settings          enable row level security;
alter table public.admins                  enable row level security;

-- -----------------------------------------------------------------------------
-- services — the public menu. Only active rows are visible to visitors.
-- -----------------------------------------------------------------------------
drop policy if exists services_public_read on public.services;
create policy services_public_read
  on public.services for select
  to anon, authenticated
  using (active);

drop policy if exists services_admin_all on public.services;
create policy services_admin_all
  on public.services for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- -----------------------------------------------------------------------------
-- availability_rules — needed by the booking UI to render the calendar.
-- -----------------------------------------------------------------------------
drop policy if exists availability_rules_public_read on public.availability_rules;
create policy availability_rules_public_read
  on public.availability_rules for select
  to anon, authenticated
  using (active);

drop policy if exists availability_rules_admin_all on public.availability_rules;
create policy availability_rules_admin_all
  on public.availability_rules for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- -----------------------------------------------------------------------------
-- availability_exceptions — closures must be visible so the UI can grey out days.
-- `note` is admin-facing free text; keep it out of the public read.
-- -----------------------------------------------------------------------------
drop policy if exists availability_exceptions_public_read on public.availability_exceptions;
create policy availability_exceptions_public_read
  on public.availability_exceptions for select
  to anon, authenticated
  using (true);

drop policy if exists availability_exceptions_admin_all on public.availability_exceptions;
create policy availability_exceptions_admin_all
  on public.availability_exceptions for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- Withhold the internal note from anonymous visitors.
revoke select on public.availability_exceptions from anon;
grant select (id, date, is_closed, start_time, end_time, created_at)
  on public.availability_exceptions to anon;

-- -----------------------------------------------------------------------------
-- admin_settings — slot interval / timezone / booking window are needed by the
-- public booking UI and contain nothing sensitive.
-- -----------------------------------------------------------------------------
drop policy if exists admin_settings_public_read on public.admin_settings;
create policy admin_settings_public_read
  on public.admin_settings for select
  to anon, authenticated
  using (true);

drop policy if exists admin_settings_admin_write on public.admin_settings;
create policy admin_settings_admin_write
  on public.admin_settings for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- -----------------------------------------------------------------------------
-- appointments — patient PII. Admin-only, and no anon policy whatsoever.
-- -----------------------------------------------------------------------------
drop policy if exists appointments_admin_all on public.appointments;
create policy appointments_admin_all
  on public.appointments for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- Belt and braces: even if a policy were added by mistake, anon holds no grant.
revoke all on public.appointments from anon;

-- -----------------------------------------------------------------------------
-- admins — the allow-list itself is only readable by admins.
-- -----------------------------------------------------------------------------
drop policy if exists admins_self_read on public.admins;
create policy admins_self_read
  on public.admins for select
  to authenticated
  using (public.is_admin());

revoke all on public.admins from anon;

-- Membership changes happen in the Supabase dashboard / via service_role only.
-- Deliberately no INSERT/UPDATE/DELETE policy: an admin cannot add another admin
-- through the app, which keeps privilege escalation off the public surface.
