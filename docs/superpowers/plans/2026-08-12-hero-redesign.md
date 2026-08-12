# Hero Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild the homepage hero (`src/components/home/Hero.tsx`) to match the visual treatment of the user's other site (uah-gamma.vercel.app): bottom-only scrim, centered bottom-anchored text, a thin new display font, a per-word mask-reveal entrance, and a decorative corner-mark frame.

**Architecture:** Three additive/foundational pieces (a new font, a CSS reveal utility, a new button variant) land first since later tasks depend on them. The hero itself then gets a new decorative frame component, a new word-reveal animation component, and a full rewrite of `Hero.tsx` wiring them together. Nothing outside the hero changes.

**Tech Stack:** Next.js 16.3 (App Router, Turbopack), Tailwind v4 (CSS-first config via `@theme`), `next-intl` for i18n, `motion/react` for the existing scroll-parallax. No unit-test framework is configured in this project (`package.json` has no `jest`/`vitest`/`playwright`) — verification is `npm run typecheck`, `npm run lint`, `npm run build`, and manual dev-server visual QA in the browser, which matches this repo's own stated convention for UI changes.

## Global Constraints

- Scrim: bottom-half-only — `absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-ink/70 to-transparent`. No overlay on the top half of the image.
- Image crop: plain centered `object-cover` (remove the existing `object-[50%_30%]` override) — object-position defaults to 50% 50%.
- New headline font is **Jost**, `weight: ["300"]` (nearest static cut to the reference's variable-font 250; matches Tailwind's `font-light` utility exactly), `subsets: ["latin", "latin-ext"]`. Scoped to the hero only via a new `font-hero` utility — Poppins remains the sitewide display font everywhere else.
- Stats row (`PRACTICE_STATS`) moves to directly below the subtext, centered, no `border-t` rule.
- CTAs: primary (`ctaPrimary`, "Book an appointment" / "Randevu Al") becomes a new outline-pill button variant; secondary (`ctaSecondary`, "See treatments" / "Tedavileri İncele") becomes a plain text link. Both sit bottom-right on `lg+`, stacked centered below the stats on smaller viewports.
- Eyebrow text stays, centered, above the headline.
- New translation key `home.hero.scrollHint`: `"Scroll for more"` (en) / `"Daha fazlası için kaydırın"` (tr).
- Turkish diacritics (ğ, ç, ş, ı, İ, ö, ü) must not be visually clipped by the new mask-reveal animation, in both locales — verify explicitly, don't assume.
- Out of scope: `WordStagger.tsx`, `Parallax.tsx`, and `Figure.tsx` are unchanged except removing the one `imageClassName` prop at the `Hero.tsx` call site. No other page's hero changes.

**Deviation from the design spec, called out explicitly:** the spec (`docs/superpowers/specs/2026-08-12-hero-redesign-design.md`) describes the new animation component as a per-*line* reveal with hard-coded line spans, mirroring the reference site's two-word marketing headline ("World-Class" / "Medical Care"). This project's actual headline is a full translated sentence (e.g. "Breathing and proportion, treated as one.") that must keep wrapping naturally at every breakpoint and locale — hard-coding line breaks would break that. This plan instead builds a **per-word** mask reveal (`WordReveal.tsx`, not `LineReveal.tsx`), which gets the same "rising from behind a clipped edge" visual language without needing to know the layout ahead of time. This is a deliberate adaptation to this project's actual content, not a missed requirement.

---

## Task 1: Foundations — font, CSS utility, button variant, translation keys

**Files:**
- Modify: `src/app/[locale]/layout.tsx`
- Modify: `src/app/globals.css`
- Modify: `src/components/ui/Button.tsx`
- Modify: `messages/en.json`
- Modify: `messages/tr.json`

**Interfaces:**
- Produces: Tailwind utility class `font-hero` (font-family: Jost). Button `Variant` gains `"outlineOnDark"`. CSS class `.enter-mask` (apply to a `<span>` wrapping another `<span>` — see Task 2 for exact structure). Translation key `home.hero.scrollHint` in both locales.

- [ ] **Step 1: Add the Jost font import in the locale layout**

Edit `src/app/[locale]/layout.tsx`. Change the font import line and add the `jost` loader next to `poppins`:

```ts
import { DM_Sans, Jost, Poppins } from "next/font/google";
```

