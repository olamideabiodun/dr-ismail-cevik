import { Fragment, type CSSProperties } from "react";

type Props = {
  text: string;
  className?: string;
  as?: "h1" | "h2" | "p" | "span";
  delay?: number;
};

/**
 * Per-word mask reveal for the hero headline: each word rises out from
 * behind an overflow-hidden clip, rather than WordStagger's plain fade+rise.
 *
 * CSS-only (see globals.css "Above-the-fold entrance") so the headline — the
 * LCP element — paints at first paint, not after hydration.
 *
 * Masks per word, not per rendered line: the headline is a full translated
 * sentence that wraps differently at every breakpoint and locale, so there
 * is no fixed set of lines to hard-code. Per-word masking gets the same
 * "rising from behind an edge" feel without needing to know the layout ahead
 * of time.
 */
export function WordReveal({ text, className, as = "h1", delay = 0 }: Props) {
  const words = text.split(" ");
  const Tag = as;

  return (
    <Tag className={className}>
      {words.map((word, i) => (
        <Fragment key={`${word}-${i}`}>
          <span className="enter-mask inline-block overflow-hidden">
            <span
              className="inline-block"
              style={{ "--delay": `${delay}s`, "--i": i } as CSSProperties}
            >
              {word}
            </span>
          </span>
          {i < words.length - 1 ? " " : null}
        </Fragment>
      ))}
    </Tag>
  );
}
