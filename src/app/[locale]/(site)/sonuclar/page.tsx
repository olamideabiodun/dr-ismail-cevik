import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Section } from "@/components/ui/Section";
import { Reveal } from "@/components/motion/Reveal";
import { ResultsGallery } from "@/components/results/ResultsGallery";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "results" });
  return {
    title: t("title"),
    description: t("lead"),
    // Before/after clinical imagery should not be indexed as ad content.
    robots: { index: false, follow: true },
  };
}

export default async function ResultsPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("results");

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

          <div className="mt-14">
            <ResultsGallery />
          </div>

          <p className="mt-16 max-w-3xl border-t border-line pt-8 text-xs leading-relaxed text-muted">
            {t("disclaimer")}
          </p>
        </div>
      </Section>
    </main>
  );
}
