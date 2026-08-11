"use client";

import { useEffect, useState } from "react";
import {
  AnimatePresence,
  motion,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
} from "motion/react";
import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { ButtonLink } from "@/components/ui/Button";
import { LanguageToggle } from "./LanguageToggle";
import { LEFT_ROUTES, NAV_ROUTES, RIGHT_ROUTES } from "./nav-routes";
import { DOCTOR } from "@/lib/constants";
import { cn } from "@/lib/utils";

/**
 * Scroll-direction aware navigation — design.md §5, §6.
 *
 * Transparent while sitting over the hero, solid once scrolled. Hides on
 * downward scroll and returns on upward scroll, so the CTA is always one
 * gesture away without occupying the viewport while reading.
 */
export function SiteHeader() {
  const t = useTranslations("nav");
  const pathname = usePathname();
  const reduced = useReducedMotion();
  const { scrollY } = useScroll();

  const [hidden, setHidden] = useState(false);
  const [atTop, setAtTop] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);

  const isHome = pathname === "/";
  // Only the home page has a full-bleed dark hero behind the header.
  const overHero = isHome && atTop && !menuOpen;

  useMotionValueEvent(scrollY, "change", (latest) => {
    const previous = scrollY.getPrevious() ?? 0;
    setAtTop(latest < 24);

    if (menuOpen) return;
    // Ignore the first 160px so the header does not flicker at the top of a page.
    setHidden(latest > previous && latest > 160);
  });

  // Lock body scroll while the mobile menu is open.
  useEffect(() => {
    if (!menuOpen) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [menuOpen]);

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") setMenuOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // Close the menu whenever the route changes.
  //
  // Adjusting state during render rather than in an effect: React re-runs this
  // component immediately with the corrected state and never commits the stale
  // UI, so the menu cannot flash open for a frame after navigating. An effect
  // here would be a cascading render.
  const [lastPathname, setLastPathname] = useState(pathname);
  if (pathname !== lastPathname) {
    setLastPathname(pathname);
    setMenuOpen(false);
  }

  const linkClass = cn(
    "text-sm font-medium transition-colors",
    overHero ? "text-white/85 hover:text-white" : "text-ink-soft hover:text-ink"
  );

  return (
    <>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-[var(--radius-input)] focus:bg-brand focus:px-4 focus:py-2 focus:text-white"
      >
        {t("skipToContent")}
      </a>

      <motion.header
        initial={false}
        animate={{ y: hidden && !reduced ? "-100%" : "0%" }}
        transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
        className={cn(
          "fixed inset-x-0 top-0 z-50 transition-colors duration-300",
          overHero
            ? "bg-transparent"
            : "border-b border-line bg-bg/85 backdrop-blur-xl"
        )}
      >
        <nav
          className="container-page flex h-20 items-center justify-between gap-6"
          aria-label={t("menu")}
        >
          {/* Left cluster (desktop) */}
          <div className="hidden flex-1 items-center gap-7 lg:flex">
            {LEFT_ROUTES.map((route) => (
              <Link
                key={route.href}
                href={route.href}
                className={cn(
                  linkClass,
                  pathname.startsWith(route.href) && "text-brand"
                )}
              >
                {t(route.key)}
              </Link>
            ))}
          </div>

          {/* Centred wordmark */}
          <Link
            href="/"
            className={cn(
              "font-display text-base tracking-tight lg:absolute lg:left-1/2 lg:-translate-x-1/2",
              overHero ? "text-white" : "text-ink"
            )}
          >
            {DOCTOR.name}
          </Link>

          {/* Right cluster (desktop) */}
          <div className="hidden flex-1 items-center justify-end gap-5 lg:flex">
            {RIGHT_ROUTES.map((route) => (
              <Link
                key={route.href}
                href={route.href}
                className={cn(
                  linkClass,
                  pathname.startsWith(route.href) && "text-brand"
                )}
              >
                {t(route.key)}
              </Link>
            ))}
            <LanguageToggle tone={overHero ? "dark" : "light"} />
            <ButtonLink
              href="/randevu"
              size="sm"
              variant={overHero ? "onDark" : "primary"}
            >
              {t("book")}
            </ButtonLink>
          </div>

          {/* Mobile trigger */}
          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
            className={cn(
              "-mr-2 flex h-11 w-11 items-center justify-center rounded-[var(--radius-pill)] lg:hidden",
              overHero ? "text-white" : "text-ink"
            )}
          >
            <span className="sr-only">{menuOpen ? t("close") : t("menu")}</span>
            <svg
              viewBox="0 0 24 24"
              className="h-6 w-6"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.5}
              strokeLinecap="round"
              aria-hidden
            >
              {menuOpen ? (
                <path d="M6 6l12 12M18 6L6 18" />
              ) : (
                <>
                  <path d="M4 8h16" />
                  <path d="M4 16h16" />
                </>
              )}
            </svg>
          </button>
        </nav>
      </motion.header>

      <AnimatePresence>
        {menuOpen ? (
          <motion.div
            id="mobile-menu"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 bg-bg pt-20 lg:hidden"
          >
            <div className="container-page flex h-full flex-col justify-between pb-12 pt-8">
              <ul className="flex flex-col gap-1">
                {NAV_ROUTES.map((route, index) => (
                  <motion.li
                    key={route.href}
                    initial={reduced ? { opacity: 0 } : { opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.04 * index, duration: 0.3 }}
                  >
                    <Link
                      href={route.href}
                      className="block border-b border-line py-4 font-display text-2xl text-ink"
                    >
                      {t(route.key)}
                    </Link>
                  </motion.li>
                ))}
              </ul>

              <div className="flex flex-col gap-5">
                <LanguageToggle />
                <ButtonLink href="/randevu" size="lg" className="w-full">
                  {t("book")}
                </ButtonLink>
              </div>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}
