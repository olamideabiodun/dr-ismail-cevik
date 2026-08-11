import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Reveal } from "@/components/motion/Reveal";

/**
 * Editorial section scaffolding — design.md §3, §4.
 * The giant ghost word sits behind the heading and is decorative only.
 */

export function Section({
  children,
  className,
  id,
  tone = "base",
}: {
  children: ReactNode;
  className?: string;
  id?: string;
  tone?: "base" | "tint" | "elevated" | "ink";
}) {
  const tones = {
    base: "bg-bg text-ink",
    tint: "bg-brand-tint text-ink",
    elevated: "bg-bg-elevated text-ink",
    ink: "bg-ink text-white",
  } as const;

  return (
    <section id={id} className={cn("section relative", tones[tone], className)}>
      {children}
    </section>
  );
}

export function GhostHeading({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      aria-hidden
      className={cn(
        "ghost-heading absolute -top-2 left-0 -z-0 select-none",
        className
      )}
    >
      {children}
    </div>
  );
}

export function SectionHeader({
  ghost,
  eyebrow,
  title,
  lead,
  align = "left",
  className,
}: {
  ghost?: string;
  eyebrow?: string;
  title: string;
  lead?: string;
  align?: "left" | "center";
  className?: string;
}) {
  return (
    <div
      className={cn(
        "relative",
        align === "center" && "mx-auto text-center",
        className
      )}
    >
      {ghost ? <GhostHeading>{ghost}</GhostHeading> : null}

      <div className="relative z-10">
        {eyebrow ? (
          <Reveal>
            <p className="mb-4 text-xs font-medium uppercase tracking-[0.18em] text-brand">
              {eyebrow}
            </p>
          </Reveal>
        ) : null}

        <Reveal delay={0.05}>
          <h2 className="max-w-3xl display-md leading-[1.05]">
            {title}
          </h2>
        </Reveal>

        {lead ? (
          <Reveal delay={0.1}>
            <p
              className={cn(
                "mt-5 max-w-2xl text-lg leading-relaxed text-ink-soft",
                align === "center" && "mx-auto"
              )}
            >
              {lead}
            </p>
          </Reveal>
        ) : null}
      </div>
    </div>
  );
}
