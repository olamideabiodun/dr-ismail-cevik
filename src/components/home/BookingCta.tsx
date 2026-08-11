import { getTranslations } from "next-intl/server";
import { ButtonLink, ButtonAnchor } from "@/components/ui/Button";
import { Reveal } from "@/components/motion/Reveal";
import { CLINIC } from "@/lib/constants";

export async function BookingCta() {
  const t = await getTranslations("home.cta");

  return (
    <section className="section bg-ink text-white">
      <div className="container-page">
        <div className="mx-auto max-w-3xl text-center">
          <Reveal>
            <h2 className="display-md leading-[1.05] text-white">
              {t("title")}
            </h2>
          </Reveal>

          <Reveal delay={0.08}>
            <p className="mx-auto mt-5 max-w-xl text-lg leading-relaxed text-white/75">
              {t("lead")}
            </p>
          </Reveal>

          <Reveal delay={0.14}>
            <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
              <ButtonLink href="/randevu" size="lg" variant="onDark">
                {t("button")}
              </ButtonLink>

              <span className="text-sm text-white/55">{t("or")}</span>

              <ButtonAnchor
                href={`tel:${CLINIC.phoneE164}`}
                size="lg"
                className="tabular border border-white/30 bg-transparent text-white hover:bg-white/10"
              >
                {CLINIC.phoneDisplay}
              </ButtonAnchor>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