Add after the existing `poppins` const (after its closing `});`):

```ts
/* Jost, scoped to the hero headline only via the `font-hero` utility
   (globals.css) — everywhere else keeps using Poppins. Weight 300 is the
   nearest static cut Google Fonts offers to the thin weight this is modelled
   on; latin-ext covers Turkish diacritics same as the other two fonts. */
const jost = Jost({
  subsets: ["latin", "latin-ext"],
  variable: "--font-jost",
  display: "swap",
  weight: ["300"],
});
```

Then update the `<html>` element's `className` to include it:

```tsx
      className={`${dmSans.variable} ${poppins.variable} ${jost.variable}`}
```

- [ ] **Step 2: Add the `font-hero` theme token and remove the now-unused hero-overlay tokens**

In `src/app/globals.css`, remove the `--hero-overlay` block from `:root` (it will have no remaining callers after Task 2 rewrites `Hero.tsx`):

```css
  /* Hero scrim — keeps AA contrast for text laid over the operating photo */
  --hero-overlay: linear-gradient(
    180deg,
    rgba(9, 20, 17, 0.15),
    rgba(9, 20, 17, 0.55)
  );
```

Delete that whole block (and the blank line directly above it, so `:root` ends cleanly after the `--glass-stroke` line).

In the `@theme inline` block, immediately after the existing `--font-sans` line, add:

```css
  /* Jost, for the hero headline only — see layout.tsx. Not part of the
     sitewide display/sans pair above, so it gets its own token rather than
     overloading --font-display. */
  --font-hero: var(--font-jost), "Jost", ui-sans-serif, system-ui, sans-serif;
```

Then find the `.hero-scrim` rule under `@layer components`:

```css
  .hero-scrim {
    background: var(--hero-overlay);
  }
```

Delete this rule entirely (and the blank line above it).

- [ ] **Step 3: Add the `.enter-mask` CSS reveal utility**

In `src/app/globals.css`, immediately after the existing `.enter-words > span` rule (right before the "Reduced motion" section comment), add:

```css
/* Per-word mask reveal for the hero headline: each word rises up from behind
   an overflow-hidden clip instead of just fading+rising like .enter-words.
   Reuses the same rise-in keyframe and --i/--delay contract — only --rise
   changes, to 100% so the word starts fully hidden behind the mask edge. */
.enter-mask > span {
  display: inline-block;
  --rise: 100%;
  animation: rise-in 0.55s var(--ease-out-soft) both;
  animation-delay: calc(var(--delay, 0s) + var(--i, 0) * 0.06s);
}
```

- [ ] **Step 4: Add the outline-pill button variant**

In `src/components/ui/Button.tsx`, update the `Variant` type and `VARIANTS` map:

```ts
type Variant = "primary" | "secondary" | "ghost" | "onDark" | "outlineOnDark";

const VARIANTS: Record<Variant, string> = {
  primary:
    "bg-brand text-white hover:bg-brand-600 shadow-sm disabled:bg-muted disabled:text-white/80",
  secondary:
    "bg-bg-elevated text-ink border border-line hover:border-brand hover:text-brand",
  ghost: "bg-transparent text-ink-soft hover:text-brand",
  onDark:
    "bg-white text-ink hover:bg-white/92 border border-white/40 backdrop-blur",
  outlineOnDark:
    "bg-transparent text-white border border-white/80 hover:bg-white hover:text-ink",
};
```

(Only the `Variant` type and `VARIANTS` object change — `SIZES`, `BASE`, and the three exported components below are untouched.)

- [ ] **Step 5: Add the `scrollHint` translation key**

In `messages/en.json`, inside `home.hero` (right after `"imageAlt"`):

```json
      "imageAlt": "Op. Dr. İsmail Çevik operating in green surgical scrubs",
      "scrollHint": "Scroll for more"
```

In `messages/tr.json`, inside `home.hero` (right after `"imageAlt"`):

```json
      "imageAlt": "Op. Dr. İsmail Çevik ameliyathanede, yeşil cerrahi önlükle operasyon sırasında",
      "scrollHint": "Daha fazlası için kaydırın"
```

(Add a trailing comma after the now-not-last `"imageAlt"` line in both files.)

- [ ] **Step 6: Verify**

Run:

```bash
npm run typecheck
npm run lint
npm run build
```

