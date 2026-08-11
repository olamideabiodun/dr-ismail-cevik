import "server-only";

import { tryCreateServerSupabase } from "@/lib/supabase/server";
import { SERVICES } from "@/content/services";
import type { BookingByToken } from "@/lib/supabase/types";
import type { Locale } from "@/i18n/routing";

/**
 * Read-side of the booking flow.
 *
 * The `services` table is the booking source of truth (duration, active), while
 * src/content/services.ts owns the copy. They are joined here on `slug`. A row
 * in the database with no matching content entry is skipped rather than
 * rendered with an empty name — that combination means someone added a service
 * in SQL without adding its copy, and a blank card would hide the mistake.
 */

export type BookableService = {
  slug: string;
  name: string;
  summary: string;
  durationMin: number;
  icon: (typeof SERVICES)[number]["icon"];
};

export type BookingSettings = {
  slotIntervalMin: number;
  minNoticeHours: number;
  maxAdvanceDays: number;
  timezone: string;
};

export const DEFAULT_SETTINGS: BookingSettings = {
  slotIntervalMin: 30,
  minNoticeHours: 12,
  maxAdvanceDays: 60,
  timezone: "Europe/Istanbul",
};

export async function getBookableServices(
  locale: Locale
): Promise<BookableService[] | null> {
  const supabase = await tryCreateServerSupabase();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("services")
    .select("slug, name_tr, name_en, duration_min, active, sort")
    .eq("active", true)
    .order("sort", { ascending: true });

  if (error || !data) return null;

  return data.flatMap((row) => {
    const content = SERVICES.find((service) => service.slug === row.slug);
    if (!content) return [];

    return [
      {
        slug: row.slug,
        name: locale === "tr" ? row.name_tr : row.name_en,
        summary: content.summary[locale],
        durationMin: row.duration_min,
        icon: content.icon,
      },
    ];
  });
}

/**
 * Looks up a single booking by its emailed token.
 *
 * Goes through the SECURITY DEFINER RPC, not a table select: `anon` has no
 * read grant on `appointments` at all, so the token is the only thing that can
 * surface a row, and it can only ever surface its own.
 */
export async function getBookingByToken(
  token: string
): Promise<BookingByToken | null> {
  const supabase = await tryCreateServerSupabase();
  if (!supabase) return null;

  const { data, error } = await supabase.rpc("get_booking_by_token", {
    p_token: token,
  });

  if (error || !data) return null;
  return (data as BookingByToken[])[0] ?? null;
}

export async function getBookingSettings(): Promise<BookingSettings> {
  const supabase = await tryCreateServerSupabase();
  if (!supabase) return DEFAULT_SETTINGS;

  const { data, error } = await supabase
    .from("admin_settings")
    .select("slot_interval_min, min_notice_hours, max_advance_days, timezone")
    .maybeSingle();

  if (error || !data) return DEFAULT_SETTINGS;

  return {
    slotIntervalMin: data.slot_interval_min,
    minNoticeHours: data.min_notice_hours,
    maxAdvanceDays: data.max_advance_days,
    timezone: data.timezone,
  };
}
