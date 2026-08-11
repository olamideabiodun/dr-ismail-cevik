"use client";

import { useState, useTransition } from "react";
import { motion } from "motion/react";
import { useLocale, useTranslations } from "next-intl";
import { Button, ButtonLink } from "@/components/ui/Button";
import { DateSlotPicker } from "./DateSlotPicker";
import {
  cancelBookingAction,
  rescheduleBookingAction,
} from "@/lib/booking/actions";
import { formatDateTime } from "@/lib/booking/time";
import type { BookingByToken } from "@/lib/supabase/types";
import type { Locale } from "@/i18n/routing";

type Mode = "view" | "rescheduling" | "cancelled" | "rescheduled";

/**
 * Guest self-service for a single booking. The token in the URL is the only
 * credential — there is no account, by design (BUILD_PROMPT: "no patient login").
 */
export function ManageBooking({
  token,
  booking,
  maxAdvanceDays,
}: {
  token: string;
  booking: BookingByToken;
  maxAdvanceDays: number;
}) {
  const t = useTranslations("manage");
  const tBooking = useTranslations("booking");
  const tErrors = useTranslations("errors");
  const locale = useLocale() as Locale;

  const [mode, setMode] = useState<Mode>("view");
  const [startsAt, setStartsAt] = useState(booking.booking_starts_at);
  const [newSlot, setNewSlot] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const message = (key: string) =>
    tErrors.has(key) ? tErrors(key) : tErrors("generic");

  const serviceName =
    locale === "tr" ? booking.service_name_tr : booking.service_name_en;

  const statusLabel = {
    pending: t("statusPending"),
    confirmed: t("statusConfirmed"),
    cancelled: t("statusCancelled"),
    completed: t("statusCompleted"),
  }[booking.booking_status];

  const alreadyCancelled =
    booking.booking_status === "cancelled" || mode === "cancelled";

  function onCancel() {
    setError(null);
    startTransition(async () => {
      const result = await cancelBookingAction(token);
      if (result.ok) setMode("cancelled");
      else setError(result.error);
    });
  }

  function onReschedule() {
    if (!newSlot) return;
    setError(null);
    startTransition(async () => {
      const result = await rescheduleBookingAction(token, newSlot);
      if (result.ok) {
        setStartsAt(result.startsAt);
        setMode("rescheduled");
        setNewSlot(null);
      } else {
        setError(result.error);
      }
    });
  }

  if (alreadyCancelled) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-[var(--radius-card)] border border-line bg-bg-elevated p-8 md:p-12"
      >
        <h2 className="text-2xl">{t("cancelledTitle")}</h2>
        <p className="mt-4 max-w-lg leading-relaxed text-ink-soft">
          {t("cancelledBody")}
        </p>
        <div className="mt-8">
          <ButtonLink href="/randevu">{t("bookNew")}</ButtonLink>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="space-y-8">
      {mode === "rescheduled" ? (
        <p
          role="status"
          className="rounded-[var(--radius-input)] border border-brand-300 bg-brand-tint px-4 py-3 text-sm text-brand-600"
        >
          {t("rescheduledTitle")}
        </p>
      ) : null}

      <div className="rounded-[var(--radius-card)] border border-line bg-bg-elevated p-8">
        <dl className="space-y-4 text-sm">
          <div className="flex justify-between gap-4">
            <dt className="text-muted">{t("status")}</dt>
            <dd className="text-right text-ink">{statusLabel}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-muted">{t("service")}</dt>
            <dd className="text-right text-ink">{serviceName}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-muted">{t("dateTime")}</dt>
            <dd className="tabular text-right text-ink">
              {formatDateTime(startsAt, locale)}
            </dd>
          </div>
          <div className="flex justify-between gap-4 border-t border-line pt-4">
            <dt className="text-muted">{tBooking("referenceCode")}</dt>
            <dd className="tabular text-right font-medium tracking-wider text-ink">
              {booking.booking_reference}
            </dd>
          </div>
        </dl>
      </div>

      {error ? (
        <p
          role="alert"
          className="rounded-[var(--radius-input)] border border-[#E8C9C1] bg-[#FBF1EF] px-4 py-3 text-sm text-[#B4442F]"
        >
          {message(error)}
        </p>
      ) : null}

      <div className="rounded-[var(--radius-card)] border border-line bg-bg-elevated p-8">
        <h2 className="text-lg">{t("rescheduleTitle")}</h2>
        <p className="mt-3 text-sm leading-relaxed text-ink-soft">
          {t("rescheduleBody")}
        </p>

        {mode === "rescheduling" ? (
          <div className="mt-8">
            <DateSlotPicker
              serviceSlug={booking.service_slug}
              maxAdvanceDays={maxAdvanceDays}
              selectedSlot={newSlot}
              onSelectSlot={setNewSlot}
            />
            <div className="mt-8 flex items-center gap-3">
              <Button variant="secondary" onClick={() => setMode("view")}>
                {tBooking("back")}
              </Button>
              <Button disabled={!newSlot || isPending} onClick={onReschedule}>
                {isPending ? t("rescheduling") : t("rescheduleButton")}
              </Button>
            </div>
          </div>
        ) : (
          <div className="mt-6">
            <Button variant="secondary" onClick={() => setMode("rescheduling")}>
              {t("rescheduleTitle")}
            </Button>
          </div>
        )}
      </div>

      <div className="rounded-[var(--radius-card)] border border-line bg-bg-elevated p-8">
        <h2 className="text-lg">{t("cancelTitle")}</h2>
        <p className="mt-3 max-w-lg text-sm leading-relaxed text-ink-soft">
          {t("cancelBody")}
        </p>
        <div className="mt-6">
          <Button
            variant="secondary"
            disabled={isPending}
            onClick={onCancel}
            className="border-[#E8C9C1] text-[#B4442F] hover:border-[#B4442F] hover:text-[#B4442F]"
          >
            {isPending ? t("cancelling") : t("cancelButton")}
          </Button>
        </div>
      </div>
    </div>
  );
}
