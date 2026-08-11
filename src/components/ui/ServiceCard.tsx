import { Link } from "@/i18n/navigation";
import { Figure } from "@/components/ui/Figure";
import { ServiceIcon } from "@/components/ui/ServiceIcon";
import { AREA_LABEL, type ServiceContent } from "@/content/services";
import type { Locale } from "@/i18n/routing";

/**
 * Treatment card — design.md §5, built on the HorizonX card anatomy:
 * full-bleed image, then a compact content block, then a meta row.
 *
 * Image-led rather than icon-led: a photograph of the procedure orients an
 * anxious patient faster than a line glyph can. The icon survives in the meta
 * row next to the anatomical area, where it labels something true instead of
 * decorating the top of the card.
 *
 * Type is deliberately small — 17px title, 14px description. Restraint is what
 * reads as premium here, not scale.
 *
 * Hover, lift and image scale all live in the `.card` class so they are CSS,
 * gated behind `(hover: hover)`, and identical on every card on the site.
 */
export function ServiceCard({
  service,
  locale,
  priority = false,
}: {
  service: ServiceContent;
  locale: Locale;
  /** Set on the first row so its images are not lazy-loaded above the fold. */
  priority?: boolean;
}) {
  return (
    <Link
      href={`/tedaviler/${service.slug}`}
      className="card group flex h-full flex-col focus-visible:outline-2"
    >
      <div className="card-media relative overflow-hidden">
        <Figure
          src={service.image}
          alt={service.imageAlt[locale]}
          className="aspect-[4/3] w-full"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          priority={priority}
        />
      </div>

      <div className="flex flex-1 flex-col p-5">
        <h3 className="font-display display-xs leading-snug text-ink">
          {service.name[locale]}
        </h3>

        <p className="mt-2 flex-1 text-[0.875rem] leading-relaxed text-ink-soft">
          {service.summary[locale]}
        </p>

        <div className="mt-5 flex items-center justify-between gap-3 border-t border-line pt-4">
          <span className="flex items-center gap-2 text-xs text-muted">
            <span className="inline-flex h-6 w-6 items-center justify-center rounded-[var(--radius-pill)] bg-brand-tint text-brand">
              <ServiceIcon name={service.icon} className="h-3.5 w-3.5" />
            </span>
            {AREA_LABEL[service.icon][locale]}
          </span>

          <svg
            aria-hidden
            viewBox="0 0 24 24"
            className="h-4 w-4 text-brand transition-transform duration-300 group-hover:translate-x-1"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.75}
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M5 12h14M13 6l6 6-6 6" />
          </svg>
        </div>
      </div>
    </Link>
  );
}
