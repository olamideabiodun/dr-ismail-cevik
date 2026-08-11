import { setRequestLocale } from "next-intl/server";
import { Hero } from "@/components/home/Hero";
import { ServicesGrid } from "@/components/home/ServicesGrid";
import { GalleryFan } from "@/components/home/GalleryFan";
import { TrustSection } from "@/components/home/TrustSection";
import { Testimonials } from "@/components/home/Testimonials";
import { BlogTeaser } from "@/components/home/BlogTeaser";
import { BookingCta } from "@/components/home/BookingCta";
import { CLINIC, DOCTOR, siteUrl } from "@/lib/constants";

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  // Physician structured data — helps the practice surface correctly in local
  // search, which matters more than usual for a single-city clinic.
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Physician",
    name: DOCTOR.name,
    medicalSpecialty: "Otolaryngologic",
    url: siteUrl(),
    telephone: CLINIC.phoneE164,
    sameAs: [DOCTOR.instagramUrl],
    address: {
      "@type": "PostalAddress",
      streetAddress: CLINIC.addressLine,
      addressLocality: CLINIC.addressLocality,
      addressRegion: CLINIC.addressRegion,
      addressCountry: CLINIC.country,
    },
    parentOrganization: {
      "@type": "Hospital",
      name: CLINIC.name,
    },
  };

  return (
    <main>
      <script
        type="application/ld+json"
        // Every value comes from the literal above, never from user input.
        // `<` is still escaped so no future edit can close the script tag early.
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
        }}
      />
      <Hero />
      <ServicesGrid />
      <GalleryFan />
      <TrustSection />
      <Testimonials />
      <BlogTeaser />
      <BookingCta />
    </main>
  );
}
