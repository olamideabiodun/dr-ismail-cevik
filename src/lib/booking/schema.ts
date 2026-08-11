import { z } from "zod";

/**
 * Validation for everything the booking flow accepts.
 *
 * Error messages are i18n KEYS, not sentences — the client maps them through
 * the `errors` namespace so a Turkish visitor never sees an English validator
 * message. Keep them in sync with messages/*.json.
 *
 * This is the first of three layers: Zod here, then the checks inside
 * public.create_booking(), then the table CHECK constraints. Each one assumes
 * the others might be bypassed.
 */

const slugPattern = /^[a-z0-9-]+$/;

/** Permissive on formatting, strict on substance: at least 10 actual digits. */
const phonePattern = /^[0-9+()\-\s]{10,40}$/;

export const bookingInputSchema = z.object({
  serviceSlug: z
    .string()
    .trim()
    .min(1, "serviceRequired")
    .max(64, "serviceRequired")
    .regex(slugPattern, "serviceRequired"),

  startsAt: z
    .string()
    .refine((value) => !Number.isNaN(Date.parse(value)), "slotRequired"),

  name: z
    .string()
    .trim()
    .min(2, "nameTooShort")
    .max(120, "nameTooLong"),

  email: z.email("emailInvalid").max(200, "emailInvalid"),

  phone: z
    .string()
    .trim()
    .max(40, "phoneInvalid")
    .refine(
      (value) =>
        value === "" ||
        (phonePattern.test(value) &&
          value.replace(/\D/g, "").length >= 10),
      "phoneInvalid"
    )
    .optional()
    .default(""),

  notes: z
    .string()
    .trim()
    .max(1000, "notesTooLong")
    .optional()
    .default(""),

  // A checkbox that must be ticked — `false` is a validation failure, not a
  // falsy default (KVKK consent, see src/content/legal.ts).
  consent: z.literal(true, "consentRequired"),

  locale: z.enum(["tr", "en"]).default("tr"),
});

export type BookingInput = z.infer<typeof bookingInputSchema>;

/**
 * Client-side schema for step 3 only.
 *
 * Identical rules to the server schema, but `consent` is typed as a plain
 * boolean rather than `z.literal(true)`. A checkbox input is a boolean before
 * it is ticked, and `literal(true)` would make react-hook-form's inferred field
 * type `true`, which no unchecked checkbox can satisfy.
 */
export const detailsFormSchema = z.object({
  name: bookingInputSchema.shape.name,
  email: bookingInputSchema.shape.email,
  phone: z
    .string()
    .trim()
    .max(40, "phoneInvalid")
    .refine(
      (value) =>
        value === "" ||
        (phonePattern.test(value) && value.replace(/\D/g, "").length >= 10),
      "phoneInvalid"
    ),
  notes: z.string().trim().max(1000, "notesTooLong"),
  consent: z.boolean().refine((value) => value === true, "consentRequired"),
});

export type DetailsFormValues = z.infer<typeof detailsFormSchema>;

export const slotQuerySchema = z.object({
  serviceSlug: z.string().trim().min(1).max(64).regex(slugPattern),
  /** Local calendar date in Europe/Istanbul, formatted yyyy-MM-dd. */
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});

export const tokenSchema = z.uuid("not_found");

export const rescheduleSchema = z.object({
  token: tokenSchema,
  startsAt: z
    .string()
    .refine((value) => !Number.isNaN(Date.parse(value)), "slotRequired"),
});

/** Error codes raised by the Postgres functions, mapped 1:1 to message keys. */
export const BOOKING_ERROR_CODES = [
  "service_not_found",
  "in_past",
  "too_soon",
  "too_far",
  "day_closed",
  "slot_unavailable",
  "rate_limited",
  "not_found",
  "already_cancelled",
  "already_started",
] as const;

export type BookingErrorCode = (typeof BOOKING_ERROR_CODES)[number];

export function isBookingErrorCode(value: string): value is BookingErrorCode {
  return (BOOKING_ERROR_CODES as readonly string[]).includes(value);
}

/**
 * Postgres surfaces `RAISE EXCEPTION 'slot_unavailable'` through PostgREST with
 * the bare code in `message`. Anything we do not recognise is deliberately
 * flattened to "generic" so internal detail never reaches the patient.
 */
export function toErrorKey(message: string | undefined): string {
  if (!message) return "generic";
  const trimmed = message.trim();
  return isBookingErrorCode(trimmed) ? trimmed : "generic";
}
