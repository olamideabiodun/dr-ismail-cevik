import { setRequestLocale } from "next-intl/server";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { ScrollProgress } from "@/components/motion/ScrollProgress";

/**
 * Chrome for the public site. `(site)` is a route group, so it adds this
 * header/footer without appearing in any URL — /hakkimda stays /hakkimda.
 * The admin panel sits outside this group and therefore never inherits it.
 */
export default async function SiteLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <>
      <ScrollProgress />
      <SiteHeader />
      <div id="main">{children}</div>
      <SiteFooter />
    </>
  );
}
