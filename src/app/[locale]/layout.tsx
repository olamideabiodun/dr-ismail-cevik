import type { Metadata } from "next";
import { DM_Sans, Poppins } from "next/font/google";
import { notFound } from "next/navigation";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { getMessages, getTranslations, setRequestLocale } from "next-intl/server";
import { routing } from "@/i18n/routing";
import { siteUrl } from "@/lib/constants";
import "../globals.css";

/* Poppins for headings, DM Sans for everything that gets read.
   Only the weights actually used are requested — each extra weight is another
   font file on the critical path (design.md §8).
   latin-ext is required for ç ğ ı İ ö ş ü. */
const poppins = Poppins({
  subsets: ["latin", "latin-ext"],
  variable: "--font-poppins",
  display: "swap",
  weight: ["500", "600"],
});

const dmSans = DM_Sans({
  subsets: ["latin", "latin-ext"],
  variable: "--font-dm-sans",
  display: "swap",
  weight: ["400", "500"],
});

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

type LocaleParams = { params: Promise<{ locale: string }> };

export async function generateMetadata({
  params,
}: LocaleParams): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta" });
  const base = siteUrl();

  return {
    metadataBase: new URL(base),
    title: { default: t("title"), template: `%s — Op. Dr. İsmail Çevik` },
    description: t("description"),
    alternates: {
      canonical: locale === routing.defaultLocale ? "/" : `/${locale}`,
      languages: { tr: "/", en: "/en" },
    },
    openGraph: {
      type: "website",
      siteName: "Op. Dr. İsmail Çevik",
      title: t("title"),
      description: t("description"),
      locale: locale === "tr" ? "tr_TR" : "en_GB",
    },
    twitter: { card: "summary_large_image" },
    robots: { index: true, follow: true },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: LocaleParams & { children: React.ReactNode }) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();

  // Opts this layout (and everything under it) into static rendering.
  setRequestLocale(locale);
  const messages = await getMessages();

  return (
    <html
      lang={locale}
      // Next 16 stopped overriding scroll-behavior during navigation unless this
      // attribute is present. Without it, `scroll-behavior: smooth` from
      // globals.css would make every route change scroll slowly to the top.
      data-scroll-behavior="smooth"
      className={`${dmSans.variable} ${poppins.variable}`}
    >
      <body className="bg-bg text-ink antialiased">
        {/* Chrome lives in the route-group layouts below this one: the public
            site gets the header/footer, the admin panel gets its own. */}
        <NextIntlClientProvider locale={locale} messages={messages}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
