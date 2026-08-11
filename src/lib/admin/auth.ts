import "server-only";

import { redirect } from "next/navigation";
import { createServerSupabase } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { routing } from "@/i18n/routing";

/**
 * Server-side admin gate.
 *
 * proxy.ts already bounces anonymous visitors away from /admin, but that is an
 * optimistic check on cookie presence and is explicitly not the authorization
 * boundary (see the Next.js authentication guide). This runs in the layout, on
 * the server, and is what actually decides. The database is the third layer:
 * every admin policy in 20260810090200_rls.sql calls public.is_admin().
 */

/** `localePrefix: "as-needed"` means Turkish has no prefix. */
export function localeHref(locale: string, path: string): string {
  return locale === routing.defaultLocale ? path : `/${locale}${path}`;
}

export async function requireAdmin(locale: string) {
  const loginHref = localeHref(locale, "/admin/giris");

  if (!isSupabaseConfigured()) redirect(loginHref);

  const supabase = await createServerSupabase();

  // getUser() revalidates the token against Supabase. getSession() would only
  // decode the cookie, which a client can forge.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect(loginHref);

  const { data: adminRow } = await supabase
    .from("admins")
    .select("user_id")
    .eq("user_id", user.id)
    .maybeSingle();

  return { supabase, user, isAdmin: Boolean(adminRow) };
}
