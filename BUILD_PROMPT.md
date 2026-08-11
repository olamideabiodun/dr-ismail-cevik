# Build Prompt — Premium Booking Website for Op. Dr. İsmail Çevik (ENT/KBB, Gaziantep)

Build a production-grade, premium ($10k-tier) marketing + booking web app for an ENT/rhinoplasty
surgeon. `design.md` is the single source of truth for all visual & animation decisions. Build the
COMPLETE app, not a scaffold.

## Stack (required)

- Next.js (App Router) + TypeScript + React Server Components where sensible.
- Tailwind CSS with design.md tokens mapped into tailwind config (colors, radius, spacing, fonts).
- Motion for React (`motion`) for all animation per design.md §6.
- animos.app as a supplementary UI/animation library for prebuilt component motion patterns; keep
  its usage consistent with Motion's easing/springs and honor `prefers-reduced-motion` everywhere.
- Supabase: Postgres + Auth + Row Level Security (`@supabase/ssr` for server/client).
- Zod (validation), react-hook-form (forms), date-fns (+ tz, Europe/Istanbul), Resend (email).
- Deploy target: Vercel. Env via `.env.local` — never commit secrets.

## Environment variables (I fill these in myself)

`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` (server-only),
`NEXT_PUBLIC_SITE_URL`, `RESEND_API_KEY`, `NOTIFY_EMAIL`.

Do NOT hardcode keys. Do NOT create accounts. Assume I create the Supabase project and the single
admin (doctor) user myself in the Supabase dashboard.

## Public site — pages & sections (Turkish-first, EN toggle via next-intl)

1. **Home**: cinematic hero (green-scrubs operating image, oversized staggered headline, glass stat
   cards "265+ Ameliyat / Deneyim / Memnuniyet"), services grid, editorial split with tilted
   before/after carousel, "Neden Ben" trust section, testimonials, blog teaser, booking CTA.
2. **Hakkımda**: bio with TODO fields (education, ihtisas, board certs, years), portrait, congresses.
3. **Tedaviler**: one section/subroute per service (design.md §9); each with description, who-it's-for,
   process, recovery, CTA. Seed copy adapted from his IG captions.
4. **Sonuçlar (Gallery)**: before/after draggable slider + clip-path scroll reveal; consent/disclaimer
   banner; sensitive images blurred until user opts in.
5. **Blog**: MDX articles seeded from his education topics (sinusitis, nasal polyps, piezo rhinoplasty).
6. **İletişim**: map embed, phone 0544 479 2646, WhatsApp deep link, address, hours.
7. **Randevu**: the guest booking flow (below).

## Booking system (guest booking + email RSVP confirmation)

Patient flow (NO patient account, NO patient login):
choose service → pick date → see available booking periods (slots = doctor availability minus
booked/blocked) → select one period → enter name / email / phone / optional notes → confirm →
an RSVP confirmation email is sent to the patient's email with details, a reference code, and a
token-based cancel/reschedule link. Also show an on-screen confirmation with the reference code.

Rules:

- Prevent double-booking: DB partial UNIQUE on `starts_at` (where `status <> 'cancelled'`) + atomic
  validation inside a SECURITY DEFINER function `create_booking()`.
- Timezone Europe/Istanbul; block past slots; enforce min notice + max advance from `admin_settings`.
- Cancellation via emailed token link only (no account).

Email (Resend):

- Send transactional RSVP confirmation from the server action after a successful booking:
  patient name, service, date/time (Europe/Istanbul), clinic address (Gaziantep Özel Hatem
  Hastanesi), phone 0544 479 2646, reference code, cancel link. Clean HTML + plain-text template
  (Turkish, optional EN). Send an internal copy to `NOTIFY_EMAIL`.
- If email fails: still persist the booking, show graceful on-screen confirmation with reference
  code, retry/log server-side (never log PII).

Admin flow (doctor, authenticated):
dashboard of upcoming/past appointments; set weekly recurring availability + one-off exceptions
(days off, blocked slots); approve/decline/cancel; view patient contact + notes; toggle service
list & durations.

## Supabase schema (generate SQL migrations + RLS)

Tables:

- `services(id, slug, name_tr, name_en, duration_min, buffer_min, active, sort)`
- `availability_rules(id, weekday 0-6, start_time, end_time, active)` — recurring weekly
- `availability_exceptions(id, date, is_closed bool, start_time, end_time)` — one-off overrides
- `appointments(id, service_id fk, starts_at timestamptz, ends_at timestamptz, status
  [pending|confirmed|cancelled|completed], patient_name, patient_email NOT NULL, patient_phone,
  notes, confirmation_sent_at timestamptz, cancel_token uuid, created_at)`
  — partial `UNIQUE(starts_at) WHERE status <> 'cancelled'`
- `admin_settings(singleton: slot_interval_min, min_notice_hours, max_advance_days, timezone)`
- `admins(user_id uuid references auth.users)` — admin allow-list

RLS:

- anon: SELECT `services(active)`, `availability_rules`, `availability_exceptions`. NO direct anon
  INSERT on `appointments` — bookings go through SECURITY DEFINER `create_booking()` that validates
  the slot atomically. Patient reads/cancels own booking only via `cancel_token` RPC. No anon SELECT
  of others.
- authenticated admin (`auth.uid() in admins`): full CRUD on all tables.
- `service_role` key only in server actions/route handlers — never shipped to client.

Security: Zod-validate all server input; rate-limit the booking endpoint; sanitize notes; no PII in
logs; CSRF-safe server actions; parametrized queries only.

## Animations (implement exactly per design.md §6)

Hero word-stagger, hero parallax, `whileInView` reveals (`once:true`), spring scroll-progress bar,
clip-path before/after reveal, scroll-direction nav, `AnimatePresence` route/modal transitions,
`layoutId` card→detail, hover lifts. Respect `prefers-reduced-motion`. Use animos.app for prebuilt
patterns where it speeds delivery, kept visually consistent with the above.

## Quality bar

- Responsive 360→1920; AA accessibility; LCP<2.5s; CLS<0.1.
- `next/image` for all media; include `/public/assets` manifest listing the Instagram-sourced images I
  must drop in (filenames referenced in code + alt text), sourced from instagram.com/drismailcevik
  (hero = green-scrubs operating photo; gallery = result posts; rhinoplasty reel poster). These are
  the doctor's own clinical images for his own site.
- README: Supabase project creation, running migrations, creating the admin user, env vars, Resend
  setup, and where to place image assets. Seed script for services + demo availability.
- TODO markers for facts only the doctor can supply (bio, exact experience, working hours).

## Deliver

Full file tree with complete code for every file (no placeholders except marked TODO facts and the
image binaries). End with a short "next steps" list for me.
