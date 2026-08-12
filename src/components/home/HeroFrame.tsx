import type { CSSProperties } from "react";

/**
 * Thin architectural line accents over the hero, per the approved design
 * reference: a full-width horizontal line crossing the upper third, and a
 * stepped line (down / across / down) framing the lower-right.
 *
 * Plain 1px `div`s rather than SVG strokes: an SVG path scaled by a
 * `viewBox` under `preserveAspectRatio="none"` (needed to track the hero's
 * own aspect ratio) hits a real Chromium rendering bug with
 * `vector-effect="non-scaling-stroke"` — the stroke renders as a broken
 * dashed line under that non-uniform scale, even though the path geometry
 * and stroke-dasharray are both correct. A `div` with `h-px`/`w-px` has no
 * such failure mode and needs no viewBox math.
 *
 * Purely presentational — no interactivity, `pointer-events-none` so it
 * never intercepts clicks on the CTAs/nav sitting above it.
 */
export function HeroFrame() {
  const delayStyle = (delay: number) => ({ "--delay": `${delay}s` }) as CSSProperties;

  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 text-white/50">
      {/* full-width horizontal line, upper third */}
      <div
        className="line-draw-x absolute inset-x-0 h-px origin-left bg-current"
        style={{ top: "37%", ...delayStyle(0.3) }}
      />

      {/* stepped line: down the left edge, across, down to the bottom-right */}
      <div
        className="line-draw-y absolute w-px origin-top bg-current"
        style={{ left: "10%", top: 0, height: "80%", ...delayStyle(0.5) }}
      />
      <div
        className="line-draw-x absolute h-px origin-left bg-current"
        style={{ left: "10%", top: "80%", width: "59%", ...delayStyle(0.75) }}
      />
      <div
        className="line-draw-y absolute w-px origin-top bg-current"
        style={{ left: "69%", top: "80%", height: "20%", ...delayStyle(0.95) }}
      />
    </div>
  );
}
