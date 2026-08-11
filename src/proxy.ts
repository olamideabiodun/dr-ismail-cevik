import createMiddleware from "next-intl/middleware";
import { NextResponse, type NextRequest } from "next/server";
import { routing } from "@/i18n/routing";
import { refreshSession } from "@/lib/supabase/proxy";

/**
 * Next.js 16 renamed the `middleware` convention to `proxy`. Same mechanism,
 * but the runtime is always Node.js and is no longer configurable.
 *
 * Two jobs here, in order:
 *   1. next-intl resolves the locale and rewrites/redirects accordingly.
 *   2. Admin routes get an optimistic auth check plus a Supabase session refresh.
 *
 * Step 2 is deliberately NOT the authorization boundary — see the note in
 * src/lib/supabase/proxy.ts. The admin layout re-verifies server-side and RLS
 * enforces access at the database.
 */

const handleI18n = createMiddleware(routing);

const ADMIN_ROOT = "/admin";
const LOGIN_PATH = "/admin/giris";

/** Returns the `/en` style prefix present on the request, or "" for Turkish. */
function localePrefixOf(pathname: string): string {
  for (const locale of routing.locales) {
    if (pathname === `/${locale}` || pathname.startsWith(`/${locale}/`)) {
      return `/${locale}`;
    }
  }
  return "";
}

function withoutLocale(pathname: string, prefix: string): string {
  if (!prefix) return pathname;
  const rest = pathname.slice(prefix.length);
  return rest === "" ? "/" : rest;
}

export async function proxy(request: NextRequest) {
  const response = handleI18n(request);

  const { pathname } = request.nextUrl;
  const prefix = localePrefixOf(pathname);
  const path = withoutLocale(pathname, prefix);

  const isAdminRoute = path === ADMIN_ROOT || path.startsWith(`${ADMIN_ROOT}/`);

  // Marketing and booking pages never need a Supabase round-trip in the proxy.
  if (!isAdminRoute) return response;

  const user = await refreshSession(request, response);
  const isLoginRoute = path === LOGIN_PATH;

  if (!user && !isLoginRoute) {
    const url = request.nextUrl.clone();
    url.pathname = `${prefix}${LOGIN_PATH}`;
    url.search = "";
    // Remember where they were headed so login can send them back.
    if (path !== ADMIN_ROOT) url.searchParams.set("next", path);
    return NextResponse.redirect(url);
  }

  if (user && isLoginRoute) {
    const url = request.nextUrl.clone();
    url.pathname = `${prefix}${ADMIN_ROOT}`;
    url.search = "";
    return NextResponse.redirect(url);
  }

  return response;
}

export const config = {
  // Everything except API routes, Next internals and files with an extension.
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};
