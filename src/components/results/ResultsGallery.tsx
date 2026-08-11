"use client";

import { useSyncExternalStore } from "react";
import { AnimatePresence, motion } from "motion/react";
import { useLocale, useTranslations } from "next-intl";
import {
  getConsentServerSnapshot,
  getConsentSnapshot,
  setConsent,
  subscribeToConsent,
} from "@/lib/consent-store";
import { BeforeAfterSlider } from "./BeforeAfterSlider";
import { ClipReveal } from "@/components/motion/ClipReveal";
import { Button } from "@/components/ui/Button";
import { RESULT_CASES } from "@/content/site";
import { getService } from "@/content/services";
import type { Locale } from "@/i18n/routing";

/**
 * Consent-gated results gallery — design.md §10.
 *
 * Turkish medical advertising rules treat before/after imagery as restricted
 * content, and several of the source posts are flagged sensitive on Instagram.
 * Images therefore start blurred behind an explicit acknowledgement, and the
 * visitor can re-hide them at any time.
 *
 * Consent is kept in sessionStorage rather than localStorage on purpose: it
 * should not persist beyond the visit, and it must never leave the device.
 */
export function ResultsGallery() {
  const t = useTranslations("results");
  const locale = useLocale() as Locale;
  const consented = useSyncExternalStore(
    subscribeToConsent,
    getConsentSnapshot,
    getConsentServerSnapshot
  );

  return (
    <>
      <AnimatePresence initial={false}>
        {!consented ? (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="rounded-[var(--radius-card)] border border-line bg-bg-elevated p-8 md:p-10"
          >
            <h2 className="text-xl">{t("consentTitle")}</h2>
            <p className="mt-4 max-w-2xl leading-relaxed text-ink-soft">
              {t("consentBody")}
            </p>
            <div className="mt-7">
              <Button onClick={() => setConsent(true)} size="lg">
                {t("consentButton")}
              </Button>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      {consented ? (
        <div className="mb-10 flex justify-end">
          <Button variant="ghost" size="sm" onClick={() => setConsent(false)}>
            {t("consentReset")}
          </Button>
        </div>
      ) : null}

      <ul className="mt-12 grid gap-10 md:grid-cols-2 md:gap-8">
        {RESULT_CASES.map((item) => {
          const service = getService(item.serviceSlug);
          return (
            <li key={item.id}>
              <ClipReveal>
                <BeforeAfterSlider
                  beforeImage={item.beforeImage}
                  afterImage={item.afterImage}
                  alt={item.alt[locale]}
                  className="aspect-[4/5] w-full"
                  // The server snapshot is always false, so the markup ships
                  // blurred and only un-blurs once the client confirms consent.
                  blurred={!consented}
                />
              </ClipReveal>

              <div className="mt-5">
                {service ? (
                  <p className="text-xs font-medium uppercase tracking-[0.14em] text-brand">
                    {service.name[locale]}
                  </p>
                ) : null}
                <p className="mt-2 text-[0.9375rem] leading-relaxed text-ink-soft">
                  {item.caption[locale]}
                </p>
              </div>
            </li>
          );
        })}
      </ul>
    </>
  );
}
