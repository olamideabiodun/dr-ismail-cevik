-- =============================================================================
-- 20260811000000_tighten_function_grants.sql
--
-- Found by probing the live project: `anon` could still call
-- public.generate_reference_code() and public.is_admin().
--
-- Why the original REVOKE was not enough:
--   20260810090100_functions.sql does `revoke all on function ... from public`,
--   which removes only the implicit PUBLIC grant. Supabase ships a default
--   privilege —
--       alter default privileges in schema public
--         grant execute on functions to anon, authenticated, service_role;
--   — so every newly created function ALSO receives an explicit grant to those
--   roles. An explicit grant is not removed by revoking from PUBLIC; it has to
--   be revoked from each role by name.
--
-- Neither function leaked data (generate_reference_code fails inside on the
-- appointments read, is_admin merely returned false), but both were reachable
-- and neither should be.
-- =============================================================================

-- Internal helper. Only the SECURITY DEFINER functions call it, and they run as
-- the owner, so no client role needs EXECUTE.
revoke all on function public.generate_reference_code() from anon, authenticated;

-- `authenticated` MUST keep EXECUTE: the RLS policies in 20260810090200_rls.sql
-- call is_admin() in their USING clause, and a policy expression is evaluated
-- with the querying user's privileges. Revoking it from authenticated would
-- break every admin policy. `anon` never hits a policy that references it.
revoke all on function public.is_admin() from anon;

-- Re-assert the intended grants so this migration is self-contained and the end
-- state does not depend on the order the earlier files happened to run in.
grant execute on function public.is_admin() to authenticated;
grant execute on function public.get_available_slots(text, date, uuid) to anon, authenticated;
grant execute on function public.create_booking(text, timestamptz, text, text, text, text, text) to anon, authenticated;
grant execute on function public.get_booking_by_token(uuid) to anon, authenticated;
grant execute on function public.cancel_booking_by_token(uuid) to anon, authenticated;
grant execute on function public.reschedule_booking_by_token(uuid, timestamptz) to anon, authenticated;
