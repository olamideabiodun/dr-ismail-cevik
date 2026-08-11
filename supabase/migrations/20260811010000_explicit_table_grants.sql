-- =============================================================================
-- 20260811010000_explicit_table_grants.sql
--
-- Stop depending on Supabase's default privileges for table access.
--
-- The problem, found by running the smoke test against a fresh local database:
-- there are two sets of default privileges in schema public, and which one
-- applies depends on who owns the object.
--
--   owner supabase_admin -> anon/authenticated get arwdDxtm  (includes SELECT)
--   owner postgres       -> anon/authenticated get Dxtm      (NO SELECT)
--
-- Migrations run as `postgres`, so every table created by 20260810090000_init
-- landed with only Dxtm — REFERENCES, TRIGGER, TRUNCATE and no read access at
-- all. RLS policies were being written against tables that the roles could not
-- reach in the first place: a policy decides WHICH ROWS you see, a grant decides
-- whether you may touch the table at all, and without the grant the policy never
-- runs.
--
-- The hosted project happened to come up with the permissive set, so the site
-- worked there while the identical schema was broken locally. That difference is
-- luck, not design — a future project, or a change to Supabase's defaults, would
-- silently ship a dead booking form and a dead admin dashboard.
--
-- Everything the app needs is therefore granted explicitly below.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- anon — the public site. Read-only, and only the tables the booking UI needs.
-- -----------------------------------------------------------------------------
grant select on public.services           to anon;
grant select on public.availability_rules to anon;
grant select on public.admin_settings     to anon;

-- Column-level on purpose: `note` is admin-facing free text and stays hidden.
-- Re-asserted here so this file alone describes anon's full surface.
revoke all on public.availability_exceptions from anon;
grant select (id, date, is_closed, start_time, end_time, created_at)
  on public.availability_exceptions to anon;

-- Patient PII and the admin allow-list are unreachable. Guests get at their own
-- booking only through the SECURITY DEFINER RPCs, keyed on the emailed token.
revoke all on public.appointments from anon;
revoke all on public.admins       from anon;

-- -----------------------------------------------------------------------------
-- authenticated — the admin dashboard.
--
-- These are broad on purpose. `authenticated` is ANY signed-in user, so the
-- grants alone would be too permissive — but every policy in
-- 20260810090200_rls.sql gates writes behind public.is_admin(), so a signed-in
-- non-admin still sees zero rows and every write is rejected by WITH CHECK.
-- Grants make the table reachable; policies decide what is actually allowed.
-- -----------------------------------------------------------------------------
grant select, insert, update, delete on public.services                to authenticated;
grant select, insert, update, delete on public.availability_rules      to authenticated;
grant select, insert, update, delete on public.availability_exceptions to authenticated;
grant select, insert, update, delete on public.admin_settings          to authenticated;
grant select, insert, update, delete on public.appointments            to authenticated;

-- Read-only: membership is managed in the dashboard, never through the app,
-- so an admin cannot promote another account from inside the product.
grant select on public.admins to authenticated;

-- No sequence grants are needed: every primary key defaults to gen_random_uuid().
