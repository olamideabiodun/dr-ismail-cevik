"use client";

import { motion, useReducedMotion, useScroll, useSpring } from "motion/react";
import { SPRING_SCROLL } from "./tokens";

/**
 * Spring-smoothed reading-progress bar pinned to the top of the viewport —
 * design.md §6. Purely decorative, so it is hidden from the accessibility tree
 * and omitted entirely under reduced motion.
 */
export function ScrollProgress() {
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, SPRING_SCROLL);

  if (reduced) return null;

  return (
    <motion.div
      aria-hidden
      className="fixed inset-x-0 top-0 z-[60] h-[2px] origin-left bg-brand"
      style={{ scaleX }}
    />
  );
}
