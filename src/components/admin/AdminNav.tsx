"use client";

import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

const LINKS = [
  { href: "/admin", key: "navAppointments" },
  { href: "/admin/musaitlik", key: "navAvailability" },
  { href: "/admin/hizmetler", key: "navServices" },
  { href: "/admin/ayarlar", key: "navSettings" },
] as const;

export function AdminNav() {
  const t = useTranslations("admin");
  const pathname = usePathname();

  return (
    <nav className="border-b border-line bg-bg-elevated" aria-label={t("title")}>
      <ul className="container-page no-scrollbar flex gap-1 overflow-x-auto">
        {LINKS.map((link) => {
          // "/admin" would otherwise match every child route.
          const active =
            link.href === "/admin"
              ? pathname === "/admin"
              : pathname.startsWith(link.href);

          return (
            <li key={link.href}>
              <Link
                href={link.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "-mb-px inline-flex h-12 items-center whitespace-nowrap border-b-2 px-4 text-sm transition-colors",
                  active
                    ? "border-brand text-brand"
                    : "border-transparent text-ink-soft hover:text-ink"
                )}
              >
                {t(link.key)}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
