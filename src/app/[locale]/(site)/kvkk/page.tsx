import type { Metadata } from "next";
import { getLocale, setRequestLocale } from "next-intl/server";
import { Section } from "@/components/ui/Section";
import { Reveal } from "@/components/motion/Reveal";
import { KVKK_INTRO, KVKK_SECTIONS, KVKK_TITLE } from "@/content/legal";
import type { Locale } from "@/i18n/routing";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const activeLocale = locale as Locale;
  return {
    title: KVKK_TITLE[activeLocale] ?? KVKK_TITLE.tr,
    description: KVKK_INTRO[activeLocale] ?? KVKK_INTRO.tr,
    robots: { index: true, follow: true },
  };
}

export default async function KvkkPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const activeLocale = (await getLocale()) as Locale;

  return (
    <main className="pt-20">
      <Section tone="base" className="bg-glow overflow-hidden">
        <div className="container-page">
          <Reveal>
            <h1 className="max-w-3xl display-md leading-[1.05]">
              {KVKK_TITLE[activeLocale]}
            </h1>
          </Reveal>

          <Reveal delay={0.05}>
            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-ink-soft">
              {KVKK_INTRO[activeLocale]}
            </p>
          </Reveal>

          <div className="prose-clinic mt-14">
            {KVKK_SECTIONS.map((section, index) => (
              <section key={index}>
                <h2>{section.heading[activeLocale]}</h2>
                {section.body.map((paragraph, pIndex) => (
                  <p key={pIndex}>{paragraph[activeLocale]}</p>
                ))}
              </section>
            ))}
          </div>
        </div>
      </Section>
    </main>
  );
}
