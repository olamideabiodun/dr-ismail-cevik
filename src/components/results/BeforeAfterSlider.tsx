"use client";

import { useId, useState } from "react";
import { useTranslations } from "next-intl";
import { Figure } from "@/components/ui/Figure";
import { cn } from "@/lib/utils";

/**
 * Draggable before/after comparison — design.md §5, §7.
 *
 * The drag surface is a full-bleed `input[type=range]` at zero opacity. That is
 * what makes the control keyboard-operable (arrow keys, Home/End) and exposes a
 * real value to assistive technology, which a bare pointer-drag handler cannot.
 * The visible handle is decorative and tracks the input's value.
 */
export function BeforeAfterSlider({
  beforeImage,
  afterImage,
  alt,
  className,
  blurred = false,
}: {
  beforeImage: string;
  afterImage: string;
  alt: string;
  className?: string;
  blurred?: boolean;
}) {
  const t = useTranslations("results");
  const [position, setPosition] = useState(50);
  const id = useId();

  return (
    <div
      className={cn(
        "relative isolate overflow-hidden rounded-[var(--radius-image)] bg-brand-tint",
        className
      )}
    >
      <div
        className={cn(
          "relative h-full w-full transition-[filter] duration-500",
          blurred && "blur-2xl"
        )}
      >
        {/* After sits underneath and is revealed as the handle moves right. */}
        <Figure
          src={afterImage}
          alt={`${alt} — ${t("after")}`}
          className="absolute inset-0 h-full w-full"
          sizes="(max-width: 768px) 100vw, 50vw"
        />

        <div
          className="absolute inset-0"
          style={{ clipPath: `inset(0 ${100 - position}% 0 0)` }}
        >
          <Figure
            src={beforeImage}
            alt={`${alt} — ${t("before")}`}
            className="absolute inset-0 h-full w-full"
            sizes="(max-width: 768px) 100vw, 50vw"
          />
        </div>

        {/* Corner labels */}
        <span className="pointer-events-none absolute left-4 top-4 rounded-[var(--radius-pill)] bg-ink/70 px-3 py-1 text-xs font-medium uppercase tracking-wider text-white backdrop-blur">
          {t("before")}
        </span>
        <span className="pointer-events-none absolute right-4 top-4 rounded-[var(--radius-pill)] bg-ink/70 px-3 py-1 text-xs font-medium uppercase tracking-wider text-white backdrop-blur">
          {t("after")}
        </span>

        {/* Handle */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-y-0 z-10 w-0.5 bg-white/90 shadow-[0_0_20px_rgba(0,0,0,0.35)]"
          style={{ left: `${position}%` }}
        >
          <span className="absolute top-1/2 left-1/2 flex h-11 w-11 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-[var(--radius-pill)] bg-white text-ink shadow-card">
            <svg
              viewBox="0 0 24 24"
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M9 6l-4 6 4 6M15 6l4 6-4 6" />
            </svg>
          </span>
        </div>
      </div>

      <label htmlFor={id} className="sr-only">
        {t("sliderLabel")}
      </label>
      <input
        id={id}
        type="range"
        min={0}
        max={100}
        step={0.5}
        value={position}
        disabled={blurred}
        onChange={(event) => setPosition(Number(event.target.value))}
        aria-valuetext={`${Math.round(position)}%`}
        className="absolute inset-0 z-20 h-full w-full cursor-ew-resize opacity-0 disabled:cursor-not-allowed"
      />
    </div>
  );
}
