import { CLINIC_TIMEZONE } from "@/lib/constants";
import type { Locale } from "@/i18n/routing";

/**
 * Every appointment time is expressed in the clinic's timezone, never the
 * visitor's. A patient booking from Berlin must see the Gaziantep hour, or they
 * will arrive an hour early. All formatting therefore pins `timeZone`
 * explicitly, and `next-intl`'s global `timeZone` (src/i18n/request.ts) keeps
 * server and client renders agreeing.
 */

const intlLocale = (locale: Locale) => (locale === "tr" ? "tr-TR" : "en-GB");

/** yyyy-MM-dd as it reads on a wall calendar in Istanbul. */
export function toDateKey(date: Date): string {
  // en-CA gives ISO-ordered parts, which sidesteps manual zero-padding.
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: CLINIC_TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

export function todayKey(): string {
  return toDateKey(new Date());
}

/**
 * Adds days to a yyyy-MM-dd key.
 *
 * The key is anchored at 12:00 UTC before arithmetic: Turkey has been on a
 * fixed UTC+3 with no DST since 2016, but anchoring at midday means even a
 * future DST reintroduction could not push the result onto the wrong date.
 */
export function addDaysToKey(key: string, days: number): string {
  const [year, month, day] = key.split("-").map(Number);
  const anchor = new Date(Date.UTC(year, month - 1, day, 12));
  anchor.setUTCDate(anchor.getUTCDate() + days);
  return toDateKey(anchor);
}

export function dateKeyToDate(key: string): Date {
  const [year, month, day] = key.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day, 12));
}

/** Builds the calendar strip: today through today + maxAdvanceDays. */
export function buildDateRange(maxAdvanceDays: number): string[] {
  const start = todayKey();
  return Array.from({ length: maxAdvanceDays + 1 }, (_, index) =>
    addDaysToKey(start, index)
  );
}

export function formatTime(iso: string, locale: Locale): string {
  return new Intl.DateTimeFormat(intlLocale(locale), {
    timeZone: CLINIC_TIMEZONE,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(new Date(iso));
}

export function formatLongDate(iso: string, locale: Locale): string {
  return new Intl.DateTimeFormat(intlLocale(locale), {
    timeZone: CLINIC_TIMEZONE,
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(iso));
}

export function formatDateTime(iso: string, locale: Locale): string {
  return `${formatLongDate(iso, locale)} · ${formatTime(iso, locale)}`;
}

/** Short labels for the horizontal date picker, e.g. "Sal" / "12". */
export function formatDayChip(
  dateKey: string,
  locale: Locale
): { weekday: string; day: string; month: string } {
  const date = dateKeyToDate(dateKey);
  const format = (options: Intl.DateTimeFormatOptions) =>
    new Intl.DateTimeFormat(intlLocale(locale), {
      timeZone: CLINIC_TIMEZONE,
      ...options,
    }).format(date);

  return {
    weekday: format({ weekday: "short" }),
    day: format({ day: "numeric" }),
    month: format({ month: "short" }),
  };
}
