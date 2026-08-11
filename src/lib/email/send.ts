import "server-only";

import { Resend } from "resend";

/**
 * Thin Resend wrapper.
 *
 * Sending is always treated as best-effort: a booking that is safely in the
 * database must never be reported as failed because an email provider had a bad
 * minute. Callers get `{ ok: false }` and show the reference code on screen
 * instead (see BUILD_PROMPT "If email fails").
 *
 * Nothing here logs a recipient address, a name or a note. Those are patient
 * PII and must not end up in a hosting provider's log drain.
 */

const FALLBACK_FROM = "Randevu <onboarding@resend.dev>";

export type SendResult = { ok: boolean; reason?: string };

export async function sendEmail({
  to,
  subject,
  html,
  text,
  replyTo,
}: {
  to: string;
  subject: string;
  html: string;
  text: string;
  replyTo?: string;
}): Promise<SendResult> {
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    // Expected before the owner configures Resend — a warning, not an error.
    console.warn("[email] RESEND_API_KEY is not set; skipping send.");
    return { ok: false, reason: "not_configured" };
  }

  const from = process.env.BOOKING_FROM_EMAIL || FALLBACK_FROM;

  try {
    const resend = new Resend(apiKey);
    const { error } = await resend.emails.send({
      from,
      to,
      subject,
      html,
      text,
      replyTo,
    });

    if (error) {
      console.error("[email] send failed:", error.name);
      return { ok: false, reason: error.name };
    }

    return { ok: true };
  } catch (caught) {
    console.error(
      "[email] send threw:",
      caught instanceof Error ? caught.name : "UnknownError"
    );
    return { ok: false, reason: "exception" };
  }
}
