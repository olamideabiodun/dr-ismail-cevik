"use server";

import { headers } from "next/headers";
import { createAdminSupabase, tryCreateServerSupabase } from "@/lib/supabase/server";
import { sendEmail } from "@/lib/email/send";
import {
  bookingConfirmationEmail,
  internalNotificationEmail,
} from "@/lib/email/templates";
import { siteUrl } from "@/lib/constants";
import { checkRateLimit, rateLimitKey } from "./rate-limit";
import {
  bookingInputSchema,
  rescheduleSchema,
  slotQuerySchema,
  toErrorKey,
  tokenSchema,
} from "./schema";
import type { AvailableSlot, CreateBookingResult } from "@/lib/supabase/types";
import type { Locale } from "@/i18n/routing";

/**
 * Server Actions for the guest booking flow.
 *
 * Notes on trust boundaries:
 *  - Writes go through the SECURITY DEFINER RPCs using the ANON key, not the
 *    service role. The database decides what is allowed; this file only asks.
 *  - The service role appears exactly once, to stamp `confirmation_sent_at`
 *    after a successful send. That column is not something a guest may set.
 *  - Returned errors are i18n keys, never raw Postgres text.
 */

type ActionError = {
  ok: false;
  error: string;
  fieldErrors?: Record<string, string>;
};

/** PostgREST puts `RAISE EXCEPTION 'x'` in `message`, occasionally in `details`. */
function mapPostgresError(
  error: { message?: string; details?: string | null } | null
) {
  if (!error) return "generic";
  const fromMessage = toErrorKey(error.message);
  if (fromMessage !== "generic") return fromMessage;
  return toErrorKey(error.details ?? undefined);
}

/* -------------------------------------------------------------------------- */
/* Slots                                                                      */
/* -------------------------------------------------------------------------- */

export async function fetchAvailableSlots(
  serviceSlug: string,
  date: string
): Promise<{ ok: true; slots: AvailableSlot[] } | ActionError> {
  const parsed = slotQuerySchema.safeParse({ serviceSlug, date });
  if (!parsed.success) return { ok: false, error: "generic" };

  const supabase = await tryCreateServerSupabase();
  if (!supabase) return { ok: false, error: "generic" };

  const { data, error } = await supabase.rpc("get_available_slots", {
    p_service_slug: parsed.data.serviceSlug,
    p_date: parsed.data.date,
  });

  if (error) return { ok: false, error: mapPostgresError(error) };

  return { ok: true, slots: (data ?? []) as AvailableSlot[] };
}

/* -------------------------------------------------------------------------- */
/* Create                                                                     */
/* -------------------------------------------------------------------------- */

export type BookingSuccess = {
  ok: true;
  referenceCode: string;
  startsAt: string;
  serviceName: string;
  email: string;
  /** False when the booking saved but the confirmation email did not send. */
  emailSent: boolean;
};

export async function submitBooking(
  input: unknown
): Promise<BookingSuccess | ActionError> {
  const parsed = bookingInputSchema.safeParse(input);

  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = String(issue.path[0] ?? "form");
      // Keep the first issue per field: the earliest is the most specific.
      if (!fieldErrors[key]) fieldErrors[key] = issue.message;
    }
    return { ok: false, error: "generic", fieldErrors };
  }

  const booking = parsed.data;

  const headerList = await headers();
  const limit = checkRateLimit(
    rateLimitKey(
      headerList.get("x-forwarded-for"),
      headerList.get("x-real-ip"),
      booking.email
    )
  );
  if (!limit.allowed) return { ok: false, error: "rate_limited" };

  const supabase = await tryCreateServerSupabase();
  if (!supabase) return { ok: false, error: "generic" };

  const { data, error } = await supabase.rpc("create_booking", {
    p_service_slug: booking.serviceSlug,
    p_starts_at: new Date(booking.startsAt).toISOString(),
    p_patient_name: booking.name,
    p_patient_email: booking.email,
    p_patient_phone: booking.phone || null,
    p_notes: booking.notes || null,
    p_locale: booking.locale,
  });

  if (error) return { ok: false, error: mapPostgresError(error) };

  const result = (data as CreateBookingResult[] | null)?.[0];
  if (!result) return { ok: false, error: "generic" };

  const locale = booking.locale as Locale;
  const serviceName =
    locale === "tr" ? result.service_name_tr : result.service_name_en;

  // The token lives only in this URL and in the patient's inbox.
  const managePath =
    locale === "tr"
      ? `/randevu/${result.booking_cancel_token}`
      : `/en/randevu/${result.booking_cancel_token}`;
  const manageUrl = `${siteUrl()}${managePath}`;

  const emailData = {
    patientName: booking.name,
    serviceName,
    startsAt: result.booking_starts_at,
    referenceCode: result.booking_reference,
    manageUrl,
    notes: booking.notes,
    phone: booking.phone,
    locale,
  };

  const confirmation = bookingConfirmationEmail(emailData);
  const sent = await sendEmail({
    to: booking.email,
    subject: confirmation.subject,
    html: confirmation.html,
    text: confirmation.text,
  });

  // Internal copy is fire-and-forget: the patient's outcome must not depend on
  // whether the clinic's own inbox accepted the message.
  const notifyEmail = process.env.NOTIFY_EMAIL;
  if (notifyEmail) {
    const internal = internalNotificationEmail(emailData);
    void sendEmail({
      to: notifyEmail,
      subject: internal.subject,
      html: internal.html,
      text: internal.text,
      replyTo: booking.email,
    });
  }

  if (sent.ok) {
    // Requires elevated rights: guests may create a booking but not mark it
    // confirmation-sent. Without a service role key this is simply skipped.
    const admin = createAdminSupabase();
    if (admin) {
      const { error: stampError } = await admin
        .from("appointments")
        .update({ confirmation_sent_at: new Date().toISOString() })
        .eq("id", result.booking_id);
      if (stampError) {
        console.error("[booking] failed to stamp confirmation_sent_at");
      }
    }
  }

  return {
    ok: true,
    referenceCode: result.booking_reference,
    startsAt: result.booking_starts_at,
    serviceName,
    email: booking.email,
    emailSent: sent.ok,
  };
}

/* -------------------------------------------------------------------------- */
/* Cancel / reschedule                                                        */
/* -------------------------------------------------------------------------- */

export async function cancelBookingAction(
  token: string
): Promise<{ ok: true } | ActionError> {
  const parsed = tokenSchema.safeParse(token);
  if (!parsed.success) return { ok: false, error: "not_found" };

  const supabase = await tryCreateServerSupabase();
  if (!supabase) return { ok: false, error: "generic" };

  const { error } = await supabase.rpc("cancel_booking_by_token", {
    p_token: parsed.data,
  });

  if (error) return { ok: false, error: mapPostgresError(error) };
  return { ok: true };
}

export async function rescheduleBookingAction(
  token: string,
  startsAt: string
): Promise<{ ok: true; startsAt: string } | ActionError> {
  const parsed = rescheduleSchema.safeParse({ token, startsAt });
  if (!parsed.success) return { ok: false, error: "slotRequired" };

  const supabase = await tryCreateServerSupabase();
  if (!supabase) return { ok: false, error: "generic" };

  const { data, error } = await supabase.rpc("reschedule_booking_by_token", {
    p_token: parsed.data.token,
    p_starts_at: new Date(parsed.data.startsAt).toISOString(),
  });

  if (error) return { ok: false, error: mapPostgresError(error) };

  const row = (data as { booking_starts_at: string }[] | null)?.[0];
  if (!row) return { ok: false, error: "generic" };

  return { ok: true, startsAt: row.booking_starts_at };
}
