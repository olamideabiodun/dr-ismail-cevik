"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import {
  createAvailabilityException,
  createAvailabilityRule,
  deleteAvailabilityException,
  deleteAvailabilityRule,
} from "@/lib/admin/actions";
import { Button } from "@/components/ui/Button";
import { todayKey } from "@/lib/booking/time";
import type {
  AvailabilityExceptionRow,
  AvailabilityRuleRow,
} from "@/lib/supabase/types";

const inputClass =
  "h-11 rounded-[var(--radius-input)] border border-line bg-bg-elevated px-3 text-sm text-ink focus:border-brand focus:outline-none";

/** Postgres EXTRACT(DOW) order: Sunday first. */
const WEEKDAYS = [0, 1, 2, 3, 4, 5, 6] as const;

export function AvailabilityEditor({
  rules,
  exceptions,
}: {
  rules: AvailabilityRuleRow[];
  exceptions: AvailabilityExceptionRow[];
}) {
  const t = useTranslations("admin");
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [newRule, setNewRule] = useState({
    weekday: "1",
    startTime: "09:00",
    endTime: "12:30",
  });

  const [newException, setNewException] = useState({
    date: todayKey(),
    isClosed: true,
    startTime: "09:00",
    endTime: "13:00",
    note: "",
  });

  function run(action: () => Promise<{ ok: boolean; error?: string }>) {
    setError(null);
    startTransition(async () => {
      const result = await action();
      if (!result.ok) setError(result.error ?? "generic");
    });
  }

  // Group the flat rule list by day so the week reads as a schedule.
  const rulesByDay = WEEKDAYS.map((weekday) => ({
    weekday,
    entries: rules.filter((rule) => rule.weekday === weekday),
  }));

  return (
    <div className="space-y-12">
      {error ? (
        <p
          role="alert"
          className="rounded-[var(--radius-input)] border border-[#E8C9C1] bg-[#FBF1EF] px-4 py-3 text-sm text-[#B4442F]"
        >
          {t(error === "notAuthorized" ? "notAuthorized" : "saveFailed")}
        </p>
      ) : null}

      {/* ---------------------------------------------------------------- */}
      <section>
        <h2 className="text-sm font-medium uppercase tracking-[0.14em] text-muted">
          {t("weeklyRules")}
        </h2>

        <ul className="mt-4 divide-y divide-line rounded-[var(--radius-card)] border border-line bg-bg-elevated">
          {rulesByDay.map(({ weekday, entries }) => (
            <li
              key={weekday}
              className="flex flex-wrap items-center gap-x-6 gap-y-2 px-5 py-4"
            >
              <span className="w-28 shrink-0 text-sm text-ink">
                {t(`weekdays.${weekday}`)}
              </span>

              {entries.length === 0 ? (
                <span className="text-sm text-muted">—</span>
              ) : (
                <span className="flex flex-wrap gap-2">
                  {entries.map((rule) => (
                    <span
                      key={rule.id}
                      className="tabular inline-flex items-center gap-2 rounded-[var(--radius-pill)] bg-brand-tint px-3 py-1 text-xs text-brand-600"
                    >
                      {rule.start_time.slice(0, 5)} – {rule.end_time.slice(0, 5)}
                      <button
                        type="button"
                        disabled={pending}
                        aria-label={`${t("delete")} ${rule.start_time.slice(0, 5)}`}
                        onClick={() =>
                          run(() => deleteAvailabilityRule(rule.id))
                        }
                        className="text-brand-600/70 transition-colors hover:text-[#B4442F]"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </span>
              )}
            </li>
          ))}
        </ul>

        <form
          className="mt-5 flex flex-wrap items-end gap-3"
          onSubmit={(event) => {
            event.preventDefault();
            run(() => createAvailabilityRule(newRule));
          }}
        >
          <label className="flex flex-col gap-1.5">
            <span className="text-xs text-muted">{t("weekday")}</span>
            <select
              value={newRule.weekday}
              onChange={(event) =>
                setNewRule({ ...newRule, weekday: event.target.value })
              }
              className={inputClass}
            >
              {WEEKDAYS.map((day) => (
                <option key={day} value={String(day)}>
                  {t(`weekdays.${day}`)}
                </option>
              ))}
            </select>
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="text-xs text-muted">{t("startTime")}</span>
            <input
              type="time"
              value={newRule.startTime}
              onChange={(event) =>
                setNewRule({ ...newRule, startTime: event.target.value })
              }
              className={inputClass}
            />
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="text-xs text-muted">{t("endTime")}</span>
            <input
              type="time"
              value={newRule.endTime}
              onChange={(event) =>
                setNewRule({ ...newRule, endTime: event.target.value })
              }
              className={inputClass}
            />
          </label>

          <Button type="submit" size="sm" disabled={pending}>
            {t("addRule")}
          </Button>
        </form>
      </section>

      {/* ---------------------------------------------------------------- */}
      <section>
        <h2 className="text-sm font-medium uppercase tracking-[0.14em] text-muted">
          {t("exceptions")}
        </h2>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-ink-soft">
          {t("exceptionsLead")}
        </p>

        <ul className="mt-4 divide-y divide-line rounded-[var(--radius-card)] border border-line bg-bg-elevated">
          {exceptions.length === 0 ? (
            <li className="px-5 py-4 text-sm text-muted">—</li>
          ) : (
            exceptions.map((exception) => (
              <li
                key={exception.id}
                className="flex flex-wrap items-center justify-between gap-3 px-5 py-4"
              >
                <span className="flex flex-wrap items-center gap-3">
                  <span className="tabular text-sm text-ink">
                    {exception.date}
                  </span>
                  <span className="text-sm text-ink-soft">
                    {exception.is_closed
                      ? t("closedAllDay")
                      : `${exception.start_time?.slice(0, 5)} – ${exception.end_time?.slice(0, 5)}`}
                  </span>
                  {exception.note ? (
                    <span className="text-xs text-muted">{exception.note}</span>
                  ) : null}
                </span>

                <button
                  type="button"
                  disabled={pending}
                  onClick={() =>
                    run(() => deleteAvailabilityException(exception.id))
                  }
                  className="text-xs text-[#B4442F] hover:underline"
                >
                  {t("delete")}
                </button>
              </li>
            ))
          )}
        </ul>

        <form
          className="mt-5 flex flex-wrap items-end gap-3"
          onSubmit={(event) => {
            event.preventDefault();
            run(() => createAvailabilityException(newException));
          }}
        >
          <label className="flex flex-col gap-1.5">
            <span className="text-xs text-muted">{t("date")}</span>
            <input
              type="date"
              value={newException.date}
              min={todayKey()}
              onChange={(event) =>
                setNewException({ ...newException, date: event.target.value })
              }
              className={inputClass}
            />
          </label>

          <label className="flex h-11 items-center gap-2 text-sm text-ink">
            <input
              type="checkbox"
              checked={newException.isClosed}
              onChange={(event) =>
                setNewException({
                  ...newException,
                  isClosed: event.target.checked,
                })
              }
              className="h-5 w-5 accent-[var(--brand)]"
            />
            {t("closedAllDay")}
          </label>

          {/* Times only apply to a partial-day override. */}
          {!newException.isClosed ? (
            <>
              <label className="flex flex-col gap-1.5">
                <span className="text-xs text-muted">{t("startTime")}</span>
                <input
                  type="time"
                  value={newException.startTime}
                  onChange={(event) =>
                    setNewException({
                      ...newException,
                      startTime: event.target.value,
                    })
                  }
                  className={inputClass}
                />
              </label>
              <label className="flex flex-col gap-1.5">
                <span className="text-xs text-muted">{t("endTime")}</span>
                <input
                  type="time"
                  value={newException.endTime}
                  onChange={(event) =>
                    setNewException({
                      ...newException,
                      endTime: event.target.value,
                    })
                  }
                  className={inputClass}
                />
              </label>
            </>
          ) : null}

          <label className="flex flex-col gap-1.5">
            <span className="text-xs text-muted">{t("note")}</span>
            <input
              type="text"
              value={newException.note}
              maxLength={200}
              onChange={(event) =>
                setNewException({ ...newException, note: event.target.value })
              }
              className={inputClass}
            />
          </label>

          <Button type="submit" size="sm" disabled={pending}>
            {t("addException")}
          </Button>
        </form>
      </section>
    </div>
  );
}
