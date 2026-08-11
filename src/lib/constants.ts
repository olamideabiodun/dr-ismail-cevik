/**
 * Practice constants — design.md §9 (sourced from instagram.com/drismailcevik).
 *
 * TODO(doctor): confirm the full street address and the exact opening hours
 * before launch. Everything else here is verified from his public profile.
 */

export const CLINIC_TIMEZONE = "Europe/Istanbul";

export const DOCTOR = {
  name: "Op. Dr. İsmail Çevik",
  shortName: "Dr. İsmail Çevik",
  instagramHandle: "drismailcevik",
  instagramUrl: "https://www.instagram.com/drismailcevik/",
} as const;

export const CLINIC = {
  name: "Gaziantep Özel Hatem Hastanesi",
  city: "Gaziantep",
  country: "TR",
  // TODO(doctor): full street address (mahalle / cadde / no).
  addressLine: "Gaziantep Özel Hatem Hastanesi",
  addressLocality: "Şehitkamil",
  addressRegion: "Gaziantep",

  /** Display form, as it appears on his Instagram profile. */
  phoneDisplay: "0544 479 2646",
  /** E.164, for tel: and WhatsApp links. */
  phoneE164: "+905444792646",
  whatsappNumber: "905444792646",

  mapsQuery: "Gaziantep Özel Hatem Hastanesi",
} as const;

export const MAPS_EMBED_URL = `https://www.google.com/maps?q=${encodeURIComponent(
  CLINIC.mapsQuery
)}&output=embed`;

export const MAPS_DIRECTIONS_URL = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
  CLINIC.mapsQuery
)}`;

export function whatsappUrl(message: string): string {
  return `https://wa.me/${CLINIC.whatsappNumber}?text=${encodeURIComponent(message)}`;
}

/** Absolute site origin, without a trailing slash. */
export function siteUrl(): string {
  const raw = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  return raw.replace(/\/+$/, "");
}
