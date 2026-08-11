import { getLocale, getTranslations, setRequestLocale } from "next-intl/server";
import { createServerSupabase } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { ServicesEditor } from "@/components/admin/ServicesEditor";
import type { ServiceRow } from "@/lib/supabase/types";
import type { Locale } from "@/i18n/routing";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ locale: string }> };

export default async function AdminServicesPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("admin");
  const activeLocale = (await getLocale()) as Locale;

  let services: ServiceRow[] = [];

  if (isSupabaseConfigured()) {
    const supabase = await createServerSupabase();
    // Admin RLS allows reading inactive rows too, which the public site cannot.
    const { data } = await supabase
      .from("services")
      .select("*")
      .order("sort", { ascending: true });
    services = (data ?? []) as ServiceRow[];
  }

  return (
    <div>
      <h1 className="text-xl">{t("servicesTitle")}</h1>
      <p className="mt-3 max-w-2xl text-sm leading-relaxed text-ink-soft">
        {t("servicesLead")}
      </p>

      <div className="mt-10">
        <ServicesEditor services={services} locale={activeLocale} />
      </div>
    </div>
  );
}
