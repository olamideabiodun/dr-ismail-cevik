"use client";

import { useTransition } from "react";
import { useLocale, useTranslations } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import { routing, type Locale } from "@/i18n/routing";
import { cn } from "@/lib/utils";

/**
 * Segmented TR / EN control.
 *
 * `usePathname` from next-intl returns the path with the locale prefix already
 * stripped but concrete segment values intact (`/tedaviler/rinoplasti`), so the
 * visitor stays exactly where they were when switching language.
 */
export function LanguageToggle({
  className,
  tone = "light",
}: {
  className?: string;
  tone?: "light" | "dark";
}) {
  const locale = useLocale() as Locale;
  const pathname = usePathname();
  const router = useRouter();
  const t = useTranslations("common");
  const [isPending, startTransition] = useTransition();

  function switchTo(next: Locale) {
    if (next === locale) return;
    startTransition(() => {
      router.replace(pathname, { locale: next });
    });
  }

  return (
    <div
      className={cn(
        "inline-flex items-center rounded-[var(--radius-pill)] border p-0.5",
        tone === "dark"
          ? "border-white/30 bg-white/10 backdrop-blur"
          : "border-line bg-bg-elevated",
        isPending && "opacity-70",
        className
      )}
      role="group"
      aria-label={t("languageLabel")}
    >
      {routing.locales.map((code) => {
        const active = code === locale;
        return (
          <button
            key={code}
            type="button"
            onClick={() => switchTo(code)}
            aria-current={active ? "true" : undefined}
            className={cn(
              "min-h-9 rounded-[var(--radius-pill)] px-3 text-xs font-medium uppercase tracking-wider transition-colors",
              active
                ? tone === "dark"
                  ? "bg-white text-ink"
                  : "bg-brand text-white"
                : tone === "dark"
                  ? "text-white/80 hover:text-white"
                  : "text-ink-soft hover:text-ink"
            )}
          >
            {code}
          </button>
        );
      })}
    </div>
  );
}
