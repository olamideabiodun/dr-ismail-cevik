import type { Metadata } from "next";
import { getLocale, getTranslations, setRequestLocale } from "next-intl/server";
import { Section } from "@/components/ui/Section";
import { ServiceCard } from "@/components/ui/ServiceCard";
import { Reveal, RevealGroup, RevealItem } from "@/components/motion/Reveal";
import { SERVICES } from "@/content/services";
import type { Locale } from "@/i18n/routing";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "treatments" });
  return { title: t("title"), description: t("lead") };
}

export default async function TreatmentsPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("treatments");
  const activeLocale = (await getLocale()) as Locale;

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
            <h1 className="mt-4 max-w-3xl display-lg leading-[1.02]">
              {t("title")}
            </h1>
          </Reveal>
          <Reveal delay={0.1}>
            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-ink-soft">
              {t("lead")}
            </p>
          </Reveal>

          <RevealGroup
            as="ul"
            className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
            stagger={0.05}
          >
            {SERVICES.map((service, index) => (
              <RevealItem as="li" key={service.slug}>
                <ServiceCard
                  service={service}
                  locale={activeLocale}
                  priority={index < 3}
                />
              </RevealItem>
            ))}
          </RevealGroup>
        </div>
      </Section>
    </main>
  );
}
