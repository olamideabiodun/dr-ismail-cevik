"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createServerSupabase } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";

/**
 * Admin mutations.
 *
 * These use the request-scoped ANON client carrying the signed-in admin's
 * session — never the service role. That means every statement is still filtered
 * by the RLS policies, so a bug here cannot turn into a privilege escalation:
 * the worst case is a query that returns nothing.
 *
 * `assertAdmin()` exists for clear error messages, not for security.
 */

type Result = { ok: true } | { ok: false; error: string };

async function getAdminClient() {
  if (!isSupabaseConfigured()) return null;
  const supabase = await createServerSupabase();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: adminRow } = await supabase
    .from("admins")
    .select("user_id")
    .eq("user_id", user.id)
    .maybeSingle();

  return adminRow ? supabase : null;
}

function refreshAdmin() {
  // Admin pages read live data; re-render every admin route after a write.
  revalidatePath("/admin", "layout");
}

/* -------------------------------------------------------------------------- */
/* Appointments                                                               */
/* -------------------------------------------------------------------------- */

const statusSchema = z.enum([
  "pending",
  "confirmed",
  "cancelled",
  "completed",
]);

export async function updateAppointmentStatus(
  id: string,
  status: string
): Promise<Result> {
  const parsedId = z.uuid().safeParse(id);
  const parsedStatus = statusSchema.safeParse(status);
  if (!parsedId.success || !parsedStatus.success) {
    return { ok: false, error: "generic" };
  }

  const supabase = await getAdminClient();
  if (!supabase) return { ok: false, error: "notAuthorized" };

  const { error } = await supabase
    .from("appointments")
    .update({
      status: parsedStatus.data,
      cancelled_at:
        parsedStatus.data === "cancelled" ? new Date().toISOString() : null,
    })
    .eq("id", parsedId.data);

  if (error) return { ok: false, error: "generic" };

  refreshAdmin();
  return { ok: true };
}

/* -------------------------------------------------------------------------- */
/* Weekly availability                                                        */
/* -------------------------------------------------------------------------- */

const timePattern = /^([01]\d|2[0-3]):[0-5]\d$/;

const ruleSchema = z
  .object({
    weekday: z.coerce.number().int().min(0).max(6),
    startTime: z.string().regex(timePattern),
    endTime: z.string().regex(timePattern),
  })
  // Mirrors the availability_rules_time_order CHECK constraint, so the user
  // gets a form error instead of a database error.
  .refine((value) => value.endTime > value.startTime, {
    message: "generic",
    path: ["endTime"],
  });

export async function createAvailabilityRule(
  input: unknown
): Promise<Result> {
  const parsed = ruleSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "generic" };

  const supabase = await getAdminClient();
  if (!supabase) return { ok: false, error: "notAuthorized" };

  const { error } = await supabase.from("availability_rules").insert({
    weekday: parsed.data.weekday,
    start_time: parsed.data.startTime,
    end_time: parsed.data.endTime,
    active: true,
  });

  if (error) return { ok: false, error: "generic" };

  refreshAdmin();
  return { ok: true };
}

export async function deleteAvailabilityRule(id: string): Promise<Result> {
  const parsed = z.uuid().safeParse(id);
  if (!parsed.success) return { ok: false, error: "generic" };

  const supabase = await getAdminClient();
  if (!supabase) return { ok: false, error: "notAuthorized" };

  const { error } = await supabase
    .from("availability_rules")
    .delete()
    .eq("id", parsed.data);

  if (error) return { ok: false, error: "generic" };

  refreshAdmin();
  return { ok: true };
}

/* -------------------------------------------------------------------------- */
/* Exceptions                                                                 */
/* -------------------------------------------------------------------------- */

