/**
 * Shared navigation map.
 *
 * Deliberately its own module with no "use client" directive. This used to live
 * in SiteHeader.tsx, but that file is a Client Component: when the server-side
 * SiteFooter imported the array from it, the module boundary handed back a
 * client-reference stub rather than the array, and `.map` blew up during
 * prerendering. Plain data shared across the boundary has to sit in a neutral
 * module like this one.
 */
export const NAV_ROUTES = [
  { href: "/hakkimda", key: "about" },
  { href: "/tedaviler", key: "treatments" },
  { href: "/sonuclar", key: "results" },
  { href: "/blog", key: "blog" },
  { href: "/iletisim", key: "contact" },
] as const;

export const LEFT_ROUTES = NAV_ROUTES.slice(0, 3);
export const RIGHT_ROUTES = NAV_ROUTES.slice(3);
