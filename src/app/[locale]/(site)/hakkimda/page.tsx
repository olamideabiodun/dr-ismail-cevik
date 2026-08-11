import type { Metadata } from "next";
import { getLocale, getTranslations, setRequestLocale } from "next-intl/server";
import { Figure } from "@/components/ui/Figure";
import { ButtonAnchor, ButtonLink } from "@/components/ui/Button";
import { Reveal, RevealGroup, RevealItem } from "@/components/motion/Reveal";
import { BIO_FOCUS, EDUCATION, MEMBERSHIPS } from "@/content/site";
import { CLINIC, DOCTOR } from "@/lib/constants";
import type { Locale } from "@/i18n/routing";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "about" });
  // The layout template appends "— Op. Dr. İsmail Çevik", and about.title IS
  // his name, which rendered "Op. Dr. İsmail Çevik — Op. Dr. İsmail Çevik".
  return { title: t("eyebrow"), description: t("bioLead") };
}

export default async function AboutPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("about");
  const activeLocale = (await getLocale()) as Locale;

  return (
    <main className="pt-20">
      {/* Portrait and introduction, on the dark ground so the page opens with
          the same weight as the home hero rather than starting on white. */}
      <section className="relative overflow-hidden bg-ink text-white">
        <div className="container-page grid gap-10 py-16 lg:grid-cols-12 lg:items-center lg:gap-16 lg:py-24">
          <div className="lg:col-span-5">
            <Reveal>
              <Figure
                src="/assets/about/portrait.jpg"
                alt={t("portraitAlt")}
                className="aspect-[4/5] w-full rounded-[var(--radius-image)]"
                sizes="(max-width: 1024px) 100vw, 40vw"
                priority
                quality={90}
                placeholderTone="dark"
              />
            </Reveal>
          </div>

          <div className="lg:col-span-7">
            <Reveal>
              <p className="text-xs font-medium uppercase tracking-[0.18em] text-brand-300">
                {t("eyebrow")}
              </p>
            </Reveal>

            <Reveal delay={0.05}>
              <h1 className="mt-4 display-lg text-white">{t("title")}</h1>
            </Reveal>

            <Reveal delay={0.1}>
              <p className="mt-3 text-brand-300">{t("role")}</p>
            </Reveal>

            <Reveal delay={0.14}>
              <p className="mt-7 max-w-xl leading-relaxed text-white/80">
                {t("bioLead")}
              </p>
            </Reveal>

            {/* Straight from his Instagram bio — verified first-party content. */}
            <Reveal delay={0.18}>
              <ul className="mt-8 flex flex-wrap gap-2">
                {BIO_FOCUS.map((focus) => (
                  <li
                    key={focus.tr}
                    className="rounded-[var(--radius-pill)] border border-white/20 bg-white/5 px-3.5 py-1.5 text-xs text-white/85"
                  >
                    {focus[activeLocale]}
                  </li>
                ))}
              </ul>
            </Reveal>

            <Reveal delay={0.22}>
              <div className="mt-9 flex flex-wrap gap-3">
                <ButtonLink href="/randevu" variant="onDark">
                  {t("bookCta")}
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
            </Reveal>
          </div>
        </div>
      </section>

      {/* Approach */}
      <section className="section bg-glow relative overflow-hidden bg-bg">
        <div className="container-page grid gap-10 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <Reveal>
              <h2 className="display-md">{t("approachTitle")}</h2>
            </Reveal>
          </div>
          <div className="lg:col-span-8">
            <Reveal delay={0.06}>
              <p className="max-w-2xl text-lg leading-relaxed text-ink-soft">
                {t("approachBody")}
              </p>
            </Reveal>
          </div>
        </div>
      </section>

      {/* Training and memberships */}
      <section className="section bg-grid relative overflow-hidden bg-bg-elevated">
        <div className="container-page grid gap-10 md:grid-cols-2 md:gap-8">
          <div>
            <h2 className="display-sm">{t("educationTitle")}</h2>
            <RevealGroup as="ol" className="mt-7 space-y-3">
              {EDUCATION.map((entry, index) => (
                <RevealItem as="li" key={index}>
                  <div className="card flex items-start gap-4 p-5">
                    <span className="tabular shrink-0 rounded-[var(--radius-pill)] bg-brand-tint px-2.5 py-1 font-display text-xs text-brand">
                      {entry.year}
                    </span>
                    <span className="text-sm leading-relaxed text-ink-soft">
                      {entry.label[activeLocale]}
                    </span>
                  </div>
                </RevealItem>
              ))}
            </RevealGroup>
          </div>

          <div>
            <h2 className="display-sm">{t("membershipsTitle")}</h2>
            <RevealGroup as="ul" className="mt-7 space-y-3">
              {MEMBERSHIPS.map((entry, index) => (
                <RevealItem as="li" key={index}>
                  <div className="card p-5 text-sm leading-relaxed text-ink-soft">
                    {entry[activeLocale]}
                  </div>
                </RevealItem>
              ))}
            </RevealGroup>

            <Reveal>
              <div className="card mt-8 p-6">
                <p className="font-display display-xs text-ink">
                  {CLINIC.name}
                </p>
                <p className="mt-2 text-sm text-ink-soft">
                  {CLINIC.addressLocality} / {CLINIC.addressRegion}
                </p>
                <a
                  href={`tel:${CLINIC.phoneE164}`}
                  className="tabular mt-3 inline-block text-sm font-medium text-brand hover:underline"
                >
                  {CLINIC.phoneDisplay}
                </a>
              </div>
            </Reveal>
          </div>
        </div>
      </section>
    </main>
  );
}
