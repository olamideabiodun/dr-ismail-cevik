import type { ComponentProps, ReactNode } from "react";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "ghost" | "onDark";
type Size = "sm" | "md" | "lg";

const VARIANTS: Record<Variant, string> = {
  primary:
    "bg-brand text-white hover:bg-brand-600 shadow-sm disabled:bg-muted disabled:text-white/80",
  secondary:
    "bg-bg-elevated text-ink border border-line hover:border-brand hover:text-brand",
  ghost: "bg-transparent text-ink-soft hover:text-brand",
  onDark:
    "bg-white text-ink hover:bg-white/92 border border-white/40 backdrop-blur",
};

/**
 * Heights were 44/48/56 and read heavy next to the restrained type scale.
 * Tightened to 40/44/48: `md` and `lg` still clear the 44px touch target from
 * design.md §7, and `sm` is only used in the desktop nav, where the pointer is
 * a mouse.
 */
const SIZES: Record<Size, string> = {
  sm: "h-10 px-4 text-[0.8125rem]",
  md: "h-11 px-6 text-sm",
  lg: "h-12 px-7 text-[0.9375rem]",
};

/**
 * `press` (globals.css) gives the scale(0.97)-on-:active feedback in CSS rather
 * than through a Motion wrapper. It runs off the main thread, survives a busy
 * page, works before hydration, and drops a client component from every button
 * on the site.
 */
const BASE =
  "press inline-flex items-center justify-center gap-2 rounded-[var(--radius-pill)] " +
  "font-medium tracking-tight transition-colors duration-200 " +
  "disabled:cursor-not-allowed disabled:opacity-70 disabled:active:scale-100";

type CommonProps = {
  variant?: Variant;
  size?: Size;
  className?: string;
  children: ReactNode;
};

export function Button({
  variant = "primary",
  size = "md",
  className,
  children,
  ...props
}: CommonProps & ComponentProps<"button">) {
  return (
    <button
      className={cn(BASE, VARIANTS[variant], SIZES[size], className)}
      {...props}
    >
      {children}
    </button>
  );
}

export function ButtonLink({
  variant = "primary",
  size = "md",
  className,
  children,
  ...props
}: CommonProps & ComponentProps<typeof Link>) {
  return (
    <Link
      className={cn(BASE, VARIANTS[variant], SIZES[size], className)}
      {...props}
    >
      {children}
    </Link>
  );
}

/** For tel:, mailto: and WhatsApp — real external links, not app routes. */
export function ButtonAnchor({
  variant = "primary",
  size = "md",
  className,
  children,
  ...props
}: CommonProps & ComponentProps<"a">) {
  return (
    <a
      className={cn(BASE, VARIANTS[variant], SIZES[size], className)}
      {...props}
    >
      {children}
    </a>
  );
}
