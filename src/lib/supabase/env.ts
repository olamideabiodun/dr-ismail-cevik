/**
 * Supabase credentials, read defensively.
 *
 * The marketing site (home, treatments, blog, contact) is built entirely from
 * local content and must compile and render before anyone has touched a Supabase
 * dashboard. Only the booking flow and the admin dashboard genuinely need a
 * database, so every accessor here can return null and callers degrade instead
 * of throwing during `next build`.
 *
 * NEXT_PUBLIC_* values are referenced literally so the bundler can inline them.
 */

export type SupabasePublicEnv = {
  url: string;
  anonKey: string;
};

export function getSupabasePublicEnv(): SupabasePublicEnv | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) return null;
  return { url, anonKey };
}

export function isSupabaseConfigured(): boolean {
  return getSupabasePublicEnv() !== null;
}

/**
 * Server-only. Bypasses Row Level Security — never import from a Client
 * Component, never expose the return value to the browser.
 */
export function getSupabaseServiceRoleKey(): string | null {
  return process.env.SUPABASE_SERVICE_ROLE_KEY || null;
}

/** Thrown only from paths that genuinely cannot proceed without a database. */
export class SupabaseNotConfiguredError extends Error {
  constructor() {
    super(
      "Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and " +
        "NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local — see README.md."
    );
    this.name = "SupabaseNotConfiguredError";
  }
}
