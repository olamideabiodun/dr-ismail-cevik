"use client";

import { useRef, type ReactNode } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";

type Props = {
  children: ReactNode;
  className?: string;
  /** "right" wipes left→right; "up" wipes bottom→top. */
  direction?: "right" | "up";
};

/**
 * Scroll-linked clip-path wipe — design.md §6 ("before/after wipe-in").
 *
 * Progress is tied to the scroll position between the element entering the
 * viewport and reaching the centre, so the reveal tracks the user's scroll
 * rather than playing on a fixed timer.
 */
export function ClipReveal({
  children,
  className,
  direction = "right",
}: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "center center"],
  });

  const from =
    direction === "right" ? "inset(0 100% 0 0)" : "inset(100% 0 0 0)";
  const clipPath = useTransform(
    scrollYProgress,
    [0, 1],
    [from, "inset(0% 0% 0% 0%)"]
  );

  return (
    <div ref={ref} className={className}>
      <motion.div
        className="h-full w-full"
        style={reduced ? undefined : { clipPath }}
      >
        {children}
      </motion.div>
    </div>
  );
}
