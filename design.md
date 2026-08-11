# Design System — Op. Dr. İsmail Çevik | ENT & Rhinoplasty (Gaziantep)

## 0. North Star

A premium ($10k-tier) medical brand + booking site: cinematic, editorial, calm, trustworthy.
Design DNA adapted from the "Tenista" landing reference (Wizerdui, Clean & Modern UI 2026):
full-bleed cinematic hero, oversized ultra-tight display type layered with the subject
(text-behind-image), minimal nav, glassmorphic floating stat cards, editorial split sections
with giant ghost typography + tilted image-card carousel, rounded premium tiles on off-white
contrast sections. Feel: clinical precision + human warmth. Confident, spacious, editorial —
never flashy.

## 1. Brand & Art Direction

- Subject: Otolaryngologist (ENT) / KBB & rhinoplasty surgeon, Gaziantep Özel Hatem Hastanesi.
- Hero anchor image: surgeon in green surgical scrubs operating (his IG profile photo) — the
  "energy/motion" equivalent of the reference's action shot.
- Photography: real clinical + patient-result imagery; teal-green surgical tones as accent that
  ties to the scrubs; soft studio portrait for About.
- Tone: Turkish-first copy, optional EN toggle. Reassuring, expert, plain-language.

## 2. Color Tokens