Expected: all three succeed with no errors. (`Hero.tsx` still references the old `imageClassName` prop and `.hero-scrim` class at this point — that's fine, `Figure.tsx` still accepts an optional `imageClassName`, and an unused CSS class is not a type or lint error. If `npm run build` fails because Next statically analyzes the removed `--hero-overlay`/`.hero-scrim` — it won't, CSS custom properties aren't build-checked — no action needed either way; just confirm the build actually succeeds before moving on.)

- [ ] **Step 7: Commit**

```bash
git add src/app/[locale]/layout.tsx src/app/globals.css src/components/ui/Button.tsx messages/en.json messages/tr.json
git commit -m "feat(hero): add Jost font, mask-reveal utility, outline button variant"
```

---

## Task 2: Hero rebuild — WordReveal, HeroFrame, Hero.tsx

**Files:**
- Create: `src/components/motion/WordReveal.tsx`
- Create: `src/components/home/HeroFrame.tsx`
- Modify: `src/components/home/Hero.tsx` (full rewrite)

**Interfaces:**
- Consumes: `.enter-mask` CSS class and `font-hero` Tailwind utility (Task 1). `ButtonLink` variant `"outlineOnDark"` (Task 1). `home.hero.scrollHint` translation key (Task 1). Existing `Figure`, `Parallax`, `CountUp`, `PRACTICE_STATS` — all unchanged.
- Produces: `WordReveal({ text, className, as, delay })` — a React component, default export none (named export `WordReveal`), mirrors `WordStagger`'s mount-mode API shape (`text: string`, `className?: string`, `as?: "h1" | "h2" | "p" | "span"`, `delay?: number`) but always CSS-mount, no `trigger`/`stagger` props. `HeroFrame()` — a React component taking no props, rendering the decorative corner-mark SVG + guide threads.

- [ ] **Step 1: Create `WordReveal.tsx`**

Create `src/components/motion/WordReveal.tsx`:

```tsx
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
```

- [ ] **Step 2: Create `HeroFrame.tsx`**

Create `src/components/home/HeroFrame.tsx`:

```tsx
/**
 * Decorative corner-mark frame + guide threads over the hero, modelled on
 * uah-gamma.vercel.app's hero. Purely presentational — no motion, no
 * interactivity, `pointer-events-none` throughout so it never intercepts
 * clicks on the CTAs/nav sitting above it.
 */
export function HeroFrame() {
  const corners: Array<[number, number]> = [
    [6, 8],
    [94, 8],
    [6, 92],
    [94, 92],
  ];

  return (
    <div aria-hidden className="pointer-events-none absolute inset-0">
      <svg
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        className="absolute inset-0 h-full w-full text-white/70"
      >
        <rect
          x="6"
          y="8"
          width="88"
          height="84"
          fill="none"
          stroke="currentColor"
          strokeWidth="1"
          vectorEffect="non-scaling-stroke"
        />
        {corners.map(([cx, cy]) => (
          <g key={`${cx}-${cy}`}>
            <line
              x1={cx - 1.5}
              y1={cy}
              x2={cx + 1.5}
              y2={cy}
              stroke="currentColor"
              strokeWidth="1.5"
              vectorEffect="non-scaling-stroke"
            />
            <line
              x1={cx}
              y1={cy - 1.5}
              x2={cx}
              y2={cy + 1.5}
              stroke="currentColor"
              strokeWidth="1.5"
              vectorEffect="non-scaling-stroke"
            />
          </g>
        ))}
      </svg>
      <div className="absolute inset-0 hidden sm:block">
        <div className="relative mx-auto h-full max-w-6xl px-8">
          <span className="absolute bottom-0 left-1/3 top-[78%] w-px -translate-x-1/2 bg-white/40" />
          <span className="absolute bottom-0 left-2/3 top-[70%] w-px -translate-x-1/2 bg-white/40" />
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Rewrite `Hero.tsx`**

Replace the full contents of `src/components/home/Hero.tsx`:

```tsx
"use client";

import type { CSSProperties } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Parallax } from "@/components/motion/Parallax";
import { WordReveal } from "@/components/motion/WordReveal";
import { CountUp } from "@/components/motion/animos";
import { ButtonLink } from "@/components/ui/Button";
import { Figure } from "@/components/ui/Figure";
import { HeroFrame } from "@/components/home/HeroFrame";
import { PRACTICE_STATS } from "@/content/site";

