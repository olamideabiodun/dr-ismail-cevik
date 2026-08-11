"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useLocale, useTranslations } from "next-intl";
import { Button, ButtonLink } from "@/components/ui/Button";
import { ServiceIcon } from "@/components/ui/ServiceIcon";
import { DateSlotPicker } from "./DateSlotPicker";
import { submitBooking, type BookingSuccess } from "@/lib/booking/actions";
import { detailsFormSchema, type DetailsFormValues } from "@/lib/booking/schema";
import { formatDateTime } from "@/lib/booking/time";
import type { BookableService } from "@/lib/booking/queries";
import type { Locale } from "@/i18n/routing";
import { cn } from "@/lib/utils";

const STEP_COUNT = 3;

export function BookingWizard({
  services,
  maxAdvanceDays,
  initialServiceSlug,
}: {
  services: BookableService[];
  maxAdvanceDays: number;
  initialServiceSlug?: string;
}) {
  const t = useTranslations("booking");
  const tErrors = useTranslations("errors");
  const locale = useLocale() as Locale;
  const reduced = useReducedMotion();

  const preselected = services.find(
    (service) => service.slug === initialServiceSlug
  );

  const [step, setStep] = useState(preselected ? 2 : 1);
  const [serviceSlug, setServiceSlug] = useState<string | null>(
    preselected?.slug ?? null
  );
  const [slot, setSlot] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [success, setSuccess] = useState<BookingSuccess | null>(null);
  const [isPending, startTransition] = useTransition();

  const selectedService = services.find(
    (service) => service.slug === serviceSlug
  );

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<DetailsFormValues>({
    resolver: zodResolver(detailsFormSchema),
    defaultValues: { name: "", email: "", phone: "", notes: "", consent: false },
  });

  /** Validator messages are i18n keys; resolve them here. */
  const message = (key?: string) =>
    key ? (tErrors.has(key) ? tErrors(key) : tErrors("generic")) : undefined;

  function chooseService(slug: string) {
    setServiceSlug(slug);
    // Durations differ per service, so a time picked for another one is void.
    setSlot(null);
    setStep(2);
  }

  function onSubmit(values: DetailsFormValues) {
    if (!serviceSlug || !slot) {
      setFormError("slotRequired");
      return;
    }
    setFormError(null);

    startTransition(async () => {
      const result = await submitBooking({
        serviceSlug,
        startsAt: slot,
        name: values.name,
        email: values.email,
        phone: values.phone,
        notes: values.notes,
        consent: values.consent,
        locale,
      });

      if (result.ok) {
        setSuccess(result);
        return;
      }

      if (result.fieldErrors) {
        for (const [field, key] of Object.entries(result.fieldErrors)) {
          if (field in values) {
            setError(field as keyof DetailsFormValues, { message: key });
          }
        }
      }

      setFormError(result.error);

      // A slot taken while the form was being filled is only fixable by going
      // back a step, so send the patient there rather than leaving them stuck.
      if (result.error === "slot_unavailable" || result.error === "too_soon") {
        setSlot(null);
        setStep(2);
      }
    });
  }

  if (success) {
    return <SuccessPanel result={success} locale={locale} />;
  }

  return (
    <div>
      <Stepper step={step} />

      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={reduced ? { opacity: 0 } : { opacity: 0, x: 16 }}
          animate={{ opacity: 1, x: 0 }}
          exit={reduced ? { opacity: 0 } : { opacity: 0, x: -16 }}
          transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
        >
          {step === 1 ? (
            <section aria-labelledby="step-service">
              <h2 id="step-service" className="text-xl">
                {t("selectService")}
              </h2>
              <ul className="mt-7 grid gap-3 sm:grid-cols-2">
                {services.map((service) => (
                  <li key={service.slug}>
                    <button
                      type="button"
                      onClick={() => chooseService(service.slug)}
                      className={cn(
                        "flex w-full items-start gap-4 rounded-[var(--radius-card)] border p-5 text-left transition-colors",
                        service.slug === serviceSlug
                          ? "border-brand bg-brand-tint"
                          : "border-line bg-bg-elevated hover:border-brand"
                      )}
                    >
                      <span className="mt-0.5 inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-[var(--radius-pill)] bg-brand-tint text-brand">
                        <ServiceIcon name={service.icon} className="h-5 w-5" />
                      </span>
                      <span>
                        <span className="block font-medium text-ink">
                          {service.name}
                        </span>
                        <span className="tabular mt-1 block text-xs text-muted">
                          {t("durationLabelInline", {
                            minutes: service.durationMin,
                          })}
                        </span>
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          {step === 2 && serviceSlug ? (
            <section aria-labelledby="step-date">
              <div className="flex flex-wrap items-baseline justify-between gap-3">
                <h2 id="step-date" className="text-xl">
                  {selectedService?.name}
                </h2>
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="text-sm font-medium text-brand hover:underline"
                >
                  {t("changeSelection")}
                </button>
              </div>

              <div className="mt-8">
                <DateSlotPicker
                  serviceSlug={serviceSlug}
                  maxAdvanceDays={maxAdvanceDays}
                  selectedSlot={slot}
                  onSelectSlot={setSlot}
                />
              </div>

              <div className="mt-10 flex items-center gap-3">
                <Button variant="secondary" onClick={() => setStep(1)}>
                  {t("back")}
                </Button>
                <Button disabled={!slot} onClick={() => setStep(3)}>
                  {t("continue")}
                </Button>
              </div>
            </section>
          ) : null}

          {step === 3 && serviceSlug && slot ? (
            <section aria-labelledby="step-details">
              <h2 id="step-details" className="text-xl">
                {t("yourDetails")}
              </h2>

              <dl className="mt-6 rounded-[var(--radius-card)] border border-line bg-bg-elevated p-5 text-sm">
                <div className="flex justify-between gap-4">
                  <dt className="text-muted">{t("stepService")}</dt>
                  <dd className="text-right text-ink">
                    {selectedService?.name}
                  </dd>
                </div>
                <div className="mt-3 flex justify-between gap-4">
                  <dt className="text-muted">{t("stepDate")}</dt>
                  <dd className="tabular text-right text-ink">
                    {formatDateTime(slot, locale)}
                  </dd>
                </div>
              </dl>

              <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-6" noValidate>
                <Field
                  label={t("name")}
                  error={message(errors.name?.message)}
                  required
                >
                  <input
                    {...register("name")}
                    type="text"
                    autoComplete="name"
                    placeholder={t("namePlaceholder")}
                    className={inputClass}
                  />
                </Field>

                <Field
                  label={t("email")}
                  hint={t("emailHelp")}
                  error={message(errors.email?.message)}
                  required
                >
                  <input
                    {...register("email")}
                    type="email"
                    inputMode="email"
                    autoComplete="email"
                    placeholder={t("emailPlaceholder")}
                    className={inputClass}
                  />
                </Field>

                <Field
                  label={t("phone")}
                  hint={t("phoneHelp")}
                  error={message(errors.phone?.message)}
                >
                  <input
                    {...register("phone")}
                    type="tel"
                    inputMode="tel"
                    autoComplete="tel"
                    placeholder={t("phonePlaceholder")}
                    className={inputClass}
                  />
                </Field>

                <Field label={t("notes")} error={message(errors.notes?.message)}>
                  <textarea
                    {...register("notes")}
                    rows={4}
                    placeholder={t("notesPlaceholder")}
                    className={cn(inputClass, "h-auto resize-y py-3")}
                  />
                </Field>

                <div>
                  <label className="flex cursor-pointer items-start gap-3 text-sm leading-relaxed text-ink-soft">
                    <input
                      {...register("consent")}
                      type="checkbox"
                      className="mt-0.5 h-5 w-5 shrink-0 rounded border-line text-brand accent-[var(--brand)]"
                    />
                    <span>{t("consent")}</span>
                  </label>
                  {errors.consent ? (
                    <p role="alert" className="mt-2 text-sm text-[#B4442F]">
                      {message(errors.consent.message)}
                    </p>
                  ) : null}
                </div>

                {formError ? (
                  <p
                    role="alert"
                    className="rounded-[var(--radius-input)] border border-[#E8C9C1] bg-[#FBF1EF] px-4 py-3 text-sm text-[#B4442F]"
                  >
                    {message(formError)}
                  </p>
                ) : null}

                <div className="flex items-center gap-3 pt-2">
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => setStep(2)}
                  >
                    {t("back")}
                  </Button>
                  <Button type="submit" size="lg" disabled={isPending}>
                    {isPending ? t("submitting") : t("submit")}
                  </Button>
                </div>
              </form>
            </section>
          ) : null}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

const inputClass =
  "h-12 w-full rounded-[var(--radius-input)] border border-line bg-bg-elevated px-4 text-[0.9375rem] text-ink " +
  "placeholder:text-muted focus:border-brand focus:outline-none";

function Field({
  label,
  hint,
  error,
  required,
  children,
}: {
  label: string;
  hint?: string;
  error?: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium text-ink">
        {label}
        {required ? <span className="text-brand"> *</span> : null}
      </span>
      {children}
      {hint && !error ? (
        <span className="mt-1.5 block text-xs text-muted">{hint}</span>
      ) : null}
      {error ? (
        <span role="alert" className="mt-1.5 block text-xs text-[#B4442F]">
          {error}
        </span>
      ) : null}
    </label>
  );
}

function Stepper({ step }: { step: number }) {
  const t = useTranslations("booking");
  const labels = [t("stepService"), t("stepDate"), t("stepDetails")];

  return (
    <ol className="mb-10 flex items-center gap-2 text-sm">
      {labels.map((label, index) => {
        const value = index + 1;
        const done = value < step;
        const active = value === step;
        return (
          <li key={label} className="flex items-center gap-2">
            <span
              aria-current={active ? "step" : undefined}
              className={cn(
                "flex items-center gap-2 rounded-[var(--radius-pill)] px-3 py-1.5",
                active
                  ? "bg-brand text-white"
                  : done
                    ? "bg-brand-tint text-brand"
                    : "text-muted"
              )}
            >
              <span className="tabular text-xs">
                {value}
                <span className="sr-only">
                  {" "}
                  / {STEP_COUNT}
                </span>
              </span>
              <span className="hidden sm:inline">{label}</span>
            </span>
            {value < STEP_COUNT ? (
              <span aria-hidden className="h-px w-4 bg-line" />
            ) : null}
          </li>
        );
      })}
    </ol>
  );
}

function SuccessPanel({
  result,
  locale,
}: {
  result: BookingSuccess;
  locale: Locale;
}) {
  const t = useTranslations("booking");

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-[var(--radius-card)] border border-line bg-bg-elevated p-8 md:p-12"
    >
      <span className="inline-flex h-14 w-14 items-center justify-center rounded-[var(--radius-pill)] bg-brand-tint text-brand">
        <svg
          viewBox="0 0 24 24"
          className="h-7 w-7"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.75}
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden
        >
          <path d="M20 6L9 17l-5-5" />
        </svg>
      </span>

      <h2 className="mt-7 text-2xl">{t("successTitle")}</h2>

      <p className="mt-4 max-w-lg leading-relaxed text-ink-soft">
        {result.emailSent
          ? t("successLead", { email: result.email })
          : t("successEmailFailedLead")}
      </p>

      <dl className="mt-8 space-y-3 border-t border-line pt-6 text-sm">
        <div className="flex justify-between gap-4">
          <dt className="text-muted">{t("stepService")}</dt>
          <dd className="text-right text-ink">{result.serviceName}</dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-muted">{t("stepDate")}</dt>
          <dd className="tabular text-right text-ink">
            {formatDateTime(result.startsAt, locale)}
          </dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-muted">{t("referenceCode")}</dt>
          <dd className="tabular text-right font-medium tracking-wider text-ink">
            {result.referenceCode}
          </dd>
        </div>
      </dl>

      <p className="mt-6 text-sm leading-relaxed text-ink-soft">
        {t("successNote")}
      </p>

      <div className="mt-8">
        <ButtonLink href="/" variant="secondary">
          {t("backHome")}
        </ButtonLink>
      </div>
    </motion.div>
  );
}
