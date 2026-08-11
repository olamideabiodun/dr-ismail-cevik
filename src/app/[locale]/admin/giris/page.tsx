import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { LoginForm } from "@/components/admin/LoginForm";
import { localeHref } from "@/lib/admin/auth";
import { DOCTOR } from "@/lib/constants";

type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ next?: string }>;
};

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default async function AdminLoginPage({ params, searchParams }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const { next } = await searchParams;
  const t = await getTranslations("admin");

  // Only accept a same-site absolute path inside /admin. Without this check the
  // `next` parameter would be an open redirect.
  const safeNext =
    next && next.startsWith("/admin") && !next.startsWith("//")
      ? next
      : "/admin";

  return (
    <main className="flex min-h-[100svh] items-center bg-bg py-20">
      <div className="container-page">
        <div className="mx-auto w-full max-w-md rounded-[var(--radius-card)] border border-line bg-bg-elevated p-8 md:p-10">
          <p className="font-display text-sm tracking-tight text-brand">
            {DOCTOR.name}
          </p>
          <h1 className="mt-4 text-2xl">{t("signInTitle")}</h1>
          <p className="mt-3 text-sm leading-relaxed text-ink-soft">
            {t("signInLead")}
          </p>

          <div className="mt-8">
            <LoginForm nextPath={localeHref(locale, safeNext)} />
          </div>
        </div>
      </div>
    </main>
  );
}
