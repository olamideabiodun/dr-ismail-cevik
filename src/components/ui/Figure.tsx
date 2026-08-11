"use client";

import Image from "next/image";
import { useState } from "react";
import { cn } from "@/lib/utils";

/**
 * next/image with a graceful fallback.
 *
 * The clinical photography is the doctor's own and is not in the repo — see
 * public/assets/README.md. Until those files are dropped in, a missing image
 * would otherwise render as a broken-image icon on every page. This renders a
 * brand-tinted placeholder instead, and in development also prints the exact
 * path it was looking for, so the manifest is self-checking.
 */
export function Figure({
  src,
  alt,
  className,
  imageClassName,
  sizes = "100vw",
  priority = false,
  quality = 75,
  placeholderTone = "light",
}: {
  src: string;
  alt: string;
  className?: string;
  imageClassName?: string;
  sizes?: string;
  priority?: boolean;
  quality?: 70 | 75 | 90;
  /**
   * Which way the fallback leans. Use "dark" wherever white type is laid over
   * the image — the hero, most obviously. A light placeholder there would leave
   * white text on a near-white panel until the photograph is supplied.
   */
  placeholderTone?: "light" | "dark";
}) {
  const [failed, setFailed] = useState(false);
  const dark = placeholderTone === "dark";

  return (
    <div
      className={cn(
        "relative overflow-hidden",
        dark ? "bg-ink" : "bg-brand-tint",
        className
      )}
    >
      {failed ? (
        <div
          role="img"
          aria-label={alt}
          className={cn(
            "absolute inset-0 flex items-center justify-center",
            dark
              ? "bg-[radial-gradient(120%_100%_at_70%_20%,#2C6B5A_0%,#17594A_40%,#0E1512_100%)]"
              : "bg-[linear-gradient(135deg,var(--brand-tint),#dfeae5_60%,var(--brand-300))]"
          )}
        >
          <svg
            viewBox="0 0 24 24"
            className={cn("h-10 w-10", dark ? "text-white/20" : "text-brand/35")}
            fill="none"
            stroke="currentColor"
            strokeWidth={1.25}
            aria-hidden
          >
            <rect x="3" y="4" width="18" height="16" rx="3" />
            <circle cx="8.5" cy="9.5" r="1.75" />
            <path d="M21 16.5l-5-5-6.5 8.5" />
          </svg>
          {process.env.NODE_ENV === "development" ? (
            <span className="absolute bottom-2 left-2 rounded bg-ink/70 px-2 py-1 font-mono text-[10px] text-white">
              missing: {src}
            </span>
          ) : null}
        </div>
      ) : (
        <Image
          src={src}
          alt={alt}
          fill
          sizes={sizes}
          priority={priority}
          quality={quality}
          onError={() => setFailed(true)}
          className={cn("object-cover", imageClassName)}
        />
      )}
    </div>
  );
}
