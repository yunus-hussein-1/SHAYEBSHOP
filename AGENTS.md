# AGENTS.md

## Cursor Cloud specific instructions

### What this is
Shayeb Shop ("شايب شوب" / "Storely") is a **static, framework-less** multi-vendor e-commerce web app (plain HTML/CSS/vanilla JS). Pages are `*.html` at the repo root; logic in `js/`, styles in `css/`. There is **no `package.json`, no build step, no linter, and no automated tests**.

### Running the app (dev)
- Serve the repo root over HTTP (do NOT open via `file://`, relative script paths / storage behavior need `http://`):
  - `python3 -m http.server 8080` (Python 3 is preinstalled), then open `http://localhost:8080/index.html`.
- Netlify config (`netlify.toml`) just does `publish = "."` — no build command.

### Backend / data layer (non-obvious)
- The app has **two backends** selected at runtime by `js/database.js` (`dbIsConfigured()`):
  - **Supabase** (Postgres + Auth) — used **only** if `supabaseUrl` + `supabaseAnonKey` are filled in `js/db-config.js` (schema: `database/supabase-schema.sql`).
  - **`localStorage` fallback** — used automatically when those keys are empty (the default committed state). This means signup/login, stores, cart, and orders all persist in the **browser**, so the full app works end-to-end with **no backend or DB** running.
- `@supabase/supabase-js@2` loads from the jsDelivr CDN via a `<script>` tag; internet access lets it load, but localStorage-mode flows still work regardless.

### Lint / test / build
- None configured. Verify changes by serving the site and exercising flows manually in the browser (register/login, browse, add to cart, checkout via Sham Cash, create a store, admin panel at `admin.html`).
