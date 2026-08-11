import { getLocale, getTranslations } from "next-intl/server";
import { Figure } from "@/components/ui/Figure";
import { RevealGroup, RevealItem } from "@/components/motion/Reveal";
import { TESTIMONIALS } from "@/content/site";
import { getService } from "@/content/services";
import type { Locale } from "@/i18n/routing";

/**
 * Patient quotes.
 *
 * The image on each card is the TREATMENT, not the patient. Stock portraits
 * standing in for real people would be dishonest on a medical site, and real
 * patient photographs would need their own consent on top of the quote's. The
 * treatment thumbnail is true, relevant, and tells the reader which procedure
 * the quote is actually about.
 */
export async function Testimonials() {
  const t = await getTranslations("home.testimonials");
  const locale = (await getLocale()) as Locale;

  return (
    <section className="section bg-glow relative overflow-hidden bg-bg">
      <div className="container-page">
        <div className="max-w-2xl">
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-brand">
            {t("ghost")}
          </p>
          <h2 className="mt-4 display-md">{t("title")}</h2>
        </div>

        <RevealGroup
          as="ul"
          className="mt-12 grid gap-6 md:grid-cols-3"
          stagger={0.08}
        >
          {TESTIMONIALS.map((item) => {
            const service = getService(item.serviceSlug);
            return (
              <RevealItem as="li" key={item.id} className="h-full">
                <figure className="card flex h-full flex-col p-6">
                  <svg
                    aria-hidden
                    viewBox="0 0 24 24"
                    className="h-6 w-6 text-brand-300"
                    fill="currentColor"
                  >
                    <path d="M9.5 6C6.5 7.5 5 10 5 13v5h6v-6H8.2c0-2 .8-3.4 2.6-4.4L9.5 6Zm9 0c-3 1.5-4.5 4-4.5 7v5h6v-6h-2.8c0-2 .8-3.4 2.6-4.4L18.5 6Z" />
                  </svg>

                  <blockquote className="mt-4 flex-1 text-[0.9375rem] leading-relaxed text-ink">
                    {item.quote[locale]}
                  </blockquote>

                  <figcaption className="mt-6 flex items-center gap-3 border-t border-line pt-4">
                    {service ? (
                      <Figure
                        src={service.image}
                        alt={service.imageAlt[locale]}
                        className="h-10 w-10 shrink-0 rounded-[var(--radius-input)]"
                        sizes="40px"
                      />
                    ) : null}
                    <span className="min-w-0">
                      <span className="block text-sm font-medium text-ink">
                        {item.attribution}
                      </span>
                      {service ? (
                        <span className="block truncate text-xs text-muted">
                          {service.name[locale]}
                        </span>
                      ) : null}
                    </span>
                  </figcaption>
                </figure>
              </RevealItem>
            );
          })}
        </RevealGroup>

        <p className="mt-8 max-w-2xl text-xs leading-relaxed text-muted">
          {t("disclaimer")}
        </p>
      </div>
    </section>
  );
}
