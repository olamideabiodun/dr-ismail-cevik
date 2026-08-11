import { getTranslations } from "next-intl/server";
import { Figure } from "@/components/ui/Figure";
import { RevealGroup, RevealItem } from "@/components/motion/Reveal";

/**
 * "Neden Ben" — four claims, each carrying a supporting image.
 *
 * These used to be numbered 01–04. The numbering was removed: they are four
 * independent reasons, not a sequence, so the numerals encoded nothing and just
 * borrowed the look of a process list.
 */
export async function TrustSection() {
  const t = await getTranslations("home.trust");

  const items = [
    {
      title: t("item1Title"),
      body: t("item1Body"),
      image: "/assets/trust/breathing.jpg",
      alt: t("item1Title"),
    },
    {
      title: t("item2Title"),
      body: t("item2Body"),
      image: "/assets/trust/piezo.jpg",
      alt: t("item2Title"),
    },
    {
      title: t("item3Title"),
      body: t("item3Body"),
      image: "/assets/trust/continuity.jpg",
      alt: t("item3Title"),
    },
    {
      title: t("item4Title"),
      body: t("item4Body"),
      image: "/assets/trust/expectations.jpg",
      alt: t("item4Title"),
    },
  ];

  return (
    <section className="section bg-grid relative overflow-hidden bg-bg-elevated">
      <div className="container-page">
        <div className="max-w-2xl">
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-brand">
            {t("ghost")}
          </p>
          <h2 className="mt-4 display-md">{t("title")}</h2>
        </div>

        <RevealGroup
          as="ul"
          className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4"
          stagger={0.06}
        >
          {items.map((item) => (
            <RevealItem as="li" key={item.title} className="h-full">
              <article className="card flex h-full flex-col">
                <div className="card-media overflow-hidden">
                  <Figure
                    src={item.image}
                    alt={item.alt}
                    className="aspect-[4/3] w-full"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  />
                </div>
                <div className="flex flex-1 flex-col p-5">
                  <h3 className="font-display display-xs leading-snug text-ink">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-[0.875rem] leading-relaxed text-ink-soft">
                    {item.body}
                  </p>
                </div>
              </article>
            </RevealItem>
          ))}
        </RevealGroup>
      </div>
    </section>
  );
}
