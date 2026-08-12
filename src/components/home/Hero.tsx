"use client";

import { useLayoutEffect, useRef, useState, type CSSProperties } from "react";
import { useTranslations } from "next-intl";
import { Parallax } from "@/components/motion/Parallax";
import { WordReveal } from "@/components/motion/WordReveal";
import { Figure } from "@/components/ui/Figure";
import { ButtonLink } from "@/components/ui/Button";
import { HeroFrame } from "@/components/home/HeroFrame";
import { CLINIC, DOCTOR } from "@/lib/constants";

/**
 * Full-bleed hero: his name (bold, one line) with a subtitle, thin
 * architectural line accents, a clinic credit bottom-left, and a glass
 * card + booking CTA on the right — per the approved design reference.
 *
 * The scrim only covers the bottom half of the photo, so the top of the
 * image renders at full clarity — only the lower half, behind the name,
 * darkens for AA contrast.
 *
 * The name's entrance is CSS (`.enter-mask`), not Motion: it's the LCP
 * element and must paint before hydration. Only the parallax drift stays
 * JS-driven, and it degrades to a still image under prefers-reduced-motion.
 */
export function Hero() {
  const t = useTranslations("home.hero");
  const ctaRef = useRef<HTMLSpanElement>(null);
  const [cardWidth, setCardWidth] = useState<number>();

  // The card's width should match the CTA button, not the other way around —
  // the button keeps its natural (unstretched) size and the text wraps to
  // fit it. Measured in a layout effect so it resolves before paint.
  useLayoutEffect(() => {
    const el = ctaRef.current;
    if (!el) return;
    const update = () => setCardWidth(el.offsetWidth);
    update();
    const observer = new ResizeObserver(update);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

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
          placeholderTone="dark"
        />
      </Parallax>

      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-ink/70 to-transparent"
      />

      <HeroFrame />

      {/* pointer-events-none: this box spans the full hero (min-h-[100svh])
          so the cursor-follow drift on the image below can receive pointer
          events even where there's no visible text. Nothing in here is
          interactive today — if that changes, give the interactive element
          its own pointer-events-auto rather than removing this. */}
      <div className="pointer-events-none container-page relative flex min-h-[100svh] flex-col justify-end pb-10 pt-32 text-left md:pb-14">
        <div>
          <WordReveal
            as="h1"
            text={DOCTOR.name}
            className="font-hero whitespace-nowrap font-bold uppercase text-white [font-size:clamp(1.5rem,6.5vw,4.5rem)] [letter-spacing:0.01em]"
            delay={0.1}
          />

          <p
            className="enter mt-1.5 text-sm uppercase tracking-[0.18em] text-white/75"
            style={{ "--delay": "0.4s" } as CSSProperties}
          >
            {t("eyebrow")}
          </p>
        </div>

        <p
          className="enter mt-8 max-w-[16rem] text-sm leading-relaxed text-white/70"
          style={{ "--delay": "0.55s" } as CSSProperties}
        >
          {CLINIC.name}
        </p>

        {/* Card and CTA are one unit — the button sits inside the card, at
            its bottom — anchored to the bottom-right corner of the hero,
            not vertically centered. */}
        <div
          className="enter glass-card pointer-events-auto absolute bottom-20 right-4 hidden w-fit flex-col items-stretch gap-5 p-5 md:bottom-24 md:right-8 lg:flex"
          style={
            {
              "--delay": "0.65s",
              width: cardWidth ? `${cardWidth + 48}px` : undefined,
            } as CSSProperties
          }
        >
          <p className="text-sm leading-relaxed text-white/90">{t("cardText")}</p>
          <span ref={ctaRef} className="self-start">
            <ButtonLink
              href="/randevu"
              variant="onDark"
              size="md"
              className="whitespace-nowrap rounded-[var(--radius-card)]"
            >
              {t("ctaPrimary")}
            </ButtonLink>
          </span>
        </div>
      </div>
    </section>
  );
}
