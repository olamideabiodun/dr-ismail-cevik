# animos.app adapter layer

`design.md` §6 and `BUILD_PROMPT.md` list **animos.app** as a supplementary
animation library for prebuilt component-level motion patterns.

## What was actually found

There is no resolvable npm package for it. These were all checked against the
registry and none exist:

```
animos   animos-ui   animos.app   @animos/react   @animos/ui   animos-react
```

That is consistent with animos.app being a **copy-paste component library** in
the shadcn/ui or Magic UI mould, where you paste source into your own repo
rather than installing a dependency. It was not verifiable at build time, so
nothing was invented: no fabricated import, no guessed API, no dependency added
that would break `npm install` for the next person.

## What this folder is instead

`index.tsx` implements the same *category* of thing — prebuilt, drop-in motion
patterns — on top of Motion for React, using the springs and easings in
`../tokens.ts`. So the site gets the patterns today, and they already obey the
house motion vocabulary and `prefers-reduced-motion`.

## Adopting the real library later

This folder is the seam. When you have animos.app in front of you:

1. Add it however it ships (npm install, or paste its components into this
   folder alongside `index.tsx`).
2. Re-export its components from `index.tsx`, keeping the exported names below
   so call sites do not change.
3. Pass the springs from `../tokens.ts` into its transition props so its motion
   still matches the rest of the site.
4. Confirm each component you adopt short-circuits under `useReducedMotion()` —
   design.md §6 requires it, and third-party motion libraries frequently do not
   honour it by default.

Nothing outside this folder imports animos directly, so that swap stays a
one-file change.

## Exported patterns

| Export | What it does |
| --- | --- |
| `FadeUp` | Fade and rise on scroll-into-view, with an optional delay |
| `BlurIn` | Fade in from a slight blur — used for editorial lead paragraphs |
| `MagneticButton` | Cursor-following pull on hover, snapping back on leave |
| `CountUp` | Animates a number from 0 to its value when scrolled into view |
| `Marquee` | Continuous horizontal scroll, pausing on hover |