/**
 * Cinematic full-bleed hero — centered, bottom-anchored, modelled on the
 * practice's other site (uah-gamma.vercel.app). See
 * docs/superpowers/specs/2026-08-12-hero-redesign-design.md.
 *
 * The scrim only covers the bottom half of the photo: enough to keep white
 * type AA-safe over the text block, without flattening the whole image the
 * way a full-height scrim would.
 *
 * Every entrance here is CSS (`.enter`, `.enter-mask`), not Motion — the
 * headline is the LCP element and must paint before hydration, same
 * reasoning as before. Only the parallax drift stays JS-driven, and it
 * degrades to a still image under prefers-reduced-motion.
 */
export function Hero() {
  const t = useTranslations("home.hero");
  const tStats = useTranslations("home.stats");
  const locale = useLocale();

  // Turkish writes the percent sign before the number (%98); English after (98%).
  const percent = locale === "tr" ? { prefix: "%" } : { suffix: "%" };

  // Only confirmed figures are published. See PRACTICE_STATS for why this
  // currently renders nothing — the brief's "265+ ameliyat" turned out to be
  // his Instagram post count, not an operation count.
  const stats = PRACTICE_STATS.filter((stat) => stat.verified).map((stat) => ({
    value: stat.value,
    label: tStats(stat.key),
    ...(stat.key === "satisfaction" ? percent : { suffix: "+" }),
  }));

  const delay = (seconds: number) => ({ "--delay": `${seconds}s` }) as CSSProperties;

  return (
    <section className="relative isolate min-h-[100svh] overflow-hidden bg-ink">
      {/* The inner layer is deliberately taller than the frame so the 12%
          parallax drift never exposes an empty edge. */}
      <Parallax className="absolute inset-0 h-[112%]" distance="12%">
        <Figure
          src="/assets/hero/operating.jpg"
          alt={t("imageAlt")}
          className="h-full w-full"
          sizes="100vw"
          priority
          quality={90}
          // Everything laid over this is white. If the photograph is ever
          // missing, the fallback has to be dark or the hero is unreadable.
          placeholderTone="dark"
        />
      </Parallax>

      {/* Bottom-half-only scrim: the top of the photo (the face) renders at
          full clarity. Only the lower half, behind the text block, darkens
          for AA contrast. */}
      <div
        aria-hidden
        className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-ink/70 to-transparent"
      />

      <HeroFrame />

      <div className="container-page relative flex min-h-[100svh] flex-col items-center justify-end pb-16 pt-32 text-center md:pb-24">
        <p className="enter mb-6 text-xs font-medium uppercase tracking-[0.22em] text-white/75">
          {t("eyebrow")}
        </p>

        <WordReveal
          as="h1"
          text={t("headline")}
          className="font-hero max-w-[20ch] font-light uppercase text-white [font-size:clamp(2.7rem,9vw,9rem)] [letter-spacing:0.015em] [line-height:0.98]"
          delay={0.1}
        />

        <p
          className="enter mx-auto mt-8 max-w-xl text-lg leading-relaxed text-white/85"
          style={delay(0.5)}
        >
          {t("sub")}
        </p>

        {/* Renders nothing while every stat figure is still unverified. */}
        <ul
          className="enter mt-10 flex flex-wrap items-center justify-center gap-x-8 gap-y-4 empty:hidden"
          style={delay(0.62)}
        >
          {stats.map((stat) => (
            <li key={stat.label} className="flex items-baseline gap-2.5">
              <CountUp
                value={stat.value}
                prefix={stat.prefix}
                suffix={stat.suffix}
                className="tabular font-display text-xl leading-none text-white"
              />
              <span className="text-xs tracking-wide text-white/60">
                {stat.label}
              </span>
            </li>
          ))}
        </ul>

        <div
          className="enter mt-10 flex flex-wrap items-center justify-center gap-6 lg:absolute lg:bottom-10 lg:right-10 lg:mt-0"
          style={delay(0.78)}
        >
          <Link
            href="/tedaviler"
            className="text-sm text-white/85 transition hover:text-white"
          >
            {t("ctaSecondary")}
          </Link>
          <ButtonLink href="/randevu" size="lg" variant="outlineOnDark">
            {t("ctaPrimary")}
          </ButtonLink>
        </div>

        <span
          className="enter absolute bottom-10 left-1/2 hidden -translate-x-1/2 items-center gap-2 text-xs tracking-wide text-white/60 lg:left-10 lg:flex lg:translate-x-0"
          style={delay(0.9)}
        >
          {t("scrollHint")}
          <span aria-hidden>↓</span>
        </span>
      </div>
    </section>
  );
}
```

- [ ] **Step 4: Verify types, lint, and build**

```bash
npm run typecheck
npm run lint
npm run build
```

Expected: all three succeed. If `lint` flags anything (e.g. an unused import), fix it before continuing — don't suppress with eslint-disable comments.

- [ ] **Step 5: Visual check in the dev server**

```bash
npm run dev
```

Open `http://localhost:3000` in a browser. Confirm:
- The hero image is centered (no longer cropped toward the top), with the bottom half visibly darker than the top half.
- The corner-mark frame and two vertical guide threads are visible (guide threads only from `sm` breakpoint up).
- The headline animates in word-by-word on load, each word rising up from behind a clipped edge.
- The eyebrow, headline, subtext are centered; the CTA row sits bottom-right of the hero on a wide window, and the scroll hint sits bottom-left.
- Resize the window below `lg` (e.g. 800px wide): the CTA row and scroll hint should reflow — CTAs centered under the stats row (scroll hint is intentionally hidden below `lg`, not stacked).
- Switch to `/en` and back to `/` (Turkish default): headline text changes language and re-animates correctly in both.

