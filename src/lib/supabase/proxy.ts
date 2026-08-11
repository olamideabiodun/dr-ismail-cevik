import { createServerClient } from "@supabase/ssr";
import type { NextRequest, NextResponse } from "next/server";
import { getSupabasePublicEnv } from "./env";
import type { Database } from "./types";

/**
 * Refreshes the Supabase auth session and writes rotated cookies onto the
 * response that proxy.ts is about to return.
 *
 * Returns the signed-in user, or null when there is no session (or when
 * Supabase has not been configured yet).
 *
 * This is an OPTIMISTIC check only. Per the Next.js authentication guide, proxy
 * must not be the sole authorization boundary — the admin layout re-verifies the
 * user server-side and the database enforces RLS regardless.
 */
export async function refreshSession(
  request: NextRequest,
  response: NextResponse
) {
  const env = getSupabasePublicEnv();
  if (!env) return null;

  const supabase = createServerClient<Database>(env.url, env.anonKey, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll: (cookiesToSet, headers) => {
        for (const { name, value, options } of cookiesToSet) {
          response.cookies.set(name, value, options);
        }
        // Responses that set auth cookies must never be cached by a CDN, or one
        // patient's session could be served to another. @supabase/ssr hands us
        // the exact no-store headers to apply.
        for (const [key, value] of Object.entries(headers ?? {})) {
          response.headers.set(key, value);
        }
      },
    },
  });

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    return user;
  } catch {
    // A network hiccup against Supabase must not take down the marketing site.
    return null;
  }
}
