import { getLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Section, SectionHeader } from "@/components/ui/Section";
import { ServiceCard } from "@/components/ui/ServiceCard";
import { RevealGroup, RevealItem } from "@/components/motion/Reveal";
import { FEATURED_SERVICES } from "@/content/services";
import type { Locale } from "@/i18n/routing";

export async function ServicesGrid() {
  const t = await getTranslations("home.services");
  const locale = (await getLocale()) as Locale;

  return (
    <Section tone="base" className="overflow-hidden">
      <div className="container-page">
        <SectionHeader
          ghost={t("ghost")}
          title={t("title")}
          lead={t("lead")}
          className="mb-14"
        />

        <RevealGroup
          as="ul"
          className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
          stagger={0.06}
        >
          {FEATURED_SERVICES.map((service) => (
            <RevealItem as="li" key={service.slug}>
              <ServiceCard service={service} locale={locale} />
            </RevealItem>
          ))}
        </RevealGroup>

        <div className="mt-12">
          <Link
            href="/tedaviler"
            className="inline-flex items-center gap-2 text-sm font-medium text-brand hover:underline"
          >
            {t("all")}
            <span aria-hidden>→</span>
          </Link>
        </div>
      </div>
    </Section>
  );
}
