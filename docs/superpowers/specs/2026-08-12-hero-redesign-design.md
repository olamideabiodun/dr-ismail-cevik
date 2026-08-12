# Hero redesign — match reference (uah-gamma.vercel.app)

## Context

The current hero (`src/components/home/Hero.tsx`) was built around a square
source photograph: a full-height gradient scrim darkens the entire image, and
`object-[50%_30%]` shifts the crop upward to keep the face in frame. The
source photo has since changed to a 16:9 image, so that crop math no longer
applies cleanly, and the user wants a different visual direction anyway —
modeled on their other site, `uah-gamma.vercel.app`.

This spec ports that reference hero's visual treatment onto this project's
existing content, i18n, and component conventions. It is not a pixel-for-pixel
class copy — the reference's raw Tailwind was re-derived against this
project's own tokens (`container-page`, `--radius-pill`, `--ease-out-soft`,
etc.) rather than pasted verbatim.

## Scope (confirmed with user)

- Full visual match: centered bottom-anchored text, bottom-half-only scrim,
  thin-weight headline, per-line reveal animation, decorative corner-mark
  frame.
- New `Jost` font (not a reuse of the site's existing Poppins display font),
  scoped to the hero only.
- Stats row is kept, but moves to sit centered below the headline/subtext
  instead of its current left-aligned spot under a border rule.
- CTAs: primary action becomes an outline pill button, secondary action
  becomes a plain text link, positioned bottom-right on desktop / stacked
  centered on mobile (matching the reference).
- Eyebrow text (`"ENT & Rhinoplasty — Gaziantep"`) is kept — the reference
  has no equivalent, but nothing in scope asked for it to be cut, and it
  carries useful specialty/location context. Rendered small, centered, above
  the headline.

## Visual changes

**Image** (`Hero.tsx`, via existing `Figure`/`Parallax`)
- Remove `imageClassName="object-[50%_30%]"` — object-position reverts to
  the CSS default (50% 50%), matching the reference's plain centered crop.
- Keep `Parallax` and its 12% scroll drift as-is; nothing about the reference
  requires removing it, and it's already tuned per design.md §6.

**Scrim**
- Replace `.hero-scrim` (`--hero-overlay`, a 15%→55% gradient spanning the
  full image height) with a bottom-half-only treatment: an absolutely
  positioned `inset-x-0 bottom-0 h-1/2` element with
  `bg-gradient-to-t from-ink/70 to-transparent`. The top half of the photo
  renders with zero overlay.
- `--hero-overlay` in `globals.css` becomes unused by the hero; leave it
  defined only if `hero-scrim`/`--hero-overlay` has other callers, otherwise
  remove both.

**Decorative frame** (new, no current equivalent)
- New presentational component rendering: four thin corner-mark lines/paths
  (`text-white/70`, `pointer-events-none`, absolutely positioned over the
  hero) plus two faint vertical guide threads (`bg-white/40`, hidden below
  `sm`). Purely decorative — no animation, no interactivity.
- Lives in `src/components/home/` (e.g. `HeroFrame.tsx`) since it's specific
  to this hero, not a general-purpose primitive.

**Typography**
- Add `Jost` via `next/font/google` in `src/app/[locale]/layout.tsx`,
  alongside the existing `Poppins`/`DM_Sans` setup. Own CSS variable
  (`--font-jost`), `weight: ["300"]` — Jost's Google Fonts static cut doesn't
  offer 250 (the reference's variable-font instance); 300 is the nearest
  static weight and reads just as thin at hero display sizes. If it reads
  too heavy once built, switch to loading Jost as a variable font
  (`weight: "200 300"`) instead of a fixed static weight.
  `subsets: ["latin", "latin-ext"]` for Turkish characters, matching the
  existing fonts' config.
- Scoped to the hero headline only via a dedicated utility class — Poppins
  remains the sitewide display font everywhere else.
- Headline: centered, bottom-anchored, uppercase,
  `[font-size:clamp(2.7rem,9vw,9rem)]`, `leading-[0.98]`.
- **Verify Turkish diacritics render without clipping** (ğ, ç, ş, ı, İ, ö, ü)
  once built — `WordStagger`'s code comments record a prior clipping bug with
  clip-mask reveals on a different, taller-glyph font. Jost is a plain
  geometric sans so this should be fine, but confirm visually before calling
  the work done, across both `tr` and `en` locales.

**Layout**
- Hero's inner content container becomes centered (`items-center
  text-center`) instead of left-aligned, still bottom-anchored within
  `min-h-[100svh]`.
- Stats row (`PRACTICE_STATS`, currently renders nothing until stats are
  verified) moves to directly below the subtext, centered, dropping its
  current `border-t` treatment (was designed for a left-aligned rule; doesn't
  read the same way centered).
- CTA row and the "scroll for more" hint are positioned independently of the
  centered text block: bottom-right (CTAs) / bottom-left (scroll hint) on
  `lg+`, both collapsing to stacked/centered under the text on smaller
  viewports.

## New/changed components

1. **`src/components/motion/LineReveal.tsx`** (new, sibling to
   `WordStagger.tsx`, does not replace it — `WordStagger` keeps serving its
   existing call sites elsewhere on the site)
   - Splits headline text into lines (by explicit line prop/array, not
     automatic wrapping — matches the reference's two hard-coded spans:
     `"World-Class"` / `"Medical Care"`).
   - Each line: outer `overflow-hidden` wrapper (the clip mask), inner
     `span` animates `translateY(100%) → 0` + fade, using the site's
     existing CSS-only "mount" pattern (`rise-in` keyframe,
     `--ease-out-soft`) — same LCP-safe approach `WordStagger` uses in
     `trigger="mount"` mode, since this is above the fold. No `inView`/Motion
     mode needed — nothing today calls this below the fold.
   - New CSS in `globals.css`: a `.enter-lines` utility analogous to the
     existing `.enter` / `.enter-words`.

2. **`src/components/home/HeroFrame.tsx`** (new) — the decorative corner-mark
   SVG + guide threads described above.

3. **`src/components/ui/Button.tsx`** — add an outline-pill variant (border
   `white/80`, transparent background, fills white with `ink`-colored text on
   hover) for the primary CTA. Reuses the existing `BASE` (already
   `rounded-[var(--radius-pill)]`) and `SIZES`; only a new entry in `VARIANTS`
   is needed.

4. **`Hero.tsx`** — rewritten to the new structure: `Figure` (unchanged
   props except the crop fix), bottom scrim, `HeroFrame`, centered text block
   using `LineReveal` for the headline, subtext, stats row, and a
   CTA-row + scroll-hint block positioned per above.

## Content / i18n

- `messages/en.json` and `messages/tr.json`, under `home.hero`: add a new key
  for the scroll hint: `"scrollHint": "Scroll for more"` (en) /
  `"scrollHint": "Daha fazlası için kaydırın"` (tr).
- `ctaPrimary` copy stays "Book an appointment" but its component changes
  from `ButtonLink` filled variant to the new outline-pill variant.
- `ctaSecondary` ("See treatments") changes from a bordered `ButtonLink` to a
  plain text `Link` (hover: opacity/underline shift, no button chrome).
- No other translation key changes; `eyebrow`, `headline`, `sub`, `imageAlt`
  are reused as-is.

## Out of scope

- The hero photograph itself (resolution/crop/edit) — separate from this
  spec; whatever image is in `public/assets/hero/operating.jpg` at
  implementation time is used as-is.
- Any change to `WordStagger`, `Parallax`, or `Figure` beyond removing the
  one `imageClassName` prop in `Hero.tsx`.
- Changes to other pages' heroes or use of `WordStagger` elsewhere.
