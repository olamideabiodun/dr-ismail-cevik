import type { Metadata } from "next";
import { getLocale, getTranslations, setRequestLocale } from "next-intl/server";
import { Section } from "@/components/ui/Section";
import { Reveal } from "@/components/motion/Reveal";
import { ButtonAnchor } from "@/components/ui/Button";
import { BookingWizard } from "@/components/booking/BookingWizard";
import { getBookableServices, getBookingSettings } from "@/lib/booking/queries";
import { CLINIC } from "@/lib/constants";
import type { Locale } from "@/i18n/routing";

type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ service?: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "booking" });
  return {
    title: t("title"),
    description: t("lead"),
    // Booking is a transaction, not a landing page; keep it out of the index
    // so search traffic arrives on the treatment pages instead.
    robots: { index: false, follow: true },
  };
}

export default async function BookingPage({ params, searchParams }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const { service } = await searchParams;
  const t = await getTranslations("booking");
  const activeLocale = (await getLocale()) as Locale;

  const [services, settings] = await Promise.all([
    getBookableServices(activeLocale),
    getBookingSettings(),
  ]);

  const configured = services !== null && services.length > 0;

  return (
    <main className="pt-20">
      <Section tone="base" className="bg-glow overflow-hidden">
        <div className="container-page">
          <Reveal>
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-brand">
              {t("eyebrow")}
            </p>
          </Reveal>
          <Reveal delay={0.05}>
            <h1 className="mt-4 display-lg leading-[1.02]">
              {t("title")}
            </h1>
          </Reveal>
          <Reveal delay={0.1}>
            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-ink-soft">
              {t("lead")}
            </p>
          </Reveal>

          <div className="mt-14 max-w-3xl">
            {configured ? (
              <BookingWizard
                services={services}
                maxAdvanceDays={settings.maxAdvanceDays}
                initialServiceSlug={service}
              />
            ) : (
              /* Rendered before Supabase is wired up, or if the services table
                 is empty. The patient still gets a way through — the phone. */
              <div className="rounded-[var(--radius-card)] border border-line bg-bg-elevated p-8 md:p-10">
                <h2 className="text-xl">{t("notConfiguredTitle")}</h2>
                <p className="mt-4 max-w-lg leading-relaxed text-ink-soft">
                  {t("notConfiguredBody")}
                </p>
                <div className="mt-7">
                  <ButtonAnchor href={`tel:${CLINIC.phoneE164}`} size="lg">
                    <span className="tabular">{CLINIC.phoneDisplay}</span>
                  </ButtonAnchor>
                </div>
                {process.env.NODE_ENV === "development" ? (
                  <p className="mt-6 rounded-[var(--radius-input)] bg-brand-tint px-4 py-3 font-mono text-xs text-brand-600">
                    Dev note: set NEXT_PUBLIC_SUPABASE_URL /
                    NEXT_PUBLIC_SUPABASE_ANON_KEY and run the migrations + seed.
                    See README.md.
                  </p>
                ) : null}
              </div>
            )}
          </div>
        </div>
      </Section>
    </main>
  );
}
