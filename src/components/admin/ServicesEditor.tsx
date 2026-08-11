"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { updateService } from "@/lib/admin/actions";
import { Button } from "@/components/ui/Button";
import type { ServiceRow } from "@/lib/supabase/types";
import type { Locale } from "@/i18n/routing";

const numberInput =
  "h-11 w-20 rounded-[var(--radius-input)] border border-line bg-bg px-3 text-sm text-ink focus:border-brand focus:outline-none";

/**
 * Per-service duration, buffer and visibility.
 *
 * Local state is seeded from the server rows and only pushed on Save, so the
 * doctor can adjust duration and buffer together instead of firing a write on
 * every keystroke.
 */
export function ServicesEditor({
  services,
  locale,
}: {
  services: ServiceRow[];
  locale: Locale;
}) {
  if (services.length === 0) {
    return (
      <p className="rounded-[var(--radius-card)] border border-line bg-bg-elevated p-6 text-sm text-muted">
        —
      </p>
    );
  }

  return (
    <ul className="divide-y divide-line rounded-[var(--radius-card)] border border-line bg-bg-elevated">
      {services.map((service) => (
        <ServiceItem key={service.id} service={service} locale={locale} />
      ))}
    </ul>
  );
}

function ServiceItem({
  service,
  locale,
}: {
  service: ServiceRow;
  locale: Locale;
}) {
  const t = useTranslations("admin");
  const [pending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState(false);

  const [form, setForm] = useState({
    durationMin: String(service.duration_min),
    bufferMin: String(service.buffer_min),
    active: service.active,
  });

  function save(next = form) {
    setSaved(false);
    setError(false);
    startTransition(async () => {
      const result = await updateService({
        slug: service.slug,
        durationMin: next.durationMin,
        bufferMin: next.bufferMin,
        active: next.active,
      });
      if (result.ok) setSaved(true);
      else setError(true);
    });
  }

  return (
    <li className="flex flex-wrap items-end justify-between gap-x-8 gap-y-4 px-5 py-5">
      <div className="min-w-[12rem] flex-1">
        <p className="text-sm text-ink">
          {locale === "tr" ? service.name_tr : service.name_en}
        </p>
        <p className="mt-1 font-mono text-xs text-muted">{service.slug}</p>
      </div>

      <label className="flex flex-col gap-1.5">
        <span className="text-xs text-muted">{t("duration")}</span>
        <input
          type="number"
          min={5}
          max={480}
          step={5}
          value={form.durationMin}
          onChange={(event) =>
            setForm({ ...form, durationMin: event.target.value })
          }
          className={numberInput}
        />
      </label>

      <label className="flex flex-col gap-1.5">
        <span className="text-xs text-muted">{t("buffer")}</span>
        <input
          type="number"
          min={0}
          max={240}
          step={5}
          value={form.bufferMin}
          onChange={(event) =>
            setForm({ ...form, bufferMin: event.target.value })
          }
          className={numberInput}
        />
      </label>

      <label className="flex h-11 items-center gap-2 text-sm text-ink">
        <input
          type="checkbox"
          checked={form.active}
          onChange={(event) => {
            const next = { ...form, active: event.target.checked };
            setForm(next);
            // Visibility is a single decision with no other field to pair with,
            // so it saves immediately rather than waiting for Save.
            save(next);
          }}
          className="h-5 w-5 accent-[var(--brand)]"
        />
        {t("active")}
      </label>

      <div className="flex items-center gap-3">
        <Button size="sm" variant="secondary" disabled={pending} onClick={() => save()}>
          {pending ? t("saving") : t("save")}
        </Button>
        {saved ? (
          <span role="status" className="text-xs text-brand">
            {t("saved")}
          </span>
        ) : null}
        {error ? (
          <span role="alert" className="text-xs text-[#B4442F]">
            {t("saveFailed")}
          </span>
        ) : null}
      </div>
    </li>
  );
}
