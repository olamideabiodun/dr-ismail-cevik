"use client";

import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useLocale, useTranslations } from "next-intl";
import { fetchAvailableSlots } from "@/lib/booking/actions";
import {
  buildDateRange,
  formatDayChip,
  formatTime,
  todayKey,
} from "@/lib/booking/time";
import type { AvailableSlot } from "@/lib/supabase/types";
import type { Locale } from "@/i18n/routing";
import { cn } from "@/lib/utils";

/**
 * Date strip + time grid.
 *
 * Slots are always fetched from the server (`get_available_slots`) rather than
 * computed here. The database already owns the rules — working hours, buffers,
 * minimum notice, collisions — and duplicating them in the browser would
 * guarantee the two drift apart and offer times that cannot be booked.
 */
export function DateSlotPicker({
  serviceSlug,
  maxAdvanceDays,
  selectedSlot,
  onSelectSlot,
}: {
  serviceSlug: string;
  maxAdvanceDays: number;
  selectedSlot: string | null;
  onSelectSlot: (iso: string | null) => void;
}) {
  const t = useTranslations("booking");
  const tErrors = useTranslations("errors");
  const locale = useLocale() as Locale;
  const reduced = useReducedMotion();

  const dates = useMemo(
    () => buildDateRange(maxAdvanceDays),
    [maxAdvanceDays]
  );
  const [activeDate, setActiveDate] = useState(() => todayKey());
  const [slots, setSlots] = useState<AvailableSlot[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  // Guards against a slow response for an earlier date overwriting a newer one.
  const requestId = useRef(0);

  useEffect(() => {
    const currentRequest = ++requestId.current;

    // Every setState below happens after an await. Clearing the error
    // synchronously here instead would be a cascading render, and React's
    // set-state-in-effect rule rightly rejects it.
    startTransition(async () => {
      const result = await fetchAvailableSlots(serviceSlug, activeDate);
      if (currentRequest !== requestId.current) return;

      if (result.ok) {
        setSlots(result.slots);
        setError(null);
      } else {
        setSlots([]);
        setError(result.error);
      }
    });
  }, [serviceSlug, activeDate]);

  function chooseDate(dateKey: string) {
    setActiveDate(dateKey);
    // The previously chosen time belongs to the previous day.
    onSelectSlot(null);
  }

  return (
    <div>
      <h3 className="text-sm font-medium uppercase tracking-[0.14em] text-muted">
        {t("selectDate")}
      </h3>

      <ul className="no-scrollbar mt-4 flex gap-2 overflow-x-auto pb-2">
        {dates.map((dateKey) => {
          const chip = formatDayChip(dateKey, locale);
          const active = dateKey === activeDate;
          return (
            <li key={dateKey}>
              <button
                type="button"
                onClick={() => chooseDate(dateKey)}
                aria-pressed={active}
                className={cn(
                  "flex min-h-[4.5rem] w-16 shrink-0 flex-col items-center justify-center gap-0.5 rounded-[var(--radius-input)] border transition-colors",
                  active
                    ? "border-brand bg-brand text-white"
                    : "border-line bg-bg-elevated text-ink-soft hover:border-brand"
                )}
              >
                <span className="text-[0.6875rem] uppercase tracking-wider opacity-80">
                  {chip.weekday}
                </span>
                <span className="tabular text-lg font-medium">{chip.day}</span>
                <span className="text-[0.6875rem] uppercase tracking-wider opacity-80">
                  {chip.month}
                </span>
              </button>
            </li>
          );
        })}
      </ul>

      <h3 className="mt-10 text-sm font-medium uppercase tracking-[0.14em] text-muted">
        {t("selectTime")}
      </h3>

      <div className="mt-4 min-h-[6rem]" aria-live="polite" aria-busy={isPending}>
        {isPending ? (
          <p className="text-sm text-muted">{t("loadingSlots")}</p>
        ) : error ? (
          <p className="text-sm text-ink-soft">
            {tErrors.has(error) ? tErrors(error) : tErrors("generic")}
          </p>
        ) : slots.length === 0 ? (
          <p className="text-sm text-ink-soft">{t("noSlots")}</p>
        ) : (
          <AnimatePresence mode="wait">
            <motion.ul
              key={activeDate}
              initial={reduced ? { opacity: 0 } : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-5"
            >
              {slots.map((slot) => {
                const active = slot.slot_start === selectedSlot;
                return (
                  <li key={slot.slot_start}>
                    <button
                      type="button"
                      onClick={() => onSelectSlot(slot.slot_start)}
                      aria-pressed={active}
                      className={cn(
                        "tabular h-11 w-full rounded-[var(--radius-input)] border text-sm transition-colors",
                        active
                          ? "border-brand bg-brand text-white"
                          : "border-line bg-bg-elevated text-ink hover:border-brand"
                      )}
                    >
                      {formatTime(slot.slot_start, locale)}
                    </button>
                  </li>
                );
              })}
            </motion.ul>
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}
