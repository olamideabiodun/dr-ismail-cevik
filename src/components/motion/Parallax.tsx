"use client";

import { useRef, type ReactNode } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";

type Props = {
  children: ReactNode;
  className?: string;
  /** How far the inner layer drifts across the scroll range. design.md §6: 12%. */
  distance?: string;
};

/**
 * Vertical parallax for the hero image — design.md §6.
 *
 * The wrapper is the scroll target; only the inner layer translates, so the
 * clipping bounds stay put. Give the wrapper `overflow-hidden` and make the
 * child taller than the frame (e.g. `h-[115%]`), otherwise the drift will
 * expose an empty edge at the bottom of the image.
 *
 * Under `prefers-reduced-motion` the transform is simply never applied.
 */
export function Parallax({ children, className, distance = "12%" }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });

  const y = useTransform(scrollYProgress, [0, 1], ["0%", distance]);

  return (
    <div ref={ref} className={className}>
      <motion.div
        className="h-full w-full will-change-transform"
        style={reduced ? undefined : { y }}
      >
        {children}
      </motion.div>
    </div>
  );
}
