# Op. Dr. İsmail Çevik — ENT & Rhinoplasty, Gaziantep

Marketing site and guest-booking web app for an ENT/KBB and rhinoplasty surgeon.
Turkish-first with an English toggle.

- **Design system:** [`design.md`](./design.md) — the source of truth for every
  visual and animation decision.
- **Original brief:** [`BUILD_PROMPT.md`](./BUILD_PROMPT.md)

## Stack

| | |
| --- | --- |
| Framework | Next.js 16.3 (App Router, Turbopack, React 19.2) |
| Language | TypeScript |
| Styling | Tailwind CSS v4 |
| Animation | Motion for React (`motion`) |
| i18n | next-intl (`tr` default, `en` behind `/en`) |
| Database / auth | Supabase (Postgres + Auth + RLS) |
| Validation | Zod v4 · react-hook-form |
| Email | Resend |
| Content | MDX files (blog), TypeScript modules (treatments) |

> **Tailwind v4 note:** there is no `tailwind.config.ts`. In v4 the theme is
> declared in CSS, so the design tokens from `design.md` live in the `@theme`
> block at the top of `src/app/globals.css`. That file *is* the Tailwind config.

## Quick start

```bash
npm install
cp .env.example .env.local     # then fill it in — see below
npm run dev
```

The marketing site runs **without any configuration at all**. Every page except
booking and admin is built from local content, so `npm run dev` and `npm run build`
both work on a fresh clone with an empty `.env.local`. Booking shows a "call us
instead" panel until Supabase is connected.

## Running the database locally

The Supabase CLI runs the whole stack — Postgres 17, PostgREST, Auth, Studio —
in Docker on your machine. Use it for development and for testing schema changes
before they touch a real project.

```bash
npm run db:start     # first run pulls several GB of images
npm run db:reset     # apply migrations + seed.sql from scratch
npm run db:test      # assert the booking guarantees still hold
npm run db:status    # print local URLs and keys
npm run db:stop      # shut it down
```

`npm run db:test` runs `supabase/tests/booking_smoke.sql`, which asserts the
things the booking flow actually depends on:

- all six tables exist with RLS enabled
- the no-overlap exclusion constraint and the partial unique index are present
- a booking succeeds, and its slot disappears from availability
- booking the same slot twice is rejected with `slot_unavailable`
- past and out-of-window bookings are rejected
- cancelling releases the slot; cancelling twice is rejected
- **anon cannot read `appointments` and cannot INSERT into it directly**

It runs inside a transaction and rolls back, so it is safe to re-run and leaves
no test rows behind. Run it after any migration change.

> **Why bother with local when you have a hosted project?** Because these
> assertions are destructive by nature — they deliberately double-book, insert
> as `anon`, and reset the database. You do not want to run that against a
> project holding real patient appointments. Verify locally, then push.

Point the app at the local stack by copying the keys from `npm run db:status`
into `.env.local` (`API URL` → `NEXT_PUBLIC_SUPABASE_URL`, `anon key` and
`service_role key` → the matching variables).

### Troubleshooting the CLI

Two things cost real time on this machine; both have workarounds.

**`db push` hangs or times out.** The direct database host
(`db.<ref>.supabase.co`) publishes **only an AAAA record** — it is IPv6-only on
the free tier. On a network without IPv6 egress it is simply unreachable, and
the CLI's own default can pick the wrong pooler. Pass the pooler explicitly:

```bash
npx supabase db push --yes \
  --db-url "postgresql://postgres.<ref>:<password>@aws-0-eu-central-1.pooler.supabase.com:6543/postgres"
```

`aws-1-eu-central-1` returns `tenant/user not found` for this project — the
pooler host is per-project, so if you see that error, try the other prefix.
The pooler is also flaky for the first few minutes after a project is created;
retry rather than assuming the migration is broken.

**`supabase start` fails with `ImagePrepullError`.** The pinned
`supabase/postgres` image sometimes fails to pull from every registry at once
(TLS handshake timeouts). If you already have a near neighbour of that version
locally, satisfy the pin by retagging instead of fighting the network:

```bash
docker images | grep supabase/postgres          # find what you do have
docker tag public.ecr.aws/supabase/postgres:<have> public.ecr.aws/supabase/postgres:<want>
```

