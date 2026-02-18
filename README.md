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
