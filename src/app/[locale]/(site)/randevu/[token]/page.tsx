import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Section } from "@/components/ui/Section";
import { ButtonLink } from "@/components/ui/Button";
import { ManageBooking } from "@/components/booking/ManageBooking";
import { getBookingByToken, getBookingSettings } from "@/lib/booking/queries";

type Props = { params: Promise<{ locale: string; token: string }> };

export const metadata: Metadata = {
  // Belt and braces alongside the X-Robots-Tag header in next.config.ts: a
  // booking-management URL contains a live credential and must never be indexed.
  robots: { index: false, follow: false, nocache: true },
};

export default async function ManageBookingPage({ params }: Props) {
  const { locale, token } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("manage");
  const [booking, settings] = await Promise.all([
    getBookingByToken(token),
    getBookingSettings(),
  ]);

  return (
    <main className="pt-20">
      <Section tone="base" className="bg-glow overflow-hidden">
        <div className="container-page max-w-2xl">
          {booking ? (
            <>
              <h1 className="display-md leading-[1.05]">
                {t("title")}
              </h1>
              <p className="mt-5 leading-relaxed text-ink-soft">{t("lead")}</p>

              <div className="mt-12">
                <ManageBooking
                  token={token}
                  booking={booking}
                  maxAdvanceDays={settings.maxAdvanceDays}
                />
              </div>
            </>
          ) : (
            /* Deliberately identical for an invalid token, an expired booking
               and a deleted one — distinguishing them would turn this page into
               an oracle for guessing tokens. */
            <div className="rounded-[var(--radius-card)] border border-line bg-bg-elevated p-8 md:p-12">
              <h1 className="text-2xl">{t("notFoundTitle")}</h1>
              <p className="mt-4 max-w-lg leading-relaxed text-ink-soft">
                {t("notFoundBody")}
              </p>
              <div className="mt-8">
                <ButtonLink href="/randevu">{t("bookNew")}</ButtonLink>
              </div>
            </div>
          )}
        </div>
      </Section>
    </main>
  );
}
