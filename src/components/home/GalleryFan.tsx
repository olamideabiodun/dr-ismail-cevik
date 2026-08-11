"use client";

import { useRef } from "react";
import {
  motion,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  type MotionValue,
} from "motion/react";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Figure } from "@/components/ui/Figure";
import { ButtonLink } from "@/components/ui/Button";
import { RESULT_CASES } from "@/content/site";
import type { Locale } from "@/i18n/routing";

/**
 * Gallery — a deck of result cards that fans open as the section scrolls in.
 *
 * The cards start stacked and square-on, then spread into an arc: rotation,
 * horizontal offset and a slight dip at the edges, all driven by scroll
 * position rather than a timer, so the reveal tracks the reader.
 *
 * The whole fan is laid out at a fixed pixel size and scaled down with a CSS
 * transform at narrow widths. Doing the arithmetic once at one size and scaling
 * the result is far more predictable than trying to re-derive an arc at every
 * breakpoint.
 */

const CARD_WIDTH = 250;

export function GalleryFan() {
  const t = useTranslations("home.editorial");
  const tNav = useTranslations("nav");
  const locale = useLocale() as Locale;
  const reduced = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 85%", "center 60%"],
  });

  // Smoothing the driver keeps the fan from twitching with a trackpad's
  // jittery scroll deltas.
  const progress = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 30,
    restDelta: 0.001,
  });

  const count = RESULT_CASES.length;
  const centre = (count - 1) / 2;

  return (
    <section className="section bg-glow relative overflow-hidden bg-bg">
      <div className="container-page">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-brand">
            {t("ghost")}
          </p>
          <h2 className="mt-4 display-md">{t("title")}</h2>
          <p className="mx-auto mt-4 max-w-lg text-ink-soft">{t("lead")}</p>
        </div>

        <div
          ref={ref}
          className="mt-16 flex justify-center"
          style={{ perspective: 1200 }}
        >
          {/* Fixed-size stage, scaled to fit the viewport. */}
          <div className="origin-top scale-[0.5] sm:scale-[0.7] lg:scale-100">
            <ul
              className="relative flex items-center justify-center"
              style={{ width: CARD_WIDTH * count, height: 400 }}
            >
              {RESULT_CASES.map((item, index) => (
                <FanCard
                  key={item.id}
                  progress={progress}
                  reduced={Boolean(reduced)}
                  offset={index - centre}
                  zIndex={count - Math.abs(index - centre)}
                  src={item.afterImage}
                  alt={item.alt[locale]}
                />
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-14 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
          <ButtonLink href="/sonuclar" size="lg">
            {t("cta")}
          </ButtonLink>
          <Link
            href="/randevu"
            className="text-sm font-medium text-ink-soft transition-colors hover:text-brand"
          >
            {tNav("book")}
          </Link>
        </div>
      </div>
    </section>
  );
}

function FanCard({
  progress,
  reduced,
  offset,
  zIndex,
  src,
  alt,
}: {
  progress: MotionValue<number>;
  reduced: boolean;
  offset: number;
  zIndex: number;
  src: string;
  alt: string;
}) {
  const targetRotate = offset * 7;
  const targetX = offset * 196;
  const targetY = Math.abs(offset) * 22;
  const targetScale = 1 - Math.abs(offset) * 0.04;

  // From stacked and flat to fanned. Hooks must run unconditionally, so the
  // reduced-motion branch happens at render, not around the hook calls.
  const rotate = useTransform(progress, [0, 1], [0, targetRotate]);
  const x = useTransform(progress, [0, 1], [0, targetX]);
  const y = useTransform(progress, [0, 1], [36, targetY]);
  const scale = useTransform(progress, [0, 1], [0.92, targetScale]);

  const style = reduced
    ? { rotate: targetRotate, x: targetX, y: targetY, scale: targetScale }
    : { rotate, x, y, scale };

  return (
    <motion.li
      className="absolute"
      style={{ ...style, zIndex, width: CARD_WIDTH }}
    >
      <div className="overflow-hidden rounded-[var(--radius-image)] border border-white/60 bg-bg-elevated shadow-card">
        <Figure
          src={src}
          alt={alt}
          className="aspect-[3/4] w-full"
          sizes="250px"
        />
      </div>
    </motion.li>
  );
}
