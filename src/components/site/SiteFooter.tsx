import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { NAV_ROUTES } from "./nav-routes";
import { CLINIC, DOCTOR } from "@/lib/constants";

export async function SiteFooter() {
  const t = await getTranslations("footer");
  const tNav = await getTranslations("nav");
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-line bg-bg-elevated">
      <div className="container-page py-16 md:py-20">
        <div className="grid gap-12 md:grid-cols-12">
          <div className="md:col-span-5">
            <p className="font-display text-xl tracking-tight text-ink">
              {DOCTOR.name}
            </p>
            <p className="mt-2 max-w-xs text-sm leading-relaxed text-ink-soft">
              {t("tagline")}
            </p>
          </div>

          <nav className="md:col-span-3" aria-label={t("navTitle")}>
            <h2 className="text-xs font-medium uppercase tracking-[0.18em] text-muted">
              {t("navTitle")}
            </h2>
            <ul className="mt-4 space-y-2.5">
              {NAV_ROUTES.map((route) => (
                <li key={route.href}>
                  <Link
                    href={route.href}
                    className="text-sm text-ink-soft transition-colors hover:text-brand"
                  >
                    {tNav(route.key)}
                  </Link>
                </li>
              ))}
              <li>
                <Link
                  href="/randevu"
                  className="text-sm font-medium text-brand hover:underline"
                >
                  {tNav("book")}
                </Link>
              </li>
            </ul>
          </nav>

          <div className="md:col-span-4">
            <h2 className="text-xs font-medium uppercase tracking-[0.18em] text-muted">
              {t("contactTitle")}
            </h2>
            <address className="mt-4 space-y-2.5 not-italic text-sm text-ink-soft">
              <p>{CLINIC.name}</p>
              <p>
                {CLINIC.addressLocality} / {CLINIC.addressRegion}
              </p>
              <p>
                <a
                  href={`tel:${CLINIC.phoneE164}`}
                  className="tabular transition-colors hover:text-brand"
                >
                  {CLINIC.phoneDisplay}
                </a>
              </p>
            </address>

            <h2 className="mt-8 text-xs font-medium uppercase tracking-[0.18em] text-muted">
              {t("followTitle")}
            </h2>
            <a
              href={DOCTOR.instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-flex items-center gap-2 text-sm text-ink-soft transition-colors hover:text-brand"
            >
              <svg
                viewBox="0 0 24 24"
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.5}
                aria-hidden
              >
                <rect x="3" y="3" width="18" height="18" rx="5" />
                <circle cx="12" cy="12" r="4" />
                <circle cx="17.2" cy="6.8" r="1" fill="currentColor" stroke="none" />
              </svg>
              @{DOCTOR.instagramHandle}
            </a>
          </div>
        </div>

        <div className="mt-14 border-t border-line pt-8">
          {/* Required by Turkish medical advertising rules — design.md §10. */}
          <p className="max-w-3xl text-xs leading-relaxed text-muted">
            {t("disclaimer")}
          </p>
          <div className="mt-5 flex flex-col gap-3 text-xs text-muted sm:flex-row sm:items-center sm:justify-between">
            <p>
              © {year} {DOCTOR.name}. {t("rights")}
            </p>
            <Link href="/kvkk" className="transition-colors hover:text-brand">
              {t("kvkk")}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
