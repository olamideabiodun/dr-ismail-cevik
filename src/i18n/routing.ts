import { defineRouting } from "next-intl/routing";

/**
 * Turkish-first, per design.md §1.
 *
 * `localePrefix: "as-needed"` keeps the primary audience on unprefixed URLs
 * (`/tedaviler`) and puts English behind `/en/...`. Turkish is the canonical
 * site; English is the toggle.
 */
export const routing = defineRouting({
  locales: ["tr", "en"],
  defaultLocale: "tr",
  localePrefix: "as-needed",
});

export type Locale = (typeof routing.locales)[number];
