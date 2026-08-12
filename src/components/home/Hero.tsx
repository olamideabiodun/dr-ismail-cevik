"use client";

import type { CSSProperties } from "react";
import { useLocale, useTranslations } from "next-intl";
import { WordStagger } from "@/components/motion/WordStagger";
import { Parallax } from "@/components/motion/Parallax";
import { CountUp } from "@/components/motion/animos";
import { ButtonLink } from "@/components/ui/Button";
import { Figure } from "@/components/ui/Figure";
import { PRACTICE_STATS } from "@/content/site";

/**
 * Cinematic full-bleed hero — design.md §1, §5, §6.
 *
 * Layers, back to front: parallax operating photograph → gradient scrim →
 * oversized display headline → floating glass stat cards.
 *
 * The scrim is what lets white type pass AA over an unpredictable photograph;
 * it is not decorative and should not be removed.
 *
 * Every entrance here is CSS (`.enter`, `.enter-words`), not Motion. Motion
 * bakes `opacity:0` into the server HTML and only animates after hydration,
 * which would leave the headline — the LCP element — and the booking CTA
 * invisible until JS runs. Below the fold that trade is fine; here it is not.
 * Only the parallax drift stays JS-driven, and it degrades to a still image.
 */
export function Hero() {
  const t = useTranslations("home.hero");
  const tStats = useTranslations("home.stats");
  const locale = useLocale();

  // Turkish writes the percent sign before the number (%98); English after (98%).
  const percent = locale === "tr" ? { prefix: "%" } : { suffix: "%" };

  // Only confirmed figures are published. See PRACTICE_STATS for why this
  // currently renders nothing — the brief's "265+ ameliyat" turned out to be
  // his Instagram post count, not an operation count.
  const stats = PRACTICE_STATS.filter((stat) => stat.verified).map((stat) => ({
    value: stat.value,
    label: tStats(stat.key),
    ...(stat.key === "satisfaction" ? percent : { suffix: "+" }),
  }));

  const delay = (seconds: number) => ({ "--delay": `${seconds}s` }) as CSSProperties;

  return (
    <section className="relative isolate min-h-[100svh] overflow-hidden bg-ink">
      {/* The inner layer is deliberately taller than the frame so the 12%
          parallax drift never exposes an empty edge. */}
      <Parallax className="absolute inset-0 h-[112%]" distance="12%">
        <Figure
          src="/assets/hero/operating.jpg"
          alt={t("imageAlt")}
          className="h-full w-full"
          sizes="100vw"
          priority
          quality={90}
          // The source is square but the hero is full-bleed landscape, so
          // object-cover crops top and bottom. Centred, that slices through his
          // head; pulling the focal point up keeps the face and the headlamp in
          // frame at desktop widths and still reads on a portrait phone.
          imageClassName="object-[50%_30%]"
          // Everything laid over this is white. If the photograph is ever
          // missing, the fallback has to be dark or the hero is unreadable.
          placeholderTone="dark"
        />
      </Parallax>

      <div aria-hidden className="hero-scrim absolute inset-0" />

      <div className="container-page relative flex min-h-[100svh] flex-col justify-end pb-16 pt-32 md:pb-24">
        <p className="enter mb-6 text-xs font-medium uppercase tracking-[0.22em] text-white/75">
          {t("eyebrow")}
        </p>

        {/* design.md §3 specifies clamp(3.2rem, 9vw, 8.5rem). That was sized for
            the reference's three-word headline; at 1440px it renders ~129px and
            a real sentence pushes the sub-copy, CTAs and stat cards off screen.
            Pulled back to keep the whole hero in one viewport — still oversized
            and editorial, which is what the spec is actually after. */}
        <WordStagger
          as="h1"
          text={t("headline")}
          className="max-w-[15ch] text-white display-xl [letter-spacing:-0.03em] [line-height:0.95]"
          delay={0.1}
        />

        <p
          className="enter mt-8 max-w-xl text-lg leading-relaxed text-white/85"
          style={delay(0.5)}
        >
          {t("sub")}
        </p>

        <div
          className="enter mt-10 flex flex-wrap items-center gap-3"
          style={delay(0.62)}
        >
          <ButtonLink href="/randevu" size="lg" variant="onDark">
            {t("ctaPrimary")}
          </ButtonLink>
          <ButtonLink
            href="/tedaviler"
            size="lg"
            className="border border-white/40 bg-transparent text-white hover:bg-white/10"
          >
            {t("ctaSecondary")}
          </ButtonLink>
        </div>

        {/* Stats were three stacked glass panels floating at the right, which
            competed with the headline for attention and crowded the viewport.
            Reduced to one quiet inline rule: a fraction of the weight, and it
            no longer fights the CTA. Renders nothing while every figure is
            still unverified. */}
        <ul
          className="enter mt-12 flex flex-wrap items-center gap-x-8 gap-y-4 border-t border-white/15 pt-6 empty:hidden empty:border-0 sm:gap-x-12"
          style={delay(0.78)}
        >
          {stats.map((stat) => (
            <li key={stat.label} className="flex items-baseline gap-2.5">
              <CountUp
                value={stat.value}
                prefix={stat.prefix}
                suffix={stat.suffix}
                className="tabular font-display text-xl leading-none text-white"
              />
              <span className="text-xs tracking-wide text-white/60">
                {stat.label}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