`config.toml` also has `analytics`, `realtime`, `storage`, `studio` and
`edge_runtime` disabled. They failed their health checks on Docker Desktop and
took the whole stack down with them, and this app uses none of them. Re-enable
any you need.

## Setting up Supabase

### 1. Create the project

Create a project at [supabase.com](https://supabase.com). From
**Project Settings → API**, copy into `.env.local`:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` — server-only, never prefix with `NEXT_PUBLIC_`

### 2. Run the migrations

Either paste each file into the Supabase **SQL Editor** in order, or use the CLI:

```bash
npx supabase link --project-ref <your-project-ref>
npx supabase db push
```

Order matters:

| File | What it does |
| --- | --- |
| `supabase/migrations/20260810090000_init.sql` | Tables, indexes, the no-overlap exclusion constraint |
| `supabase/migrations/20260810090100_functions.sql` | `create_booking()`, `get_available_slots()`, cancel/reschedule RPCs |
| `supabase/migrations/20260810090200_rls.sql` | Row Level Security policies and grants |

### 3. Seed services and opening hours

```bash
npx supabase db reset      # runs migrations + seed.sql
```

Or paste `supabase/seed.sql` into the SQL Editor. It is idempotent — safe to run
more than once. It inserts the 13 treatments and a Monday–Saturday schedule.

> The seeded hours are a **placeholder**. Replace them with the real clinic hours
> from `/admin/musaitlik` once you are logged in.

### 4. Create the admin user

Bookings are for guests — patients never get an account. Only the doctor signs in.

1. **Authentication → Users → Add user** in the Supabase dashboard. Give it an
   email and password, and tick *Auto Confirm User*.
2. Add that user to the admin allow-list in the SQL Editor:

```sql
insert into public.admins (user_id, email)
select id, email from auth.users where email = 'doktor@ornek.com'
on conflict (user_id) do nothing;
```

Sign in at `/admin/giris`. A signed-in user who is *not* in `public.admins` gets
a clear "no access" screen rather than the dashboard — adding the row above is
the step people forget.

## Setting up email

1. Create an API key at [resend.com/api-keys](https://resend.com/api-keys) →
   `RESEND_API_KEY`.
2. Set `NOTIFY_EMAIL` to the clinic inbox that should receive a copy of every
   booking.
3. Verify your sending domain in Resend, then set `BOOKING_FROM_EMAIL` to an
   address on it, e.g. `"Op. Dr. İsmail Çevik <randevu@example.com>"`.

Without a verified domain Resend's sandbox sender can **only** deliver to the
address that owns the Resend account, which makes testing look broken. Verify the
domain before assuming something is wrong.

If sending fails, the booking is still saved and the patient sees their reference
code on screen. Email is treated as best-effort by design.


## Adding a blog post

Drop a `.mdx` file into `content/blog/tr/` (and optionally `content/blog/en/`):

```mdx
---
title: "Post title"
description: "One-sentence summary, used on cards and in search results."
date: "2026-06-01"
readingMinutes: 4
service: "rinoplasti"          # optional — adds a booking CTA to the post
cover: "/assets/blog/my-post.jpg"
coverAlt: "Description of the image"
---

Body in MDX.
```

The index, the homepage teaser and `generateStaticParams` all pick it up
automatically. A post that exists only in Turkish is still reachable on the
English site — it falls back to the Turkish file rather than 404ing.

## Architecture notes

### Where the booking rules live

Working hours, buffers, minimum notice, slot alignment and collision detection
are all enforced **in Postgres**, in `get_available_slots()`. The booking UI
lists what that function returns, and `create_booking()` validates against the
same function before inserting. The client never computes availability, so the
times shown and the times accepted cannot drift apart.

Double-booking is prevented three ways:

1. A partial unique index on `starts_at` where `status <> 'cancelled'`.
2. A GiST exclusion constraint rejecting any overlap of `[starts_at, ends_at)` —
   this also catches a 10:00/60min booking colliding with a 10:30/30min one.
3. A transaction-scoped advisory lock in `create_booking()`, making the
   check-then-insert sequence atomic.

