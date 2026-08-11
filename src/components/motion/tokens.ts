import type { Transition, Variants } from "motion/react";

/**
 * The single vocabulary of motion for the site — design.md §6.
 *
 * Every animated component imports from here rather than inlining its own
 * numbers, so "fast, subtle, physical" stays consistent and a change to the
 * house spring propagates everywhere.
 *
 * Only `transform` and `opacity` are ever animated (design.md §6, §8): both are
 * compositor-friendly and neither triggers layout.
 */

/** House spring. Used for entrances and anything that should feel physical. */
export const SPRING: Transition = {
  type: "spring",
  stiffness: 120,
  damping: 18,
};

/** Snappier spring for direct manipulation feedback (buttons, nav). */
export const SPRING_SNAPPY: Transition = {
  type: "spring",
  stiffness: 400,
  damping: 30,
};

/** Scroll-progress bar smoothing. */
export const SPRING_SCROLL: Transition = {
  type: "spring",
  stiffness: 100,
  damping: 30,
  restDelta: 0.001,
};

export const EASE_OUT_SOFT = [0.22, 1, 0.36, 1] as const;

/** Shared viewport config: reveal once, slightly before the element is centred. */
export const VIEWPORT_ONCE = {
  once: true,
  margin: "-15% 0px -15% 0px",
} as const;

/* -------------------------------------------------------------------------- */
/* Variants                                                                   */
/* -------------------------------------------------------------------------- */

export const staggerParent = (stagger = 0.08, delayChildren = 0): Variants => ({
  hidden: {},
  visible: {
    transition: { staggerChildren: stagger, delayChildren },
  },
});

/** Per-word hero entrance — design.md §6. `y` in `em` scales with the type. */
export const wordChild: Variants = {
  hidden: { opacity: 0, y: "0.4em" },
  visible: { opacity: 1, y: 0, transition: SPRING },
};

export const revealChild: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: SPRING },
};

/**
 * Reduced-motion counterparts. Transforms are dropped entirely; the fade is
 * kept so content still arrives rather than snapping in. globals.css also
 * neutralises CSS transitions, but Motion animations are JS-driven and would
 * otherwise ignore the media query — hence both layers.
 */
export const staticParent: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0 } },
};

export const staticChild: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.2 } },
};
