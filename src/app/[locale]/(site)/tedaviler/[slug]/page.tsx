import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getLocale, getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Figure } from "@/components/ui/Figure";
import { ButtonAnchor, ButtonLink } from "@/components/ui/Button";
import { ServiceCard } from "@/components/ui/ServiceCard";
import { ServiceIcon } from "@/components/ui/ServiceIcon";
import { Reveal, RevealGroup, RevealItem } from "@/components/motion/Reveal";
import { AREA_LABEL, SERVICES, getService } from "@/content/services";
import { CLINIC } from "@/lib/constants";
import type { Locale } from "@/i18n/routing";

type Props = { params: Promise<{ locale: string; slug: string }> };

/** Locale comes from the parent [locale] segment; this supplies the slugs. */
export function generateStaticParams() {
  return SERVICES.map((service) => ({ slug: service.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  const service = getService(slug);
  if (!service) return {};

  const activeLocale = locale as Locale;
  return {
    title: service.name[activeLocale],
    description: service.summary[activeLocale],
    alternates: {
      canonical: `/tedaviler/${slug}`,
      languages: { tr: `/tedaviler/${slug}`, en: `/en/tedaviler/${slug}` },
    },
  };
}

export default async function TreatmentPage({ params }: Props) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const service = getService(slug);
  if (!service) notFound();

  const t = await getTranslations("treatments");
  const tNav = await getTranslations("nav");
  const activeLocale = (await getLocale()) as Locale;

  const related = SERVICES.filter(
    (item) => item.slug !== service.slug && item.icon === service.icon
  ).slice(0, 3);

  const columns = [
    { title: t("whoTitle"), items: service.who[activeLocale], ordered: false },
    {
      title: t("processTitle"),
      items: service.process[activeLocale],
      ordered: true,
    },
  ];

  return (
    <main className="pt-20">
      {/* Dark opening so a treatment page carries the same weight as the home
          hero, with the procedure image doing the work rather than a headline
          on white. */}
      <section className="relative overflow-hidden bg-ink text-white">
        <div className="container-page grid gap-10 py-14 lg:grid-cols-12 lg:items-center lg:gap-16 lg:py-20">
          <div className="lg:col-span-6">
            <Reveal>
              <Link
                href="/tedaviler"
                className="inline-flex items-center gap-2 text-sm text-white/70 transition-colors hover:text-white"
              >
                <span aria-hidden>←</span>
                {t("backToAll")}
              </Link>
            </Reveal>

            <Reveal delay={0.05}>
              <span className="mt-8 inline-flex items-center gap-2 rounded-[var(--radius-pill)] border border-white/20 bg-white/5 px-3 py-1.5 text-xs text-white/85">
                <ServiceIcon name={service.icon} className="h-4 w-4" />
                {AREA_LABEL[service.icon][activeLocale]}
              </span>
            </Reveal>

            <Reveal delay={0.09}>
              <h1 className="mt-5 display-lg text-white">
                {service.name[activeLocale]}
              </h1>
            </Reveal>

            <Reveal delay={0.13}>
              <p className="mt-6 max-w-xl leading-relaxed text-white/80">
                {service.intro[activeLocale]}
              </p>
            </Reveal>

            <Reveal delay={0.17}>
              <div className="mt-9 flex flex-wrap gap-3">
                {/* Pre-selects this treatment in step 1 of the booking wizard. */}
                <ButtonLink
                  href={`/randevu?service=${service.slug}`}
                  variant="onDark"
                >
                  {t("bookCta")}
                </ButtonLink>
                <ButtonAnchor
                  href={`tel:${CLINIC.phoneE164}`}
                  className="tabular border border-white/30 bg-transparent text-white hover:bg-white/10"
                >
                  {CLINIC.phoneDisplay}
                </ButtonAnchor>
              </div>
            </Reveal>
          </div>

          <div className="lg:col-span-6">
            <Reveal delay={0.08}>
              <Figure
                src={service.image}
                alt={service.imageAlt[activeLocale]}
                className="aspect-[4/3] w-full rounded-[var(--radius-image)]"
                sizes="(max-width: 1024px) 100vw, 50vw"
                priority
                placeholderTone="dark"
              />
            </Reveal>
          </div>
        </div>
      </section>

      {/* Who it suits / the process */}
      <section className="section bg-glow relative overflow-hidden bg-bg">
        <div className="container-page grid gap-6 md:grid-cols-2">
          {columns.map((column) => (
            <div key={column.title} className="card p-6 md:p-8">
              <h2 className="display-sm">{column.title}</h2>
              <RevealGroup
                as={column.ordered ? "ol" : "ul"}
                className="mt-6 space-y-4"
                stagger={0.05}
              >
                {column.items.map((item, index) => (
                  <RevealItem
                    as="li"
                    key={index}
                    className="flex gap-3 text-sm leading-relaxed text-ink-soft"
                  >
                    {column.ordered ? (
                      <span className="tabular shrink-0 font-display text-xs text-brand">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                    ) : (
                      <span
                        aria-hidden
                        className="mt-2 h-1 w-1 shrink-0 rounded-full bg-brand"
                      />
                    )}
                    {item}
                  </RevealItem>
                ))}
              </RevealGroup>
            </div>
          ))}
        </div>

        {/* Recovery gets its own full-width block: it is the thing patients
            actually want to know, and it reads as prose, not a list. */}
        <div className="container-page mt-6">
          <div className="card bg-brand-tint p-6 md:p-10">
            <h2 className="display-sm">{t("recoveryTitle")}</h2>
            <p className="mt-5 max-w-3xl text-lg leading-relaxed text-ink-soft">
              {service.recovery[activeLocale]}
            </p>
          </div>
        </div>
      </section>

      {related.length > 0 ? (
        <section className="section bg-grid relative overflow-hidden bg-bg-elevated">
          <div className="container-page">
            <h2 className="display-md">{t("backToAll")}</h2>
            <RevealGroup
              as="ul"
              className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
              stagger={0.06}
            >
              {related.map((item) => (
                <RevealItem as="li" key={item.slug} className="h-full">
                  <ServiceCard service={item} locale={activeLocale} />
                </RevealItem>
              ))}
            </RevealGroup>
          </div>
        </section>
      ) : (
        <section className="section bg-bg-elevated">
          <div className="container-page text-center">
            <h2 className="display-md">{tNav("book")}</h2>
            <div className="mt-8">
              <ButtonLink href={`/randevu?service=${service.slug}`} size="lg">
                {t("bookCta")}
              </ButtonLink>
            </div>
          </div>
        </section>
      )}
    </main>
  );
}
