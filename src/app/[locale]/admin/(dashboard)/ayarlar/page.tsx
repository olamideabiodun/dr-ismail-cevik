import { getTranslations, setRequestLocale } from "next-intl/server";
import { SettingsForm } from "@/components/admin/SettingsForm";
import { getBookingSettings } from "@/lib/booking/queries";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ locale: string }> };

export default async function AdminSettingsPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("admin");
  const settings = await getBookingSettings();

  return (
    <div>
      <h1 className="text-xl">{t("settingsTitle")}</h1>
      <p className="mt-3 max-w-2xl text-sm leading-relaxed text-ink-soft">
        {t("settingsLead")}
      </p>

      <div className="mt-10 max-w-xl">
        <SettingsForm settings={settings} />
      </div>
    </div>
  );
}
