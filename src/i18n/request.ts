import { getRequestConfig } from "next-intl/server";
import { hasLocale } from "next-intl";
import { routing } from "./routing";
import { CLINIC_TIMEZONE } from "@/lib/constants";

export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;
  const locale = hasLocale(routing.locales, requested)
    ? requested
    : routing.defaultLocale;

  return {
    locale,
    // Pinning the timezone matters more than usual here: appointment times are
    // rendered on the server and again on the client, and any drift between the
    // two would show a patient the wrong hour. Everything is Europe/Istanbul,
    // regardless of where the visitor's browser thinks it is.
    timeZone: CLINIC_TIMEZONE,
    messages: (await import(`../../messages/${locale}.json`)).default,
  };
});
