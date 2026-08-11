import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { requireAdmin } from "@/lib/admin/auth";
import { AdminNav } from "@/components/admin/AdminNav";
import { SignOutButton } from "@/components/admin/SignOutButton";
import { DOCTOR } from "@/lib/constants";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

/** Reads cookies and live data on every request; never prerender it. */
export const dynamic = "force-dynamic";

export default async function AdminDashboardLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("admin");

  // Redirects to /admin/giris when there is no session. Returns isAdmin=false
  // for a signed-in user who is not on the allow-list — a different situation,
  // and one that deserves a different message than a login prompt.
  const { user, isAdmin } = await requireAdmin(locale);

  if (!isAdmin) {
    return (
      <main className="flex min-h-[100svh] items-center bg-bg py-20">
        <div className="container-page">
          <div className="mx-auto max-w-md rounded-[var(--radius-card)] border border-line bg-bg-elevated p-8 text-center">
            <h1 className="text-xl">{t("notAuthorized")}</h1>
            <p className="mt-3 break-all text-sm text-muted">{user.email}</p>
            <div className="mt-7">
              <SignOutButton />
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <div className="min-h-[100svh] bg-bg">
      <header className="border-b border-line bg-bg-elevated">
        <div className="container-page flex h-16 items-center justify-between gap-6">
          <div className="flex items-baseline gap-3">
            <span className="font-display text-sm tracking-tight text-ink">
              {DOCTOR.name}
            </span>
            <span className="text-xs uppercase tracking-[0.16em] text-brand">
              {t("title")}
            </span>
          </div>
          <div className="flex items-center gap-4">
            <span className="hidden text-xs text-muted sm:inline">
              {user.email}
            </span>
            <SignOutButton />
          </div>
        </div>
      </header>

      <AdminNav />

      <main className="container-page py-10">{children}</main>
    </div>
  );
}