Palette derived from the surgical-green + clinical-white world (NOT the reference's blue).

```css
:root {
  --bg:            #FBFBF9;  /* warm off-white base */
  --bg-elevated:   #FFFFFF;
  --ink:           #0E1512;  /* near-black, slight green undertone */
  --ink-soft:      #48544E;
  --muted:         #8A938D;
  --line:          #E7E9E4;
  --brand:         #1F6F5C;  /* deep surgical teal-green (primary) */
  --brand-600:     #17594A;
  --brand-300:     #6FB3A2;
  --brand-tint:    #E9F3EF;  /* section wash */
  --accent:        #C9A24B;  /* restrained gold for premium micro-accents */
  --glass:         rgba(255,255,255,0.10);
  --glass-stroke:  rgba(255,255,255,0.35);
}
```

Hero overlay: `linear-gradient(180deg, rgba(9,20,17,.15), rgba(9,20,17,.55))`.
Contrast: all text ≥ WCAG AA (4.5:1 body, 3:1 large text).

## 3. Typography

- Display: tight high-contrast type. Recommend "PP Editorial New" or "Fraunces" (serif) for hero;
  or "Clash Display" (grotesk). Body: "Inter" / "General Sans".
- Hero headline: `clamp(3.2rem, 9vw, 8.5rem)`, weight 600, letter-spacing -0.03em, line-height 0.92;
  layered over/behind the hero subject.
- Section ghost headings (editorial): 12–16vw, color `var(--line)` or 6% ink, behind content.
- Scale (rem): 0.75 / 0.875 / 1 / 1.25 / 1.5 / 2 / 3 / 4.5 / 7 (modular ~1.333).
- Tabular numerals for stats & booking time slots.

## 4. Layout & Spacing

- 12-col grid, max-width 1280px, gutters 24px (mobile 16px).
- Spacing scale (px): 4 8 12 16 24 32 48 64 96 128 160.
- Section rhythm: 96–160px desktop, 64–96 mobile.
- Radius: cards 20px, images 24px, pills 999px, inputs 12px.
- Elevation: sm `0 1px 2px rgba(14,21,18,.06)`; card `0 20px 60px -20px rgba(14,21,18,.18)`.
- Negative space is a feature.

## 5. Core Components

- Nav: transparent over hero → solid on scroll; small left link clusters, centered wordmark,
  right pill CTA "Randevu Al"; scroll-direction aware (hide on down, show on up).
- Glass stat cards floating over hero: "265+ Ameliyat", "Deneyim", "%… Memnuniyet"; circular badges.
- Editorial carousel: tilted image cards, circular ◀ ▶ buttons, drag + snap → before/after results.
- Service cards: icon + title + one-line + arrow; 3-up grid desktop.
- Before/After: draggable comparison slider (consent/disclaimer required).
- Booking widget: service → calendar → available periods → guest form → on-screen + email confirmation.
- Footer: clinic, phone 0544 479 2646, address (Gaziantep Özel Hatem Hastanesi), IG link,
  disclaimer ("içerik bilgilendirme amaçlıdır").

## 6. Animation Spec

Primary lib: Motion for React (`motion`). Supplementary UI/animation lib: animos.app
(use for prebuilt component-level motion patterns/effects where it accelerates delivery;
keep it consistent with Motion easing/springs and the reduced-motion rule below).
Principles: fast, subtle, physical; always respect `prefers-reduced-motion` (drop transforms,
keep opacity).

- Hero headline: per-word stagger — parent `staggerChildren:0.08`, child `{opacity:0,y:'0.4em'}` →
  `{opacity:1,y:0}`, spring `{stiffness:120,damping:18}`.
- Hero image parallax: `useScroll` + `useTransform(scrollYProgress,[0,1],['0%','12%'])`.
- Section reveals: `whileInView`, `viewport={{ once:true, margin:'-15%' }}`, staggered children.
- Scroll progress bar: `useScroll` → `useSpring(scrollYProgress,{stiffness:100,damping:30})` on scaleX.
- Before/after "wipe-in": `clipPath` linked to `scrollYProgress` (`offset:['start end','center center']`).
- Nav hide/show: `useMotionValueEvent(scrollY,'change',…)` direction detection.
- Route + modal transitions: `AnimatePresence`; card→detail via `layoutId`.
- Hover: cards lift `y:-6` + shadow; buttons scale 1.02 spring; images scale 1.04 (overflow hidden).
- Performance: animate only transform/opacity; native ScrollTimeline + pooled IntersectionObserver; 60fps.

## 7. Accessibility

AA contrast; focus-visible rings (2px `var(--brand)`); keyboard-operable carousel + booking;
reduced-motion fallbacks; semantic landmarks; alt text on all clinical images; labeled forms
with error messaging; min tap target 44px.

## 8. Performance Budget

`next/image` (AVIF/WebP); font subsetting + `font-display:swap`; route-level code splitting;
lazy-load below-the-fold media & carousel; LCP < 2.5s; CLS < 0.1; initial JS < ~180kb gzip.

## 9. Real Content Inventory (from Instagram @drismailcevik)

Identity: Op. Dr. İsmail Çevik — Otolaryngologist (ENT) / KBB Uzmanı.
Clinic: Gaziantep Özel Hatem Hastanesi. Phone: 0544 479 2646. Location: Gaziantep, TR.

Services (IG highlights = definitive menu): Rinoplasti (incl. Piezo/Ultrasonik & revizyon),
Endoskopik Sinüs Cerrahisi, Nazal Polip, Uyku Apnesi Cerrahisi, Ses Teli Ameliyatı, Botox,
Kaş Kaldırma, Göz Estetiği, Kepçe Kulak (otoplasti), Yüzde Kitle, Çocuk KBB.

Education (repurpose into Blog): chronic sinusitis vs antibiotics, nasal polyps, piezo/ultrasonic
rhinoplasty, sinus surgery, 3-month recovery ("Rinoplasti 3. Ay").

## 10. Visual Asset References (source from his IG; user saves them — his own clinical imagery)

- Hero anchor: green-scrubs operating portrait (profile photo).
- Highlight covers → service section thumbnails.
- Result/portrait posts → before/after gallery.
- Piezo rhinoplasty reel → Rhinoplasty explainer (`/drismailcevik/reel/DXoD2yljAsd/`).

Compliance: TR medical advertising rules apply to before/after imagery — add consent + disclaimer;
age-gate/blur surgical thumbnails (some IG posts flagged sensitive).
