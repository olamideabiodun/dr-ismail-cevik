"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { updateSettings } from "@/lib/admin/actions";
import { Button } from "@/components/ui/Button";
import type { BookingSettings } from "@/lib/booking/queries";

const inputClass =
  "h-11 w-full rounded-[var(--radius-input)] border border-line bg-bg-elevated px-3 text-sm text-ink focus:border-brand focus:outline-none";

export function SettingsForm({ settings }: { settings: BookingSettings }) {
  const t = useTranslations("admin");
  const [pending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState(false);

  const [form, setForm] = useState({
    slotIntervalMin: String(settings.slotIntervalMin),
    minNoticeHours: String(settings.minNoticeHours),
    maxAdvanceDays: String(settings.maxAdvanceDays),
  });

  function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setSaved(false);
    setError(false);
    startTransition(async () => {
      const result = await updateSettings(form);
      if (result.ok) setSaved(true);
      else setError(true);
    });
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <Field
        label={t("slotInterval")}
        value={form.slotIntervalMin}
        min={5}
        max={240}
        step={5}
        onChange={(value) => setForm({ ...form, slotIntervalMin: value })}
      />
      <Field
        label={t("minNotice")}
        value={form.minNoticeHours}
        min={0}
        max={720}
        step={1}
        onChange={(value) => setForm({ ...form, minNoticeHours: value })}
      />
      <Field
        label={t("maxAdvance")}
        value={form.maxAdvanceDays}
        min={1}
        max={365}
        step={1}
        onChange={(value) => setForm({ ...form, maxAdvanceDays: value })}
      />

      <div>
        <span className="mb-2 block text-sm font-medium text-ink">
          {t("timezone")}
        </span>
        {/* Fixed rather than editable: every stored timestamp, every email and
            every rendered slot assumes Europe/Istanbul. Changing it here would
            silently reinterpret existing bookings. */}
        <p className="tabular rounded-[var(--radius-input)] border border-line bg-bg px-3 py-3 text-sm text-muted">
          {settings.timezone}
        </p>
      </div>

      <div className="flex items-center gap-4 pt-2">
        <Button type="submit" disabled={pending}>
          {pending ? t("saving") : t("save")}
        </Button>
        {saved ? (
          <span role="status" className="text-sm text-brand">
            {t("saved")}
          </span>
        ) : null}
        {error ? (
          <span role="alert" className="text-sm text-[#B4442F]">
            {t("saveFailed")}
          </span>
        ) : null}
      </div>
    </form>
  );
}

function Field({
  label,
  value,
  min,
  max,
  step,
  onChange,
}: {
  label: string;
  value: string;
  min: number;
  max: number;
  step: number;
  onChange: (value: string) => void;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium text-ink">{label}</span>
      <input
        type="number"
        value={value}
        min={min}
        max={max}
        step={step}
        onChange={(event) => onChange(event.target.value)}
        className={inputClass}
      />
    </label>
  );
}
