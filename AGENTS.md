# SteelMind

Enterprise SaaS platform for steel industry operations. Next.js 15 (App Router, Turbopack) + TypeScript + Tailwind + shadcn/ui. See `README.md` and `docs/` for product/architecture context.

## Cursor Cloud specific instructions

Single Next.js service. Standard commands live in `package.json` (`dev`, `build`, `lint`, `start`, `gestio:*`). Notes below cover only non-obvious caveats for this environment.

- **Run dev:** `npm run dev` serves on `http://localhost:3000`. There is no separate backend — API routes live under `app/api/**` in the same process.
- **Auth works offline.** Supabase and Gestio credentials are optional. With no `NEXT_PUBLIC_SUPABASE_URL`/`GESTIO_*` env vars set, auth falls back to **local JWT mode** backed by `data/steelmind/users.json` (git-ignored, auto-seeded on first login). Seed accounts (local mode only):
  - `admin@inglesametais.com` / `admin123` (admin)
  - `almoxarifado@inglesametais.com` / `almox123`, `compras@inglesametais.com` / `compras123`, `engenharia@inglesametais.com` / `eng123`
  - Unauthenticated requests redirect to `/login` (pages) or return 401 (`/api/*`) via `middleware.ts`.
- **Expected without Gestio creds:** the Warehouse page shows `Catálogo não sincronizado` and `GET /api/v1/warehouse/catalog` returns 404 (surfaces as the Next.js dev "issues" badge). This is normal — the Gestio ERP sync (`npm run gestio:sync`) requires real `GESTIO_EMAIL`/`GESTIO_PASSWORD` and hits an external API. Not needed for local development.
- **Persistence:** local mode persists to `data/steelmind/store.json` and `data/steelmind/users.json` (both git-ignored). Delete them to reset seeded state.
- **No automated test suite** is configured (`package.json` has no `test` script). Validate via `npm run lint` and `npm run build`.
- `next lint` prints a deprecation warning (Next 16) but still runs — safe to ignore.
