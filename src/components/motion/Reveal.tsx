"use client";

import { motion, useReducedMotion } from "motion/react";
import type { ReactNode } from "react";
import {
  revealChild,
  staggerParent,
  staticChild,
  staticParent,
  VIEWPORT_ONCE,
} from "./tokens";

type RevealProps = {
  children: ReactNode;
  className?: string;
  /** Seconds to wait before this element starts. */
  delay?: number;
  as?: "div" | "section" | "li" | "article" | "header" | "figure";
};

/**
 * Single element that fades and rises into view once — design.md §6.
 */
export function Reveal({
  children,
  className,
  delay = 0,
  as = "div",
}: RevealProps) {
  const reduced = useReducedMotion();
  const Tag = motion[as];

  return (
    <Tag
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={VIEWPORT_ONCE}
      variants={reduced ? staticChild : revealChild}
      transition={delay ? { delay } : undefined}
    >
      {children}
    </Tag>
  );
}

type RevealGroupProps = {
  children: ReactNode;
  className?: string;
  stagger?: number;
  delayChildren?: number;
  as?: "div" | "section" | "ul" | "ol";
};

/**
 * Parent that staggers its `RevealItem` children. Put this on the grid, and
 * `RevealItem` on each card.
 */
export function RevealGroup({
  children,
  className,
  stagger = 0.08,
  delayChildren = 0,
  as = "div",
}: RevealGroupProps) {
  const reduced = useReducedMotion();
  const Tag = motion[as];

  return (
    <Tag
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={VIEWPORT_ONCE}
      variants={reduced ? staticParent : staggerParent(stagger, delayChildren)}
    >
      {children}
    </Tag>
  );
}

export function RevealItem({
  children,
  className,
  as = "div",
}: {
  children: ReactNode;
  className?: string;
  as?: "div" | "li" | "article" | "figure";
}) {
  const reduced = useReducedMotion();
  const Tag = motion[as];

  return (
    <Tag className={className} variants={reduced ? staticChild : revealChild}>
      {children}
    </Tag>
  );
}
