import type { ServiceIcon as IconName } from "@/content/services";

/**
 * Line icons for the service cards — design.md §5.
 * Drawn on a 24px grid with a 1.5 stroke so they sit at the same optical weight
 * as Inter at body size. Decorative: the card's title carries the meaning.
 */
export function ServiceIcon({
  name,
  className = "h-6 w-6",
}: {
  name: IconName;
  className?: string;
}) {
  const common = {
    className,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.5,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
    focusable: false,
  };

  switch (name) {
    case "nose":
      return (
        <svg {...common}>
          <path d="M13 3c0 4 1.5 6.5 3.5 9.5 1 1.5 1.5 2.5 1.5 3.8A4.7 4.7 0 0 1 13.3 21c-1.4 0-2.3-.5-3.3-1.2" />
          <path d="M7.5 15.5c1.2 0 2 .8 2 2" />
        </svg>
      );
    case "wave":
      return (
        <svg {...common}>
          <path d="M2 12c1.5-3 3-3 4.5 0S9.5 15 11 12s3-3 4.5 0 3 3 4.5 0" />
          <path d="M2 17c1.5-2 3-2 4.5 0s3 2 4.5 0" opacity="0.5" />
        </svg>
      );
    case "sinus":
      return (
        <svg {...common}>
          <path d="M12 4c-3.5 0-6 2.4-6 5.6 0 2.3 1 3.6 1 5.4 0 1.7 1.3 3 3 3h4c1.7 0 3-1.3 3-3 0-1.8 1-3.1 1-5.4C18 6.4 15.5 4 12 4Z" />
          <path d="M12 9v4" />
        </svg>
      );
    case "sleep":
      return (
        <svg {...common}>
          <path d="M20.5 14.5A8.5 8.5 0 0 1 9.5 3.5a8.5 8.5 0 1 0 11 11Z" />
          <path d="M15 4h4l-4 4h4" />
        </svg>
      );
    case "voice":
      return (
        <svg {...common}>
          <rect x="9" y="2.5" width="6" height="11" rx="3" />
          <path d="M5.5 11a6.5 6.5 0 0 0 13 0" />
          <path d="M12 17.5V21" />
        </svg>
      );
    case "ear":
      return (
        <svg {...common}>
          <path d="M7 9a5 5 0 1 1 10 0c0 2.5-2 3.4-3 4.6-.8 1-.7 2-.7 2.9A2.5 2.5 0 0 1 10.8 19c-1.3 0-2.3-.9-2.6-2" />
          <path d="M10.5 9a1.5 1.5 0 0 1 3 0c0 1-.8 1.4-1.2 2" />
        </svg>
      );
    case "eye":
      return (
        <svg {...common}>
          <path d="M2.5 12S6 6.5 12 6.5 21.5 12 21.5 12 18 17.5 12 17.5 2.5 12 2.5 12Z" />
          <circle cx="12" cy="12" r="2.75" />
        </svg>
      );
    case "child":
      return (
        <svg {...common}>
          <circle cx="12" cy="8" r="4" />
          <path d="M5 21a7 7 0 0 1 14 0" />
          <path d="M10 7.5h.01M14 7.5h.01" />
        </svg>
      );
    case "face":
    default:
      return (
        <svg {...common}>
          <path d="M12 3c4.4 0 7.5 3 7.5 7.2 0 5-3.4 10.8-7.5 10.8S4.5 15.2 4.5 10.2C4.5 6 7.6 3 12 3Z" />
          <path d="M9.5 10h.01M14.5 10h.01" />
          <path d="M10 14.5c.6.5 1.3.8 2 .8s1.4-.3 2-.8" />
        </svg>
      );
  }
}
