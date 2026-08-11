import { getTranslations, setRequestLocale } from "next-intl/server";
import { createServerSupabase } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { AvailabilityEditor } from "@/components/admin/AvailabilityEditor";
import { todayKey } from "@/lib/booking/time";
import type {
  AvailabilityExceptionRow,
  AvailabilityRuleRow,
} from "@/lib/supabase/types";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ locale: string }> };

export default async function AdminAvailabilityPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("admin");

  let rules: AvailabilityRuleRow[] = [];
  let exceptions: AvailabilityExceptionRow[] = [];

  if (isSupabaseConfigured()) {
    const supabase = await createServerSupabase();
    const [rulesResult, exceptionsResult] = await Promise.all([
      supabase
        .from("availability_rules")
        .select("*")
        .order("weekday", { ascending: true })
        .order("start_time", { ascending: true }),
      supabase
        .from("availability_exceptions")
        .select("*")
        // Past exceptions are noise; the calendar only looks forward.
        .gte("date", todayKey())
        .order("date", { ascending: true }),
    ]);

    rules = (rulesResult.data ?? []) as AvailabilityRuleRow[];
    exceptions = (exceptionsResult.data ?? []) as AvailabilityExceptionRow[];
  }

  return (
    <div>
      <h1 className="text-xl">{t("availabilityTitle")}</h1>
      <p className="mt-3 max-w-2xl text-sm leading-relaxed text-ink-soft">
        {t("availabilityLead")}
      </p>

      <div className="mt-10">
        <AvailabilityEditor rules={rules} exceptions={exceptions} />
      </div>
    </div>
  );
}