const exceptionSchema = z
  .object({
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    isClosed: z.boolean(),
    startTime: z.string().optional().default(""),
    endTime: z.string().optional().default(""),
    note: z.string().max(200).optional().default(""),
  })
  .refine(
    (value) =>
      value.isClosed ||
      (timePattern.test(value.startTime) &&
        timePattern.test(value.endTime) &&
        value.endTime > value.startTime),
    { message: "generic", path: ["endTime"] }
  );

export async function createAvailabilityException(
  input: unknown
): Promise<Result> {
  const parsed = exceptionSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "generic" };

  const supabase = await getAdminClient();
  if (!supabase) return { ok: false, error: "notAuthorized" };

  const { error } = await supabase.from("availability_exceptions").insert({
    date: parsed.data.date,
    is_closed: parsed.data.isClosed,
    // The CHECK constraint requires both times to be NULL on a closed day.
    start_time: parsed.data.isClosed ? null : parsed.data.startTime,
    end_time: parsed.data.isClosed ? null : parsed.data.endTime,
    note: parsed.data.note || null,
  });

  if (error) return { ok: false, error: "generic" };

  refreshAdmin();
  return { ok: true };
}

export async function deleteAvailabilityException(
  id: string
): Promise<Result> {
  const parsed = z.uuid().safeParse(id);
  if (!parsed.success) return { ok: false, error: "generic" };

  const supabase = await getAdminClient();
  if (!supabase) return { ok: false, error: "notAuthorized" };

  const { error } = await supabase
    .from("availability_exceptions")
    .delete()
    .eq("id", parsed.data);

  if (error) return { ok: false, error: "generic" };

  refreshAdmin();
  return { ok: true };
}

/* -------------------------------------------------------------------------- */
/* Services                                                                   */
/* -------------------------------------------------------------------------- */

const serviceSchema = z.object({
  slug: z.string().min(1).max(64),
  durationMin: z.coerce.number().int().min(5).max(480),
  bufferMin: z.coerce.number().int().min(0).max(240),
  active: z.boolean(),
});

export async function updateService(input: unknown): Promise<Result> {
  const parsed = serviceSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "generic" };

  const supabase = await getAdminClient();
  if (!supabase) return { ok: false, error: "notAuthorized" };

  const { error } = await supabase
    .from("services")
    .update({
      duration_min: parsed.data.durationMin,
      buffer_min: parsed.data.bufferMin,
      active: parsed.data.active,
    })
    .eq("slug", parsed.data.slug);

  if (error) return { ok: false, error: "generic" };

  refreshAdmin();
  // The public treatment pages read `active` too.
  revalidatePath("/", "layout");
  return { ok: true };
}

/* -------------------------------------------------------------------------- */
/* Settings                                                                   */
/* -------------------------------------------------------------------------- */

const settingsSchema = z.object({
  slotIntervalMin: z.coerce.number().int().min(5).max(240),
  minNoticeHours: z.coerce.number().int().min(0).max(720),
  maxAdvanceDays: z.coerce.number().int().min(1).max(365),
});

export async function updateSettings(input: unknown): Promise<Result> {
  const parsed = settingsSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "generic" };

  const supabase = await getAdminClient();
  if (!supabase) return { ok: false, error: "notAuthorized" };

  const { error } = await supabase
    .from("admin_settings")
    .update({
      slot_interval_min: parsed.data.slotIntervalMin,
      min_notice_hours: parsed.data.minNoticeHours,
      max_advance_days: parsed.data.maxAdvanceDays,
      updated_at: new Date().toISOString(),
    })
    .eq("id", true);

  if (error) return { ok: false, error: "generic" };

  refreshAdmin();
  return { ok: true };
}

/* -------------------------------------------------------------------------- */
/* Session                                                                    */
/* -------------------------------------------------------------------------- */

export async function signOutAction(): Promise<Result> {
  if (!isSupabaseConfigured()) return { ok: false, error: "generic" };
  const supabase = await createServerSupabase();
  await supabase.auth.signOut();
  refreshAdmin();
  return { ok: true };
}
