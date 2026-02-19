# Chronos Watch Blog

Chronos is a Next.js App Router project with:

- Public watch blog and review pages
- Admin panel for content operations
- Prisma + PostgreSQL data layer
- JWT cookie-based auth

## Local Setup

1. Install dependencies:

```bash
npm install
```

2. Create `.env.local` from `env.local.template`.

3. Run database migration and seed:

```bash
npx prisma migrate dev
npx prisma db seed
```

`prisma/seed.ts` requires:

- `ADMIN_EMAIL`
- `ADMIN_PASSWORD`

4. Start development server:

```bash
npm run dev
```

Open `http://localhost:3000`. Admin login is `http://localhost:3000/admin/login`.

## Security and Access

- `middleware.ts` protects `/admin/*` routes and redirects unauthenticated users.
- Admin APIs use role-aware checks via `requireAuth([...roles])`.
- `/api/seed` requires authenticated `ADMIN` and is disabled in production.

## SEO

- Dynamic sitemap: `app/sitemap.ts`
- Robots rules: `app/robots.ts`
- `next-sitemap` runs on `postbuild`
- Canonical + OpenGraph metadata on key pages
- JSON-LD structured data on article and review detail pages

## Mail Delivery

- Admin panel mail settings are managed at `Admin > Settings > Mail`.
- API keys are encrypted before storing in DB (`siteSettings.socials.mail`).
- Supported providers: `Resend API` and `Gmail SMTP (App Password)`.
- Transactional emails (admin 2FA, moderation notifications) use DB settings first.
- Fallback environment variables are supported:
  - `RESEND_API_KEY`
  - `NOTIFICATION_FROM_EMAIL`
  - `NOTIFICATION_REPLY_TO`
  - `GMAIL_SMTP_USER`
  - `GMAIL_SMTP_PASS`

## Newsletter

- Public newsletter form posts to `/api/subscribe`.
- Subscribers are stored locally and deduplicated by email.
- When a post/review transitions to `PUBLISHED`, a newsletter email is automatically sent to subscribers.
- Scheduler-triggered publications also trigger newsletter delivery.

## Ads (Google AdSense)

- Set AdSense variables in `.env`:
  - `NEXT_PUBLIC_ADSENSE_ENABLED=true`
  - `NEXT_PUBLIC_ADSENSE_CLIENT_ID=ca-pub-...`
  - Optional (for explicit `ads.txt` publisher id): `ADSENSE_PUBLISHER_ID=pub-...`
  - Slot ids:
    - `NEXT_PUBLIC_ADSENSE_SLOT_HOME_TOP`
    - `NEXT_PUBLIC_ADSENSE_SLOT_BLOG_LIST_INLINE`
    - `NEXT_PUBLIC_ADSENSE_SLOT_BLOG_POST_INLINE`
    - `NEXT_PUBLIC_ADSENSE_SLOT_REVIEWS_LIST_INLINE`
    - `NEXT_PUBLIC_ADSENSE_SLOT_REVIEW_DETAIL_INLINE`
- AdSense script is loaded on public pages (not admin/account/submit).
- Ads are rendered in dedicated slot components with responsive format.
- `ads.txt` is served at `/ads.txt` automatically from env.

## Auth Recovery

- Member password reset:
  - Request link: `/account/forgot-password`
  - Reset page: `/account/reset-password?token=...`
- Admin password reset:
  - Request link: `/admin/login/forgot-password`
  - Reset page: `/admin/login/reset-password?token=...`
- Admin 2FA recovery codes:
  - Manage from `Admin > Security` (`My 2FA Recovery Codes` panel)
  - Login page supports using a recovery code instead of email verification.

## Scheduler Cron

- Cron endpoint: `GET /api/cron/scheduler`
- Protected by `CRON_SECRET` in production (`Authorization: Bearer <CRON_SECRET>`).
- `vercel.json` includes a 5-minute cron schedule for Vercel.
