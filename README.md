# Modern Mobile To-Do List App

A Next.js to-do app (originally designed in Figma: https://www.figma.com/design/NHyKPfEujvXHIjOVcpdVit/Modern-Mobile-To-Do-List-App).

## Stack

- **Next.js 16** (App Router) — frontend **and** backend. The old Express API now lives in `src/app/api/*` as route handlers.
- **Prisma** — ORM, schema in `prisma/schema.prisma`.
- **Supabase** — the Postgres database that Prisma connects to.
- **Auth** — username/password with bcrypt, JWT session in an httpOnly cookie.

## Setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Configure environment variables:

   ```bash
   cp .env.example .env
   ```

   Fill in:
   - `DATABASE_URL` — Supabase session **pooler** connection string (port 6543), used by the app at runtime.
   - `DIRECT_URL` — Supabase **direct** connection string (port 5432), used by Prisma for schema pushes/migrations.
   - `JWT_SECRET` — a long random string, e.g. `openssl rand -hex 32`.

3. Create the tables in Supabase, generate the Prisma client, and seed the accounts:

   ```bash
   npm run db:push      # syncs prisma/schema.prisma to Supabase
   npm run db:generate  # generates the Prisma client
   npm run db:seed      # creates the two accounts (see below)
   ```

   > Tip: if `db:push` has trouble over the pooler, temporarily use the
   > "Direct connection" string (port 5432) as `DATABASE_URL` for this command.

4. Run the dev server:

   ```bash
   npm run dev
   ```

   Open http://localhost:3000.

## Accounts

There is no sign-up flow — the app uses two pre-made accounts (seeded by `npm run db:seed`):

| Username | Password      |
|----------|---------------|
| `alex`   | `password123` |
| `sam`    | `password123` |

To change them, edit `prisma/seed.ts` and run `npm run db:seed` again.

## Project structure

```
src/
  app/                  # Next.js App Router
    page.tsx            # main app entry (renders <AppShell />)
    layout.tsx          # root layout + global styles
    globals.css         # Tailwind v4 + theme (imports src/styles/globals.css)
    api/                # backend (route handlers, replace the old Express server)
      auth/             # login, logout
      tasks/            # GET/POST /api/tasks
        [id]/           # PATCH/DELETE /api/tasks/:id
          share/        # POST /api/tasks/:id/share, DELETE .../share/:userId
  components/           # React components (unchanged UI)
  lib/                  # prisma client, auth (JWT/cookies), API helpers
  api.ts                # frontend API client (fetch wrapper for /api)
prisma/schema.prisma    # User, Task, TaskShare models
```

## API

Authentication: `POST /api/auth/login` sets an httpOnly session cookie (a `token` is also
returned and accepted as `Authorization: Bearer <token>`). `POST /api/auth/logout` clears it.

- `GET    /api/tasks` — tasks you own plus tasks shared with you
- `POST   /api/tasks` — create a task
- `PATCH  /api/tasks/:id` — edit (owner or write-permission holder)
- `DELETE /api/tasks/:id` — delete (owner only)
- `POST   /api/tasks/:id/share` — share with `{ username, permission: "read" | "write" }`
- `DELETE /api/tasks/:id/share/:userId` — revoke a share

Tasks are private to their owner by default.
