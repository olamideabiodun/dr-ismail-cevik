import "server-only";

import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import {
  getSupabasePublicEnv,
  getSupabaseServiceRoleKey,
  SupabaseNotConfiguredError,
} from "./env";
import type { Database } from "./types";

/**
 * Request-scoped client using the anon key. Row Level Security applies, and the
 * signed-in admin's session is read from cookies. Use this for anything that
 * should respect the policies in 20260810090200_rls.sql.
 */
export async function createServerSupabase() {
  const env = getSupabasePublicEnv();
  if (!env) throw new SupabaseNotConfiguredError();

  const cookieStore = await cookies();

  return createServerClient<Database>(env.url, env.anonKey, {
    cookies: {
      getAll: () => cookieStore.getAll(),
      setAll: (cookiesToSet) => {
        try {
          for (const { name, value, options } of cookiesToSet) {
            cookieStore.set(name, value, options);
          }
        } catch {
          // Server Components cannot write cookies. Session refresh happens in
          // proxy.ts, which runs before this and persists the rotated tokens,
          // so swallowing here is safe rather than lossy.
        }
      },
    },
  });
}

/**
 * Returns null instead of throwing when Supabase has not been configured yet,
 * so marketing pages can render during a first `next build`.
 */
export async function tryCreateServerSupabase() {
  if (!getSupabasePublicEnv()) return null;
  return createServerSupabase();
}

/**
 * SERVICE ROLE — bypasses Row Level Security entirely.
 *
 * Only for trusted server-side work that genuinely cannot go through a policy:
 * stamping confirmation_sent_at after an email send, and admin reads that need
 * to see every appointment. Never import this from a Client Component, never
 * return its rows to the browser unfiltered.
 */
export function createAdminSupabase() {
  const env = getSupabasePublicEnv();
  const serviceRoleKey = getSupabaseServiceRoleKey();
  if (!env || !serviceRoleKey) return null;

  return createServerClient<Database>(env.url, serviceRoleKey, {
    // The service-role client is stateless: no session, no cookie persistence.
    cookies: {
      getAll: () => [],
      setAll: () => {},
    },
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}
