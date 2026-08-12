"use client";

import { useRef, type PointerEvent, type ReactNode } from "react";
import {
  motion,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from "motion/react";

type Props = {
  children: ReactNode;
  className?: string;
  /** How far the inner layer drifts across the scroll range. design.md §6: 12%. */
  distance?: string;
};

/**
 * Parallax for the hero image — design.md §6: a vertical scroll drift, plus a
 * subtle cursor-follow drift while the pointer moves over the hero.
 *
 * The outer wrapper is the scroll target; the two inner layers translate
 * independently (scroll-Y as a percentage, cursor-XY as spring-eased pixels)
 * so they compose without fighting each other. Give the wrapper
 * `overflow-hidden` and make the child taller than the frame (e.g.
 * `h-[115%]`), otherwise the drift will expose an empty edge at the bottom
 * of the image.
 *
 * Under `prefers-reduced-motion` neither transform is ever applied.
 */
export function Parallax({ children, className, distance = "12%" }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], ["0%", distance]);

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springX = useSpring(mouseX, { stiffness: 60, damping: 20, mass: 0.5 });
  const springY = useSpring(mouseY, { stiffness: 60, damping: 20, mass: 0.5 });

  function handlePointerMove(e: PointerEvent<HTMLDivElement>) {
    if (reduced) return;
    const rect = e.currentTarget.getBoundingClientRect();
    // -0.5..0.5 across the hero, scaled to a small, subtle pixel drift.
    mouseX.set(((e.clientX - rect.left) / rect.width - 0.5) * -14);
    mouseY.set(((e.clientY - rect.top) / rect.height - 0.5) * -14);
  }

  function handlePointerLeave() {
    mouseX.set(0);
    mouseY.set(0);
  }

  return (
    <div
      ref={ref}
      className={className}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
    >
      <motion.div
        className="h-full w-full will-change-transform"
        style={reduced ? undefined : { y }}
      >
        <motion.div
          className="h-full w-full will-change-transform"
          style={reduced ? undefined : { x: springX, y: springY }}
        >
          {children}
        </motion.div>
      </motion.div>
    </div>
  );
}