Stop and fix before proceeding if anything above doesn't hold — this is the step where layout mistakes are cheapest to catch.

- [ ] **Step 6: Commit**

```bash
git add src/components/motion/WordReveal.tsx src/components/home/HeroFrame.tsx src/components/home/Hero.tsx
git commit -m "feat(hero): rebuild with centered layout, bottom scrim, word-reveal headline"
```

---

## Task 3: Diacritic and accessibility QA pass

**Files:** none expected to change unless QA finds a problem — if it does, fix in place in whichever file owns the issue (`globals.css` for clipping/spacing, `Hero.tsx` for layout, `messages/*.json` for copy) and note the fix in the commit.

**Interfaces:** none — this task is verification, not new surface area.

- [ ] **Step 1: Zoom in on Turkish diacritics**

With the dev server running, load `/` (Turkish locale — headline: "Nefesi ve oranı aynı anda düşünen cerrahi."). Take a screenshot or zoom into the browser (Ctrl/Cmd + `+`) on the headline. Check specifically:
- `ı` and `İ` in "aynı" — dotless/dotted i, easy to misclip at tight line-heights.
- `ş` in "düşünen" — the cedilla hangs below the baseline.
- `ğ` — soft g's breve mark sits above the x-height.

Confirm no glyph's mark is visibly cut off, both mid-animation (fast repeated reload) and at rest after the animation finishes.

If clipping is found: increase the `.enter-mask > span` parent's line-height slightly, or bump `--rise` down from `100%` to e.g. `105%`/add a small `padding-block` to the outer `.enter-mask` span — whichever fixes it with the smallest change. Re-check after any fix.

- [ ] **Step 2: Check `prefers-reduced-motion`**

In Chrome DevTools: Cmd/Ctrl+Shift+P → "Rendering" → "Emulate CSS media feature prefers-reduced-motion: reduce". Reload the hero. Confirm:
- The word-reveal still shows the final text immediately (no animation, but content is not stuck invisible — `animation-duration: 0.01ms` from the existing global reduced-motion rule in `globals.css` should already cover `.enter-mask`, since it applies to `*`).
- The parallax scroll drift is disabled (photo stays static on scroll) — this was already true before this change, confirm it still holds.

- [ ] **Step 3: Check keyboard/screen-reader text**

Confirm the headline still reads as one sentence to assistive tech despite being split into per-word `<span>`s — inspect the rendered `<h1>` in DevTools and confirm there's no `aria-hidden` on the text itself (only `HeroFrame`'s decorative wrapper should carry `aria-hidden`) and that plain-text extraction (select all + copy the headline) reproduces the original sentence with normal spacing, not words jammed together.

- [ ] **Step 4: Final commit (only if Step 1 required a fix)**

```bash
git add -A
git commit -m "fix(hero): resolve diacritic clipping in word-reveal animation"
```

If no fix was needed, skip this step — Task 2's commit already covers the working state.
