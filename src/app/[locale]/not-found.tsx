import { getTranslations } from "next-intl/server";
import { ButtonLink } from "@/components/ui/Button";

export default async function NotFound() {
  const t = await getTranslations("errors");

  return (
    <main className="flex min-h-[70svh] items-center pt-20">
      <div className="container-page text-center">
        <p className="tabular font-display text-6xl text-brand-300">404</p>
        <h1 className="mt-6 display-md">
          {t("notFoundTitle")}
        </h1>
        <p className="mx-auto mt-4 max-w-md leading-relaxed text-ink-soft">
          {t("notFoundBody")}
        </p>
        <div className="mt-10">
          <ButtonLink href="/" size="lg">
            {t("backHome")}
          </ButtonLink>
        </div>
      </div>
    </main>
  );
}
