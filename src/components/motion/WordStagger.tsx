"use client";

import { Fragment, type CSSProperties } from "react";
import { motion, useReducedMotion } from "motion/react";
import { staggerParent, staticChild, staticParent, wordChild } from "./tokens";
import { cn } from "@/lib/utils";

type Props = {
  text: string;
  className?: string;
  as?: "h1" | "h2" | "p" | "span";
  stagger?: number;
  delay?: number;
  /**
   * "mount" renders a CSS-driven entrance that starts at first paint — use it
   * above the fold. "inView" uses Motion and waits for the element to be
   * scrolled to, which requires hydration.
   */
  trigger?: "mount" | "inView";
};

/**
 * Per-word entrance for display type — design.md §6: each word rises 0.4em
 * into place, staggered by 0.08s.
 *
 * Deliberately NO `overflow: hidden` clipping mask. A mask is the usual way to
 * make words rise "from behind a line", but it cannot survive this type: the
 * hero sets a line-height tighter than Fraunces' natural line box, so glyphs
 * already overflow their content box at both ends. Clipping that box shears the
 * tops of capitals and the tails of Turkish descenders (ğ, ç, ş) even at rest.
 * The fade plus the rise carries the effect on its own.
 *
 * Words stay real text nodes separated by real spaces, so the heading reads
 * normally to screen readers and wraps normally at every breakpoint.
 */
export function WordStagger({
  text,
  className,
  as = "h1",
  stagger = 0.08,
  delay = 0,
  trigger = "mount",
}: Props) {
  const reduced = useReducedMotion();
  const words = text.split(" ");
  const Tag = motion[as];

  // Above the fold: pure CSS, so the text paints without waiting for hydration.
  // See the "Above-the-fold entrance" block in globals.css for why.
  if (trigger === "mount") {
    const PlainTag = as;
    return (
      <PlainTag
        className={cn("enter-words", className)}
        style={{ "--delay": `${delay}s` } as CSSProperties}
      >
        {words.map((word, i) => (
          <Fragment key={`${word}-${i}`}>
            <span style={{ "--i": i } as CSSProperties}>{word}</span>
            {i < words.length - 1 ? " " : null}
          </Fragment>
        ))}
      </PlainTag>
    );
  }

  return (
    <Tag
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-15% 0px -15% 0px" }}
      variants={reduced ? staticParent : staggerParent(stagger, delay)}
    >
      {words.map((word, i) => (
        <Fragment key={`${word}-${i}`}>
          <motion.span
            className="inline-block"
            variants={reduced ? staticChild : wordChild}
          >
            {word}
          </motion.span>
          {i < words.length - 1 ? " " : null}
        </Fragment>
      ))}
    </Tag>
  );
}
