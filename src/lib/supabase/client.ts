"use client";

import { createBrowserClient } from "@supabase/ssr";
import { getSupabasePublicEnv, SupabaseNotConfiguredError } from "./env";
import type { Database } from "./types";

/**
 * Browser client — anon key only, fully governed by RLS.
 * Used by the admin login form; the public booking flow talks to Server Actions
 * instead, so no patient data ever transits a browser-held Supabase session.
 */
export function createClient() {
  const env = getSupabasePublicEnv();
  if (!env) throw new SupabaseNotConfiguredError();
  return createBrowserClient<Database>(env.url, env.anonKey);
}
