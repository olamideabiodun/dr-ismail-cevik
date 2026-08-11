"use client";

import { useEffect } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/Button";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const t = useTranslations("errors");

  useEffect(() => {
    // The digest is the only safe identifier to surface: the message itself may
    // carry query details, and this app's errors sit close to patient records.
    console.error("Route error", error.digest);
  }, [error]);

  return (
    <main className="flex min-h-[70svh] items-center pt-20">
      <div className="container-page text-center">
        <h1 className="display-md">{t("errorTitle")}</h1>
        <p className="mx-auto mt-4 max-w-md leading-relaxed text-ink-soft">
          {t("errorBody")}
        </p>
        <div className="mt-10">
          <Button onClick={reset} size="lg">
            {t("retry")}
          </Button>
        </div>
      </div>
    </main>
  );
}
