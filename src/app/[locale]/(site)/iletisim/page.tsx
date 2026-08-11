import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Reveal, RevealGroup, RevealItem } from "@/components/motion/Reveal";
import { ButtonAnchor, ButtonLink } from "@/components/ui/Button";
import {
  CLINIC,
  DOCTOR,
  MAPS_DIRECTIONS_URL,
  MAPS_EMBED_URL,
  whatsappUrl,
} from "@/lib/constants";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "contact" });
  return { title: t("title"), description: t("lead") };
}

export default async function ContactPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("contact");
  const tNav = await getTranslations("nav");

  const hours = [
    { label: t("hoursWeekday"), value: t("hoursWeekdayValue") },
    { label: t("hoursSaturday"), value: t("hoursSaturdayValue") },
    { label: t("hoursSunday"), value: t("hoursSundayValue") },
  ];

  return (
    <main className="pt-20">
      <section className="section bg-glow relative overflow-hidden bg-bg">
        <div className="container-page">
          <div className="max-w-2xl">
            <Reveal>
              <p className="text-xs font-medium uppercase tracking-[0.18em] text-brand">
                {t("eyebrow")}
              </p>
            </Reveal>
            <Reveal delay={0.05}>
              <h1 className="mt-4 display-lg">{t("title")}</h1>
            </Reveal>
            <Reveal delay={0.1}>
              <p className="mt-5 text-lg leading-relaxed text-ink-soft">
                {t("lead")}
              </p>
            </Reveal>
          </div>

          {/* The three things someone on this page is actually looking for. */}
          <RevealGroup
            as="ul"
            className="mt-12 grid gap-6 md:grid-cols-3"
            stagger={0.06}
          >
            <RevealItem as="li" className="h-full">
              <div className="card flex h-full flex-col p-6">
                <h2 className="text-xs font-medium uppercase tracking-[0.16em] text-muted">
                  {t("phoneTitle")}
                </h2>
                <a
                  href={`tel:${CLINIC.phoneE164}`}
                  className="tabular mt-3 font-display display-sm text-ink transition-colors hover:text-brand"
                >
                  {CLINIC.phoneDisplay}
                </a>
                <div className="mt-auto pt-6">
                  <ButtonAnchor
                    href={whatsappUrl(t("whatsappMessage"))}
                    target="_blank"
                    rel="noopener noreferrer"
                    variant="secondary"
                    size="sm"
                  >
                    {t("whatsapp")}
                  </ButtonAnchor>
                </div>
              </div>
            </RevealItem>

            <RevealItem as="li" className="h-full">
              <div className="card flex h-full flex-col p-6">
                <h2 className="text-xs font-medium uppercase tracking-[0.16em] text-muted">
                  {t("addressTitle")}
                </h2>
                <address className="mt-3 not-italic leading-relaxed text-ink">
                  {CLINIC.name}
                  <span className="mt-1 block text-sm text-ink-soft">
                    {CLINIC.addressLocality} / {CLINIC.addressRegion}
                  </span>
                </address>
                <div className="mt-auto pt-6">
                  <a
                    href={MAPS_DIRECTIONS_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-medium text-brand hover:underline"
                  >
                    {t("directions")} →
                  </a>
                </div>
              </div>
            </RevealItem>

            <RevealItem as="li" className="h-full">
              <div className="card flex h-full flex-col p-6">
                <h2 className="text-xs font-medium uppercase tracking-[0.16em] text-muted">
                  {t("hoursTitle")}
                </h2>
                <dl className="mt-3 space-y-2">
                  {hours.map((row) => (
                    <div
                      key={row.label}
                      className="flex items-baseline justify-between gap-4 border-b border-line pb-2 last:border-0"
                    >
                      <dt className="text-sm text-ink-soft">{row.label}</dt>
                      <dd className="tabular text-sm text-ink">{row.value}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            </RevealItem>
          </RevealGroup>

          <Reveal delay={0.1}>
            <div className="card mt-6 overflow-hidden">
              <iframe
                src={MAPS_EMBED_URL}
                title={t("mapLabel")}
                loading="lazy"
                // Below the fold and third-party: keep it off the critical path
                // and give it no referrer beyond the origin.
                referrerPolicy="no-referrer-when-downgrade"
                className="aspect-[16/10] w-full border-0 md:aspect-[21/8]"
                allowFullScreen
              />
            </div>
          </Reveal>

          <Reveal delay={0.12}>
            <div className="card mt-6 flex flex-col items-start justify-between gap-6 bg-ink p-8 text-white sm:flex-row sm:items-center md:p-10">
              <div>
                <h2 className="display-sm text-white">{tNav("book")}</h2>
                <p className="mt-2 max-w-md text-sm text-white/70">
                  {t("lead")}
                </p>
              </div>
              <div className="flex shrink-0 flex-wrap gap-3">
                <ButtonLink href="/randevu" variant="onDark">
                  {tNav("book")}
                </ButtonLink>
                <ButtonAnchor
                  href={DOCTOR.instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="border border-white/30 bg-transparent text-white hover:bg-white/10"
                >
                  @{DOCTOR.instagramHandle}
                </ButtonAnchor>
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </main>
  );
}
