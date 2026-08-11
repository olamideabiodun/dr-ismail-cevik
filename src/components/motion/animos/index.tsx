"use client";

/**
 * Prebuilt component-level motion patterns.
 *
 * Stands in for animos.app, which could not be resolved as a package — see
 * README.md in this folder for what was checked and how to swap the real
 * library in without touching any call site.
 *
 * Everything here is built on Motion for React and the shared springs in
 * ../tokens.ts, and every one of them short-circuits under reduced motion.
 */

import {
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  animate,
  motion,
  useInView,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
} from "motion/react";
import { SPRING, SPRING_SNAPPY, VIEWPORT_ONCE } from "../tokens";

/* -------------------------------------------------------------------------- */

export function FadeUp({
  children,
  className,
  delay = 0,
  distance = 24,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  distance?: number;
}) {
  const reduced = useReducedMotion();

  return (
    <motion.div
      className={className}
      initial={reduced ? { opacity: 0 } : { opacity: 0, y: distance }}
      whileInView={reduced ? { opacity: 1 } : { opacity: 1, y: 0 }}
      viewport={VIEWPORT_ONCE}
      transition={reduced ? { duration: 0.2, delay } : { ...SPRING, delay }}
    >
      {children}
    </motion.div>
  );
}

/* -------------------------------------------------------------------------- */

export function BlurIn({
  children,
  className,
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  const reduced = useReducedMotion();

  return (
    <motion.div
      className={className}
      initial={reduced ? { opacity: 0 } : { opacity: 0, filter: "blur(8px)" }}
      whileInView={
        reduced ? { opacity: 1 } : { opacity: 1, filter: "blur(0px)" }
      }
      viewport={VIEWPORT_ONCE}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

/* -------------------------------------------------------------------------- */

/**
 * Pulls gently toward the cursor while hovered. `strength` is the maximum
 * offset in pixels. Renders a plain wrapper under reduced motion.
 */
export function MagneticButton({
  children,
  className,
  strength = 8,
}: {
  children: ReactNode;
  className?: string;
  strength?: number;
}) {
  const reduced = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, SPRING_SNAPPY);
  const springY = useSpring(y, SPRING_SNAPPY);

  if (reduced) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      ref={ref}
      className={className}
      style={{ x: springX, y: springY }}
      onPointerMove={(event) => {
        // Coarse pointers have no hover state to speak of; a magnetic pull
        // driven by touch coordinates just makes the target harder to hit.
        if (event.pointerType !== "mouse") return;
        const rect = ref.current?.getBoundingClientRect();
        if (!rect) return;
        const relX = event.clientX - (rect.left + rect.width / 2);
        const relY = event.clientY - (rect.top + rect.height / 2);
        x.set((relX / (rect.width / 2)) * strength);
        y.set((relY / (rect.height / 2)) * strength);
      }}
      onPointerLeave={() => {
        x.set(0);
        y.set(0);
      }}
    >
      {children}
    </motion.div>
  );
}

/* -------------------------------------------------------------------------- */

/**
 * Counts up to `value` when scrolled into view. `prefix`/`suffix` keep the
 * surrounding characters ("265+", "%98") in the same text node so the number
 * never reflows as it grows — the `tabular` class in globals.css does the rest.
 */
export function CountUp({
  value,
  className,
  prefix = "",
  suffix = "",
  duration = 1.4,
}: {
  value: number;
  className?: string;
  prefix?: string;
  suffix?: string;
  duration?: number;
}) {
  const reduced = useReducedMotion();
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-10% 0px" });
  // Seeded with the final value so the server renders the real figure. Without
  // JS the number is simply correct rather than a permanent "0". When the
  // animation does run, animate() emits ~0 on its first frame and counts up
  // from there, so nothing is lost.
  const [display, setDisplay] = useState(value);

  useEffect(() => {
    if (!inView || reduced) return;
    const controls = animate(0, value, {
      duration,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: (latest) => setDisplay(Math.round(latest)),
    });
    return () => controls.stop();
  }, [inView, reduced, value, duration]);

  return (
    <span ref={ref} className={className}>
      {prefix}
      {display}
      {suffix}
    </span>
  );
}

/* -------------------------------------------------------------------------- */

export function Marquee({
  children,
  className,
  speed = 40,
}: {
  children: ReactNode;
  className?: string;
  /** Seconds for one full pass. */
  speed?: number;
}) {
  const reduced = useReducedMotion();

  if (reduced) {
    return <div className={className}>{children}</div>;
  }

  return (
    <div className={`group overflow-hidden ${className ?? ""}`}>
      <motion.div
        className="flex w-max gap-12"
        animate={{ x: ["0%", "-50%"] }}
        transition={{ duration: speed, ease: "linear", repeat: Infinity }}
        style={{ animationPlayState: "running" }}
      >
        {/* Duplicated so the -50% loop point lands on an identical frame. */}
        {children}
        {children}
      </motion.div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */

/**
 * Card lift on hover — design.md §6 (`y: -6` plus a deepened shadow).
 * Exported here so cards across the site share one hover feel.
 */
export function HoverLift({
  children,
  className,
  lift = -6,
}: {
  children: ReactNode;
  className?: string;
  lift?: number;
}) {
  const reduced = useReducedMotion();

  return (
    <motion.div
      className={className}
      whileHover={reduced ? undefined : { y: lift }}
      transition={SPRING}
    >
      {children}
    </motion.div>
  );
}

export { useTransform };
