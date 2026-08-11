# Image assets — what to drop in, and where

None of these files are in the repository. They are the doctor's own clinical
and portrait photography, sourced from [instagram.com/drismailcevik](https://www.instagram.com/drismailcevik/)
(design.md §10). Save them from his account and place them at the exact paths
below — the filenames are referenced directly in the code.

**Until a file exists, nothing breaks.** `src/components/ui/Figure.tsx` renders a
brand-tinted placeholder instead of a broken image, and in `next dev` it prints
the missing path on top of the placeholder. So you can drop assets in gradually
and see immediately which are still outstanding.

## Format and size

- **Format:** JPEG or PNG. `next/image` converts to AVIF/WebP automatically —
  do not pre-convert.
- **Width:** 2000px on the long edge is plenty. The hero benefits from 2400px.
- **Do not** upload anything already resized down to Instagram's display size if
  you still have the original; the hero is full-bleed and will show it.

## The files

### Hero — `public/assets/hero/`

| File | What it is | Notes |
| --- | --- | --- |
| `operating.jpg` | The green-scrubs operating photograph (his profile picture) | The anchor image of the whole site. Landscape or square crops best; the subject should sit right of centre so the headline has room on the left. |

### Portrait — `public/assets/about/`

| File | What it is |
| --- | --- |
| `portrait.jpg` | Studio or clinic portrait for the Hakkımda page. Portrait orientation, 4:5. |

### Treatments — `public/assets/services/`

One image per treatment, 4:3 landscape. These come from the Instagram highlight
covers (design.md §10).

```
rinoplasti.jpg          piezo-rinoplasti.jpg     revizyon-rinoplasti.jpg
endoskopik-sinus.jpg    nazal-polip.jpg          uyku-apnesi.jpg
ses-teli.jpg            kepce-kulak.jpg          goz-estetigi.jpg
kas-kaldirma.jpg        botox.jpg                yuzde-kitle.jpg
cocuk-kbb.jpg
```

### Why-me cards — `public/assets/trust/`

4:3 landscape. One image per claim in the "Neden Ben" section — clinical or
in-practice photography works better here than stock.

| File | The claim it sits under |
| --- | --- |
| `breathing.jpg` | Breathing comes first |
| `piezo.jpg` | Piezo / ultrasonic technique |
| `continuity.jpg` | One surgeon, whole process |
| `expectations.jpg` | Realistic expectations |

### Results — `public/assets/results/`

Before/after pairs for the comparison slider. **Both images in a pair must be
the same crop, angle and dimensions**, or the slider will appear to jump as the
handle moves across.

```
case-01-before.jpg   case-01-after.jpg     (rinoplasti)
case-02-before.jpg   case-02-after.jpg     (piezo-rinoplasti)
case-03-before.jpg   case-03-after.jpg     (kepçe kulak)
case-04-before.jpg   case-04-after.jpg     (revizyon rinoplasti)
```

> **Consent is required before any of these go live.** design.md §10 and Turkish
> medical advertising rules both apply. The gallery is already gated behind an
> explicit acknowledgement and the images ship blurred until the visitor accepts,
> but that is a presentation control — it is not a substitute for written patient
> consent. Add or remove cases in `src/content/site.ts` (`RESULT_CASES`).

### Blog — `public/assets/blog/`

16:9 landscape.

| File | Post |
| --- | --- |
| `sinuzit.jpg` | Kronik sinüzit ve antibiyotik |
| `nazal-polip.jpg` | Nazal polip |
| `piezo.jpg` | Piezo rinoplasti |
| `rinoplasti-iyilesme.jpg` | Rinoplastide 3. ay |
| `default.jpg` | Fallback for any post whose frontmatter omits `cover` |

## Optional: true text-behind-image hero

design.md §0 describes the reference's "text-behind-image" treatment, where the
subject overlaps the headline. That needs a **cut-out PNG with a transparent
background**, which a normal photograph cannot provide.

The hero currently layers photo → scrim → headline, which reads correctly on its
own. If you have a cut-out made, add it as `public/assets/hero/operating-cutout.png`
and render it as an extra absolutely-positioned layer after the headline in
`src/components/home/Hero.tsx`.

## Favicon and social image

Not wired up yet, and worth doing before launch:

- `src/app/icon.png` — 512×512, becomes the favicon automatically.
- `src/app/opengraph-image.jpg` — 1200×630, the link preview for shares.

Both are Next.js file conventions: dropping the file in is the entire setup.
