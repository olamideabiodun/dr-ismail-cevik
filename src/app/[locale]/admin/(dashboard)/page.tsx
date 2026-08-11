import { getLocale, getTranslations, setRequestLocale } from "next-intl/server";
import { createServerSupabase } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { AppointmentActions } from "@/components/admin/AppointmentActions";
import { formatDateTime } from "@/lib/booking/time";
import type { AppointmentRow, ServiceRow } from "@/lib/supabase/types";
import type { Locale } from "@/i18n/routing";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ locale: string }> };

export default async function AdminAppointmentsPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("admin");
  const activeLocale = (await getLocale()) as Locale;

  if (!isSupabaseConfigured()) {
    return <p className="text-ink-soft">{t("noAppointments")}</p>;
  }

  const supabase = await createServerSupabase();
  const nowIso = new Date().toISOString();

  // Two flat queries plus a join in memory. A PostgREST embedded select would
  // need Relationships metadata this hand-written schema does not carry, and
  // the services table is a dozen rows.
  const [upcomingResult, pastResult, servicesResult] = await Promise.all([
    supabase
      .from("appointments")
      .select("*")
      .gte("starts_at", nowIso)
      .order("starts_at", { ascending: true }),
    supabase
      .from("appointments")
      .select("*")
      .lt("starts_at", nowIso)
      .order("starts_at", { ascending: false })
      .limit(50),
    supabase.from("services").select("*"),
  ]);

  const services = (servicesResult.data ?? []) as ServiceRow[];
  const serviceName = (id: string) => {
    const service = services.find((item) => item.id === id);
    if (!service) return "—";
    return activeLocale === "tr" ? service.name_tr : service.name_en;
  };

  const upcoming = (upcomingResult.data ?? []) as AppointmentRow[];
  const past = (pastResult.data ?? []) as AppointmentRow[];

  return (
    <div className="space-y-14">
      <section>
        <h1 className="text-xl">{t("appointmentsTitle")}</h1>
        <h2 className="mt-8 text-sm font-medium uppercase tracking-[0.14em] text-muted">
          {t("upcoming")}
        </h2>
        <AppointmentTable
          rows={upcoming}
          serviceName={serviceName}
          locale={activeLocale}
          emptyLabel={t("noAppointments")}
          showActions
        />
      </section>

      <section>
        <h2 className="text-sm font-medium uppercase tracking-[0.14em] text-muted">
          {t("past")}
        </h2>
        <AppointmentTable
          rows={past}
          serviceName={serviceName}
          locale={activeLocale}
          emptyLabel={t("noAppointments")}
        />
      </section>
    </div>
  );
}

async function AppointmentTable({
  rows,
  serviceName,
  locale,
  emptyLabel,
  showActions = false,
}: {
  rows: AppointmentRow[];
  serviceName: (id: string) => string;
  locale: Locale;
  emptyLabel: string;
  showActions?: boolean;
}) {
  const t = await getTranslations("admin");
  // The patient-facing status wording is already translated; reuse it rather
  // than maintaining a second set of labels that could drift.
  const tStatus = await getTranslations("manage");

  if (rows.length === 0) {
    return (
      <p className="mt-4 rounded-[var(--radius-card)] border border-line bg-bg-elevated p-6 text-sm text-muted">
        {emptyLabel}
      </p>
    );
  }

  const statusLabel: Record<string, string> = {
    pending: tStatus("statusPending"),
    confirmed: tStatus("statusConfirmed"),
    cancelled: tStatus("statusCancelled"),
    completed: tStatus("statusCompleted"),
  };

  return (
    <div className="mt-4 overflow-x-auto rounded-[var(--radius-card)] border border-line bg-bg-elevated">
      <table className="w-full min-w-[52rem] text-left text-sm">
        <thead>
          <tr className="border-b border-line text-xs uppercase tracking-wider text-muted">
            <th className="px-5 py-3 font-medium">{t("when")}</th>
            <th className="px-5 py-3 font-medium">{t("patient")}</th>
            <th className="px-5 py-3 font-medium">{t("service")}</th>
            <th className="px-5 py-3 font-medium">{t("contact")}</th>
            <th className="px-5 py-3 font-medium">{t("status")}</th>
            {showActions ? (
              <th className="px-5 py-3 font-medium">{t("actions")}</th>
            ) : null}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id} className="border-b border-line last:border-0">
              <td className="tabular whitespace-nowrap px-5 py-4 text-ink">
                {formatDateTime(row.starts_at, locale)}
              </td>
              <td className="px-5 py-4">
                <span className="block text-ink">{row.patient_name}</span>
                <span className="tabular block text-xs text-muted">
                  {row.reference_code}
                </span>
                {row.notes ? (
                  <span className="mt-1 block max-w-xs text-xs text-ink-soft">
                    {row.notes}
                  </span>
                ) : null}
              </td>
              <td className="px-5 py-4 text-ink-soft">
                {serviceName(row.service_id)}
              </td>
              <td className="px-5 py-4">
                <a
                  href={`mailto:${row.patient_email}`}
                  className="block break-all text-brand hover:underline"
                >
                  {row.patient_email}
                </a>
                {row.patient_phone ? (
                  <a
                    href={`tel:${row.patient_phone}`}
                    className="tabular block text-ink-soft hover:text-brand"
                  >
                    {row.patient_phone}
                  </a>
                ) : null}
              </td>
              <td className="px-5 py-4">
                <StatusPill status={row.status} label={statusLabel[row.status]} />
              </td>
              {showActions ? (
                <td className="px-5 py-4">
                  <AppointmentActions id={row.id} status={row.status} />
                </td>
              ) : null}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function StatusPill({ status, label }: { status: string; label?: string }) {
  const tones: Record<string, string> = {
    pending: "bg-[#FBF3E3] text-[#8A6A1F]",
    confirmed: "bg-brand-tint text-brand-600",
    cancelled: "bg-[#FBF1EF] text-[#B4442F]",
    completed: "bg-line text-ink-soft",
  };

  return (
    <span
      className={`inline-block whitespace-nowrap rounded-[var(--radius-pill)] px-3 py-1 text-xs ${
        tones[status] ?? tones.completed
      }`}
    >
      {label ?? status}
    </span>
  );
}
